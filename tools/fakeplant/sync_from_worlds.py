"""Konnaxion host: synchronize only FakePlant World/Universe packs from sibling Konnaxion_Worlds.

Default dry-run. --apply copies source packs into the host seed root; refuses divergent existing files unless --replace-fakeplant. Never deletes other universes.
"""
from __future__ import annotations
import argparse, hashlib, shutil, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT.parent/'Konnaxion_Worlds'/'seed-data'
DST=ROOT/'backend'/'seed-data'
parser=argparse.ArgumentParser()
parser.add_argument('--apply', action='store_true')
parser.add_argument('--replace-fakeplant', action='store_true', help='Explicitly overwrite divergent FakePlant-only files')
args=parser.parse_args()
items=[Path('universes/fakeplant/universe.yaml')]
worlds=['fp-electromecanique-informatique','fp-administration','fp-direction-management-hr','fp-vente-pr-marketing','fp-activites-sociales','fp-espace-discussion']
for world in worlds:
    items.extend([Path('worlds')/world/'world.yaml',Path('worlds')/world/'scenarios/fakeplant.json'])
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
changes=[]
for rel in items:
    src=SRC/rel; dst=DST/rel
    if not src.is_file():raise SystemExit(f'MISSING SOURCE: {src}')
    if dst.exists() and sha(src)!=sha(dst) and not args.replace_fakeplant:
        raise SystemExit(f'CONFLICT: {dst} — --replace-fakeplant requis')
    if dst.exists() and sha(src)==sha(dst):continue
    changes.append((src,dst))
print(f'FakePlant: {len(items)} fichiers attendus, {len(changes)} à copier; autre univers inchangé.')
if not args.apply:
    print('DRY RUN. Ajouter --apply pour copier uniquement les packs FakePlant.')
    raise SystemExit(0)
for src,dst in changes:
    dst.parent.mkdir(parents=True,exist_ok=True)
    shutil.copy2(src,dst)
print('SYNC OK. Exécuter worlds_apply_universe depuis Konnaxion (avec DB et confirmation).')
