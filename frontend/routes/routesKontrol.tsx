'use client';

import {
  DashboardOutlined,
  FileProtectOutlined,
  FileSearchOutlined,
  LockOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

const overview: Route = {
  path: '/kontrol/dashboard',
  name: 'Overview',
  icon: <DashboardOutlined />,
  scope: 'platform',
};

const operationsGroup: Route = {
  name: 'Operations',
  scope: 'platform',
  views: [
    {
      path: '/kontrol/users/all',
      name: 'User database',
      icon: <UserOutlined />,
      scope: 'platform',
    },
    {
      path: '/kontrol/moderation/queue',
      name: 'Moderation queue',
      icon: <WarningOutlined />,
      scope: 'module',
      moduleKey: 'multi',
    },
    {
      path: '/kontrol/moderation/community',
      name: 'Community contexts',
      icon: <TeamOutlined />,
      scope: 'module',
      moduleKey: 'multi',
    },
  ],
};

const governanceGroup: Route = {
  name: 'Governance',
  scope: 'platform',
  views: [
    {
      path: '/kontrol/konsensus',
      name: 'Konsensus rules',
      icon: <FileProtectOutlined />,
      scope: 'platform',
      isAdmin: true,
    },
    {
      path: '/kontrol/roles',
      name: 'Roles & permissions',
      icon: <LockOutlined />,
      scope: 'platform',
      isAdmin: true,
    },
    {
      path: '/kontrol/audit-log',
      name: 'System audit log',
      icon: <FileSearchOutlined />,
      scope: 'platform',
      isAdmin: true,
    },
  ],
};

const routes: Route[] = [overview, operationsGroup, governanceGroup];

export default routes;
