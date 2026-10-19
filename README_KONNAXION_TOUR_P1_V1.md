# Tournée kOA Tandem — Konnaxion P1 V1

**Cible**: `C:\mycode\Konnaxion\Konnaxion` (la racine qui contient `backend/`).

## Lancement en PS7

```powershell
cd 'C:\mycode\Konnaxion\Konnaxion'
.\PREVIEW_KONNAXION_TOUR_P1.cmd
.\INSTALL_KONNAXION_TOUR_P1.cmd
.\VERIFY_KONNAXION_TOUR_P1.cmd
```

**Retour arrière**: `ROLLBACK_KONNAXION_TOUR_P1.cmd`.

## Portée exacte

- `COMMON_OIDC_ALLOW_AUTO_SIGNUP=false` : quand OIDC est activé plus tard, l'inscription sociale automatique est refusée par défaut. L'inscription Django locale reste gouvernée par `DJANGO_ACCOUNT_ALLOW_REGISTRATION`. Aucune fusion par email ni privilèges OIDC ajoutés.
- `IK_ORGO_ALLOWED_ORGANIZATION` : borne facultative mais **nécessaire pour qualifier le token dans le profil FakePlant à tenant unique**. Une fois définie sur le UUID Orgo FakePlant dans le `.env` existant, les impacts d'une autre organisation sont refusés avant persistance. Le script d'installation **ne change pas** `.env`.
- Tests Django natifs ajoutés (exécution différée jusqu'à environnement de test isolé).
- Audit et handoff ajoutés à `docs/Technical-Reference/TANDEM_TOUR_KONNAXION_2026-10-18.md`.

## Ce que le pack ne fait PAS

N'active pas le SSO, n'inscrit aucun humain, ne connecte pas Konfid, ne rejoue pas l'IK, ne modifie ni Neon, ni Orgo, ni les 900 personas, ni Konnaxion_Worlds, ni le VPS. La qualification humaine/OIDC, ACL multi-World et intégration IK réelles ne sont pas déclarées terminées.

## Vérification et sauvegardes

SHA-256 des fichiers source avant remplacement, tests autonomes pré/post sur copie temporaire, snapshot du code original sous `C:\mycode\Konnaxion\Tandem_Local\konnaxion_tour_p1\backups`. Le rollback refuse de remplacer un fichier modifié après installation. En cas de dérive du snapshot, l'installation s'arrête.

Sur machine de développement isolée **avec une base de test distincte** :

```powershell
cd 'C:\mycode\Konnaxion\Konnaxion\backend'
uv run --no-sync python -m pytest konnaxion/users/tests/test_tandem_oidc_guard.py konnaxion/ethikos/tests/test_tandem_ik_organization_scope.py
```

Ne pas lancer ces tests Django contre Neon ou la base de données courante sans config de test isolée. L'outil d'installation ne les lance pas.

Pour la démo à tenant unique, régler manuellement `IK_ORGO_ALLOWED_ORGANIZATION` à l'UUID Orgo FakePlant **après validation de la configuration Orgo**, avant d'affirmer la qualification d'isolation d'un token IK. Cette restriction ne convient pas à un token multi-tenant sans délégation tenant spécifique.
