// FILE: frontend/components/layout-components/MainLayout.tsx
// C:\MyCode\Konnaxionv14\frontend\components\layout-components\MainLayout.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import FixedSider from '@/components/layout-components/Sider';
import Main from '@/components/layout-components/Main';
import HeaderComponent from '@/components/layout-components/Header';
import LogoTitle from '@/components/layout-components/LogoTitle';
import DrawerComponent from '@/components/layout-components/Drawer';
import MenuComponent from '@/components/layout-components/Menu';
import type { Route } from '@/components/layout-components/Menu';

const { Content } = Layout;

// 1. ADDED: 'kontrol' to the RoutesConfig interface
interface RoutesConfig {
  ekoh: Route[];
  ethikos: Route[];
  keenkonnect: Route[];
  konnected: Route[];
  kontrol: Route[]; // <-- NEW
  kreative: Route[];
}

type SuiteKey = keyof RoutesConfig;

// 2. ADDED: 'kontrol' to the list of known suites
const SUITES: SuiteKey[] = [
  'ekoh',
  'ethikos',
  'keenkonnect',
  'konnected',
  'kontrol', // <-- NEW
  'kreative',
];

// 3. UPDATED: Added the default entry route for 'kontrol'
const DEFAULT_ENTRY: Record<SuiteKey, string> = {
  ekoh: '/ekoh/dashboard',
  ethikos: '/ethikos/insights',
  keenkonnect: '/keenkonnect/dashboard',
  konnected: '/konnected/dashboard',
  kontrol: '/kontrol/dashboard', // <-- NEW
  kreative: '/kreative/dashboard',
};

const isSuiteKey = (val: string | null): val is SuiteKey =>
  typeof val === 'string' && SUITES.includes(val as SuiteKey);

/**
 * Determine active module from pathname + optional ?sidebar
 *
 * ?sidebar wins when it matches a known suite.
 * Otherwise infer from the first path segment.
 * /konsensus is mapped to the Kollective Intelligence suite (ekoh).
 */
const detectSuite = (pathname: string, sidebarParam: string | null): SuiteKey => {
  if (isSuiteKey(sidebarParam)) return sidebarParam;

  const safePath = pathname || '/';
  const segments = safePath.split('/');
  const first = (segments[1] ?? '').toLowerCase();

  if (first === 'konsensus') {
    // Konsensus Center lives under the Kollective Intelligence umbrella
    return 'ekoh';
  }

  if (isSuiteKey(first)) return first;

  return 'ekoh';
};

type MainLayoutProps = React.PropsWithChildren<{
  collapsed?: boolean;
}>;

export default function MainLayout({
  collapsed: initialCollapsed = false,
  children,
}: MainLayoutProps) {
  const router = useRouter();
  const pathname = usePathname() ?? '/';
  const searchParams = useSearchParams();
  const sidebarParam = searchParams.get('sidebar');

  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const [drawerVisible, setDrawer] = useState<boolean>(false);

  const [routes, setRoutes] = useState<RoutesConfig>({
    ekoh: [],
    ethikos: [],
    keenkonnect: [],
    konnected: [],
    kontrol: [], // <-- NEW
    kreative: [],
  });

  // Current suite
  const [suite, setSuite] = useState<SuiteKey>(() =>
    detectSuite(pathname, sidebarParam),
  );

  // Dynamically load sidebar routes for each suite
  useEffect(() => {
    let isMounted = true;

    // 4a. ADDED: Dynamic import for routesKontrol
    Promise.all([
      import('@/routes/routesEkoh'),
      import('@/routes/routesEthikos'),
      import('@/routes/routesKeenkonnect'),
      import('@/routes/routesKonnected'),
      import('@/routes/routesKreative'),
      import('@/routes/routesKontrol'), // <-- NEW IMPORT
    ])
      .then(
        // 4b. ADDED: Destructuring assignment for the imported module
        ([
          { default: ekoh },
          { default: ethikos },
          { default: keen },
          { default: konnected },
          { default: kreative },
          { default: kontrol }, // <-- NEW DESTRUCTURING
        ]) => {
          if (!isMounted) return;
          // 4c. ADDED: Mapping the routes to the 'kontrol' key
          setRoutes({
            ekoh,
            ethikos,
            keenkonnect: keen,
            konnected,
            kontrol, // <-- NEW MAPPING
            kreative,
          });
        },
      )
      // eslint-disable-next-line no-console
      .catch((err) => console.error('Erreur chargement routes :', err));

    return () => {
      isMounted = false;
    };
  }, []);

  // Resync suite when URL changes (back/forward or internal navigation)
  useEffect(() => {
    const next = detectSuite(pathname, sidebarParam);
    if (next !== suite) {
      setSuite(next);
    }
  }, [pathname, sidebarParam, suite]);

  const changeSuite = (rawKey: string) => {
    if (!isSuiteKey(rawKey)) return;
    const key: SuiteKey = rawKey;

    setSuite(key);

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('sidebar', key);

    const basePath = DEFAULT_ENTRY[key];
    const query = params.toString();
    const target = query ? `${basePath}?${query}` : basePath;

    router.push(target);
  };

  const toggle = () => {
    // Guard for environments where window might not exist (tests, SSR edge cases)
    if (typeof window === 'undefined') {
      setCollapsed((prev) => !prev);
      return;
    }

    if (window.innerWidth >= 576) {
      // Desktop: toggle sider collapse
      setCollapsed((prev) => !prev);
    } else {
      // Mobile: open/close drawer instead of touching sider
      setDrawer((prev) => !prev);
    }
  };

  const suiteRoutes = routes[suite] ?? [];

  return (
    <Layout
      style={{
        minHeight: '100vh',
        background: 'var(--ant-layout-color-bg-layout)',
      }}
    >
      {/* SIDEBAR – desktop */}
      <FixedSider collapsed={collapsed} setCollapsed={setCollapsed}>
        <LogoTitle onSidebarChange={changeSuite} selectedSidebar={suite} />
        <MenuComponent
          routes={suiteRoutes}
          closeDrawer={() => setDrawer(false)}
          selectedSidebar={suite}
        />
      </FixedSider>

      {/* MAIN + HEADER */}
      <Main collapsed={collapsed}>
        <HeaderComponent
          collapsed={collapsed}
          handleToggle={toggle}
          routes={suiteRoutes}
          selectedSidebar={suite}
        />
        <Content
          style={{
            margin: '20px 16px 15px 16px',
            background: 'var(--ant-color-bg-container)',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Main>

      {/* DRAWER – mobile */}
      <DrawerComponent
        drawerVisible={drawerVisible}
        closeDrawer={() => setDrawer(false)}
      >
        <LogoTitle onSidebarChange={changeSuite} selectedSidebar={suite} />
        <MenuComponent
          routes={suiteRoutes}
          style={{ minHeight: '100vh' }}
          closeDrawer={() => setDrawer(false)}
          selectedSidebar={suite}
        />
      </DrawerComponent>
    </Layout>
  );
}