from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Mapping
from uuid import NAMESPACE_URL, uuid4, uuid5

IK_SPEC_VERSION = "ik/1.1"
GOVERNANCE_DECISION_EXECUTE = ("governance.decision.execute", "1.0.0")
ACCOUNTABILITY_IMPACT_PUBLISH = ("accountability.impact.publish", "1.0.0")


class IKContractError(ValueError):
    def __init__(self, code: str, detail: str) -> None:
        super().__init__(detail)
        self.code = code
        self.detail = detail


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def _participant(system: str, *, organization: str | None = None, world: str | None = None, release: str | int | None = None) -> dict[str, str]:
    value = {"system": system}
    if organization:
        value["organization"] = str(organization)
    if world:
        value["world"] = str(world)
    if release not in (None, ""):
        value["release"] = str(release)
    return value


def build_decision_execute_envelope(
    *,
    decision_id: str,
    revision: str,
    artifact_digest: str,
    target_organization: str,
    source_world: str | None = None,
    source_release: str | int | None = None,
    target_world: str | None = None,
    effective_at: str | None = None,
    execution_scope: Mapping[str, Any] | None = None,
    interaction_id: str | None = None,
) -> dict[str, Any]:
    """Build the canonical Konnaxion -> Orgo governed-work command.

    World/release metadata is optional. Konnaxion owns the decision regardless
    of whether a deployment also uses the standalone Konnaxion_Worlds router.
    """
    if not target_organization:
        raise IKContractError("IK_TARGET_NOT_CONFIGURED", "target organization is required")
    if len(artifact_digest) != 64 or any(c not in "0123456789abcdef" for c in artifact_digest):
        raise IKContractError("IK_INVALID_ARTIFACT", "artifact digest must be lowercase sha256 hex")

    subject_id = str(decision_id)
    target_world_value = target_world or source_world
    route_identity = target_world_value or "default"
    identity = f"decision:{subject_id}:r{revision}:orgo:{target_organization}:{route_identity}:execute:v1"
    data: dict[str, Any] = {"decision_revision": str(revision), "effective_at": effective_at}
    if execution_scope is not None:
        data["execution_scope"] = dict(execution_scope)

    source = _participant("konnaxion", world=source_world, release=source_release)
    target = _participant("orgo", organization=target_organization, world=target_world_value)
    return {
        "specversion": IK_SPEC_VERSION,
        "id": interaction_id or str(uuid4()),
        "class": "command",
        "time": _utc_now(),
        "profile": {"id": GOVERNANCE_DECISION_EXECUTE[0], "version": GOVERNANCE_DECISION_EXECUTE[1]},
        "source": source,
        "target": target,
        "subject": {"type": "decision", "id": subject_id},
        "correlation_id": f"decision:{subject_id}",
        "idempotency_key": identity,
        "authority": {"kind": "governance-mandate", "claims": [f"authority://konnaxion/decision/{subject_id}"]},
        "data": data,
        "artifact_refs": [{
            "owner": source,
            "artifact_type": "konnaxion.decision_record",
            "artifact_id": f"konnaxion:decision_record:{subject_id}",
            "version": str(revision),
            "integrity": {"algorithm": "sha256", "digest": artifact_digest},
        }],
        "response": {"acceptance_receipt": True, "final_receipt": True},
    }


def validate_impact_publish_envelope(envelope: Mapping[str, Any]) -> None:
    if envelope.get("specversion") != IK_SPEC_VERSION:
        raise IKContractError("IK_UNSUPPORTED_PROTOCOL", "expected ik/1.1")
    if envelope.get("class") != "command":
        raise IKContractError("IK_INVALID_ENVELOPE", "impact publish must be a command")
    if envelope.get("profile") != {"id": ACCOUNTABILITY_IMPACT_PUBLISH[0], "version": ACCOUNTABILITY_IMPACT_PUBLISH[1]}:
        raise IKContractError("IK_UNKNOWN_PROFILE", "unsupported Konnaxion inbound profile")
    source = envelope.get("source")
    target = envelope.get("target")
    subject = envelope.get("subject")
    data = envelope.get("data")
    if not isinstance(source, Mapping) or source.get("system") != "orgo":
        raise IKContractError("IK_UNAUTHORIZED", "profile requires source.system=orgo")
    if not isinstance(target, Mapping) or target.get("system") != "konnaxion":
        raise IKContractError("IK_TARGET_NOT_FOUND", "profile requires target.system=konnaxion")
    if not isinstance(subject, Mapping) or not subject.get("type") or not subject.get("id"):
        raise IKContractError("IK_INVALID_ENVELOPE", "subject.type and subject.id are required")
    if not isinstance(data, Mapping):
        raise IKContractError("IK_SCHEMA_VALIDATION_FAILED", "data must be an object")
    if data.get("artifact_type") != "impact_update":
        raise IKContractError("IK_SCHEMA_VALIDATION_FAILED", "data.artifact_type must be impact_update")
    if not envelope.get("idempotency_key"):
        raise IKContractError("IK_INVALID_ENVELOPE", "idempotency_key is required")
    if not source.get("organization"):
        raise IKContractError("IK_INVALID_ENVELOPE", "source.organization is required")


def impact_publish_to_publication(envelope: Mapping[str, Any]) -> dict[str, Any]:
    validate_impact_publish_envelope(envelope)
    source = envelope["source"]
    subject = envelope["subject"]
    data = dict(envelope.get("data") or {})
    external_reference = str(data.get("external_reference") or f"impact:{subject['type']}:{subject['id']}:{envelope['id']}")
    return {
        "operation_id": str(uuid5(NAMESPACE_URL, f"interaction-kernel:{envelope['id']}")),
        "organization_id": str(source["organization"]),
        "idempotency_key": str(envelope["idempotency_key"]),
        "correlation_id": str(envelope.get("correlation_id") or envelope["id"]),
        "subject_type": str(subject["type"]),
        "subject_id": str(subject["id"]),
        "artifact_type": "impact_update",
        "external_reference": external_reference,
        "checkpoint": str(data.get("checkpoint") or ""),
        "demo_id": str(data.get("demo_id") or ""),
        "epistemic_status": str(data.get("epistemic_status") or ""),
        "request_json": dict(envelope),
    }


def success_receipt(envelope: Mapping[str, Any], *, external_reference: str | None, data: Mapping[str, Any] | None = None) -> dict[str, Any]:
    return {
        "specversion": IK_SPEC_VERSION, "record_type": "receipt", "id": str(uuid4()), "time": _utc_now(),
        "interaction_id": str(envelope.get("id") or "unknown"), "source": {"system": "konnaxion"},
        "target": dict(envelope.get("source") or {"system": "orgo"}), "status": "succeeded", "code": None,
        "retryable": False, "external_reference": external_reference, "data": dict(data or {}),
        "correlation_id": envelope.get("correlation_id"),
    }


def error_receipt(envelope: Mapping[str, Any] | None, *, status: str, code: str, retryable: bool, detail: str) -> dict[str, Any]:
    source = dict((envelope or {}).get("source") or {"system": "unknown"})
    return {
        "specversion": IK_SPEC_VERSION, "record_type": "receipt", "id": str(uuid4()), "time": _utc_now(),
        "interaction_id": str((envelope or {}).get("id") or "unknown"), "source": {"system": "konnaxion"},
        "target": source, "status": status, "code": code, "retryable": retryable, "external_reference": None,
        "data": {"detail": detail}, "correlation_id": (envelope or {}).get("correlation_id"),
    }
