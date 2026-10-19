import ast
import importlib.util
import pathlib
import sys
import types
import unittest
from unittest.mock import patch

ROOT = pathlib.Path(__file__).resolve().parents[3]


def load_module(module_name, path):
    spec = importlib.util.spec_from_file_location(module_name, path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = module
    spec.loader.exec_module(module)
    return module


class KonnaxionTandemGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        modules = {name: types.ModuleType(name) for name in (
            "allauth", "allauth.account", "allauth.account.adapter",
            "allauth.socialaccount", "allauth.socialaccount.adapter",
            "django", "django.conf", "django.core", "django.core.exceptions",
        )}
        class DefaultAccountAdapter:
            def authenticate(self, request, **credentials):
                return credentials.get("test_user")
        class DefaultSocialAccountAdapter:
            def pre_social_login(self, request, sociallogin):
                return None
            def populate_user(self, request, sociallogin, data):
                return sociallogin.user
        class PermissionDenied(Exception):
            pass
        modules["allauth.account.adapter"].DefaultAccountAdapter = DefaultAccountAdapter
        modules["allauth.socialaccount.adapter"].DefaultSocialAccountAdapter = DefaultSocialAccountAdapter
        modules["django.core.exceptions"].PermissionDenied = PermissionDenied
        cls.settings = types.SimpleNamespace(
            ACCOUNT_ALLOW_REGISTRATION=True, COMMON_OIDC_ENABLED=True,
            COMMON_OIDC_ALLOW_AUTO_SIGNUP=False,
        )
        modules["django.conf"].settings = cls.settings
        cls.modules = modules
        cls.patcher = patch.dict(sys.modules, modules)
        cls.patcher.start()
        cls.adapters = load_module("tandem_adapters_under_test", ROOT/"backend/konnaxion/users/adapters.py")
        cls.scope = load_module("tandem_scope_under_test", ROOT/"backend/konnaxion/integrations/interaction_kernel/organization_scope.py")
        cls.denied = PermissionDenied
    @classmethod
    def tearDownClass(cls):
        sys.modules.pop("tandem_adapters_under_test", None)
        sys.modules.pop("tandem_scope_under_test", None)
        cls.patcher.stop()

    def setUp(self):
        self.settings.ACCOUNT_ALLOW_REGISTRATION = True
        self.settings.COMMON_OIDC_ENABLED = True
        self.settings.COMMON_OIDC_ALLOW_AUTO_SIGNUP = False

    def test_federated_signup_closed_but_local_registration_open(self):
        self.assertFalse(self.adapters.SocialAccountAdapter().is_open_for_signup(None, None))
        self.assertTrue(self.adapters.AccountAdapter().is_open_for_signup(None))

    def test_federated_signup_optin_still_needs_app_signup(self):
        self.settings.COMMON_OIDC_ALLOW_AUTO_SIGNUP = True
        self.assertTrue(self.adapters.SocialAccountAdapter().is_open_for_signup(None, None))
        self.settings.ACCOUNT_ALLOW_REGISTRATION = False
        self.assertFalse(self.adapters.SocialAccountAdapter().is_open_for_signup(None, None))
        self.assertFalse(self.adapters.AccountAdapter().is_open_for_signup(None))

    def test_local_mode_not_affected(self):
        self.settings.COMMON_OIDC_ENABLED = False
        self.assertTrue(self.adapters.SocialAccountAdapter().is_open_for_signup(None, None))

    def test_missing_allow_flag_is_deny_by_default(self):
        del self.settings.COMMON_OIDC_ALLOW_AUTO_SIGNUP
        try:
            self.assertFalse(self.adapters.SocialAccountAdapter().is_open_for_signup(None, None))
        finally:
            self.settings.COMMON_OIDC_ALLOW_AUTO_SIGNUP = False

    def test_existing_klone_social_login_denied(self):
        login = types.SimpleNamespace(user=types.SimpleNamespace(pk=12, can_interactive_login=False))
        with self.assertRaises(self.denied):
            self.adapters.SocialAccountAdapter().pre_social_login(None, login)

    def test_linked_human_allowed(self):
        login = types.SimpleNamespace(user=types.SimpleNamespace(pk=3, can_interactive_login=True))
        self.adapters.SocialAccountAdapter().pre_social_login(None, login)

    def test_local_service_account_denied(self):
        u = types.SimpleNamespace(can_interactive_login=False)
        self.assertIsNone(self.adapters.AccountAdapter().authenticate(None, test_user=u))

    def test_org_scope_matches_uuid_case_insensitive(self):
        org = "0c2d7244-a0c0-4a10-8f11-0389f275f133"
        self.assertTrue(self.scope.matches_expected_organization(org, org.upper()))
        self.assertFalse(self.scope.matches_expected_organization(org, "ec244f0c-0327-4fea-b30e-a00f94bdddda"))

    def test_org_scope_invalid_format_fail_closed(self):
        org = "0c2d7244-a0c0-4a10-8f11-0389f275f133"
        self.assertFalse(self.scope.matches_expected_organization(org, "fakeplant"))
        self.assertFalse(self.scope.matches_expected_organization("fakeplant", org))
        self.assertFalse(self.scope.matches_expected_organization(org, None))

    def test_unscoped_backward_compat_is_explicit(self):
        self.assertTrue(self.scope.matches_expected_organization("", "unknown"))

    def test_ik_guard_runs_before_database_write(self):
        path = ROOT/"backend/konnaxion/ethikos/ik_bridge_views.py"
        tree = ast.parse(path.read_text(encoding="utf-8"))
        fun = next(x for x in tree.body if isinstance(x, ast.FunctionDef) and x.name == "ik_interaction_ingress")
        code = path.read_text(encoding="utf-8")
        self.assertLess(code.find("matches_expected_organization(expected_org"), code.find("transaction.atomic()"))
        self.assertIn('"IK_UNAUTHORIZED" else 400', code)
        self.assertIn('"IK_UNAUTHORIZED",', code)

    def test_runtime_policies_remain_local(self):
        s = (ROOT/"backend/config/settings/base.py").read_text(encoding="utf-8")
        self.assertIn('COMMON_OIDC_ALLOW_AUTO_SIGNUP = env.bool("COMMON_OIDC_ALLOW_AUTO_SIGNUP", default=False)', s)
        self.assertIn('SOCIALACCOUNT_EMAIL_AUTHENTICATION_AUTO_CONNECT = False', s)
        self.assertIn('SOCIALACCOUNT_EMAIL_AUTHENTICATION = False', s)
        self.assertIn('SOCIALACCOUNT_STORE_TOKENS = False', s)
        self.assertIn('IK_ORGO_ALLOWED_ORGANIZATION = env(', s)
        self.assertIn('"konnaxion.users.adapters.SocialAccountAdapter"', s)
        self.assertNotIn("backend/konnaxion/worlds/", '\n'.join(p.as_posix() for p in ROOT.glob('backend/konnaxion/worlds/**/*')))

    def test_backend_env_example_defaults_disabled(self):
        s=(ROOT/"backend/env.example").read_text(encoding="utf-8")
        self.assertIn('COMMON_OIDC_ENABLED=false', s)
        self.assertIn('COMMON_OIDC_ALLOW_AUTO_SIGNUP=false', s)
        self.assertIn('IK_ORGO_ALLOWED_ORGANIZATION=', s)


if __name__ == "__main__":
    unittest.main(verbosity=2)
