from __future__ import annotations

import json
from unittest.mock import patch
from uuid import uuid4

from django.test import Client, TestCase, override_settings
from django.utils import timezone

from konnaxion.ethikos.models import DecisionRecord, InteractionEmission, OrgoImpactPublication
from konnaxion.worlds.runtime import (
    WorldRuntime,
    reset_world_runtime,
    set_world_runtime,
)
from konnaxion.integrations.interaction_kernel.services import (
    IKIdempotencyConflict,
    enqueue_decision_execution,
    publish_decision_record,
)


class DecisionInteractionRuntimeTests(TestCase):
    @override_settings(
        IK_KONNAXION_WORLD="",
        IK_KONNAXION_RELEASE="",
    )
    @patch("konnaxion.ethikos.tasks.deliver_interaction_emission_task.delay")
    def test_publish_execute_replay_and_conflict(self, delay):
        decision = DecisionRecord.objects.create(
            title="IK qualification decision",
            description="Runtime qualification fixture",
            status=DecisionRecord.STATUS_CLOSED,
            closed_at=timezone.now(),
            baseline_result_json={"result": "approved"},
        )
        runtime = WorldRuntime(
            world_id=7,
            world_key="ik-test",
            release_id=12,
            release_number=3,
            domain_schema="kx_w_ik_test_r3",
            ekoh_schema="kx_e_ik_test_r3",
        )
        token = set_world_runtime(runtime)
        try:
            published = publish_decision_record(decision_id=decision.pk)
            self.assertEqual(published.status, DecisionRecord.STATUS_PUBLISHED)
            self.assertEqual(len(published.artifact_digest), 64)
            self.assertEqual(published.published_payload["decision"]["id"], str(decision.pk))

            target = str(uuid4())
            with self.captureOnCommitCallbacks(execute=True):
                first = enqueue_decision_execution(
                    decision_id=decision.pk,
                    target_organization=target,
                    execution_scope={"qualification": True},
                )
            delay.assert_called_once_with(first.pk, world_id=7, release_id=12)
            self.assertEqual(first.status, InteractionEmission.STATUS_QUEUED)

            replay = enqueue_decision_execution(
                decision_id=decision.pk,
                target_organization=target,
                execution_scope={"qualification": True},
            )
            self.assertEqual(replay.pk, first.pk)
            self.assertEqual(InteractionEmission.objects.count(), 1)

            with self.assertRaises(IKIdempotencyConflict):
                enqueue_decision_execution(
                    decision_id=decision.pk,
                    target_organization=target,
                    execution_scope={"qualification": False},
                )
        finally:
            reset_world_runtime(token)


class ImpactIngressRuntimeTests(TestCase):
    @override_settings(IK_ORGO_INBOUND_TOKEN="orgo-impact-test-token")
    def test_impact_ingress_replay_and_conflict(self):
        operation_id = str(uuid4())
        org_id = str(uuid4())
        subject_id = str(uuid4())
        key = f"impact:{operation_id}"
        envelope = {
            "specversion": "ik/1.1",
            "id": operation_id,
            "class": "command",
            "time": timezone.now().isoformat().replace("+00:00", "Z"),
            "profile": {"id": "accountability.impact.publish", "version": "1.0.0"},
            "source": {"system": "orgo", "organization": org_id},
            "target": {"system": "konnaxion"},
            "subject": {"type": "case", "id": subject_id},
            "correlation_id": f"case:{subject_id}",
            "idempotency_key": key,
            "authority": {"kind": "operational-accountability"},
            "data": {
                "artifact_type": "impact_update",
                "checkpoint": "decision_accepted",
                "epistemic_status": "operational_effect_recorded",
            },
            "artifact_refs": [],
            "response": {"acceptance_receipt": True, "final_receipt": True},
        }
        client = Client()
        headers = {
            "HTTP_AUTHORIZATION": "Bearer orgo-impact-test-token",
            "HTTP_IDEMPOTENCY_KEY": key,
        }
        url = "/api/integrations/ik/konnaxion/interactions/"
        first = client.post(url, data=json.dumps(envelope), content_type="application/json", **headers)
        self.assertEqual(first.status_code, 200, first.content)
        self.assertEqual(OrgoImpactPublication.objects.count(), 1)

        replay = client.post(url, data=json.dumps(envelope), content_type="application/json", **headers)
        self.assertEqual(replay.status_code, 200, replay.content)
        self.assertTrue(replay.json()["data"]["replayed"])
        self.assertEqual(OrgoImpactPublication.objects.count(), 1)

        divergent = json.loads(json.dumps(envelope))
        divergent["data"]["checkpoint"] = "different"
        conflict = client.post(url, data=json.dumps(divergent), content_type="application/json", **headers)
        self.assertEqual(conflict.status_code, 409, conflict.content)
        self.assertEqual(conflict.json()["code"], "IK_IDEMPOTENCY_CONFLICT")
        self.assertEqual(OrgoImpactPublication.objects.count(), 1)
