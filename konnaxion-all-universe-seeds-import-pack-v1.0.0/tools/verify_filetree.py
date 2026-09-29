#!/usr/bin/env python3
from pathlib import Path
import json, yaml, sys

root = Path(sys.argv[1] if len(sys.argv) > 1 else Path(__file__).resolve().parents[1]).resolve()
errors = []

world_root = root / "backend" / "seed-data" / "worlds"
universe_root = root / "backend" / "seed-data" / "universes"

worlds = {}
for p in sorted(world_root.glob("*/world.yaml")):
    d = yaml.safe_load(p.read_text(encoding="utf-8"))
    key = d.get("world_key")
    if d.get("world_contract") != "kx-world-pack/v1":
        errors.append(f"{p}: bad world_contract")
    if key in worlds:
        errors.append(f"duplicate world_key: {key}")
    worlds[key] = str(d.get("pack_version"))
    scenarios = d.get("scenarios")
    if not isinstance(scenarios, list) or not scenarios or not all(isinstance(x, str) for x in scenarios):
        errors.append(f"{p}: scenarios must be non-empty string paths")
        continue
    for rel in scenarios:
        sp = p.parent / rel
        if not sp.is_file():
            errors.append(f"{p}: missing {rel}")
            continue
        payload = json.loads(sp.read_text(encoding="utf-8"))
        if payload.get("actors"):
            md = payload.get("metadata") or {}
            if md.get("persona_contract") != "kx-world-personas/v1":
                errors.append(f"{sp}: missing kx-world-personas/v1")

universes = {}
for p in sorted(universe_root.glob("*/universe.yaml")):
    d = yaml.safe_load(p.read_text(encoding="utf-8"))
    key = d.get("universe_key")
    if d.get("universe_contract") != "kx-universe-pack/v1":
        errors.append(f"{p}: bad universe_contract")
    if key in universes:
        errors.append(f"duplicate universe_key: {key}")
    universes[key] = str(d.get("pack_version"))
    for row in d.get("worlds", []):
        wk = row.get("world_key")
        expected = str(row.get("seed_version"))
        if wk not in worlds:
            errors.append(f"{key}: missing World {wk}")
        elif worlds[wk] != expected:
            errors.append(f"{key}: {wk} expected {expected}, found {worlds[wk]}")

print(json.dumps({
    "ok": not errors,
    "universes": universes,
    "world_count": len(worlds),
    "errors": errors,
}, indent=2, ensure_ascii=False))
raise SystemExit(0 if not errors else 1)
