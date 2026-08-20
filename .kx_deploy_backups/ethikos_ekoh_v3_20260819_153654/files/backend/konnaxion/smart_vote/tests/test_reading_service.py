from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model

from konnaxion.ekoh.db import ekoh_smartvote_db_scope
from konnaxion.ekoh.models.scores import UserEthicsScore, UserExpertiseScore
from konnaxion.ekoh.models.taxonomy import ExpertiseCategory
from konnaxion.ethikos.models import EthikosCategory, EthikosStance, EthikosTopic
from konnaxion.smart_vote.models import (
    Consultation,
    ConsultationRelevance,
    SourceConsultationBinding,
)
from konnaxion.smart_vote.services.reading_service import build_ethikos_topic_reading

pytestmark = pytest.mark.django_db
User = get_user_model()


def test_ethikos_topic_reading_keeps_baseline_and_adds_expertise_lens():
    expert = User.objects.create_user(username="expert")
    citizen = User.objects.create_user(username="citizen")
    category = EthikosCategory.objects.create(name="Economy", description="")
    topic = EthikosTopic.objects.create(
        title="[DEMO] Fiscal question",
        description="Demo",
        category=category,
        created_by=expert,
        status="open",
    )
    EthikosStance.objects.create(topic=topic, user=expert, value=3)
    EthikosStance.objects.create(topic=topic, user=citizen, value=-3)

    with ekoh_smartvote_db_scope():
        domain = ExpertiseCategory.objects.create(
            code="0311",
            name="Economics",
            depth=0,
            path="0311",
        )
        UserExpertiseScore.objects.create(
            user=expert,
            category=domain,
            raw_score=Decimal("1.0"),
            weighted_score=Decimal("1.0"),
        )
        UserEthicsScore.objects.create(user=expert, ethical_score=Decimal("1.0"))
        UserEthicsScore.objects.create(user=citizen, ethical_score=Decimal("1.0"))

        consultation = Consultation.objects.create(title=topic.title)
        SourceConsultationBinding.objects.create(
            source_type="ethikos_topic",
            source_id=str(topic.pk),
            source_key="fiscal_question",
            consultation=consultation,
        )
        ConsultationRelevance.objects.create(
            consultation=consultation,
            category=domain,
            weight=Decimal("1.0"),
        )

    payload = build_ethikos_topic_reading(topic.pk)
    assert payload is not None
    assert payload["baseline"]["results_payload"]["score"] == pytest.approx(0.0)

    reading = payload["readings"][0]
    assert reading["reading_key"] == "ekoh_weighted_v1"
    assert reading["results_payload"]["score"] > 0
    assert reading["lens_hash"].startswith("sha256:")
    assert reading["snapshot_ref"].startswith("ekoh_snapshot:")
