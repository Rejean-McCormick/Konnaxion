'use client';

import { Layout } from 'antd';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import DrawerComponent from '@/components/layout-components/Drawer';
import HeaderComponent from '@/components/layout-components/Header';
import LogoTitle from '@/components/layout-components/LogoTitle';
import Main from '@/components/layout-components/Main';
import MenuComponent from '@/components/layout-components/Menu';
import FixedSider from '@/components/layout-components/Sider';
import { useWorld } from '@/context/WorldContext';
import {
  DEFAULT_ENTRY,
  detectSuite,
  isSuiteKey,
  type SuiteKey,
} from '@/routes/suites';
import type { Route } from '@/routes/types';

const { Content } = Layout;

type RoutesConfig = Record<SuiteKey, Route[]>;

const EMPTY_ROUTES: RoutesConfig = {
  ethikos: [],
  keenkonnect: [],
  konnected: [],
  kreative: [],
  ekoh: [],
  teambuilder: [],
  reports: [],
  kontrol: [],
};

type MainLayoutProps = React.PropsWithChildren<{
  collapsed?: boolean;
}>;

export default function MainLayout({
  collapsed: initialCollapsed = false,
  children,
}: MainLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sidebarParam = searchParams.get('sidebar');
  const { appPath, href } = useWorld();

  const [collapsed, setCollapsed] = useState<boolean>(initialCollapsed);
  const [drawerVisible, setDrawer] = useState<boolean>(false);
  const [routes, setRoutes] = useState<RoutesConfig>(EMPTY_ROUTES);
  const [suite, setSuite] = useState<SuiteKey>(() =>
    detectSuite(appPath, sidebarParam),
  );

  useEffect(() => {
    let isMounted = true;

    Promise.all([
      import('@/routes/routesEthikos'),
      import('@/routes/routesKeenkonnect'),
      import('@/routes/routesKonnected'),
      import('@/routes/routesKreative'),
      import('@/routes/routesEkoh'),
      import('@/routes/routesTeambuilder'),
      import('@/routes/routesReports'),
      import('@/routes/routesKontrol'),
    ])
      .then(
        ([
          { default: ethikos },
          { default: keenKonnect },
          { default: konnected },
          { default: kreative },
          { default: ekoh },
          { default: teambuilder },
          { default: reports },
          { default: kontrol },
        ]) => {
          if (!isMounted) return;

          setRoutes({
            ethikos,
            keenkonnect: keenKonnect,
            konnected,
            kreative,
            ekoh,
            teambuilder,
            reports,
            kontrol,
          });
        },
      )
      .catch((error) => {
        console.error('Error loading sidebar routes:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const next = detectSuite(appPath, sidebarParam);
    if (next !== suite) setSuite(next);
  }, [appPath, sidebarParam, suite]);

  const changeSuite = (key: SuiteKey) => {
    if (!isSuiteKey(key)) return;

    setSuite(key);

    const params = new URLSearchParams(Array.from(searchParams.entries()));
    params.set('sidebar', key);

    const basePath = href(DEFAULT_ENTRY[key]);
    const query = params.toString();
    router.push(query ? `${basePath}?${query}` : basePath);
  };

  const toggle = () => {
    if (typeof window === 'undefined') {
      setCollapsed((previous) => !previous);
      return;
    }

    if (window.innerWidth >= 576) {
      setCollapsed((previous) => !previous);
    } else {
      setDrawer((previous) => !previous);
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
      <FixedSider collapsed={collapsed} setCollapsed={setCollapsed}>
        <LogoTitle onSidebarChange={changeSuite} selectedSidebar={suite} />
        <MenuComponent
          routes={suiteRoutes}
          closeDrawer={() => setDrawer(false)}
          selectedSidebar={suite}
        />
      </FixedSider>

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
