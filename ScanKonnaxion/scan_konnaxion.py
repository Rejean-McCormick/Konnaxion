#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scan_konnaxion.py

Script autonome pour générer des exports texte du frontend et du backend
dans un dossier horodaté créé à côté de ce fichier.

- Frontend : logique inspirée de concat_frontend.py (groupes + TOC + filtrage)
- Backend  : logique inspirée de concat_backendV2.py (bundles + TOC + index)

Par défaut :
  - crée un dossier "scan_YYYYMMDD_HHMMSS" dans le même dossier que ce script
  - crée un sous-dossier "frontend" avec :
      * un fichier global frontend_ALL_<stamp>.txt
      * les fichiers par groupe : frontend_core_..., frontend_app_..., etc.
  - crée un sous-dossier "backend" avec :
      * un fichier global Code_ALL_Konnaxion backend_<stamp>.txt
      * les bundles backend : Code_config_..., Code_core_..., etc. + INDEX_...

NOTE : adapte les constantes FRONTEND_ROOT et BACKEND_ROOT ci‑dessous à ton arborescence.
"""

from __future__ import annotations

import fnmatch
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Set, Tuple

# =============================================================================
# Configuration générale
# =============================================================================

SCRIPT_DIR = Path(__file__).resolve().parent

# À ADAPTER : racines du frontend et du backend Konnaxion.
# Le script NE les devinera pas tout seul.
FRONTEND_ROOT = Path(r"C:\MyCode\Konnaxionv14\frontend")
BACKEND_ROOT = Path(r"C:\MyCode\Konnaxionv14\backend")

# Limites de taille (octets) pour les fichiers sources
MAX_SIZE_FRONTEND = 2_000_000
MAX_SIZE_BACKEND = 2_000_000

# Options frontend
MERGE_SMALL_FRONTEND = 4    # fusionne les petits groupes (<= N fichiers) dans frontend_small
NO_HEADERS = False          # True = pas de blocs BEGIN/END autour de chaque fichier

TIMESTAMP_FORMAT = "%Y%m%d_%H%M%S"

# =============================================================================
# FRONTEND (logique dérivée de concat_frontend.py)
# =============================================================================

DEFAULT_EXTS: Set[str] = {
    ".txt", ".tx", ".md", ".markdown",
    ".json", ".yaml", ".yml", ".xml", ".toml", ".ini", ".cfg", ".conf", ".properties",
    ".html", ".htm", ".css", ".scss", ".less",
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
    ".py", ".pyi",
    ".java", ".kt", ".swift", ".rb", ".php", ".go", ".rs",
    ".c", ".h", ".cpp", ".cc", ".hpp", ".cs",
    ".sql",
    ".sh", ".bash", ".zsh", ".fish", ".ps1", ".bat",
    ".graphql", ".gql",
    ".gradle",
    ".pl", ".lua", ".r",
    ".env",
    ".svg",
    ".ndjson",
}

NAMES_WITHOUT_EXT: Set[str] = {
    "Dockerfile", "Makefile", "CMakeLists.txt",
    ".gitignore", ".gitattributes", ".editorconfig",
    ".all-contributorsrc", ".prettierignore", ".releaserc", "LICENSE",
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "tsconfig.json", "eslint.config.js", "eslint.config.mjs", ".eslintrc",
    ".prettierrc", "prettier.config.js", "postcss.config.js",
    "routes.json",
}

DEFAULT_EXCLUDE_DIRS: Set[str] = {
    ".git", ".hg", ".svn",
    "node_modules", ".next",
    "dist", "build", "out", "coverage", ".cache",
    ".venv", "venv", "__pycache__",
    "target", "bin", "obj",
}

BINARY_EXTS: Set[str] = {
    ".zip", ".gz", ".bz2", ".xz", ".7z", ".rar",
    ".png", ".jpg", ".jpeg", ".webp", ".ico", ".gif", ".pdf", ".ttf", ".woff", ".woff2",
}

# Exclusions pour éviter de reprendre les propres sorties texte
FRONT_OUT_EXCLUDES: List[str] = [
    "Code_*.txt",
    "frontend_*_*.txt",
    "app/Code_*.txt",
    "components/Code_*.txt",
    "modules/Code_*.txt",
    "src/Code_*.txt",
]

TEST_DIRS = ["tests/**", "_e2e/**"]


def is_probably_text(sample: bytes) -> bool:
    """Heuristique texto/binaire (copiée du script frontend original)."""
    if not sample:
        return True
    if b"\x00" in sample:
        return False
    try:
        sample.decode("utf-8")
        return True
    except UnicodeDecodeError:
        pass
    ctrl = sum(1 for b in sample if b < 32 and b not in (9, 10, 13))
    return (ctrl / max(1, len(sample))) < 0.01


def pick_encoding_front(path: Path) -> Optional[str]:
    """Choisit un encodage texte plausible, ou None si binaire."""
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
        r = p.relative_to(base)
    except Exception:
        r = p
    return str(r).replace("\\", "/")


def should_include_file_front(
    base: Path,
    file_path: Path,
    allowed_exts: Set[str],
    include_globs: List[str],
    exclude_globs: List[str],
    max_size: int,
    out_path: Path,
) -> bool:
    if not file_path.is_file():
        return False
    if file_path.suffix.lower() in BINARY_EXTS:
        return False
    if file_path == out_path:
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

    enc = pick_encoding_front(file_path)
    return enc is not None


def walk_select_front(
    base_dir: Path,
    allowed_exts: Set[str],
    include_globs: List[str],
    exclude_globs: List[str],
    max_size: int,
    out_path: Path,
) -> List[Path]:
    selected: List[Path] = []
    for root, dirs, files in os.walk(base_dir, followlinks=False):
        dirs[:] = [d for d in dirs if d not in DEFAULT_EXCLUDE_DIRS]
        root_path = Path(root)
        for name in files:
            fp = root_path / name
            try:
                if fp.resolve() == out_path.resolve():
                    continue
            except Exception:
                pass
            if should_include_file_front(
                base_dir, fp, allowed_exts, include_globs, exclude_globs, max_size, out_path
            ):
                selected.append(fp)
    selected.sort(key=lambda p: relpath(base_dir, p).lower())
    return selected


def write_concat_front(
    base_dir: Path,
    files: List[Path],
    out_path: Path,
    no_headers: bool,
) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    abs_paths: List[str] = []
    for p in files:
        try:
            abs_paths.append(str(p.resolve()))
        except Exception:
            abs_paths.append(str(p))

    count = 0
    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        out.write(f"===== TOC ({len(files)} fichiers) =====\n")
        for i, ap in enumerate(abs_paths, 1):
            out.write(f"{i}. {ap}\n")
        out.write("===== END TOC =====\n\n")

        for p in files:
            enc = pick_encoding_front(p) or "utf-8"
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


# Groupes frontend (copiés du script original)
GROUPS: Dict[str, Tuple[List[str], List[str]]] = {
    "frontend_core": (
        [
            "README.*",
            "LICENSE",
            "package.json",
            "pnpm-lock.yaml",
            "next.config.ts",
            "tsconfig.json",
            "eslint.config.*",
            ".eslintrc*",
            ".prettier*",
            "prettier.config.js",
            "postcss.config.js",
            "env.mjs",
            "instrumentation.ts",
            "renovate.json",
            ".all-contributorsrc",
            ".releaserc",
            "routes.json",
            "jest.config.js",
            "jest.*.js",
            "playwright.*.ts",
            "report-bundle-size.js",
            "scripts/*.mjs",
            "scripts/codemods/*.js",
            "api.ts",
            "next-env.d.ts",
            "reset.d.ts",
            "scanpath*.py",
        ],
        FRONT_OUT_EXCLUDES + TEST_DIRS,
    ),
    "frontend_app": (["app/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_components": (["components/**", "src/components/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_modules": (["modules/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_shared": (["shared/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_services": (["services/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_routes": (
        [
            "routes/**",
            "routes.json",
            "routes-tests.json",
            "scripts/find-routes.mjs",
            "scripts/find-routes-tests.mjs",
        ],
        FRONT_OUT_EXCLUDES + TEST_DIRS,
    ),
    "frontend_hooks_context": (["hooks/**", "context/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_theme_styles": (
        ["theme/**", "src/theme/**", "styles/**"],
        FRONT_OUT_EXCLUDES + TEST_DIRS,
    ),
    "frontend_tests_e2e": (
        [
            "tests/**",
            "_e2e/**",
            "playwright-report/*.html",
            "playwright-report/*.ndjson",
            "playwright-report/index-test/*.html",
            "playwright-report/index-test/*.ndjson",
            "playwright-smokeREADME.*",
        ],
        FRONT_OUT_EXCLUDES,
    ),
    "frontend_types": (["types/**", "src/types/**"], FRONT_OUT_EXCLUDES + TEST_DIRS),
    "frontend_misc": (
        [
            "assets/**/*.svg",
            "public/**/*.svg",
            "graph.svg",
            "use_client_report.csv",
            "use_client_report.json",
            "ct/**",
        ],
        FRONT_OUT_EXCLUDES + TEST_DIRS,
    ),
}


def run_frontend_multi(base_dir: Path, dest_dir: Path, stamp: str) -> List[Path]:
    """
    Génère les fichiers par groupe frontend et renvoie la liste
    dédupliquée de tous les fichiers sources utilisés (tous groupes confondus).
    """
    allowed_exts = set(DEFAULT_EXTS)

    group_files: Dict[str, List[Path]] = {}
    for group_name, (incl, excl) in GROUPS.items():
        out_path = dest_dir / f"{group_name}_{stamp}.txt"
        files = walk_select_front(base_dir, allowed_exts, incl, excl, MAX_SIZE_FRONTEND, out_path)
        group_files[group_name] = files

    # petits groupes à fusionner
    small_groups: List[str] = []
    if MERGE_SMALL_FRONTEND and MERGE_SMALL_FRONTEND > 0:
        for g, files in group_files.items():
            if len(files) <= MERGE_SMALL_FRONTEND:
                small_groups.append(g)

    # gros groupes écrits individuellement
    for g, files in group_files.items():
        if g in small_groups:
            continue
        if not files:
            continue
        out_path = dest_dir / f"{g}_{stamp}.txt"
        n = write_concat_front(base_dir, files, out_path, NO_HEADERS)
        print(f"[frontend] {g}: {n} fichier(s) -> {out_path}")

    # fusion des petits groupes
    if small_groups:
        merged: List[Path] = []
        for g in small_groups:
            merged.extend(group_files[g])
        merged = sorted(set(merged), key=lambda p: relpath(base_dir, p).lower())
        out_small = dest_dir / f"frontend_small_{stamp}.txt"
        n = write_concat_front(base_dir, merged, out_small, NO_HEADERS)
        small_list = ", ".join(small_groups)
        print(f"[frontend] frontend_small (fusion de: {small_list}): {n} fichier(s) -> {out_small}")

    # union de tous les fichiers utilisés par les groupes (dédup + tri)
    all_files: List[Path] = []
    for flist in group_files.values():
        all_files.extend(flist)

    unique_files: List[Path] = []
    seen: Set[Path] = set()
    for p in sorted(all_files, key=lambda q: relpath(base_dir, q).lower()):
        if p in seen:
            continue
        seen.add(p)
        unique_files.append(p)

    return unique_files


def run_frontend_all(base_dir: Path, dest_dir: Path, stamp: str, files: List[Path]) -> None:
    """
    Mono-fichier global pour tout le frontend, basé uniquement sur
    les fichiers déjà inclus dans les groupes frontend_* / frontend_small.
    """
    out_path = dest_dir / f"frontend_ALL_{stamp}.txt"
    n = write_concat_front(base_dir, files, out_path, NO_HEADERS)
    print(f"[frontend] ALL: {n} fichier(s) -> {out_path}")


# =============================================================================
# BACKEND (logique dérivée de concat_backendV2.py / concat_series.py)
# =============================================================================

BACK_ALLOWED_EXTS: Set[str] = {
    ".txt", ".md", ".markdown",
    ".json", ".yaml", ".yml", ".xml", ".toml", ".ini", ".cfg", ".conf", ".properties",
    ".html", ".htm", ".css", ".scss", ".less",
    ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
    ".py", ".pyi",
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

BACK_NAMES_WITHOUT_EXT: Set[str] = {
    "Dockerfile",
    "Makefile",
    "CMakeLists.txt",
    ".gitignore",
    ".gitattributes",
    ".editorconfig",
    "Procfile",
    "requirements.txt",
    "Pipfile",
    "poetry.lock",
    "package.json",
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "tsconfig.json",
    ".eslintrc",
    ".prettierrc",
    "eslint.config.js",
}

BACK_EXCLUDE_DIRS: Set[str] = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    ".next",
    ".nuxt",
    "dist",
    "build",
    "out",
    "coverage",
    ".cache",
    ".venv",
    "venv",
    "__pycache__",
    "target",
    "bin",
    "obj",
}

# Bundles backend alignés avec l'arborescence Konnaxion
BACK_BUNDLES = (
    ("Code_config", ["config/**"], []),
    (
        "Code_core",
        [
            "manage.py",
            "pyproject.toml",
            "docker-compose.*.yml",
            "README.*",
            ".pre-commit-config.yaml",
            "merge_production_dotenvs_in_dotenv.py",
            "requirements/*.txt",
        ],
        [],
    ),
    (
        "Code_apps",
        ["konnaxion/**"],
        [
            "konnaxion/**/migrations/**",
            "konnaxion/**/tests/**",
            "konnaxion/**/templates/**",
            "tests/**",
            "**/tests.py",
        ],
    ),
    ("Code_migrations", ["**/migrations/**"], []),
    ("Code_tests", ["tests/**", "**/tests/**", "**/test_*.py", "**/*_test.py", "**/tests.py"], []),
    ("Code_templates", ["konnaxion/templates/**"], []),
    ("Code_celery", ["config/celery_app.py", "konnaxion/**/tasks.py"], []),
    (
        "Code_deploy",
        ["docker-compose.*.yml", "Dockerfile", "README.*", ".pre-commit-config.yaml"],
        [],
    ),
)

BACK_OUT_EXCLUDES = ["Code_*.txt"]  # (non utilisé désormais pour ALL, laissé pour compat éventuelle)


def to_rel(base: Path, p: Path) -> str:
    try:
        r = p.relative_to(base)
    except Exception:
        r = p
    return str(r).replace("\\", "/")


def is_text_file_back(path: Path) -> bool:
    if path.suffix.lower() in BACK_ALLOWED_EXTS or path.name in BACK_NAMES_WITHOUT_EXT:
        return True
    try:
        with path.open("rb") as f:
            sample = f.read(32768)
    except Exception:
        return False
    if b"\x00" in sample:
        return False
    try:
        sample.decode("utf-8")
        return True
    except UnicodeDecodeError:
        ctrl = sum(1 for b in sample if b < 32 and b not in (9, 10, 13))
        return (ctrl / max(1, len(sample))) < 0.01


def pick_encoding_back(path: Path) -> Optional[str]:
    for enc in ("utf-8", "utf-8-sig", "utf-16", "cp1252", "latin-1"):
        try:
            with path.open("r", encoding=enc) as f:
                f.read(2048)
            return enc
        except Exception:
            continue
    return "latin-1"


def matches_any(rel: str, patterns: Iterable[str]) -> bool:
    return any(fnmatch.fnmatch(rel, pat) for pat in patterns)


def select_files_back(
    base: Path,
    includes: List[str],
    excludes: List[str],
    max_size: int,
    out_dir: Path,
) -> List[Path]:
    chosen: List[Path] = []
    for root, dirs, files in os.walk(base, followlinks=False):
        dirs[:] = [
            d
            for d in dirs
            if d not in BACK_EXCLUDE_DIRS and (Path(root) / d) != out_dir
        ]
        rp = Path(root)
        for name in files:
            p = rp / name
            if not p.is_file() or p.is_symlink():
                continue
            try:
                if p.stat().st_size > max_size:
                    continue
            except Exception:
                continue
            rel = to_rel(base, p)
            if out_dir in p.parents:
                continue
            if excludes and matches_any(rel, excludes):
                continue
            if includes and not matches_any(rel, includes):
                continue
            if not is_text_file_back(p):
                continue
            chosen.append(p)
    chosen.sort(key=lambda q: to_rel(base, q).lower())
    return chosen


def write_toc_back(out_fp, files: List[Path]) -> None:
    out_fp.write(f"===== TOC ({len(files)} fichiers) =====\n")
    for i, p in enumerate(files, 1):
        try:
            full = str(p.resolve())
        except Exception:
            full = str(p.absolute())
        out_fp.write(f"{i:04d}  {full}\n")
    out_fp.write("===== END TOC =====\n\n")


def write_bundle_back(
    base: Path,
    files: List[Path],
    out_path: Path,
    no_headers: bool,
) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        write_toc_back(out, files)
        for p in files:
            enc = pick_encoding_back(p) or "utf-8"
            if not no_headers:
                out.write(f"\n===== BEGIN {to_rel(base, p)} =====\n")
            try:
                with p.open("r", encoding=enc, errors="strict") as f:
                    for line in f:
                        out.write(line)
            except UnicodeDecodeError:
                with p.open("r", encoding="latin-1", errors="replace") as f:
                    for line in f:
                        out.write(line)
            if not no_headers:
                out.write(f"\n===== END {to_rel(base, p)} =====\n")
            out.write("\n")
            n += 1
    return n


def run_backend_bundles(base: Path, dest_dir: Path, stamp: str) -> List[Path]:
    """Génère les bundles backend + le fichier INDEX, renvoie la liste de tous les fichiers sources utilisés."""
    all_files: List[Path] = []
    index_lines: List[str] = []

    for name, includes, excludes in BACK_BUNDLES:
        files = select_files_back(base, includes, excludes, MAX_SIZE_BACKEND, dest_dir)
        out_path = dest_dir / f"{name}_Konnaxion backend_{stamp}.txt"
        n = write_bundle_back(base, files, out_path, NO_HEADERS)
        print(f"[backend] {name}: {n} fichiers -> {out_path}")
        index_lines.append(f"{name}\t{n}\t{out_path.name}")
        all_files.extend(files)

    index_filename = dest_dir / f"INDEX_Konnaxion backend_{stamp}.txt"
    index_content = "bundle\tcount\tfile\n" + "\n".join(index_lines) + "\n"
    index_filename.write_text(index_content, encoding="utf-8")
    print(f"[backend] INDEX -> {index_filename}")
    return all_files


def run_backend_all(base: Path, dest_dir: Path, stamp: str, files: List[Path]) -> None:
    """
    Mono-fichier global pour tout le backend, basé uniquement sur
    les fichiers déjà inclus dans les bundles Code_*.
    """
    # déduplication + tri stable par chemin relatif
    unique_files: List[Path] = []
    seen: Set[Path] = set()
    for p in sorted(files, key=lambda q: to_rel(base, q).lower()):
        if p in seen:
            continue
        seen.add(p)
        unique_files.append(p)

    out_path = dest_dir / f"Code_ALL_Konnaxion backend_{stamp}.txt"
    n = write_bundle_back(base, unique_files, out_path, NO_HEADERS)
    print(f"[backend] ALL: {n} fichiers -> {out_path}")


# =============================================================================
# Orchestration globale
# =============================================================================


def main() -> None:
    stamp = datetime.now().strftime(TIMESTAMP_FORMAT)

    # Dossier de destination horodaté
    dest_root = SCRIPT_DIR / f"scan_{stamp}"
    dest_front = dest_root / "frontend"
    dest_back = dest_root / "backend"
    dest_front.mkdir(parents=True, exist_ok=True)
    dest_back.mkdir(parents=True, exist_ok=True)

    print(f"Dossier de sortie : {dest_root}")
    print("---")

    # Frontend
    if FRONTEND_ROOT and FRONTEND_ROOT.exists():
        print(f"[frontend] Racine : {FRONTEND_ROOT}")
        # 1) Génère les groupes et récupère la liste complète des fichiers utilisés
        frontend_files = run_frontend_multi(FRONTEND_ROOT, dest_front, stamp)
        # 2) Génère le ALL uniquement à partir de ces fichiers
        run_frontend_all(FRONTEND_ROOT, dest_front, stamp, frontend_files)
    else:
        print(f"[frontend] Racine introuvable : {FRONTEND_ROOT} (aucun export frontend généré)")

    print("---")

    # Backend
    if BACKEND_ROOT and BACKEND_ROOT.exists():
        print(f"[backend] Racine : {BACKEND_ROOT}")
        # 1) Génère les bundles et récupère la liste complète des fichiers utilisés
        backend_files = run_backend_bundles(BACKEND_ROOT, dest_back, stamp)
        # 2) Génère le ALL uniquement à partir de ces fichiers
        run_backend_all(BACKEND_ROOT, dest_back, stamp, backend_files)
    else:
        print(f"[backend] Racine introuvable : {BACKEND_ROOT} (aucun export backend généré)")


if __name__ == "__main__":
    main()
