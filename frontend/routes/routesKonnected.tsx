'use client';

import {
  AppstoreOutlined,
  AuditOutlined,
  BookOutlined,
  BuildOutlined,
  BulbOutlined,
  CommentOutlined,
  DashboardOutlined,
  DownloadOutlined,
  EditOutlined,
  FileDoneOutlined,
  FormOutlined,
  LikeOutlined,
  PlusCircleOutlined,
  ProfileOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

export const KONNECTED_ROUTES = {
  dashboard: '/konnected/dashboard',
  learningLibrary: {
    browse: '/konnected/learning-library/browse-resources',
    search: '/konnected/learning-library/search-filters',
    recommendations: '/konnected/learning-library/recommended-resources',
    offline: '/konnected/learning-library/offline-content',
  },
  learningPaths: {
    mine: '/konnected/learning-paths/my-learning-path',
    create: '/konnected/learning-paths/create-learning-path',
    manage: '/konnected/learning-paths/manage-existing-paths',
  },
  certifications: {
    programs: '/konnected/certifications/certification-programs',
    examDashboard: '/konnected/certifications/exam-dashboard-results',
    preparation: '/konnected/certifications/exam-preparation',
    registration: '/konnected/certifications/exam-registration',
  },
  communityDiscussions: {
    activeThreads: '/konnected/community-discussions/active-threads',
    startDiscussion: '/konnected/community-discussions/start-new-discussion',
    moderation: '/konnected/community-discussions/moderation',
  },
  teamsCollaboration: {
    myTeams: '/konnected/teams-collaboration/my-teams',
    activityPlanner: '/konnected/teams-collaboration/activity-planner',
    projectWorkspaces: '/konnected/teams-collaboration/project-workspaces',
    createTeam: '/konnected/teams-collaboration/team-builder',
  },
} as const;

const overview: Route = {
  path: KONNECTED_ROUTES.dashboard,
  name: 'Overview',
  labelKey: 'navigation.overview',
  icon: <DashboardOutlined />,
};

const learningLibraryGroup: Route = {
  name: 'Learning Library',
  labelKey: 'navigation.learningLibrary',
  views: [
    {
      path: KONNECTED_ROUTES.learningLibrary.browse,
      name: 'Browse resources',
      labelKey: 'navigation.browseResources',
      icon: <BookOutlined />,
    },
    {
      path: KONNECTED_ROUTES.learningLibrary.search,
      name: 'Search / filters',
      labelKey: 'navigation.searchFilters',
      icon: <SearchOutlined />,
    },
    {
      path: KONNECTED_ROUTES.learningLibrary.recommendations,
      name: 'Recommended resources',
      labelKey: 'navigation.recommendedResources',
      icon: <LikeOutlined />,
    },
    {
      path: KONNECTED_ROUTES.learningLibrary.offline,
      name: 'Offline content',
      labelKey: 'navigation.offlineContent',
      icon: <DownloadOutlined />,
    },
  ],
};

const learningPathsGroup: Route = {
  name: 'Learning Paths',
  labelKey: 'navigation.learningPaths',
  views: [
    {
      path: KONNECTED_ROUTES.learningPaths.mine,
      name: 'My learning path',
      labelKey: 'navigation.myLearningPath',
      icon: <ProfileOutlined />,
    },
    {
      path: KONNECTED_ROUTES.learningPaths.create,
      name: 'Create learning path',
      labelKey: 'navigation.createLearningPath',
      icon: <FormOutlined />,
    },
    {
      path: KONNECTED_ROUTES.learningPaths.manage,
      name: 'Manage existing paths',
      labelKey: 'navigation.manageExistingPaths',
      icon: <BuildOutlined />,
    },
  ],
};

const certificationsGroup: Route = {
  name: 'Certifications',
  labelKey: 'navigation.certifications',
  views: [
    {
      path: KONNECTED_ROUTES.certifications.programs,
      name: 'Certification programs',
      labelKey: 'navigation.certificationPrograms',
      icon: <SafetyCertificateOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifications.examDashboard,
      name: 'Exam dashboard / results',
      labelKey: 'navigation.examDashboardResults',
      icon: <TrophyOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifications.preparation,
      name: 'Exam preparation',
      labelKey: 'navigation.examPreparation',
      icon: <BulbOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifications.registration,
      name: 'Exam registration',
      labelKey: 'navigation.examRegistration',
      icon: <AuditOutlined />,
    },
  ],
};

const communityGroup: Route = {
  name: 'Community Discussions',
  labelKey: 'navigation.communityDiscussions',
  views: [
    {
      path: KONNECTED_ROUTES.communityDiscussions.activeThreads,
      name: 'Active threads',
      labelKey: 'navigation.activeThreads',
      icon: <CommentOutlined />,
    },
    {
      path: KONNECTED_ROUTES.communityDiscussions.startDiscussion,
      name: 'Start new discussion',
      labelKey: 'navigation.startNewDiscussion',
      icon: <EditOutlined />,
    },
    {
      path: KONNECTED_ROUTES.communityDiscussions.moderation,
      name: 'Moderation',
      labelKey: 'navigation.moderation',
      icon: <FileDoneOutlined />,
    },
  ],
};

const collaborationGroup: Route = {
  name: 'Teams Collaboration',
  labelKey: 'navigation.teamsCollaboration',
  views: [
    {
      path: KONNECTED_ROUTES.teamsCollaboration.myTeams,
      name: 'My teams',
      labelKey: 'navigation.myTeams',
      icon: <TeamOutlined />,
    },
    {
      path: KONNECTED_ROUTES.teamsCollaboration.activityPlanner,
      name: 'Activity planner',
      labelKey: 'navigation.activityPlanner',
      icon: <FormOutlined />,
    },
    {
      path: KONNECTED_ROUTES.teamsCollaboration.projectWorkspaces,
      name: 'Project workspaces',
      labelKey: 'navigation.projectWorkspaces',
      icon: <AppstoreOutlined />,
    },
    {
      path: KONNECTED_ROUTES.teamsCollaboration.createTeam,
      name: 'Create team',
      labelKey: 'navigation.createTeam',
      icon: <PlusCircleOutlined />,
    },
  ],
};

const routes: Route[] = [
  overview,
  learningLibraryGroup,
  learningPathsGroup,
  certificationsGroup,
  communityGroup,
  collaborationGroup,
];

export default routes;
