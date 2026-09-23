// frontend/app/teambuilder/problems/[problemId]/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  AlertOutlined,
  ApartmentOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CopyOutlined,
  ExclamationCircleOutlined,
  ExperimentOutlined,
  FireOutlined,
  FundOutlined,
  ProfileOutlined,
  ProjectOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';
import { teambuilderService } from '@/services/teambuilder';

const { Text, Paragraph, Title } = Typography;

/* ------------------------------------------------------------------------- */
/* Local types (since services/teambuilder/types.ts has no problem types yet) */
/* ------------------------------------------------------------------------- */

type ProblemStatus = 'ACTIVE' | 'DRAFT' | 'DEPRECATED' | string;
type ProblemRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | string;

interface ITeambuilderProblem {
  id: string;
  name: string;
  description?: string;
  status?: ProblemStatus;
  risk_level?: ProblemRiskLevel;
  min_team_size?: number | null;
  max_team_size?: number | null;
  recommended_modes?: string[];
  categories?: string[];
  unesco_codes?: string[];
  facilitator_notes?: string;
  created_at?: string;
  updated_at?: string;
}

type ProblemSessionStatus = 'COMPLETED' | 'PROCESSING' | 'DRAFT' | 'ARCHIVED' | string;

interface IProblemSessionSummary {
  id: string;
  name: string;
  status: ProblemSessionStatus;
  mode?: string;
  created_at?: string;
  outcome_score?: number;
}

type ProblemChangeType = 'STATUS_CHANGE' | 'EDIT' | string;

interface IProblemChangeEvent {
  id: string;
  type: ProblemChangeType;
  timestamp?: string;
  title: string;
  description?: string;
}

interface IProblemDetailResponse {
  problem: ITeambuilderProblem;
  sessions?: IProblemSessionSummary[];
  history?: IProblemChangeEvent[];
}

type TabKey = 'overview' | 'sessions' | 'taxonomy';

export default function ProblemDetailPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { problemId } = useParams();

  const [problem, setProblem] = useState<ITeambuilderProblem | null>(null);
  const [sessions, setSessions] = useState<IProblemSessionSummary[]>([]);
  const [history, setHistory] = useState<IProblemChangeEvent[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------
  const fetchProblem = useCallback(async () => {
    if (!problemId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await teambuilderService.getProblemDetail(
        problemId as string,
      );

      setProblem(data.problem);
      setSessions(data.sessions ?? []);
      setHistory(data.history ?? []);
    } catch (err) {
       
      console.error(err);
      setError(i18nT("ui.teambuilder.problems.problemid.failedToLoadProblemDetails"));
    } finally {
      setLoading(false);
    }
  }, [problemId, i18nT]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);

  // ---------------------------------------------------------------------------
  // Helpers & derived values
  // ---------------------------------------------------------------------------

  const riskTag = () => {
    if (!problem) return null;
    const risk = problem.risk_level ?? 'MEDIUM';

    let color: string = 'default';
    let icon: React.ReactNode = <AlertOutlined />;

    if (risk === 'LOW') {
      color = 'green';
      icon = <FundOutlined />;
    } else if (risk === 'MEDIUM') {
      color = 'gold';
      icon = <ExperimentOutlined />;
    } else if (risk === 'HIGH') {
      color = 'volcano';
      icon = <FireOutlined />;
    } else if (risk === 'CRITICAL') {
      color = 'red';
      icon = <ExclamationCircleOutlined />;
    }

    const label =
      typeof risk === 'string'
        ? risk.charAt(0) + risk.slice(1).toLowerCase()
        : 'Medium';

    return (
      <Tag color={color} icon={icon}>
        {label} {i18nT("ui.teambuilder.problems.problemid.risk")}
      </Tag>
    );
  };

  const statusBadge = () => {
    if (!problem) return null;

    switch (problem.status) {
      case 'ACTIVE':
        return <Badge status="success" text={i18nT("ui.teambuilder.problems.problemid.active")} />;
      case 'DRAFT':
        return <Badge status="warning" text={i18nT("ui.teambuilder.problems.problemid.draft")} />;
      case 'DEPRECATED':
        return <Badge status="error" text={i18nT("ui.teambuilder.problems.problemid.deprecated")} />;
      default:
        return <Badge status="default" text={problem.status ?? i18nT("ui.teambuilder.problems.problemid.unknown")} />;
    }
  };

  const usageCount = sessions.length;
  const averageOutcome =
    sessions.length > 0
      ? (
          sessions.reduce(
            (sum, s) => sum + (s.outcome_score ?? 0),
            0,
          ) / sessions.length
        ).toFixed(1)
      : '—';

  const unescoTags = (problem?.unesco_codes ?? []).map((code: string) => (
    <Tag key={code} color="blue">
      {code}
    </Tag>
  ));

  const modeTags = (problem?.recommended_modes ?? []).map((mode: string) => (
    <Tag key={mode} color="purple">
      {mode}
    </Tag>
  ));

  const categoryTags = (problem?.categories ?? []).map((cat: string) => (
    <Tag key={cat} color="geekblue">
      {cat}
    </Tag>
  ));

  const showDeprecatedAlert =
    problem && (problem.status === 'DRAFT' || problem.status === 'DEPRECATED');

  // ---------------------------------------------------------------------------
  // Shell props
  // ---------------------------------------------------------------------------

  const shellTitle = problem?.name ?? 'Problem';
  const shellSubtitle =
    problem?.description && problem.description.trim().length > 0 ? (
      <Text type="secondary">{problem.description}</Text>
    ) : (
      <Text type="secondary">
        {i18nT("ui.teambuilder.problems.problemid.viewDetailedMetadataTaxonomyAndSessionsUsing")}
      </Text>
    );

  const metaTitle = problem
    ? `Team Builder · Problem · ${problem.name}`
    : i18nT("ui.teambuilder.problems.problemid.teamBuilderProblem");

  const primaryAction = problem ? (
    <Space>
      <Button
        type="primary"
        icon={<ProjectOutlined />}
        href={`/teambuilder/create?problemId=${encodeURIComponent(problem.id)}`}
      >
        {i18nT("ui.teambuilder.problems.problemid.createSessionWithThisProblem")}
      </Button>
    </Space>
  ) : undefined;

  const secondaryActions = problem ? (
    <Space>
      <Button icon={<ArrowLeftOutlined />} href="/teambuilder/problems">
        {i18nT("ui.teambuilder.problems.problemid.backToProblems")}
      </Button>
      <Button
        icon={<CopyOutlined />}
        href={`/teambuilder/problems/create?duplicate=${encodeURIComponent(
          problem.id,
        )}`}
      >
        {i18nT("ui.teambuilder.problems.problemid.duplicate")}
      </Button>
      <Button
        icon={<ProfileOutlined />}
        href={`/teambuilder/problems/${encodeURIComponent(problem.id)}/edit`}
      >
        {i18nT("ui.teambuilder.problems.problemid.edit")}
      </Button>
    </Space>
  ) : (
    <Button icon={<ArrowLeftOutlined />} href="/teambuilder/problems">
      {i18nT("ui.teambuilder.problems.problemid.backToProblems")}
    </Button>
  );

  // ---------------------------------------------------------------------------
  // Tab contents
  // ---------------------------------------------------------------------------

  const renderOverviewTab = () => {
    if (!problem) {
      return (
        <Card>
          <Empty description={i18nT("ui.teambuilder.problems.problemid.noProblemDataAvailable")} />
        </Card>
      );
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {showDeprecatedAlert && (
          <Alert
            type={problem.status === 'DEPRECATED' ? 'error' : 'warning'}
            showIcon
            icon={<ExclamationCircleOutlined />}
            message={
              problem.status === 'DEPRECATED'
                ? i18nT("ui.teambuilder.problems.problemid.thisProblemIsDeprecated")
                : i18nT("ui.teambuilder.problems.problemid.thisProblemIsStillInDraft")
            }
            description={
              problem.status === 'DEPRECATED'
                ? i18nT("ui.teambuilder.problems.problemid.avoidUsingThisProblemForNewSessions")
                : i18nT("ui.teambuilder.problems.problemid.youCanUseThisProblemForExperiments")
            }
          />
        )}

        {/* Meta card */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Descriptions title={i18nT("ui.teambuilder.problems.problemid.problemMetadata")} column={1} bordered={false}>
                <Descriptions.Item label={i18nT("ui.teambuilder.problems.problemid.name")}>
                  {problem.name}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.teambuilder.problems.problemid.status")}>
                  {statusBadge()}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.teambuilder.problems.problemid.riskLevel")}>
                  {riskTag()}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.teambuilder.problems.problemid.typicalTeamSize")}>
                  {problem.min_team_size && problem.max_team_size
                    ? i18nT("ui.teambuilder.problems.problemid.people", { min_team_size: problem.min_team_size, max_team_size: problem.max_team_size })
                    : i18nT("ui.teambuilder.problems.problemid.notSpecified")}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.teambuilder.problems.problemid.recommendedModes")}>
                  {modeTags.length > 0 ? (
                    modeTags
                  ) : (
                    <Text type="secondary">{i18nT("ui.teambuilder.problems.problemid.noneExplicitlySet")}</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.teambuilder.problems.problemid.categories")}>
                  {categoryTags.length > 0 ? (
                    categoryTags
                  ) : (
                    <Text type="secondary">{i18nT("ui.teambuilder.problems.problemid.notCategorisedYet")}</Text>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </Col>

            <Col xs={24} md={8}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Title level={5}>{i18nT("ui.teambuilder.problems.problemid.usageOutcomes")}</Title>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Statistic
                      title={i18nT("ui.teambuilder.problems.problemid.sessionsUsingThisProblem")}
                      value={usageCount}
                      prefix={<ApartmentOutlined />}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title={i18nT("ui.teambuilder.problems.problemid.avgOutcomeScore")}
                      value={averageOutcome}
                      prefix={<FundOutlined />}
                    />
                  </Col>
                </Row>

                {problem.created_at && (
                  <Text type="secondary">
                    {i18nT("ui.teambuilder.problems.problemid.created")} {format(new Date(problem.created_at), 'PPP p')}
                  </Text>
                )}
                {problem.updated_at && (
                  <Text type="secondary">
                    {i18nT("ui.teambuilder.problems.problemid.lastUpdated")} {format(new Date(problem.updated_at), 'PPP p')}
                  </Text>
                )}
              </Space>
            </Col>
          </Row>
        </Card>

        {/* History / changes */}
        <Card title={i18nT("ui.teambuilder.problems.problemid.historyOfChanges")}>
          {history.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={i18nT("ui.teambuilder.problems.problemid.noHistoryRecordedYet")}
            />
          ) : (
            <Timeline
              mode="left"
              items={history.map((event) => ({
                color: event.type === 'STATUS_CHANGE' ? 'blue' : 'gray',
                children: (
                  <Space direction="vertical" size={2}>
                    <Text strong>{event.title}</Text>
                    <Text type="secondary">
                      {event.timestamp
                        ? format(new Date(event.timestamp), 'PPP p')
                        : null}
                    </Text>
                    {event.description && (
                      <Text type="secondary">{event.description}</Text>
                    )}
                  </Space>
                ),
              }))}
            />
          )}
        </Card>
      </Space>
    );
  };

  const renderSessionsTab = () => {
    if (!problem) {
      return (
        <Card>
          <Empty description={i18nT("ui.teambuilder.problems.problemid.noProblemLoaded")} />
        </Card>
      );
    }

    const columns = [
      {
        title: i18nT("ui.teambuilder.problems.problemid.session"),
        dataIndex: 'name',
        key: 'name',
        render: (value: string, record: IProblemSessionSummary) => (
          <Button type="link" href={`/teambuilder/${record.id}`}>
            {value}
          </Button>
        ),
      },
      {
        title: i18nT("ui.teambuilder.problems.problemid.status"),
        dataIndex: 'status',
        key: 'status',
        render: (status: ProblemSessionStatus) => {
          switch (status) {
            case 'COMPLETED':
              return <Badge status="success" text={i18nT("ui.teambuilder.problems.problemid.completed")} />;
            case 'PROCESSING':
              return <Badge status="processing" text={i18nT("ui.teambuilder.problems.problemid.processing")} />;
            case 'DRAFT':
              return <Badge status="warning" text={i18nT("ui.teambuilder.problems.problemid.draft")} />;
            case 'ARCHIVED':
              return <Badge status="default" text={i18nT("ui.teambuilder.problems.problemid.archived")} />;
            default:
              return <Badge status="default" text={status} />;
          }
        },
      },
      {
        title: i18nT("ui.teambuilder.problems.problemid.mode"),
        dataIndex: 'mode',
        key: 'mode',
        render: (mode: string | undefined) =>
          mode ? (
            <Tag color="purple">{mode}</Tag>
          ) : (
            <Text type="secondary">—</Text>
          ),
      },
      {
        title: i18nT("ui.teambuilder.problems.problemid.created"),
        dataIndex: 'created_at',
        key: 'created_at',
        render: (value: string | undefined) =>
          value ? format(new Date(value), 'PPP p') : '—',
      },
      {
        title: i18nT("ui.teambuilder.problems.problemid.outcomeScore"),
        dataIndex: 'outcome_score',
        key: 'outcome_score',
        render: (score: number | undefined) =>
          typeof score === 'number' ? score.toFixed(1) : '—',
      },
      {
        title: '',
        key: 'actions',
        render: (_: unknown, record: IProblemSessionSummary) => (
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            href={`/teambuilder/${record.id}`}
          >
            {i18nT("ui.teambuilder.problems.problemid.view")}
          </Button>
        ),
      },
    ];

    return (
      <Card>
        {sessions.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Space direction="vertical" size={4}>
                <Text strong>{i18nT("ui.teambuilder.problems.problemid.noSessionsYet")}</Text>
                <Text type="secondary">
                  {i18nT("ui.teambuilder.problems.problemid.useCreateSessionWithThisProblemTo")}
                </Text>
              </Space>
            }
          >
            <Button
              type="primary"
              icon={<ProjectOutlined />}
              href={`/teambuilder/create?problemId=${encodeURIComponent(
                problem.id,
              )}`}
            >
              {i18nT("ui.teambuilder.problems.problemid.createSession")}
            </Button>
          </Empty>
        ) : (
          <Table<IProblemSessionSummary>
            rowKey="id"
            dataSource={sessions}
            columns={columns}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Card>
    );
  };

  const renderTaxonomyTab = () => {
    if (!problem) {
      return (
        <Card>
          <Empty description={i18nT("ui.teambuilder.problems.problemid.noProblemLoaded")} />
        </Card>
      );
    }

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title={i18nT("ui.teambuilder.problems.problemid.unescoTaxonomyDomains")}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space direction="vertical">
              <Text type="secondary">{i18nT("ui.teambuilder.problems.problemid.unescoCodes")}</Text>
              {unescoTags.length > 0 ? (
                <Space wrap>{unescoTags}</Space>
              ) : (
                <Text type="secondary">
                  {i18nT("ui.teambuilder.problems.problemid.noUnescoClassificationSetYet")}
                </Text>
              )}
            </Space>

            <Space direction="vertical">
              <Text type="secondary">{i18nT("ui.teambuilder.problems.problemid.categories")}</Text>
              {categoryTags.length > 0 ? (
                <Space wrap>{categoryTags}</Space>
              ) : (
                <Text type="secondary">
                  {i18nT("ui.teambuilder.problems.problemid.noAdditionalCategoriesDefined")}
                </Text>
              )}
            </Space>

            <Paragraph type="secondary">
              {i18nT("ui.teambuilder.problems.problemid.unescoTaxonomyHelpsYouClassifyProblemsAccording")}
            </Paragraph>
          </Space>
        </Card>

        <Card title={i18nT("ui.teambuilder.problems.problemid.notesForFacilitators")}>
          {problem.facilitator_notes ? (
            <Paragraph>{problem.facilitator_notes}</Paragraph>
          ) : (
            <Text type="secondary">
              {i18nT("ui.teambuilder.problems.problemid.noSpecificNotesProvidedYetUseThis")}
            </Text>
          )}
        </Card>
      </Space>
    );
  };

  // ---------------------------------------------------------------------------
  // Main content
  // ---------------------------------------------------------------------------

  let body: React.ReactNode;

  if (loading && !problem) {
    body = (
      <Card>
        <Space
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '48px 0',
          }}
        >
          <Typography.Text>{i18nT("ui.teambuilder.problems.problemid.loadingProblem")}</Typography.Text>
        </Space>
      </Card>
    );
  } else if (error || !problem) {
    body = (
      <Card>
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.teambuilder.problems.problemid.unableToLoadThisProblem")}
          description={error ?? i18nT("ui.teambuilder.problems.problemid.problemNotFound")}
          action={
            <Button
              type="primary"
              href="/teambuilder/problems"
              icon={<ArrowLeftOutlined />}
            >
              {i18nT("ui.teambuilder.problems.problemid.backToProblems")}
            </Button>
          }
        />
      </Card>
    );
  } else {
    body = (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Breadcrumb / context */}
        <Breadcrumb
          items={[
            { title: <Link href="/teambuilder">{i18nT("ui.teambuilder.problems.problemid.teamBuilder")}</Link> },
            { title: <Link href="/teambuilder/problems">{i18nT("ui.teambuilder.problems.problemid.problems")}</Link> },
            { title: problem.name },
          ]}
        />

        <Card>
          <Tabs
            activeKey={activeTab}
            onChange={(key) => setActiveTab(key as TabKey)}
            items={[
              {
                key: 'overview',
                label: i18nT("ui.teambuilder.problems.problemid.overview"),
                children: renderOverviewTab(),
              },
              {
                key: 'sessions',
                label: i18nT("ui.teambuilder.problems.problemid.sessions", { usageCount: usageCount }),
                children: renderSessionsTab(),
              },
              {
                key: 'taxonomy',
                label: i18nT("ui.teambuilder.problems.problemid.taxonomy"),
                children: renderTaxonomyTab(),
              },
            ]}
          />
        </Card>
      </Space>
    );
  }

  return (
    <TeamBuilderPageShell
      title={shellTitle}
      subtitle={shellSubtitle}
      metaTitle={metaTitle}
      sectionLabel={i18nT("ui.teambuilder.problems.problemid.problems")}
      maxWidth={1200}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      {body}
    </TeamBuilderPageShell>
  );
}
