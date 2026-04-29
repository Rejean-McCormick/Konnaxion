// FILE: frontend/routes/routesKreative.tsx
"use client";

import React from "react";
import {
  BankOutlined,
  BulbOutlined,
  CloudUploadOutlined,
  CrownOutlined,
  DashboardOutlined,
  EyeOutlined,
  GlobalOutlined,
  HighlightOutlined,
  HomeOutlined,
  IdcardOutlined,
  LinkOutlined,
  MessageOutlined,
  PictureOutlined,
  ProfileOutlined,
  SearchOutlined,
  ShopOutlined,
  StarOutlined,
  TeamOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";

type Route = {
  path?: string;
  name: string;
  icon?: React.ReactNode;
  views?: Route[];
};

export const KREATIVE_ROUTES = {
  kreative: {
    hub: "/kreative",

    // Konservation canonical surfaces.
    gallery: "/kreative/gallery",
    exhibitions: "/kreative/exhibitions",
    incubator: "/kreative/incubator",
    submitWork: "/kreative/submit",
    showcase: "/kreative/showcase",
    topCreators: "/kreative/top-creators",

    // Dynamic route, intentionally not exposed directly in sidebar:
    // /art/[id]
    artworkSheet: "/art/[id]",
  },

  archive: {
    root: "/archive",
    heritage: "/archive/heritage",
    partners: "/archive/partners",
    aiCatalogue: "/archive/ai-catalogue",
  },

  connect: {
    root: "/connect",
    people: "/connect/people",
    opportunities: "/connect/opportunities",
    workspaces: "/connect/workspaces",
    endorsements: "/connect/endorsements",
    mentorship: "/connect/mentorship",

    // Dynamic route, intentionally not exposed directly in sidebar:
    // /profile/[user]
    profile: "/profile/[user]",
  },

  legacy: {
    // Keep these as compatibility targets or redirects while pages migrate.
    featuredProjects: "/kreative/community-showcases/featured-projects",
    topCreators: "/kreative/community-showcases/top-creators",
    submitToShowcase: "/kreative/community-showcases/submit-to-showcase",

    exploreIdeas: "/kreative/creative-hub/explore-ideas",
    submitCreativeWork: "/kreative/creative-hub/submit-creative-work",
    inspirationGallery: "/kreative/creative-hub/inspiration-gallery",

    collaborateOnIdeas: "/kreative/idea-incubator/collaborate-on-ideas",
    createNewIdea: "/kreative/idea-incubator/create-new-idea",
    myIdeas: "/kreative/idea-incubator/my-ideas",

    traditionsArchive: "/kreative/traditions-archive",
    mentorship: "/kreative/mentorship",

    findSpaces: "/kreative/collaborative-spaces/find-spaces",
    startNewSpace: "/kreative/collaborative-spaces/start-new-space",
    mySpaces: "/kreative/collaborative-spaces/my-spaces",
  },
} as const;

const kreativeDashboard: Route = {
  path: KREATIVE_ROUTES.kreative.hub,
  name: "Kreative – Overview",
  icon: <DashboardOutlined />,
};

const konservationGroup: Route = {
  name: "Konservation",
  views: [
    {
      path: KREATIVE_ROUTES.kreative.gallery,
      name: "Gallery",
      icon: <PictureOutlined />,
    },
    {
      path: KREATIVE_ROUTES.kreative.exhibitions,
      name: "Virtual exhibitions",
      icon: <EyeOutlined />,
    },
    {
      path: KREATIVE_ROUTES.kreative.showcase,
      name: "Showcase",
      icon: <StarOutlined />,
    },
    {
      path: KREATIVE_ROUTES.kreative.topCreators,
      name: "Top creators",
      icon: <CrownOutlined />,
    },
    {
      path: KREATIVE_ROUTES.kreative.submitWork,
      name: "Submit creative work",
      icon: <CloudUploadOutlined />,
    },
    {
      path: KREATIVE_ROUTES.kreative.incubator,
      name: "Idea incubator",
      icon: <BulbOutlined />,
    },
  ],
};

const archiveGroup: Route = {
  name: "Archive",
  views: [
    {
      path: KREATIVE_ROUTES.archive.root,
      name: "Archive",
      icon: <BankOutlined />,
    },
    {
      path: KREATIVE_ROUTES.archive.heritage,
      name: "Heritage",
      icon: <GlobalOutlined />,
    },
    {
      path: KREATIVE_ROUTES.archive.aiCatalogue,
      name: "AI catalogue",
      icon: <HighlightOutlined />,
    },
    {
      path: KREATIVE_ROUTES.archive.partners,
      name: "Cultural partners",
      icon: <LinkOutlined />,
    },
  ],
};

const kontactGroup: Route = {
  name: "Kontact",
  views: [
    {
      path: KREATIVE_ROUTES.connect.root,
      name: "Connect",
      icon: <TeamOutlined />,
    },
    {
      path: KREATIVE_ROUTES.connect.people,
      name: "People",
      icon: <SearchOutlined />,
    },
    {
      path: KREATIVE_ROUTES.connect.opportunities,
      name: "Opportunities",
      icon: <ShopOutlined />,
    },
    {
      path: KREATIVE_ROUTES.connect.workspaces,
      name: "Workspaces",
      icon: <HomeOutlined />,
    },
    {
      path: KREATIVE_ROUTES.connect.endorsements,
      name: "Endorsements",
      icon: <IdcardOutlined />,
    },
    {
      path: KREATIVE_ROUTES.connect.mentorship,
      name: "Mentorship",
      icon: <UserSwitchOutlined />,
    },
  ],
};

const profileReferenceGroup: Route = {
  name: "Profiles",
  views: [
    {
      path: KREATIVE_ROUTES.connect.people,
      name: "Creator profiles",
      icon: <ProfileOutlined />,
    },
    {
      path: KREATIVE_ROUTES.connect.workspaces,
      name: "Collaboration rooms",
      icon: <MessageOutlined />,
    },
  ],
};

const routes: Route[] = [
  kreativeDashboard,
  konservationGroup,
  archiveGroup,
  kontactGroup,
  profileReferenceGroup,
];

export default routes;