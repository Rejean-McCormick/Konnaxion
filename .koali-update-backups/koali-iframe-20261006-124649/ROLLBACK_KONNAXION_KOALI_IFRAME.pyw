# -*- coding: utf-8 -*-
from pathlib import Path
import hashlib, shutil, tkinter as tk
from tkinter import messagebox

ROOT = Path(r"C:\mycode\Konnaxion\Konnaxion")
BACKUP = Path(r"C:\mycode\Konnaxion\Konnaxion\.koali-update-backups\koali-iframe-20261006-124649")
PATCHED = {'frontend/middleware.ts': '6d34eaa3630a52c31ceb0151502b7089a26ad9b91288cc2e9380f901992a536d', 'koali.integration.json': '1d1d939baeafd94b38a0b9644aebf186e951d9678a422ed95da40506b9ba3880'}

def digest(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

app = tk.Tk()
app.withdraw()

conflicts = []
for rel, expected in PATCHED.items():
    p = ROOT / rel
    if not p.exists() or digest(p) != expected:
        conflicts.append(rel)

if conflicts:
    messagebox.showerror(
        "Rollback Konnaxion Koali iframe",
        "Rollback refusé : fichiers modifiés après le hotfix :\n\n" + "\n".join(conflicts),
    )
    raise SystemExit(2)

for rel in PATCHED:
    src = BACKUP / rel
    dst = ROOT / rel
    dst.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, dst)

messagebox.showinfo("Rollback Konnaxion Koali iframe", "Rollback terminé.")
