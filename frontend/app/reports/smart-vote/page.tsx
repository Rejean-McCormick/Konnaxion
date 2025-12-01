// FILE: frontend/app/reports/smart-vote/page.tsx
'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Row,
  Segmented,
  Space,
  Table,
  Typography,
  Skeleton,
  Button,
  Empty
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import dayjs, { Dayjs } from 'dayjs';
import { ReloadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

// ---------------------------------------------------------------------------
// Types & API Interfaces
// ---------------------------------------------------------------------------

type RangeKey = '7d' | '30d' | '90d';

// Backend Response Shape
interface ApiSmartVotePoint {
    label: string;
    participation: number;
    consensus: number;
    polarization: number;
}

interface ApiSmartVoteSummary {
    activeVotes: number;
    avgParticipationPct: number;
    avgConsensusTimeDays: number;
    totalVotesCast: number;
}

interface ApiSmartVoteResponse {
    generatedAt: string;
    summary: ApiSmartVoteSummary;
    points: ApiSmartVotePoint[];
}

// Frontend Table Row (Simulated for now)
type DomainRow = {
  key: string;
  domain: string;
  questions: number;
  participation: number;
  consensus: number;
};

// ---------------------------------------------------------------------------
// Mock Data (For parts not yet in API)
// ---------------------------------------------------------------------------

const MOCK_DOMAIN_ROWS: DomainRow[] = [
  {
    key: 'economy',
    domain: 'Economy',
    questions: 12,
    participation: 68,
    consensus: 62,
  },
  {
    key: 'climate',
    domain: 'Climate & environment',
    questions: 9,
    participation: 72,
    consensus: 58,
  },
  {
    key: 'health',
    domain: 'Health & wellbeing',
    questions: 7,
    participation: 64,
    consensus: 66,
  },
  {
    key: 'education',
    domain: 'Education',
    questions: 6,
    participation: 59,
    consensus: 61,
  },
];

const computePresetRange = (rangeKey: RangeKey): [Dayjs, Dayjs] => {
  const end = dayjs();
  const days = rangeKey === '7d' ? 7 : rangeKey === '30d' ? 30 : 90;
  const start = end.subtract(days - 1, 'day');
  return [start, end];
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function SmartVoteReportPage(): JSX.Element {
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [[start, end], setRange] = useState<[Dayjs, Dayjs]>(
    () => computePresetRange('30d'),
  );
  
  // Data State
  const [data, setData] = useState<ApiSmartVoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Fetch Data
  const fetchData = async (key: RangeKey) => {
    setLoading(true);
    setError(false);
    try {
        const res = await fetch(`/api/reports/smart-vote/?range=${key}`);
        if (!res.ok) throw new Error("Failed to fetch smart vote report");
        const result: ApiSmartVoteResponse = await res.json();
        setData(result);
    } catch (err) {
        console.error(err);
        setError(true);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(rangeKey);
  }, [rangeKey]);

  const handleRangePresetChange = (value: RangeKey | string) => {
    const key = (value as RangeKey) ?? '30d';
    setRangeKey(key);
    setRange(computePresetRange(key));
  };

  const domainColumns: ColumnsType<DomainRow> = [
    { title: 'Domain', dataIndex: 'domain', key: 'domain', width: '32%' },
    { title: 'Questions in range', dataIndex: 'questions', key: 'questions', width: '20%' },
    { title: 'Avg participation', dataIndex: 'participation', key: 'participation', width: '24%', render: (v) => `${v}%` },
    { title: 'Weighted consensus', dataIndex: 'consensus', key: 'consensus', width: '24%', render: (v) => `${v}%` },
  ];

  // IDs for accessibility
  const headingId = 'smart-vote-trend-heading';
  const domainHeadingId = 'smart-vote-domain-heading';

  // Loading State
  if (loading && !data) {
    return (
        <PageContainer header={{ title: 'Smart Vote Analytics', ghost: true }}>
            <Skeleton active paragraph={{ rows: 8 }} />
        </PageContainer>
    );
  }

  // Error State
  if (error || !data) {
    return (
        <PageContainer header={{ title: 'Smart Vote Analytics', ghost: true }}>
            <Empty description="Failed to load analytics">
                <Button icon={<ReloadOutlined />} onClick={() => fetchData(rangeKey)}>Retry</Button>
            </Empty>
        </PageContainer>
    );
  }

  const { summary, points } = data;

  return (
    <PageContainer
      header={{
        title: 'Smart Vote – usage & influence',
        ghost: true,
        breadcrumb: {
          routes: [
            { path: '/', breadcrumbName: 'Home' },
            { path: '/reports', breadcrumbName: 'Reports' },
            { path: '/reports/smart-vote', breadcrumbName: 'Smart Vote' },
          ],
        },
      }}
    >
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        {/* Filters and controls */}
        <ProCard ghost>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12} lg={12}>
              <Space direction="vertical" size={4}>
                <Text strong>Time range</Text>
                <Segmented
                  value={rangeKey}
                  options={[
                    { label: 'Last 7 days', value: '7d' },
                    { label: 'Last 30 days', value: '30d' },
                    { label: 'Last 90 days', value: '90d' },
                  ]}
                  onChange={(val) =>
                    handleRangePresetChange(val as RangeKey)
                  }
                />
              </Space>
            </Col>

            <Col xs={24} md={12} lg={12} style={{ textAlign: 'right' }}>
               <Space>
                 <Text type="secondary">Custom dates disabled (API limitation)</Text>
                 <RangePicker value={[start, end]} disabled />
               </Space>
            </Col>
          </Row>
        </ProCard>

        {/* Big-number summary cards */}
        <ProCard gutter={16} wrap>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Active Votes',
              value: summary.activeVotes,
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Total Votes Cast',
              value: summary.totalVotesCast,
              groupSeparator: ',',
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Avg Participation',
              value: summary.avgParticipationPct,
              suffix: '%',
              precision: 1,
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Avg Time to Consensus',
              value: summary.avgConsensusTimeDays,
              suffix: 'days',
              precision: 1,
            }}
          />
        </ProCard>

        <Row gutter={16}>
          {/* Trend chart */}
          <Col xs={24} lg={16}>
            <Card>
              <Title
                id={headingId}
                level={4}
                style={{ marginBottom: 8 }}
              >
                Governance Health Trends
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                Tracking the quality of decision making over time. High consensus with low polarization is the ideal state.
              </Paragraph>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                        dataKey="label" 
                        tickFormatter={(val) => dayjs(val).format('MM-DD')} 
                    />
                    <YAxis />
                    <Tooltip labelFormatter={(val) => dayjs(val).format('MMM D, YYYY')} />
                    <Legend />
                    
                    <Line
                        type="monotone"
                        dataKey="consensus"
                        name="Consensus %"
                        stroke="#52c41a" // Green
                        strokeWidth={2}
                        dot={false}
                    />
                     <Line
                        type="monotone"
                        dataKey="polarization"
                        name="Polarization %"
                        stroke="#ff4d4f" // Red
                        strokeWidth={2}
                        dot={false}
                    />
                    <Line
                        type="monotone"
                        dataKey="participation"
                        name="Participation"
                        stroke="#1890ff" // Blue
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          {/* Side explanation / notes */}
          <Col xs={24} lg={8}>
            <Card>
              <Title level={4} style={{ marginBottom: 12 }}>
                Metric Definitions
              </Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Paragraph>
                  <Text strong>Consensus %</Text> measures the alignment of weighted votes. 
                  A score of 100% means perfect agreement among all cohorts.
                </Paragraph>
                <Paragraph>
                  <Text strong>Polarization %</Text> tracks the divergence between 
                  opposing voting blocks. High polarization indicates a divided community.
                </Paragraph>
                <Paragraph>
                  <Text strong>Participation</Text> indicates the relative volume of 
                  votes cast compared to the active user base.
                </Paragraph>
                <Paragraph type="secondary">
                   Data is aggregated daily. Sudden spikes in polarization may trigger 
                   automatic moderation alerts.
                </Paragraph>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Domain breakdown table – paired with heading for accessibility */}
        <Card>
          <Title
            id={domainHeadingId}
            level={4}
            style={{ marginBottom: 8 }}
          >
            Domain breakdown (Ekoh-weighted Smart Vote)
          </Title>
          <Alert 
            message="Data Simulated" 
            type="info" 
            showIcon 
            style={{marginBottom: 16}}
            description="Per-domain breakdown is not yet supported by the v14 Reporting API. This table displays sample data structure." 
          />
          <Table<DomainRow>
            size="small"
            rowKey="key"
            columns={domainColumns}
            dataSource={MOCK_DOMAIN_ROWS}
            pagination={false}
            aria-labelledby={domainHeadingId}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}