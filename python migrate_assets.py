#!/usr/bin/env python3
"""
migrate_assets.py  –  copie les éléments UI de V1 vers Next-Enterprise (v14)
"""

import shutil
from pathlib import Path

# ----------------------------------------------------------------------
# 1) RACINES – Mettez ici les deux dossiers vraiment existants
# ----------------------------------------------------------------------
SRC_ROOT = Path(r"C:\MonCode\K-Avec-Interface-avancee\V1\Front")        # ← nouveau chemin
DST_ROOT = Path(r"C:\MonCode\KonnaxionV14\next-enterprise")

# ----------------------------------------------------------------------
# 2) LISTE DES ÉLÉMENTS À MIGRER
#    (motif relatif dans SRC_ROOT,            destination relative dans DST_ROOT)
# ----------------------------------------------------------------------
MAPPINGS: list[tuple[str, str]] = [
    # Thème global
    (r"theme",                               r"src\theme"),

    # Commutateur de thème
    (r"components\ThemeSwitcher.tsx",        r"src\components\ThemeSwitcher.tsx"),

    # Widgets communs Ekoh :
    #  – styles dans « -pages »
    #  – composants React dans « app »
    (r"-pages\ekoh\dashboard\components\CommonWidget", r"src\components\CommonWidget"),
    (r"app\ekoh\dashboard\components\CommonWidget",    r"src\components\CommonWidget"),
]

# ----------------------------------------------------------------------
def copy_item(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if src.is_dir():
        shutil.copytree(src, dst, dirs_exist_ok=True)
    else:
        shutil.copy2(src, dst)
    print(f"✓ Copié {src}  →  {dst}")

def migrate() -> None:
    for src_rel, dst_rel in MAPPINGS:
        src_path = SRC_ROOT / src_rel
        if not src_path.exists():
            print(f"[WARN] {src_path} introuvable")
            continue
        dst_path = DST_ROOT / dst_rel
        copy_item(src_path, dst_path)

if __name__ == "__main__":
    migrate()
