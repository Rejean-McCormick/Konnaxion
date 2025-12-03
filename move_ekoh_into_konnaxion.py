#!/usr/bin/env python
"""
Move Ekoh & Smart Vote apps into Konnaxion backend.

Assumes project root is:
    C:\MyCode\Konnaxionv14

Source:
    TOMOVEINKONNAXION-EKOH\modules\ekoh-smartvote\ekoh
    TOMOVEINKONNAXION-EKOH\modules\ekoh-smartvote\smart_vote

Destination:
    backend\konnaxion\ekoh
    backend\konnaxion\smart_vote
"""

from pathlib import Path
import shutil
import sys

# Adjust this if your root is different
PROJECT_ROOT = Path(r"C:\MyCode\Konnaxionv14")

SRC_BASE = PROJECT_ROOT / "TOMOVEINKONNAXION-EKOH" / "modules" / "ekoh-smartvote"
DST_BASE = PROJECT_ROOT / "backend" / "konnaxion"

APP_MAPPING = {
    "ekoh": DST_BASE / "ekoh",
    "smart_vote": DST_BASE / "smart_vote",
}

# Change this to False if you want to test behavior without actually moving files
DO_MOVE = True


def move_tree(src_dir: Path, dst_dir: Path) -> None:
    if not src_dir.exists():
        print(f"[ERROR] Source directory not found: {src_dir}")
        return

    print(f"[INFO] Moving from {src_dir} -> {dst_dir}")

    # Make sure destination exists
    dst_dir.mkdir(parents=True, exist_ok=True)

    # Walk all files under src_dir and move them one by one,
    # preserving relative paths.
    for item in src_dir.rglob("*"):
        rel = item.relative_to(src_dir)
        target = dst_dir / rel

        if item.is_dir():
            # Ensure directory exists at destination
            target.mkdir(parents=True, exist_ok=True)
            continue

        target.parent.mkdir(parents=True, exist_ok=True)

        if DO_MOVE:
            # Use move to avoid leaving duplicate files
            print(f"[MOVE] {item} -> {target}")
            shutil.move(str(item), str(target))
        else:
            # Dry-run (or copy mode if you switch to copy2)
            print(f"[DRY] Would move {item} -> {target}")


def main() -> int:
    if not PROJECT_ROOT.exists():
        print(f"[ERROR] PROJECT_ROOT does not exist: {PROJECT_ROOT}")
        return 1

    print(f"[INFO] Project root: {PROJECT_ROOT}")
    print(f"[INFO] Source base:  {SRC_BASE}")
    print(f"[INFO] Dest base:    {DST_BASE}")
    print(f"[INFO] DO_MOVE = {DO_MOVE}")

    for app_name, dst_dir in APP_MAPPING.items():
        src_dir = SRC_BASE / app_name
        move_tree(src_dir, dst_dir)

    print("[INFO] Done.")
    print("[INFO] Now update Django settings (INSTALLED_APPS), URLs, and run migrations.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
