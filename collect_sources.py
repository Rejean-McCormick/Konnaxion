# -*- coding: utf-8 -*-
r"""
Collecte et concaténation de sources Frontend et Backend.
- Parcourt C:\MyCode\Konnaxionv14
- Cherche les fichiers listés (chemin exact puis fallback par nom)
- Concatène le contenu avec séparateurs
- Masque les valeurs des fichiers .env

Sorties:
  - frontend_bundle.txt
  - backend_bundle.txt
  - frontend_missing.txt
  - backend_missing.txt
"""

from pathlib import Path
import re
import sys

# Racine du projet
BASE_DIR = Path(r"C:\MyCode\Konnaxionv14")

# ---------- Cibles ----------
FRONTEND_TARGETS = [
    r"frontend\env.mjs",
    r"frontend\next.config.ts",
    r"frontend\package.json",
    r"frontend\tsconfig.json",
    r"frontend\postcss.config.js",
    r"frontend\prettier.config.js",
    r"frontend\routes.json",
    r"frontend\hooks\usePageTitle.ts",
    r"frontend\shared\api.ts",
    r"frontend\services\_request.ts",
    r"frontend\services\admin.ts",
    r"frontend\services\decide.ts",
    r"frontend\services\decide.mock.ts",
    r"frontend\services\deliberate.ts",
    r"frontend\services\impact.ts",
    r"frontend\services\learn.ts",
    r"frontend\services\pulse.ts",
    r"frontend\services\trust.ts",
    r"frontend\shared\services\admin.ts",
    r"frontend\shared\services\search.ts",
]

BACKEND_TARGETS = [
    r".envs\.local\.django",
    r".envs\.local\.postgres",
]

# ---------- Utilitaires ----------
SEP = "\n" + "=" * 80 + "\n"
HEADER_TMPL = "BEGIN FILE: {relpath}\n" + "-" * 80 + "\n"
FOOTER_TMPL = "\n" + "-" * 80 + "\nEND FILE: {relpath}\n"

ENV_LINE_RE = re.compile(r"^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$")

TEXT_EXT = {
    ".ts", ".tsx", ".js", ".jsx", ".json", ".mjs", ".cjs",
    ".css", ".scss", ".sass",
    ".py", ".env", ".txt", ".yml", ".yaml", ".ini",
    ".md",
}

def is_text_file(p: Path) -> bool:
    if p.suffix.lower() in TEXT_EXT or p.name.startswith(".env"):
        return True
    # Heuristique légère
    try:
        sample = p.open("rb").read(2048)
    except Exception:
        return False
    return b"\x00" not in sample

def mask_env_content(text: str) -> str:
    out_lines = []
    for line in text.splitlines():
        if line.strip().startswith("#") or not line.strip():
            out_lines.append(line)
            continue
        m = ENV_LINE_RE.match(line)
        if not m:
            out_lines.append(line)
            continue
        key = m.group(1)
        out_lines.append(f"{key}=***REDACTED***")
    return "\n".join(out_lines) + "\n"

def read_text_file(p: Path, redact_env: bool) -> str:
    if not is_text_file(p):
        return "[[BINARY_OR_NON_TEXT_FILE_SKIPPED]]\n"
    try:
        raw = p.read_text(encoding="utf-8", errors="replace")
    except UnicodeDecodeError:
        raw = p.read_text(encoding="cp1252", errors="replace")
    return mask_env_content(raw) if redact_env else raw

def emit_section(p: Path, base: Path, redact_env: bool) -> str:
    rel = p.relative_to(base)
    header = HEADER_TMPL.format(relpath=str(rel))
    body = read_text_file(p, redact_env=redact_env)
    footer = FOOTER_TMPL.format(relpath=str(rel))
    return header + body + footer

def find_file_fallback(name_or_rel: str, base: Path) -> Path | None:
    # 1) chemin exact
    candidate = base / Path(name_or_rel)
    if candidate.exists():
        return candidate.resolve()

    # 2) recherche par nom partout
    target_name = Path(name_or_rel).name.lower()
    # tri pour stabilité
    for p in sorted(base.rglob("*")):
        if p.is_file() and p.name.lower() == target_name:
            return p.resolve()
    return None

def collect_and_write(targets: list[str], out_txt: Path, missing_txt: Path, redact_env_for: list[str] | None = None):
    redact_env_for = redact_env_for or []
    chunks: list[str] = []
    missing: list[str] = []

    for rel in targets:
        found = find_file_fallback(rel, BASE_DIR)
        if not found:
            missing.append(rel)
            continue

        # Redact si visé explicitement ou si le nom ressemble à .env
        redact = any(rel.replace("/", "\\").endswith(env_rel) for env_rel in redact_env_for)
        redact = redact or found.name.startswith(".env")

        chunks.append(emit_section(found, BASE_DIR, redact_env=redact))

    out_txt.write_text(SEP.join(chunks) + ("\n" if chunks else ""), encoding="utf-8")
    missing_txt.write_text("\n".join(missing) + ("\n" if missing else ""), encoding="utf-8")

def main():
    if not BASE_DIR.exists():
        print(f"Base introuvable: {BASE_DIR}", file=sys.stderr)
        sys.exit(1)

    frontend_out = BASE_DIR / "frontend_bundle.txt"
    backend_out = BASE_DIR / "backend_bundle.txt"
    frontend_missing = BASE_DIR / "frontend_missing.txt"
    backend_missing = BASE_DIR / "backend_missing.txt"

    collect_and_write(
        FRONTEND_TARGETS,
        out_txt=frontend_out,
        missing_txt=frontend_missing,
        redact_env_for=[],
    )

    collect_and_write(
        BACKEND_TARGETS,
        out_txt=backend_out,
        missing_txt=backend_missing,
        redact_env_for=BACKEND_TARGETS,
    )

    print("OK")
    print(frontend_out)
    print(backend_out)
    print(frontend_missing)
    print(backend_missing)

if __name__ == "__main__":
    main()
