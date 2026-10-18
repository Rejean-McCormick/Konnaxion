# Overlay Konnaxion — FakePlant 900 (fixture imbriquée v3)

**Cible unique :** `C:\mycode\Konnaxion\Konnaxion` (racine du dépôt).

Extraire le ZIP à cette racine. Les chemins contenus dans l'archive sont relatifs à cette racine.
L'overlay met à jour **un seul fichier Python existant** et ajoute **deux lanceurs**.
Aucun changement automatique à PostgreSQL Neon, aucun import pendant l'extraction.

## Vérification, sans écriture

Double-clic : `PREVIEW_FAKEPLANT_900_KONNAXION.cmd`

Ou, dans PowerShell 7 :

```powershell
cd C:\mycode\Konnaxion\Konnaxion
cd backend
uv run --no-sync python manage.py fakeplant_people
```

Le préflight lit le dossier canonique voisin :
`C:\mycode\Konnaxion\Konnaxion_Worlds\universes\fakeplant\fixture`.
Il valide l'intégrité SHA-256, les **900 personas**, les **2 736 adhésions**,
les **6 Worlds**, puis examine la **base Konnaxion active** (Django/Neon) :
Universe/Worlds actifs et releases promues, comptes existants, collisions,
adhésions existantes divergentes.

**Ne lancez pas l'import tant que l'aperçu n'est pas `[OK]`.**

## Import avec écriture, après sauvegarde Neon

Seulement après validation de l'aperçu et sauvegarde récente confirmée :
`IMPORT_FAKEPLANT_900_KONNAXION.cmd`.
Le lanceur vérifie la base, demande `SAUVEGARDE OK` et
`IMPORTER 900 fakeplant`, puis exécute la commande Django transactionnelle
et relance une vérification en lecture seule.

Important : dans Konnaxion les comptes sont `is_klone=True`,
`is_active=True`, **mot de passe inutilisable**, et
`can_interactive_login=False` (politique applicative).
Contrairement à Orgo, le drapeau Django `is_active` n'est pas `False` :
c'est le statut de **persona synthétique** et la politique d'authentification
qui interdisent l'accès interactif. Aucun SSO commun n'est activé.

Ne modifie ni Orgo, ni Orgo_Worlds, ni les workflows, ni l'IK, ni les rôles
human users existants. Le chemin de la fixture est fixé dans la commande.
