// FILE: frontend/routes/routesEkoh.tsx
"use client";

import React from "react";
import {
  AuditOutlined,
  BarChartOutlined,
  BorderOutlined,
  DashboardOutlined,
  DeploymentUnitOutlined,
  EyeInvisibleOutlined,
  FieldTimeOutlined,
  HistoryOutlined,
  LineChartOutlined,
  RadarChartOutlined,
  SafetyOutlined,
  SettingOutlined,
  StarOutlined,
  TrophyOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";

import type { Route } from "@/components/layout-components/Menu";

/**
 * EkoH module navigation.
 *
 * Route principles:
 * - EkoH owns user-facing identity, reputation, expertise, privacy, badges,
 *   and score history.
 * - Smart Vote / Konsensus is a sibling consensus surface powered by EkoH.
 * - Admin/platform-wide configuration remains under /kontrol.
 * - Read-only analytics reports remain under /reports.
 */
export const EKOH_ROUTES = {
  ekoh: {
    dashboard: "/ekoh/dashboard",

    // Canonical EkoH user-facing routes.
    score: "/ekoh/score",
    expertise: "/ekoh/expertise",
    ethics: "/ekoh/ethics",
    badges: "/ekoh/badges",
    history: "/ekoh/history",
    privacy: "/ekoh/privacy",
    visualizations: "/ekoh/visualizations",

    // Legacy compatibility routes.
    legacyScore: "/ekoh/overview-analytics/current-ekoh-score",
    legacyExpertise: "/ekoh/expertise-areas/view-current-expertise",
    legacyBadges: "/ekoh/achievements-badges/earned-badges-display",
    legacyVotingWeight: "/ekoh/voting-influence/current-voting-weight",
  },

  konsensus: {
    center: "/konsensus",
    activityFeed: "/konsensus/activity-feed",
    results: "/konsensus/results",
    modalities: "/konsensus/modalities",
    emergingExperts: "/konsensus/emerging-experts",
  },

  reports: {
    smartVote: "/reports/smart-vote",
  },

  kontrol: {
    // Future/admin-only surfaces; not exposed here by default:
    // /kontrol/ekoh/score-configuration
    // /kontrol/ekoh/domain-taxonomy
    // /kontrol/smart-vote/modality-configuration
  },
} as const;

const ekohDashboard: Route = {
  path: EKOH_ROUTES.ekoh.dashboard,
  name: "EkoH – Overview",
  icon: <DashboardOutlined />,
};

const reputationGroup: Route = {
  name: "Reputation",
  views: [
    {
      path: EKOH_ROUTES.ekoh.score,
      name: "Score & analytics",
      icon: <LineChartOutlined />,
    },
    {
      path: EKOH_ROUTES.ekoh.ethics,
      name: "Ethical multiplier",
      icon: <SafetyOutlined />,
    },
    {
      path: EKOH_ROUTES.ekoh.visualizations,
      name: "Visualizations",
      icon: <RadarChartOutlined />,
    },
    {
      path: EKOH_ROUTES.ekoh.history,
      name: "Score history",
      icon: <HistoryOutlined />,
    },
  ],
};

const expertiseGroup: Route = {
  name: "Expertise",
  views: [
    {
      path: EKOH_ROUTES.ekoh.expertise,
      name: "Expertise domains",
      icon: <DeploymentUnitOutlined />,
    },
    {
      path: EKOH_ROUTES.ekoh.badges,
      name: "Achievements & badges",
      icon: <StarOutlined />,
    },
    {
      path: EKOH_ROUTES.ekoh.privacy,
      name: "Privacy settings",
      icon: <EyeInvisibleOutlined />,
    },
  ],
};

const smartVoteGroup: Route = {
  name: "Smart Vote",
  views: [
    {
      path: EKOH_ROUTES.konsensus.center,
      name: "Konsensus Center",
      icon: <UsergroupAddOutlined />,
    },
    {
      path: EKOH_ROUTES.ekoh.legacyVotingWeight,
      name: "Voting weight",
      icon: <BorderOutlined />,
    },
    {
      path: EKOH_ROUTES.konsensus.results,
      name: "Live results",
      icon: <BarChartOutlined />,
    },
    {
      path: EKOH_ROUTES.konsensus.modalities,
      name: "Voting modalities",
      icon: <SettingOutlined />,
    },
    {
      path: EKOH_ROUTES.konsensus.emergingExperts,
      name: "Emerging experts",
      icon: <TrophyOutlined />,
    },
    {
      path: EKOH_ROUTES.konsensus.activityFeed,
      name: "Activity feed",
      icon: <FieldTimeOutlined />,
    },
    {
      path: EKOH_ROUTES.reports.smartVote,
      name: "Smart Vote reports",
      icon: <AuditOutlined />,
    },
  ],
};

const routes: Route[] = [
  ekohDashboard,
  reputationGroup,
  expertiseGroup,
  smartVoteGroup,
];

export default routes;