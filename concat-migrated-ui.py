#!/usr/bin/env python3
"""
concat_migrated_ui.py
---------------------
Concatène le contenu de tous les fichiers UI migrés dans un seul fichier texte.

• Parcourt :
    C:\MonCode\KonnaxionV14\next-enterprise
      ├─ modules\<domaine>\**
      ├─ modules\<domaine>\legacy-pages\**
      └─ <dossier global>\**

• Insère pour chaque fichier :
    ===== chemin/relatif =====
    (contenu)
    <ligne vide>

• Écrit le résultat dans :
    C:\MonCode\KonnaxionV14\migrated_ui_dump.txt
"""

from pathlib import Path

# --------------------------------------------------------------------
# Configurable :
# --------------------------------------------------------------------
BASE     = Path(r"C:\MonCode\KonnaxionV14\next-enterprise")
OUTFILE  = Path(r"C:\MonCode\KonnaxionV14\migrated_ui_dump.txt")

DOMAINS  = ["ekoh", "ethikos", "keenkonnect", "konnected", "kreative"]
GLOBALS  = ["components", "context", "hooks", "services",
            "theme", "routes", "public"]

TEXT_EXT = {
    ".ts", ".tsx", ".js", ".jsx", ".json",
    ".css", ".scss", ".md", ".html", ".txt",
    ".yml", ".yaml", ".svg"
}

# --------------------------------------------------------------------
# Collecte des chemins à concaténer
# --------------------------------------------------------------------
def iter_migrated_files():
    # Domaines
    for d in DOMAINS:
        for sub in [BASE / "modules" / d,
                    BASE / "modules" / d / "legacy-pages"]:
            if sub.exists():
                yield from (f for f in sub.rglob("*")
                            if f.is_file() and f.suffix.lower() in TEXT_EXT)

    # Dossiers globaux
    for g in GLOBALS:
        sub = BASE / g
        if sub.exists():
            yield from (f for f in sub.rglob("*")
                        if f.is_file() and f.suffix.lower() in TEXT_EXT)

# --------------------------------------------------------------------
# Concaténation
# --------------------------------------------------------------------
with OUTFILE.open("w", encoding="utf8") as out:
    for fpath in iter_migrated_files():
        rel = fpath.relative_to(BASE).as_posix()
        out.write(f"===== {rel} =====\n")
        # lit en UTF-8 en ignorant les erreurs d’encodage ponctuelles
        content = fpath.read_text(encoding="utf8", errors="ignore")
        out.write(content)
        out.write("\n\n")

print("Fichier créé :", OUTFILE)
