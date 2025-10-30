'use client';

import React from 'react';
import { DashboardOutlined } from '@ant-design/icons';

// Dashboard
import Dashboard from '@/keenkonnect/dashboard/page';

// Projects & Collaboration
import MyProjects           from '@/keenkonnect/projects/my-projects/page';
import BrowseProjects       from '@/keenkonnect/projects/browse-projects/page';
import CreateNewProject     from '@/keenkonnect/projects/create-new-project/page';
import ProjectWorkspace     from '@/keenkonnect/projects/project-workspace/page';

// Knowledge Repository
import BrowseRepository     from '@/keenkonnect/knowledge/browse-repository/page';
import SearchFilterDocuments from '@/keenkonnect/knowledge/search-filter-documents/page';
import UploadNewDocument     from '@/keenkonnect/knowledge/upload-new-document/page';
import DocumentManagement    from '@/keenkonnect/knowledge/document-management/page';

// AI Team Matching
import FindTeams           from '@/keenkonnect/ai-team-matching/find-teams/page';
import MyMatches           from '@/keenkonnect/ai-team-matching/my-matches/page';
import MatchPreferences    from '@/keenkonnect/ai-team-matching/match-preferences/page';

// Interactive Workspaces
import MyWorkspaces            from '@/keenkonnect/workspaces/my-workspaces/page';
import BrowseAvailableWorkspaces from '@/keenkonnect/workspaces/browse-available-workspaces/page';
import LaunchNewWorkspace      from '@/keenkonnect/workspaces/launch-new-workspace/page';

// Sustainability & Impact
import TrackProjectImpact     from '@/keenkonnect/sustainability-impact/track-project-impact/page';
import SustainabilityDashboard from '@/keenkonnect/sustainability-impact/sustainability-dashboard/page';
import SubmitImpactReports     from '@/keenkonnect/sustainability-impact/submit-impact-reports/page';

// User Reputation & Settings
import ViewReputation         from '@/keenkonnect/user-reputation/view-reputation-ekoh/page';
import ManageExpertiseAreas   from '@/keenkonnect/user-reputation/manage-expertise-areas/page';
import AccountPreferences     from '@/keenkonnect/user-reputation/account-preferences/page';

interface Route {
  path: string;
  name: string;
  rtlName?: string;
  icon?: React.ReactNode;
  component?: React.ComponentType<any>;
  layout?: string;
  collapse?: boolean;
  state?: string;
  views?: Route[];
}

const directDashboard: Route = {
  path: '/keenkonnect/dashboard',
  name: 'Dashboard',
  rtlName: 'Dashboard',
  icon: <DashboardOutlined />,
  component: Dashboard,
  layout: '/keenkonnect',
};

const projectsCollaboration: Route = {
  collapse: true,
  name: 'Projects & Collaboration',
  rtlName: 'Projects & Collaboration',
  state: 'projectsCollaboration',
  views: [
    { path: '/keenkonnect/projects/my-projects',       name: 'My Projects',       component: MyProjects,       layout: '/keenkonnect' },
    { path: '/keenkonnect/projects/browse-projects',   name: 'Browse Projects',   component: BrowseProjects,   layout: '/keenkonnect' },
    { path: '/keenkonnect/projects/create-new-project',name: 'Create New Project',component: CreateNewProject,layout: '/keenkonnect' },
    { path: '/keenkonnect/projects/project-workspace', name: 'Project Workspace', component: ProjectWorkspace, layout: '/keenkonnect' },
  ],
};

const knowledgeRepository: Route = {
  collapse: true,
  name: 'Knowledge Repository',
  rtlName: 'Knowledge Repository',
  state: 'knowledgeRepository',
  views: [
    { path: '/keenkonnect/knowledge/browse-repository',       name: 'Browse Repository',        component: BrowseRepository,        layout: '/keenkonnect' },
    { path: '/keenkonnect/knowledge/search-filter-documents', name: 'Search & Filter Documents',component: SearchFilterDocuments,layout: '/keenkonnect' },
    { path: '/keenkonnect/knowledge/upload-new-document',     name: 'Upload New Document',     component: UploadNewDocument,     layout: '/keenkonnect' },
    { path: '/keenkonnect/knowledge/document-management',     name: 'Document Management',     component: DocumentManagement,    layout: '/keenkonnect' },
  ],
};

const aiTeamMatching: Route = {
  collapse: true,
  name: 'AI Team Matching',
  rtlName: 'AI Team Matching',
  state: 'aiTeamMatching',
  views: [
    { path: '/keenkonnect/ai-team-matching/find-teams',        name: 'Find Teams',        component: FindTeams,        layout: '/keenkonnect' },
    { path: '/keenkonnect/ai-team-matching/my-matches',        name: 'My Matches',        component: MyMatches,        layout: '/keenkonnect' },
    { path: '/keenkonnect/ai-team-matching/match-preferences', name: 'Match Preferences',component: MatchPreferences,layout: '/keenkonnect' },
  ],
};

const interactiveWorkspaces: Route = {
  collapse: true,
  name: 'Interactive Workspaces',
  rtlName: 'Interactive Workspaces',
  state: 'interactiveWorkspaces',
  views: [
    { path: '/keenkonnect/workspaces/my-workspaces',               name: 'My Workspaces',              component: MyWorkspaces,              layout: '/keenkonnect' },
    { path: '/keenkonnect/workspaces/browse-available-workspaces',name: 'Browse Available Workspaces',component: BrowseAvailableWorkspaces,layout: '/keenkonnect' },
    { path: '/keenkonnect/workspaces/launch-new-workspace',       name: 'Launch New Workspace',       component: LaunchNewWorkspace,       layout: '/keenkonnect' },
  ],
};

const sustainabilityImpact: Route = {
  collapse: true,
  name: 'Sustainability & Impact',
  rtlName: 'Sustainability & Impact',
  state: 'sustainabilityImpact',
  views: [
    { path: '/keenkonnect/sustainability-impact/track-project-impact',    name: 'Track Project Impact',    component: TrackProjectImpact,     layout: '/keenkonnect' },
    { path: '/keenkonnect/sustainability-impact/sustainability-dashboard',name: 'Sustainability Dashboard',component: SustainabilityDashboard,layout: '/keenkonnect' },
    { path: '/keenkonnect/sustainability-impact/submit-impact-reports',   name: 'Submit Impact Reports',   component: SubmitImpactReports,    layout: '/keenkonnect' },
  ],
};

const userReputationSettings: Route = {
  collapse: true,
  name: 'User Reputation & Settings',
  rtlName: 'User Reputation & Settings',
  state: 'userReputationSettings',
  views: [
    { path: '/keenkonnect/user-reputation/view-reputation-ekoh',      name: 'View Reputation (Ekoh)',       component: ViewReputation,        layout: '/keenkonnect' },
    { path: '/keenkonnect/user-reputation/manage-expertise-areas',   name: 'Manage Expertise Areas',       component: ManageExpertiseAreas, layout: '/keenkonnect' },
    { path: '/keenkonnect/user-reputation/account-preferences',      name: 'Account & Preferences',        component: AccountPreferences,   layout: '/keenkonnect' },
  ],
};

const routes: Route[] = [
  directDashboard,
  projectsCollaboration,
  knowledgeRepository,
  aiTeamMatching,
  interactiveWorkspaces,
  sustainabilityImpact,
  userReputationSettings,
];

export default routes;
