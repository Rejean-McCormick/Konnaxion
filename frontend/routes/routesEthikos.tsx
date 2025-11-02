'use client'

import React from 'react'

// Type local minimal pour éviter toute dépendance
type Route = { path?: string; name: string; icon?: React.ReactNode; views?: Route[] }

const learnGroup: Route = {
  name: 'Learn',
  views: [
    { path: '/ethikos/learn/changelog', name: 'Changelog' },
    { path: '/ethikos/learn/glossary', name: 'Glossary' },
    { path: '/ethikos/learn/guides', name: 'Guides' }
  ]
}

const adminGroup: Route = {
  name: 'Admin',
  views: [
    { path: '/ethikos/admin/audit', name: 'Audit' },
    { path: '/ethikos/admin/roles', name: 'Roles' },
    { path: '/ethikos/admin/moderation', name: 'Moderation' }
  ]
}

const decideGroup: Route = {
  name: 'Decide',
  views: [
    { path: '/ethikos/decide/elite', name: 'Elite' },
    { path: '/ethikos/decide/public', name: 'Public' },
    { path: '/ethikos/decide/methodology', name: 'Methodology' },
    { path: '/ethikos/decide/results', name: 'Results' }
  ]
}

const impactGroup: Route = {
  name: 'Impact',
  views: [
    { path: '/ethikos/impact/feedback', name: 'Feedback' },
    { path: '/ethikos/impact/outcomes', name: 'Outcomes' },
    { path: '/ethikos/impact/tracker', name: 'Tracker' }
  ]
}

const deliberateGroup: Route = {
  name: 'Deliberate',
  views: [
    { path: '/ethikos/deliberate/elite', name: 'Elite' },
    { path: '/ethikos/deliberate/guidelines', name: 'Guidelines' },
    { path: '/ethikos/deliberate/[topic]', name: 'Topic' }
  ]
}

const pulseGroup: Route = {
  name: 'Pulse',
  views: [
    { path: '/ethikos/pulse/live', name: 'Live' },
    { path: '/ethikos/pulse/health', name: 'Health' },
    { path: '/ethikos/pulse/overview', name: 'Overview' },
    { path: '/ethikos/pulse/trends', name: 'Trends' }
  ]
}

const trustGroup: Route = {
  name: 'Trust',
  views: [
    { path: '/ethikos/trust/badges', name: 'Badges' },
    { path: '/ethikos/trust/profile', name: 'Profile' },
    { path: '/ethikos/trust/credentials', name: 'Credentials' }
  ]
}

const routes: Route[] = [adminGroup, decideGroup, deliberateGroup, impactGroup, learnGroup, pulseGroup, trustGroup]

export default routes
