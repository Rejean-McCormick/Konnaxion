// FILE: frontend/routes/routesKonnected.tsx
'use client';

import React from 'react';
import {
  DashboardOutlined,
  BookOutlined,
  DownloadOutlined,
  LikeOutlined,
  SearchOutlined,
  EditOutlined,
  BranchesOutlined,
  PullRequestOutlined,
  MergeOutlined,
  CommentOutlined,
  AlertOutlined,
  MessageOutlined,
  TeamOutlined,
  BuildOutlined,
  UsergroupAddOutlined,
  CalendarOutlined,
  VideoCameraOutlined,
  AppstoreOutlined,
  FormOutlined,
  BulbOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';

// Type local minimal pour éviter toute dépendance
type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

// KonnectED – vue d’ensemble
const konnectedDashboard: Route = {
  path: '/konnected/dashboard',
  name: 'KonnectED – Overview',
  icon: <DashboardOutlined />,
};

// Knowledge : bibliothèque, parcours, discussions, collaboration
const knowledgeGroup: Route = {
  name: 'Knowledge',
  // section header: pas d’icône
  views: [
    // Learning Library
    {
      path: '/konnected/learning-library/browse-resources',
      name: 'Browse',
      icon: <BookOutlined />,
    },
    {
      path: '/konnected/learning-library/offline-content',
      name: 'Offline',
      icon: <DownloadOutlined />,
    },
    {
      path: '/konnected/learning-library/recommended-resources',
      name: 'Recommended',
      icon: <LikeOutlined />,
    },
    {
      path: '/konnected/learning-library/search-filters',
      name: 'Search & filters',
      icon: <SearchOutlined />,
    },
    {
      path: '/konnected/knowledge/contribute',
      name: 'Contribute knowledge',
      icon: <EditOutlined />,
    },
    // NOTE: content viewer route (/konnected/learning-library/[resourceId])
    // is dynamic and intentionally not exposed directly in the sidebar.

    // Learning Paths
    {
      path: '/konnected/learning-paths/create-learning-path',
      name: 'Create path',
      icon: <BranchesOutlined />,
    },
    {
      path: '/konnected/learning-paths/manage-existing-paths',
      name: 'Manage paths',
      icon: <PullRequestOutlined />,
    },
    {
      path: '/konnected/learning-paths/my-learning-path',
      name: 'My path',
      icon: <MergeOutlined />,
    },

    // Community Discussions
    {
      path: '/konnected/community-discussions/active-threads',
      name: 'Active threads',
      icon: <CommentOutlined />,
    },
    {
      path: '/konnected/community-discussions/moderation',
      name: 'Moderation',
      icon: <AlertOutlined />,
    },
    {
      path: '/konnected/community-discussions/start-new-discussion',
      name: 'Start discussion',
      icon: <MessageOutlined />,
    },

    // Teams Collaboration
    {
      path: '/konnected/teams-collaboration/my-teams',
      name: 'My teams',
      icon: <TeamOutlined />,
    },
    {
      path: '/konnected/teams-collaboration/project-workspaces',
      name: 'Project workspaces',
      icon: <BuildOutlined />,
    },
    {
      path: '/konnected/teams-collaboration/team-builder',
      name: 'Team builder',
      icon: <UsergroupAddOutlined />,
    },
    {
      path: '/konnected/teams-collaboration/activity-planner',
      name: 'Activity planner',
      icon: <CalendarOutlined />,
    },
  ],
};

// CertifiKation : examens, programmes, préparation
const certifikationGroup: Route = {
  name: 'CertifiKation',
  views: [
    {
      path: '/konnected/certifications/exam-dashboard-results',
      name: 'Exam dashboard',
      icon: <VideoCameraOutlined />,
    },
    {
      path: '/konnected/certifications/certification-programs',
      name: 'Programs',
      icon: <AppstoreOutlined />,
    },
    {
      path: '/konnected/certifications/exam-registration',
      name: 'Registration',
      icon: <FormOutlined />,
    },
    {
      path: '/konnected/certifications/exam-preparation',
      name: 'Preparation',
      icon: <BulbOutlined />,
    },
    {
      path: '/konnected/mentorship',
      name: 'Mentorship',
      icon: <UserSwitchOutlined />,
    },
  ],
};

const routes: Route[] = [konnectedDashboard, knowledgeGroup, certifikationGroup];

export default routes;

