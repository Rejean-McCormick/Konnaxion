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
  labelKey: 'navigation.overview',
  icon: <DashboardOutlined />,
  scope: 'platform',
};

const insightsGroup: Route = {
  name: 'Insights',
  labelKey: 'navigation.insights',
  scope: 'platform',
  views: [
    {
      path: '/reports/smart-vote',
      name: 'Smart Vote',
      labelKey: 'navigation.smartVote',
      icon: <PieChartOutlined />,
      scope: 'platform',
    },
    {
      path: '/reports/usage',
      name: 'Adoption & usage',
      labelKey: 'navigation.adoptionUsage',
      icon: <BarChartOutlined />,
      scope: 'platform',
    },
    {
      path: '/reports/perf',
      name: 'System performance',
      labelKey: 'navigation.systemPerformance',
      icon: <ThunderboltOutlined />,
      scope: 'platform',
    },
    {
      path: '/reports/custom',
      name: 'Custom reports',
      labelKey: 'navigation.customReports',
      icon: <FileTextOutlined />,
      scope: 'platform',
    },
  ],
};

const routes: Route[] = [overview, insightsGroup];

export default routes;
