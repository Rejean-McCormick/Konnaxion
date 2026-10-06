# -*- coding: utf-8 -*-
"""Targeted deep health check for the Koali Konnaxion Universe."""
from __future__ import annotations

import json
import os

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")

import django
django.setup()

from konnaxion.worlds.models import Universe, World, WorldRelease
from konnaxion.worlds.services.health import strict_world_routing_enabled
from konnaxion.worlds.services.schema import validate_release_schemas

UNIVERSE_KEY = "konvergence-koali"
DEFAULT_WORLD = "uckk"
EXPECTED_WORLDS = {
    "desjardins",
    "kristal-farms",
    "tech-development",
    "amusement-kreative",
    "orgo-internal-ops",
    "orgo-events",
    "uckk",
    "media-network",
    "member-thomas-antoine",
    "member-simon",
    "member-jeremie",
    "member-aida",
    "member-elias",
}

errors = []
rows = []

if not strict_world_routing_enabled():
    errors.append({"reason": "strict_world_routing_disabled"})

try:
    universe = Universe.objects.select_related("default_world").get(key=UNIVERSE_KEY)
except Universe.DoesNotExist:
    print(json.dumps({
        "ok": False,
        "universe": UNIVERSE_KEY,
        "errors": [{"reason": "universe_not_found"}],
    }, ensure_ascii=False, indent=2))
    raise SystemExit(1)

if universe.status != Universe.STATUS_ACTIVE:
    errors.append({"reason": "universe_not_active", "status": universe.status})

default_key = universe.default_world.key if universe.default_world_id else None
if default_key != DEFAULT_WORLD:
    errors.append({
        "reason": "unexpected_default_world",
        "expected": DEFAULT_WORLD,
        "actual": default_key,
    })

worlds = list(
    World.objects
    .filter(universe=universe)
    .select_related("current_release")
    .order_by("key")
)

actual = {world.key for world in worlds}
missing = sorted(EXPECTED_WORLDS - actual)
unexpected = sorted(actual - EXPECTED_WORLDS)
if missing:
    errors.append({"reason": "missing_worlds", "worlds": missing})
if unexpected:
    errors.append({"reason": "unexpected_worlds", "worlds": unexpected})

for world in worlds:
    row = {
        "world": world.key,
        "status": world.status,
        "release_id": world.current_release_id,
        "ok": True,
    }

    if world.status != World.STATUS_ACTIVE:
        row["ok"] = False
        row["reason"] = "world_not_active"
        errors.append({"world": world.key, "reason": "world_not_active", "status": world.status})
        rows.append(row)
        continue

    release = world.current_release
    if release is None:
        row["ok"] = False
        row["reason"] = "missing_current_release"
        errors.append({"world": world.key, "reason": "missing_current_release"})
        rows.append(row)
        continue

    if release.status != WorldRelease.STATUS_CURRENT:
        row["ok"] = False
        row["reason"] = "release_not_current"
        row["release_status"] = release.status
        errors.append({
            "world": world.key,
            "reason": "release_not_current",
            "release_status": release.status,
        })
        rows.append(row)
        continue

    report = validate_release_schemas(release)
    row["release_number"] = release.release_number
    row["ok"] = bool(report.get("ok"))
    if not row["ok"]:
        row["reason"] = "release_health_failed"
        row["release_health"] = report
        errors.append({
            "world": world.key,
            "reason": "release_health_failed",
            "release_id": release.id,
        })
    rows.append(row)

summary = {
    "ok": not errors,
    "scope": "koali-target-universe",
    "universe": UNIVERSE_KEY,
    "default_world": default_key,
    "expected_world_count": len(EXPECTED_WORLDS),
    "actual_world_count": len(worlds),
    "healthy_world_count": sum(1 for row in rows if row["ok"]),
    "worlds": rows,
    "errors": errors,
}
print(json.dumps(summary, ensure_ascii=False, indent=2, default=str))
raise SystemExit(0 if summary["ok"] else 1)
