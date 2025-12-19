// FILE: frontend/routes/routesEkoh.tsx
'use client';

import React from 'react';
import {
  DashboardOutlined,
  StarOutlined,
  LineChartOutlined,
  DeploymentUnitOutlined,
  BorderOutlined,
  UsergroupAddOutlined,
  HistoryOutlined,
} from '@ant-design/icons';

import type { Route } from '@/components/layout-components/Menu';

/**
 * Ekoh module navigation:
 * - User-facing identity / reputation features stay here.
 * - Smart Vote surface entry points (voting weight, Konsensus) also stay here.
 * - Admin / platform-wide controls are centralised under /kontrol.
 */

// Main route: Ekoh overview
const ekohDashboard: Route = {
  path: '/ekoh/dashboard',
  name: 'Ekoh – Overview',
  icon: <DashboardOutlined />,
};

// EkoH: reputation, expertise, badges
const ekohGroup: Route = {
  name: 'EkoH',
  // section header: no icon (non-clickable group)
  views: [
    {
      path: '/ekoh/overview-analytics/current-ekoh-score',
      name: 'Score & analytics',
      icon: <LineChartOutlined />,
    },
    {
      path: '/ekoh/expertise-areas/view-current-expertise',
      name: 'Expertise & domains',
      icon: <DeploymentUnitOutlined />,
    },
    {
      path: '/ekoh/achievements-badges/earned-badges-display',
      name: 'Achievements & badges',
      icon: <StarOutlined />,
    },
  ],
};

// Smart Vote: voting weight + Konsensus center + activity feed
const smartVoteGroup: Route = {
  name: 'Smart Vote',
  // section header: no icon (non-clickable group)
  views: [
    {
      path: '/ekoh/voting-influence/current-voting-weight',
      name: 'Voting weight',
      icon: <BorderOutlined />,
    },
    {
      path: '/konsensus',
      name: 'Konsensus',
      icon: <UsergroupAddOutlined />,
    },
    {
      path: '/konsensus/activity-feed',
      name: 'Activity feed',
      icon: <HistoryOutlined />,
    },
  ],
};

const routes: Route[] = [ekohDashboard, ekohGroup, smartVoteGroup];

export default routes;
