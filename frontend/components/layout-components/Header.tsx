'use client'

import { Layout, Dropdown, Breadcrumb } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import styled from 'styled-components'
import Link from 'next/link'
import nookies from 'nookies'
import { useRouter, usePathname } from 'next/navigation'
import { useMemo } from 'react'
import ThemeSwitcher from '@/components/ThemeSwitcher'

const { Header } = Layout

/* -------- styled -------- */
const NavBar = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
`

const Crumb = styled(Breadcrumb)`
  margin-left: 20px; /* espace après le toggle */
  color: var(--ant-color-text);
  .ant-breadcrumb-separator {
    color: var(--ant-color-text-secondary);
  }
`

const HeaderBlock = styled.div`
  padding: 0 12px;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    background: var(--ant-color-fill-secondary);
  }
`

/* -------- helpers -------- */
const accountItems = [
  { key: 'profile', icon: <UserOutlined />, label: 'Profile' },
  { type: 'divider' as const },
  { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
]

interface Route {
  path?: string
  name: string
  views?: Route[]
}

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

  const breadcrumbItems = useMemo(() => {
    const br = trail(routes, cur)
    const root = {
      name:
        (selectedSidebar?.[0]?.toUpperCase() ?? '') +
        (selectedSidebar?.slice(1) ?? ''),
      path: `/${selectedSidebar}`,
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
          style={{ cursor: 'pointer', marginRight: 20 }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined style={{ fontSize: 20, color: 'var(--ant-color-text)' }} />
          ) : (
            <MenuFoldOutlined style={{ fontSize: 20, color: 'var(--ant-color-text)' }} />
          )}
        </div>

        {/* Fil d’Ariane */}
        <Crumb items={breadcrumbItems} />

        {/* Zone droite : thème + compte */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeSwitcher />

          <Dropdown
            placement="bottomRight"
            menu={{
              items: accountItems,
              onClick: ({ key }) => {
                if (key === 'logout') {
                  nookies.destroy({}, 'auth0.is.authenticated')
                  nookies.destroy({}, 'accessToken')
                  router.push('/')
                } else if (key === 'profile') {
                  router.push('/users/id/123')
                }
              },
            }}
          >
            <HeaderBlock>
              <UserOutlined style={{ marginRight: 8, color: 'var(--ant-color-text)' }} /> Admin
            </HeaderBlock>
          </Dropdown>
        </div>
      </NavBar>
    </Header>
  )
}
