// frontend/app/teambuilder/[sessionId]/page.tsx
'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';
import { teambuilderService } from '@/services/teambuilder';
import { IBuilderSession } from '@/services/teambuilder/types';
import { TeamCard } from '@/components/teambuilder/TeamCard';

const { Text, Paragraph } = Typography;

export default function SessionDetailPage(): JSX.Element {
  const { sessionId } = useParams();

  const [session, setSession] = useState<IBuilderSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data Fetching
  // ---------------------------------------------------------------------------
  const fetchSession = useCallback(async () => {
    if (!sessionId) return;
    try {
      const data = await teambuilderService.getSessionById(sessionId as string);
      setSession(data);
      setError(null);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      setError('Failed to load session details.');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

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
      // eslint-disable-next-line no-console
      console.error(err);
      setError('Failed to generate teams. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const isProcessing = session?.status === 'PROCESSING';
  const hasTeams = !!(session && session.teams && session.teams.length > 0);

  const renderStatusTag = () => {
    if (!session) return null;

    switch (session.status) {
      case 'COMPLETED':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Completed
          </Tag>
        );
      case 'PROCESSING':
        return (
          <Tag color="processing" icon={<ClockCircleOutlined />}>
            Processing
          </Tag>
        );
      case 'DRAFT':
        return <Tag>Draft</Tag>;
      case 'ARCHIVED':
        return <Tag color="default">Archived</Tag>;
      default:
        return <Tag>{session.status}</Tag>;
    }
  };

  // ---------------------------------------------------------------------------
  // Shell props (Ant Design–style architecture)
  // ---------------------------------------------------------------------------
  const shellTitle = session?.name ?? 'Team Builder session';
  const shellSubtitle =
    session?.description != null && session.description.trim().length > 0 ? (
      <Text type="secondary">{session.description}</Text>
    ) : (
      <Text type="secondary">
        Review the configuration and generated teams for this Team Builder
        session.
      </Text>
    );

  const primaryAction =
    session && !isProcessing ? (
      <Button
        type="primary"
        icon={
          generating ? <ReloadOutlined spin /> : <BranchesOutlined />
        }
        onClick={handleGenerateTeams}
        loading={generating}
      >
        {hasTeams ? 'Regenerate teams' : 'Generate teams'}
      </Button>
    ) : undefined;

  const secondaryActions = (
    <Space>
      <Button
        icon={<ArrowLeftOutlined />}
        href="/teambuilder"
      >
        Back to sessions
      </Button>
    </Space>
  );

  const metaTitle = session
    ? `Team Builder · Session · ${session.name}`
    : 'Team Builder · Session';

  // ---------------------------------------------------------------------------
  // Content blocks
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
        message="Unable to load this session"
        description={error ?? 'Session not found.'}
        action={
          <Button
            type="primary"
            href="/teambuilder"
            icon={<ArrowLeftOutlined />}
          >
            Back to sessions
          </Button>
        }
      />
    );
  } else {
    content = (
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        {/* Meta / status card */}
        <Card>
          <Space
            direction="vertical"
            size="small"
            style={{ width: '100%' }}
          >
            <Space size="middle" wrap>
              <Text strong>Status:</Text>
              {renderStatusTag()}
              {session.created_at && (
                <Text type="secondary">
                  Created{' '}
                  {format(new Date(session.created_at), 'PPP p')}
                </Text>
              )}
            </Space>

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

        {/* Config summary */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Statistic
                title="Candidates in pool"
                value={session.candidates_count}
                prefix={<TeamOutlined />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Target team size"
                value={
                  session.algorithm_config?.target_team_size ?? '-'
                }
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Strategy"
                value={
                  session.algorithm_config?.strategy
                    ?.replace('_', ' ') ?? '-'
                }
              />
            </Col>
          </Row>
        </Card>

        {/* Teams grid / empty state */}
        {!hasTeams ? (
          <Card>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Space direction="vertical" size={4}>
                  <Text strong>Ready to build teams</Text>
                  <Text type="secondary">
                    Use the Generate teams action above to run the
                    algorithm and create balanced groups.
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
                  Generate teams
                </Button>
              )}
            </Empty>
          </Card>
        ) : (
          <Row gutter={[16, 16]}>
            {session.teams.map((team) => (
              <Col
                key={team.id}
                xs={24}
                md={12}
                xl={8}
              >
                <TeamCard team={team} />
              </Col>
            ))}
          </Row>
        )}
      </Space>
    );
  }

  return (
    <TeamBuilderPageShell
      title={shellTitle}
      subtitle={shellSubtitle}
      metaTitle={metaTitle}
      sectionLabel="Sessions"
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      maxWidth={1200}
    >
      {content}
    </TeamBuilderPageShell>
  );
}
