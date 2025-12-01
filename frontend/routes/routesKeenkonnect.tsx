// FILE: frontend/routes/routesKeenkonnect.tsx
'use client';

import React from 'react';
import {
  DashboardOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  FileMarkdownOutlined,
  FileWordOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  HeartOutlined,
  PushpinOutlined,
  SelectOutlined,
  FormOutlined,
  HistoryOutlined,
  SettingOutlined,
  TagsOutlined,
  RocketOutlined,
  NotificationOutlined,
  CrownOutlined,
  DatabaseOutlined,
  FilterOutlined,
  UploadOutlined,
  SnippetsOutlined,
  GlobalOutlined,
} from '@ant-design/icons';

// Type local minimal pour éviter toute dépendance
type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

// keenKonnect – vue d’ensemble
const keenDashboard: Route = {
  path: '/keenkonnect/dashboard',
  name: 'keenKonnect – Overview',
  icon: <DashboardOutlined />,
};

// Konstruct : projets, équipes, workspaces, impact
const konstructGroup: Route = {
  name: 'Konstruct',
  // section header: no icon
  views: [
    // Projects
    {
      path: '/keenkonnect/projects/create-new-project',
      name: 'Create project',
      icon: <FileAddOutlined />,
    },
    {
      path: '/keenkonnect/projects/browse-projects',
      name: 'Browse projects',
      icon: <FileSearchOutlined />,
    },
    {
      path: '/keenkonnect/projects/my-projects',
      name: 'My projects',
      icon: <FileMarkdownOutlined />,
    },
    {
      path: '/keenkonnect/projects/project-workspace',
      name: 'Project workspace',
      icon: <FileWordOutlined />,
    },

    // Workspaces
    {
      path: '/keenkonnect/workspaces/browse-available-workspaces',
      name: 'Browse workspaces',
      icon: <FileSearchOutlined />,
    },
    {
      path: '/keenkonnect/workspaces/my-workspaces',
      name: 'My workspaces',
      icon: <FolderOutlined />,
    },
    {
      path: '/keenkonnect/workspaces/launch-new-workspace',
      name: 'Launch workspace',
      icon: <FolderOpenOutlined />,
    },

    // AI Team Matching
    {
      path: '/keenkonnect/ai-team-matching/find-teams',
      name: 'Find teams',
      icon: <HeartOutlined />,
    },
    {
      path: '/keenkonnect/ai-team-matching/match-preferences',
      name: 'Match preferences',
      icon: <PushpinOutlined />,
    },
    {
      path: '/keenkonnect/ai-team-matching/my-matches',
      name: 'My matches',
      icon: <SelectOutlined />,
    },

    // Sustainability impact
    {
      path: '/keenkonnect/sustainability-impact/submit-impact-reports',
      name: 'Submit reports',
      icon: <FormOutlined />,
    },
    {
      path: '/keenkonnect/sustainability-impact/sustainability-dashboard',
      name: 'Sustainability dashboard',
      icon: <GlobalOutlined />,
    },
    {
      path: '/keenkonnect/sustainability-impact/track-project-impact',
      name: 'Track project impact',
      icon: <HistoryOutlined />,
    },

    // User reputation (keenkonnect side)
    {
      path: '/keenkonnect/user-reputation/account-preferences',
      name: 'Account preferences',
      icon: <SettingOutlined />,
    },
    {
      path: '/keenkonnect/user-reputation/manage-expertise-areas',
      name: 'Manage expertise',
      icon: <TagsOutlined />,
    },
    {
      path: '/keenkonnect/user-reputation/view-reputation-ekoh',
      name: 'View Ekoh reputation',
      icon: <RocketOutlined />,
    },

    // Konsensus cross-module views (project/impact signals)
    {
      path: '/konsensus/activity-feed',
      name: 'Activity feed',
      icon: <NotificationOutlined />,
    },
    {
      path: '/konsensus/leaderboards',
      name: 'Leaderboards',
      icon: <CrownOutlined />,
    },
  ],
};

// Stockage : dépôt de connaissances
const stockageGroup: Route = {
  name: 'Stockage',
  // section header: no icon
  views: [
    {
      path: '/keenkonnect/knowledge/browse-repository',
      name: 'Browse repository',
      icon: <DatabaseOutlined />,
    },
    {
      path: '/keenkonnect/knowledge/search-filter-documents',
      name: 'Search & filter',
      icon: <FilterOutlined />,
    },
    {
      path: '/keenkonnect/knowledge/upload-new-document',
      name: 'Upload document',
      icon: <UploadOutlined />,
    },
    {
      path: '/keenkonnect/knowledge/document-management',
      name: 'Document management',
      icon: <SnippetsOutlined />,
    },
  ],
};

const routes: Route[] = [keenDashboard, konstructGroup, stockageGroup];

export default routes;
