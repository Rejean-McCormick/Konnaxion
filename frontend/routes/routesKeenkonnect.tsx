'use client';

import {
  BarChartOutlined,
  CrownOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileAddOutlined,
  FileSearchOutlined,
  FileTextOutlined,
  FilterOutlined,
  FolderOpenOutlined,
  GlobalOutlined,
  HeartOutlined,
  HistoryOutlined,
  ProjectOutlined,
  RocketOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

export const KEENKONNECT_ROUTES = {
  dashboard: '/keenkonnect/dashboard',
  projects: {
    browse: '/keenkonnect/projects/browse-projects',
    create: '/keenkonnect/projects/create-new-project',
    mine: '/keenkonnect/projects/my-projects',
    workspace: '/keenkonnect/projects/project-workspace',
  },
  workspaces: {
    browse: '/keenkonnect/workspaces/browse-available-workspaces',
    mine: '/keenkonnect/workspaces/my-workspaces',
    launch: '/keenkonnect/workspaces/launch-new-workspace',
  },
  matching: {
    findTeams: '/keenkonnect/ai-team-matching/find-teams',
    preferences: '/keenkonnect/ai-team-matching/match-preferences',
    myMatches: '/keenkonnect/ai-team-matching/my-matches',
  },
  knowledge: {
    browseRepository: '/keenkonnect/knowledge/browse-repository',
    searchDocuments: '/keenkonnect/knowledge/search-filter-documents',
    documentManagement: '/keenkonnect/knowledge/document-management',
    uploadDocument: '/keenkonnect/knowledge/upload-new-document',
  },
  impact: {
    dashboard: '/keenkonnect/sustainability-impact/sustainability-dashboard',
    track: '/keenkonnect/sustainability-impact/track-project-impact',
    submit: '/keenkonnect/sustainability-impact/submit-impact-reports',
  },
  reputation: {
    view: '/keenkonnect/user-reputation/view-reputation-ekoh',
    manageExpertise: '/keenkonnect/user-reputation/manage-expertise-areas',
    accountPreferences: '/keenkonnect/user-reputation/account-preferences',
  },
} as const;

const overview: Route = {
  path: KEENKONNECT_ROUTES.dashboard,
  name: 'Overview',
  icon: <DashboardOutlined />,
};

const projectsGroup: Route = {
  name: 'Projects',
  views: [
    {
      path: KEENKONNECT_ROUTES.projects.browse,
      name: 'Browse projects',
      icon: <ProjectOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.create,
      name: 'Create new project',
      icon: <FileAddOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.mine,
      name: 'My projects',
      icon: <FolderOpenOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.workspace,
      name: 'Project workspace',
      icon: <FileTextOutlined />,
    },
  ],
};

const workspacesGroup: Route = {
  name: 'Workspaces',
  views: [
    {
      path: KEENKONNECT_ROUTES.workspaces.browse,
      name: 'Browse available workspaces',
      icon: <GlobalOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.workspaces.mine,
      name: 'My workspaces',
      icon: <FolderOpenOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.workspaces.launch,
      name: 'Launch new workspace',
      icon: <RocketOutlined />,
    },
  ],
};

const matchingGroup: Route = {
  name: 'AI Team Matching',
  views: [
    {
      path: KEENKONNECT_ROUTES.matching.findTeams,
      name: 'Find teams',
      icon: <TeamOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.matching.preferences,
      name: 'Match preferences',
      icon: <SettingOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.matching.myMatches,
      name: 'My matches',
      icon: <HeartOutlined />,
    },
  ],
};

const knowledgeGroup: Route = {
  name: 'Knowledge',
  views: [
    {
      path: KEENKONNECT_ROUTES.knowledge.browseRepository,
      name: 'Browse repository',
      icon: <DatabaseOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.knowledge.searchDocuments,
      name: 'Search / filter documents',
      icon: <FilterOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.knowledge.documentManagement,
      name: 'Document management',
      icon: <FileSearchOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.knowledge.uploadDocument,
      name: 'Upload new document',
      icon: <UploadOutlined />,
    },
  ],
};

const impactGroup: Route = {
  name: 'Sustainability Impact',
  views: [
    {
      path: KEENKONNECT_ROUTES.impact.dashboard,
      name: 'Sustainability dashboard',
      icon: <BarChartOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.impact.track,
      name: 'Track project impact',
      icon: <HistoryOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.impact.submit,
      name: 'Submit impact reports',
      icon: <FileTextOutlined />,
    },
  ],
};

const reputationGroup: Route = {
  name: 'User Reputation',
  views: [
    {
      path: KEENKONNECT_ROUTES.reputation.view,
      name: 'View reputation / EkoH',
      icon: <CrownOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.reputation.manageExpertise,
      name: 'Manage expertise areas',
      icon: <TagsOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.reputation.accountPreferences,
      name: 'Account preferences',
      icon: <SettingOutlined />,
    },
  ],
};

const routes: Route[] = [
  overview,
  projectsGroup,
  workspacesGroup,
  matchingGroup,
  knowledgeGroup,
  impactGroup,
  reputationGroup,
];

export default routes;
