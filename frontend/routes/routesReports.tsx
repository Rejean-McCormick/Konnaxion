'use client';

import {
  BarChartOutlined,
  DashboardOutlined,
  FileTextOutlined,
  PieChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

const overview: Route = {
  path: '/reports',
  name: 'Overview',
  icon: <DashboardOutlined />,
  scope: 'platform',
};

const insightsGroup: Route = {
  name: 'Insights',
  scope: 'platform',
  views: [
    {
      path: '/reports/smart-vote',
      name: 'Smart Vote',
      icon: <PieChartOutlined />,
      scope: 'platform',
    },
    {
      path: '/reports/usage',
      name: 'Adoption & usage',
      icon: <BarChartOutlined />,
      scope: 'platform',
    },
    {
      path: '/reports/perf',
      name: 'System performance',
      icon: <ThunderboltOutlined />,
      scope: 'platform',
    },
    {
      path: '/reports/custom',
      name: 'Custom reports',
      icon: <FileTextOutlined />,
      scope: 'platform',
    },
  ],
};

const routes: Route[] = [overview, insightsGroup];

export default routes;
