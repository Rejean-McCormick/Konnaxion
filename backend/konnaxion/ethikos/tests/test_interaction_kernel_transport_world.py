"""Orgo's authenticated World context must agree with the IK envelope target."""
from __future__ import annotations

import unittest
from konnaxion.integrations.interaction_kernel.transport import _outbound_headers

class OrgoWorldRoutingTests(unittest.TestCase):
    def test_fakeplant_world_is_transmitted(self):
        envelope = {'target': {'system': 'orgo', 'world': 'fp-administration'},
                    'idempotency_key': 'k1', 'specversion': 'ik/1.1'}
        headers = _outbound_headers(envelope, 'test-only')
        self.assertEqual(headers['X-Orgo-World-Key'], 'fp-administration')
        self.assertEqual(headers['Idempotency-Key'], 'k1')

    def test_unspecified_world_uses_orgo_default(self):
        self.assertNotIn('X-Orgo-World-Key', _outbound_headers({'target': {'system':'orgo'}}, 'test-only'))

    def test_invalid_world_is_rejected_before_http(self):
        for world in ('FP-Administration', '../main', 'main\r\nX-Attack: 1', 'foo_bar', 'a'*65):
            with self.subTest(world=world), self.assertRaises(ValueError):
                _outbound_headers({'target':{'world':world}}, 'test-only')

    def test_non_object_target_rejected(self):
        with self.assertRaises(ValueError):
            _outbound_headers({'target':'fakeplant'}, 'test-only')
