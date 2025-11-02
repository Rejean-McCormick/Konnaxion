'use client'

import React from 'react'
import { DashboardOutlined } from '@ant-design/icons'

// Type local minimal pour éviter toute dépendance
type Route = { path?: string; name: string; icon?: React.ReactNode; views?: Route[] }

const directDashboard: Route = { path: '/ekoh/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> }

const achievements_badgesGroup: Route = {
  name: 'Achievements Badges',
  views: [
    { path: '/ekoh/achievements-badges/earned-badges-display', name: 'Earned Badges Display' },
    { path: '/ekoh/achievements-badges/earned-badges-display/index.test', name: 'Index.test' }
  ]
}

const overview_analyticsGroup: Route = {
  name: 'Overview Analytics',
  views: [
    { path: '/ekoh/overview-analytics/current-ekoh-score', name: 'Current Ekoh Score' },
    { path: '/ekoh/overview-analytics/current-ekoh-score/index.test', name: 'Index.test' }
  ]
}

const voting_influenceGroup: Route = {
  name: 'Voting Influence',
  views: [
    { path: '/ekoh/voting-influence/current-voting-weight', name: 'Current Voting Weight' },
    { path: '/ekoh/voting-influence/current-voting-weight/index.test', name: 'Index.test' }
  ]
}

const expertise_areasGroup: Route = {
  name: 'Expertise Areas',
  views: [
    { path: '/ekoh/expertise-areas/view-current-expertise', name: 'View Current Expertise' },
    { path: '/ekoh/expertise-areas/view-current-expertise/index.test', name: 'Index.test' }
  ]
}

const routes: Route[] = [directDashboard, achievements_badgesGroup, expertise_areasGroup, overview_analyticsGroup, voting_influenceGroup]

export default routes
