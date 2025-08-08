"""
Contextual-analysis stub.

Called by Celery task `contextual_analysis_batch` (future work)
to scan new publications, answers, or comments and adjust the
user’s domain scores.

For now it simply records a log entry so we can test the end-to-end flow.
"""

from __future__ import annotations

import logging
import uuid
from typing import Mapping, Any

from django.db import transaction

from konnaxion.ekoh.models.audit import ContextAnalysisLog
from konnaxion.ekoh.models.scores import UserExpertiseScore

LOGGER = logging.getLogger(__name__)


def analyse_entity(
    *,
    user_id: int,
    entity_type: str,
    entity_id: uuid.UUID,
    domain_code: str,
    input_metadata: Mapping[str, Any] | None = None,
) -> None:
    """
    Fake analysis:

    • +0.5 raw_score boost on the matching domain
    • Writes ContextAnalysisLog for explainability
    """
    with transaction.atomic():
        # upgrade or create a minimal score row
        score, _ = UserExpertiseScore.objects.get_or_create(
            user_id=user_id,
            category__code=domain_code,
            defaults={"raw_score": 0, "weighted_score": 0},
        )
        old = score.raw_score
        score.raw_score += 0.5
        score.save(update_fields=["raw_score"])

        ContextAnalysisLog.objects.create(
            entity_type=entity_type,
            entity_id=entity_id,
            field="raw_score",
            input_metadata=input_metadata or {},
            adjustments_applied={"+raw_score": 0.5},
        )

    LOGGER.debug(
        "Context analysis: user=%s %s %s %+0.5 raw (%.2f→%.2f)",
        user_id,
        entity_type,
        entity_id,
        old,
        score.raw_score,
    )
