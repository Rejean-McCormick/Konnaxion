from __future__ import annotations

import unittest
from konnaxion.integrations.interaction_kernel.contracts import (
    IKContractError,
    build_decision_execute_envelope,
    impact_publish_to_publication,
    receipt_phase,
)
from konnaxion.integrations.interaction_kernel.fingerprint import request_fingerprint


class InteractionKernelContractTests(unittest.TestCase):
    def test_decision_execute_does_not_require_worlds_package(self):
        envelope = build_decision_execute_envelope(
            decision_id="5201", revision="1", artifact_digest="a" * 64,
            target_organization="60f51ca2-c845-45aa-bc7e-2c62e53dfc5a",
        )
        self.assertEqual(envelope["profile"], {"id": "governance.decision.execute", "version": "1.0.0"})
        self.assertEqual(envelope["source"], {"system": "konnaxion"})
        self.assertEqual(envelope["artifact_refs"][0]["artifact_type"], "konnaxion.decision_record")

    def test_transient_id_and_time_do_not_change_request_fingerprint(self):
        first = build_decision_execute_envelope(decision_id="1", revision="1", artifact_digest="b" * 64, target_organization="60f51ca2-c845-45aa-bc7e-2c62e53dfc5a")
        second = dict(first)
        second["id"] = "another-interaction-id"
        second["time"] = "2026-09-21T12:00:00Z"
        self.assertEqual(request_fingerprint(first), request_fingerprint(second))

    def test_impact_publish_requires_canonical_required_fields_and_string_subject(self):
        base = {
            "specversion": "ik/1.1",
            "id": "interaction-1",
            "class": "command",
            "profile": {"id": "accountability.impact.publish", "version": "1.0.0"},
            "source": {"system": "orgo", "organization": "org-1"},
            "target": {"system": "konnaxion"},
            "subject": {"type": "case", "id": "external-case:42"},
            "idempotency_key": "impact:1",
            "data": {
                "artifact_type": "impact_update",
                "external_reference": "orgo:impact:1",
                "summary": {"status": "recorded"},
            },
        }
        mapped = impact_publish_to_publication(base)
        self.assertEqual(mapped["subject_id"], "external-case:42")
        self.assertEqual(mapped["external_reference"], "orgo:impact:1")

        for missing in ("external_reference", "summary"):
            invalid = {**base, "data": dict(base["data"])}
            invalid["data"].pop(missing)
            with self.assertRaises(IKContractError) as ctx:
                impact_publish_to_publication(invalid)
            self.assertEqual(ctx.exception.code, "IK_SCHEMA_VALIDATION_FAILED")

        invalid_subject = {**base, "subject": {"type": "case", "id": 42}}
        with self.assertRaises(IKContractError) as ctx:
            impact_publish_to_publication(invalid_subject)
        self.assertEqual(ctx.exception.code, "IK_SCHEMA_VALIDATION_FAILED")

    def test_receipt_phase_keeps_transport_acceptance_and_final_state_distinct(self):
        self.assertEqual(receipt_phase({"status": "accepted"}), "acceptance")
        self.assertEqual(receipt_phase({"status": "succeeded"}), "final")
        self.assertEqual(receipt_phase({"status": "failed"}), "final")
        self.assertEqual(receipt_phase({}), "transport_only")
        self.assertEqual(receipt_phase(None), "transport_only")
