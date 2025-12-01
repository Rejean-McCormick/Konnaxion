// FILE: frontend/routes/routesKreative.tsx
'use client';

import React from 'react';
import {
  DashboardOutlined,
  StarOutlined,
  CloudUploadOutlined,
  CompassOutlined,
  HighlightOutlined,
  EyeOutlined,
  UsergroupAddOutlined,
  PlusCircleOutlined,
  BulbOutlined,
  BankOutlined,
  UserSwitchOutlined,
  ContactsOutlined,
  AimOutlined,
  PlusSquareOutlined,
  HomeOutlined,
  CrownOutlined,
} from '@ant-design/icons';

// Type local minimal pour éviter toute dépendance
type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

// Kreative – vue d’ensemble
const kreativeDashboard: Route = {
  path: '/kreative/dashboard',
  name: 'Kreative – Overview',
  icon: <DashboardOutlined />,
};

// Konservation : showcases, hub créatif, incubateur d’idées, traditions & mentorat
const konservationGroup: Route = {
  name: 'Konservation',
  // section header: no icon (per chosen mapping)
  views: [
    // Community Showcases
    {
      path: '/kreative/community-showcases/featured-projects',
      name: 'Featured projects',
      icon: <StarOutlined />,
    },
    {
      path: '/kreative/community-showcases/top-creators',
      name: 'Top creators',
      icon: <CrownOutlined />,
    },
    {
      path: '/kreative/community-showcases/submit-to-showcase',
      name: 'Submit to showcase',
      icon: <CloudUploadOutlined />,
    },

    // Creative Hub
    {
      path: '/kreative/creative-hub/explore-ideas',
      name: 'Explore ideas',
      icon: <CompassOutlined />,
    },
    {
      path: '/kreative/creative-hub/submit-creative-work',
      name: 'Submit creative work',
      icon: <HighlightOutlined />,
    },
    {
      path: '/kreative/creative-hub/inspiration-gallery',
      name: 'Inspiration gallery',
      icon: <EyeOutlined />,
    },

    // Idea Incubator
    {
      path: '/kreative/idea-incubator/collaborate-on-ideas',
      name: 'Collaborate on ideas',
      icon: <UsergroupAddOutlined />,
    },
    {
      path: '/kreative/idea-incubator/create-new-idea',
      name: 'Create new idea',
      icon: <PlusCircleOutlined />,
    },
    {
      path: '/kreative/idea-incubator/my-ideas',
      name: 'My ideas',
      icon: <BulbOutlined />,
    },

    // Traditions & mentorship
    {
      path: '/kreative/traditions-archive',
      name: 'Traditions & heritage',
      icon: <BankOutlined />,
    },
    {
      path: '/kreative/mentorship',
      name: 'Mentorship & projects',
      icon: <UserSwitchOutlined />,
    },
  ],
};

// Kontact : espaces collaboratifs
const kontactGroup: Route = {
  name: 'Kontact',

  views: [
    {
      path: '/kreative/collaborative-spaces/find-spaces',
      name: 'Find spaces',
      icon: <AimOutlined />,
    },
    {
      path: '/kreative/collaborative-spaces/start-new-space',
      name: 'Start new space',
      icon: <PlusSquareOutlined />,
    },
    {
      path: '/kreative/collaborative-spaces/my-spaces',
      name: 'My spaces',
      icon: <HomeOutlined />,
    },
  ],
};

const routes: Route[] = [kreativeDashboard, konservationGroup, kontactGroup];

export default routes;
