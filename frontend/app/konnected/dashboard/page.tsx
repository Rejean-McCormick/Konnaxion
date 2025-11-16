"use client";

import React from "react";
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
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LineChartOutlined,
  ReadOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { PageContainer, ProCard, StatisticCard } from "@ant-design/pro-components";
import KonnectedPageShell from "../KonnectedPageShell";

const { Text, Title } = Typography;

// ---------- Types ----------

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
  memberCount: number;
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

// ---------- Data hooks (best-effort; adjust endpoints to your OpenAPI) ----------

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function useCertificationSummary() {
  return useQuery<CertificationSummary>({
    queryKey: ["konnected", "dashboard", "certificationSummary"],
    queryFn: () =>
      fetchJSON<CertificationSummary>(
        // Replace with your real aggregate endpoint or client-side aggregation route
        "/api/konnected/certification/summary/"
      ),
  });
}

function useLearningSummary() {
  return useQuery<LearningSummary>({
    queryKey: ["konnected", "dashboard", "learningSummary"],
    queryFn: () =>
      fetchJSON<LearningSummary>(
        "/api/konnected/knowledge/dashboard-summary/"
      ),
  });
}

function useLearningPathSummary() {
  return useQuery<LearningPathSummary>({
    queryKey: ["konnected", "dashboard", "learningPathSummary"],
    queryFn: () =>
      fetchJSON<LearningPathSummary>(
        "/api/konnected/learning-paths/dashboard-summary/"
      ),
  });
}

function useCommunitySummary() {
  return useQuery<CommunitySummary>({
    queryKey: ["konnected", "dashboard", "communitySummary"],
    queryFn: () =>
      fetchJSON<CommunitySummary>(
        "/api/konnected/community/dashboard-summary/"
      ),
  });
}

function useTeamsSummary() {
  return useQuery<TeamsSummary>({
    queryKey: ["konnected", "dashboard", "teamsSummary"],
    queryFn: () =>
      fetchJSON<TeamsSummary>(
        "/api/konnected/teams/dashboard-summary/"
      ),
  });
}

function useUsageSummary() {
  return useQuery<UsageSummary>({
    queryKey: ["konnected", "dashboard", "usageSummary"],
    queryFn: () =>
      fetchJSON<UsageSummary>(
        "/api/reports/usage/konnected-summary/"
      ),
  });
}

// ---------- Tiles ----------

function CertificationsTile() {
  const { data, isLoading, isError } = useCertificationSummary();

  if (isLoading) {
    return (
      <ProCard title="Certifications" bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title="Certifications"
        bordered
        extra={
          <Button type="link" href="/konnected/certifications/certification-programs">
            View programs
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="Unable to load certification summary."
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
      title="Certifications"
      bordered
      extra={
        <Space>
          <Button type="default" href="/konnected/certifications/exam-dashboard-results">
            Exam results
          </Button>
          <Button type="primary" href="/konnected/certifications/certification-programs">
            View programs
          </Button>
        </Space>
      }
    >
      {!hasAny ? (
        <Empty
          description="No certifications yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" href="/konnected/certifications/certification-programs">
            Explore certification programs
          </Button>
        </Empty>
      ) : (
        <>
          <Space size="large" wrap>
            <StatisticCard
              statistic={{
                title: "Active paths",
                value: data.activePaths,
                prefix: <ReadOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: "Completed paths",
                value: data.completedPaths,
                prefix: <CheckCircleOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: "Certificates",
                value: data.certificatesCount,
                prefix: <FileTextOutlined />,
              }}
            />
          </Space>

          <Space style={{ marginTop: 16 }} direction="vertical">
            <Space size="large" wrap>
              <Space>
                <Text strong>Upcoming evaluations:</Text>
                <Badge count={data.upcomingEvaluations} />
              </Space>
              <Space>
                <Text strong>Pending peer validations:</Text>
                <Badge
                  count={data.pendingPeerValidations}
                  status={data.pendingPeerValidations > 0 ? "warning" : "default"}
                />
              </Space>
            </Space>
            {data.nextEvaluationDate && (
              <Text type="secondary">
                Next scheduled evaluation:{" "}
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
  const { data, isLoading, isError } = useLearningSummary();

  if (isLoading) {
    return (
      <ProCard title="Learning progress & recommendations" bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title="Learning progress & recommendations"
        bordered
        extra={
          <Button type="link" href="/konnected/learning-library/browse-resources">
            Browse library
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="Unable to load learning summary."
        />
      </ProCard>
    );
  }

  const hasProgress =
    data.startedCount > 0 || data.completedCount > 0 || data.inProgress.length > 0;

  return (
    <ProCard
      title="Learning progress & recommendations"
      bordered
      extra={
        <Space>
          <Button type="default" href="/konnected/learning-library/recommended-resources">
            Recommendations
          </Button>
          <Button type="primary" href="/konnected/learning-library/browse-resources">
            Browse library
          </Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={10}>
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Space size="large" wrap>
              <StatisticCard
                statistic={{
                  title: "Started",
                  value: data.startedCount,
                  prefix: <ReadOutlined />,
                }}
              />
              <StatisticCard
                statistic={{
                  title: "Completed",
                  value: data.completedCount,
                  prefix: <CheckCircleOutlined />,
                }}
              />
            </Space>
            <div>
              <Text strong>Average completion</Text>
              <Progress
                percent={Math.round(data.averageProgressPercent)}
                status="normal"
              />
            </div>
          </Space>
        </Col>
        <Col xs={24} md={14}>
          <Tabs
            defaultActiveKey="in-progress"
            items={[
              {
                key: "in-progress",
                label: "In progress",
                children: hasProgress ? (
                  <List
                    size="small"
                    dataSource={data.inProgress}
                    locale={{ emptyText: "No resources in progress" }}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            key="continue"
                            type="link"
                            href={`/course/${encodeURIComponent(item.id)}`}
                          >
                            Continue
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
                          description={
                            <Progress
                              percent={Math.round(item.progressPercent ?? 0)}
                              size="small"
                              status="active"
                            />
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No learning progress yet"
                  >
                    <Button
                      type="primary"
                      href="/konnected/learning-library/recommended-resources"
                    >
                      Start with recommendations
                    </Button>
                  </Empty>
                ),
              },
              {
                key: "recommended",
                label: "Recommended",
                children: (
                  <List
                    size="small"
                    dataSource={data.recommended}
                    locale={{ emptyText: "No recommendations available" }}
                    renderItem={(item) => (
                      <List.Item
                        actions={[
                          <Button
                            key="start"
                            type="link"
                            href={`/course/${encodeURIComponent(item.id)}`}
                          >
                            Open
                          </Button>,
                        ]}
                      >
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{item.title}</Text>
                              <Tag color="blue">Recommended</Tag>
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
        </Col>
      </Row>
    </ProCard>
  );
}

function LearningPathsTile() {
  const { data, isLoading, isError } = useLearningPathSummary();

  if (isLoading) {
    return (
      <ProCard title="Learning paths" bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title="Learning paths"
        bordered
        extra={
          <Button type="link" href="/konnected/learning-paths/my-learning-path">
            My learning paths
          </Button>
        }
      >
        <Alert type="warning" showIcon message="Unable to load learning paths." />
      </ProCard>
    );
  }

  const hasPaths =
    data.myActivePaths > 0 || data.myCompletedPaths > 0 || !!data.myCurrentPathTitle;

  return (
    <ProCard
      title="Learning paths"
      bordered
      extra={
        <Space>
          {data.isEducator && (
            <Button
              type="default"
              href="/konnected/learning-paths/manage-existing-paths"
            >
              Manage paths
            </Button>
          )}
          {data.isEducator && (
            <Button
              type="primary"
              href="/konnected/learning-paths/create-learning-path"
            >
              Create path
            </Button>
          )}
          {!data.isEducator && (
            <Button
              type="primary"
              href="/konnected/learning-paths/my-learning-path"
            >
              View my paths
            </Button>
          )}
        </Space>
      }
    >
      {!hasPaths ? (
        <Empty
          description="No learning paths yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button type="primary" href="/konnected/learning-library/browse-resources">
            Start from library
          </Button>
        </Empty>
      ) : (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <Space size="large" wrap>
            <StatisticCard
              statistic={{
                title: "My active paths",
                value: data.myActivePaths,
                prefix: <ReadOutlined />,
              }}
            />
            <StatisticCard
              statistic={{
                title: "Completed paths",
                value: data.myCompletedPaths,
                prefix: <CheckCircleOutlined />,
              }}
            />
            {data.isEducator && (
              <StatisticCard
                statistic={{
                  title: "Paths I manage",
                  value: data.managedPathsCount,
                  prefix: <FileTextOutlined />,
                }}
              />
            )}
          </Space>
          {data.myCurrentPathTitle && (
            <div>
              <Space align="center">
                <Text strong>Current path:</Text>
                <Text>{data.myCurrentPathTitle}</Text>
                <Badge status="processing" text="In progress" />
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
  const { data, isLoading, isError } = useCommunitySummary();

  if (isLoading) {
    return (
      <ProCard title="Community & co-creation" bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title="Community & co-creation"
        bordered
        extra={
          <Button type="link" href="/konnected/community-discussions/active-threads">
            View community
          </Button>
        }
      >
        <Alert
          type="warning"
          showIcon
          message="Unable to load community activity."
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
      title="Community & co-creation"
      bordered
      extra={
        <Space>
          <Button
            type="default"
            href="/konnected/community-discussions/active-threads"
          >
            Active threads
          </Button>
          <Button
            type="primary"
            href="/konnected/community-discussions/start-new-discussion"
          >
            Start discussion
          </Button>
        </Space>
      }
    >
      {!hasAny ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="No community activity yet"
        >
          <Button
            type="primary"
            href="/konnected/community-discussions/start-new-discussion"
          >
            Start the first discussion
          </Button>
        </Empty>
      ) : (
        <Tabs
          defaultActiveKey="forums"
          items={[
            {
              key: "forums",
              label: "Forums",
              children: (
                <List
                  size="small"
                  dataSource={data.recentTopics}
                  locale={{ emptyText: "No recent topics" }}
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
                          Open
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar icon={<TeamOutlined />} />
                        }
                        title={topic.title}
                        description={
                          <Text type="secondary">
                            Last activity: {topic.lastActivity}
                          </Text>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: "cocreation",
              label: "Co-creation",
              children: (
                <List
                  size="small"
                  dataSource={data.activeCoCreationProjects}
                  locale={{ emptyText: "No active co-creation projects" }}
                  renderItem={(proj) => (
                    <List.Item
                      actions={[
                        <Tag key="role">{proj.role}</Tag>,
                        <Tag key="status" color="blue">
                          {proj.status}
                        </Tag>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar icon={<ReadOutlined />} />}
                        title={proj.title}
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
  const { data, isLoading, isError } = useTeamsSummary();

  if (isLoading) {
    return (
      <ProCard title="Teams & collaboration" bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title="Teams & collaboration"
        bordered
        extra={
          <Button type="link" href="/konnected/teams-collaboration/my-teams">
            My teams
          </Button>
        }
      >
        <Alert type="warning" showIcon message="Unable to load teams summary." />
      </ProCard>
    );
  }

  const hasTeams = data.myTeamsCount > 0 || data.teams.length > 0;

  return (
    <ProCard
      title="Teams & collaboration"
      bordered
      extra={
        <Space>
          <Button type="default" href="/konnected/teams-collaboration/my-teams">
            My teams
          </Button>
          <Button
            type="primary"
            href="/konnected/teams-collaboration/team-builder"
          >
            Team builder
          </Button>
        </Space>
      }
    >
      {!hasTeams ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="You are not in any team yet"
        >
          <Button
            type="primary"
            href="/konnected/teams-collaboration/team-builder"
          >
            Discover teams
          </Button>
        </Empty>
      ) : (
        <>
          <Space size="large" wrap>
            <StatisticCard
              statistic={{
                title: "My teams",
                value: data.myTeamsCount,
                prefix: <TeamOutlined />,
              }}
            />
          </Space>
          {data.nextTeamActivityTitle && (
            <div style={{ marginTop: 16 }}>
              <Space>
                <Text strong>Next team activity:</Text>
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
            locale={{ emptyText: "No teams to display" }}
            renderItem={(team) => (
              <List.Item
                actions={[
                  <Button
                    key="open"
                    type="link"
                    href="/konnected/teams-collaboration/project-workspaces"
                  >
                    Open workspace
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
                  description={`${team.memberCount} members`}
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
  const { data, isLoading, isError } = useUsageSummary();

  if (isLoading) {
    return (
      <ProCard title="Your usage in KonnectED" bordered>
        <Skeleton active />
      </ProCard>
    );
  }

  if (isError || !data) {
    return (
      <ProCard
        title="Your usage in KonnectED"
        bordered
        extra={
          <Tooltip title="Usage analytics provided by the Insights module">
            <ExclamationCircleOutlined />
          </Tooltip>
        }
      >
        <Alert
          type="info"
          showIcon
          message="Usage analytics are temporarily unavailable."
        />
      </ProCard>
    );
  }

  return (
    <ProCard
      title="Your usage in KonnectED"
      bordered
      extra={
        <Tooltip title="Usage analytics provided by the Insights module">
          <ExclamationCircleOutlined />
        </Tooltip>
      }
    >
      <Space size="large" wrap>
        <StatisticCard
          statistic={{
            title: "Active days (last 30)",
            value: data.daysActiveLast30,
            prefix: <LineChartOutlined />,
          }}
        />
        <StatisticCard
          statistic={{
            title: "Resources completed (last 30)",
            value: data.resourcesCompletedLast30,
            prefix: <ReadOutlined />,
          }}
        />
        <StatisticCard
          statistic={{
            title: "Certifications earned (last 30)",
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
  return (
    <KonnectedPageShell
      title="KonnectED dashboard"
      subtitle="Overview of your certifications, learning, community, and teams."
      primaryAction={
        <Button type="primary" href="/konnected/learning-library/recommended-resources">
          Continue learning
        </Button>
      }
      secondaryActions={
        <Space>
          <Button href="/konnected/certifications/certification-programs">
            Certifications
          </Button>
          <Button href="/konnected/learning-library/browse-resources">
            Library
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
