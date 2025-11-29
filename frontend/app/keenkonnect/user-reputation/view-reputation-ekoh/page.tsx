// FILE: frontend/app/keenkonnect/user-reputation/view-reputation-ekoh/page.tsx
// app/keenkonnect/user-reputation/view-reputation-ekoh/page.tsx
'use client';

import React, { type ReactNode } from 'react';
import Head from 'next/head';
import {
  Avatar,
  Card,
  Descriptions,
  Timeline,
  List,
  Tag,
  Typography,
  Space,
  Row,
  Col,
  Spin,
  Alert,
} from 'antd';
import {
  StarFilled,
  ThunderboltOutlined,
  ExperimentOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import usePageTitle from '@/hooks/usePageTitle';
import useReputationEvents from '@/hooks/useReputationEvents';
import KeenPage from '@/app/keenkonnect/KeenPageShell';

const { Title, Text } = Typography;

type ExpertiseArea = {
  id: string;
  label: string;
  domain: string;
  level: 'core' | 'supporting';
};

/**
 * Static placeholder until we have a real "expertise from Ekoh" API.
 * This only affects the lower section – the core score/timeline/badges
 * now come from the backend.
 */
const expertiseAreas: ExpertiseArea[] = [
  {
    id: 'exp-1',
    label: 'Sustainable product roadmapping',
    domain: 'Sustainability',
    level: 'core',
  },
  {
    id: 'exp-2',
    label: 'Experimentation & A/B testing',
    domain: 'Product Strategy',
    level: 'core',
  },
  {
    id: 'exp-3',
    label: 'AI fairness & guardrails',
    domain: 'AI Ethics',
    level: 'supporting',
  },
];

/**
 * Badge metadata for visual display, keyed by backend badge id.
 * Back-end provides: id, label, description, earnedAt.
 * Here we attach category, color and icon for the UI.
 */
const BADGE_META: Record<
  string,
  { icon: ReactNode; color: string; category: string }
> = {
  'first-stance': {
    icon: <TeamOutlined />,
    color: 'green',
    category: 'Participation',
  },
  'argument-builder': {
    icon: <ExperimentOutlined />,
    color: 'geekblue',
    category: 'Depth',
  },
  'active-voter': {
    icon: <ThunderboltOutlined />,
    color: 'volcano',
    category: 'Voting',
  },
};

export default function ViewReputationEkohPage(): JSX.Element {
  usePageTitle('KeenKonnect · Ekoh reputation');

  const { data, isLoading, isError, error } = useReputationEvents();

  const profile = data?.profile;
  const timeline = data?.timeline ?? [];
  const rawBadges = data?.badges ?? [];

  // High-level numbers derived from Ekoh profile
  const ekohScore = profile?.score ?? 0;

  const influenceDimension = profile?.dimensions.find(
    (d) => d.key === 'influence',
  );

  // Simple, explicit mapping from influence index (0–100) to a weight multiplier
  const smartVoteWeight =
    influenceDimension != null
      ? Number((1 + influenceDimension.score / 50).toFixed(1))
      : 1.0;

  // Aggregated interaction index – not a literal count, but a readable big number
  const totalInteractions =
    profile != null ? Math.max(ekohScore, 0) : 0;

  const tierLabel =
    profile?.level === 'Steward'
      ? 'Trusted steward'
      : profile?.level === 'Contributor'
      ? 'Active contributor'
      : profile?.level === 'Visitor'
      ? 'New voice'
      : 'Not initialized yet';

  const badges = rawBadges.map((b) => {
    const meta =
      BADGE_META[b.id] ?? {
        icon: <StarFilled />,
        color: 'default',
        category: 'Reputation',
      };
    return <KeenPage title="Page" description="">{ ...b, ...meta }</KeenPage>;
  });

  return (
    <>
      <Head>
        <title>KeenKonnect – Ekoh reputation</title>
      </Head>

      <div className="container mx-auto p-5">
        {/* Page header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Ekoh reputation</h1>
          <p className="text-gray-500">
            How your Ekoh trust &amp; expertise are used inside KeenKonnect.
          </p>
        </header>

        {/* Loading / error states for the reputation fetch */}
        {isLoading && (
          <div className="mb-4">
            <Spin />
          </div>
        )}

        {isError && (
          <div className="mb-4">
            <Alert
              type="error"
              message="Unable to load Ekoh reputation"
              description={
                (error as Error | undefined)?.message ??
                'Please try again in a moment.'
              }
            />
          </div>
        )}

        {/* Main two-column layout: summary + timeline */}
        <Row gutter={[24, 24]}>
          {/* Left: profile + summary card */}
          <Col xs={24} lg={8}>
            <Card>
              <Space
                direction="vertical"
                align="center"
                style={{ width: '100%' }}
              >
                <Avatar
                  size={80}
                  style={{
                    backgroundColor: '#1e6864',
                    color: '#ffffff',
                  }}
                >
                  EK
                </Avatar>

                <div style={{ textAlign: 'center' }}>
                  <Title level={4} style={{ marginBottom: 4 }}>
                    Ekoh profile signal
                  </Title>
                  <Text type="secondary">
                    Imported reputation used for matching &amp; project discovery
                    in KeenKonnect.
                  </Text>
                </div>
              </Space>

              <Descriptions
                size="small"
                column={1}
                style={{ marginTop: 24 }}
                labelStyle={{ width: 160 }}
              >
                <Descriptions.Item label="Ekoh score">
                  <Text strong>{ekohScore}</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Smart vote weight">
                  <Text strong>{smartVoteWeight.toFixed(1)}×</Text>{' '}
                  <Text type="secondary">(relative influence index)</Text>
                </Descriptions.Item>

                <Descriptions.Item label="Tier">
                  <Tag color="blue">{tierLabel}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Last sync from Ekoh">
                  <Text type="secondary">
                    Based on your recent Ethikos &amp; KonnectED activity.
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Right: big stats + timeline */}
          <Col xs={24} lg={16}>
            {/* 3-number summary */}
            <Card className="mb-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text type="secondary">Global Ekoh score</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {ekohScore}
                    </Title>
                    <Text type="secondary">
                      Used as a global trust signal across all KeenKonnect
                      workspaces.
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text type="secondary">Smart vote weight</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {smartVoteWeight.toFixed(1)}×
                    </Title>
                    <Text type="secondary">
                      Your votes weigh more when teams use Ekoh-backed
                      decisions.
                    </Text>
                  </Space>
                </Col>

                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text type="secondary">
                      Validated interactions (index)
                    </Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {totalInteractions}
                    </Title>
                    <Text type="secondary">
                      Aggregated indicator based on your contributions and
                      votes.
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Timeline from backend-derived events */}
            <Card title="Reputation timeline">
              <Timeline
                mode="left"
                items={timeline.map((item) => ({
                  key: item.id,
                  label: item.when,
                  children: (
                    <div>
                      <Text strong>{item.title}</Text>
                      <div>
                        <Text type="secondary">{item.detail}</Text>
                      </div>
                    </div>
                  ),
                }))}
              />
            </Card>
          </Col>
        </Row>

        {/* Expertise section (still static for now) */}
        <Card
          title="Expertise imported from Ekoh"
          className="mt-6"
        >
          <List
            size="small"
            dataSource={expertiseAreas}
            renderItem={(area) => (
              <List.Item key={area.id}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Space>
                    <Tag color={area.level === 'core' ? 'geekblue' : 'default'}>
                      {area.level === 'core' ? 'Core domain' : 'Supporting'}
                    </Tag>
                    <Text strong>{area.label}</Text>
                  </Space>
                  <Text type="secondary">
                    Domain:{' '}
                    <Text type="secondary" strong>
                      {area.domain}
                    </Text>{' '}
                    – used for project matching &amp; workspace
                    recommendations.
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        {/* Badges mapped from backend -> visual cards */}
        <Card
          title="Badges & achievements from Ekoh"
          extra={
            <Text type="secondary">
              Displayed in KeenKonnect when teams browse your profile.
            </Text>
          }
          className="mt-6"
        >
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
            dataSource={badges}
            renderItem={(badge) => (
              <List.Item key={badge.id}>
                <Card hoverable>
                  <Space align="start">
                    <Avatar
                      shape="square"
                      size={40}
                      style={{
                        backgroundColor: 'var(--ant-color-primary-bg)',
                      }}
                      icon={badge.icon}
                    />
                    <div>
                      <Space style={{ marginBottom: 4 }}>
                        <Text strong>{badge.label}</Text>
                        <Tag color={badge.color}>{badge.category}</Tag>
                      </Space>
                      <Text type="secondary">{badge.description}</Text>
                    </div>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </>
  );
}
