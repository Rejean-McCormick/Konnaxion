#!/usr/bin/env python3
"""Validate Konnaxion's pinned Kristal v7 boundary and optional Standard checkout."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCK_PATH = ROOT / "backend" / "konnaxion" / "integrations" / "interaction_kernel" / "interaction-kernel.lock.json"
DOC = ROOT / "docs" / "Technical-Reference" / "KRISTAL_V7_INTEGRATION.md"


def fail(message: str) -> None:
    print(f"Konnaxion Kristal v7 alignment: FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--kristal-standard", type=Path, default=None)
    args = parser.parse_args()
    lock = json.loads(LOCK_PATH.read_text(encoding="utf-8"))
    if lock.get("specversion") != "ik/1.1":
        fail("IK specversion must remain ik/1.1")
    if lock.get("reference_implementation") != "2.0.0-dev.1":
        fail("IK reference implementation must be 2.0.0-dev.1")
    profiles = lock.get("profiles") or {}
    for name in ("kristal.build.request", "kristal.revision.request", "kristal.artifact.ready"):
        if profiles.get(name) != "2.0.0":
            fail(f"{name} must be pinned to 2.0.0")
    kristal = lock.get("kristal") or {}
    if kristal.get("version") != "7.0.0-draft.3.1":
        fail("Kristal Standard must be 7.0.0-draft.3.1")
    portable = kristal.get("portable_state") or {}
    if portable.get("version") != "6.0.0" or portable.get("wire_schema_unchanged") is not True:
        fail("v6 6.0.0 portable state must remain unchanged")
    if kristal.get("canonicalization_profile") != "kristal.v6:jcs-rfc8785":
        fail("portable v6 canonicalization profile must remain kristal.v6:jcs-rfc8785")
    guards = kristal.get("epistemic_guards") or {}
    for key in ("resonance_is_authority", "mesh_path_is_assertion", "external_kos_id_replaces_kq", "factorization_may_drop_source_provenance"):
        if guards.get(key) is not False:
            fail(f"epistemic guard {key} must be false")
    doc = DOC.read_text(encoding="utf-8")
    for needle in ("7.0.0-draft.3.1", "extensions.kristal_v7", "semantic resonance", "Universe + World + exact Release"):
        if needle not in doc:
            fail(f"Kristal v7 integration doc missing {needle!r}")

    if args.kristal_standard is not None:
        std = args.kristal_standard.resolve()
        version = (std / "VERSION").read_text(encoding="utf-8").strip()
        if version != kristal["version"]:
            fail(f"supplied Standard VERSION is {version!r}")
        manifest = std / "manifest.sha256.json"
        expected_manifest = kristal["standard_manifest_sha256"].removeprefix("sha256:")
        if sha(manifest) != expected_manifest:
            fail("supplied Standard manifest digest does not match lock")
        schemas = std / "docs" / "Technical-Reference" / "kristal-docs-v7" / "02-schemas"
        for name, expected in (kristal.get("v7_schema_digests") or {}).items():
            path = schemas / name
            if not path.is_file():
                fail(f"missing v7 schema {name}")
            if sha(path) != expected.removeprefix("sha256:"):
                fail(f"v7 schema digest mismatch: {name}")
    print("Konnaxion Kristal v7 alignment: PASS")
    print("  Kristal Standard: 7.0.0-draft.3.1")
    print("  portable state: v6 6.0.0 unchanged")
    print("  IK Kristal profiles: build/revision/artifact-ready 2.0.0")
    if args.kristal_standard is None:
        print("  Standard checkout digest verification: SKIP (no --kristal-standard path)")
    else:
        print("  Standard manifest/schema digest verification: PASS")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
