# Overlay : Konnaxion (application principale)

Dézipper à la **racine de Konnaxion**. Prérequis: dépôt frère `Konnaxion_Worlds` avec son overlay.

1. `FAKEPLANT_TEST.cmd` : vérifie les fichiers nécessaires, sans écritures.
2. `python tools/fakeplant/sync_from_worlds.py --apply` : copie 13 fichiers de seeds FakePlant depuis `../Konnaxion_Worlds` dans `backend/seed-data/` (pas d'autres univers). Si un fichier FakePlant diffère, refuse sans `--replace-fakeplant`.
3. Après démarrage de la base et vérifications Django : `cd backend` puis `python manage.py worlds_apply_universe fakeplant --pack-version 1.0.0 --promote` (écrit réellement en base).
4. Prévisualiser identités : `python manage.py fakeplant_people` ; pour activer l'import des **900 comptes non connectables et leurs appartenances**, après promotion : `python manage.py fakeplant_people --apply --confirm-fakeplant`.

Les identités sont toutes fictives, inutilisables pour se connecter; aucune session, aucun mot de passe. L'état de keenKonnect reste pour l'instant une fixture du Kristal, **pas importé automatiquement**. Ce script ne réalise pas un detach/reattach Kristal.
