'use client';

import {
  ApartmentOutlined,
  BellOutlined,
  BranchesOutlined,
  ColumnHeightOutlined,
  ColumnWidthOutlined,
  CrownOutlined,
  DashboardOutlined,
  DragOutlined,
  ExpandAltOutlined,
  HistoryOutlined,
  NodeIndexOutlined,
  ProfileOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SendOutlined,
  SmileOutlined,
  StarOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

const overview: Route = {
  path: '/ethikos/insights',
  name: 'Overview',
  icon: <DashboardOutlined />,
};

const deliberateGroup: Route = {
  name: 'Deliberate',
  views: [
    {
      path: '/ethikos/deliberate/elite',
      name: 'Expert deliberation',
      icon: <StarOutlined />,
    },
    {
      path: '/ethikos/deliberate/guidelines',
      name: 'Guidelines',
      icon: <NodeIndexOutlined />,
    },
  ],
};

const decideGroup: Route = {
  name: 'Decide',
  views: [
    {
      path: '/ethikos/decide/public',
      name: 'Public consultations',
      icon: <SafetyCertificateOutlined />,
    },
    {
      path: '/ethikos/decide/elite',
      name: 'Expert decisions',
      icon: <ApartmentOutlined />,
    },
    {
      // Technical route root is separate, but Konsensus is product-owned by ethiKos.
      path: '/konsensus',
      name: 'Konsensus',
      icon: <TeamOutlined />,
      moduleKey: 'ethikos',
      isCrossModule: true,
    },
    {
      path: '/ethikos/decide/results',
      name: 'Results',
      icon: <CrownOutlined />,
    },
    {
      path: '/ethikos/decide/methodology',
      name: 'Methodology',
      icon: <ProfileOutlined />,
    },
  ],
};

const impactGroup: Route = {
  name: 'Impact',
  views: [
    {
      path: '/ethikos/impact/tracker',
      name: 'Impact tracker',
      icon: <RadarChartOutlined />,
    },
    {
      path: '/ethikos/impact/outcomes',
      name: 'Outcomes',
      icon: <SendOutlined />,
    },
    {
      path: '/ethikos/impact/feedback',
      name: 'Feedback',
      icon: <BellOutlined />,
    },
  ],
};

const pulseGroup: Route = {
  name: 'Pulse',
  views: [
    {
      path: '/ethikos/pulse/live',
      name: 'Live activity',
      icon: <ColumnWidthOutlined />,
    },
    {
      path: '/ethikos/pulse/health',
      name: 'Debate health',
      icon: <ColumnHeightOutlined />,
    },
    {
      path: '/ethikos/pulse/trends',
      name: 'Trends',
      icon: <ExpandAltOutlined />,
    },
    {
      path: '/ethikos/pulse/overview',
      name: 'Pulse overview',
      icon: <DragOutlined />,
    },
  ],
};

const trustGroup: Route = {
  name: 'Trust',
  views: [
    {
      path: '/ethikos/trust/profile',
      name: 'Trust profile',
      icon: <SmileOutlined />,
    },
    {
      path: '/ethikos/trust/badges',
      name: 'Badges',
      icon: <TrophyOutlined />,
    },
    {
      path: '/ethikos/trust/credentials',
      name: 'Credentials',
      icon: <SearchOutlined />,
    },
  ],
};

const learnGroup: Route = {
  name: 'Learn',
  views: [
    {
      path: '/ethikos/learn/guides',
      name: 'Guides',
      icon: <BranchesOutlined />,
    },
    {
      path: '/ethikos/learn/glossary',
      name: 'Glossary',
      icon: <ProfileOutlined />,
    },
    {
      path: '/ethikos/learn/changelog',
      name: 'Changelog',
      icon: <HistoryOutlined />,
    },
  ],
};

const routes: Route[] = [
  overview,
  deliberateGroup,
  decideGroup,
  impactGroup,
  pulseGroup,
  trustGroup,
  learnGroup,
];

export default routes;
