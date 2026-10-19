from __future__ import annotations

from types import SimpleNamespace

import pytest
from django.test import override_settings

from konnaxion.users.adapters import AccountAdapter, SocialAccountAdapter


@pytest.mark.parametrize("enabled", [False, True])
@override_settings(ACCOUNT_ALLOW_REGISTRATION=True, COMMON_OIDC_ALLOW_AUTO_SIGNUP=False)
def test_federated_signup_requires_explicit_opt_in(enabled):
    with override_settings(COMMON_OIDC_ENABLED=enabled):
        assert SocialAccountAdapter().is_open_for_signup(None, SimpleNamespace()) is (not enabled)
        # Local registration remains a separate application decision.
        assert AccountAdapter().is_open_for_signup(None) is True


@override_settings(COMMON_OIDC_ENABLED=True, COMMON_OIDC_ALLOW_AUTO_SIGNUP=True)
def test_federated_opt_in_still_respects_application_signup_policy():
    with override_settings(ACCOUNT_ALLOW_REGISTRATION=False):
        assert SocialAccountAdapter().is_open_for_signup(None, SimpleNamespace()) is False
    with override_settings(ACCOUNT_ALLOW_REGISTRATION=True):
        assert SocialAccountAdapter().is_open_for_signup(None, SimpleNamespace()) is True


@override_settings(COMMON_OIDC_ENABLED=True, COMMON_OIDC_ALLOW_AUTO_SIGNUP=False)
def test_unknown_user_does_not_get_created_even_if_local_signup_open():
    with override_settings(ACCOUNT_ALLOW_REGISTRATION=True):
        assert SocialAccountAdapter().is_open_for_signup(None, SimpleNamespace()) is False
