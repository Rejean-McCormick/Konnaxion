'use client'

import React from 'react'
import { DashboardOutlined } from '@ant-design/icons'

// Type local minimal pour éviter toute dépendance
type Route = { path?: string; name: string; icon?: React.ReactNode; views?: Route[] }

// NOTE: test routes '/index.test' supprimées à la source
const directDashboard: Route = { path: '/kreative/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> }

const collaborative_spacesGroup: Route = {
  name: 'Collaborative Spaces',
  views: [
    { path: '/kreative/collaborative-spaces/find-spaces', name: 'Find Spaces' },
    { path: '/kreative/collaborative-spaces/start-new-space', name: 'Start New Space' },
    { path: '/kreative/collaborative-spaces/my-spaces', name: 'My Spaces' }
  ]
}

const community_showcasesGroup: Route = {
  name: 'Community Showcases',
  views: [
    { path: '/kreative/community-showcases/featured-projects', name: 'Featured Projects' },
    { path: '/kreative/community-showcases/top-creators', name: 'Top Creators' },
    { path: '/kreative/community-showcases/submit-to-showcase', name: 'Submit To Showcase' }
  ]
}

const creative_hubGroup: Route = {
  name: 'Creative Hub',
  views: [
    { path: '/kreative/creative-hub/explore-ideas', name: 'Explore Ideas' },
    { path: '/kreative/creative-hub/submit-creative-work', name: 'Submit Creative Work' },
    { path: '/kreative/creative-hub/inspiration-gallery', name: 'Inspiration Gallery' }
  ]
}

const idea_incubatorGroup: Route = {
  name: 'Idea Incubator',
  views: [
    { path: '/kreative/idea-incubator/collaborate-on-ideas', name: 'Collaborate On Ideas' },
    { path: '/kreative/idea-incubator/create-new-idea', name: 'Create New Idea' },
    { path: '/kreative/idea-incubator/my-ideas', name: 'My Ideas' }
  ]
}

const routes: Route[] = [
  directDashboard,
  collaborative_spacesGroup,
  community_showcasesGroup,
  creative_hubGroup,
  idea_incubatorGroup
]

export default routes
