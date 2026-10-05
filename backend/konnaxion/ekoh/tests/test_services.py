from decimal import Decimal

import pytest
from django.contrib.auth import get_user_model

from konnaxion.ekoh.services.multidimensional_scoring import compute_user_domain_score

User = get_user_model()


@pytest.mark.django_db
def test_compute_user_domain_score_zero_metrics(isced_profile):
    """Zero evidence produces a zero normalized expertise score."""
    user = User.objects.create(username="bob")
    domain = isced_profile["02"]

    score = compute_user_domain_score(
        user_id=user.pk,
        domain=domain,
        metrics={"quality": 0, "expertise": 0, "frequency": 0},
    )

    assert score == Decimal("0.0000")
    user_score = domain.userexpertisescore_set.get(user=user)
    assert user_score.weighted_score == Decimal("0.0000")
