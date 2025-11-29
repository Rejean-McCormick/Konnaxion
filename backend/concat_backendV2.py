#!/usr/bin/env python3
# FILE: backend/concat_backendV2.py
"""
concat_series.py
Génère plusieurs .txt de code avec une TOC en tête de chaque fichier :
  - Code_config_Konnaxion backend_<stamp>.txt
  - Code_core_Konnaxion backend_<stamp>.txt
  - Code_apps_Konnaxion backend_<stamp>.txt
  - Code_migrations_Konnaxion backend_<stamp>.txt
  - Code_tests_Konnaxion backend_<stamp>.txt
  - Code_templates_Konnaxion backend_<stamp>.txt
  - Code_celery_Konnaxion backend_<stamp>.txt
  - Code_deploy_Konnaxion backend_<stamp>.txt
  - INDEX_Konnaxion backend_<stamp>.txt

Usage :
  python concat_series.py
  python concat_series.py -o ai_txt --no-headers --max-size 5000000

Notes :
- La TOC est toujours écrite en tête. --no-headers n’affecte que les entêtes BEGIN/END par fichier.
"""
from __future__ import annotations
import argparse, fnmatch, os, sys
from pathlib import Path
from datetime import datetime
from typing import Iterable, List, Set, Optional

ALLOWED_EXTS: Set[str] = {
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
NAMES_WITHOUT_EXT: Set[str] = {
    "Dockerfile", "Makefile", "CMakeLists.txt",
    ".gitignore", ".gitattributes", ".editorconfig",
    "Procfile", "requirements.txt", "Pipfile", "poetry.lock",
    "package.json", "package-lock.json", "yarn.lock", "pnpm-lock.yaml",
    "tsconfig.json", ".eslintrc", ".prettierrc", "eslint.config.js",
}
EXCLUDE_DIRS: Set[str] = {
    ".git", ".hg", ".svn",
    "node_modules", ".next", ".nuxt",
    "dist", "build", "out", "coverage", ".cache",
    ".venv", "venv", "__pycache__",
    "target", "bin", "obj",
}
# Bundles alignés avec l’arborescence fournie.
BUNDLES = (
    ("Code_config", ["config/**"], []),
    ("Code_core",
     ["manage.py", "pyproject.toml", "docker-compose.*.yml", "README.*",
      ".pre-commit-config.yaml", "merge_production_dotenvs_in_dotenv.py", "requirements/*.txt"],
     []),
    ("Code_apps",
     ["konnaxion/**"],
     ["konnaxion/**/migrations/**", "konnaxion/**/tests/**", "konnaxion/**/templates/**",
      "tests/**", "**/tests.py"]),
    ("Code_migrations", ["**/migrations/**"], []),
    ("Code_tests", ["tests/**", "**/tests/**", "**/test_*.py", "**/*_test.py", "**/tests.py"], []),
    ("Code_templates", ["konnaxion/templates/**"], []),
    ("Code_celery", ["config/celery_app.py", "konnaxion/**/tasks.py"], []),
    ("Code_deploy", ["docker-compose.*.yml", "Dockerfile", "README.*", ".pre-commit-config.yaml"], []),
)

TEST_EXCLUDES = ["tests/**", "**/tests/**", "**/tests.py", "**/test_*.py", "**/*_test.py"]
OUT_EXCLUDES = ["Code_*.txt"]  # évite de se reprendre lui-même

def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Concatène le code en plusieurs .txt avec TOC.")
    ap.add_argument("-b", "--base", default=".", help="Racine du projet")
    ap.add_argument("-o", "--outdir", default="ai_txt", help="Dossier de sortie")
    ap.add_argument("--no-headers", action="store_true", help="Sans entêtes BEGIN/END par fichier")
    ap.add_argument("--max-size", type=int, default=2_000_000, help="Taille max source (octets)")
    ap.add_argument("--stamp", default=None, help="Horodatage AAAAMMJJ_HHMMSS")
    return ap.parse_args()

def to_rel(base: Path, p: Path) -> str:
    try:
        r = p.relative_to(base)
    except Exception:
        r = p
    return str(r).replace("\\", "/")

def is_text_file(path: Path) -> bool:
    if path.suffix.lower() in ALLOWED_EXTS or path.name in NAMES_WITHOUT_EXT:
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

def pick_encoding(path: Path) -> Optional[str]:
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

def select_files(base: Path, includes: List[str], excludes: List[str],
                 max_size: int, out_dir: Path) -> List[Path]:
    chosen: List[Path] = []
    for root, dirs, files in os.walk(base, followlinks=False):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and (Path(root) / d) != out_dir]
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
            if not is_text_file(p):
                continue
            chosen.append(p)
    chosen.sort(key=lambda q: to_rel(base, q).lower())
    return chosen

def write_toc(out_fp, files: List[Path]) -> None:
    out_fp.write(f"===== TOC ({len(files)} fichiers) =====\n")
    for i, p in enumerate(files, 1):
        try:
            full = str(p.resolve())
        except Exception:
            full = str(p.absolute())
        out_fp.write(f"{i:04d}  {full}\n")
    out_fp.write("===== END TOC =====\n\n")

def write_bundle(base: Path, files: List[Path], out_path: Path, no_headers: bool) -> int:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    n = 0
    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        # TOC en tête
        write_toc(out, files)
        # Corps concaténé
        for p in files:
            enc = pick_encoding(p) or "utf-8"
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

def main() -> None:
    args = parse_args()
    base = Path(args.base).resolve()
    outdir = Path(args.outdir).resolve()
    outdir.mkdir(parents=True, exist_ok=True)
    stamp = args.stamp or datetime.now().strftime("%Y%m%d_%H%M%S")

    index_lines = []
    for name, includes, excludes in BUNDLES:
        files = select_files(base, includes, excludes, args.max_size, outdir)
        # Ajout de "Konnaxion backend" dans le nom de chaque fichier bundle
        out_path = outdir / f"{name}_Konnaxion backend_{stamp}.txt"
        n = write_bundle(base, files, out_path, args.no_headers)
        print(f"[+] {name}: {n} fichiers -> {out_path}")
        index_lines.append(f"{name}\t{n}\t{out_path.name}")

    # Ajout de "Konnaxion backend" dans le nom du fichier d’index
    index_filename = f"INDEX_Konnaxion backend_{stamp}.txt"
    (outdir / index_filename).write_text(
        "bundle\tcount\tfile\n" + "\n".join(index_lines) + "\n",
        encoding="utf-8",
    )

if __name__ == "__main__":
    main()
