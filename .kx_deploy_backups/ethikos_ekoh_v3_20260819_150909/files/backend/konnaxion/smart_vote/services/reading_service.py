"""Declared Smart Vote readings over canonical Ethikos topic stances."""

from __future__ import annotations

import hashlib
import json
from decimal import Decimal
from typing import Any

from django.utils import timezone

from konnaxion.ekoh.db import ekoh_smartvote_db_scope

from konnaxion.ekoh.models.scores import UserEthicsScore, UserExpertiseScore
from konnaxion.ethikos.models import EthikosStance
from konnaxion.smart_vote.models import (
    ConsultationRelevance,
    SourceConsultationBinding,
)
from konnaxion.smart_vote.services.weight_calculator import (
    get_expertise_alignment,
    get_weight,
)

READING_KEY = "ekoh_weighted_v1"
SOURCE_TYPE_ETHIKOS_TOPIC = "ethikos_topic"


def _decimal(value: Any) -> Decimal:
    return Decimal(str(value))


def _normalise_score(value: Decimal) -> Decimal:
    value = max(Decimal("0"), _decimal(value))
    if value > 1:
        value = value / Decimal("100")
    return min(Decimal("1"), value)


def _hash_payload(payload: Any) -> str:
    canonical = json.dumps(
        payload,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
        default=str,
    ).encode("utf-8")
    return "sha256:" + hashlib.sha256(canonical).hexdigest()


def build_ethikos_topic_reading(topic_id: int) -> dict[str, Any] | None:
    """Compute a declared reading inside the EkoH/Smart Vote DB schema scope."""
    with ekoh_smartvote_db_scope():
        return _build_ethikos_topic_reading(topic_id)


def _build_ethikos_topic_reading(topic_id: int) -> dict[str, Any] | None:
    """Compute baseline + one declared EkoH advisory reading for a topic.

    No source stance is mutated. The reading is computed from the currently
    bound relevance vector and the current EkoH snapshot, both of which are
    represented in the returned hashes/payload.
    """
    binding = (
        SourceConsultationBinding.objects.select_related("consultation")
        .filter(source_type=SOURCE_TYPE_ETHIKOS_TOPIC, source_id=str(topic_id))
        .first()
    )
    if binding is None:
        return None

    consultation = binding.consultation
    relevance_rows = list(
        ConsultationRelevance.objects.select_related("category")
        .filter(consultation=consultation)
        .order_by("category__code")
    )
    stances = list(
        EthikosStance.objects.select_related("user")
        .filter(topic_id=topic_id)
        .order_by("user_id")
    )

    relevance_payload = [
        {
            "domain_code": row.category.code,
            "domain_name": row.category.name,
            "weight": float(row.weight),
            "criteria": row.criteria_json,
        }
        for row in relevance_rows
    ]
    lens_payload = {
        "reading_key": READING_KEY,
        "formula": "1 + min(dot(topic_relevance, expertise), cap) * ethics",
        "source_type": SOURCE_TYPE_ETHIKOS_TOPIC,
        "source_id": str(topic_id),
        "domains": relevance_payload,
    }
    lens_hash = _hash_payload(lens_payload)

    values = [_decimal(stance.value) for stance in stances]
    baseline_score = (
        sum(values, Decimal("0")) / Decimal(len(values)) if values else Decimal("0")
    )

    relevant_category_ids = [row.category_id for row in relevance_rows]
    expertise_rows = UserExpertiseScore.objects.filter(
        user_id__in=[stance.user_id for stance in stances],
        category_id__in=relevant_category_ids,
    ).values_list("user_id", "category_id", "weighted_score")
    expertise_by_user: dict[int, dict[int, Decimal]] = {}
    for user_id, category_id, score in expertise_rows:
        expertise_by_user.setdefault(user_id, {})[category_id] = _normalise_score(
            _decimal(score)
        )

    ethics_rows = UserEthicsScore.objects.filter(
        user_id__in=[stance.user_id for stance in stances]
    ).values_list("user_id", "ethical_score")
    ethics_by_user = {user_id: _decimal(score) for user_id, score in ethics_rows}

    snapshot_payload = []
    weighted_sum = Decimal("0")
    total_weight = Decimal("0")
    alignment_sum = Decimal("0")

    for stance in stances:
        alignment = get_expertise_alignment(stance.user_id, consultation.pk)
        reading_weight = get_weight(stance.user_id, consultation.pk)
        stance_value = _decimal(stance.value)

        weighted_sum += stance_value * reading_weight
        total_weight += reading_weight
        alignment_sum += alignment

        domain_scores = expertise_by_user.get(stance.user_id, {})
        snapshot_payload.append(
            {
                "user_id": stance.user_id,
                "ethics": str(ethics_by_user.get(stance.user_id, Decimal("1.0"))),
                "expertise": {
                    str(category_id): str(domain_scores.get(category_id, Decimal("0")))
                    for category_id in relevant_category_ids
                },
            }
        )

    reading_score = (
        weighted_sum / total_weight if total_weight > 0 else baseline_score
    )
    average_alignment = (
        alignment_sum / Decimal(len(stances)) if stances else Decimal("0")
    )

    snapshot_ref = "ekoh_snapshot:" + _hash_payload(snapshot_payload).split(":", 1)[1]
    computed_at = timezone.now().isoformat()

    return {
        "target_type": SOURCE_TYPE_ETHIKOS_TOPIC,
        "target_id": str(topic_id),
        "smart_vote_consultation_id": str(consultation.pk),
        "baseline": {
            "reading_key": "baseline",
            "lens_hash": None,
            "snapshot_ref": None,
            "computed_at": computed_at,
            "results_payload": {
                "score": float(baseline_score),
                "participant_count": len(stances),
            },
        },
        "readings": [
            {
                "reading_key": READING_KEY,
                "lens_hash": lens_hash,
                "snapshot_ref": snapshot_ref,
                "computed_at": computed_at,
                "results_payload": {
                    "score": float(reading_score),
                    "participant_count": len(stances),
                    "total_advisory_weight": float(total_weight),
                    "average_expertise_alignment": float(average_alignment),
                    "domains": relevance_payload,
                },
            }
        ],
    }
