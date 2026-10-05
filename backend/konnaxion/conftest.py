# FILE: backend/konnaxion/conftest.py
import pytest
from django.core.management import call_command

from konnaxion.ekoh.db import ekoh_smartvote_db_scope
from konnaxion.ekoh.models.taxonomy import ExpertiseCategory
from konnaxion.users.models import User
from konnaxion.users.tests.factories import UserFactory


@pytest.fixture(autouse=True)
def _media_storage(settings, tmpdir) -> None:
    settings.MEDIA_ROOT = tmpdir.strpath


@pytest.fixture
def user(db) -> User:
    return UserFactory()

@pytest.fixture
def isced_profile(db) -> dict[str, ExpertiseCategory]:
    """Load the canonical UNESCO ISCED-F profile inside the EkoH DB schema.

    Tests must consume canonical taxonomy rows instead of manufacturing
    ad-hoc expertise categories that do not exist in the product profile.
    """
    with ekoh_smartvote_db_scope():
        call_command("load_isced", verbosity=0)
        categories = {
            category.code: category
            for category in ExpertiseCategory.objects.order_by("code")
        }
        assert len(categories) == 113
        yield categories

