# Vérification des intégrations satellites — 27 octobre 2026

**Portée :** vérification statique des instantanés de code et de documentation datés du 27 octobre 2026. **Aucune qualification runtime, CI distante, publication ni autorisation de production n’est déduite de cet audit.**

## Frontière Konnaxion / Worlds / Capsule Manager

- `Konnaxion_Worlds` est le **propriétaire du contrôle Universe/World et de l'isolement WorldRelease**. Le **shell Web**, le sélecteur et la navigation utilisateur sont détenus par le dépôt principal `Konnaxion`, et non par un second frontend Worlds.
- La variable de sécurité de l'API World scoped est `KONNAXION_WORLDS_ENFORCE_SCOPED_API` (le README Worlds mentionne `true` par défaut). `KONNAXION_WORLDS_STRICT_ROUTING` n'est **pas** une configuration reconnue.
- `Konnaxion_Capsule_Manager` indique une mise à jour **1.12.2** concernant la persistance de la configuration Worlds dans `django.env` et `runtime.env`; son fichier `pyproject.toml` déclare séparément la **version de package `0.1.5`**. Ne pas confondre le numéro de correctif/runtime et la version du package Python.
- Ces contrôles de configuration ne démontrent pas une qualification d'isolation entre plusieurs tenants, une politique de déploiement, ni une admission de publication de capsules.
- Éléments examinés : `Konnaxion_Worlds/README.md`, `Konnaxion_Worlds/backend/konnaxion/worlds/`, `Konnaxion_Capsule_Manager/README.md`, `Konnaxion_Capsule_Manager/pyproject.toml`, `Konnaxion_Capsule_Manager/kx_agent/instances/env_writer.py`, `Konnaxion/README.md`.

**Qualification restante :** lancer les tests d'isolation et de configuration, y compris les chemins d'échec et les permissions tenant/World/Release. Ne pas attribuer la même autorité à la UI Konnaxion et au moteur Worlds.

## Mise à jour et preuve

Cette page décrit un état vérifié **sur fichiers**. Si le code, les contrats ou les captures de tests ont évolué depuis le snapshot, réexécuter les tests et réviser cette page avant publication.
