'use client';

import {
  BorderOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  LineChartOutlined,
  StarOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

export const EKOH_ROUTES = {
  dashboard: '/ekoh/dashboard',
  score: '/ekoh/overview-analytics/current-ekoh-score',
  expertise: '/ekoh/expertise-areas/view-current-expertise',
  badges: '/ekoh/achievements-badges/earned-badges-display',
  contextualInfluence: '/ekoh/voting-influence/current-voting-weight',
} as const;

const overview: Route = {
  path: EKOH_ROUTES.dashboard,
  name: 'Overview',
  icon: <DashboardOutlined />,
};

const reputationGroup: Route = {
  name: 'Reputation',
  views: [
    {
      path: EKOH_ROUTES.score,
      name: 'Profile analytics',
      icon: <LineChartOutlined />,
    },
    {
      path: EKOH_ROUTES.expertise,
      name: 'Expertise areas',
      icon: <DeploymentUnitOutlined />,
    },
    {
      path: EKOH_ROUTES.badges,
      name: 'Achievements & badges',
      icon: <StarOutlined />,
    },
  ],
};

const influenceGroup: Route = {
  name: 'Influence',
  views: [
    {
      path: EKOH_ROUTES.contextualInfluence,
      name: 'Contextual influence',
      icon: <BorderOutlined />,
    },
  ],
};

const routes: Route[] = [overview, reputationGroup, influenceGroup];

export default routes;
