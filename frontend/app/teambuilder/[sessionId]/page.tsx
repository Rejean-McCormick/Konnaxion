// FILE: frontend/app/teambuilder/[sessionId]/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  AlertOutlined,
  ArrowLeftOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  Collapse,
  Descriptions,
  Empty,
  Progress,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import type { TableColumnsType, TabsProps } from 'antd';
import { format } from 'date-fns';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';
import { teambuilderService } from '@/services/teambuilder';
import type { IBuilderSession } from '@/services/teambuilder/types';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

// ---------------------------------------------------------------------------
// Types for local rendering
// ---------------------------------------------------------------------------

type MemberRow = {
  id: string | number;
  name: string;
  role?: string;
  isLeader?: boolean;
  hasConflict?: boolean;
  status?: string;
};

type TeamRow = {
  id: string | number;
  name: string;
  size: number;
  score?: number;
  status?: string;
  members: MemberRow[];
};

type BuilderMemberLike = {
  id?: string | number;
  user_id?: string | number;
  name?: string;
  displayName?: string;
  role?: string;
  function?: string;
  is_leader?: boolean;
  leader?: boolean;
  has_conflict?: boolean;
  status?: string;
};

type BuilderTeamLike = {
  id?: string | number;
  team_id?: string | number;
  name?: string;
  score?: number;
  quality_score?: number;
  status?: string;
  members?: BuilderMemberLike[];
};

type SessionExtensions = {
  algorithm_config?: IBuilderSession['algorithm_config'] & {
    mode?: string;
    max_teams?: string | number;
    fairness?: string;
  };
  mode?: string;
  warnings?: string[];
  issues?: string[];
  last_run_at?: string;
  updated_at?: string;
  problem_name?: string;
  owner_name?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SessionDetailPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { sessionId } = useParams();

  const [session, setSession] = useState<IBuilderSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Some backend deployments expose additional session metadata.
  const sessionExtended = session as (IBuilderSession & SessionExtensions) | null;

  // ---------------------------------------------------------------------------
  // Data fetching
  // ---------------------------------------------------------------------------

  const fetchSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      const data = await teambuilderService.getSessionById(
        sessionId as string,
      );
      setSession(data);
      setError(null);
    } catch (err) {
       
      console.error(err);
      setError(i18nT("ui.teambuilder.sessionid.failedToLoadSessionDetails"));
      setSession(null);
    } finally {
      setLoading(false);
    }
  }, [sessionId, i18nT]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleGenerateTeams = async () => {
    if (!sessionId) return;

    setGenerating(true);
    setError(null);

    try {
      const updatedSession = await teambuilderService.generateTeams(
        sessionId as string,
      );
      setSession(updatedSession);
    } catch (err) {
       
      console.error(err);
      setError(i18nT("ui.teambuilder.sessionid.failedToGenerateTeamsPleaseTryAgain"));
    } finally {
      setGenerating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const isProcessing = session?.status === 'PROCESSING';
  const hasTeams = !!(session && session.teams && session.teams.length > 0);

  const modeTag = useMemo(() => {
    const mode: string | undefined =
      sessionExtended?.algorithm_config?.mode ||
      sessionExtended?.mode ||
      undefined;

    if (!mode) {
      return (
        <Tag color="default">
          {i18nT("ui.teambuilder.sessionid.mode")} <Text type="secondary">{i18nT("ui.teambuilder.sessionid.notSpecified")}</Text>
        </Tag>
      );
    }

    const normalized = String(mode).toUpperCase();

    if (normalized.includes('ELITE') || normalized.includes('CRITICAL')) {
      return (
        <Tag color="red">
          {i18nT("ui.teambuilder.sessionid.mode")}{' '}
          <Text strong style={{ marginLeft: 4 }}>
            {i18nT("ui.teambuilder.sessionid.eliteCritical")}
          </Text>
        </Tag>
      );
    }

    if (normalized.includes('LEARNING')) {
      return (
        <Tag color="blue">
          {i18nT("ui.teambuilder.sessionid.mode")}{' '}
          <Text strong style={{ marginLeft: 4 }}>
            {i18nT("ui.teambuilder.sessionid.learning")}
          </Text>
        </Tag>
      );
    }

    if (normalized.includes('REHAB') || normalized.includes('RISK')) {
      return (
        <Tag color="orange">
          {i18nT("ui.teambuilder.sessionid.mode")}{' '}
          <Text strong style={{ marginLeft: 4 }}>
            {i18nT("ui.teambuilder.sessionid.rehabHighRisk")}
          </Text>
        </Tag>
      );
    }

    return (
      <Tag color="green">
        {i18nT("ui.teambuilder.sessionid.mode")}{' '}
        <Text strong style={{ marginLeft: 4 }}>
          {mode}
        </Text>
      </Tag>
    );
  }, [sessionExtended, i18nT]);

  const unresolvedWarnings: string[] =
    sessionExtended?.warnings ?? sessionExtended?.issues ?? [];

  const progressValue = useMemo(() => {
    if (!session) return 0;
    if (!hasTeams) return 25;
    if (isProcessing) return 60;
    if (session.status === 'COMPLETED') return 100;
    return 50;
  }, [session, hasTeams, isProcessing]);

  const renderStatusTag = () => {
    if (!session) return null;

    switch (session.status) {
      case 'COMPLETED':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            {i18nT("ui.teambuilder.sessionid.completed")}
          </Tag>
        );
      case 'PROCESSING':
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            {i18nT("ui.teambuilder.sessionid.processing")}
          </Tag>
        );
      case 'DRAFT':
        return <Tag>{i18nT("ui.teambuilder.sessionid.draft")}</Tag>;
      case 'ARCHIVED':
        return <Tag color="default">{i18nT("ui.teambuilder.sessionid.archived")}</Tag>;
      default:
        return <Tag>{session.status}</Tag>;
    }
  };

  // ---------------------------------------------------------------------------
  // Shell props
  // ---------------------------------------------------------------------------

  const shellTitle = session?.name ?? i18nT("ui.teambuilder.sessionid.teamBuilderSession");
  const shellSubtitle =
    session?.description != null && session.description.trim().length > 0 ? (
      <Text type="secondary">{session.description}</Text>
    ) : (
      <Text type="secondary">
        {i18nT("ui.teambuilder.sessionid.reviewConfigurationHistoryAndGeneratedTeamsFor")}
      </Text>
    );

  const primaryAction =
    session && !isProcessing ? (
      <Button
        type="primary"
        icon={generating ? <ReloadOutlined spin /> : <BranchesOutlined />}
        onClick={handleGenerateTeams}
        loading={generating}
      >
        {hasTeams ? i18nT("ui.teambuilder.sessionid.regenerateTeams") : i18nT("ui.teambuilder.sessionid.generateTeams")}
      </Button>
    ) : undefined;

  const secondaryActions = (
    <Space>
      <Button icon={<ArrowLeftOutlined />} href="/teambuilder">
        {i18nT("ui.teambuilder.sessionid.backToSessions")}
      </Button>
    </Space>
  );

  const metaTitle = session
    ? `Team Builder · Session · ${session.name}`
    : i18nT("ui.teambuilder.sessionid.teamBuilderSession_90b3ab");

  // ---------------------------------------------------------------------------
  // Teams table
  // ---------------------------------------------------------------------------

  const teamRows: TeamRow[] = useMemo(() => {
    if (!session || !Array.isArray(session.teams)) return [];

    const teams = session.teams as unknown as BuilderTeamLike[];

    return teams.map((team) => {
      const members: MemberRow[] = (team.members ?? []).map((m) => ({
        id: m.id ?? m.user_id ?? String(m.name ?? 'member'),
        name: m.name ?? m.displayName ?? 'Unknown',
        role: m.role ?? m.function ?? undefined,
        isLeader: !!m.is_leader || !!m.leader,
        hasConflict: !!m.has_conflict,
        status: m.status ?? 'active',
      }));

      return {
        id: team.id ?? team.team_id ?? String(team.name ?? 'team'),
        name: team.name ?? `Team ${team.id ?? ''}`,
        size: members.length,
        score: team.score ?? team.quality_score,
        status: team.status ?? session.status,
        members,
      };
    });
  }, [session]);

  const teamColumns: TableColumnsType<TeamRow> = [
    {
      title: i18nT("ui.teambuilder.sessionid.team"),
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          {record.status && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.teambuilder.sessionid.status")} {record.status}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.teambuilder.sessionid.size"),
      dataIndex: 'size',
      key: 'size',
      align: 'right',
      width: 80,
      render: value => (
        <Space>
          <TeamOutlined />
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: i18nT("ui.teambuilder.sessionid.score"),
      dataIndex: 'score',
      key: 'score',
      align: 'right',
      width: 120,
      render: value =>
        value != null ? (
          <Text>{Number(value).toFixed(2)}</Text>
        ) : (
          <Text type="secondary">–</Text>
        ),
    },
  ];

  const expandedRowRender = (team: TeamRow) => (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      <Text type="secondary">{i18nT("ui.teambuilder.sessionid.members")}</Text>
      {team.members.length === 0 ? (
        <Text type="secondary">{i18nT("ui.teambuilder.sessionid.noMembersAssignedYet")}</Text>
      ) : (
        <Space direction="vertical" style={{ width: '100%' }}>
          {team.members.map(member => (
            <Space
              key={member.id}
              align="center"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <Space size="small">
                <Badge
                  status={
                    member.status === 'inactive'
                      ? 'default'
                      : member.status === 'pending'
                      ? 'processing'
                      : 'success'
                  }
                />
                <Text>{member.name}</Text>
                {member.role && (
                  <Tag color="blue" style={{ marginLeft: 4 }}>
                    {member.role}
                  </Tag>
                )}
                {member.isLeader && (
                  <Tag color="gold" icon={<TeamOutlined />}>
                    {i18nT("ui.teambuilder.sessionid.leader")}
                  </Tag>
                )}
                {member.hasConflict && (
                  <Tag
                    color="red"
                    icon={<AlertOutlined />}
                    style={{ marginLeft: 4 }}
                  >
                    {i18nT("ui.teambuilder.sessionid.conflictRisk")}
                  </Tag>
                )}
              </Space>
              {member.status && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {member.status}
                </Text>
              )}
            </Space>
          ))}
        </Space>
      )}
    </Space>
  );

  // ---------------------------------------------------------------------------
  // Timeline / history
  // ---------------------------------------------------------------------------

  const historyItems = useMemo(() => {
    const items: { label: string; description?: string }[] = [];

    if (session?.created_at) {
      items.push({
        label: i18nT("ui.teambuilder.sessionid.sessionCreated", { value1: format(
          new Date(session.created_at),
          'PPP p',
        ) }),
        description: i18nT("ui.teambuilder.sessionid.initialConfigurationSaved"),
      });
    }

    if (sessionExtended?.last_run_at) {
      items.push({
        label: i18nT("ui.teambuilder.sessionid.teamsGenerated", { value1: format(
          new Date(sessionExtended.last_run_at),
          'PPP p',
        ) }),
        description: i18nT("ui.teambuilder.sessionid.teamBuilderAlgorithmExecuted"),
      });
    }

    if (sessionExtended?.updated_at && sessionExtended.updated_at !== session?.created_at) {
      items.push({
        label: i18nT("ui.teambuilder.sessionid.lastUpdated", { value1: format(
          new Date(sessionExtended.updated_at),
          'PPP p',
        ) }),
        description: i18nT("ui.teambuilder.sessionid.configurationOrTeamsUpdated"),
      });
    }

    if (items.length === 0) {
      items.push({
        label: i18nT("ui.teambuilder.sessionid.noHistoryRecordedYet"),
        description: i18nT("ui.teambuilder.sessionid.thisSessionHasNotBeenModifiedSince"),
      });
    }

    return items;
  }, [session, sessionExtended, i18nT]);

  // ---------------------------------------------------------------------------
  // Page content
  // ---------------------------------------------------------------------------

  let content: React.ReactNode;

  if (loading && !session) {
    content = (
      <div
        style={{
          padding: '48px 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" />
      </div>
    );
  } else if (error || !session) {
    content = (
      <Alert
        type="error"
        showIcon
        message={i18nT("ui.teambuilder.sessionid.unableToLoadThisSession")}
        description={error ?? i18nT("ui.teambuilder.sessionid.sessionNotFound")}
        action={
          <Button
            type="primary"
            href="/teambuilder"
            icon={<ArrowLeftOutlined />}
          >
            {i18nT("ui.teambuilder.sessionid.backToSessions")}
          </Button>
        }
      />
    );
  } else {
    const tabItems: TabsProps['items'] = [
      {
        key: 'overview',
        label: (
          <span>
            <CheckCircleOutlined /> {i18nT("ui.teambuilder.sessionid.overview")}
          </span>
        ),
        children: (
          <Space
            direction="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            {/* Status + meta card */}
            <Card>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} md={16}>
                    <Space size="middle" wrap>
                      <Text strong>{i18nT("ui.teambuilder.sessionid.status")}</Text>
                      {renderStatusTag()}
                      {modeTag}
                      {session.created_at && (
                        <Text type="secondary">
                          {i18nT("ui.teambuilder.sessionid.created")}{' '}
                          {format(
                            new Date(session.created_at),
                            'PPP p',
                          )}
                        </Text>
                      )}
                    </Space>
                  </Col>
                  <Col
                    xs={24}
                    md={8}
                    style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                    }}
                  >
                    <Space direction="vertical" align="end">
                      <Text type="secondary">
                        {i18nT("ui.teambuilder.sessionid.overallProgressLifecycle")}
                      </Text>
                      <Progress
                        percent={progressValue}
                        size="small"
                        status={
                          session.status === 'COMPLETED'
                            ? 'success'
                            : 'active'
                        }
                        style={{ minWidth: 160 }}
                      />
                    </Space>
                  </Col>
                </Row>

                {session.description && (
                  <Paragraph
                    type="secondary"
                    style={{ marginTop: 8, maxWidth: 720 }}
                  >
                    {session.description}
                  </Paragraph>
                )}
              </Space>
            </Card>

            {/* Config & stats card */}
            <Card title={i18nT("ui.teambuilder.sessionid.configurationMetrics")}>
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Statistic
                    title={i18nT("ui.teambuilder.sessionid.candidatesInPool")}
                    value={session.candidates_count}
                    prefix={<TeamOutlined />}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title={i18nT("ui.teambuilder.sessionid.targetTeamSize")}
                    value={session.algorithm_config?.target_team_size ?? '-'}
                  />
                </Col>
                <Col xs={24} md={8}>
                  <Statistic
                    title={i18nT("ui.teambuilder.sessionid.teamsGenerated_a0f883")}
                    value={session.teams?.length ?? 0}
                  />
                </Col>
              </Row>

              <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} md={12}>
                  <Descriptions
                    column={1}
                    size="small"
                    title={i18nT("ui.teambuilder.sessionid.algorithmSettings")}
                  >
                    <Descriptions.Item label={i18nT("ui.teambuilder.sessionid.strategy")}>
                      {session.algorithm_config?.strategy
                        ?.replace('_', ' ') ?? '–'}
                    </Descriptions.Item>
                    <Descriptions.Item label={i18nT("ui.teambuilder.sessionid.maxTeamCount")}>
                      {sessionExtended?.algorithm_config?.max_teams ?? '–'}
                    </Descriptions.Item>
                    <Descriptions.Item label={i18nT("ui.teambuilder.sessionid.fairnessRotation")}>
                      {sessionExtended?.algorithm_config?.fairness ?? '–'}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
                <Col xs={24} md={12}>
                  <Descriptions
                    column={1}
                    size="small"
                    title={i18nT("ui.teambuilder.sessionid.context")}
                  >
                    <Descriptions.Item label={i18nT("ui.teambuilder.sessionid.projectProblem")}>
                      {sessionExtended?.problem_name ?? i18nT("ui.teambuilder.sessionid.notLinked")}
                    </Descriptions.Item>
                    <Descriptions.Item label={i18nT("ui.teambuilder.sessionid.owner")}>
                      {sessionExtended?.owner_name ?? '–'}
                    </Descriptions.Item>
                    <Descriptions.Item label={i18nT("ui.teambuilder.sessionid.mode_a7b93d")}>
                      {modeTag}
                    </Descriptions.Item>
                  </Descriptions>
                </Col>
              </Row>
            </Card>

            {/* Warnings / alerts */}
            {unresolvedWarnings && unresolvedWarnings.length > 0 && (
              <Alert
                type="warning"
                showIcon
                icon={<ExclamationCircleOutlined />}
                message={i18nT("ui.teambuilder.sessionid.warningsForThisSession")}
                description={
                  <Space
                    direction="vertical"
                    size="small"
                    style={{ width: '100%' }}
                  >
                    {unresolvedWarnings.map((w: string, idx: number) => (
                      <Text key={idx} type="secondary">
                        • {w}
                      </Text>
                    ))}
                  </Space>
                }
              />
            )}

            {/* Advanced configuration */}
            <Collapse>
              <Panel
                header={
                  <Space>
                    <AlertOutlined />
                    <span>{i18nT("ui.teambuilder.sessionid.advancedConfigurationDetails")}</span>
                  </Space>
                }
                key="advanced"
              >
                <Paragraph type="secondary">
                  {i18nT("ui.teambuilder.sessionid.advancedConfigurationExplanation")}
                </Paragraph>
                <Card size="small">
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: 12,
                    }}
                  >
                    {JSON.stringify(session.algorithm_config ?? {}, null, 2)}
                  </pre>
                </Card>
              </Panel>
            </Collapse>
          </Space>
        ),
      },
      {
        key: 'teams',
        label: (
          <span>
            <TeamOutlined /> {i18nT("ui.teambuilder.sessionid.teams")}
          </span>
        ),
        children: !hasTeams ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size={4}>
                  <Text strong>{i18nT("ui.teambuilder.sessionid.noTeamsYet")}</Text>
                  <Text type="secondary">
                    {i18nT("ui.teambuilder.sessionid.useTheGenerateTeamsActionAboveTo")}
                  </Text>
                </Space>
              }
            >
              {!isProcessing && (
                <Button
                  type="primary"
                  icon={<BranchesOutlined />}
                  onClick={handleGenerateTeams}
                  loading={generating}
                >
                  {i18nT("ui.teambuilder.sessionid.generateTeams")}
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Card>
            <Table<TeamRow>
              rowKey="id"
              columns={teamColumns}
              dataSource={teamRows}
              expandable={{
                expandedRowRender,
              }}
              pagination={false}
            />
          </Card>
        ),
      },
      {
        key: 'history',
        label: (
          <span>
            <HistoryOutlined /> {i18nT("ui.teambuilder.sessionid.history")}
          </span>
        ),
        children: (
          <Space
            direction="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            <Card title={i18nT("ui.teambuilder.sessionid.timeline")}>
              <Timeline
                items={historyItems.map((item) => ({
                  children: (
                    <Space direction="vertical" size={2}>
                      <Text>{item.label}</Text>
                      {item.description && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.description}
                        </Text>
                      )}
                    </Space>
                  ),
                }))}
              />
            </Card>

            <Card title={i18nT("ui.teambuilder.sessionid.rawActivityPlaceholder")}>
              <Paragraph type="secondary">
                {i18nT("ui.teambuilder.sessionid.hereYouCouldShowAMoreDetailed")}
              </Paragraph>
            </Card>
          </Space>
        ),
      },
    ];

    content = (
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        {/* Optional breadcrumb inside the shell body */}
        <Breadcrumb
          items={[
            { title: <Link href="/teambuilder">{i18nT("ui.teambuilder.sessionid.sessions")}</Link> },
            { title: shellTitle },
          ]}
        />

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Space>
    );
  }

  return (
    <TeamBuilderPageShell
      title={shellTitle}
      subtitle={shellSubtitle}
      metaTitle={metaTitle}
      sectionLabel={i18nT("ui.teambuilder.sessionid.sessions")}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      maxWidth={1200}
    >
      {content}
    </TeamBuilderPageShell>
  );
}
