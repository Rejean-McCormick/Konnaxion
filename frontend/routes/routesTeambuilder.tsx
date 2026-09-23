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
  labelKey: 'navigation.sessions',
  scope: 'module',
  moduleKey: 'teambuilder',
  views: [
    {
      path: '/teambuilder',
      name: 'All sessions',
      labelKey: 'navigation.allSessions',
      icon: <DashboardOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/create',
      name: 'New session',
      labelKey: 'navigation.newSession',
      icon: <PlusCircleOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
  ],
};

const problemsGroup: Route = {
  name: 'Problems',
  labelKey: 'navigation.problems',
  scope: 'module',
  moduleKey: 'teambuilder',
  views: [
    {
      path: '/teambuilder/problems',
      name: 'Problem library',
      labelKey: 'navigation.problemLibrary',
      icon: <BookOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/problems/create',
      name: 'New problem',
      labelKey: 'navigation.newProblem',
      icon: <PlusCircleOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/problems/taxonomy',
      name: 'UNESCO taxonomy',
      labelKey: 'navigation.unescoTaxonomy',
      icon: <PartitionOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
  ],
};

const peopleGroup: Route = {
  name: 'People & Constraints',
  labelKey: 'navigation.peopleConstraints',
  scope: 'module',
  moduleKey: 'teambuilder',
  views: [
    {
      path: '/teambuilder/humans',
      name: 'People overview',
      labelKey: 'navigation.peopleOverview',
      icon: <TeamOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/humans/constraints',
      name: 'Language, geo & schedule',
      labelKey: 'navigation.languageGeoSchedule',
      icon: <GlobalOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/humans/conflicts',
      name: 'Conflicts & pairing',
      labelKey: 'navigation.conflictsPairing',
      icon: <WarningOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
    {
      path: '/teambuilder/humans/modes',
      name: 'Team modes',
      labelKey: 'navigation.teamModes',
      icon: <UserSwitchOutlined />,
      scope: 'module',
      moduleKey: 'teambuilder',
    },
  ],
};

const routes: Route[] = [sessionsGroup, problemsGroup, peopleGroup];

export default routes;
