'use client';

import React from 'react';
import { DashboardOutlined } from '@ant-design/icons';

// Dashboard
import Dashboard          from '@/kreative/dashboard/page';

// Creative Hub
import ExploreIdeas        from '@/kreative/creative-hub/explore-ideas/page';
import InspirationGallery  from '@/kreative/creative-hub/inspiration-gallery/page';
import SubmitCreativeWork  from '@/kreative/creative-hub/submit-creative-work/page';

// Idea Incubator
import MyIdeas            from '@/kreative/idea-incubator/my-ideas/page';
import CreateNewIdea      from '@/kreative/idea-incubator/create-new-idea/page';
import CollaborateOnIdeas from '@/kreative/idea-incubator/collaborate-on-ideas/page';

// Collaborative Spaces
import MySpaces      from '@/kreative/collaborative-spaces/my-spaces/page';
import FindSpaces    from '@/kreative/collaborative-spaces/find-spaces/page';
import StartNewSpace from '@/kreative/collaborative-spaces/start-new-space/page';

// Community Showcases
import FeaturedProjects from '@/kreative/community-showcases/featured-projects/page';
import TopCreators      from '@/kreative/community-showcases/top-creators/page';
import SubmitToShowcase from '@/kreative/community-showcases/submit-to-showcase/page';

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
  path: '/kreative/dashboard',
  name: 'Dashboard',
  rtlName: 'Dashboard',
  icon: <DashboardOutlined />,
  component: Dashboard,
  layout: '/kreative',
};

const creativeHub: Route = {
  collapse: true,
  name: 'Creative Hub',
  rtlName: 'Creative Hub',
  state: 'creativeHub',
  views: [
    { path: '/kreative/creative-hub/explore-ideas',       name: 'Explore Ideas',      component: ExploreIdeas,       layout: '/kreative' },
    { path: '/kreative/creative-hub/inspiration-gallery', name: 'Inspiration Gallery',component: InspirationGallery, layout: '/kreative' },
    { path: '/kreative/creative-hub/submit-creative-work',name: 'Submit Creative Work',component: SubmitCreativeWork, layout: '/kreative' },
  ],
};

const ideaIncubator: Route = {
  collapse: true,
  name: 'Idea Incubator',
  rtlName: 'Idea Incubator',
  state: 'ideaIncubator',
  views: [
    { path: '/kreative/idea-incubator/my-ideas',            name: 'My Ideas',           component: MyIdeas,            layout: '/kreative' },
    { path: '/kreative/idea-incubator/create-new-idea',     name: 'Create New Idea',    component: CreateNewIdea,      layout: '/kreative' },
    { path: '/kreative/idea-incubator/collaborate-on-ideas',name: 'Collaborate on Ideas',component: CollaborateOnIdeas, layout: '/kreative' },
  ],
};

const collaborativeSpaces: Route = {
  collapse: true,
  name: 'Collaborative Spaces',
  rtlName: 'Collaborative Spaces',
  state: 'collaborativeSpaces',
  views: [
    { path: '/kreative/collaborative-spaces/my-spaces',      name: 'My Spaces',           component: MySpaces,      layout: '/kreative' },
    { path: '/kreative/collaborative-spaces/find-spaces',    name: 'Find Spaces',         component: FindSpaces,    layout: '/kreative' },
    { path: '/kreative/collaborative-spaces/start-new-space',name: 'Start a New Space',   component: StartNewSpace, layout: '/kreative' },
  ],
};

const communityShowcases: Route = {
  collapse: true,
  name: 'Community Showcases',
  rtlName: 'Community Showcases',
  state: 'communityShowcases',
  views: [
    { path: '/kreative/community-showcases/featured-projects',name: 'Featured Projects', component: FeaturedProjects, layout: '/kreative' },
    { path: '/kreative/community-showcases/top-creators',      name: 'Top Creators',      component: TopCreators,      layout: '/kreative' },
    { path: '/kreative/community-showcases/submit-to-showcase',name: 'Submit to Showcase',component: SubmitToShowcase, layout: '/kreative' },
  ],
};

const routes: Route[] = [
  directDashboard,
  creativeHub,
  ideaIncubator,
  collaborativeSpaces,
  communityShowcases,
];

export default routes;
