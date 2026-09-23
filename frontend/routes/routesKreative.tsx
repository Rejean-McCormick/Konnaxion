'use client';

import {
  BulbOutlined,
  CloudUploadOutlined,
  CrownOutlined,
  DashboardOutlined,
  HighlightOutlined,
  HomeOutlined,
  MessageOutlined,
  PictureOutlined,
  ProfileOutlined,
  SearchOutlined,
  StarOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

export const KREATIVE_ROUTES = {
  dashboard: '/kreative/dashboard',
  creativeHub: {
    exploreIdeas: '/kreative/creative-hub/explore-ideas',
    inspirationGallery: '/kreative/creative-hub/inspiration-gallery',
    submitCreativeWork: '/kreative/creative-hub/submit-creative-work',
  },
  ideaIncubator: {
    collaborateOnIdeas: '/kreative/idea-incubator/collaborate-on-ideas',
    createNewIdea: '/kreative/idea-incubator/create-new-idea',
    myIdeas: '/kreative/idea-incubator/my-ideas',
  },
  collaborativeSpaces: {
    findSpaces: '/kreative/collaborative-spaces/find-spaces',
    startNewSpace: '/kreative/collaborative-spaces/start-new-space',
    mySpaces: '/kreative/collaborative-spaces/my-spaces',
  },
  communityShowcases: {
    featuredProjects: '/kreative/community-showcases/featured-projects',
    topCreators: '/kreative/community-showcases/top-creators',
    submitToShowcase: '/kreative/community-showcases/submit-to-showcase',
  },
} as const;

const overview: Route = {
  path: KREATIVE_ROUTES.dashboard,
  name: 'Overview',
  labelKey: 'navigation.overview',
  icon: <DashboardOutlined />,
};

const creativeHubGroup: Route = {
  name: 'Creative Hub',
  labelKey: 'navigation.creativeHub',
  views: [
    {
      path: KREATIVE_ROUTES.creativeHub.exploreIdeas,
      name: 'Explore ideas',
      labelKey: 'navigation.exploreIdeas',
      icon: <BulbOutlined />,
    },
    {
      path: KREATIVE_ROUTES.creativeHub.inspirationGallery,
      name: 'Inspiration gallery',
      labelKey: 'navigation.inspirationGallery',
      icon: <PictureOutlined />,
    },
    {
      path: KREATIVE_ROUTES.creativeHub.submitCreativeWork,
      name: 'Submit creative work',
      labelKey: 'navigation.submitCreativeWork',
      icon: <CloudUploadOutlined />,
    },
  ],
};

const ideaIncubatorGroup: Route = {
  name: 'Idea Incubator',
  labelKey: 'navigation.ideaIncubator',
  views: [
    {
      path: KREATIVE_ROUTES.ideaIncubator.collaborateOnIdeas,
      name: 'Collaborate on ideas',
      labelKey: 'navigation.collaborateOnIdeas',
      icon: <TeamOutlined />,
    },
    {
      path: KREATIVE_ROUTES.ideaIncubator.createNewIdea,
      name: 'Create new idea',
      labelKey: 'navigation.createNewIdea',
      icon: <HighlightOutlined />,
    },
    {
      path: KREATIVE_ROUTES.ideaIncubator.myIdeas,
      name: 'My ideas',
      labelKey: 'navigation.myIdeas',
      icon: <ProfileOutlined />,
    },
  ],
};

const collaborativeSpacesGroup: Route = {
  name: 'Collaborative Spaces',
  labelKey: 'navigation.collaborativeSpaces',
  views: [
    {
      path: KREATIVE_ROUTES.collaborativeSpaces.findSpaces,
      name: 'Find spaces',
      labelKey: 'navigation.findSpaces',
      icon: <SearchOutlined />,
    },
    {
      path: KREATIVE_ROUTES.collaborativeSpaces.startNewSpace,
      name: 'Start new space',
      labelKey: 'navigation.startNewSpace',
      icon: <HomeOutlined />,
    },
    {
      path: KREATIVE_ROUTES.collaborativeSpaces.mySpaces,
      name: 'My spaces',
      labelKey: 'navigation.mySpaces',
      icon: <MessageOutlined />,
    },
  ],
};

const communityShowcasesGroup: Route = {
  name: 'Community Showcases',
  labelKey: 'navigation.communityShowcases',
  views: [
    {
      path: KREATIVE_ROUTES.communityShowcases.featuredProjects,
      name: 'Featured projects',
      labelKey: 'navigation.featuredProjects',
      icon: <StarOutlined />,
    },
    {
      path: KREATIVE_ROUTES.communityShowcases.topCreators,
      name: 'Top creators',
      labelKey: 'navigation.topCreators',
      icon: <CrownOutlined />,
    },
    {
      path: KREATIVE_ROUTES.communityShowcases.submitToShowcase,
      name: 'Submit to showcase',
      labelKey: 'navigation.submitToShowcase',
      icon: <CloudUploadOutlined />,
    },
  ],
};

const routes: Route[] = [
  overview,
  creativeHubGroup,
  ideaIncubatorGroup,
  collaborativeSpacesGroup,
  communityShowcasesGroup,
];

export default routes;
