# Konnaxion – Kit d’intégration (aligné à votre env)

Ce kit est adapté à votre configuration :
- **Next.js 15.3.1**, **React 18.2**, **Node >= 20**, **pnpm 9.x** (cf. `package.json`).  
- **Alias TS** au **niveau racine** (pas de `src/`) : `@/modules/*`, `@/components/*`, `@/shared/*`, etc. (cf. `tsconfig.json`).

## Ce que le kit apporte
- `scripts/generate-routes.mjs` → génère `app/**/page.tsx` en ré‑exportant `modules/**/page.tsx`.  
- Shims : `components/layout-components/MainLayout`, `components/PageContainer`, `components/charts/ChartCard`.  
- Utilitaires : `shared/api`, `shared/downloadCsv`, `hooks/usePageTitle`.  
- Mocks : `services/{pulse,trust,learn,impact}.ts`.  
- `app/providers.tsx` : React Query + Ant Design.

## Installation (pnpm)
```bash
# Dézipper à la racine du repo
# Dépendances : vous avez déjà antd/react-query/axios/chart.js/etc.
# Rien d'obligatoire à ajouter. Optionnel : @ant-design/pro-components
pnpm add -D @types/node @types/react @types/react-dom  # si manquants

# Générer les routes (modules -> app)
node scripts/generate-routes.mjs --modulesDir modules --appDir app
```

## Mise en place
1. **Providers** : dans `app/layout.tsx`, enveloppez votre app :
   ```tsx
   import Providers from '@/app/providers';
   import 'antd/dist/reset.css'; // styles AntD
   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en"><body><Providers>{children}</Providers></body></html>
     );
   }
   ```
2. **Aliases** : déjà compatibles avec votre `tsconfig.json` (pas de changement requis).
3. **PageContainer** : notre version **n’a pas besoin** de `@ant-design/pro-components`.  
   Si vous l’installez, vous pourrez le remplacer par le composant officiel sans changer les imports.
4. **Services** : remplacez progressivement les mocks par des appels `api.get/post/...` vers vos endpoints.

## Script `generate-routes`
- Ignore automatiquement `index.test/` et tout dossier `components/`.
- Exemple : `modules/ekoh/dashboard/page.tsx` → `app/ekoh/dashboard/page.tsx` (re‑export).

Bon démarrage !
