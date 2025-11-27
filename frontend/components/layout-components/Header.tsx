// C:\MyCode\Konnaxionv14\frontend\components\layout-components\Header.tsx
'use client'

import { Layout, Dropdown, Breadcrumb } from 'antd'
import type { MenuProps } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  LoginOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { GlobalSearchBar } from '@/global/components'
import api from '@/api'
import type { Route } from '@/components/layout-components/Menu'

const { Header } = Layout

// --- Backend URL helpers (Django + Allauth) ------------------------------

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? ''

// If NEXT_PUBLIC_API_BASE is e.g. "http://localhost:8000/api",
// this yields "http://localhost:8000"
const BACKEND_ROOT =
  RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/, '') || ''

function backendUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  // Fallback: same origin as the frontend (e.g. when Django and Next are
  // served on the same host behind a reverse proxy)
  if (!BACKEND_ROOT) {
    return normalizedPath
  }
  return `${BACKEND_ROOT}${normalizedPath}`
}

/* -------- styled -------- */
const NavBar = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  gap: 16px;
`

const Crumb = styled(Breadcrumb)`
  margin-left: 4px;
  color: var(--ant-color-text);

  .ant-breadcrumb-link,
  .ant-breadcrumb-separator {
    color: var(--ant-color-text-secondary);
    font-size: 13px;
  }
`

const HeaderBlock = styled.div`
  padding: 0 12px;
  height: 32px;
  display: flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid var(--ant-color-border);
  background: var(--ant-color-bg-elevated);
  cursor: pointer;
  font-size: 13px;
  color: var(--ant-color-text);
  transition: background 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    background: var(--ant-color-fill-secondary);
    box-shadow: 0 0 0 1px var(--ant-color-border-secondary);
  }
`

const CenterRegion = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 16px;
`

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 0;
`

/* ------------ mapping du label par sidebar (aligné sur LogoTitle) ------------ */
const SUITE_LABELS: Record<string, string> = {
  ekoh: 'EkoH',
  ethikos: 'EthiKos',
  keenkonnect: 'keenKonnect',
  konnected: 'KonnectED',
  kreative: 'Kreative',
}

/* -------- types & helpers -------- */
type CurrentUser = {
  username: string
  name: string | null
}

// Derive the click event type from MenuProps['onClick']
type AccountMenuClickEvent = Parameters<NonNullable<MenuProps['onClick']>>[0]

const trail = (rs: Route[], cur: string): Route[] => {
  for (const r of rs) {
    if (r.views?.length) {
      const sub = trail(r.views, cur)
      if (sub.length) return [r, ...sub]
    }
    if (r.path && (cur === r.path || cur.startsWith(r.path))) return [r]
  }
  return []
}

/* -------- component -------- */
interface Props {
  collapsed: boolean
  handleToggle: () => void
  routes?: Route[]
  selectedSidebar?: string
}

export default function HeaderBar({
  collapsed,
  handleToggle,
  routes = [],
  selectedSidebar = '',
}: Props) {
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const cur = pathname

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  // Detect auth state via users/me/ endpoint (cookie-based, aligned with backend)
  useEffect(() => {
    let canceled = false

    const load = async () => {
      try {
        const data = await api.get<CurrentUser>('users/me/')
        if (!canceled) {
          setCurrentUser(data)
        }
      } catch {
        if (!canceled) {
          setCurrentUser(null)
        }
      } finally {
        if (!canceled) {
          setLoadingUser(false)
        }
      }
    }

    void load()

    return () => {
      canceled = true
    }
  }, [])

  const accountMenuItems = useMemo<MenuProps['items']>(() => {
    if (currentUser) {
      return [
        {
          key: 'profile',
          icon: <UserOutlined />,
          label: 'My profile',
        },
        { type: 'divider' as const },
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: 'Sign out',
        },
      ]
    }

    return [
      {
        key: 'signin',
        icon: <LoginOutlined />,
        label: 'Sign in',
      },
    ]
  }, [currentUser])

  const handleAccountMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: AccountMenuClickEvent) => {
      if (key === 'profile') {
        // Canonical entry for "my profile" in v14 (Trust · Profile)
        router.push('/ethikos/trust/profile')
        return
      }

      if (key === 'logout') {
        // Delegate logout to backend (Allauth) with a full reload
        window.location.href = backendUrl('/accounts/logout/')
        return
      }

      if (key === 'signin') {
        // Login page served by Django + Allauth
        window.location.href = backendUrl('/accounts/login/')
      }
    },
    [router],
  )

  const breadcrumbItems = useMemo(() => {
    const br = trail(routes, cur)
    const normalizedSidebar = selectedSidebar?.toLowerCase() ?? ''

    const rootName =
      SUITE_LABELS[normalizedSidebar] ??
      (normalizedSidebar
        ? normalizedSidebar.charAt(0).toUpperCase() + normalizedSidebar.slice(1)
        : 'Home')

    const rootPath = normalizedSidebar ? `/${normalizedSidebar}` : '/'

    const root = {
      name: rootName,
      path: rootPath,
    }

    const crumbs = br.length ? [root, ...br] : [root]

    return crumbs.map(c => ({
      key: c.path ?? c.name,
      title: c.path ? (
        <Link
          href={{ pathname: c.path, query: { sidebar: selectedSidebar } }}
          style={{ color: 'var(--ant-color-text)' }}
        >
          {c.name}
        </Link>
      ) : (
        <span style={{ color: 'var(--ant-color-text)' }}>{c.name}</span>
      ),
    }))
  }, [routes, cur, selectedSidebar])

  const displayName = useMemo(
    () =>
      (currentUser?.name && currentUser.name.trim()) ||
      currentUser?.username ||
      'Account',
    [currentUser],
  )

  return (
    <Header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'var(--ant-color-bg-container)',
        padding: 0,
        boxShadow: 'var(--ant-box-shadow-secondary)',
      }}
    >
      <NavBar>
        {/* Toggle sidebar */}
        <div
          onClick={handleToggle}
          style={{ cursor: 'pointer', marginRight: 4 }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              style={{ fontSize: 20, color: 'var(--ant-color-text)' }}
            />
          ) : (
            <MenuFoldOutlined
              style={{ fontSize: 20, color: 'var(--ant-color-text)' }}
            />
          )}
        </div>

        {/* Fil d’Ariane + recherche globale */}
        <CenterRegion>
          <Crumb items={breadcrumbItems} />

          <SearchWrapper>
            <GlobalSearchBar />
          </SearchWrapper>
        </CenterRegion>

        {/* Zone droite : thème + compte */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeSwitcher />

          <Dropdown
            placement="bottomRight"
            menu={{
              items: accountMenuItems,
              onClick: handleAccountMenuClick,
            }}
          >
            <HeaderBlock>
              <UserOutlined
                style={{ marginRight: 8, color: 'var(--ant-color-text)' }}
              />
              {loadingUser ? 'Loading…' : displayName}
            </HeaderBlock>
          </Dropdown>
        </div>
      </NavBar>
    </Header>
  )
}
