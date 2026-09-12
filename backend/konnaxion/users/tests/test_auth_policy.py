from __future__ import annotations

import pytest
from allauth.account.adapter import DefaultAccountAdapter
from django.urls import Resolver404, resolve

from konnaxion.users.adapters import AccountAdapter
from konnaxion.users.models import User
from konnaxion.users.tests.factories import UserFactory

pytestmark = pytest.mark.django_db


def test_human_account_can_interactive_login():
    user = UserFactory(account_type=User.TYPE_HUMAN, is_klone=False, is_active=True)
    assert user.can_interactive_login is True


def test_service_account_cannot_interactive_login():
    user = UserFactory(account_type=User.TYPE_SERVICE, is_klone=False, is_active=True)
    assert user.can_interactive_login is False


def test_klone_cannot_interactive_login():
    user = UserFactory(account_type=User.TYPE_HUMAN, is_klone=True, is_active=True)
    assert user.can_interactive_login is False


def test_account_adapter_rejects_noninteractive_account(monkeypatch):
    user = UserFactory(account_type=User.TYPE_SERVICE)

    monkeypatch.setattr(
        DefaultAccountAdapter,
        "authenticate",
        lambda self, request, **credentials: user,
    )

    assert AccountAdapter().authenticate(None, username=user.username, password="x") is None


def test_drf_password_token_endpoint_is_not_exposed():
    with pytest.raises(Resolver404):
        resolve("/api/auth-token/")
