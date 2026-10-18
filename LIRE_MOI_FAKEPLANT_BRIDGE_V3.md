# Konnaxion — FakePlant 900, garde-fou de collisions V3

**Racine de destination :** `C:\mycode\Konnaxion\Konnaxion`

Corrige seulement `backend/konnaxion/ethikos/management/commands/fakeplant_people.py` du correctif V2. Les lanceurs V2 restent inchangés.

## Pourquoi

Le diagnostic Neon a trouvé 75 utilisateurs `w<world-id>r<release-id>__demo_fp_...__<hash>` correspondant à 38 emails FakePlant. Le code Konnaxion_Worlds produit ces noms pour les `WorldPersonaBridge` des releases. Ce sont des comptes techniques **distincts** du compte canonique `demo_fp_...` à importer. Ils ne doivent être ni renommés, ni fusionnés, ni supprimés.

## Garde-fou

Une collision n'est tolérée qu'avec une correspondance complète et unique `WorldPersonaBridge` en base, liée à l'un des 6 Worlds de l'Universe FakePlant, avec une release cohérente, le bon utilisateur FakePlant, un nom de bridge déterministe (SHA256 calculé depuis `source_key`), et aucun droit de connexion. Sinon, import refusé. Le contrôle est répété dans la transaction avant toute insertion.

## Installation (code seulement, pas d'écriture Neon)

Extraire l'archive à la racine du dépôt, en remplaçant **uniquement** le fichier de commande listé plus haut. Conserver les lanceurs V2.

### Aperçu, lecture seule

```powershell
cd C:\mycode\Konnaxion\Konnaxion
.\PREVIEW_FAKEPLANT_900_KONNAXION.cmd
```

La sortie affiche `COURRIELS FAKEPLANT : N clones techniques de release verifies, M collisions non autorisees`. Ne poursuivre que si `N=75`, `M=0`, `6/6 Worlds`, et `0/900` comptes déjà présents. Les 75 clones peuvent rester en place.

**Important :** n'exécuter aucun import tant qu'un préflight réel réussi et une sauvegarde actuelle de Neon ne sont pas confirmés. En cas d'échec, ne contourner aucun garde-fou; transmettre les motifs.

Ce correctif ne crée pas de comptes, n'active pas le SSO et ne touche pas à Orgo.
