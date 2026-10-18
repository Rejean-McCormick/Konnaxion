# FakePlant — intégration Konnaxion (layout imbriqué v3)

**Source canonique du pack :**
`C:\mycode\Konnaxion\Konnaxion_Worlds\universes\fakeplant\`
avec `universe.yaml` et six dossiers sous `worlds/`.

Le précédent overlay copiait 13 fichiers de `Konnaxion_Worlds` vers
`Konnaxion/backend/seed-data/` via `tools/fakeplant/sync_from_worlds.py`.
Cette **procédure historique n'est plus l'installation canonique en v3** : ne
relance pas la copie juste pour faire apparaître FakePlant.

Dans la base testée précédemment, `fakeplant` était déjà **actif, privé, avec
six Worlds privés, release courante r1**. Le nouveau chargeur v3 saute les
clés déjà enregistrées et ne change donc ni sa visibilité ni ses releases.
La visibilité des utilisateurs du navigateur dépend des permissions/API.

Pour vérifier après la configuration v3 (lecture seule), depuis `backend` :

```powershell
uv run --no-sync python tools\universe_autoload.py
uv run --no-sync python manage.py check
```

Pour mettre à jour un Universe **déjà installé**, utiliser une action explicite
et confirmée du Manager (`Load / Apply + Promote`), après validation et sauvegarde
de la base. La découverte automatique de nouvelles clés n'est **pas** un moteur
de mise à jour continue des Universes existants.

L'import des 900 comptes/personas synthétiques est **distinct** de la création
de l'Universe/Worlds et n'est pas réalisé par ce chargeur. Les projets keenKonnect
restent des fixtures tant que leur import réel n'est pas validé. Ce mécanisme
ne constitue pas un aller-retour complet de Kristal.

Voir `docs/Technical-Reference/UNIVERSES_NESTED_LOCAL_V3.md`.
