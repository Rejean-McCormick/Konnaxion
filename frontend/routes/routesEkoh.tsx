import React from 'react';
import { DashboardOutlined } from '@ant-design/icons';

/* ------------------------------------------------------------------
   Pages  – App Router : on importe chaque “page” explicite
   ---------------------------------------------------------------- */
import EkohDashboard         from '@/ekoh/dashboard/page';
import CurrentEkohScore      from '@/ekoh/overview-analytics/current-ekoh-score/page';
import CurrentVotingWeight   from '@/ekoh/voting-influence/current-voting-weight/page';
import ViewCurrentExpertise  from '@/ekoh/expertise-areas/view-current-expertise/page';
import EarnedBadgesDisplay   from '@/ekoh/achievements-badges/earned-badges-display/page';

/* ------------------------------------------------------------------
   Type Route (inchangé, sauf component : accepte maintenant un
   Component Type OU un nœud React)
   ---------------------------------------------------------------- */
export interface Route {
  path: string;
  name: string;
  rtlName?: string;
  icon?: React.ReactNode;
  component?: React.ComponentType | React.ReactNode;
  layout?: string;
  collapse?: boolean;
  state?: string;
  views?: Route[];
}

/* ------------------------------------------------------------------
   Flat routes : Ekoh ne comporte pas de sous‑menus
   ---------------------------------------------------------------- */
const ekohRoutes: Route[] = [
  {
    path:   '/ekoh/dashboard',
    name:   'Dashboard',
    rtlName:'Dashboard',
    icon:   <DashboardOutlined />,   // icône thémée Ant Design
    component: EkohDashboard,
    layout: '/ekoh',
  },
  {
    path:   '/ekoh/overview-analytics/current-ekoh-score',
    name:   'Overview & Analytics',
    rtlName:'Overview & Analytics',
    icon:   null,
    component: CurrentEkohScore,
    layout: '/ekoh',
  },
  {
    path:   '/ekoh/voting-influence/current-voting-weight',
    name:   'Voting Influence',
    rtlName:'Voting Influence',
    icon:   null,
    component: CurrentVotingWeight,
    layout: '/ekoh',
  },
  {
    path:   '/ekoh/expertise-areas/view-current-expertise',
    name:   'Expertise Areas',
    rtlName:'Expertise Areas',
    icon:   null,
    component: ViewCurrentExpertise,
    layout: '/ekoh',
  },
  {
    path:   '/ekoh/achievements-badges/earned-badges-display',
    name:   'Achievements & Badges',
    rtlName:'Achievements & Badges',
    icon:   null,
    component: EarnedBadgesDisplay,
    layout: '/ekoh',
  },
];

export default ekohRoutes;
