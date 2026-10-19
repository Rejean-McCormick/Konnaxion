from __future__ import annotations

import json
from uuid import uuid4

from django.test import Client, TestCase, override_settings

from konnaxion.ethikos.models import OrgoImpactPublication
from konnaxion.integrations.interaction_kernel.organization_scope import matches_expected_organization


class OrganizationScopeTests(TestCase):
    def test_organization_scope_match_and_malformed(self):
        expected = str(uuid4())
        assert matches_expected_organization(expected, expected.upper())
        assert not matches_expected_organization(expected, str(uuid4()))
        assert not matches_expected_organization(expected, "not-an-org")
        assert not matches_expected_organization("not-an-org", expected)
        assert matches_expected_organization("", "legacy-unscoped")

    @override_settings(IK_ORGO_INBOUND_TOKEN="only-test-token")
    def test_foreign_org_is_rejected_before_storage(self):
        allowed = str(uuid4())
        foreign = str(uuid4())
        envelope = {
            "specversion": "ik/1.1", "id": str(uuid4()), "class": "command",
            "profile": {"id": "accountability.impact.publish", "version": "1.0.0"},
            "source": {"system": "orgo", "organization": foreign},
            "target": {"system": "konnaxion"},
            "subject": {"type": "case", "id": "case:foreign"},
            "idempotency_key": "impact:foreign", "data": {
                "artifact_type": "impact_update", "external_reference": "impact:foreign",
                "summary": {"kind": "test"},
            },
        }
        with override_settings(IK_ORGO_ALLOWED_ORGANIZATION=allowed):
            response = Client().post(
                "/api/integrations/ik/konnaxion/interactions/",
                data=json.dumps(envelope), content_type="application/json",
                HTTP_AUTHORIZATION="Bearer only-test-token",
            )
        assert response.status_code == 403
        assert response.json()["code"] == "IK_UNAUTHORIZED"
        assert OrgoImpactPublication.objects.count() == 0
