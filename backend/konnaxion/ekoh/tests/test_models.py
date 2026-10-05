import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, transaction

from konnaxion.ekoh.models.scores import UserExpertiseScore

User = get_user_model()


@pytest.mark.django_db
def test_expertise_category_str(isced_profile):
    education = isced_profile["01"]
    assert education.name == "Education"
    assert education.depth == 0
    assert education.path == "01"
    assert str(education) == "01 • Education"


@pytest.mark.django_db
def test_user_expertise_unique(isced_profile):
    user = User.objects.create(username="alice")
    domain = isced_profile["01"]

    UserExpertiseScore.objects.create(
        user=user,
        category=domain,
        raw_score=10,
        weighted_score=5,
    )

    with pytest.raises(IntegrityError), transaction.atomic():
        UserExpertiseScore.objects.create(
            user=user,
            category=domain,
            raw_score=1,
            weighted_score=1,
        )
