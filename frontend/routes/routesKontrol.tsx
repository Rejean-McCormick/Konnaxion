// FILE: frontend/routes/routesKontrol.tsx
'use client';

import React from 'react';
import {
  DashboardOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  SettingOutlined,
  LineChartOutlined,
  AlertOutlined,
  AuditOutlined,
  ExperimentOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  FileTextOutlined
} from '@ant-design/icons';

type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

// 1. Dashboard (The Homepage)
const dashboard: Route = {
  path: '/kontrol/dashboard',
  name: 'Overview',
  icon: <DashboardOutlined />,
};

// 2. Operations (Day-to-day management)
const operationsGroup: Route = {
  name: 'Operations',
  icon: <TeamOutlined />,
  views: [
    {
      path: '/kontrol/users/all',
      name: 'User Database',
    },
    {
      path: '/kontrol/moderation/queue',
      name: 'Moderation Queue',
    },
    {
      path: '/kontrol/moderation/community',
      name: 'Community Contexts',
    },
  ],
};

// 3. Platform Governance (Configuration & Logs)
const governanceGroup: Route = {
  name: 'Platform Governance',
  icon: <SettingOutlined />,
  views: [
    {
      path: '/kontrol/konsensus',
      name: 'Konsensus Rules',
      icon: <ExperimentOutlined />,
    },
    {
      path: '/kontrol/roles',
      name: 'Roles & Permissions',
      icon: <SafetyCertificateOutlined />,
    },
    {
      path: '/kontrol/audit-log',
      name: 'System Audit Log',
      icon: <AuditOutlined />,
    },
  ],
};

// 4. Analytics & Insights (Reporting)
const insightsGroup: Route = {
  name: 'Analytics & Reports',
  icon: <LineChartOutlined />,
  views: [
    {
      path: '/reports',
      name: 'Insights Overview',
    },
    {
      path: '/reports/smart-vote',
      name: 'Smart Vote Impact',
    },
    {
      path: '/reports/usage',
      name: 'Adoption & Usage',
    },
    {
      path: '/reports/perf',
      name: 'System Performance',
    },
    {
      path: '/reports/custom',
      name: 'Custom Reports',
    },
  ],
};

const routes: Route[] = [
  dashboard,
  operationsGroup,
  governanceGroup,
  insightsGroup,
];

export default routes;