#!/usr/bin/env python3
r"""
bundle_frontend.py –– Recursively scan and concatenate your
Next.js/Ant-Design/Tailwind front-end sources into one file,
automatically excluding generic folders and file types
(e.g. node_modules, .next, images, lock/env files, IDE dirs, etc.).
"""

from __future__ import annotations
import argparse
import pathlib
import re
import shutil
import sys
from typing import List

# ---------------------------------------------------------------------------
# 1. Selection rules
CODE_EXTS = r"\.(tsx?|jsx?|mjs|cjs|css|json)$"
INCLUDE_RE = re.compile(CODE_EXTS, re.IGNORECASE)

EXCLUDE_RE = re.compile(
    r"([\\/](?:"
      r"e2e|tests?|__tests__|coverage|node_modules|\.next"
      r"|assets|public|dist|out|build|\.cache|logs"
      r"|\.git|\.vscode|\.idea"
    r")"
    r"|(?:^|[\\/])(?:Dockerfile|docker-compose\.ya?ml|\.gitignore|\.dockerignore)$"
    r"|(?:\.(?:svg|png|jpe?g|gif|webp|ico|lock|log|env|ya?ml))$"
    r")",
    re.IGNORECASE,
)

# The one-off files you still want at project root
ROOT_INCLUDE = {
    "next.config.ts",
    "postcss.config.js",
    "tailwind.config.ts",
    "eslint.config.mjs",
    "jest.config.js",
    "jest.setup.js",
    "playwright.config.ts",
    "tsconfig.json",
    ".storybook/main.ts",
    ".storybook/preview.ts",
}

def keep(path: pathlib.Path, root_dir: pathlib.Path) -> bool:
    """
    Return True if this file should be bundled:
      1) Immediately drop anything matching EXCLUDE_RE anywhere in its path.
      2) Whitelist ROOT_INCLUDE only if it lives directly under root_dir.
      3) Otherwise include only if it matches your code extensions.
    """
    rel_str = str(path).replace("\\", "/")

    # 1) Exclude first
    if EXCLUDE_RE.search(rel_str):
        return False

    # 2) Allow root-level whitelisted configs
    try:
        rel = path.relative_to(root_dir)
    except ValueError:
        # outside of root_dir (unlikely), treat as non-whitelisted
        rel = path
    if path.name in ROOT_INCLUDE and len(rel.parts) == 1:
        return True

    # 3) Finally, include only code‐like extensions
    return bool(INCLUDE_RE.search(path.name))

# ---------------------------------------------------------------------------
# 2. Auto‐discover
def scan_paths(root_dir: pathlib.Path) -> List[pathlib.Path]:
    """
    Walk `root_dir` recursively, returning every file for which keep() is True.
    """
    return [
        p
        for p in root_dir.rglob("*")
        if p.is_file() and keep(p, root_dir)
    ]

# ---------------------------------------------------------------------------
def bundle(paths: List[pathlib.Path], out_file: pathlib.Path) -> None:
    missing: list[str] = []
    with out_file.open("w", encoding="utf-8") as out:
        # Header: absolute paths
        for p in paths:
            out.write(f"{p}\n")
        out.write("\n\n")

        # Body: file contents
        for p in paths:
            try:
                with p.open("r", encoding="utf-8") as src:
                    out.write(f"# ==== {p} ====\n")
                    shutil.copyfileobj(src, out)
                    out.write("\n\n")
            except Exception as exc:
                missing.append(f"{p}: {exc}")

    kept = len(paths) - len(missing)
    print(f"👍 Bundle created: {out_file} ({kept} files)")
    if missing:
        print(f"⚠️ {len(missing)} file(s) unreadable:")
        for m in missing:
            print(f"   - {m}")

# ---------------------------------------------------------------------------
def main() -> None:
    ap = argparse.ArgumentParser(
        description="Bundle Next.js front-end sources (auto-scan + strict exclusion)."
    )
    ap.add_argument(
        "--out",
        type=pathlib.Path,
        default="frontend_bundle.txt",
        help="Output file (default: frontend_bundle.txt)",
    )
    args = ap.parse_args()

    # Locate project root: prefer next-enterprise/ if present
    script_dir = pathlib.Path(__file__).parent
    proj_root = script_dir / "next-enterprise"
    if not proj_root.exists():
        proj_root = script_dir

    paths = scan_paths(proj_root)
    if not paths:
        sys.exit("❌ No files matched inclusion rules (check your paths/exclusions).")

    bundle(paths, args.out)

if __name__ == "__main__":
    main()
