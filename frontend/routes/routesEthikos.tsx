/* eslint-disable react/react-in-jsx-scope */

import React from 'react';

/* ------------------------------------------------------------------
   Pulse – dashboard‑style insight pages
   ----------------------------------------------------------------- */
import PulseOverview   from '@/ethikos/pulse/overview/page';
import PulseLive       from '@/ethikos/pulse/live/page';
import PulseTrends     from '@/ethikos/pulse/trends/page';
import PulseHealth     from '@/ethikos/pulse/health/page';

/* ------------------------------------------------------------------
   Deliberate – debates & forums
   ----------------------------------------------------------------- */
import EliteAgora      from '@/ethikos/deliberate/elite/page';
import Guidelines      from '@/ethikos/deliberate/guidelines/page';

/* ------------------------------------------------------------------
   Decide – smart voting
   ----------------------------------------------------------------- */
import EliteBallots    from '@/ethikos/decide/elite/page';
import PublicBallots   from '@/ethikos/decide/public/page';
import ResultsArchive  from '@/ethikos/decide/results/page';
import Methodology     from '@/ethikos/decide/methodology/page';

/* ------------------------------------------------------------------
   Impact
   ----------------------------------------------------------------- */
import ImpactTracker   from '@/ethikos/impact/tracker/page';
import ImpactOutcomes  from '@/ethikos/impact/outcomes/page';
import ImpactFeedback  from '@/ethikos/impact/feedback/page';

/* ------------------------------------------------------------------
   Reputation & Badges
   ----------------------------------------------------------------- */
import MyProfile       from '@/ethikos/trust/profile/page';
import Credentials     from '@/ethikos/trust/credentials/page';
import Badges          from '@/ethikos/trust/badges/page';

/* ------------------------------------------------------------------
   Learn
   ----------------------------------------------------------------- */
import Guides          from '@/ethikos/learn/guides/page';
import Glossary        from '@/ethikos/learn/glossary/page';
import Changelog       from '@/ethikos/learn/changelog/page';

/* ------------------------------------------------------------------
   Admin
   ----------------------------------------------------------------- */
import AdminModeration from '@/ethikos/admin/moderation/page';
import AdminRoles      from '@/ethikos/admin/roles/page';
import AdminAudit      from '@/ethikos/admin/audit/page';

/* ------------------------------------------------------------------
   Route type
   ----------------------------------------------------------------- */
export interface Route {
  path:      string;
  name:      string;
  rtlName?:  string;
  icon?:     React.ReactNode;
  /** a React component class/function *or* a ready‑to‑render node */
  component?: React.ComponentType<any> | React.ReactNode;
  layout?:   string;
  collapse?: boolean;
  state?:    string;
  views?:    Route[];
}

/* ------------------------------------------------------------------
   Route groups
   ----------------------------------------------------------------- */

const pulse: Route = {
  collapse: true,
  name:     'Pulse',
  rtlName:  'Pulse',
  icon:     null,
  state:    'pulseCollapse',
  views: [
    { path: '/ethikos/pulse/overview', name: 'Overview',               component: PulseOverview, layout: '/ethikos' },
    { path: '/ethikos/pulse/live',     name: 'Live Metrics',           component: PulseLive,     layout: '/ethikos' },
    { path: '/ethikos/pulse/trends',   name: 'Trends',                 component: PulseTrends,   layout: '/ethikos' },
    { path: '/ethikos/pulse/health',   name: 'Participation Health',   component: PulseHealth,   layout: '/ethikos' },
  ],
};

const deliberate: Route = {
  collapse: true,
  name:     'Debates & Forums',
  rtlName:  'Debates & Forums',
  icon:     null,
  state:    'debatesForumsCollapse',
  views: [
    { path: '/ethikos/deliberate/elite',      name: 'Elite Agora',          component: EliteAgora,  layout: '/ethikos' },
    { path: '/ethikos/deliberate/guidelines', name: 'Community Guidelines', component: Guidelines,  layout: '/ethikos' },
  ],
};

const decide: Route = {
  collapse: true,
  name:     'Smart Voting',
  rtlName:  'Smart Voting',
  icon:     null,
  state:    'smartVotingCollapse',
  views: [
    { path: '/ethikos/decide/elite',       name: 'Elite Ballots',    component: EliteBallots,   layout: '/ethikos' },
    { path: '/ethikos/decide/public',      name: 'Public Ballots',   component: PublicBallots,  layout: '/ethikos' },
    { path: '/ethikos/decide/results',     name: 'Results Archive',  component: ResultsArchive, layout: '/ethikos' },
    { path: '/ethikos/decide/methodology', name: 'Methodology',      component: Methodology,    layout: '/ethikos' },
  ],
};

const impact: Route = {
  collapse: true,
  name:     'Impact',
  rtlName:  'Impact',
  icon:     null,
  state:    'impactCollapse',
  views: [
    { path: '/ethikos/impact/tracker',  name: 'Implementation Tracker', component: ImpactTracker,  layout: '/ethikos' },
    { path: '/ethikos/impact/outcomes', name: 'Outcomes Dashboard',     component: ImpactOutcomes, layout: '/ethikos' },
    { path: '/ethikos/impact/feedback', name: 'Feedback Loops',         component: ImpactFeedback, layout: '/ethikos' },
  ],
};

const reputationBadges: Route = {
  collapse: true,
  name:     'Reputation & Badges',
  rtlName:  'Reputation & Badges',
  icon:     null,
  state:    'reputationBadgesCollapse',
  views: [
    { path: '/ethikos/trust/profile',     name: 'My Profile',            component: MyProfile,   layout: '/ethikos' },
    { path: '/ethikos/trust/credentials', name: 'Credentials',           component: Credentials, layout: '/ethikos' },
    { path: '/ethikos/trust/badges',      name: 'Badges & Achievements', component: Badges,      layout: '/ethikos' },
  ],
};

const learn: Route = {
  collapse: true,
  name:     'Learn',
  rtlName:  'Learn',
  icon:     null,
  state:    'learnCollapse',
  views: [
    { path: '/ethikos/learn/guides',    name: 'Guides',    component: Guides,    layout: '/ethikos' },
    { path: '/ethikos/learn/glossary',  name: 'Glossary',  component: Glossary,  layout: '/ethikos' },
    { path: '/ethikos/learn/changelog', name: 'Changelog', component: Changelog, layout: '/ethikos' },
  ],
};

const admin: Route = {
  collapse: true,
  name:     'Admin',
  rtlName:  'Admin',
  icon:     null,
  state:    'adminCollapse',
  views: [
    { path: '/ethikos/admin/moderation', name: 'Moderation',      component: AdminModeration, layout: '/ethikos' },
    { path: '/ethikos/admin/roles',      name: 'Role Management', component: AdminRoles,      layout: '/ethikos' },
    { path: '/ethikos/admin/audit',      name: 'Audit Logs',      component: AdminAudit,      layout: '/ethikos' },
  ],
};

/* ------------------------------------------------------------------
   Export combined list
   ----------------------------------------------------------------- */
const ethikosRoutes: Route[] = [
  pulse,
  deliberate,
  decide,
  impact,
  reputationBadges,
  learn,
  admin,
];

export default ethikosRoutes;
