# Konnaxion — tournée Tandem, étape 1/8 (18 octobre 2026)

## Autorité et limites

- **Konnaxion** : produit, identité de session locale, contrôles et autorisations métier, pont IK.
- **Konnaxion_Worlds** : source unique de la mécanique Universe/World/WorldRelease, de la résolution et de l'isolation. Aucun fork local.
- **Orgo** : actions opérationnelles, Signal/Case/Task; aucune écriture directe dans ses bases.
- **Konfid / kOA** : frontières de confiance et décisions gouvernées selon contrats, sans substitution aux autorisations locales.
- **Interaction Kernel** : contrat de transport, pas base de données métier.

## Correctifs de sécurité (sûrs et désactivés par défaut)

1. `COMMON_OIDC_ALLOW_AUTO_SIGNUP=false` (nouveau; garde-fou lorsque `COMMON_OIDC_ENABLED=true`). `ACCOUNT_ALLOW_REGISTRATION` continue de contrôler **séparément** les inscriptions locales. Les `SocialAccount` déjà **explicitement liés** peuvent se connecter via OIDC; aucune fusion par email n'est ajoutée.
2. `IK_ORGO_ALLOWED_ORGANIZATION` (nouveau). Lorsqu'il est configuré avec un UUID, les publications d'impact dont `source.organization` ne correspond pas sont refusées par 403, **avant** persistance. Cette mesure limite la portée d'un jeton partagé de démo à un tenant; elle ne remplace pas une authentification et des jetons délégués distincts en environnement multi-tenant.

Aucun paramètre `.env` réel n'est modifié; ni OIDC ni Konfid ne sont activés.

## Qualification (preuves distinctes)

- Déjà établi dans le parcours FakePlant antérieur: 900 personas synthétiques, 6 Worlds, transport Konnaxion→Orgo et retour impact E2E technique.
- Snapshot actuel: `users.User.can_interactive_login`, contrôle de connexion interactive par adaptateurs allauth, SocialAccount sans auto-association email, IK outbox/redrive, contrôles de World et release préexistants.
- Le correctif **ne prouve pas** une connexion OIDC humaine réelle, les permissions de tous les endpoints/Worlds, la configuration effective du tenant Orgo, les décisions Konfid, ni une qualification de conformité IK totale.
- Les tests statiques sans dépendances s'exécutent au moment d'installation. Les tests Django et d'intégration inclus exigent l'environnement backend et une base de test isolée. Ne pas les exécuter sur Neon ou les bases opérationnelles.

## Suite dans la tournée

- Orgo : qualification OIDC / RBAC, lien tenant et retour d'impact.
- Konfid : Principals / IdentityBindings, assertions et politiques.
- Interaction Kernel : versions de contrats, TCK et conformité.
- Worlds : isolation réelle entre tenants/releases et permissions.
- LevelUpDiag-Orgo : campagnes indépendantes.

Ce correctif est un **durcissement de code Konnaxion**, pas une attestation de déploiement ni un GO LIVE.
