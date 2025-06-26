#!/usr/bin/env python3
r"""
bundle_frontend.py –- Concatenate the relevant front-end files of a
Next-js 13/Ant-Design/Tailwind project into a single text bundle.

Usage
------
    # Assume next-enterprisePATH.txt lies next to this script
    python bundle_frontend.py

    # Or specify paths/output explicitly
    python bundle_frontend.py --paths next-enterprisePATH.txt \
                              --out   frontend_bundle.txt
"""
from __future__ import annotations
import argparse
import pathlib
import re
import shutil
import sys
from typing import List

# ---------------------------------------------------------------------------
# 1.  Selection rules --------------------------------------------------------
CODE_EXTS = r"\.(tsx?|jsx?|mjs|cjs|css|json)$"
INCLUDE_RE = re.compile(CODE_EXTS, re.IGNORECASE)

EXCLUDE_RE = re.compile(
    r"([\\/](e2e|tests?|__tests__|coverage|node_modules|\.next|assets|public)"
    r"|\.svg$)",
    re.IGNORECASE,
)

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

# ---------------------------------------------------------------------------
def keep(path: pathlib.Path) -> bool:
    """True = file should be bundled."""
    if str(path).replace("\\", "/").endswith(".storybook/main.ts"):
        return True
    if str(path).replace("\\", "/").endswith(".storybook/preview.ts"):
        return True
    return (
        path.name in ROOT_INCLUDE
        or bool(INCLUDE_RE.search(path.name)) and not EXCLUDE_RE.search(str(path))
    )


def resolve_path(base_dir: pathlib.Path, raw: str) -> pathlib.Path | None:
    """
    Resolve `raw` relative to base_dir; if not found, try with the
    'next-enterprise/' prefix (mirrors the backend helper).
    """
    p = pathlib.Path(raw)
    if not p.is_absolute():
        p = base_dir / p
    if p.exists():
        return p

    alt = base_dir / "next-enterprise" / raw
    return alt if alt.exists() else None


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
        # header – absolute paths kept
        for p in paths:
            out.write(f"{p}\n")
        out.write("\n\n")

        # body – file contents
        for p in paths:
            try:
                with p.open("r", encoding="utf-8") as src:
                    out.write(f"# ==== {p} ====\n")
                    shutil.copyfileobj(src, out)
                    out.write("\n\n")
            except Exception as exc:            # noqa: BLE001
                missing.append(f"{p}: {exc}")

    kept = len(paths) - len(missing)
    print(f"👍  Bundle created: {out_file} ({kept} files)")
    if missing:
        print(f"⚠️  {len(missing)} file(s) missing or unreadable:")
        for m in missing:
            print(f"   - {m}")


def main() -> None:
    default_list = pathlib.Path(__file__).with_name("next-enterprisePATH.txt")

    ap = argparse.ArgumentParser(description="Bundle Next-js front-end sources.")
    ap.add_argument(
        "--paths",
        type=pathlib.Path,
        default=default_list if default_list.exists() else None,
        help="Text file listing project paths (default: next-enterprisePATH.txt).",
    )
    ap.add_argument(
        "--out",
        type=pathlib.Path,
        default="frontend_bundle.txt",
        help="Output concatenation file (default: frontend_bundle.txt).",
    )
    args = ap.parse_args()

    if args.paths is None:
        sys.exit("❌  --paths missing and next-enterprisePATH.txt not found.")

    paths = read_paths(args.paths)
    if not paths:
        sys.exit("❌  No file matched the inclusion rules.")
    bundle(paths, args.out)


if __name__ == "__main__":
    main()
