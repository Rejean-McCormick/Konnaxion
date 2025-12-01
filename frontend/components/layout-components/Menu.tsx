// FILE: frontend/components/layout-components/Menu.tsx
// C:\MyCode\Konnaxionv14\frontend\components\layout-components\Menu.tsx
'use client';

import React from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import './Menu.css';

export interface Route {
  path?: string;
  name: string;
  icon?: ReactNode;
  views?: Route[];
}

export interface MenuComponentProps {
  routes: Route[];
  style?: CSSProperties;
  closeDrawer: () => void;
  selectedSidebar: string;
}

type MenuItem = Required<MenuProps>['items'][number];

const flattenRoutes = (routes: Route[]): Route[] =>
  routes.flatMap((route) =>
    route.views && route.views.length > 0 ? flattenRoutes(route.views) : [route],
  );

/**
 * Build AntD Menu items.
 * - Simple routes -> normal clickable items
 * - Group routes (with views) -> non-clickable header row with optional icon
 *   + child items rendered as first-level clickable entries.
 */
const toMenuItems = (
  routes: Route[],
  selectedSidebar: string,
  closeDrawer: () => void,
): MenuItem[] => {
  const items: MenuItem[] = [];

  routes.forEach((route) => {
    // Group / section
    if (route.views && route.views.length > 0) {
      const sectionKey = `section-${route.name}`;

      // Non-clickable section header (with optional icon)
      items.push({
        key: sectionKey,
        disabled: true,
        label: (
          <div className="k-sidebar-section-header">
            {route.icon && (
              <span className="k-sidebar-section-header-icon">
                {route.icon}
              </span>
            )}
            <span className="k-sidebar-section-header-text">
              {route.name}
            </span>
          </div>
        ),
        className: 'k-sidebar-section-header',
      } as MenuItem);

      // Child items rendered as regular first-level entries
      route.views.forEach((child) => {
        if (!child.path) return;

        items.push({
          key: child.path,
          icon: child.icon,
          className: 'k-sidebar-section-item',
          label: (
            <Link
              href={{
                pathname: child.path,
                query: { sidebar: selectedSidebar },
              }}
              onClick={closeDrawer}
            >
              {child.name}
            </Link>
          ),
        } as MenuItem);
      });

      return;
    }

    // Simple route
    if (!route.path) return;

    items.push({
      key: route.path,
      icon: route.icon,
      label: (
        <Link
          href={{ pathname: route.path, query: { sidebar: selectedSidebar } }}
          onClick={closeDrawer}
        >
          {route.name}
        </Link>
      ),
    } as MenuItem);
  });

  return items;
};

const MenuComponent: React.FC<MenuComponentProps> = ({
  routes,
  style,
  closeDrawer,
  selectedSidebar,
}) => {
  const pathname = usePathname() ?? '/';

  const flat = React.useMemo(() => flattenRoutes(routes), [routes]);

  const selectedKey = React.useMemo(() => {
    const matches = flat.filter(
      (route) => route.path && pathname.startsWith(route.path),
    );

    if (!matches.length) {
      return undefined;
    }

    // Choose the most specific match (longest path)
    const best = matches.reduce((currentBest, route) => {
      if (!currentBest.path) return route;
      if (!route.path) return currentBest;
      return route.path.length > currentBest.path.length ? route : currentBest;
    });

    return best.path;
  }, [flat, pathname]);

  const items = React.useMemo(
    () => toMenuItems(routes, selectedSidebar, closeDrawer),
    [routes, selectedSidebar, closeDrawer],
  );

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      items={items}
      style={{
        background: 'var(--ant-color-bg-container)',
        color: 'var(--ant-color-text)',
        padding: '16px 0',
        ...style,
      }}
    />
  );
};

export default MenuComponent;
