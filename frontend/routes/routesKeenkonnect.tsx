// FILE: frontend/routes/routesKeenkonnect.tsx
"use client";

import React from "react";
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
  NotificationOutlined,
  ProjectOutlined,
  RocketOutlined,
  SettingOutlined,
  TagsOutlined,
  TeamOutlined,
  UploadOutlined,
} from "@ant-design/icons";

type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

export const KEENKONNECT_ROUTES = {
  dashboard: "/keenkonnect/dashboard",

  projects: {
    studio: "/projects",
    create: "/projects/create",
    mine: "/projects/mine",
    browse: "/projects/browse",

    // Dynamic workspace routes, intentionally not exposed directly in sidebar:
    // /projects/[slug]
    // /projects/[slug]/tasks
    // /projects/[slug]/blueprints
    // /projects/[slug]/chat
    // /projects/[slug]/ai-insights
    // /projects/[slug]/settings

    matches: "/projects/matches",
    impact: "/projects/impact",
    reputation: "/projects/reputation",
    repository: "/projects/repository",
    repositorySearch: "/projects/repository/search",
    repositoryUpload: "/projects/repository/upload",
  },

  konsensus: {
    activityFeed: "/konsensus/activity-feed",
    leaderboards: "/konsensus/leaderboards",
  },

  legacy: {
    // Keep these as compatibility targets or redirects while pages migrate.
    createProject: "/keenkonnect/projects/create-new-project",
    browseProjects: "/keenkonnect/projects/browse-projects",
    myProjects: "/keenkonnect/projects/my-projects",
    projectWorkspace: "/keenkonnect/projects/project-workspace",

    browseWorkspaces: "/keenkonnect/workspaces/browse-available-workspaces",
    myWorkspaces: "/keenkonnect/workspaces/my-workspaces",
    launchWorkspace: "/keenkonnect/workspaces/launch-new-workspace",

    findTeams: "/keenkonnect/ai-team-matching/find-teams",
    matchPreferences: "/keenkonnect/ai-team-matching/match-preferences",
    myMatches: "/keenkonnect/ai-team-matching/my-matches",

    submitImpactReports: "/keenkonnect/sustainability-impact/submit-impact-reports",
    sustainabilityDashboard:
      "/keenkonnect/sustainability-impact/sustainability-dashboard",
    trackProjectImpact: "/keenkonnect/sustainability-impact/track-project-impact",

    accountPreferences: "/keenkonnect/user-reputation/account-preferences",
    manageExpertise: "/keenkonnect/user-reputation/manage-expertise-areas",
    ekohReputation: "/keenkonnect/user-reputation/view-reputation-ekoh",

    browseRepository: "/keenkonnect/knowledge/browse-repository",
    searchRepository: "/keenkonnect/knowledge/search-filter-documents",
    uploadDocument: "/keenkonnect/knowledge/upload-new-document",
  },
} as const;

const keenDashboard: Route = {
  path: KEENKONNECT_ROUTES.dashboard,
  name: "keenKonnect – Overview",
  icon: <DashboardOutlined />,
};

const projectStudioGroup: Route = {
  name: "Project Studio",
  views: [
    {
      path: KEENKONNECT_ROUTES.projects.studio,
      name: "Browse projects",
      icon: <ProjectOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.create,
      name: "Create project",
      icon: <FileAddOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.mine,
      name: "My projects",
      icon: <FolderOpenOutlined />,
    },
  ],
};

const collaborationGroup: Route = {
  name: "Collaboration",
  views: [
    {
      path: KEENKONNECT_ROUTES.projects.matches,
      name: "AI team matching",
      icon: <HeartOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.impact,
      name: "Impact tracking",
      icon: <GlobalOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.reputation,
      name: "Reputation & expertise",
      icon: <RocketOutlined />,
    },
  ],
};

const stockageGroup: Route = {
  name: "Stockage",
  views: [
    {
      path: KEENKONNECT_ROUTES.projects.repository,
      name: "Repository",
      icon: <DatabaseOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.repositorySearch,
      name: "Search documents",
      icon: <FilterOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.projects.repositoryUpload,
      name: "Upload document",
      icon: <UploadOutlined />,
    },
  ],
};

const projectSignalsGroup: Route = {
  name: "Project Signals",
  views: [
    {
      path: KEENKONNECT_ROUTES.konsensus.activityFeed,
      name: "Activity feed",
      icon: <NotificationOutlined />,
    },
    {
      path: KEENKONNECT_ROUTES.konsensus.leaderboards,
      name: "Leaderboards",
      icon: <CrownOutlined />,
    },
  ],
};

const workspaceTabsReferenceGroup: Route = {
  name: "Workspace Tabs",
  views: [
    {
      path: "/projects",
      name: "Overview",
      icon: <FileTextOutlined />,
    },
    {
      path: "/projects",
      name: "Tasks",
      icon: <HistoryOutlined />,
    },
    {
      path: "/projects",
      name: "Blueprints",
      icon: <FileSearchOutlined />,
    },
    {
      path: "/projects",
      name: "AI insights",
      icon: <BarChartOutlined />,
    },
    {
      path: "/projects",
      name: "Settings",
      icon: <SettingOutlined />,
    },
    {
      path: "/projects",
      name: "Expertise tags",
      icon: <TagsOutlined />,
    },
    {
      path: "/projects",
      name: "Team",
      icon: <TeamOutlined />,
    },
  ],
};

const routes: Route[] = [
  keenDashboard,
  projectStudioGroup,
  collaborationGroup,
  stockageGroup,
  projectSignalsGroup,
  workspaceTabsReferenceGroup,
];

export default routes;