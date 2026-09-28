# FILE: backend/tests/test_smoke_platform.py
# KX-UNIVERSES-1 platform smoke: global surfaces remain global, while
# World-owned APIs must fail closed unless addressed through /u/.../w/....
import pytest
from django.urls import reverse

from konnaxion.users.models import User
from konnaxion.users.tasks import get_users_count


def _assert_world_required(response) -> None:
    assert response.status_code == 400
    payload = response.json()
    assert payload.get("error") == "WORLD_REQUIRED"


@pytest.mark.django_db
def test_platform_smoke(client, admin_client, settings):
    # Global control/documentation surfaces remain unscoped.
    assert client.get(reverse("api-docs")).status_code == 403
    assert admin_client.get(reverse("api-docs")).status_code == 200

    response = admin_client.get(reverse("api:user-me"))
    assert response.status_code == 200
    me = response.json()
    assert "username" in me and me["username"]

    # World-owned product APIs intentionally reject legacy unscoped access.
    # Scoped Universe/World runtime behavior is covered by Konnaxion_Worlds.
    _assert_world_required(admin_client.get(reverse("api:ethikos-topic-list")))
    _assert_world_required(admin_client.get(reverse("api:teambuilder-session-list")))

    # Global async task surface still works eagerly in the smoke suite.
    settings.CELERY_TASK_ALWAYS_EAGER = True
    result = get_users_count.delay()
    assert result.result == User.objects.count()
