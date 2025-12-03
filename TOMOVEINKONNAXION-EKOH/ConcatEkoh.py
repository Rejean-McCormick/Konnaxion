#!/usr/bin/env python
"""
Concatenate relevant Ekoh code into a single timestamped text file.

Output file name example:
    concatEkoh_20251202_143015.txt
created at the project root.
"""

from pathlib import Path
from datetime import datetime
import os

# Root of the project
ROOT = Path(r"C:\MyCode\Konnaxionv14\TOMOVEINKONNAXION-EKOH")

# Directories to skip completely (by name, anywhere in the tree)
EXCLUDE_DIR_NAMES = {
    ".git",
    ".github",
    "__pycache__",
    ".idea",
    ".vscode",
    "docs",
    "infra",
    "charts",
    "fixtures",
    "migrations",
    "tests",
}

# Files to skip (by file name, anywhere)
EXCLUDE_FILE_NAMES = {
    ".pre-commit-config.yaml",
    "docker-compose.dev.yml",
    "Dockerfile.dev",
    "Makefile",
    "paths.txt",
    "pyproject.toml",
    "README.md",
    "ruff.toml",
    "ToDo (instructions).txt",
}

# Common binary / non-text file extensions to avoid
BINARY_EXTS = {
    ".pyc", ".pyo", ".pyd",
    ".exe", ".dll", ".so",
    ".png", ".jpg", ".jpeg", ".gif", ".bmp", ".ico",
    ".pdf", ".zip", ".tar", ".gz", ".7z",
}


def is_binary_path(path: Path) -> bool:
    return path.suffix.lower() in BINARY_EXTS


def main() -> None:
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_file = ROOT / f"concatEkoh_{timestamp}.txt"

    with out_file.open("w", encoding="utf-8") as out:
        for dirpath, dirnames, filenames in os.walk(ROOT):
            dirpath = Path(dirpath)

            # Prune excluded directories in-place so os.walk won't descend into them
            dirnames[:] = [
                d for d in dirnames
                if d not in EXCLUDE_DIR_NAMES
            ]

            for fname in filenames:
                if fname in EXCLUDE_FILE_NAMES:
                    continue

                file_path = dirpath / fname

                # Skip the output file itself if script is re-run
                if file_path == out_file:
                    continue

                if is_binary_path(file_path):
                    continue

                try:
                    text = file_path.read_text(encoding="utf-8", errors="ignore")
                except Exception:
                    # If anything goes wrong reading the file, skip it
                    continue

                rel = file_path.relative_to(ROOT).as_posix()

                out.write(f"\n\n===== BEGIN {rel} =====\n\n")
                out.write(text)
                out.write(f"\n\n===== END {rel} =====\n")


if __name__ == "__main__":
    main()
