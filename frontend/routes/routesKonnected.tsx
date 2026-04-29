// FILE: frontend/routes/routesKonnected.tsx
"use client";

import React from "react";
import {
  ApiOutlined,
  AppstoreOutlined,
  AuditOutlined,
  BookOutlined,
  BranchesOutlined,
  BuildOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  DashboardOutlined,
  DownloadOutlined,
  EditOutlined,
  FileDoneOutlined,
  FormOutlined,
  LikeOutlined,
  MessageOutlined,
  PlayCircleOutlined,
  ProfileOutlined,
  ReadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SolutionOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

export const KONNECTED_ROUTES = {
  overview: "/konnected/dashboard",

  knowledge: {
    catalog: "/learn",
    search: "/learn/search",
    recommendations: "/learn/recommendations",
    contribute: "/learn/contribute",
    coCreation: "/learn/co-create",
    forums: "/learn/forums",
    progress: "/learn/progress",
    offline: "/learn/offline",

    // Dynamic route, intentionally not directly exposed in the sidebar.
    coursePlayer: "/course/[slug]",
  },

  certifikation: {
    center: "/certs",
    programs: "/certs/programs",
    evaluations: "/certs/evaluations",
    examRegistration: "/certs/registration",
    preparation: "/certs/preparation",
    peerValidation: "/certs/peer-validation",
    myCertificates: "/certs/my-certificates",
    portfolio: "/certs/portfolio",
    interoperability: "/certs/interoperability",
    mentorship: "/certs/mentorship",
  },

  collaboration: {
    teams: "/konnected/teams",
    projects: "/konnected/projects",
    teamBuilder: "/konnected/team-builder",
  },
} as const;

const konnectedDashboard: Route = {
  path: KONNECTED_ROUTES.overview,
  name: "KonnectED – Overview",
  icon: <DashboardOutlined />,
};

const knowledgeGroup: Route = {
  name: "Knowledge",
  views: [
    {
      path: KONNECTED_ROUTES.knowledge.catalog,
      name: "Catalog",
      icon: <BookOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.search,
      name: "Search",
      icon: <SearchOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.recommendations,
      name: "Recommended",
      icon: <LikeOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.contribute,
      name: "Contribute",
      icon: <EditOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.coCreation,
      name: "Co-creation",
      icon: <BranchesOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.forums,
      name: "Forums",
      icon: <CommentOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.progress,
      name: "Progress",
      icon: <CheckCircleOutlined />,
    },
    {
      path: KONNECTED_ROUTES.knowledge.offline,
      name: "Offline",
      icon: <DownloadOutlined />,
    },
  ],
};

const courseGroup: Route = {
  name: "Courses",
  views: [
    {
      path: "/course",
      name: "Course player",
      icon: <PlayCircleOutlined />,
    },
    {
      path: "/course/library",
      name: "Course library",
      icon: <ReadOutlined />,
    },
    {
      path: "/course/progress",
      name: "My course progress",
      icon: <ProfileOutlined />,
    },
  ],
};

const certifikationGroup: Route = {
  name: "CertifiKation",
  views: [
    {
      path: KONNECTED_ROUTES.certifikation.center,
      name: "Center",
      icon: <SafetyCertificateOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.programs,
      name: "Programs",
      icon: <AppstoreOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.evaluations,
      name: "Evaluations",
      icon: <FormOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.examRegistration,
      name: "Registration",
      icon: <AuditOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.preparation,
      name: "Preparation",
      icon: <BulbOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.peerValidation,
      name: "Peer validation",
      icon: <UserSwitchOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.myCertificates,
      name: "My certificates",
      icon: <TrophyOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.portfolio,
      name: "Skills portfolio",
      icon: <FileDoneOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.interoperability,
      name: "Interoperability",
      icon: <ApiOutlined />,
    },
    {
      path: KONNECTED_ROUTES.certifikation.mentorship,
      name: "Mentorship",
      icon: <SolutionOutlined />,
    },
  ],
};

const collaborationGroup: Route = {
  name: "Collaboration",
  views: [
    {
      path: KONNECTED_ROUTES.collaboration.teams,
      name: "Teams",
      icon: <TeamOutlined />,
    },
    {
      path: KONNECTED_ROUTES.collaboration.projects,
      name: "Projects",
      icon: <BuildOutlined />,
    },
    {
      path: KONNECTED_ROUTES.collaboration.teamBuilder,
      name: "Team builder",
      icon: <MessageOutlined />,
    },
  ],
};

const routes: Route[] = [
  konnectedDashboard,
  knowledgeGroup,
  courseGroup,
  certifikationGroup,
  collaborationGroup,
];

export default routes;