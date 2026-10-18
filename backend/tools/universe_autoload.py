"""Local development: discover nested Universes, load ONLY brand-new keys (opt-in flag)."""
from __future__ import annotations
import argparse
import os
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.local")


def execute(*, apply_new: bool = False) -> int:
    import django
    django.setup()
    from django.conf import settings
    from konnaxion.worlds.models import Universe
    from konnaxion.worlds.services.seed_packs import discover_seed_pack_catalog
    from konnaxion.worlds.services.universe_packs import discover_universe_packs
    root = (BACKEND.parent.parent / "Konnaxion_Worlds" / "universes").resolve()
    worlds = Path(settings.KONNAXION_WORLD_SEED_ROOT).resolve()
    universes = Path(settings.KONNAXION_UNIVERSE_SEED_ROOT).resolve() if getattr(settings, "KONNAXION_UNIVERSE_SEED_ROOT", None) else worlds
    if worlds != root or universes != root:
        raise RuntimeError(f"Roots divergentes; refus: worlds={worlds}, universes={universes}, attendu={root}")
    if not root.is_dir():
        raise RuntimeError(f"Catalogue absent: {root}")
    packs = discover_universe_packs()
    if not packs:
        raise RuntimeError("Catalogue vide; refus de demarrer")
    catalog = discover_seed_pack_catalog(persist=False)
    assigned = set()
    for pack in packs:
        for w in pack.worlds:
            seed = catalog.resolve(w["seed_pack_key"], w["seed_version"])
            if seed.world_key in assigned:
                raise RuntimeError(f"World dans plusieurs Universes: {seed.world_key}")
            assigned.add(seed.world_key)
            if seed.manifest_path.parent.parent.parent.name != pack.universe_key:
                raise RuntimeError(f"World rattache au mauvais Universe: {seed.manifest_path}")
    installed = set(Universe.objects.values_list("key", flat=True))
    pending = [pack for pack in packs if pack.universe_key not in installed]
    print(f"CATALOGUE {len(packs)} Universes / {len(assigned)} Worlds; nouveaux={len(pending)}",flush=True)
    for pack in sorted(packs, key=lambda p:p.universe_key):
        print(f"  {'NEW' if pack.universe_key not in installed else 'SKIP existing':14} {pack.universe_key}@{pack.version} ({len(pack.worlds)} Worlds, {pack.visibility})",flush=True)
    if not apply_new:
        print("LECTURE SEULE; --apply-new installe uniquement les nouvelles cles.",flush=True)
        return 0
    for pack in pending:
        proc=subprocess.run([sys.executable,"manage.py","worlds_apply_universe",pack.universe_key,"--pack-version",pack.version,"--promote"],cwd=BACKEND,check=False)
        if proc.returncode:
            raise RuntimeError(f"Chargement echoue: {pack.universe_key}, code {proc.returncode}")
    return 0

if __name__ == "__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--apply-new",action="store_true")
    args=parser.parse_args()
    try:raise SystemExit(execute(apply_new=args.apply_new))
    except Exception as exc:
        print(f"UNIVERSE AUTOLOAD REFUSED: {exc}",file=sys.stderr)
        raise SystemExit(1)
