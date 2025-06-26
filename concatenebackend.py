#!/usr/bin/env python3
r"""
concatenebackend.py – Regroupe le code backend Cookiecutter-Django
Usage :
    python concatenebackend.py               # si konnaxionPATH.txt est à côté
    python concatenebackend.py --paths konnaxionPATH.txt --out backend_bundle.txt
"""
from __future__ import annotations

import argparse
import pathlib
import re
import shutil
import sys
from typing import List

# ---------------------------------------------------------------------------
INCLUDE_RE = re.compile(r"\.py$", re.IGNORECASE)
EXCLUDE_RE = re.compile(
    r"([\\/](tests|migrations|templates|locale|docs|compose"
    r"|\.devcontainer|\.github|docker[^\\/]*|requirements)|\.pytest_cache)",
    re.IGNORECASE,
)
ROOT_INCLUDE = {"manage.py", "merge_production_dotenvs_in_dotenv.py"}

# ---------------------------------------------------------------------------
def keep(path: pathlib.Path) -> bool:
    return (
        path.name in ROOT_INCLUDE
        or (INCLUDE_RE.search(path.name) and not EXCLUDE_RE.search(str(path)))
    )


def resolve_path(base_dir: pathlib.Path, raw: str) -> pathlib.Path | None:
    """
    Résout un chemin :
      1. tel quel ;
      2. avec préfixe « konnaxion/ » si le premier essai est absent.
    Renvoie None si aucun ne correspond.
    """
    p = pathlib.Path(raw)
    if not p.is_absolute():
        p = base_dir / p
    if p.exists():
        return p

    # ★ essai avec le préfixe 'konnaxion'
    alt = p.parent / "konnaxion" / p.name if p.parent == base_dir else base_dir / "konnaxion" / raw
    if alt.exists():
        return alt
    return None


def read_paths(list_file: pathlib.Path) -> List[pathlib.Path]:
    base_dir = list_file.parent
    selected: list[pathlib.Path] = []

    with list_file.open(encoding="utf-8") as fh:
        for raw in fh:
            raw = raw.strip().strip("\"'")
            if not raw:
                continue
            p = resolve_path(base_dir, raw)
            if p and keep(p):
                selected.append(p)
    return selected


def bundle(paths: List[pathlib.Path], out_file: pathlib.Path) -> None:
    missing: list[str] = []

    with out_file.open("w", encoding="utf-8") as out:
        for p in paths:
            out.write(f"{p}\n")
        out.write("\n\n")

        for p in paths:
            try:
                with p.open("r", encoding="utf-8") as src:
                    out.write(f"# ==== {p} ====\n")
                    shutil.copyfileobj(src, out)
                    out.write("\n\n")
            except Exception as exc:  # pylint: disable=broad-except
                missing.append(f"{p}: {exc}")

    print(f"👍  Bundle créé : {out_file} ({len(paths) - len(missing)} fichiers concaténés)")
    if missing:
        print(f"⚠️  {len(missing)} fichier(s) manquant(s) ou illisibles :")
        for m in missing:
            print(f"   - {m}")


def main() -> None:
    default_list = pathlib.Path(__file__).with_name("konnaxionPATH.txt")

    parser = argparse.ArgumentParser(description="Concatène le backend dans un bundle texte.")
    parser.add_argument("--paths", type=pathlib.Path,
                        default=default_list if default_list.exists() else None,
                        help="Fichier-liste (défaut : konnaxionPATH.txt à côté du script).")
    parser.add_argument("--out", type=pathlib.Path, default="backend_bundle.txt",
                        help="Nom du bundle (défaut : backend_bundle.txt).")
    args = parser.parse_args()

    if args.paths is None:
        sys.exit("❌  --paths manquant et konnaxionPATH.txt introuvable.")

    candidates = read_paths(args.paths)
    if not candidates:
        sys.exit("❌  Aucun fichier retenu ; vérifiez les règles ou les chemins.")

    bundle(candidates, args.out)


if __name__ == "__main__":
    main()
