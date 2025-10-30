'use client'

import React from 'react'
import { Menu } from 'antd'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

export interface Route {
  path?: string
  name: string
  icon?: React.ReactNode
  views?: Route[]
}

interface Props {
  routes: Route[]
  style?: React.CSSProperties
  closeDrawer: () => void
  selectedSidebar: string
}

const MenuComponent: React.FC<Props> = ({
  routes,
  style,
  closeDrawer,
  selectedSidebar,
}) => {
  const pathname = usePathname()

  /* helpers */
  const toItems = (rs: Route[]): any[] =>
    rs
      .map(r =>
        r.views?.length
          ? {
              key: r.name,
              icon: r.icon,
              label: r.name,
              children: toItems(r.views),
            }
          : r.path
          ? {
              key: r.path,
              icon: r.icon,
              label: (
                <Link
                  href={{ pathname: r.path, query: { sidebar: selectedSidebar } }}
                  onClick={closeDrawer}
                >
                  {r.name}
                </Link>
              ),
            }
          : null,
      )
      .filter(Boolean)

  const flatten = (rs: Route[]): Route[] =>
    rs.flatMap(r => (r.views?.length ? flatten(r.views) : [r]))

  const selectedKeys = flatten(routes)
    .filter(r => r.path && pathname.startsWith(r.path!))
    .map(r => r.path!)

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKeys}
      items={toItems(routes)}
      style={{
        background: 'var(--ant-color-bg-container)',
        color     : 'var(--ant-color-text)',
        padding   : '16px 0',
        ...style,
      }}
    />
  )
}

export default MenuComponent
