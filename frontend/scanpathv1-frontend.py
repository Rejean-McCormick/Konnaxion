#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
from pathlib import Path
from datetime import datetime


EXCLUDED_DIRS = {
    ".git",
    ".next",
    ".storybook",
    "storybook-static",
    "node_modules",
    "test-results",
    "__pycache__",
    ".venv",
    "venv",
}
EXCLUDED_FILES = {".DS_Store"}


def iter_paths(root: Path):
    """Génère tous les chemins (dossiers puis fichiers) sous root, en excluant les répertoires et fichiers inutiles."""
    for dirpath, dirnames, filenames in os.walk(root, topdown=True, followlinks=False):
        dirnames[:] = [d for d in dirnames if d not in EXCLUDED_DIRS]
        filenames[:] = [f for f in filenames if f not in EXCLUDED_FILES]
        dirnames.sort()
        filenames.sort()
        current_dir = Path(dirpath)
        yield current_dir.resolve()
        for name in filenames:
            yield (current_dir / name).resolve()


def safe_name_from_path(path: Path):
    """Construit un nom de fichier sûr à partir du chemin complet."""
    parts = list(path.parts)
    if "frontend" in parts:
        idx = parts.index("frontend")
        relevant = parts[idx:]  # inclut 'frontend' et ce qui suit
    else:
        relevant = parts[-3:]  # sinon, dernières composantes du chemin
    return "_".join(relevant).replace(os.sep, "_").replace(" ", "_")


def main():
    root = Path(__file__).resolve().parent
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    prefix = safe_name_from_path(root)
    out_path = root / f"{prefix}_{ts}.txt"

    with out_path.open("w", encoding="utf-8", newline="\n") as f:
        for p in iter_paths(root):
            if p == out_path:
                continue
            f.write(str(p) + "\n")

    print(f"Fichier généré: {out_path}")


if __name__ == "__main__":
    main()
