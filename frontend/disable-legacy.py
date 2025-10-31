#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
disable_legacy.py
Désactive les pages/dossiers legacy en préfixant leur nom par '-'.

- Cible par défaut: dossiers/fichiers de premier niveau dans ./app
- Préserve: app/api, app/layout.tsx, app/page.tsx
- Dry-run par défaut, utiliser --do-it pour appliquer
- --also-modules <noms...> pour neutraliser des dossiers sous ./modules
- --undo pour retirer un seul '-' de tête sur les cibles renommées

Usage:
  python disable_legacy.py --base "C:\\MyCode\\Konnaxionv14\\frontend" --do-it
  python disable_legacy.py --base . --also-modules ethikos ekoh
  python disable_legacy.py --base . --undo
"""

from __future__ import annotations
import argparse
from pathlib import Path
from typing import Iterable, List, Tuple

KEEP_DIRS_IN_APP = {"api"}
KEEP_FILES_IN_APP = {"layout.tsx", "page.tsx"}

def dashed_candidate(p: Path) -> Path:
    """
    Retourne un Path disponible en préfixant le nom de p par un/plusieurs '-' jusqu'à ce qu'il n'existe plus.
    Ex: foo -> -foo (si existe déjà, -> --foo, etc.)
    """
    parent = p.parent
    name = p.name
    prefix_count = 1
    while True:
        candidate = parent / ("-" * prefix_count + name)
        if not candidate.exists():
            return candidate
        prefix_count += 1

def will_be_kept_in_app(child: Path) -> bool:
    """
    Règles de conservation au niveau app/ (enfants directs).
    """
    if child.name.startswith("-"):
        # déjà neutralisé
        return True
    if child.is_dir() and child.name in KEEP_DIRS_IN_APP:
        return True
    if child.is_file() and child.name in KEEP_FILES_IN_APP:
        return True
    return False

def iter_targets_in_app(app_dir: Path) -> Iterable[Path]:
    """
    Itère les enfants directs de app/ à neutraliser.
    """
    if not app_dir.exists():
        return
    for child in app_dir.iterdir():
        if will_be_kept_in_app(child):
            continue
        yield child

def iter_targets_in_modules(modules_dir: Path, names: List[str]) -> Iterable[Path]:
    """
    Itère les dossiers modules/<name> à neutraliser si présents.
    """
    if not modules_dir.exists():
        return
    for name in names:
        if not name:
            continue
        target = modules_dir / name
        if target.exists() and not target.name.startswith("-"):
            yield target

def plan_moves(paths: Iterable[Path]) -> List[Tuple[Path, Path]]:
    """
    Crée un plan [(source, destination)] pour tous les Paths donnés.
    """
    moves: List[Tuple[Path, Path]] = []
    for src in paths:
        dst = dashed_candidate(src)
        moves.append((src, dst))
    return moves

def plan_undo(paths: Iterable[Path]) -> List[Tuple[Path, Path]]:
    """
    Plan d'annulation: enlève un seul '-' de tête, si présent.
    """
    moves: List[Tuple[Path, Path]] = []
    for src in paths:
        name = src.name
        if name.startswith("-"):
            # retire exactement un '-'
            dst = src.parent / name[1:]
            if dst.exists():
                # Collision: on ne tente pas d'écraser, on ignore proprement.
                continue
            moves.append((src, dst))
    return moves

def apply_moves(moves: List[Tuple[Path, Path]], do_it: bool) -> None:
    if not moves:
        print("Aucun élément à renommer.")
        return
    width = max(len(str(s)) for s, _ in moves)
    for src, dst in moves:
        if do_it:
            src.replace(dst)
            print(f"RENAM  {str(src).ljust(width)}  ->  {dst.name}")
        else:
            print(f"WOULD  {str(src).ljust(width)}  ->  {dst.name}")

def main():
    parser = argparse.ArgumentParser(description="Désactiver ou réactiver des pages legacy en les préfixant par '-'")
    parser.add_argument("--base", type=str, default=".", help="Racine du projet (contenant app/, modules/, etc.)")
    parser.add_argument("--do-it", action="store_true", help="Appliquer réellement les renommages (sinon dry-run)")
    parser.add_argument("--also-modules", nargs="*", default=[], help="Noms de dossiers sous modules/ à neutraliser (ex: ethikos ekoh)")
    parser.add_argument("--undo", action="store_true", help="Annuler les renommages (retire un seul '-' de tête)")
    args = parser.parse_args()

    base = Path(args.base).resolve()
    app_dir = base / "app"
    modules_dir = base / "modules"

    if args.undo:
        # Annuler dans app/
        undo_targets_app = [p for p in app_dir.iterdir()] if app_dir.exists() else []
        # Annuler dans modules sélectionnés
        undo_targets_modules = []
        if args.also_modules and modules_dir.exists():
            for name in args.also_modules:
                d = modules_dir / name
                if d.exists():
                    undo_targets_modules.append(d)

        undo_plan = plan_undo(undo_targets_app) + plan_undo(undo_targets_modules)
        print("=== PLAN D'ANNULATION ===")
        apply_moves(undo_plan, args.do_it)
        return

    # Neutraliser dans app/
    targets_app = list(iter_targets_in_app(app_dir))
    plan = plan_moves(targets_app)

    # Neutraliser facultativement dans modules/
    if args.also_modules:
        targets_modules = list(iter_targets_in_modules(modules_dir, args.also_modules))
        plan += plan_moves(targets_modules)

    print("=== PLAN DE RENOMMAGE (legacy -> -legacy) ===")
    apply_moves(plan, args.do_it)

if __name__ == "__main__":
    main()
