#!/usr/bin/env python3
from pathlib import Path
import json
import sys
import yaml

root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]).resolve()
errors = []
warnings = []

world_root = root / "backend" / "seed-data" / "worlds"
universe_root = root / "backend" / "seed-data" / "universes"

# Discover all World Packs, including pre-standard/legacy packs already in the repo.
worlds = {}
world_paths = {}
for p in sorted(world_root.glob("*/world.yaml")):
    d = yaml.safe_load(p.read_text(encoding="utf-8"))
    key = d.get("world_key")
    if not key:
        errors.append(f"{p}: missing world_key")
        continue
    if key in worlds:
        errors.append(f"duplicate world_key: {key}")
        continue
    worlds[key] = str(d.get("pack_version"))
    world_paths[key] = p

    # Basic World Pack integrity still applies to every discovered pack.
    if d.get("world_contract") != "kx-world-pack/v1":
        warnings.append(f"{p}: legacy/non-canonical world_contract {d.get('world_contract')!r}")
    scenarios = d.get("scenarios")
    if not isinstance(scenarios, list) or not scenarios or not all(isinstance(x, str) for x in scenarios):
        errors.append(f"{p}: scenarios must be non-empty string paths")
        continue
    for rel in scenarios:
        sp = p.parent / rel
        if not sp.is_file():
            errors.append(f"{p}: missing {rel}")

# Discover canonical Universe Packs first. Their World references define the
# strict conformance scope for kx-world-personas/v1.
universes = {}
managed_worlds = set()
for p in sorted(universe_root.glob("*/universe.yaml")):
    d = yaml.safe_load(p.read_text(encoding="utf-8"))
    key = d.get("universe_key")
    if not key:
        errors.append(f"{p}: missing universe_key")
        continue
    if d.get("universe_contract") != "kx-universe-pack/v1":
        errors.append(f"{p}: bad universe_contract")
    if key in universes:
        errors.append(f"duplicate universe_key: {key}")
        continue

    universes[key] = str(d.get("pack_version"))
    for row in d.get("worlds", []):
        wk = row.get("world_key")
        expected = str(row.get("seed_version"))
        managed_worlds.add(wk)
        if wk not in worlds:
            errors.append(f"{key}: missing World {wk}")
        elif worlds[wk] != expected:
            errors.append(f"{key}: {wk} expected {expected}, found {worlds[wk]}")

# Strict persona-contract checks apply only to World Packs managed by a
# kx-universe-pack/v1 composition. Legacy standalone Worlds remain supported by
# the generic host adapter and are reported, not rejected.
persona_scenarios = 0
managed_scenarios = 0
for wk in sorted(managed_worlds):
    wp = world_paths.get(wk)
    if wp is None:
        continue
    wd = yaml.safe_load(wp.read_text(encoding="utf-8"))
    for rel in wd.get("scenarios", []):
        sp = wp.parent / rel
        if not sp.is_file():
            continue
        payload = json.loads(sp.read_text(encoding="utf-8"))
        managed_scenarios += 1
        if payload.get("actors"):
            md = payload.get("metadata") or {}
            if md.get("persona_contract") != "kx-world-personas/v1":
                errors.append(f"{sp}: managed World scenario missing kx-world-personas/v1")
            else:
                persona_scenarios += 1

legacy_worlds = sorted(set(worlds) - managed_worlds)
for wk in legacy_worlds:
    warnings.append(
        f"legacy/unmanaged World retained outside kx-universe-pack/v1: {wk}"
    )

print(json.dumps({
    "ok": not errors,
    "universes": universes,
    "world_count_total": len(worlds),
    "world_count_managed": len(managed_worlds),
    "world_count_legacy_unmanaged": len(legacy_worlds),
    "managed_scenarios": managed_scenarios,
    "persona_scenarios": persona_scenarios,
    "legacy_worlds": legacy_worlds,
    "warnings": warnings,
    "errors": errors,
}, indent=2, ensure_ascii=False))

raise SystemExit(0 if not errors else 1)
