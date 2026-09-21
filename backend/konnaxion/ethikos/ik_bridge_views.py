from __future__ import annotations

import hashlib
import hmac
import json

from django.conf import settings
from django.db import IntegrityError, transaction
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from konnaxion.integrations.interaction_kernel.contracts import (
    IKContractError, error_receipt, impact_publish_to_publication, success_receipt,
)
from konnaxion.integrations.interaction_kernel.fingerprint import request_fingerprint
from .models import OrgoImpactPublication


def _authorized(request: HttpRequest) -> bool:
    expected = str(getattr(settings, "IK_ORGO_INBOUND_TOKEN", "") or "").strip()
    if not expected:
        return False
    value = request.headers.get("Authorization", "")
    supplied = value[7:] if value.startswith("Bearer ") else ""
    return bool(supplied) and hmac.compare_digest(supplied, expected)

def _json(request: HttpRequest):
    try:
        return json.loads(request.body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise IKContractError("IK_INVALID_ENVELOPE", "request body must be valid JSON") from exc

@csrf_exempt
@require_POST
def ik_interaction_ingress(request: HttpRequest) -> JsonResponse:
    envelope = None
    if not _authorized(request):
        return JsonResponse(error_receipt(None, status="rejected", code="IK_UNAUTHORIZED", retryable=False, detail="invalid service token"), status=401)
    try:
        envelope = _json(request)
        if not isinstance(envelope, dict):
            raise IKContractError("IK_INVALID_ENVELOPE", "request body must be an object")
        mapped = impact_publish_to_publication(envelope)
        fingerprint = request_fingerprint(envelope)
        key = mapped["idempotency_key"]
        header_key = request.headers.get("Idempotency-Key")
        if header_key and header_key != key:
            raise IKContractError("IK_IDEMPOTENCY_CONFLICT", "header and envelope idempotency keys differ")
        with transaction.atomic():
            existing = OrgoImpactPublication.objects.select_for_update().filter(idempotency_key=key).first()
            if existing:
                stored = str((existing.receipt_json or {}).get("request_fingerprint") or "")
                if stored and stored != fingerprint:
                    return JsonResponse(error_receipt(envelope, status="rejected", code="IK_IDEMPOTENCY_CONFLICT", retryable=False, detail="same key with divergent semantic content"), status=409)
                return JsonResponse(success_receipt(envelope, external_reference=existing.external_reference, data={"impact_publication_id": existing.pk, "replayed": True}), status=200)
            payload_hash = hashlib.sha256(json.dumps(envelope, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()).hexdigest()
            receipt_data = {"request_fingerprint": fingerprint}
            item = OrgoImpactPublication.objects.create(
                operation_id=mapped["operation_id"], organization_id=mapped["organization_id"], idempotency_key=key,
                correlation_id=mapped["correlation_id"], subject_type=mapped["subject_type"], subject_id=mapped["subject_id"],
                artifact_type=mapped["artifact_type"], external_reference=mapped["external_reference"], checkpoint=mapped["checkpoint"],
                demo_id=mapped["demo_id"], epistemic_status=mapped["epistemic_status"], payload_hash=payload_hash,
                request_json=mapped["request_json"], receipt_json=receipt_data,
            )
        return JsonResponse(success_receipt(envelope, external_reference=item.external_reference, data={"impact_publication_id": item.pk, "replayed": False}), status=200)
    except IKContractError as exc:
        status = 409 if exc.code == "IK_IDEMPOTENCY_CONFLICT" else 400
        return JsonResponse(error_receipt(envelope if isinstance(envelope, dict) else None, status="rejected", code=exc.code, retryable=False, detail=exc.detail), status=status)
    except IntegrityError:
        return JsonResponse(error_receipt(envelope if isinstance(envelope, dict) else None, status="rejected", code="IK_IDEMPOTENCY_CONFLICT", retryable=False, detail="conflicting impact identity"), status=409)
