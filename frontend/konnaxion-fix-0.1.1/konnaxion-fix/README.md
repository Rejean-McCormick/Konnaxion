# konnaxion-fix

Correctif d’intégration pour une app Next.js migrée vers l’**App Router** avec **Ant Design v5**.

## Ce que fait le CLI

1. Crée un `layout.tsx` de **segment** pour appliquer votre `MainLayout` en App Router.
2. Corrige le composant `Main.tsx` (tokens CSS AntD v5 et marges Sider).
3. Migre la navigation Next :
   - `Router.push('/x/[id]', '/x/1')` → `router.push('/x/1')`
   - Supprime l’import par défaut `Router` et ajoute `useRouter()`
   - Ajoute `'use client'` si nécessaire dans les fichiers modifiés
4. Remplace `router.query` par `useParams()` et injecte `const params = useParams()` au bon niveau.
5. Nettoie `<Link>` en supprimant la prop `as`.
6. AntD v5 : `visible` → `open` pour `Modal` et `Drawer`.

> Conseil: faites un commit avant d’exécuter l’outil.

## Installation locale

```bash
# À la racine de votre repo
npm i -D konnaxion-fix@file:./konnaxion-fix
```

## Utilisation

```bash
npx konnaxion-fix run   --app-root .   --konnected-segment modules/konnected   --sider-width 256   --sider-collapsed 80
```

### Paramètres

- `--app-root` : racine de l’app (défaut: `.`)
- `--konnected-segment` : chemin du segment où créer `layout.tsx` (défaut: `modules/konnected`)
- `--sider-width` : largeur du Sider en px (défaut: 256)
- `--sider-collapsed` : largeur du Sider replié en px (défaut: 80)

## Post‑actions recommandées

- Envelopper votre root layout avec `ConfigProvider` d’AntD et `theme={{ cssVar: true }}`.
- Vérifier au build :
  - Aucun `Router.push('x','y')` restant.
  - Plus de `router.query` en App Router.
  - Layout correct sur desktop et mobile.

## Licence

MIT