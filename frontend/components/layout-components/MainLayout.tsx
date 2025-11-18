// components/layout-components/MainLayout.tsx
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

type SuiteKey = keyof RoutesConfig

const SUITES: SuiteKey[] = ['ekoh', 'ethikos', 'keenkonnect', 'konnected', 'kreative']

// Default entry route per module
// NOTE: Ethikos points to Pulse Overview until /ethikos/dashboard exists.
const DEFAULT_ENTRY: Record<SuiteKey, string> = {
  ekoh       : '/ekoh/dashboard',
  ethikos    : '/ethikos/pulse/overview',
  keenkonnect: '/keenkonnect/dashboard',
  konnected  : '/konnected/dashboard',
  kreative   : '/kreative/dashboard',
}

const isSuiteKey = (val: string | null): val is SuiteKey =>
  !!val && (SUITES as string[]).includes(val)

/**
 * Determine active module from pathname + optional ?sidebar
 */
const detectSuite = (pathname: string, sidebarParam: string | null): SuiteKey => {
  if (isSuiteKey(sidebarParam)) return sidebarParam

  const segments = pathname.split('/')
  const first = (segments[1] ?? '').toLowerCase()

  if (isSuiteKey(first)) return first

  return 'ekoh'
}

const { Content } = Layout

export default function MainLayout({
  collapsed: initialCollapsed = false,
  children,
}: React.PropsWithChildren<{ collapsed?: boolean }>) {
  const router        = useRouter()
  const pathname      = usePathname() ?? '/'
  const searchParams  = useSearchParams()
  const sidebarParam  = searchParams.get('sidebar')

  const [collapsed, setCollapsed] = useState(initialCollapsed)
  const [drawerVisible, setDrawer] = useState(false)

  const [routes, setRoutes] = useState<RoutesConfig>({
    ekoh: [], ethikos: [], keenkonnect: [], konnected: [], kreative: [],
  })

  // suite courante
  const [suite, setSuite] = useState<SuiteKey>(() =>
    detectSuite(pathname, sidebarParam),
  )

  // charger dynamiquement les routes
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

  // resynchroniser quand l’URL change (back/forward, liens internes, etc.)
  useEffect(() => {
    const next = detectSuite(pathname, sidebarParam)
    if (next !== suite) setSuite(next)
  }, [pathname, sidebarParam, suite])

  const changeSuite = (rawKey: string) => {
    if (!isSuiteKey(rawKey)) return
    const key: SuiteKey = rawKey

    setSuite(key)

    const params = new URLSearchParams(Array.from(searchParams.entries()))
    params.set('sidebar', key)

    const basePath = DEFAULT_ENTRY[key]
    const query    = params.toString()
    const target   = query ? `${basePath}?${query}` : basePath

    router.push(target)
  }

  const toggle = () => {
    if (window.innerWidth >= 576) setCollapsed(!collapsed)
    else setDrawer(v => !v)
  }

  const suiteRoutes = routes[suite] ?? []

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
