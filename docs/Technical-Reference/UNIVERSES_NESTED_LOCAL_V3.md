# Konnaxion — Universes imbriqués V3 : intégration et exploitation locale

**Statut :** contrat de migration / cible de développement local avec `uv`.
**Propriétaire canonique :** `Konnaxion_Worlds`; **hôte runtime :** `Konnaxion`.
**Ce guide ne certifie pas qu'une installation Windows a été exécutée.**

## 1. Un seul répertoire de packs source

```text
C:\mycode\Konnaxion\
├── Konnaxion\                    # produit, DB, API, frontend, lanceur uv
│   └── backend\
│       └── config\settings\local.py
├── Konnaxion_Worlds\             # source canonique Universe / World
│   └── universes\
│       ├── unesco\
│       │   ├── universe.yaml
│       │   └── worlds\<world-key>\world.yaml (+ scénario)
│       ├── cuba-2026\
│       ├── kristal-farms\
│       ├── levis\
│       ├── fakeplant\
│       └── konvergence-koali\
└── Konnaxion-Universe-Worlds-Manager\
```

Dans le jeu de six Universes préparé en v3 : **55 World Packs** (7 + 1 + 11 +
17 + 6 + 13). Chaque dossier World fournit son propre `world.yaml` et les
scénarios attendus par le manifeste. `Konnaxion_Worlds/legacy-world-packs/`
conserve des packs historiques non rattachés : ils ne sont pas importés
implicitement dans le catalogue actif.

`Konnaxion_Worlds/seed-data/` et `Konnaxion_Worlds/fakeplant/` isolé sont des
anciens emplacements à archiver **uniquement après vérification par SHA-256**
via l'outil de migration. Le dépôt séparé
`C:\mycode\Konnaxion\konnaxion-universe-seed-standard-v1.1`
est une ancienne distribution de standard devenue facultative ; ne le supprimer
qu'après avoir validé l'installation du nouveau manager et fait une sauvegarde.

Le sous-répertoire `Konnaxion/backend/seed-data` est une **copie historique**
de certains packs (et peut héberger des fixtures spécialisées). **Ne pas tout
supprimer** : certains flux non Universe y ont leurs propres données.

## 2. Deux inventaires aux objectifs différents

- **Sources / YAML :** les dossiers `Konnaxion_Worlds/universes/`, que le moteur
  et le Manager peuvent découvrir avant toute écriture en base.
- **Universes installés :** enregistrements Django (Universe, World,
  WorldRelease), exposés par `/api/control/universes/` et
  `/api/control/worlds/` selon les permissions. La navigation front-end ne lit
  pas un fichier d'inventaire YAML. Les Worlds privés ne sont pas visibles
  automatiquement à un visiteur anonyme.

Un pack peut donc exister sur disque sans être installé; un Universe installé
peut être privé et ne pas apparaître dans l'UI publique.

## 3. Détection et chargement au démarrage (local seulement)

Les éléments suivants sont installés par l'overlay V3 **Konnaxion** :

- `WORLD_ENGINE.lock.json` : identité versionnée du moteur **0.3.7** avec SHA-256.
- `backend/tools/universe_autoload.py` : découvre et valide les sources ;
  **sans argument il lit seulement**.
- `INSTALL_NESTED_UNIVERSES.ps1` : installe, après confirmation, les chemins
  canoniques dans `RUN_backend_local.bat` et
  `backend/config/settings/local.py` ; sauvegardes locales.

Le lanceur local, après `uv` et les migrations, découvre les packs au démarrage.
Il ignore **toute clé Universe déjà installée en DB**. Il construit/promeut
seulement les **nouvelles clés**. Une modification du YAML d'un Universe déjà
installé exige une opération explicite via Manager ; **pas de réécriture
silencieuse** des quatre Universes publics ni de FakePlant.

**Important :** le changement de dossiers n'est détecté qu'au prochain
démarrage local. Il ne s'agit pas d'un watcher permanent, et aucune activation
automatique en production n'est déclarée.

### Installation contrôlée et audit (PowerShell 7)

1. Installer d'abord l'overlay **Konnaxion_Worlds V3** et vérifier les six
   manifestes et les Worlds imbriqués. Ensuite déposer l'overlay hôte Konnaxion
   V3 / documentation dans la racine du dépôt `Konnaxion`.
2. Dans `C:\mycode\Konnaxion\Konnaxion`, prévisualiser, puis appliquer
   uniquement après inspection (sauvegardes automatiques) :

```powershell
pwsh -NoProfile -File .\INSTALL_NESTED_UNIVERSES.ps1
pwsh -NoProfile -File .\INSTALL_NESTED_UNIVERSES.ps1 -Apply
```

3. Démarrer d'abord sans écriture automatique en DB :

```powershell
$env:KX_AUTOLOAD_NEW_UNIVERSES='0'
.\RUN_backend_local.bat
```

4. Dans un autre PowerShell, depuis `Konnaxion/backend` :

```powershell
uv run --no-sync python manage.py check
uv run --no-sync python tools\universe_autoload.py
```

   Le diagnostic attendu sur le catalogue complet est `6 Universes / 55
   Worlds`. Après inspection des cinq Universes précédemment installés,
   `konvergence-koali` peut être `NEW` si absent de la base.
5. **Seulement sur une base de développement sauvegardée :** laisser le
   prochain lancement sans `KX_AUTOLOAD_NEW_UNIVERSES=0` charger les nouveaux
   Universes. Ne pas lancer une promotion manuelle redondante.

Si le moteur frère ne correspond pas au digest SHA-256 du verrou, le lanceur
échoue : **ne pas désactiver la vérification**. L'extraction du ZIP n'édite pas
par elle-même le lanceur; `INSTALL_NESTED_UNIVERSES.ps1 -Apply` est une étape
nécessaire.

## 4. Visibilité et manager

Le manifeste `universe.yaml` et les références World portent les valeurs
déclarées (`public` ou `private`), distinctes de la visibilité effective en
base. Le Manager affiche deux inventaires, inspecte YAML et DB et permet un
chargement explicite. **Inspecter n'est pas publier.** Ne pas rendre FakePlant
public uniquement pour le voir dans le catalogue anonyme : vérifier plutôt
les accès de l'utilisateur authentifié. Tout changement de visibilité doit
être explicite, validé, appliqué et audité; aucune modification directe des
permissions ou des autres Universes n'est autorisée par ce guide.

## 5. Portée et limites

Le chargement d'un Universe et de ses WorldReleases ne charge pas par magie les
identités FakePlant, la totalité des objets Ethikos, les projets keenKonnect,
ni les données Orgo/Kristal. Ces importations ont des contrats et outils
spécifiques. Ce guide n'autorise aucun effacement de tables.

Le mode `uv` et l'autochargeur du présent correctif ciblent le **dev local**.
Le déploiement en production, Capsule Manager, les migrations des packs déjà
installés, ainsi que la préservation des signatures/versions existantes,
nécessitent une procédure de qualification distincte.

### Vérifications de cohérence utiles

```powershell
# Lecture seule — inventaire DB (selon les droits de cet endpoint)
Invoke-RestMethod http://127.0.0.1:8000/api/control/universes/ |
    Select-Object key,title,status,visibility,world_count

# Identité du moteur : lecture de fichiers et SHA-256, sans écriture DB
py .\scripts\check_worlds_dependency.py ..\Konnaxion_Worlds
```

Sur la dernière commande, exécuter depuis la **racine du dépôt Konnaxion**.
Pour connaître les Worlds privés, utiliser l'inventaire runtime du Manager ou
une requête Django explicite avec des autorisations appropriées.
