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
  labelKey: 'navigation.overview',
  icon: <DashboardOutlined />,
};

const deliberateGroup: Route = {
  name: 'Deliberate',
  labelKey: 'navigation.deliberate',
  views: [
    {
      path: '/ethikos/deliberate/elite',
      name: 'Expert deliberation',
      labelKey: 'navigation.expertDeliberation',
      icon: <StarOutlined />,
    },
    {
      path: '/ethikos/deliberate/guidelines',
      name: 'Guidelines',
      labelKey: 'navigation.guidelines',
      icon: <NodeIndexOutlined />,
    },
  ],
};

const decideGroup: Route = {
  name: 'Decide',
  labelKey: 'navigation.decide',
  views: [
    {
      path: '/ethikos/decide/public',
      name: 'Public consultations',
      labelKey: 'navigation.publicConsultations',
      icon: <SafetyCertificateOutlined />,
    },
    {
      path: '/ethikos/decide/elite',
      name: 'Expert decisions',
      labelKey: 'navigation.expertDecisions',
      icon: <ApartmentOutlined />,
    },
    {
      // Technical route root is separate, but Konsensus is product-owned by ethiKos.
      path: '/konsensus',
      name: 'Konsensus',
      labelKey: 'navigation.konsensus',
      icon: <TeamOutlined />,
      moduleKey: 'ethikos',
      isCrossModule: true,
    },
    {
      path: '/ethikos/decide/results',
      name: 'Results',
      labelKey: 'navigation.results',
      icon: <CrownOutlined />,
    },
    {
      path: '/ethikos/decide/methodology',
      name: 'Methodology',
      labelKey: 'navigation.methodology',
      icon: <ProfileOutlined />,
    },
  ],
};

const impactGroup: Route = {
  name: 'Impact',
  labelKey: 'navigation.impact',
  views: [
    {
      path: '/ethikos/impact/tracker',
      name: 'Impact tracker',
      labelKey: 'navigation.impactTracker',
      icon: <RadarChartOutlined />,
    },
    {
      path: '/ethikos/impact/outcomes',
      name: 'Outcomes',
      labelKey: 'navigation.outcomes',
      icon: <SendOutlined />,
    },
    {
      path: '/ethikos/impact/feedback',
      name: 'Feedback',
      labelKey: 'navigation.feedback',
      icon: <BellOutlined />,
    },
  ],
};

const pulseGroup: Route = {
  name: 'Pulse',
  labelKey: 'navigation.pulse',
  views: [
    {
      path: '/ethikos/pulse/live',
      name: 'Live activity',
      labelKey: 'navigation.liveActivity',
      icon: <ColumnWidthOutlined />,
    },
    {
      path: '/ethikos/pulse/health',
      name: 'Debate health',
      labelKey: 'navigation.debateHealth',
      icon: <ColumnHeightOutlined />,
    },
    {
      path: '/ethikos/pulse/trends',
      name: 'Trends',
      labelKey: 'navigation.trends',
      icon: <ExpandAltOutlined />,
    },
    {
      path: '/ethikos/pulse/overview',
      name: 'Pulse overview',
      labelKey: 'navigation.pulseOverview',
      icon: <DragOutlined />,
    },
  ],
};

const trustGroup: Route = {
  name: 'Trust',
  labelKey: 'navigation.trust',
  views: [
    {
      path: '/ethikos/trust/profile',
      name: 'Trust profile',
      labelKey: 'navigation.trustProfile',
      icon: <SmileOutlined />,
    },
    {
      path: '/ethikos/trust/badges',
      name: 'Badges',
      labelKey: 'navigation.badges',
      icon: <TrophyOutlined />,
    },
    {
      path: '/ethikos/trust/credentials',
      name: 'Credentials',
      labelKey: 'navigation.credentials',
      icon: <SearchOutlined />,
    },
  ],
};

const learnGroup: Route = {
  name: 'Learn',
  labelKey: 'navigation.learn',
  views: [
    {
      path: '/ethikos/learn/guides',
      name: 'Guides',
      labelKey: 'navigation.guides',
      icon: <BranchesOutlined />,
    },
    {
      path: '/ethikos/learn/glossary',
      name: 'Glossary',
      labelKey: 'navigation.glossary',
      icon: <ProfileOutlined />,
    },
    {
      path: '/ethikos/learn/changelog',
      name: 'Changelog',
      labelKey: 'navigation.changelog',
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
