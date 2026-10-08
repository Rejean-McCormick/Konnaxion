# -*- coding: utf-8 -*-
from pathlib import Path
import shutil, tkinter as tk
from tkinter import messagebox

TARGET = Path('C:\\mycode\\Konnaxion\\Konnaxion\\koali\\verify-konvergence-worlds.py')
BACKUP = Path('C:\\mycode\\Konnaxion\\Konnaxion\\.koali-update-backups\\target-health-backend-path-20261006-181431\\koali\\verify-konvergence-worlds.py')

app = tk.Tk(); app.withdraw()
if not BACKUP.exists():
    messagebox.showerror('Rollback', 'Backup introuvable.')
    raise SystemExit(2)
shutil.copy2(BACKUP, TARGET)
messagebox.showinfo('Rollback', 'Rollback terminé.')
