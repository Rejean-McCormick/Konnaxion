'use client';

import {
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Breadcrumb, Dropdown, Layout } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

import api from '@/api';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import WorldSwitcher from '@/components/worlds/WorldSwitcher';
import { useWorld } from '@/context/WorldContext';
import { GlobalSearchBar } from '@/global/components';
import {
  DEFAULT_ENTRY,
  isSuiteKey,
  SUITE_LABELS,
} from '@/routes/suites';
import type { Route } from '@/routes/types';
import ActiveHeaderWidget from '@/widgets/header/ActiveHeaderWidget';

const { Header } = Layout;

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? '';
const BACKEND_ROOT =
  RAW_API_BASE.replace(/\/+$/, '').replace(/\/api$/, '') || '';

function backendUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return BACKEND_ROOT ? `${BACKEND_ROOT}${normalizedPath}` : normalizedPath;
}

const NavBar = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 16px;
  gap: 12px;
  min-width: 0;
`;

const Crumb = styled(Breadcrumb)`
  margin-left: 4px;
  color: var(--ant-color-text);
  max-width: min(30vw, 390px);
  min-width: 90px;
  overflow: hidden;
  white-space: nowrap;

  .ant-breadcrumb-link,
  .ant-breadcrumb-separator {
    color: var(--ant-color-text-secondary);
    font-size: 13px;
  }

  @media (max-width: 1050px) {
    max-width: 180px;
  }

  @media (max-width: 820px) {
    display: none;
  }
`;

const WorldSlot = styled.div`
  flex: 0 1 auto;
  min-width: 0;
`;

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
  transition:
    background 0.3s ease,
    box-shadow 0.3s ease;

  &:hover {
    background: var(--ant-color-fill-secondary);
    box-shadow: 0 0 0 1px var(--ant-color-border-secondary);
  }

  @media (max-width: 720px) {
    padding: 0 9px;

    .k-account-name {
      display: none;
    }
  }
`;

const CenterRegion = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 12px;
`;

const SearchWrapper = styled.div`
  flex: 1;
  min-width: 120px;
  display: flex;
  justify-content: center;

  @media (max-width: 900px) {
    display: none;
  }
`;

const WidgetSlot = styled.div`
  flex: 0 0 auto;
  width: 14ch;
  max-width: 14ch;
  min-width: 14ch;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 4px;
  font-size: 12px;
  color: var(--ant-color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 1180px) {
    display: none;
  }
`;

type CurrentUser = {
  username: string;
  name: string | null;
};

type AccountMenuClickEvent = Parameters<NonNullable<MenuProps['onClick']>>[0];

function pathMatches(routePath: string, currentPath: string): boolean {
  if (routePath === '/') return currentPath === '/';
  return currentPath === routePath || currentPath.startsWith(`${routePath}/`);
}

function leafScore(routes: Route[]): number {
  for (let index = routes.length - 1; index >= 0; index -= 1) {
    const path = routes[index]?.path;
    if (path) return path.length;
  }
  return -1;
}

/** Pick the most specific matching route, including nested section context. */
function trail(routes: Route[], currentPath: string): Route[] {
  let best: Route[] = [];
  let bestScore = -1;

  for (const route of routes) {
    if (route.views?.length) {
      const subTrail = trail(route.views, currentPath);
      if (subTrail.length) {
        const candidate = [route, ...subTrail];
        const score = leafScore(candidate);
        if (score > bestScore) {
          best = candidate;
          bestScore = score;
        }
      }
    }

    if (route.path && pathMatches(route.path, currentPath)) {
      const score = route.path.length;
      if (score > bestScore) {
        best = [route];
        bestScore = score;
      }
    }
  }

  return best;
}

function normalizeBreadcrumbPath(path?: string): string | undefined {
  if (!path) return undefined;
  return path === '/' ? '/' : path.replace(/\/+$/, '');
}

interface Props {
  collapsed: boolean;
  handleToggle: () => void;
  routes?: Route[];
  selectedSidebar?: string;
}

export default function HeaderBar({
  collapsed,
  handleToggle,
  routes = [],
  selectedSidebar = '',
}: Props) {
  const router = useRouter();
  const { appPath, href } = useWorld();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    let canceled = false;

    const load = async () => {
      try {
        const data = await api.get<CurrentUser>('users/me/');
        if (!canceled) setCurrentUser(data);
      } catch {
        if (!canceled) setCurrentUser(null);
      } finally {
        if (!canceled) setLoadingUser(false);
      }
    };

    void load();
    return () => {
      canceled = true;
    };
  }, []);

  const accountMenuItems = useMemo<MenuProps['items']>(() => {
    if (currentUser) {
      return [
        { key: 'profile', icon: <UserOutlined />, label: 'My profile' },
        { type: 'divider' as const },
        { key: 'logout', icon: <LogoutOutlined />, label: 'Sign out' },
      ];
    }

    return [{ key: 'signin', icon: <LoginOutlined />, label: 'Sign in' }];
  }, [currentUser]);

  const handleAccountMenuClick: MenuProps['onClick'] = useCallback(
    ({ key }: AccountMenuClickEvent) => {
      if (key === 'profile') {
        router.push(href('/reputation?sidebar=ethikos'));
        return;
      }

      if (key === 'logout') {
        window.location.href = backendUrl('/accounts/logout/');
        return;
      }

      if (key === 'signin') {
        window.location.href = backendUrl('/accounts/login/');
      }
    },
    [href, router],
  );

  const breadcrumbItems = useMemo(() => {
    const branch = trail(routes, appPath);
    const normalizedSidebar = selectedSidebar.toLowerCase();
    const suite = isSuiteKey(normalizedSidebar) ? normalizedSidebar : null;

    const root = {
      name: suite ? SUITE_LABELS[suite] : 'Home',
      path: suite ? DEFAULT_ENTRY[suite] : '/',
    };

    const crumbs = branch.length ? [root, ...branch] : [root];
    const dedupedCrumbs = crumbs.filter((crumb, index, items) => {
      const path = normalizeBreadcrumbPath(crumb.path);
      if (!path) return true;

      return !items
        .slice(index + 1)
        .some(
          (candidate) => normalizeBreadcrumbPath(candidate.path) === path,
        );
    });

    return dedupedCrumbs.map((crumb) => ({
      key: crumb.path ?? crumb.name,
      title: crumb.path ? (
        <Link
          href={{
            pathname: href(crumb.path),
            query: suite ? { sidebar: suite } : undefined,
          }}
          style={{ color: 'var(--ant-color-text)' }}
        >
          {crumb.name}
        </Link>
      ) : (
        <span style={{ color: 'var(--ant-color-text)' }}>{crumb.name}</span>
      ),
    }));
  }, [routes, appPath, selectedSidebar, href]);

  const displayName = useMemo(
    () =>
      (currentUser?.name && currentUser.name.trim()) ||
      currentUser?.username ||
      'Account',
    [currentUser],
  );

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
        <div onClick={handleToggle} style={{ cursor: 'pointer', marginRight: 4 }}>
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

        <Crumb items={breadcrumbItems} />

        <WorldSlot>
          <WorldSwitcher />
        </WorldSlot>

        <CenterRegion>
          <SearchWrapper>
            <GlobalSearchBar />
          </SearchWrapper>
          <WidgetSlot aria-label="Header widget">
            <ActiveHeaderWidget />
          </WidgetSlot>
        </CenterRegion>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ThemeSwitcher />
          <Dropdown
            placement="bottomRight"
            menu={{ items: accountMenuItems, onClick: handleAccountMenuClick }}
          >
            <HeaderBlock>
              <UserOutlined
                style={{ marginRight: 8, color: 'var(--ant-color-text)' }}
              />
              <span className="k-account-name">
                {loadingUser ? 'Loading…' : displayName}
              </span>
            </HeaderBlock>
          </Dropdown>
        </div>
      </NavBar>
    </Header>
  );
}
