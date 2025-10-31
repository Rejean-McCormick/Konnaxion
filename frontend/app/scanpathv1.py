#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from pathlib import Path
from datetime import datetime


def iter_paths(root: Path):
    """Génère tous les chemins (dossiers puis fichiers) sous root, ordre stable."""
    for dirpath, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
        dirnames.sort()
        filenames.sort()
        current_dir = Path(dirpath)
        yield current_dir.resolve()  # le dossier lui‑même
        for name in filenames:
            yield (current_dir / name).resolve()


def main():
    # Dossier cible: là où se trouve ce script.
    # Pour utiliser le dossier courant à la place: remplacez par Path.cwd().
    root = Path(__file__).resolve().parent

    # Nom du fichier: <NomDuDossierParent>_<YYYYMMDD_HHMMSS>.txt
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_path = root / f"{root.name}_{ts}.txt"

    # Écrit en flux pour éviter la charge mémoire et s’auto‑exclure.
    with out_path.open("w", encoding="utf-8", newline="\n") as f:
        for p in iter_paths(root):
            if p == out_path:
                continue  # ne pas s’inclure
            f.write(str(p) + "\n")

    print(f"Fichier généré: {out_path}")


if __name__ == "__main__":
    main()
