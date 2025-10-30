'use client';

import React from 'react';
import { DashboardOutlined } from '@ant-design/icons';

// Dashboard
import Dashboard          from '@/konnected/dashboard/page';

// Certifications
import ExamPreparation      from '@/konnected/certifications/exam-preparation/page';
import ExamRegistration     from '@/konnected/certifications/exam-registration/page';
import ExamDashboardResults from '@/konnected/certifications/exam-dashboard-results/page';
import CertificationPrograms from '@/konnected/certifications/certification-programs/page';

// Learning Library
import BrowseResources        from '@/konnected/learning-library/browse-resources/page';
import RecommendedResources   from '@/konnected/learning-library/recommended-resources/page';
import SearchFilters          from '@/konnected/learning-library/search-filters/page';
import OfflineContent         from '@/konnected/learning-library/offline-content/page';

// Learning Paths
import MyLearningPath        from '@/konnected/learning-paths/my-learning-path/page';
import CreateLearningPath    from '@/konnected/learning-paths/create-learning-path/page';
import ManageExistingPaths   from '@/konnected/learning-paths/manage-existing-paths/page';

// Teams & Collaboration
import MyTeams             from '@/konnected/teams-collaboration/my-teams/page';
import TeamBuilder         from '@/konnected/teams-collaboration/team-builder/page';
import ActivityPlanner     from '@/konnected/teams-collaboration/activity-planner/page';
import ProjectWorkspaces   from '@/konnected/teams-collaboration/project-workspaces/page';

// Community Discussions
import ActiveThreads         from '@/konnected/community-discussions/active-threads/page';
import StartNewDiscussion    from '@/konnected/community-discussions/start-new-discussion/page';
import Moderation            from '@/konnected/community-discussions/moderation/page';

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
  path: '/konnected/dashboard',
  name: 'Dashboard',
  rtlName: 'Dashboard',
  icon: <DashboardOutlined />,
  component: Dashboard,
  layout: '/konnected',
};

const certificationsGroup: Route = {
  collapse: true,
  name: 'Certifications',
  rtlName: 'Certifications',
  state: 'certificationsCollapse',
  views: [
    { path: '/konnected/certifications/exam-preparation',    name: 'Exam Preparation',        component: ExamPreparation,     layout: '/konnected' },
    { path: '/konnected/certifications/exam-registration',   name: 'Exam Registration',       component: ExamRegistration,    layout: '/konnected' },
    { path: '/konnected/certifications/exam-dashboard-results', name: 'Exam Dashboard & Results', component: ExamDashboardResults, layout: '/konnected' },
    { path: '/konnected/certifications/certification-programs', name: 'Certification Programs',   component: CertificationPrograms, layout: '/konnected' },
  ],
};

const learningLibraryGroup: Route = {
  collapse: true,
  name: 'Learning Library',
  rtlName: 'Learning Library',
  state: 'learningLibraryCollapse',
  views: [
    { path: '/konnected/learning-library/browse-resources',        name: 'Browse Resources',      component: BrowseResources,      layout: '/konnected' },
    { path: '/konnected/learning-library/recommended-resources',   name: 'Recommended Resources', component: RecommendedResources, layout: '/konnected' },
    { path: '/konnected/learning-library/search-filters',         name: 'Search & Filters',      component: SearchFilters,        layout: '/konnected' },
    { path: '/konnected/learning-library/offline-content',        name: 'Offline Content',       component: OfflineContent,       layout: '/konnected' },
  ],
};

const learningPathsGroup: Route = {
  collapse: true,
  name: 'Learning Paths',
  rtlName: 'Learning Paths',
  state: 'learningPathsCollapse',
  views: [
    { path: '/konnected/learning-paths/my-learning-path',    name: 'My Learning Path',    component: MyLearningPath,    layout: '/konnected' },
    { path: '/konnected/learning-paths/create-learning-path',name: 'Create Learning Path',component: CreateLearningPath,layout: '/konnected' },
    { path: '/konnected/learning-paths/manage-existing-paths',name: 'Manage Existing Paths',component: ManageExistingPaths,layout: '/konnected' },
  ],
};

const teamsCollabGroup: Route = {
  collapse: true,
  name: 'Teams & Collaboration',
  rtlName: 'Teams & Collaboration',
  state: 'teamsCollaborationCollapse',
  views: [
    { path: '/konnected/teams-collaboration/my-teams',           name: 'My Teams',          component: MyTeams,         layout: '/konnected' },
    { path: '/konnected/teams-collaboration/team-builder',       name: 'Team Builder',      component: TeamBuilder,     layout: '/konnected' },
    { path: '/konnected/teams-collaboration/activity-planner',   name: 'Activity Planner',  component: ActivityPlanner, layout: '/konnected' },
    { path: '/konnected/teams-collaboration/project-workspaces', name: 'Project Workspaces',component: ProjectWorkspaces,layout: '/konnected' },
  ],
};

const communityGroup: Route = {
  collapse: true,
  name: 'Community Discussions',
  rtlName: 'Community Discussions',
  state: 'communityDiscussionsCollapse',
  views: [
    { path: '/konnected/community-discussions/active-threads',       name: 'Active Threads',      component: ActiveThreads,    layout: '/konnected' },
    { path: '/konnected/community-discussions/start-new-discussion', name: 'Start New Discussion',component: StartNewDiscussion,layout: '/konnected' },
    { path: '/konnected/community-discussions/moderation',           name: 'Moderation',          component: Moderation,        layout: '/konnected' },
  ],
};

const routes: Route[] = [
  directDashboard,
  certificationsGroup,
  learningLibraryGroup,
  learningPathsGroup,
  teamsCollabGroup,
  communityGroup,
];

export default routes;
