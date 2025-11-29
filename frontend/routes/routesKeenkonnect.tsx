// FILE: frontend/routes/routesKeenkonnect.tsx
'use client'

import React from 'react'
import { DashboardOutlined } from '@ant-design/icons'

// Type local minimal pour éviter toute dépendance
type Route = { path?: string; name: string; icon?: React.ReactNode; views?: Route[] }

// NOTE: test routes '/index.test' supprimées à la source
const directDashboard: Route = { path: '/keenkonnect/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> }

const ai_team_matchingGroup: Route = {
  name: 'Ai Team Matching',
  views: [
    { path: '/keenkonnect/ai-team-matching/find-teams', name: 'Find Teams' },
    { path: '/keenkonnect/ai-team-matching/match-preferences', name: 'Match Preferences' },
    { path: '/keenkonnect/ai-team-matching/my-matches', name: 'My Matches' }
  ]
}

const sustainability_impactGroup: Route = {
  name: 'Sustainability Impact',
  views: [
    { path: '/keenkonnect/sustainability-impact/submit-impact-reports', name: 'Submit Impact Reports' },
    { path: '/keenkonnect/sustainability-impact/sustainability-dashboard', name: 'Sustainability Dashboard' },
    { path: '/keenkonnect/sustainability-impact/track-project-impact', name: 'Track Project Impact' }
  ]
}

const knowledgeGroup: Route = {
  name: 'Knowledge',
  views: [
    { path: '/keenkonnect/knowledge/browse-repository', name: 'Browse Repository' },
    { path: '/keenkonnect/knowledge/search-filter-documents', name: 'Search Filter Documents' },
    { path: '/keenkonnect/knowledge/upload-new-document', name: 'Upload New Document' },
    { path: '/keenkonnect/knowledge/document-management', name: 'Document Management' }
  ]
}

const projectsGroup: Route = {
  name: 'Projects',
  views: [
    { path: '/keenkonnect/projects/create-new-project', name: 'Create New Project' },
    { path: '/keenkonnect/projects/browse-projects', name: 'Browse Projects' },
    { path: '/keenkonnect/projects/my-projects', name: 'My Projects' },
    { path: '/keenkonnect/projects/project-workspace', name: 'Project Workspace' }
  ]
}

const user_reputationGroup: Route = {
  name: 'User Reputation',
  views: [
    { path: '/keenkonnect/user-reputation/account-preferences', name: 'Account Preferences' },
    { path: '/keenkonnect/user-reputation/manage-expertise-areas', name: 'Manage Expertise Areas' },
    { path: '/keenkonnect/user-reputation/view-reputation-ekoh', name: 'View Reputation Ekoh' }
  ]
}

const workspacesGroup: Route = {
  name: 'Workspaces',
  views: [
    { path: '/keenkonnect/workspaces/browse-available-workspaces', name: 'Browse Available Workspaces' },
    { path: '/keenkonnect/workspaces/my-workspaces', name: 'My Workspaces' },
    { path: '/keenkonnect/workspaces/launch-new-workspace', name: 'Launch New Workspace' }
  ]
}

const routes: Route[] = [
  directDashboard,
  ai_team_matchingGroup,
  knowledgeGroup,
  projectsGroup,
  sustainability_impactGroup,
  user_reputationGroup,
  workspacesGroup
]

export default routes
