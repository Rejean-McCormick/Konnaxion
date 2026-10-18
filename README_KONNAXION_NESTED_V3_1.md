# Konnaxion — V3.1 host + docs (nested Universes)

Ce ZIP **cible uniquement** `C:\mycode\Konnaxion\Konnaxion`.
Base documentaire : snapshot `znapshot_Konnaxion_10161624.zip`.

Inclus : les **4 fichiers** techniques de l'overlay hôte V3 inchangés et
les six documents Konnaxion mis à jour (dont un guide opérationnel neuf).
Le code technique correspond au V3 précédent, sans modification du moteur
propriétaire `Konnaxion_Worlds`.

**Prérequis obligatoire :** overlay sibling Konnaxion_Worlds V3 avec 6 Universes,
55 Worlds et distribution moteur **0.3.7**, et sauvegarde des modifications
locales éventuelles. `WORLD_ENGINE.lock.json` correspond au moteur publié dans
cet overlay; ne l'appliquer jamais sans le sibling assorti.

L'extraction remplace `WORLD_ENGINE.lock.json`, `README.md`, `AGENTS.md`,
`FAKEPLANT_LIRE_MOI.md` et deux documents techniques existants ; faire une
sauvegarde ou inspecter `git diff` avant d'extraire si les fichiers ont évolué
depuis le snapshot. L'installateur de démarrage fait ses **propres sauvegardes**
avant de modifier `RUN_backend_local.bat` et `local.py`.

```powershell
cd C:\mycode\Konnaxion\Konnaxion
# AVANT TOUTE MODIFICATION DE CONFIGURATION : prévisualisation
pwsh -NoProfile -File .\INSTALL_NESTED_UNIVERSES.ps1
# après inspection : configure le lanceur et settings local, PAS la base
pwsh -NoProfile -File .\INSTALL_NESTED_UNIVERSES.ps1 -Apply
# vérifier la configuration sans autochargement en DB
$env:KX_AUTOLOAD_NEW_UNIVERSES='0'
.\RUN_backend_local.bat
```

Guide à jour : `docs/Technical-Reference/UNIVERSES_NESTED_LOCAL_V3.md`.
Aucun Universe n'est chargé par l'extraction de ce ZIP.
