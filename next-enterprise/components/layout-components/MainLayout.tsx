'use client'

import React, { useState, useEffect } from 'react'
import { Layout } from 'antd'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import FixedSider      from '@/components/layout-components/Sider'
import Main            from '@/components/layout-components/Main'
import HeaderComponent from '@/components/layout-components/Header'
import LogoTitle       from '@/components/layout-components/LogoTitle'
import DrawerComponent from '@/components/layout-components/Drawer'
import MenuComponent   from '@/components/layout-components/Menu'
import type { Route }  from '@/components/layout-components/Menu'

interface RoutesConfig {
  ekoh: Route[]
  ethikos: Route[]
  keenkonnect: Route[]
  konnected: Route[]
  kreative: Route[]
}

const { Content } = Layout

export default function MainLayout({
  collapsed: initialCollapsed = false,
  children,
}: React.PropsWithChildren<{ collapsed?: boolean }>) {
  const router   = useRouter()
  const pathname = usePathname()
  const q        = useSearchParams()

  /* états */
  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [drawerVisible, setDrawer] = useState(false)

  const [routes, setRoutes] = useState<RoutesConfig>({
    ekoh: [], ethikos: [], keenkonnect: [], konnected: [], kreative: [],
  })

  /* suite depuis ?sidebar= */
  const [suite, setSuite] = useState(q.get('sidebar') ?? 'ekoh')

  /* charger dynamiquement les routes */
  useEffect(() => {
    Promise.all([
      import('@/routes/routesEkoh'),
      import('@/routes/routesEthikos'),
      import('@/routes/routesKeenkonnect'),
      import('@/routes/routesKonnected'),
      import('@/routes/routesKreative'),
    ])
      .then(([
        { default: ekoh },
        { default: ethikos },
        { default: keen },
        { default: konnected },
        { default: kreative },
      ]) => setRoutes({ ekoh, ethikos, keenkonnect: keen, konnected, kreative }))
      .catch(err => console.error('Erreur chargement routes :', err))
  }, [])

  /* sync si ?sidebar change */
  useEffect(() => {
    const v = q.get('sidebar')
    if (v && v !== suite) setSuite(v)
  }, [q])

  const changeSuite = (key: string) => {
    setSuite(key)
    const params = new URLSearchParams(Array.from(q.entries()))
    params.set('sidebar', key)
    router.push(`${pathname}?${params.toString()}`)
  }

  const toggle = () => {
    if (window.innerWidth >= 576) setCollapsed(!collapsed)
    else setDrawer(v => !v)
  }

  const suiteRoutes = routes[suite as keyof RoutesConfig] ?? []

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--ant-layout-color-bg-layout)' }}>
      {/* SIDEBAR desktop */}
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
            margin      : '20px 16px 15px 16px',
            background  : 'var(--ant-color-bg-container)',
            borderRadius: 8,
          }}
        >
          {children}
        </Content>
      </Main>

      {/* DRAWER mobile */}
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
  )
}
