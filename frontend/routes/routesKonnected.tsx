'use client'

import React from 'react'
import { DashboardOutlined } from '@ant-design/icons'

// Type local minimal pour éviter toute dépendance
type Route = { path?: string; name: string; icon?: React.ReactNode; views?: Route[] }

// NOTE: test routes '/index.test' supprimées à la source
const directDashboard: Route = { path: '/konnected/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> }

const learning_libraryGroup: Route = {
  name: 'Learning Library',
  views: [
    { path: '/konnected/learning-library/browse-resources', name: 'Browse Resources' },
    { path: '/konnected/learning-library/offline-content', name: 'Offline Content' },
    { path: '/konnected/learning-library/recommended-resources', name: 'Recommended Resources' },
    { path: '/konnected/learning-library/search-filters', name: 'Search Filters' }
  ]
}

const community_discussionsGroup: Route = {
  name: 'Community Discussions',
  views: [
    { path: '/konnected/community-discussions/active-threads', name: 'Active Threads' },
    { path: '/konnected/community-discussions/moderation', name: 'Moderation' },
    { path: '/konnected/community-discussions/start-new-discussion', name: 'Start New Discussion' }
  ]
}

const learning_pathsGroup: Route = {
  name: 'Learning Paths',
  views: [
    { path: '/konnected/learning-paths/create-learning-path', name: 'Create Learning Path' },
    { path: '/konnected/learning-paths/manage-existing-paths', name: 'Manage Existing Paths' },
    { path: '/konnected/learning-paths/my-learning-path', name: 'My Learning Path' }
  ]
}

const teams_collaborationGroup: Route = {
  name: 'Teams Collaboration',
  views: [
    { path: '/konnected/teams-collaboration/my-teams', name: 'My Teams' },
    { path: '/konnected/teams-collaboration/project-workspaces', name: 'Project Workspaces' },
    { path: '/konnected/teams-collaboration/team-builder', name: 'Team Builder' },
    { path: '/konnected/teams-collaboration/activity-planner', name: 'Activity Planner' }
  ]
}

const certificationsGroup: Route = {
  name: 'Certifications',
  views: [
    { path: '/konnected/certifications/exam-dashboard-results', name: 'Exam Dashboard Results' },
    { path: '/konnected/certifications/certification-programs', name: 'Certification Programs' },
    { path: '/konnected/certifications/exam-registration', name: 'Exam Registration' },
    { path: '/konnected/certifications/exam-preparation', name: 'Exam Preparation' }
  ]
}

const routes: Route[] = [
  directDashboard,
  certificationsGroup,
  community_discussionsGroup,
  learning_libraryGroup,
  learning_pathsGroup,
  teams_collaborationGroup
]

export default routes
