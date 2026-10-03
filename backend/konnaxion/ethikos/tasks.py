from __future__ import annotations

from datetime import timedelta

from celery import shared_task
from django.conf import settings
from django.db import transaction
from django.utils import timezone

from konnaxion.integrations.interaction_kernel.contracts import receipt_phase
from konnaxion.integrations.interaction_kernel.transport import deliver_to_orgo
from konnaxion.worlds.services.tasks import PinnedWorldTask
from .models import InteractionEmission


def _retry_seconds(attempts: int) -> int:
    base = max(1, int(getattr(settings, "IK_DELIVERY_RETRY_BASE_SECONDS", 5) or 5))
    maximum = max(base, int(getattr(settings, "IK_DELIVERY_RETRY_MAX_SECONDS", 15 * 60) or 15 * 60))
    return min(maximum, base * (2 ** max(0, attempts - 1)))


@shared_task(
    bind=True,
    base=PinnedWorldTask,
    name="konnaxion.ethikos.deliver_interaction_emission",
    max_retries=None,
    acks_late=True,
    reject_on_worker_lost=True,
)
def deliver_interaction_emission_task(
    self,
    emission_id: int,
    *,
    world_id: int,
    release_id: int,
):
    del world_id, release_id  # scope is established by PinnedWorldTask
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
            phase = receipt_phase(delivery.receipt)
            remote_status = str(delivery.receipt.get("status") or "").strip().lower()
            emission.delivered_at = timezone.now()
            emission.next_attempt_at = None
            emission.receipt_json = delivery.receipt
            emission.last_retryable = False
            if phase == "acceptance":
                emission.status = InteractionEmission.STATUS_ACCEPTED
                emission.acceptance_receipt_json = delivery.receipt
                emission.last_error_code = ""
                emission.last_error_detail = ""
            elif phase == "final":
                emission.final_receipt_json = delivery.receipt
                if remote_status == "succeeded":
                    emission.status = InteractionEmission.STATUS_SUCCEEDED
                    emission.last_error_code = ""
                    emission.last_error_detail = ""
                else:
                    emission.status = InteractionEmission.STATUS_FAILED
                    emission.last_error_code = str(delivery.receipt.get("code") or "")[:120]
                    detail = delivery.receipt.get("data") or {}
                    emission.last_error_detail = str(
                        detail.get("detail") if isinstance(detail, dict) else ""
                    )
                    if isinstance(delivery.receipt.get("retryable"), bool):
                        emission.last_retryable = bool(delivery.receipt["retryable"])
            else:
                # HTTP delivery succeeded, but no canonical acceptance/final lifecycle
                # state is present. Do not promote transport success to business success.
                emission.status = InteractionEmission.STATUS_DELIVERED
                emission.last_error_code = ""
                emission.last_error_detail = ""
            emission.save(update_fields=[
                "status", "delivered_at", "last_error_code", "last_error_detail",
                "last_retryable", "next_attempt_at", "receipt_json",
                "acceptance_receipt_json", "final_receipt_json", "updated_at",
            ])
            return {"emission_id": emission.id, "status": emission.status}
        terminal = (not delivery.retryable) or attempts >= max_attempts
        emission.last_error_code = delivery.code[:120]
        emission.last_error_detail = delivery.detail
        emission.last_retryable = delivery.retryable
        emission.receipt_json = delivery.receipt
        if terminal:
            emission.status = InteractionEmission.STATUS_DEAD
            emission.next_attempt_at = None
            emission.save(update_fields=["status", "last_error_code", "last_error_detail", "last_retryable", "receipt_json", "next_attempt_at", "updated_at"])
            return {"emission_id": emission.id, "status": emission.status, "error": delivery.code}
        retry_countdown = _retry_seconds(attempts)
        emission.status = InteractionEmission.STATUS_RETRYING
        emission.next_attempt_at = timezone.now() + timedelta(seconds=retry_countdown)
        emission.save(update_fields=["status", "last_error_code", "last_error_detail", "last_retryable", "receipt_json", "next_attempt_at", "updated_at"])
    raise self.retry(countdown=retry_countdown)
