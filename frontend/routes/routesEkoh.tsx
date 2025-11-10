'use client'

import React from 'react'
import { DashboardOutlined } from '@ant-design/icons'

// Type local minimal pour éviter toute dépendance
type Route = { path?: string; name: string; icon?: React.ReactNode; views?: Route[] }

// NOTE: test routes '/index.test' supprimées à la source
const directDashboard: Route = { path: '/ekoh/dashboard', name: 'Dashboard', icon: <DashboardOutlined /> }

const achievements_badgesGroup: Route = {
  name: 'Achievements Badges',
  views: [{ path: '/ekoh/achievements-badges/earned-badges-display', name: 'Earned Badges Display' }]
}

const overview_analyticsGroup: Route = {
  name: 'Overview Analytics',
  views: [{ path: '/ekoh/overview-analytics/current-ekoh-score', name: 'Current Ekoh Score' }]
}

const voting_influenceGroup: Route = {
  name: 'Voting Influence',
  views: [{ path: '/ekoh/voting-influence/current-voting-weight', name: 'Current Voting Weight' }]
}

const expertise_areasGroup: Route = {
  name: 'Expertise Areas',
  views: [{ path: '/ekoh/expertise-areas/view-current-expertise', name: 'View Current Expertise' }]
}

const routes: Route[] = [
  directDashboard,
  achievements_badgesGroup,
  expertise_areasGroup,
  overview_analyticsGroup,
  voting_influenceGroup
]

export default routes
