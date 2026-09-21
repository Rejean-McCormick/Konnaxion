from __future__ import annotations

from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from konnaxion.integrations.interaction_kernel.transport import deliver_to_orgo
from .models import InteractionEmission


def _retry_seconds(attempts: int) -> int:
    base = max(1, int(getattr(settings, "IK_DELIVERY_RETRY_BASE_SECONDS", 5) or 5))
    maximum = max(base, int(getattr(settings, "IK_DELIVERY_RETRY_MAX_SECONDS", 15 * 60) or 15 * 60))
    return min(maximum, base * (2 ** max(0, attempts - 1)))


@shared_task(bind=True, name="konnaxion.ethikos.deliver_interaction_emission", max_retries=None, acks_late=True, reject_on_worker_lost=True)
def deliver_interaction_emission_task(self, emission_id: int):
    max_attempts = max(1, int(getattr(settings, "IK_DELIVERY_MAX_ATTEMPTS", 8) or 8))
    retry_countdown: int | None = None
    with transaction.atomic():
        try:
            emission = InteractionEmission.objects.select_for_update().get(pk=emission_id)
        except InteractionEmission.DoesNotExist:
            return {"emission_id": emission_id, "status": "missing"}
        if emission.status in InteractionEmission.TERMINAL_STATUSES:
            return {"emission_id": emission.id, "status": emission.status}
        emission.attempts += 1
        emission.status = InteractionEmission.STATUS_SENDING
        emission.next_attempt_at = None
        emission.save(update_fields=["attempts", "status", "next_attempt_at", "updated_at"])
        envelope = dict(emission.envelope_json)
        attempts = emission.attempts

    delivery = deliver_to_orgo(envelope)
    with transaction.atomic():
        emission = InteractionEmission.objects.select_for_update().get(pk=emission_id)
        if delivery.ok:
            emission.status = InteractionEmission.STATUS_DELIVERED
            emission.delivered_at = timezone.now()
            emission.last_error_code = ""
            emission.last_error_detail = ""
            emission.next_attempt_at = None
            emission.receipt_json = delivery.receipt
            emission.save(update_fields=["status", "delivered_at", "last_error_code", "last_error_detail", "next_attempt_at", "receipt_json", "updated_at"])
            return {"emission_id": emission.id, "status": emission.status}
        terminal = (not delivery.retryable) or attempts >= max_attempts
        emission.last_error_code = delivery.code[:120]
        emission.last_error_detail = delivery.detail
        emission.receipt_json = delivery.receipt
        if terminal:
            emission.status = InteractionEmission.STATUS_DEAD
            emission.next_attempt_at = None
            emission.save(update_fields=["status", "last_error_code", "last_error_detail", "receipt_json", "next_attempt_at", "updated_at"])
            return {"emission_id": emission.id, "status": emission.status, "error": delivery.code}
        retry_countdown = _retry_seconds(attempts)
        emission.status = InteractionEmission.STATUS_RETRYING
        emission.next_attempt_at = timezone.now() + timedelta(seconds=retry_countdown)
        emission.save(update_fields=["status", "last_error_code", "last_error_detail", "receipt_json", "next_attempt_at", "updated_at"])
    raise self.retry(countdown=retry_countdown)
