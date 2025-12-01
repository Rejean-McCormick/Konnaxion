// FILE: frontend/routes/routesEthikos.tsx
'use client';

import React from 'react';
import {
  DashboardOutlined,
  ApartmentOutlined,
  SafetyCertificateOutlined,
  ProfileOutlined,
  CrownOutlined,
  StarOutlined,
  NodeIndexOutlined,
  BellOutlined,
  SendOutlined,
  RadarChartOutlined,
  ColumnWidthOutlined,
  ColumnHeightOutlined,
  DragOutlined,
  ExpandAltOutlined,
  HistoryOutlined,
  BranchesOutlined,
  TrophyOutlined,
  SmileOutlined,
  SearchOutlined,
  ExperimentOutlined,
  ContactsOutlined,
  MehOutlined,
} from '@ant-design/icons';

// Minimal local type to avoid external coupling
type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

// Ethikos – overview (dashboard)
const ethikosDashboard: Route = {
  path: '/ethikos/insights',
  name: 'Ethikos – Overview',
  icon: <DashboardOutlined />,
};

// Korum: structured debates & decisions + Konsensus leaderboards
const korumGroup: Route = {
  name: 'Korum',
  views: [
    // Decide
    {
      path: '/ethikos/decide/elite',
      name: 'Elite',
      icon: <ApartmentOutlined />,
    },
    {
      path: '/ethikos/decide/public',
      name: 'Public',
      icon: <SafetyCertificateOutlined />,
    },
    {
      path: '/ethikos/decide/methodology',
      name: 'Methodology',
      icon: <ProfileOutlined />,
    },
    {
      path: '/ethikos/decide/results',
      name: 'Results',
      icon: <CrownOutlined />,
    },

    // Deliberate
    {
      path: '/ethikos/deliberate/elite',
      name: 'Elite deliberation',
      icon: <StarOutlined />,
    },
    {
      path: '/ethikos/deliberate/guidelines',
      name: 'Guidelines',
      icon: <NodeIndexOutlined />,
    },
    // Important: no dynamic placeholder like "/ethikos/deliberate/[topic]"
    // so that Next.js <Link> never receives a dynamic pattern as href.

    // Cross-module consensus views
    {
      path: '/konsensus/leaderboards',
      name: 'Leaderboards',
      icon: <CrownOutlined />,
    },
  ],
};

// Konsultations: consultations, pulse, learning, trust
const konsultationsGroup: Route = {
  name: 'Konsultations',
  // no group icon (as requested)
  views: [
    // Impact
    {
      path: '/ethikos/impact/feedback',
      name: 'Feedback',
      icon: <BellOutlined />,
    },
    {
      path: '/ethikos/impact/outcomes',
      name: 'Outcomes',
      icon: <SendOutlined />,
    },
    {
      path: '/ethikos/impact/tracker',
      name: 'Impact tracker',
      icon: <RadarChartOutlined />,
    },

    // Pulse
    {
      path: '/ethikos/pulse/live',
      name: 'Live',
      icon: <ColumnWidthOutlined />,
    },
    {
      path: '/ethikos/pulse/health',
      name: 'Health',
      icon: <ColumnHeightOutlined />,
    },
    {
      path: '/ethikos/pulse/overview',
      name: 'Overview',
      icon: <DragOutlined />,
    },
    {
      path: '/ethikos/pulse/trends',
      name: 'Trends',
      icon: <ExpandAltOutlined />,
    },

    // Learn
    {
      path: '/ethikos/learn/changelog',
      name: 'Changelog',
      icon: <HistoryOutlined />,
    },
    {
      path: '/ethikos/learn/glossary',
      name: 'Glossary',
      icon: <ProfileOutlined />,
    },
    {
      path: '/ethikos/learn/guides',
      name: 'Guides',
      icon: <BranchesOutlined />,
    },

    // Trust
    {
      path: '/ethikos/trust/badges',
      name: 'Badges',
      icon: <TrophyOutlined />,
    },
    {
      path: '/ethikos/trust/profile',
      name: 'Profile',
      icon: <SmileOutlined />,
    },
    {
      path: '/ethikos/trust/credentials',
      name: 'Credentials',
      icon: <SearchOutlined />,
    },
  ],
};

// Admin: moderation & roles (kept separate; can later be role-gated)
const adminGroup: Route = {
  name: 'Admin',
  // no group icon (as requested)
  views: [
    {
      path: '/ethikos/admin/audit',
      name: 'Audit',
      icon: <ExperimentOutlined />,
    },
    {
      path: '/ethikos/admin/roles',
      name: 'Roles',
      icon: <ContactsOutlined />,
    },
    {
      path: '/ethikos/admin/moderation',
      name: 'Moderation',
      icon: <MehOutlined />,
    },
  ],
};

const routes: Route[] = [ethikosDashboard, korumGroup, konsultationsGroup, adminGroup];

export default routes;
