#!/usr/bin/env python3
# FILE: frontend/modules/concatv3.py
"""
Concatène tous les fichiers texte du dossier du script et de ses sous-dossiers.
Par défaut, écrit le résultat dans "Code_<nom_dossier>_<YYYYMMDD_HHMMSS>.txt" à la racine du script.
"""

from __future__ import annotations
import argparse
import fnmatch
import os
from pathlib import Path
from typing import Set, List, Optional
from datetime import datetime

DEFAULT_EXTS: Set[str] = {
    ".tx", ".md", ".markdown",
    ".json", ".yaml", ".yml", ".xml", ".toml", ".ini", ".cfg", ".conf", ".properties",
    ".html", ".htm", ".css", ".scss", ".less",
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
    ".py", ".pyi", ".ipynb",
    ".java", ".kt", ".swift", ".rb", ".php", ".go", ".rs",
    ".c", ".h", ".cpp", ".cc", ".hpp", ".cs",
    ".sql",
    ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat",
    ".tex", ".bib",
    ".graphql", ".gql",
    ".gradle",
    ".pl", ".lua", ".r",
    ".env",
}

NAMES_WITHOUT_EXT: Set[str] = {
    "Dockerfile", "Makefile", "CMakeLists.txt",
    ".gitignore", ".gitattributes", ".editorconfig",
    "Procfile", "Gemfile", "requirements.txt", "Pipfile", "poetry.lock",
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "tsconfig.json", "eslint.config.js", ".eslintrc", ".prettierrc",
}

DEFAULT_EXCLUDE_DIRS: Set[str] = {
    ".git", ".hg", ".svn",
    "node_modules", ".next", ".nuxt",
    "dist", "build", "out", "coverage", ".cache",
    ".venv", "venv", "__pycache__",
    "target", "bin", "obj",
}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Concatène les fichiers texte du projet dans un seul fichier.")
    p.add_argument("-o", "--out", default=None, help="Fichier de sortie (facultatif)")
    p.add_argument("--ext", help="Extensions additionnelles ou personnalisées, séparées par des virgules")
    p.add_argument("--include", action="append", default=[], help="Glob d'inclusion relatif à la racine (répétable)")
    p.add_argument("--exclude", action="append", default=[], help="Glob d'exclusion relatif à la racine (répétable)")
    p.add_argument("--max-size", type=int, default=2_000_000, help="Taille max par fichier en octets")
    p.add_argument("--no-headers", action="store_true", help="Ne pas imprimer d'entêtes par fichier")
    return p.parse_args()


def normalize_exts(exts_csv: Optional[str]) -> Set[str]:
    if not exts_csv:
        return set(DEFAULT_EXTS)
    parts = [e.strip().lower() for e in exts_csv.split(",") if e.strip()]
    normed = set()
    for e in parts:
        if not e.startswith("."):
            e = "." + e
        normed.add(e)
    return normed


def is_probably_text(sample: bytes) -> bool:
    if not sample:
        return True
    if b"\x00" in sample:
        return False
    try:
        sample.decode("utf-8")
        return True
    except UnicodeDecodeError:
        pass
    ctrl_hits = 0
    for b in sample:
        if b < 32 and b not in (9, 10, 13):
            ctrl_hits += 1
    return (ctrl_hits / max(1, len(sample))) < 0.01


def pick_encoding(path: Path) -> Optional[str]:
    try:
        with path.open("rb") as f:
            sample = f.read(32768)
    except Exception:
        return None
    if not is_probably_text(sample):
        return None
    for enc in ("utf-8", "utf-8-sig", "utf-16", "cp1252", "latin-1"):
        try:
            sample.decode(enc)
            return enc
        except UnicodeDecodeError:
            continue
    return "latin-1"


def relpath(base: Path, p: Path) -> str:
    try:
        return str(p.relative_to(base))
    except Exception:
        return str(p)


def should_include_file(base: Path, file_path: Path, allowed_exts: Set[str],
                        include_globs: List[str], exclude_globs: List[str],
                        max_size: int, out_path: Path) -> bool:
    if not file_path.is_file():
        return False
    if file_path == out_path:
        return False
    if file_path.suffix.lower() == ".txt":
        return False
    try:
        if file_path.stat().st_size > max_size:
            return False
    except Exception:
        return False
    rel = relpath(base, file_path)
    for pat in exclude_globs:
        if fnmatch.fnmatch(rel, pat):
            return False
    if include_globs:
        ok = any(fnmatch.fnmatch(rel, pat) for pat in include_globs)
        if not ok:
            return False
    if file_path.suffix.lower() in allowed_exts or file_path.name in NAMES_WITHOUT_EXT:
        return True
    enc = pick_encoding(file_path)
    return enc is not None


def main() -> None:
    args = parse_args()
    base_dir = Path(__file__).resolve().parent
    self_path = Path(__file__).resolve()

    if args.out:
        out_path = (base_dir / args.out).resolve()
    else:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_name = f"Code_{base_dir.name}_{stamp}.txt"
        out_path = (base_dir / out_name).resolve()

    allowed_exts = normalize_exts(args.ext)
    include_globs = list(args.include or [])
    exclude_globs = list(args.exclude or [])

    selected: List[Path] = []
    for root, dirs, files in os.walk(base_dir, followlinks=False):
        dirs[:] = [d for d in dirs if d not in DEFAULT_EXCLUDE_DIRS]
        root_path = Path(root)
        for name in files:
            fp = root_path / name
            # exclure le script exécuté lui-même
            try:
                if fp.resolve() == self_path:
                    continue
            except Exception:
                pass
            if should_include_file(base_dir, fp, allowed_exts, include_globs, exclude_globs, args.max_size, out_path):
                selected.append(fp)

    selected.sort(key=lambda p: relpath(base_dir, p).lower())
    out_path.parent.mkdir(parents=True, exist_ok=True)

    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        for p in selected:
            enc = pick_encoding(p) or "utf-8"
            if not args.no_headers:
                out.write(f"\n===== BEGIN {relpath(base_dir, p)} =====\n")
            try:
                with p.open("r", encoding=enc, errors="strict") as f:
                    for line in f:
                        out.write(line)
            except UnicodeDecodeError:
                with p.open("r", encoding="latin-1", errors="replace") as f:
                    for line in f:
                        out.write(line)
            if not args.no_headers:
                out.write(f"\n===== END {relpath(base_dir, p)} =====\n")
            out.write("\n")

    print(f"{len(selected)} fichier(s) concaténé(s) -> {relpath(base_dir, out_path)}")


if __name__ == "__main__":
    main()
