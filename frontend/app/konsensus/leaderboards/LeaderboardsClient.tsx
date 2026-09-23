// FILE: frontend/app/konsensus/leaderboards/LeaderboardsClient.tsx
'use client';

import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import {
  CrownOutlined,
  FireOutlined,
  GlobalOutlined,
  TeamOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProTable,
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Card,
  Col,
  Divider,
  Layout,
  List,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';

const { Content } = Layout;
const { Text, Paragraph } = Typography;
const { Option } = Select;

type Timeframe = '7d' | '30d' | '90d';

type TrustLevel = 'Gold' | 'Silver' | 'Bronze';

interface LeaderboardRow {
  id: string;
  rank: number;
  user: string;
  handle: string;
  domain: string;
  region: string;
  ekohScore: number;
  votesWeighted: number;
  trustLevel: TrustLevel;
  trend: 'up' | 'down' | 'steady';
}

interface DomainHighlight {
  domain: string;
  topUser: string;
  topScore: number;
  change: string;
}

const MOCK_LEADERBOARD: LeaderboardRow[] = [
  {
    id: '1',
    rank: 1,
    user: 'Dr. Amina K.',
    handle: '@amina-k',
    domain: 'Public Health',
    region: 'Global',
    ekohScore: 97.3,
    votesWeighted: 15432,
    trustLevel: 'Gold',
    trend: 'up',
  },
  {
    id: '2',
    rank: 2,
    user: 'Luis Fernandez',
    handle: '@luis-f',
    domain: 'Climate Policy',
    region: 'Latin America',
    ekohScore: 95.1,
    votesWeighted: 14201,
    trustLevel: 'Gold',
    trend: 'steady',
  },
  {
    id: '3',
    rank: 3,
    user: 'Sarah Chen',
    handle: '@s-chen',
    domain: 'AI Governance',
    region: 'North America',
    ekohScore: 93.4,
    votesWeighted: 13680,
    trustLevel: 'Gold',
    trend: 'up',
  },
  {
    id: '4',
    rank: 4,
    user: 'Rahul Verma',
    handle: '@rahul-v',
    domain: 'Economic Justice',
    region: 'Asia',
    ekohScore: 91.8,
    votesWeighted: 12940,
    trustLevel: 'Silver',
    trend: 'up',
  },
  {
    id: '5',
    rank: 5,
    user: 'Elena Petrova',
    handle: '@elena-p',
    domain: 'Education',
    region: 'Europe',
    ekohScore: 90.5,
    votesWeighted: 11832,
    trustLevel: 'Silver',
    trend: 'steady',
  },
  {
    id: '6',
    rank: 6,
    user: 'David Kim',
    handle: '@d-kim',
    domain: 'Urban Planning',
    region: 'North America',
    ekohScore: 88.9,
    votesWeighted: 11200,
    trustLevel: 'Silver',
    trend: 'down',
  },
  {
    id: '7',
    rank: 7,
    user: 'Maria Silva',
    handle: '@maria-s',
    domain: 'Public Health',
    region: 'Latin America',
    ekohScore: 87.2,
    votesWeighted: 10321,
    trustLevel: 'Bronze',
    trend: 'up',
  },
  {
    id: '8',
    rank: 8,
    user: 'Omar Hassan',
    handle: '@omar-h',
    domain: 'Climate Policy',
    region: 'Middle East & Africa',
    ekohScore: 85.7,
    votesWeighted: 9876,
    trustLevel: 'Bronze',
    trend: 'steady',
  },
];

const MOCK_DOMAIN_HIGHLIGHTS: DomainHighlight[] = [
  {
    domain: 'Public Health',
    topUser: 'Dr. Amina K.',
    topScore: 97.3,
    change: '+2 places this week',
  },
  {
    domain: 'Climate Policy',
    topUser: 'Luis Fernandez',
    topScore: 95.1,
    change: 'Stable at #1 for 3 weeks',
  },
  {
    domain: 'AI Governance',
    topUser: 'Sarah Chen',
    topScore: 93.4,
    change: '+4.7 Ekoh score (90 days)',
  },
  {
    domain: 'Economic Justice',
    topUser: 'Rahul Verma',
    topScore: 91.8,
    change: 'New entrant in top 10',
  },
];

function trustLevelTag(level: TrustLevel) {
  const color =
    level === 'Gold' ? 'gold' : level === 'Silver' ? 'geekblue' : 'green';

  return (
    <Tag color={color} bordered={false}>
      {level} <TranslatedText id="ui.konsensus.leaderboards.leaderboardsclient.tier" />
    </Tag>
  );
}

function trendBadge(trend: LeaderboardRow['trend']) {
  if (trend === 'up') {
    return <Tag color="success"><TranslatedText id="ui.konsensus.leaderboards.leaderboardsclient.rising" /></Tag>;
  }
  if (trend === 'down') {
    return <Tag color="error"><TranslatedText id="ui.konsensus.leaderboards.leaderboardsclient.dropping" /></Tag>;
  }
  return <Tag><TranslatedText id="ui.konsensus.leaderboards.leaderboardsclient.stable" /></Tag>;
}

/**
 * Defensive initials helper – avoids indexing possibly undefined elements.
 */
function getInitials(name: string) {
  const parts = name.split(' ').filter(Boolean);
  if (!parts.length) return '?';

  if (parts.length === 1) {
    const first = parts[0];
    const initial = first?.charAt(0);
    return initial && initial.trim() ? initial : '?';
  }

  const first = parts[0];
  const last = parts[parts.length - 1];

  const firstInitial = first?.charAt(0) ?? '';
  const lastInitial = last?.charAt(0) ?? '';

  const combined = `${firstInitial}${lastInitial}`.trim();

  return combined || '?';
}

export default function LeaderboardsClient(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [domainFilter, setDomainFilter] = useState<string>('all');
  const [regionFilter, setRegionFilter] = useState<string>('global');

  const filteredRows = useMemo(() => {
    return MOCK_LEADERBOARD.filter((row) => {
      if (domainFilter !== 'all' && row.domain !== domainFilter) return false;
      if (regionFilter !== 'global' && row.region !== regionFilter) return false;
      return true;
    });
  }, [domainFilter, regionFilter]);

  const totalContributors = 1342;
  const trackedDomains = 28;
  const lastRefresh = '2 min ago';

  const columns: ProColumns<LeaderboardRow>[] = [
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.rank"),
      dataIndex: 'rank',
      width: 70,
      align: 'center',
      render: (_, row) => (
        <Space>
          {row.rank <= 3 ? (
            <CrownOutlined
              style={{
                fontSize: 16,
                color: row.rank === 1 ? '#faad14' : '#d9d9d9',
              }}
            />
          ) : null}
          <span>{row.rank}</span>
        </Space>
      ),
    },
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.contributor"),
      dataIndex: 'user',
      render: (_, row) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{ backgroundColor: '#1677ff' }}
          >
            {getInitials(row.user)}
          </Avatar>
          <div>
            <div>{row.user}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {row.handle}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.domain"),
      dataIndex: 'domain',
      responsive: ['md'],
      render: (value) => <Tag>{value}</Tag>,
    },
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.region"),
      dataIndex: 'region',
      responsive: ['lg'],
      render: (value) => (
        <Space size={4}>
          <GlobalOutlined />
          <span>{value}</span>
        </Space>
      ),
    },
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.ekohScore"),
      dataIndex: 'ekohScore',
      sorter: (a, b) => a.ekohScore - b.ekohScore,
      defaultSortOrder: 'descend',
      align: 'right',
      render: (_, row) => <Text strong>{row.ekohScore.toFixed(1)}</Text>,
    },
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.weightedVotes"),
      dataIndex: 'votesWeighted',
      sorter: (a, b) => a.votesWeighted - b.votesWeighted,
      align: 'right',
      render: (_, row) => row.votesWeighted.toLocaleString('en-US'),
    },
    {
      title: i18nT("ui.konsensus.leaderboards.leaderboardsclient.trust"),
      dataIndex: 'trustLevel',
      render: (_, row) => (
        <Space size={4}>
          {trustLevelTag(row.trustLevel)}
          {trendBadge(row.trend)}
        </Space>
      ),
    },
  ];

  const regions = Array.from(new Set(MOCK_LEADERBOARD.map((row) => row.region)));

  const domains = Array.from(new Set(MOCK_LEADERBOARD.map((row) => row.domain)));

  return (
    <Content
      style={{
        margin: '20px 16px 15px 16px',
        background: 'var(--ant-color-bg-container)',
        borderRadius: 8,
      }}
    >
      <PageContainer
        header={{
          title: (
            <Space>
              <TrophyOutlined />
              <span>{i18nT("ui.konsensus.leaderboards.leaderboardsclient.konsensusLeaderboards")}</span>
            </Space>
          ),
          subTitle:
            i18nT("ui.konsensus.leaderboards.leaderboardsclient.krowdHighlightsTopEkohContributorsByDomain"),
          ghost: false,
          extra: [
            <Segmented<Timeframe>
              key="timeframe"
              size="middle"
              options={[
                { label: i18nT("ui.konsensus.leaderboards.leaderboardsclient.text7Days"), value: '7d' },
                { label: i18nT("ui.konsensus.leaderboards.leaderboardsclient.text30Days"), value: '30d' },
                { label: i18nT("ui.konsensus.leaderboards.leaderboardsclient.text90Days"), value: '90d' },
              ]}
              value={timeframe}
              onChange={(value) => setTimeframe(value as Timeframe)}
            />,
          ],
        }}
      >
        {/* KPI strip */}
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Card size="small">
              <Statistic
                title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.activeContributorsInThisPeriod")}
                value={totalContributors}
                prefix={<TeamOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.konsensus.leaderboards.leaderboardsclient.basedOnEkohWeightedActivityAcrossModules")}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small">
              <Statistic
                title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.domainsTracked")}
                value={trackedDomains}
                prefix={<FireOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.konsensus.leaderboards.leaderboardsclient.scienceEthicsGovernanceEnvironmentAndMore")}
              </Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small">
              <Statistic
                title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.lastRefresh")}
                value={lastRefresh}
                prefix={<GlobalOutlined />}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.konsensus.leaderboards.leaderboardsclient.mockDataWireUpToKonsensusApi")}
              </Text>
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Filters + main leaderboard */}
        <ProCard gutter={16} wrap>
          <ProCard
            colSpan={{ xs: 24, xl: 16 }}
            title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.globalLeaderboard")}
            extra={
              <Space size="middle" wrap>
                <Space size={4}>
                  <Text type="secondary">{i18nT("ui.konsensus.leaderboards.leaderboardsclient.domain")}</Text>
                  <Select
                    size="small"
                    style={{ minWidth: 180 }}
                    value={domainFilter}
                    onChange={setDomainFilter}
                  >
                    <Option value="all">{i18nT("ui.konsensus.leaderboards.leaderboardsclient.allDomains")}</Option>
                    {domains.map((domain) => (
                      <Option key={domain} value={domain}>
                        {domain}
                      </Option>
                    ))}
                  </Select>
                </Space>
                <Space size={4}>
                  <Text type="secondary">{i18nT("ui.konsensus.leaderboards.leaderboardsclient.region")}</Text>
                  <Select
                    size="small"
                    style={{ minWidth: 220 }}
                    value={regionFilter}
                    onChange={setRegionFilter}
                  >
                    <Option value="global">{i18nT("ui.konsensus.leaderboards.leaderboardsclient.global")}</Option>
                    {regions.map((region) => (
                      <Option key={region} value={region}>
                        {region}
                      </Option>
                    ))}
                  </Select>
                </Space>
              </Space>
            }
          >
            <ProTable<LeaderboardRow>
              rowKey="id"
              columns={columns}
              dataSource={filteredRows}
              search={false}
              pagination={{
                pageSize: 8,
                showSizeChanger: false,
              }}
              size="small"
              toolBarRender={false}
            />
          </ProCard>

          {/* Side panel – domain highlights */}
          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <CrownOutlined />
                <span>{i18nT("ui.konsensus.leaderboards.leaderboardsclient.domainHighlights")}</span>
              </Space>
            }
            extra={
              <Tooltip title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.snapshotOfTopEkohLeadersByDomain")}>
                <Badge status="processing" text={i18nT("ui.konsensus.leaderboards.leaderboardsclient.livePreview")} />
              </Tooltip>
            }
          >
            <List
              itemLayout="vertical"
              dataSource={MOCK_DOMAIN_HIGHLIGHTS}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Tag bordered={false}>{item.domain}</Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text strong>{item.topUser}</Text>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {i18nT("ui.konsensus.leaderboards.leaderboardsclient.ekohScore")} {item.topScore.toFixed(1)} · {item.change}
                        </Text>
                      </Space>
                    }
                    avatar={
                      <Avatar
                        style={{ backgroundColor: '#722ed1' }}
                        icon={<TrophyOutlined />}
                      />
                    }
                  />
                </List.Item>
              )}
            />
          </ProCard>
        </ProCard>

        {/* Explanation / how this works */}
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} md={16}>
            <Card title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.howKonsensusLeaderboardsWork")} size="small">
              <Paragraph>
                {i18nT("ui.konsensus.leaderboards.leaderboardsclient.leaderboardsAreDrivenByEkohWeightedContributions")}
              </Paragraph>
              <ul className="list-disc pl-5">
                <li>
                  {i18nT("ui.konsensus.leaderboards.leaderboardsclient.highQualityEthicallyAlignedContributionsAreRewarded")}
                </li>
                <li>
                  {i18nT("ui.konsensus.leaderboards.leaderboardsclient.domainTagsEGPublicHealthAi")}
                </li>
                <li>
                  {i18nT("ui.konsensus.leaderboards.leaderboardsclient.regionalFiltersLetYouSurfaceLocalLeaders")}
                </li>
              </ul>
              <Paragraph style={{ marginTop: 12 }}>
                {i18nT("ui.konsensus.leaderboards.leaderboardsclient.thisPageCurrentlyUsesMockDataWhen")}
              </Paragraph>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card title={i18nT("ui.konsensus.leaderboards.leaderboardsclient.nextSteps")} size="small">
              <ul className="list-disc pl-5">
                <li>{i18nT("ui.konsensus.leaderboards.leaderboardsclient.connectToKonsensusLeaderboardEndpoint")}</li>
                <li>
                  {i18nT("ui.konsensus.leaderboards.leaderboardsclient.addMyPositionIndicatorForTheLogged")}
                </li>
                <li>
                  {i18nT("ui.konsensus.leaderboards.leaderboardsclient.supportExportAsCsvImageForReporting")}
                </li>
              </ul>
            </Card>
          </Col>
        </Row>
      </PageContainer>
    </Content>
  );
}
