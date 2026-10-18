# Démarrage Konnaxion — double-clic V3 (local Windows)

**Cible :** `C:\mycode\Konnaxion\Konnaxion` uniquement. Extraire les deux fichiers `START_KONNAXION_UNIVERSES_ONECLICK.cmd` et `.ps1` à la racine du dépôt, **sans** déplacer `universes` et **sans** réextraire les overlays V3 déjà installés.

## Utilisation

**Double-cliquer `START_KONNAXION_UNIVERSES_ONECLICK.cmd`.** Le lanceur vérifie les six Universes et les World Packs imbriqués, valide l'empreinte SHA-256 du moteur `Konnaxion_Worlds` 0.3.7, inspecte le catalogue Django **sans écriture**, exécute `INSTALL_NESTED_UNIVERSES.ps1 -Apply` de manière idempotente (sauvegardes des fichiers de configuration), ouvre les deux serveurs dans des fenêtres distinctes et ouvre l'URL locale dans le navigateur une fois que l'API et Next.js répondent.

La première installation adapte **uniquement** `RUN_backend_local.bat` et `backend/config/settings/local.py`. Les prochaines exécutions ne les réécrivent pas. Le moteur Konnaxion_Worlds est installé par le lanceur backend existant avec `uv`. Aucun dossier Universe ou World existant n'est modifié ou supprimé par le lanceur.

**Attention :** en mode normal, une clé Universe réellement absente de la base, par exemple `konvergence-koali`, sera chargée/promue lors du démarrage. Les cinq clés déjà installées sont ignorées; leur visibilité n'est pas modifiée. Utiliser seulement avec la **base de développement** voulue. Les packs privés restent privés et ne s'affichent pas dans le sélecteur public non connecté.

Si le port 8000 est déjà occupé, le lanceur **refuse de démarrer** plutôt que de remplacer un service. Fermer l'ancienne fenêtre backend avant de double-cliquer. Si le port 3000 est occupé, il choisit automatiquement le premier port libre entre 3001 et 3099; il n'interrompt pas les autres applications.

## Modes facultatifs

Depuis PowerShell 7 à la racine Konnaxion :

```powershell
# Diagnostic totalement en lecture seule : aucun serveur, aucun fichier modifié
.\START_KONNAXION_UNIVERSES_ONECLICK.cmd -CheckOnly

# Démarrer sans créer de nouvel Universe en base
.\START_KONNAXION_UNIVERSES_ONECLICK.cmd -NoAutoload
```

Le format canonique demeure `C:\mycode\Konnaxion\Konnaxion_Worlds\universes\<universe_key>\worlds\<world_key>`. Les dossiers `Konnaxion_Worlds\seed-data` et `Konnaxion_Worlds\fakeplant` isolé sont **anciens**, à auditer avec `MIGRATE_NESTED_CLEANUP.ps1` puis archiver séparément. Le lanceur n'y touche pas.

Le dépôt `konnaxion-universe-seed-standard-v1.1` est obsolète; ne pas le réinstaller. Il peut être supprimé manuellement après validation du catalogue V3; le lanceur ne le supprime pas.

## Limites de validation

Testé hors ligne contre les snapshots datés `znapshot_Konnaxion_10161651.zip`, `znapshot_Konnaxion_Worlds_10161652.zip` et `manag.zip` : intégrité de l'empreinte moteur et six manifests/55 Worlds vérifiées; 22 tests Manager réussis. **L'exécution réelle du lanceur sous Windows, les connexions DB, l'autoload de Konvergence Koali et les pages Next.js ne sont pas encore vérifiés.**
