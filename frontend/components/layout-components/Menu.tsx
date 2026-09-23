'use client';

import { Menu } from 'antd';
import type { MenuProps } from 'antd';
import Link from 'next/link';
import type { CSSProperties } from 'react';
import React, { useEffect, useMemo, useState } from 'react';

import { useLanguage } from '@/context/LanguageContext';
import { useWorld } from '@/context/WorldContext';
import type { TranslateFunction } from '@/i18n/runtime';
import type { Route } from '@/routes/types';

import './Menu.css';

export type { Route } from '@/routes/types';

export interface MenuComponentProps {
  routes: Route[];
  style?: CSSProperties;
  closeDrawer: () => void;
  selectedSidebar: string;
}

type MenuItem = Required<MenuProps>['items'][number];

function pathMatches(routePath: string, currentPath: string): boolean {
  if (routePath === '/') return currentPath === '/';
  return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
}

function flattenRoutes(routes: Route[]): Route[] {
  return routes.flatMap((route) =>
    route.views?.length ? flattenRoutes(route.views) : [route],
  );
}

function sectionKey(index: number, name: string): string {
  return `section-${index}-${name}`;
}

function findActiveSection(
  routes: Route[],
  selectedPath?: string,
): string | undefined {
  if (!selectedPath) return undefined;

  for (let index = 0; index < routes.length; index += 1) {
    const route = routes[index];
    if (!route?.views?.length) continue;

    if (flattenRoutes(route.views).some((child) => child.path === selectedPath)) {
      return sectionKey(index, route.name);
    }
  }

  return undefined;
}

function buildSectionLabel(
  route: Route,
  t: TranslateFunction,
): React.ReactNode {
  return (
    <div className="k-sidebar-section-header">
      {route.icon ? (
        <span className="k-sidebar-section-header-icon">{route.icon}</span>
      ) : null}
      <span className="k-sidebar-section-header-text">
        {route.labelKey ? t(route.labelKey, undefined, route.name) : route.name}
      </span>
      {route.scope ? (
        <span
          className={`k-sidebar-section-scope k-sidebar-section-scope-${route.scope}`}
        >
          {t(`navigationScope.${route.scope}`, undefined, route.scope)}
        </span>
      ) : null}
      {route.moduleKey ? (
        <span className="k-sidebar-section-module">{route.moduleKey}</span>
      ) : null}
    </div>
  );
}

function toMenuItems(
  routes: Route[],
  selectedSidebar: string,
  closeDrawer: () => void,
  href: (path: string) => string,
  t: TranslateFunction,
): MenuItem[] {
  const usedPaths = new Set<string>();

  return routes.flatMap((route, routeIndex) => {
    if (route.views?.length) {
      const children = route.views.flatMap((child) => {
        if (!child.path || usedPaths.has(child.path)) return [];
        usedPaths.add(child.path);

        return [
          {
            key: child.path,
            icon: child.icon,
            className: 'k-sidebar-section-item',
            label: (
              <Link
                href={{
                  pathname: href(child.path),
                  query: { sidebar: selectedSidebar },
                }}
                onClick={closeDrawer}
              >
                {child.labelKey ? t(child.labelKey, undefined, child.name) : child.name}
              </Link>
            ),
          } as MenuItem,
        ];
      });

      if (!children.length) return [];

      return [
        {
          key: sectionKey(routeIndex, route.name),
          label: buildSectionLabel(route, t),
          className: 'k-sidebar-section-submenu',
          children,
        } as MenuItem,
      ];
    }

    if (!route.path || usedPaths.has(route.path)) return [];
    usedPaths.add(route.path);

    return [
      {
        key: route.path,
        icon: route.icon,
        label: (
          <Link
            href={{
              pathname: href(route.path),
              query: { sidebar: selectedSidebar },
            }}
            onClick={closeDrawer}
          >
            {route.labelKey ? t(route.labelKey, undefined, route.name) : route.name}
          </Link>
        ),
      } as MenuItem,
    ];
  });
}

const MenuComponent: React.FC<MenuComponentProps> = ({
  routes,
  style,
  closeDrawer,
  selectedSidebar,
}) => {
  const { t } = useLanguage();
  const { appPath, href } = useWorld();
  const flat = useMemo(() => flattenRoutes(routes), [routes]);

  const selectedKey = useMemo(() => {
    const matches = flat.filter(
      (route) => route.path && pathMatches(route.path, appPath),
    );

    if (!matches.length) return undefined;

    return matches.reduce((best, route) => {
      if (!best.path) return route;
      if (!route.path) return best;
      return route.path.length > best.path.length ? route : best;
    }).path;
  }, [appPath, flat]);

  const activeSection = useMemo(
    () => findActiveSection(routes, selectedKey),
    [routes, selectedKey],
  );

  const [openKeys, setOpenKeys] = useState<string[]>(
    activeSection ? [activeSection] : [],
  );

  useEffect(() => {
    setOpenKeys(activeSection ? [activeSection] : []);
  }, [activeSection]);

  const items = useMemo(
    () => toMenuItems(routes, selectedSidebar, closeDrawer, href, t),
    [routes, selectedSidebar, closeDrawer, href, t],
  );

  const handleOpenChange: MenuProps['onOpenChange'] = (keys) => {
    const normalized = keys.map(String);
    const newlyOpened = normalized.find((key) => !openKeys.includes(key));
    setOpenKeys(newlyOpened ? [newlyOpened] : []);
  };

  return (
    <Menu
      mode="inline"
      selectedKeys={selectedKey ? [selectedKey] : []}
      openKeys={openKeys}
      onOpenChange={handleOpenChange}
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
