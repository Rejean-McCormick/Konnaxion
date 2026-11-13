#!/usr/bin/env python3
"""Validate the canonical sibling Konnaxion_Worlds distribution identity."""
from __future__ import annotations
import argparse
import hashlib
import json
import os
from pathlib import Path
import tomllib
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "WORLD_ENGINE.lock.json"
DEVELOPMENT_MARKER = ROOT / "backend" / ".venv" / "worlds-development.flag"
DISTRIBUTION = "konnaxion-worlds"


def fail(message: str) -> None:
    print(f"Konnaxion_Worlds dependency: FAIL: {message}", file=sys.stderr)
    raise SystemExit(1)


def tree_digest(backend: Path) -> tuple[str, int]:
    package = backend / "konnaxion" / "worlds"
    files = [backend / "pyproject.toml"]
    files.extend(
        p for p in package.rglob("*")
        if p.is_file() and "__pycache__" not in p.parts and p.suffix != ".pyc"
    )
    h = hashlib.sha256()
    for path in sorted(files, key=lambda p: p.relative_to(backend).as_posix()):
        rel = path.relative_to(backend).as_posix().encode("utf-8")
        h.update(rel)
        h.update(b"\0")
        h.update(hashlib.sha256(path.read_bytes()).digest())
        h.update(b"\n")
    return h.hexdigest(), len(files)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("worlds_repo", type=Path, help="Path to sibling Konnaxion_Worlds repository")
    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--development", action="store_true",
                      help="Check the local package metadata and defer release pin verification")
    mode.add_argument("--qualification", action="store_true",
                      help="Require the pinned version and SHA-256 even with a local development marker")
    args = parser.parse_args()
    in_ci = any(os.environ.get(name, "").strip().lower() in {"true", "1"}
                for name in ("CI", "GITHUB_ACTIONS"))
    development = not (args.qualification or in_ci) and (
        args.development or DEVELOPMENT_MARKER.is_file()
    )

    backend = args.worlds_repo.resolve() / "backend"
    pyproject = backend / "pyproject.toml"
    if not pyproject.is_file():
        fail(f"missing {pyproject}")
    if not (backend / "konnaxion" / "worlds" / "apps.py").is_file():
        fail("candidate does not contain canonical konnaxion.worlds package")
    try:
        meta = tomllib.loads(pyproject.read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        fail(f"cannot read package metadata: {exc}")
    project = meta.get("project") or {}
    if not isinstance(project, dict):
        fail("project metadata must be a TOML table")

    if development:
        if project.get("name") != DISTRIBUTION:
            fail(f"distribution must be {DISTRIBUTION!r}")
        version = project.get("version")
        if not isinstance(version, str) or not version.strip():
            fail("candidate does not declare a package version")
        print(f"Konnaxion_Worlds dependency: DEVELOPMENT ({version})")
        print("  Pinned version and SHA-256 verification deferred to qualification.")
        return 0

    lock = json.loads(LOCK.read_text(encoding="utf-8-sig"))
    if project.get("name") != lock["distribution"]:
        fail(f"distribution must be {lock['distribution']!r}")
    if project.get("version") != lock["version"]:
        fail(f"version {project.get('version')!r} does not match pinned {lock['version']!r}")
    digest, count = tree_digest(backend)
    if digest != lock["tree_sha256"]:
        fail(f"tree digest sha256:{digest} does not match pinned sha256:{lock['tree_sha256']}")
    print("Konnaxion_Worlds dependency: PASS")
    print(f"  version: {lock['version']}")
    print(f"  digest: sha256:{digest}")
    print(f"  files: {count}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
