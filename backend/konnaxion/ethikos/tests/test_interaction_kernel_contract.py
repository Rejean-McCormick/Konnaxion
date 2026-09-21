from __future__ import annotations

import unittest
from konnaxion.integrations.interaction_kernel.contracts import build_decision_execute_envelope
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
