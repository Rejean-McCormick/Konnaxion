#!/usr/bin/env python3
"""Fail if Konnaxion starts owning the Universe/World engine again."""
from __future__ import annotations

from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parents[1]
FORBIDDEN = (
    ROOT / "backend" / "konnaxion" / "worlds",
    ROOT / "docs" / "Technical-Reference" / "Worlds",
)

# These host surfaces are intentionally allowed: they integrate with the separately
# versioned engine without becoming its canonical owner.
ALLOWED_HOST_SURFACES = (
    ROOT / "backend" / "config" / "world_adapters.py",
    ROOT / "backend" / "config" / "world_urls.py",
    ROOT / "frontend" / "lib" / "worlds.ts",
    ROOT / "frontend" / "components" / "worlds",
)


def main() -> int:
    violations = [path for path in FORBIDDEN if path.exists()]
    if violations:
        print("Konnaxion Universe/World ownership violation:")
        for path in violations:
            print(f"  - forbidden local engine/spec surface: {path.relative_to(ROOT)}")
        print("Canonical owner: sibling repository/package Konnaxion_Worlds.")
        return 1

    print("Konnaxion Universe/World ownership: PASS")
    print("  canonical owner: Konnaxion_Worlds")
    print("  host adapters/navigation may remain in Konnaxion")
    return 0


if __name__ == "__main__":
    sys.exit(main())
