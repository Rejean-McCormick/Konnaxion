#!/usr/bin/env python3
"""
Concatène des vues du projet en 3 fichiers par défaut (sans paramètres) :
  - Code_config_<timestamp>.txt  : tout 'config/'
  - Code_konnaxion_<timestamp>.txt : tout 'konnaxion/' (hors tests)
  - Code_core_<timestamp>.txt   : fichiers essentiels hors 'config/' et 'konnaxion/'
Si des options sont passées (--out/--include/--exclude/--ext), le script
fonctionne en mode classique (une seule sortie), comme la version précédente.
"""

from __future__ import annotations
import argparse
import fnmatch
import os
from pathlib import Path
from typing import Set, List, Optional
from datetime import datetime

# Extensions texte autorisées (ajout de .txt pour capter requirements/*.txt)
DEFAULT_EXTS: Set[str] = {
    ".txt", ".tx", ".md", ".markdown",
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

# Exclusions "tests" génériques
TEST_EXCLUDES: List[str] = [
    "tests/**", "**/tests/**", "**/tests.py",
    "**/test_*.py", "**/*_test.py",
]

# Exclure aussi les fichiers de sortie
OUT_EXCLUDES: List[str] = ["Code_*.txt"]


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Concatène les fichiers texte du projet.")
    p.add_argument("-o", "--out", default=None, help="Fichier de sortie (mode classique)")
    p.add_argument("--ext", help="Extensions additionnelles ou personnalisées, CSV")
    p.add_argument("--include", action="append", default=[], help="Glob d'inclusion relatif (répétable)")
    p.add_argument("--exclude", action="append", default=[], help="Glob d'exclusion relatif (répétable)")
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
    ctrl_hits = sum(1 for b in sample if b < 32 and b not in (9, 10, 13))
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
    """Chemin relatif normalisé en '/' pour simplifier les globs multi-OS."""
    try:
        r = p.relative_to(base)
    except Exception:
        r = p
    return str(r).replace("\\", "/")


def should_include_file(base: Path, file_path: Path, allowed_exts: Set[str],
                        include_globs: List[str], exclude_globs: List[str],
                        max_size: int, out_path: Path) -> bool:
    if not file_path.is_file():
        return False
    if file_path == out_path:
        return False
    try:
        if file_path.stat().st_size > max_size:
            return False
    except Exception:
        return False

    rel = relpath(base, file_path)

    # exclusions explicites
    for pat in exclude_globs:
        if fnmatch.fnmatch(rel, pat):
            return False

    # inclusions explicites
    if include_globs:
        ok = any(fnmatch.fnmatch(rel, pat) for pat in include_globs)
        if not ok:
            return False

    # filtres par extension ou nom connu
    if file_path.suffix.lower() in allowed_exts or file_path.name in NAMES_WITHOUT_EXT:
        return True

    # heuristique texte
    enc = pick_encoding(file_path)
    return enc is not None


def walk_select(base_dir: Path, allowed_exts: Set[str], include_globs: List[str],
                exclude_globs: List[str], max_size: int, out_path: Path) -> List[Path]:
    selected: List[Path] = []
    for root, dirs, files in os.walk(base_dir, followlinks=False):
        # répertoires exclus
        dirs[:] = [d for d in dirs if d not in DEFAULT_EXCLUDE_DIRS]
        root_path = Path(root)
        for name in files:
            fp = root_path / name
            try:
                if fp.resolve() == out_path.resolve():
                    continue
            except Exception:
                pass
            if should_include_file(base_dir, fp, allowed_exts, include_globs, exclude_globs, max_size, out_path):
                selected.append(fp)
    selected.sort(key=lambda p: relpath(base_dir, p).lower())
    return selected


def write_concat(base_dir: Path, files: List[Path], out_path: Path, no_headers: bool) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0
    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        for p in files:
            enc = pick_encoding(p) or "utf-8"
            if not no_headers:
                out.write(f"\n===== BEGIN {relpath(base_dir, p)} =====\n")
            try:
                with p.open("r", encoding=enc, errors="strict") as f:
                    for line in f:
                        out.write(line)
            except UnicodeDecodeError:
                with p.open("r", encoding="latin-1", errors="replace") as f:
                    for line in f:
                        out.write(line)
            if not no_headers:
                out.write(f"\n===== END {relpath(base_dir, p)} =====\n")
            out.write("\n")
            count += 1
    return count


def run_default_three_outputs(base_dir: Path, max_size: int, no_headers: bool) -> None:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_config = base_dir / f"Code_config_{stamp}.txt"
    out_konnaxion = base_dir / f"Code_konnaxion_{stamp}.txt"
    out_core = base_dir / f"Code_core_{stamp}.txt"

    allowed_exts = set(DEFAULT_EXTS)

    # Exclusions communes
    common_excl = list(TEST_EXCLUDES) + list(OUT_EXCLUDES)

    # 1) CONFIG
    config_incl = ["config/**"]
    files = walk_select(base_dir, allowed_exts, config_incl, common_excl, max_size, out_config)
    n1 = write_concat(base_dir, files, out_config, no_headers)
    print(f"{n1} fichier(s) -> {relpath(base_dir, out_config)}")

    # 2) KONNAXION
    konn_incl = ["konnaxion/**"]
    files = walk_select(base_dir, allowed_exts, konn_incl, common_excl, max_size, out_konnaxion)
    n2 = write_concat(base_dir, files, out_konnaxion, no_headers)
    print(f"{n2} fichier(s) -> {relpath(base_dir, out_konnaxion)}")

    # 3) CORE (essentiels hors config/konnaxion)
    core_incl = [
        "manage.py",
        "pyproject.toml",
        "docker-compose.*.yml",
        "README.*",
        "merge_production_dotenvs_in_dotenv.py",
        "requirements/*.txt",
    ]
    core_excl = common_excl + ["config/**", "konnaxion/**"]
    files = walk_select(base_dir, allowed_exts, core_incl, core_excl, max_size, out_core)
    n3 = write_concat(base_dir, files, out_core, no_headers)
    print(f"{n3} fichier(s) -> {relpath(base_dir, out_core)}")


def run_single_output(base_dir: Path, args: argparse.Namespace) -> None:
    # Mode "classique" (compatible version précédente)
    if args.out:
        out_path = (base_dir / args.out).resolve()
    else:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_path = (base_dir / f"Code_{base_dir.name}_{stamp}.txt").resolve()

    allowed_exts = normalize_exts(args.ext)
    include_globs = list(args.include or [])
    exclude_globs = list(args.exclude or []) + list(OUT_EXCLUDES)

    files = walk_select(base_dir, allowed_exts, include_globs, exclude_globs, args.max_size, out_path)
    n = write_concat(base_dir, files, out_path, args.no_headers)
    print(f"{n} fichier(s) concaténé(s) -> {relpath(base_dir, out_path)}")


def main() -> None:
    args = parse_args()
    base_dir = Path(__file__).resolve().parent

    # Si aucune option utilisateur n’est fournie, produire 3 sorties par défaut.
    if not any([args.out, args.ext, args.include, args.exclude]):
        run_default_three_outputs(base_dir, args.max_size, args.no_headers)
    else:
        run_single_output(base_dir, args)


if __name__ == "__main__":
    main()
