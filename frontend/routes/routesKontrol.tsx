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
  labelKey: 'navigation.overview',
  icon: <DashboardOutlined />,
  scope: 'platform',
};

const operationsGroup: Route = {
  name: 'Operations',
  labelKey: 'navigation.operations',
  scope: 'platform',
  views: [
    {
      path: '/kontrol/users/all',
      name: 'User database',
      labelKey: 'navigation.userDatabase',
      icon: <UserOutlined />,
      scope: 'platform',
    },
    {
      path: '/kontrol/moderation/queue',
      name: 'Moderation queue',
      labelKey: 'navigation.moderationQueue',
      icon: <WarningOutlined />,
      scope: 'module',
      moduleKey: 'multi',
    },
    {
      path: '/kontrol/moderation/community',
      name: 'Community contexts',
      labelKey: 'navigation.communityContexts',
      icon: <TeamOutlined />,
      scope: 'module',
      moduleKey: 'multi',
    },
  ],
};

const governanceGroup: Route = {
  name: 'Governance',
  labelKey: 'navigation.governance',
  scope: 'platform',
  views: [
    {
      path: '/kontrol/konsensus',
      name: 'Konsensus rules',
      labelKey: 'navigation.konsensusRules',
      icon: <FileProtectOutlined />,
      scope: 'platform',
      isAdmin: true,
    },
    {
      path: '/kontrol/roles',
      name: 'Roles & permissions',
      labelKey: 'navigation.rolesPermissions',
      icon: <LockOutlined />,
      scope: 'platform',
      isAdmin: true,
    },
    {
      path: '/kontrol/audit-log',
      name: 'System audit log',
      labelKey: 'navigation.systemAuditLog',
      icon: <FileSearchOutlined />,
      scope: 'platform',
      isAdmin: true,
    },
  ],
};

const routes: Route[] = [overview, operationsGroup, governanceGroup];

export default routes;
