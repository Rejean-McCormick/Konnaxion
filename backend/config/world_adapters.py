"""Konnaxion host adapters for the external Konnaxion_Worlds engine.

This module is intentionally the product-side dependency inversion point.  The
engine owns Universe/World/Release mechanics; Konnaxion owns ethiKos/EkoH domain
imports and fixtures.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from django.db import transaction


def import_world_scenario(payload, *, imported_by=None, dry_run=False):
    from konnaxion.ethikos.demo_import.importer import import_ethikos_demo_scenario

    return import_ethikos_demo_scenario(
        payload,
        imported_by=imported_by,
        dry_run=dry_run,
    )


def _canonical_isced_fixture_path() -> Path:
    from konnaxion.ekoh.models import taxonomy

    return Path(taxonomy.__file__).resolve().parents[1] / "fixtures" / "isced_f_2013.json"


def world_auxiliary_fixture_checksum() -> str:
    return hashlib.sha256(_canonical_isced_fixture_path().read_bytes()).hexdigest()


def load_world_auxiliary_fixture(release) -> str:
    """Materialize the Konnaxion-owned EkoH taxonomy in one WorldRelease."""
    from konnaxion.ekoh.models.taxonomy import ExpertiseCategory
    from konnaxion.worlds.db import world_db_scope
    from konnaxion.worlds.resolver import runtime_from_release

    fixture_path = _canonical_isced_fixture_path()
    raw = fixture_path.read_bytes()
    data = json.loads(raw.decode("utf-8"))
    if not isinstance(data, list):
        raise RuntimeError("ISCED-F fixture must contain a JSON list.")

    runtime = runtime_from_release(release)
    entries = sorted(
        data,
        key=lambda entry: (int(entry.get("depth", 0)), str(entry.get("code", ""))),
    )
    with world_db_scope(runtime), transaction.atomic():
        code_to_obj = {obj.code: obj for obj in ExpertiseCategory.objects.all()}
        for entry in entries:
            code = str(entry.get("code", "")).strip()
            name = str(entry.get("name", "")).strip()
            parent_code = entry.get("parent_code")
            depth = int(entry.get("depth", 0))
            if not code or not name:
                raise RuntimeError(f"Invalid ISCED-F fixture entry: {entry!r}")
            parent = None
            if parent_code not in (None, "", "null"):
                parent = code_to_obj.get(str(parent_code))
                if parent is None:
                    raise RuntimeError(
                        f"Missing ISCED-F parent {parent_code!r} for code {code!r}."
                    )
            path = code if parent is None else f"{parent.path}.{code}"
            obj, _ = ExpertiseCategory.objects.update_or_create(
                code=code,
                defaults={"name": name, "parent": parent, "depth": depth, "path": path},
            )
            code_to_obj[code] = obj
    return hashlib.sha256(raw).hexdigest()
