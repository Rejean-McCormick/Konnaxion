from __future__ import annotations

import json
import re
import socket
from dataclasses import dataclass
from typing import Any, Mapping
from urllib.error import HTTPError, URLError
from urllib.parse import urlsplit
from urllib.request import Request, urlopen

from django.conf import settings


@dataclass(frozen=True)
class DeliveryResult:
    ok: bool
    retryable: bool
    code: str
    detail: str
    receipt: dict[str, Any]


def _decode_json(raw: bytes) -> dict[str, Any]:
    if not raw:
        return {}
    try:
        value = json.loads(raw.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return {}
    return value if isinstance(value, dict) else {}


def _receipt_payload(payload: Mapping[str, Any]) -> dict[str, Any]:
    data = payload.get("data")
    if isinstance(data, dict) and (payload.get("ok") is True or payload.get("ok") is False):
        return data
    return dict(payload)


def _error_semantics(status: int, payload: Mapping[str, Any]) -> tuple[bool, str, str, dict[str, Any]]:
    """Preserve canonical remote IK receipt semantics before HTTP fallback mapping."""
    receipt = _receipt_payload(payload)
    remote_code = receipt.get("code")
    remote_retryable = receipt.get("retryable")
    if isinstance(remote_code, str) and remote_code.startswith("IK_"):
        retryable = (
            bool(remote_retryable)
            if isinstance(remote_retryable, bool)
            else status == 429 or status >= 500
        )
        remote_data = receipt.get("data")
        data_detail = remote_data.get("detail") if isinstance(remote_data, Mapping) else None
        detail = str(data_detail or receipt.get("detail") or "remote IK error")
        return retryable, remote_code, detail, receipt
    if status == 401:
        return False, "IK_UNAUTHENTICATED", "remote endpoint rejected authentication", receipt
    if status == 403:
        return False, "IK_UNAUTHORIZED", "remote endpoint rejected authorization", receipt
    if status == 404:
        return False, "IK_TARGET_NOT_FOUND", "remote IK target was not found", receipt
    if status == 429:
        return True, "IK_RATE_LIMITED", "remote IK endpoint rate limited the request", receipt
    if status >= 500:
        return True, "IK_PROVIDER_UNAVAILABLE", f"remote IK endpoint returned HTTP {status}", receipt
    return False, f"HTTP_{status}", "unexpected response", receipt


def _validated_target_url(value: str) -> str:
    url = str(value or "").strip()
    if not url:
        return ""
    parsed = urlsplit(url)
    hostname = (parsed.hostname or "").lower().rstrip(".")
    if parsed.username or parsed.password or not hostname:
        return ""
    if parsed.scheme == "https":
        return url
    # Local developer binding only. Production must never send the bearer token
    # over cleartext HTTP.
    if getattr(settings, "DEBUG", False) and parsed.scheme == "http" and hostname in {"localhost", "127.0.0.1", "::1"}:
        return url
    return ""


_ORGO_WORLD_KEY_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$")


def _outbound_headers(envelope: Mapping[str, Any], token: str) -> dict[str, str]:
    """Bind the Orgo authenticated World context to the IK target World.

    Orgo's HTTP boundary otherwise selects "main" by default and rejects a
    FakePlant envelope whose target.world is e.g. fp-administration.
    """
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Idempotency-Key": str(envelope.get("idempotency_key") or ""),
        "X-Correlation-ID": str(envelope.get("correlation_id") or envelope.get("id") or ""),
        "X-Interaction-Kernel-Version": str(envelope.get("specversion") or ""),
    }
    target = envelope.get("target")
    if target is not None and not isinstance(target, Mapping):
        raise ValueError("IK target must be an object")
    world = target.get("world") if isinstance(target, Mapping) else None
    if world is not None and world != "":
        if not isinstance(world, str) or not _ORGO_WORLD_KEY_RE.fullmatch(world):
            raise ValueError("IK target World key does not satisfy Orgo World routing syntax")
        headers["X-Orgo-World-Key"] = world
    return headers


def deliver_to_orgo(envelope: Mapping[str, Any]) -> DeliveryResult:
    """Deliver one IK envelope using the configured Orgo HTTP binding."""

    configured_url = str(getattr(settings, "IK_ORGO_INTERACTIONS_URL", "") or "").strip()
    url = _validated_target_url(configured_url)
    token = str(getattr(settings, "IK_ORGO_TOKEN", "") or "").strip()
    timeout = float(getattr(settings, "IK_HTTP_TIMEOUT_SECONDS", 10.0) or 10.0)
    if not configured_url:
        return DeliveryResult(False, False, "IK_TARGET_NOT_CONFIGURED", "IK_ORGO_INTERACTIONS_URL is empty", {})
    if not url:
        return DeliveryResult(False, False, "IK_TARGET_INVALID", "IK_ORGO_INTERACTIONS_URL must be HTTPS (HTTP is allowed only for localhost in DEBUG)", {})
    if not token:
        return DeliveryResult(False, False, "IK_TARGET_NOT_CONFIGURED", "IK_ORGO_TOKEN is empty", {})

    try:
        headers = _outbound_headers(envelope, token)
    except ValueError as exc:
        return DeliveryResult(False, False, "IK_TARGET_INVALID", str(exc), {})
    body = json.dumps(envelope, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    request = Request(
        url,
        data=body,
        method="POST",
        headers=headers,
    )

    try:
        with urlopen(request, timeout=timeout) as response:  # noqa: S310 - deployment allowlists the URL.
            payload = _decode_json(response.read())
            status = int(getattr(response, "status", 200) or 200)
            if 200 <= status < 300:
                receipt = _receipt_payload(payload)
                return DeliveryResult(True, False, "", "", receipt)
            retryable, code, detail, receipt = _error_semantics(status, payload)
            return DeliveryResult(False, retryable, code, detail, receipt)
    except HTTPError as exc:
        payload = _decode_json(exc.read())
        retryable, code, detail, receipt = _error_semantics(exc.code, payload)
        if not payload and exc.reason:
            detail = str(exc.reason)
        return DeliveryResult(False, retryable, code, detail, receipt)
    except (URLError, TimeoutError, socket.timeout) as exc:
        return DeliveryResult(False, True, "IK_PROVIDER_UNAVAILABLE", str(exc), {})
