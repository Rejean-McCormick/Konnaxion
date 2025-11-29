Voici une version unifiée du doc **How to nest**, couvrant les **5 modules** et déjà adaptée au renommage en `KeenPageShell` (au lieu de `KeenPage`).
Tu peux la coller telle quelle dans ton repo et l’utiliser comme référence pour corriger les 20 fichiers KeenKonnect et les autres modules.

---

# Layout shells – How to nest (5 modules)

Objectif :
Standardiser le layout des pages dans les 5 modules principaux, en utilisant **un shell par module** :

* KeenKonnect → `KeenPageShell`
* Ekoh → `EkohPageShell`
* Ethikos → `EthikosPageShell`
* KonnectED → `KonnectedPageShell`
* Kreative → `KreativePageShell`

Chaque page d’un module doit :

1. Être enveloppée par le **shell du module**.
2. Ne **pas** redéfinir son propre “gros header” (`h1`, titre principal, etc.) en dehors du shell.
3. Ne **pas** gérer de breadcrumb local (géré par le layout global, si nécessaire).

---

## 1. Récap des shells par module

### 1.1. KeenKonnect

* **Fichier** : `app/keenkonnect/KeenPageShell.tsx`
* **Composant** : `KeenPageShell` (export par défaut)
* **Usage typique dans une page** :

```tsx
import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

export default function SomeKeenPage() {
  return (
    <KeenPageShell
      title="My KeenKonnect Page"
      description="One-line description of what this page does."
      toolbar={(
        /* optionnel : boutons d’action à droite du titre */
      )}
    >
      {/* contenu de la page */}
    </KeenPageShell>
  );
}
```

### 1.2. Ekoh

* **Fichier** : `app/ekoh/EkohPageShell.tsx` (nom exact à vérifier dans le repo, mais pattern = `EkohPageShell`)
* **Composant** : `EkohPageShell` (export par défaut)
* **Usage typique** :

```tsx
import EkohPageShell from '@/app/ekoh/EkohPageShell';

export default function EkohSomethingPage() {
  return (
    <EkohPageShell
      title="Ekoh · Voting Influence"
      description="View and understand your current voting weight in Ekoh."
    >
      {/* contenu Ekoh (PageContainer, Card, ProCard, etc.) */}
    </EkohPageShell>
  );
}
```

### 1.3. Ethikos

* **Fichier** : `app/ethikos/EthikosPageShell.tsx`
* **Composant** : `EthikosPageShell`
* **Usage** :

```tsx
import EthikosPageShell from '@/app/ethikos/EthikosPageShell';

export default function EthikosAnalyticsPage() {
  return (
    <EthikosPageShell
      title="Ethikos Analytics"
      description="Ethical impact analytics and scorecards."
    >
      {/* contenu Ethikos */}
    </EthikosPageShell>
  );
}
```

### 1.4. KonnectED

* **Fichier** : `app/konnected/KonnectedPageShell.tsx`
* **Composant** : `KonnectedPageShell`
* **Usage** :

```tsx
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

export default function KonnectedDashboardPage() {
  return (
    <KonnectedPageShell
      title="KonnectED Dashboard"
      description="Overview of learning journeys and cohorts."
    >
      {/* contenu KonnectED */}
    </KonnectedPageShell>
  );
}
```

### 1.5. Kreative

* **Fichier** : `app/kreative/KreativePageShell.tsx`
* **Composant** : `KreativePageShell`
* **Usage** :

```tsx
import KreativePageShell from '@/app/kreative/KreativePageShell';

export default function KreativeSpacePage() {
  return (
    <KreativePageShell
      title="Collaborative Spaces"
      description="Find or start creative collaboration spaces."
    >
      {/* contenu Kreative */}
    </KreativePageShell>
  );
}
```

---

## 2. Implémentation de référence – KeenKonnect (`KeenPageShell`)

Pour KeenKonnect, le shell est un **layout central** déjà présent sous `app/keenkonnect/KeenPageShell.tsx`.
Il gère :

* le `<title>` dans l’onglet navigateur,
* le gros `<h1>`,
* la description sous le titre,
* la toolbar à droite,
* la largeur/padding du contenu.

Exemple d’implémentation (référence, à garder alignée avec ton fichier réel) :

```tsx
// app/keenkonnect/KeenPageShell.tsx
'use client';

import React from 'react';
import Head from 'next/head';
import usePageTitle from '@/hooks/usePageTitle';

export type KeenPageShellProps = {
  /** Gros titre de la page, affiché en <h1> */
  title: string;

  /** Sous-titre / description sous le titre */
  description?: string;

  /** Titre <title> du navigateur. Si non fourni, on génère "KeenKonnect · {title}" */
  metaTitle?: string;

  /** Contenu principal de la page */
  children: React.ReactNode;

  /**
   * Élément(s) à droite du titre (boutons d’action, filtres, etc.)
   * ex: <Button type="primary">New</Button>
   */
  toolbar?: React.ReactNode;

  /** Largeur max de la zone centrale */
  maxWidth?: number | string;
};

export default function KeenPageShell({
  title,
  description,
  metaTitle,
  children,
  toolbar,
  maxWidth = 1200,
}: KeenPageShellProps) {
  const finalMetaTitle = metaTitle ?? `KeenKonnect · ${title}`;

  // Synchronise le titre de l’onglet (hook existant dans ton codebase)
  usePageTitle(finalMetaTitle);

  return (
    <>
      <Head>
        <title>{finalMetaTitle}</title>
      </Head>

      <div className="container mx-auto p-5" style={{ maxWidth }}>
        {/* Header de page standardisé */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && (
              <p className="mt-1 text-gray-500">{description}</p>
            )}
          </div>

          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>

        {/* Contenu spécifique à la page */}
        {children}
      </div>
    </>
  );
}
```

**Règles associées (KeenKonnect)** :

* ✅ **Toujours** utiliser `KeenPageShell` pour les pages KeenKonnect (sauf cas ultra-spéciaux type page système).
* ✅ Titre principal **toujours** en `h1.text-2xl.font-bold` (fourni par le shell).
* ✅ Padding global **toujours** `container mx-auto p-5`.
* ✅ Toolbar → prop `toolbar`.
* 🚫 **Pas** de breadcrumb local (géré au niveau `app/keenkonnect/layout.tsx` si nécessaire).
* 🚫 **Pas** de `<Head>` local ni de `usePageTitle` local dans les pages KeenKonnect.

---

## 3. Page de référence KeenKonnect

Exemple basé sur `knowledge/search-filter-documents` :

```tsx
'use client';

import React from 'react';
import { Card, Alert } from 'antd';
import type { PaginationProps } from 'antd';
import {
  ProTable,
  QueryFilter,
  ProFormText,
  ProFormSelect,
  ProFormDateRangePicker,
} from '@ant-design/pro-components';
import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

// ... types + données (DocumentResource, sampleDocuments, etc.)

export default function SearchFilterDocumentsPage(): JSX.Element {
  // ... state, filtres, useMemo, columns, paginationProps, etc.

  return (
    <KeenPageShell
      title="Search & Filter Documents"
      description="Advanced search and filtering for knowledge documents in KeenKonnect."
    >
      {/* Bloc filtres */}
      <Card className="mb-4">
        <QueryFilter
          onFinish={handleFilterFinish}
          onReset={handleFilterReset}
          labelWidth="auto"
          defaultCollapsed={false}
          span={8}
          initialValues={{ sort: DEFAULT_SORT }}
        >
          {/* ... champs de filtre */}
        </QueryFilter>
      </Card>

      {/* Résumé + table */}
      <Alert /* ...props */ className="mb-4" />

      <Card>
        <ProTable
          /* ...props */
        />
        {/* Pagination externe */}
      </Card>
    </KeenPageShell>
  );
}
```

👉 C’est ce pattern qu’il faut viser pour **toutes les pages KeenKonnect**.

---

## 4. Patterns par type de page (communs aux 5 modules)

Les types de pages sont similaires dans les 5 modules, seul le shell change (`KeenPageShell`, `EkohPageShell`, etc.).

### 4.1. Pages “form wizard” (StepsForm)

Ex :

* KeenKonnect : `create-new-project`, `submit-impact-reports`, `match-preferences`
* Kreative : `create-new-idea`
* KonnectED : onboarding / course setup

Pattern :

```tsx
<KeenPageShell
  title="Create New Project"
  description="Use this guided wizard to describe your project and configure the team."
>
  <Card>
    <StepsForm
      onFinish={...}
      formProps={{ layout: 'vertical' }}
    >
      {/* StepForm ... */}
    </StepsForm>
  </Card>
</KeenPageShell>
```

Même chose pour Ekoh/Kreative/etc. en remplaçant le shell :

```tsx
<EkohPageShell title="…" description="…">
  {/* StepsForm dans un Card */}
</EkohPageShell>
```

### 4.2. Pages “tableau & filtres” (list, ProTable)

Ex :

* KeenKonnect : `knowledge/search-filter-documents`, `projects/my-projects`, `workspaces/my-workspaces`, `knowledge/document-management`.
* Kreative : listes d’espaces, projets, idées.
* Ethikos / Ekoh : listes de contributions, événements, votes.

Pattern :

```tsx
<KeenPageShell
  title="My Projects"
  description="Browse and manage your KeenKonnect projects."
  toolbar={(
    <Button type="primary">New project</Button>
  )}
>
  <Card className="mb-4">
    {/* Filtres / QueryFilter / search bar */}
  </Card>

  <Card>
    <ProTable /* ... */ />
  </Card>
</KeenPageShell>
```

### 4.3. Pages “dashboard / analytics”

Ex :

* KeenKonnect : `sustainability-impact/sustainability-dashboard`, `track-project-impact`.
* Ekoh/Ethikos : dashboards de scores, indices.
* KonnectED : dashboard de progression.

Pattern :

```tsx
<KeenPageShell
  title="Sustainability Impact Dashboard"
  description="High-level dashboard aggregating sustainability impact across projects."
>
  <Row gutter={[16, 16]}>
    <Col xs={24} md={12}>
      <Card title="CO₂ saved">
        {/* Graph / KPI */}
      </Card>
    </Col>
    {/* ... autres cards */}
  </Row>
</KeenPageShell>
```

Même logique pour les autres modules, avec leur shell respectif.

---

## 5. Migration / refactor – règles concrètes

### 5.1. Fix central

Pour chaque module :

1. S’assurer que le shell existe (`KeenPageShell`, `EkohPageShell`, etc.) et expose :

   * `title`
   * `description?`
   * `metaTitle?` (optionnel, selon le module)
   * `toolbar?`
   * `children`

2. Vérifier que le shell gère :

   * le `<title>` navigateur (ou au moins `usePageTitle`),
   * le `<h1>` et la description,
   * la largeur/padding du container principal.

### 5.2. Fix “par page” (ce que tu vas appliquer aux 20 fichiers KeenKonnect)

Pour chaque page du module :

1. **Import du shell**

   ```tsx
   import KeenPageShell from '@/app/keenkonnect/KeenPageShell';
   ```

   (et équivalent pour les autres modules.)

2. **Wrapper racine**

   * Avant :

     ```tsx
     export default function MyPage() {
       return (
         <div className="container mx-auto p-5">
           <h1>My Page</h1>
           {/* ... */}
         </div>
       );
     }
     ```

     ou

     ```tsx
     return (
       <PageContainer title="My Page">
         {/* ... */}
       </PageContainer>
     );
     ```

   * Après :

     ```tsx
     export default function MyPage() {
       return (
         <KeenPageShell
           title="My Page"
           description="One-line description."
           toolbar={/* optionnel */}
         >
           {/* Ancien contenu, SANS le h1, SANS le PageContainer header */}
         </KeenPageShell>
       );
     }
     ```

3. **Supprimer** :

   * `<h1>` / `Typography.Title` principaux (le shell gère le titre).
   * Breadcrumbs locaux (`<Breadcrumb>`, `breadcrumb` dans `PageContainer`).
   * `usePageTitle` dans la page (géré par le shell).
   * `<Head>` local (sauf cas très particulier, meta custom).

4. **Garder / Replacer** à l’intérieur du shell :

   * `Card`, `ProTable`, `StepsForm`, `Tabs`, `PageContainer` (mais sans header/breadcrumb).
   * Sous-sections : utiliser `Card title="…"`, ou `h2`/`h3` tailwind (`text-lg font-semibold`, etc.).

---

## 6. TL;DR pour les 5 modules

* Un **shell par module** :

  * KeenKonnect → `KeenPageShell`
  * Ekoh → `EkohPageShell`
  * Ethikos → `EthikosPageShell`
  * KonnectED → `KonnectedPageShell`
  * Kreative → `KreativePageShell`

* Chaque page de module :

  ```tsx
  import XxxPageShell from '@/app/xxx/XxxPageShell';

  export default function SomePage() {
    return (
      <XxxPageShell title="…" description="…" toolbar={…}>
        {/* contenu */}
      </XxxPageShell>
    );
  }
  ```

* **Aucun** gros header local (`h1`, breadcrumb) dans les pages.

* Tout le layout de haut niveau (titre, description, toolbar, padding) est géré par le shell.
