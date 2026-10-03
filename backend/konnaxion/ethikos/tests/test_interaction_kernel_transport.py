from __future__ import annotations

import unittest

from konnaxion.integrations.interaction_kernel.transport import _error_semantics


class InteractionKernelTransportSemanticsTests(unittest.TestCase):
    def test_http_statuses_map_to_canonical_ik_codes(self):
        self.assertEqual(_error_semantics(401, {})[:2], (False, "IK_UNAUTHENTICATED"))
        self.assertEqual(_error_semantics(403, {})[:2], (False, "IK_UNAUTHORIZED"))
        self.assertEqual(_error_semantics(429, {})[:2], (True, "IK_RATE_LIMITED"))
        self.assertEqual(_error_semantics(503, {})[:2], (True, "IK_PROVIDER_UNAVAILABLE"))

    def test_remote_ik_error_preserves_code_and_retryable(self):
        retryable, code, detail, receipt = _error_semantics(
            409,
            {
                "ok": False,
                "data": {
                    "status": "failed",
                    "code": "IK_IDEMPOTENCY_CONFLICT",
                    "retryable": False,
                    "data": {"detail": "semantic fingerprint mismatch"},
                },
            },
        )
        self.assertFalse(retryable)
        self.assertEqual(code, "IK_IDEMPOTENCY_CONFLICT")
        self.assertEqual(detail, "semantic fingerprint mismatch")
        self.assertEqual(receipt["status"], "failed")
