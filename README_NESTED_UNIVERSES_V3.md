# Konnaxion — autoload des Universes imbriqués v3

Source unique `../Konnaxion_Worlds/universes/<key>/universe.yaml` et `worlds/` sous chaque Universe. Nécessite le moteur `konnaxion-worlds==0.3.7` et le verrou `WORLD_ENGINE.lock.json` livré ici.

Installer d'abord le ZIP **Konnaxion_Worlds**, puis le ZIP **Konnaxion**, puis le ZIP **Manager**.

```powershell
cd C:\mycode\Konnaxion\Konnaxion
pwsh -NoProfile -File .\INSTALL_NESTED_UNIVERSES.ps1
pwsh -NoProfile -File .\INSTALL_NESTED_UNIVERSES.ps1 -Apply
```

Ce dernier installe des variables de découverte dans `RUN_backend_local.bat` et `backend/config/settings/local.py` avec sauvegardes. **Il ne touche pas à la base.** La racine canonique est utilisée même avec `uv run` depuis le backend, et la production n'est pas modifiée.

### Vérifier AVANT l'écriture en base

Démarrer ou garder arrêté le serveur. Dans `backend`, après la première réinstallation du moteur v0.3.7 par le lanceur :

```powershell
uv run --no-sync python manage.py check
uv run --no-sync python tools\universe_autoload.py
```

Le rapport doit montrer **6 Universes et 55 Worlds**, **SKIP** sur les cinq enregistrés, et éventuellement **NEW** pour `konvergence-koali` (si non encore installé).

`RUN_backend_local.bat` exécute `--apply-new` après les migrations; par défaut il chargera **seulement les nouvelles clés** (écriture réelle dans la DB). Pour forcer le mode audit au démarrage avant une première validation Windows :

```powershell
$env:KX_AUTOLOAD_NEW_UNIVERSES='0'
.\RUN_backend_local.bat
```

Le premier démarrage réel peut être plus long si un nouvel Universe contient plusieurs Worlds; si la validation échoue, le backend ne démarre pas sur un catalogue incohérent. Les 5 Universes déjà installés sont conservés tels quels.

**Ne pas modifier `WORLD_ENGINE.lock.json` séparément**; la version 0.3.7 et l'empreinte du moteur doivent rester alignées.
