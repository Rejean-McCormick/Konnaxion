#!/usr/bin/env python3
"""Validate the canonical sibling Konnaxion_Worlds distribution identity."""
from __future__ import annotations
import argparse
import hashlib
import json
from pathlib import Path
import tomllib
import sys

ROOT = Path(__file__).resolve().parents[1]
LOCK = ROOT / "WORLD_ENGINE.lock.json"


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
    args = parser.parse_args()
    lock = json.loads(LOCK.read_text(encoding="utf-8"))
    backend = args.worlds_repo.resolve() / "backend"
    pyproject = backend / "pyproject.toml"
    if not pyproject.is_file():
        fail(f"missing {pyproject}")
    if not (backend / "konnaxion" / "worlds" / "apps.py").is_file():
        fail("candidate does not contain canonical konnaxion.worlds package")
    meta = tomllib.loads(pyproject.read_text(encoding="utf-8"))
    project = meta.get("project") or {}
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
