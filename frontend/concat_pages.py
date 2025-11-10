#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
concat_pages.py
Concatène les fichiers Next.js App Router `app/**/page.tsx` dans un .txt avec index (TOC).
Options:
  - par défaut: tous les `app/**/page.tsx`
  - --from-tsc : seulement les pages que `pnpm exec tsc --noEmit` cite dans .next/types (export default manquant)
  - --list <fichier> : liste de chemins (un par ligne)
  - --out <fichier> : nom du .txt de sortie (sinon artifacts/pages_concat_<ts>.txt)
  - --no-headers : supprime les balises BEGIN/END par fichier

Inspiré des conventions d'encodage/TOC de `concat_frontend.py`.
"""

from __future__ import annotations
import argparse
import os
import re
import subprocess
from pathlib import Path
from datetime import datetime
from typing import List, Optional

# ---------- Encodage tolérant (reprend l'approche du script existant) ----------
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
    ctrl = sum(1 for b in sample if b < 32 and b not in (9, 10, 13))
    return (ctrl / max(1, len(sample))) < 0.01

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

# ---------- Collecte ----------
def collect_all_pages(root: Path) -> List[Path]:
    app_dir = root / "app"
    if not app_dir.is_dir():
        return []
    out: List[Path] = []
    for p in app_dir.rglob("page.tsx"):
        if p.is_file():
            out.append(p)
    out.sort(key=lambda q: str(q.relative_to(root)).lower())
    return out

def collect_from_tsc(root: Path) -> List[Path]:
    """
    Parse la sortie de `pnpm exec tsc --noEmit` et remonte les pages mentionnées via:
      .next/types/... typeof import(".../app/.../page")
    + (fallback) lignes directes: app/.../page.tsx:line:col - error TS...
    """
    try:
        proc = subprocess.run(
            ["pnpm", "exec", "tsc", "--noEmit"],
            cwd=str(root),
            capture_output=True,
            text=True,
            check=False,
        )
        lines = (proc.stdout or "") + (proc.stderr or "")
    except FileNotFoundError:
        raise SystemExit("pnpm introuvable dans le PATH. Ouvre un shell à la racine du projet.")

    pages: set[str] = set()

    # Motif .next/types --> typeof import(".../app/.../page")
    re_types = re.compile(r'\.next[\\/]+types[\\/].+?typeof import\(".*?/app/(.+?)/page"\)')
    for line in lines.splitlines():
        m = re_types.search(line)
        if m:
            pages.add(f"app/{m.group(1)}/page.tsx")

    # Motif direct: app/.../page.tsx:<line>:<col> - error TS...
    re_direct = re.compile(r'(app[\\/].+?[\\/]page\.tsx):\d+:\d+\s+-\s+error\s+TS')
    for line in lines.splitlines():
        m = re_direct.search(line)
        if m:
            pages.add(m.group(1).replace("\\", "/"))

    # Filtrer et normaliser
    out: List[Path] = []
    for rel in sorted(pages, key=str.lower):
        p = (root / rel).resolve()
        if p.exists():
            out.append(p)
    return out

def collect_from_list(root: Path, list_file: Path) -> List[Path]:
    if not list_file.exists():
        raise SystemExit(f"Fichier liste introuvable: {list_file}")
    out: List[Path] = []
    for raw in list_file.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        p = (root / line).resolve()
        if p.exists():
            out.append(p)
    out.sort(key=lambda q: str(q.relative_to(root)).lower())
    return out

# ---------- Écriture ----------
def write_concat(root: Path, files: List[Path], out_file: Path, no_headers: bool) -> None:
    out_file.parent.mkdir(parents=True, exist_ok=True)
    rel = lambda p: str(p.relative_to(root)).replace("\\", "/")

    with out_file.open("w", encoding="utf-8", newline="\n") as out:
        out.write(f"===== TOC ({len(files)} fichiers) =====\n")
        for i, p in enumerate(files, 1):
            out.write(f"{i}. {rel(p)}\n")
        out.write("===== END TOC =====\n\n")

        for p in files:
            enc = pick_encoding(p) or "utf-8"
            if not no_headers:
                out.write(f"\n===== BEGIN {rel(p)} =====\n")
            try:
                text = p.read_text(encoding=enc, errors="strict")
            except UnicodeDecodeError:
                text = p.read_text(encoding="latin-1", errors="replace")
            out.write(text)
            if not text.endswith("\n"):
                out.write("\n")
            if not no_headers:
                out.write(f"===== END {rel(p)} =====\n")
            out.write("\n")

# ---------- CLI ----------
def parse_args() -> argparse.Namespace:
    ap = argparse.ArgumentParser(description="Concaténation des app/**/page.tsx avec index (TOC).")
    ap.add_argument("--from-tsc", action="store_true",
                    help="Utilise les pages relevées dans la sortie de `pnpm exec tsc --noEmit`")
    ap.add_argument("--list", type=str, default=None,
                    help="Fichier texte listant des chemins 'app/.../page.tsx' (un par ligne)")
    ap.add_argument("--out", type=str, default=None,
                    help="Chemin du .txt de sortie (défaut: artifacts/pages_concat_<timestamp>.txt)")
    ap.add_argument("--no-headers", action="store_true",
                    help="Supprime les balises BEGIN/END par fichier")
    return ap.parse_args()

def main() -> None:
    args = parse_args()
    root = Path(__file__).resolve().parent

    # Sélection des fichiers
    if args.list:
        files = collect_from_list(root, Path(args.list))
    elif args.from_tsc:
        files = collect_from_tsc(root)
        if not files:
            print("[info] `tsc --noEmit` n'a mentionné aucune page. Bascule sur tous les app/**/page.tsx.")
            files = collect_all_pages(root)
    else:
        files = collect_all_pages(root)

    if not files:
        raise SystemExit("Aucun fichier `app/**/page.tsx` trouvé.")

    # Fichier de sortie
    if args.out:
        out_file = (root / args.out).resolve()
    else:
        stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        out_file = root / "artifacts" / f"pages_concat_{stamp}.txt"

    # Écriture
    write_concat(root, files, out_file, args.no_headers)
    # Résumé
    total_lines = 0
    for p in files:
        try:
            total_lines += len(p.read_text(encoding=pick_encoding(p) or "utf-8", errors="replace").splitlines())
        except Exception:
            pass
    print(f"[OK] {len(files)} fichier(s), {total_lines} ligne(s) -> {out_file}")

if __name__ == "__main__":
    main()
