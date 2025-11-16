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
} from 'antd';
import {
  TrophyOutlined,
  StarFilled,
  ThunderboltOutlined,
  ExperimentOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import usePageTitle from '@/hooks/usePageTitle';

const { Title, Text } = Typography;

type ReputationSummary = {
  ekohScore: number;
  smartVoteWeight: number;
  trustTier: string;
  totalVotes: number;
  domains: string[];
  lastSync: string;
};

type ExpertiseArea = {
  id: string;
  label: string;
  domain: string;
  level: 'core' | 'supporting';
};

type ReputationEvent = {
  id: string;
  when: string;
  title: string;
  detail: string;
};

type Badge = {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: ReactNode;
  color: string;
};

const reputation: ReputationSummary = {
  ekohScore: 1234,
  smartVoteWeight: 2.7,
  trustTier: 'Emerging Expert',
  totalVotes: 148,
  domains: ['Sustainability', 'Product Strategy', 'AI Ethics'],
  lastSync: '2024-10-15',
};

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

const reputationTimeline: ReputationEvent[] = [
  {
    id: 'evt-1',
    when: '2024-03-15',
    title: 'Ekoh profile linked to KeenKonnect',
    detail: 'Your existing Ekoh trust score is now visible inside KeenKonnect.',
  },
  {
    id: 'evt-2',
    when: '2024-05-02',
    title: 'First project created from Ekoh contacts',
    detail:
      'You started a sustainability-focused project with 4 contributors you interacted with on Ekoh.',
  },
  {
    id: 'evt-3',
    when: '2024-07-21',
    title: 'Smart vote weight increased',
    detail:
      'Your consistent high-quality contributions raised your smart vote weight above 2×.',
  },
  {
    id: 'evt-4',
    when: '2024-09-10',
    title: 'Emerging Expert tier unlocked',
    detail:
      'You crossed the threshold to be highlighted in team matching for Sustainability & Product Strategy.',
  },
];

const badges: Badge[] = [
  {
    id: 'badge-1',
    name: 'Emerging Expert',
    description:
      'Recognized as an emerging expert in at least one core domain. Your profile is surfaced more often in KeenKonnect team search.',
    category: 'Expertise',
    icon: <StarFilled />,
    color: 'gold',
  },
  {
    id: 'badge-2',
    name: 'High-Impact Contributor',
    description:
      'Your votes and contributions frequently shift consensus. Used to weigh your input more strongly in collaborative decisions.',
    category: 'Impact',
    icon: <ThunderboltOutlined />,
    color: 'volcano',
  },
  {
    id: 'badge-3',
    name: 'Experimentation Champion',
    description:
      'You consistently propose and document experiments. Teams looking for experimentation skills see you higher in results.',
    category: 'Practice',
    icon: <ExperimentOutlined />,
    color: 'geekblue',
  },
  {
    id: 'badge-4',
    name: 'Trusted Collaborator',
    description:
      'Peers repeatedly endorse your reliability. This badge boosts your visibility for long-running KeenKonnect projects.',
    category: 'Collaboration',
    icon: <TeamOutlined />,
    color: 'green',
  },
  {
    id: 'badge-5',
    name: 'Top 5% in Sustainability',
    description:
      'Your Ekoh score in Sustainability sits in the top 5%. Used when teams search for climate & impact-related expertise.',
    category: 'Domain signal',
    icon: <TrophyOutlined />,
    color: 'purple',
  },
];

export default function ViewReputationEkohPage(): JSX.Element {
  usePageTitle('KeenKonnect · Ekoh reputation');

  return (
    <>
      <Head>
        <title>KeenKonnect – Ekoh reputation</title>
      </Head>

      <div className="container mx-auto p-5">
        {/* Titre aligné sur la page de référence */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold mb-1">Ekoh reputation</h1>
          <p className="text-gray-500">
            How your Ekoh trust &amp; expertise are used inside KeenKonnect.
          </p>
        </header>

        {/* Bloc principal : résumé + timeline */}
        <Row gutter={[24, 24]}>
          {/* Colonne gauche : profil + résumé Ekoh */}
          <Col xs={24} lg={8}>
            <Card>
              <Space
                direction="vertical"
                align="center"
                style={{ width: '100%' }}
              >
                <Avatar size={80} style={{ backgroundColor: '#1677ff' }}>
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
                  <Text strong>{reputation.ekohScore}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Smart vote weight">
                  <Text strong>{reputation.smartVoteWeight.toFixed(1)}×</Text>{' '}
                  <Text type="secondary">(relative influence)</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Tier">
                  <Tag color="blue">{reputation.trustTier}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Primary domains">
                  <Space size={4} wrap>
                    {reputation.domains.map((d) => (
                      <Tag key={d}>{d}</Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Last sync from Ekoh">
                  <Text type="secondary">{reputation.lastSync}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Colonne droite : stats + timeline */}
          <Col xs={24} lg={16}>
            {/* Stats en 3 colonnes */}
            <Card className="mb-4">
              <Row gutter={[16, 16]}>
                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text type="secondary">Global Ekoh score</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {reputation.ekohScore}
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
                      {reputation.smartVoteWeight.toFixed(1)}×
                    </Title>
                    <Text type="secondary">
                      Your votes weigh more when teams use Ekoh-backed decisions.
                    </Text>
                  </Space>
                </Col>
                <Col xs={24} md={8}>
                  <Space direction="vertical">
                    <Text type="secondary">Validated interactions</Text>
                    <Title level={3} style={{ margin: 0 }}>
                      {reputation.totalVotes}
                    </Title>
                    <Text type="secondary">
                      Conversations, votes &amp; reviews used to compute your
                      reputation.
                    </Text>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Timeline */}
            <Card title="Reputation timeline">
              <Timeline
                mode="left"
                items={reputationTimeline.map((item) => ({
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

        {/* Expertise importée depuis Ekoh */}
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
                    – used for project matching &amp; workspace recommendations.
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>

        {/* Badges & achievements */}
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
                        <Text strong>{badge.name}</Text>
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
