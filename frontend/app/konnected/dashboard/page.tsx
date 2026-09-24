// FILE: frontend/app/konnected/dashboard/page.tsx
﻿"use client";

import { apiFetch } from '@/api';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LineChartOutlined,
  ReadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from "@ant-design/pro-components";
import { useQuery } from "@tanstack/react-query";
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import React from "react";

import KonnectedPageShell from "../KonnectedPageShell";

const { Text } = Typography;

// ---------- Aggregated types used by the tiles ----------

type CertificationSummary = {
  activePaths: number;
  completedPaths: number;
  certificatesCount: number;
  upcomingEvaluations: number;
  pendingPeerValidations: number;
  nextEvaluationDate?: string | null;
};

type LearningResourceSummaryItem = {
  id: string;
  title: string;
  type: "article" | "video" | "lesson" | "quiz" | "dataset" | string;
  progressPercent?: number;
};

type LearningSummary = {
  startedCount: number;
  completedCount: number;
  averageProgressPercent: number;
  inProgress: LearningResourceSummaryItem[];
  recommended: LearningResourceSummaryItem[];
};

type LearningPathSummary = {
  myActivePaths: number;
  myCompletedPaths: number;
  myCurrentPathTitle?: string | null;
  myCurrentPathProgressPercent?: number | null;
  isEducator: boolean;
  managedPathsCount: number;
};

type CommunityTopicSummary = {
  id: string;
  title: string;
  lastActivity: string;
  unreadCount: number;
};

type CoCreationProjectSummary = {
  id: string;
  title: string;
  role: "owner" | "contributor" | "reviewer" | string;
  status: "draft" | "active" | "archived" | string;
};

type CommunitySummary = {
  activeThreadsCount: number;
  recentTopics: CommunityTopicSummary[];
  activeCoCreationProjects: CoCreationProjectSummary[];
};

type TeamSummaryItem = {
  id: string;
  name: string;
  /**
   * Optional if backend does not expose a member count yet.
   * When missing, we fall back to role‑based descriptions.
   */
  memberCount?: number;
  /**
   * Optional role of the current user in this team (owner, collaborator, mentor…).
   */
  role?: string;
};

type TeamsSummary = {
  myTeamsCount: number;
  teams: TeamSummaryItem[];
  nextTeamActivityTitle?: string | null;
  nextTeamActivityDate?: string | null;
};

type UsageSummary = {
  daysActiveLast30: number;
  resourcesCompletedLast30: number;
  certificationsEarnedLast30: number;
};

// ---------- Raw API types (simplified, based on your backend models) ----------

type ListResponse<T> = T[] | { results?: T[] };

type PortfolioApi = {
  id: number;
  title: string;
};

type KnowledgeResourceApi = {
  id: number;
  title: string;
  type?: string;
};

type LearningProgressApi = {
  id: number;
  resource: number | KnowledgeResourceApi;
  progress_percent: string | number;
  updated_at?: string;
};

type KnowledgeRecommendationApi = {
  id: number;
  resource: number | KnowledgeResourceApi;
};

type ForumTopicApi = {
  id: number;
  title: string;
  updated_at?: string;
};

type CoCreationProjectApi = {
  id: number;
  title: string;
  status: string;
};

type ProjectApi = {
  id: number;
  title: string;
};

type ProjectTeamApi = {
  id: number;
  project?: number | ProjectApi | string;
  project_id?: number;
  project_title?: string;
  role?: string;
};


// ---------- Generic helpers ----------

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await apiFetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function fetchList<T>(url: string): Promise<T[]> {
  const data = await fetchJSON<ListResponse<T>>(url);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.results)) return data.results;
  return [];
}

function safeNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function pickTopN<T>(items: T[], n: number): T[] {
  if (items.length <= n) return items;
  return items.slice(0, n);
}

// Knowledge resources endpoint can have slightly different prefixes in your codebase.
// This helper tries the most likely ones and returns the first that works.
async function fetchKnowledgeResourcesList(): Promise<KnowledgeResourceApi[]> {
  const candidates = ["/api/konnected/resources/"] as const;

  for (const url of candidates) {
    try {
      const items = await fetchList<KnowledgeResourceApi>(url);
      // If the endpoint exists and responds, we use it even if empty.
      return items;
    } catch {
      // Try next candidate
    }
  }
  return [];
}

function getResourceIdFromProgress(item: LearningProgressApi): number | null {
  if (typeof item.resource === "number") return item.resource;
  if (
    item.resource &&
    typeof item.resource === "object" &&
    "id" in item.resource
  ) {
    return (item.resource as KnowledgeResourceApi).id;
  }
  return null;
}

function getResourceIdFromRecommendation(
  item: KnowledgeRecommendationApi
): number | null {
  if (typeof item.resource === "number") return item.resource;
  if (
    item.resource &&
    typeof item.resource === "object" &&
    "id" in item.resource
  ) {
    return (item.resource as KnowledgeResourceApi).id;
  }
  return null;
}

// ---------- Client‑side aggregation functions (using real backend endpoints) ----------

async function buildCertificationSummary(): Promise<CertificationSummary> {
  // Uses portfolios + learning‑progress as real backing data.
  const [portfolios, progress] = await Promise.all([
    fetchList<PortfolioApi>("/api/konnected/portfolios/").catch(() => []),
    fetchList<LearningProgressApi>("/api/konnected/progress/").catch(() => []),
  ]);

  const progressValues = progress.map((p) => safeNumber(p.progress_percent));
  const activePaths = progressValues.filter((v) => v > 0 && v < 100).length;
  const completedPaths = progressValues.filter((v) => v >= 100).length;

  return {
    activePaths,
    completedPaths,
    certificatesCount: portfolios.length,
    // These will become non‑zero once you expose evaluation / peer‑validation APIs
    upcomingEvaluations: 0,
    pendingPeerValidations: 0,
    nextEvaluationDate: null,
  };
}

async function buildLearningSummary(): Promise<LearningSummary> {
  const [progressRecords, resources, recommendations] = await Promise.all([
    fetchList<LearningProgressApi>("/api/konnected/progress/").catch(() => []),
    fetchKnowledgeResourcesList().catch(() => []),
    fetchList<KnowledgeRecommendationApi>("/api/konnected/recommendations/").catch(
      () => []
    ),
  ]);

  const resourceMap = new Map<number, KnowledgeResourceApi>();
  for (const r of resources) {
    resourceMap.set(r.id, r);
  }

  const progressValues = progressRecords.map((p) =>
    safeNumber(p.progress_percent)
  );
  const startedCount = progressRecords.length;
  const completedCount = progressValues.filter((v) => v >= 100).length;
  const averageProgressPercent =
    progressValues.length > 0
      ? progressValues.reduce((a, b) => a + b, 0) / progressValues.length
      : 0;

  const inProgressRecords = progressRecords.filter((p) => {
    const v = safeNumber(p.progress_percent);
    return v > 0 && v < 100;
  });

  const inProgress: LearningResourceSummaryItem[] = pickTopN(
    inProgressRecords,
    5
  ).map((p) => {
    const resId = getResourceIdFromProgress(p);
    const resource = resId != null ? resourceMap.get(resId) : undefined;
    const title =
      resource?.title ??
      (resId != null ? `Resource #${resId}` : `Progress #${p.id}`);
    const type =
      (resource?.type as LearningResourceSummaryItem["type"]) ?? "lesson";

    return {
      id: resId != null ? String(resId) : String(p.id),
      title,
      type,
      progressPercent: safeNumber(p.progress_percent),
    };
  });

  const recommended: LearningResourceSummaryItem[] = [];
  for (const rec of recommendations) {
    const resId = getResourceIdFromRecommendation(rec);
    if (resId == null) continue;
    const resource = resourceMap.get(resId);
    if (!resource) continue;

    recommended.push({
      id: String(resId),
      title: resource.title,
      type: (resource.type as LearningResourceSummaryItem["type"]) ?? "article",
    });

    if (recommended.length >= 5) break;
  }

  return {
    startedCount,
    completedCount,
    averageProgressPercent,
    inProgress,
    recommended,
  };
}

async function buildLearningPathSummary(): Promise<LearningPathSummary> {
  const [progressRecords, resources] = await Promise.all([
    fetchList<LearningProgressApi>("/api/konnected/progress/").catch(() => []),
    fetchKnowledgeResourcesList().catch(() => []),
  ]);

  const resourceMap = new Map<number, KnowledgeResourceApi>();
  for (const r of resources) {
    resourceMap.set(r.id, r);
  }

  const progressWithValues = progressRecords.map((record) => ({
    record,
    value: safeNumber(record.progress_percent),
  }));

  const activeRecords = progressWithValues.filter(
    ({ value }) => value > 0 && value < 100
  );
  const completedRecords = progressWithValues.filter(
    ({ value }) => value >= 100
  );

  let currentTitle: string | null = null;
  let currentPercent: number | null = null;

  const sortedActive = [...activeRecords].sort((a, b) => b.value - a.value);
  const sortedAll = [...progressWithValues].sort((a, b) => b.value - a.value);
  const candidate = sortedActive[0] ?? sortedAll[0];

  if (candidate) {
    const resId = getResourceIdFromProgress(candidate.record);
    const resource = resId != null ? resourceMap.get(resId) : undefined;
    currentTitle =
      resource?.title ?? (resId != null ? `Resource #${resId}` : null);
    currentPercent = candidate.value;
  }

  return {
    myActivePaths: activeRecords.length,
    myCompletedPaths: completedRecords.length,
    myCurrentPathTitle: currentTitle,
    myCurrentPathProgressPercent: currentPercent,
    // These can be wired later to real educator / path‑management APIs.
    isEducator: false,
    managedPathsCount: 0,
  };
}

async function buildCommunitySummary(): Promise<CommunitySummary> {
  const [topics, coCreationProjects] = await Promise.all([
    fetchList<ForumTopicApi>("/api/konnected/forum-topics/").catch(() => []),
    fetchList<CoCreationProjectApi>("/api/konnected/co-creation-projects/").catch(
      () => []
    ),
  ]);

  const recentTopics: CommunityTopicSummary[] = pickTopN(
    topics.sort((a, b) => {
      const da = a.updated_at ? Date.parse(a.updated_at) : 0;
      const db = b.updated_at ? Date.parse(b.updated_at) : 0;
      return db - da;
    }),
    5
  ).map((t) => ({
    id: String(t.id),
    title: t.title,
    lastActivity: t.updated_at ?? "Recently",
    // Per‑user unread counts require a dedicated API; default to 0 for now.
    unreadCount: 0,
  }));

  const activeCoCreationProjects: CoCreationProjectSummary[] = pickTopN(
    coCreationProjects.filter((p) => p.status === "active"),
    5
  ).map((p) => ({
    id: String(p.id),
    title: p.title,
    status: p.status as CoCreationProjectSummary["status"],
    // Real role would come from a membership API; use a neutral default.
    role: "contributor",
  }));

  return {
    activeThreadsCount: topics.length,
    recentTopics,
    activeCoCreationProjects,
  };
}

async function buildTeamsSummary(): Promise<TeamsSummary> {
  // Project-team memberships + projects, as exposed by your API root.
  const [memberships, projects] = await Promise.all([
    fetchList<ProjectTeamApi>("/api/keenkonnect/teams/").catch(() => []),
    fetchList<ProjectApi>("/api/keenkonnect/projects/").catch(() => []),
  ]);

  const projectMap = new Map<number, ProjectApi>();
  for (const p of projects) {
    projectMap.set(p.id, p);
  }

  const teamsMap = new Map<number, TeamSummaryItem>();

  for (const membership of memberships) {
    const projId =
      membership.project_id ??
      (typeof membership.project === "number"
        ? membership.project
        : typeof membership.project === "object"
          ? membership.project?.id
          : undefined);
    if (!projId) continue;

    if (!teamsMap.has(projId)) {
      const project = projectMap.get(projId);
      teamsMap.set(projId, {
        id: String(projId),
        name:
          membership.project_title ??
          project?.title ??
          (typeof membership.project === "string"
            ? membership.project
            : `Project #${projId}`),
        role: membership.role,
      });
    }
  }

  const teams = Array.from(teamsMap.values());

  return {
    myTeamsCount: teams.length,
    teams,
    nextTeamActivityTitle: null,
    nextTeamActivityDate: null,
  };
}

async function buildUsageSummary(): Promise<UsageSummary | null> {
  // No canonical per-user KonnectED usage endpoint exists in the current API
  // surface. Returning null keeps the dashboard honest: the UsageTile renders
  // its explicit "unavailable" state instead of probing a nonexistent route
  // and silently presenting synthetic zeroes as real measurements.
  return null;
}

// ---------- Data hooks wired to the real aggregation helpers ----------

function useCertificationSummary() {
  return useQuery<CertificationSummary>({
    queryKey: ["konnected", "dashboard", "certificationSummary"],
    queryFn: buildCertificationSummary,
  });
}

function useLearningSummary() {
  return useQuery<LearningSummary>({
    queryKey: ["konnected", "dashboard", "learningSummary"],
    queryFn: buildLearningSummary,
  });
}

function useLearningPathSummary() {
  return useQuery<LearningPathSummary>({
    queryKey: ["konnected", "dashboard", "learningPathSummary"],
    queryFn: buildLearningPathSummary,
  });
}

function useCommunitySummary() {
  return useQuery<CommunitySummary>({
    queryKey: ["konnected", "dashboard", "communitySummary"],
    queryFn: buildCommunitySummary,
  });
}

function useTeamsSummary() {
  return useQuery<TeamsSummary>({
    queryKey: ["konnected", "dashboard", "teamsSummary"],
    queryFn: buildTeamsSummary,
  });
}

function useUsageSummary() {
  return useQuery<UsageSummary | null>({
    queryKey: ["konnected", "dashboard", "usageSummary"],
    queryFn: buildUsageSummary,
  });
}

// ---------- Tiles ----------

function CertificationsTile() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError } = useCertificationSummary();

  if (isLoading) {
    return (
      <ProCard title={i18nT("ui.konnected.dashboard.certifications")} bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title={i18nT("ui.konnected.dashboard.certifications")}
        bordered
        extra={
          <Button
            type="link"
            href="/konnected/certifications/certification-programs"
          >
            {i18nT("ui.konnected.dashboard.viewPrograms")}
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message={i18nT("ui.konnected.dashboard.unableToLoadCertificationSummary")}
        />
      </ProCard>
    );
  }

  const hasAny =
    data.activePaths > 0 ||
    data.completedPaths > 0 ||
    data.certificatesCount > 0;

  return (
    <ProCard
      title={i18nT("ui.konnected.dashboard.certifications")}
      bordered
      extra={
        <Space>
          <Button
            type="default"
            href="/konnected/certifications/exam-dashboard-results"
          >
            {i18nT("ui.konnected.dashboard.examResults")}
          </Button>
          <Button
            type="primary"
            href="/konnected/certifications/certification-programs"
          >
            {i18nT("ui.konnected.dashboard.viewPrograms")}
          </Button>
        </Space>
      }
    >
      {!hasAny ? (
        <Empty
          description={i18nT("ui.konnected.dashboard.noCertificationsYet")}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            href="/konnected/certifications/certification-programs"
          >
            {i18nT("ui.konnected.dashboard.exploreCertificationPrograms")}
          </Button>
        </Empty>
      ) : (
        <>
          <Space size="large" wrap>
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.activePaths"),
                value: data.activePaths,
                prefix: <ReadOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.completedPaths"),
                value: data.completedPaths,
                prefix: <CheckCircleOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.certificates"),
                value: data.certificatesCount,
                prefix: <FileTextOutlined />,
              }}
            />
          </Space>

          <Space style={{ marginTop: 16 }} direction="vertical">
            <Space size="large" wrap>
              <Space>
                <Text strong>{i18nT("ui.konnected.dashboard.upcomingEvaluations")}</Text>
                <Badge count={data.upcomingEvaluations} />
              </Space>
              <Space>
                <Text strong>{i18nT("ui.konnected.dashboard.pendingPeerValidations")}</Text>
                <Badge
                  count={data.pendingPeerValidations}
                  status={
                    data.pendingPeerValidations > 0 ? "warning" : "default"
                  }
                />
              </Space>
            </Space>
            {data.nextEvaluationDate && (
              <Text type="secondary">
                {i18nT("ui.konnected.dashboard.nextScheduledEvaluation")}{" "}
                <Text code>{data.nextEvaluationDate}</Text>
              </Text>
            )}
          </Space>
        </>
      )}
    </ProCard>
  );
}

function LearningTile() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError } = useLearningSummary();

  if (isLoading) {
    return (
      <ProCard title={i18nT("ui.konnected.dashboard.learningProgressRecommendations")} bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title={i18nT("ui.konnected.dashboard.learningProgressRecommendations")}
        bordered
        extra={
          <Button type="link" href="/konnected/learning-library/browse-resources">
            {i18nT("ui.konnected.dashboard.browseLibrary")}
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message={i18nT("ui.konnected.dashboard.unableToLoadLearningSummary")}
        />
      </ProCard>
    );
  }

  const hasProgress =
    data.startedCount > 0 ||
    data.completedCount > 0 ||
    data.inProgress.length > 0;

  return (
    <ProCard
      title={i18nT("ui.konnected.dashboard.learningProgressRecommendations")}
      bordered
      extra={
        <Space>
          <Button
            type="default"
            href="/konnected/learning-library/recommended-resources"
          >
            {i18nT("ui.konnected.dashboard.recommendations")}
          </Button>
          <Button
            type="primary"
            href="/konnected/learning-library/browse-resources"
          >
            {i18nT("ui.konnected.dashboard.browseLibrary")}
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.resourcesStarted"),
                value: data.startedCount,
                prefix: <ReadOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.resourcesCompleted"),
                value: data.completedCount,
                prefix: <CheckCircleOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.averageProgress"),
                value: Math.round(data.averageProgressPercent),
                suffix: "%",
                prefix: <LineChartOutlined />,
              }}
            />
          </Space>
        </Col>
        <Col xs={24} md={14}>
          {!hasProgress ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={i18nT("ui.konnected.dashboard.noLearningActivityYet")}
            >
              <Button
                type="primary"
                href="/konnected/learning-library/browse-resources"
              >
                {i18nT("ui.konnected.dashboard.startLearning")}
              </Button>
            </Empty>
          ) : (
            <Tabs
              defaultActiveKey="inProgress"
              items={[
                {
                  key: "inProgress",
                  label: i18nT("ui.konnected.dashboard.inProgress"),
                  children: (
                    <List
                      size="small"
                      dataSource={data.inProgress}
                      locale={{ emptyText: i18nT("ui.konnected.dashboard.noResourcesInProgress") }}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            typeof item.progressPercent === "number" ? (
                              <Tooltip
                                key="progress"
                                title={i18nT("ui.konnected.dashboard.complete", { value1: Math.round(
                                  item.progressPercent
                                ) })}
                              >
                                <Progress
                                  percent={Math.round(item.progressPercent)}
                                  size="small"
                                  style={{ width: 120 }}
                                />
                              </Tooltip>
                            ) : null,
                            <Button
                              key="open"
                              type="link"
                              href={`/course/${encodeURIComponent(item.id)}`}
                            >
                              {i18nT("ui.konnected.dashboard.open")}
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag>{item.type}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ),
                },
                {
                  key: "recommended",
                  label: i18nT("ui.konnected.dashboard.recommended"),
                  children: (
                    <List
                      size="small"
                      dataSource={data.recommended}
                      locale={{ emptyText: i18nT("ui.konnected.dashboard.noRecommendationsAvailable") }}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              key="start"
                              type="link"
                              href={`/course/${encodeURIComponent(item.id)}`}
                            >
                              {i18nT("ui.konnected.dashboard.open")}
                            </Button>,
                          ]}
                        >
                          <List.Item.Meta
                            title={
                              <Space>
                                <Text strong>{item.title}</Text>
                                <Tag color="blue">{i18nT("ui.konnected.dashboard.recommended")}</Tag>
                                <Tag>{item.type}</Tag>
                              </Space>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ),
                },
              ]}
            />
          )}
        </Col>
      </Row>
    </ProCard>
  );
}

function LearningPathsTile() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError } = useLearningPathSummary();

  if (isLoading) {
    return (
      <ProCard title={i18nT("ui.konnected.dashboard.learningPaths")} bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title={i18nT("ui.konnected.dashboard.learningPaths")}
        bordered
        extra={
          <Button type="link" href="/konnected/learning-paths/my-learning-path">
            {i18nT("ui.konnected.dashboard.myLearningPaths")}
          </Button>
        }
      >
        <Alert type="warning" showIcon message={i18nT("ui.konnected.dashboard.unableToLoadLearningPaths")} />
      </ProCard>
    );
  }

  const hasPaths =
    data.myActivePaths > 0 ||
    data.myCompletedPaths > 0 ||
    !!data.myCurrentPathTitle;

  return (
    <ProCard
      title={i18nT("ui.konnected.dashboard.learningPaths")}
      bordered
      extra={
        <Space>
          {data.isEducator && (
            <Button
              type="default"
              href="/konnected/learning-paths/manage-existing-paths"
            >
              {i18nT("ui.konnected.dashboard.managePaths")}
            </Button>
          )}
          {data.isEducator && (
            <Button
              type="primary"
              href="/konnected/learning-paths/create-learning-path"
            >
              {i18nT("ui.konnected.dashboard.createPath")}
            </Button>
          )}
          {!data.isEducator && (
            <Button
              type="primary"
              href="/konnected/learning-paths/my-learning-path"
            >
              {i18nT("ui.konnected.dashboard.viewMyPaths")}
            </Button>
          )}
        </Space>
      }
    >
      {!hasPaths ? (
        <Empty
          description={i18nT("ui.konnected.dashboard.noLearningPathsYet")}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            href="/konnected/learning-library/browse-resources"
          >
            {i18nT("ui.konnected.dashboard.startFromLibrary")}
          </Button>
        </Empty>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space size="large" wrap>
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.myActivePaths"),
                value: data.myActivePaths,
                prefix: <ReadOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.completedPaths"),
                value: data.myCompletedPaths,
                prefix: <CheckCircleOutlined />,
              }}
            />
            {data.isEducator && (
              <StatisticCard
                statistic={{
                  title: i18nT("ui.konnected.dashboard.pathsIManage"),
                  value: data.managedPathsCount,
                  prefix: <FileTextOutlined />,
                }}
              />
            )}
          </Space>
          {data.myCurrentPathTitle && (
            <div>
              <Space align="center">
                <Text strong>{i18nT("ui.konnected.dashboard.currentPath")}</Text>
                <Text>{data.myCurrentPathTitle}</Text>
                <Badge status="processing" text={i18nT("ui.konnected.dashboard.inProgress")} />
              </Space>
              {typeof data.myCurrentPathProgressPercent === "number" && (
                <div style={{ marginTop: 8 }}>
                  <Progress
                    percent={Math.round(data.myCurrentPathProgressPercent)}
                    status="active"
                  />
                </div>
              )}
            </div>
          )}
        </Space>
      )}
    </ProCard>
  );
}

function CommunityTile() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError } = useCommunitySummary();

  if (isLoading) {
    return (
      <ProCard title={i18nT("ui.konnected.dashboard.communityCoCreation")} bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title={i18nT("ui.konnected.dashboard.communityCoCreation")}
        bordered
        extra={
          <Button type="link" href="/konnected/community-discussions/active-threads">
            {i18nT("ui.konnected.dashboard.viewCommunity")}
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message={i18nT("ui.konnected.dashboard.unableToLoadCommunityActivity")}
        />
      </ProCard>
    );
  }

  const hasAny =
    data.activeThreadsCount > 0 ||
    data.recentTopics.length > 0 ||
    data.activeCoCreationProjects.length > 0;

  return (
    <ProCard
      title={i18nT("ui.konnected.dashboard.communityCoCreation")}
      bordered
      extra={
        <Space>
          <Button
            type="default"
            href="/konnected/community-discussions/active-threads"
          >
            {i18nT("ui.konnected.dashboard.activeThreads")}
          </Button>
          <Button
            type="primary"
            href="/konnected/community-discussions/start-new-discussion"
          >
            {i18nT("ui.konnected.dashboard.startDiscussion")}
          </Button>
        </Space>
      }
    >
      {!hasAny ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={i18nT("ui.konnected.dashboard.noCommunityActivityYet")}
        >
          <Button
            type="primary"
            href="/konnected/community-discussions/start-new-discussion"
          >
            {i18nT("ui.konnected.dashboard.startTheFirstDiscussion")}
          </Button>
        </Empty>
      ) : (
        <Tabs
          defaultActiveKey="forums"
          items={[
            {
              key: "forums",
              label: i18nT("ui.konnected.dashboard.forums"),
              children: (
                <List
                  size="small"
                  dataSource={data.recentTopics}
                  locale={{ emptyText: i18nT("ui.konnected.dashboard.noRecentTopics") }}
                  renderItem={(topic) => (
                    <List.Item
                      actions={[
                        topic.unreadCount > 0 ? (
                          <Badge
                            key="unread"
                            count={topic.unreadCount}
                            style={{ backgroundColor: "#faad14" }}
                          />
                        ) : null,
                        <Button
                          key="open"
                          type="link"
                          href="/konnected/community-discussions/active-threads"
                        >
                          {i18nT("ui.konnected.dashboard.open")}
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<TeamOutlined />} />}
                        title={topic.title}
                        description={
                          <Text type="secondary">
                            {i18nT("ui.konnected.dashboard.lastActivity")} {topic.lastActivity}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: "coCreation",
              label: i18nT("ui.konnected.dashboard.coCreationProjects"),
              children: (
                <List
                  size="small"
                  dataSource={data.activeCoCreationProjects}
                  locale={{ emptyText: i18nT("ui.konnected.dashboard.noActiveCoCreationProjects") }}
                  renderItem={(project) => (
                    <List.Item
                      actions={[
                        <Button
                          key="view"
                          type="link"
                          href="/konnected/community-discussions/active-threads"
                        >
                          {i18nT("ui.konnected.dashboard.open")}
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<FileTextOutlined />} />}
                        title={project.title}
                        description={
                          <Space>
                            <Tag color="green">{project.status}</Tag>
                            <Tag>{project.role}</Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
          ]}
        />
      )}
    </ProCard>
  );
}

function TeamsTile() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError } = useTeamsSummary();

  if (isLoading) {
    return (
      <ProCard title={i18nT("ui.konnected.dashboard.teamsCollaboration")} bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title={i18nT("ui.konnected.dashboard.teamsCollaboration")}
        bordered
        extra={
          <Button
            type="link"
            href="/konnected/teams-collaboration/team-builder"
          >
            {i18nT("ui.konnected.dashboard.discoverTeams")}
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message={i18nT("ui.konnected.dashboard.unableToLoadYourTeams")}
        />
      </ProCard>
    );
  }

  const hasTeams = data.myTeamsCount > 0;

  return (
    <ProCard
      title={i18nT("ui.konnected.dashboard.teamsCollaboration")}
      bordered
      extra={
        <Space>
          <Button
            type="default"
            href="/konnected/teams-collaboration/project-workspaces"
          >
            {i18nT("ui.konnected.dashboard.projectWorkspaces")}
          </Button>
          <Button
            type="primary"
            href="/konnected/teams-collaboration/my-teams"
          >
            {i18nT("ui.konnected.dashboard.myTeams")}
          </Button>
        </Space>
      }
    >
      {!hasTeams ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={i18nT("ui.konnected.dashboard.youAreNotInAnyTeamYet")}
        >
          <Button
            type="primary"
            href="/konnected/teams-collaboration/team-builder"
          >
            {i18nT("ui.konnected.dashboard.discoverTeams")}
          </Button>
        </Empty>
      ) : (
        <>
          <Space size="large" wrap>
            <StatisticCard
              statistic={{
                title: i18nT("ui.konnected.dashboard.myTeams"),
                value: data.myTeamsCount,
                prefix: <TeamOutlined />,
              }}
            />
          </Space>
          {data.nextTeamActivityTitle && (
            <div style={{ marginTop: 16 }}>
              <Space>
                <Text strong>{i18nT("ui.konnected.dashboard.nextTeamActivity")}</Text>
                <Text>{data.nextTeamActivityTitle}</Text>
                {data.nextTeamActivityDate && (
                  <Tag icon={<LineChartOutlined />}>
                    {data.nextTeamActivityDate}
                  </Tag>
                )}
              </Space>
            </div>
          )}
          <List
            style={{ marginTop: 16 }}
            size="small"
            dataSource={data.teams}
            locale={{ emptyText: i18nT("ui.konnected.dashboard.noTeamsToDisplay") }}
            renderItem={(team) => (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="link"
                    href="/konnected/teams-collaboration/project-workspaces"
                  >
                    {i18nT("ui.konnected.dashboard.openWorkspace")}
                  </Button>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar.Group>
                      <Avatar icon={<TeamOutlined />} />
                    </Avatar.Group>
                  }
                  title={team.name}
                  description={
                    team.memberCount != null
                      ? i18nT("ui.konnected.dashboard.member", { memberCount: team.memberCount, value1: team.memberCount === 1 ? "" : "s" })
                      : team.role
                      ? i18nT("ui.konnected.dashboard.role", { role: team.role })
                      : i18nT("ui.konnected.dashboard.teamMember")
                  }
                />
              </List.Item>
            )}
          />
        </>
      )}
    </ProCard>
  );
}

function UsageTile() {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError } = useUsageSummary();

  if (isLoading) {
    return (
      <ProCard title={i18nT("ui.konnected.dashboard.yourUsageInKonnected")} bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title={i18nT("ui.konnected.dashboard.yourUsageInKonnected")}
        bordered
        extra={
          <Tooltip title={i18nT("ui.konnected.dashboard.usageAnalyticsProvidedByTheInsightsModule")}>
            <ExclamationCircleOutlined />
          </Tooltip>
        }
      >
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.konnected.dashboard.perUserUsageAnalyticsAreNotExposed")}
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title={i18nT("ui.konnected.dashboard.yourUsageInKonnected")}
      bordered
      extra={
        <Tooltip title={i18nT("ui.konnected.dashboard.usageAnalyticsProvidedByTheInsightsModule")}>
          <ExclamationCircleOutlined />
        </Tooltip>
      }
    >
      <Space size="large" wrap>
        <StatisticCard
          statistic={{
            title: i18nT("ui.konnected.dashboard.activeDaysLast30"),
            value: data.daysActiveLast30,
            prefix: <LineChartOutlined />,
          }}
        />
        <StatisticCard
          statistic={{
            title: i18nT("ui.konnected.dashboard.resourcesCompletedLast30"),
            value: data.resourcesCompletedLast30,
            prefix: <ReadOutlined />,
          }}
        />
        <StatisticCard
          statistic={{
            title: i18nT("ui.konnected.dashboard.certificationsEarnedLast30"),
            value: data.certificationsEarnedLast30,
            prefix: <CheckCircleOutlined />,
          }}
        />
      </Space>
    </ProCard>
  );
}

// ---------- Page ----------

export default function KonnectedDashboardPage() {
  const { t: i18nT } = useLanguage();
  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.dashboard.konnectedDashboard")}
      subtitle={i18nT("ui.konnected.dashboard.overviewOfYourCertificationsLearningCommunityAnd")}
      primaryAction={
        <Button
          type="primary"
          href="/konnected/learning-library/recommended-resources"
        >
          {i18nT("ui.konnected.dashboard.continueLearning")}
        </Button>
      }
      secondaryActions={
        <Space>
          <Button href="/konnected/certifications/certification-programs">
            {i18nT("ui.konnected.dashboard.certifications")}
          </Button>
          <Button href="/konnected/learning-library/browse-resources">
            {i18nT("ui.konnected.dashboard.library")}
          </Button>
        </Space>
      }
    >
      <PageContainer>
        <Row gutter={[16, 16]}>
          <Col xs={24} xl={16}>
            <CertificationsTile />
          </Col>
          <Col xs={24} xl={8}>
            <UsageTile />
          </Col>

          <Col xs={24} xl={16}>
            <LearningTile />
          </Col>
          <Col xs={24} xl={8}>
            <LearningPathsTile />
          </Col>

          <Col xs={24} xl={12}>
            <CommunityTile />
          </Col>
          <Col xs={24} xl={12}>
            <TeamsTile />
          </Col>
        </Row>
      </PageContainer>
    </KonnectedPageShell>
  );
}
