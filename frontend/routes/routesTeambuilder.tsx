'use client';

import {
  BookOutlined,
  DashboardOutlined,
  GlobalOutlined,
  PartitionOutlined,
  PlusCircleOutlined,
  TeamOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import React from 'react';

import type { Route } from './types';

const sessionsGroup: Route = {
  name: 'Sessions',
  scope: 'module',
  moduleKey: 'teambuilder',
  views: [
    {
      path: '/teambuilder',
      name: 'All sessions',
      icon: <DashboardOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/create',
      name: 'New session',
      icon: <PlusCircleOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
  ],
};

const problemsGroup: Route = {
  name: 'Problems',
  scope: 'module',
  moduleKey: 'teambuilder',
  views: [
    {
      path: '/teambuilder/problems',
      name: 'Problem library',
      icon: <BookOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/problems/create',
      name: 'New problem',
      icon: <PlusCircleOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/problems/taxonomy',
      name: 'UNESCO taxonomy',
      icon: <PartitionOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
  ],
};

const peopleGroup: Route = {
  name: 'People & Constraints',
  scope: 'module',
  moduleKey: 'teambuilder',
  views: [
    {
      path: '/teambuilder/humans',
      name: 'People overview',
      icon: <TeamOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/humans/constraints',
      name: 'Language, geo & schedule',
      icon: <GlobalOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/humans/conflicts',
      name: 'Conflicts & pairing',
      icon: <WarningOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/humans/modes',
      name: 'Team modes',
      icon: <UserSwitchOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
  ],
};

const routes: Route[] = [sessionsGroup, problemsGroup, peopleGroup];

export default routes;
