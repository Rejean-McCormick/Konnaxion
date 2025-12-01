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

// Type local minimal pour éviter toute dépendance
type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

// Route principale : vue d’ensemble Ekoh
const ekohDashboard: Route = {
  path: '/ekoh/dashboard',
  name: 'Ekoh – Overview',
  icon: <DashboardOutlined />,
};

// Bloc EkoH : réputation, expertise, badges
const ekohGroup: Route = {
  name: 'EkoH',
  // section header: no icon
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

// Bloc Smart Vote : poids de vote + centre Konsensus + flux d’activité
const smartVoteGroup: Route = {
  name: 'Smart Vote',
  // section header: no icon
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
