'use client';

import React, { useEffect, useState } from 'react';
import { ProCard, StatisticCard } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Segmented,
  Skeleton,
  Space,
  Table,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ReloadOutlined } from '@ant-design/icons';
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

import ReportsPageShell from '../ReportsPageShell';

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

type RangeKey = '7d' | '30d' | '90d';

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

type DomainRow = {
  key: string;
  domain: string;
  questions: number;
  participation: number;
  consensus: number;
};

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

function computePresetRange(rangeKey: RangeKey): [Dayjs, Dayjs] {
  const end = dayjs();
  const days = rangeKey === '7d' ? 7 : rangeKey === '30d' ? 30 : 90;
  const start = end.subtract(days - 1, 'day');
  return [start, end];
}

export default function SmartVoteReportPage(): JSX.Element {
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [[start, end], setRange] = useState<[Dayjs, Dayjs]>(() =>
    computePresetRange('30d'),
  );

  const [data, setData] = useState<ApiSmartVoteResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async (key: RangeKey): Promise<void> => {
    setLoading(true);
    setError(false);

    try {
      const res = await fetch(`/api/reports/smart-vote/?range=${key}`);
      if (!res.ok) {
        throw new Error('Failed to fetch smart vote report');
      }

      const result = (await res.json()) as ApiSmartVoteResponse;
      setData(result);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData(rangeKey);
  }, [rangeKey]);

  const handleRangePresetChange = (value: RangeKey | string): void => {
    const key = (value as RangeKey) ?? '30d';
    setRangeKey(key);
    setRange(computePresetRange(key));
  };

  const domainColumns: ColumnsType<DomainRow> = [
    {
      title: 'Domain',
      dataIndex: 'domain',
      key: 'domain',
      width: '32%',
    },
    {
      title: 'Questions in range',
      dataIndex: 'questions',
      key: 'questions',
      width: '20%',
    },
    {
      title: 'Avg participation',
      dataIndex: 'participation',
      key: 'participation',
      width: '24%',
      render: (v: number) => `${v}%`,
    },
    {
      title: 'Weighted consensus',
      dataIndex: 'consensus',
      key: 'consensus',
      width: '24%',
      render: (v: number) => `${v}%`,
    },
  ];

  const headingId = 'smart-vote-trend-heading';
  const domainHeadingId = 'smart-vote-domain-heading';

  if (loading && !data) {
    return (
      <ReportsPageShell
        title="Smart Vote"
        subtitle="Voting trends, consensus patterns, and participation signals."
        metaTitle="Reports · Smart Vote"
      >
        <Skeleton active paragraph={{ rows: 10 }} />
      </ReportsPageShell>
    );
  }

  if (error || !data) {
    return (
      <ReportsPageShell
        title="Smart Vote"
        subtitle="Voting trends, consensus patterns, and participation signals."
        metaTitle="Reports · Smart Vote"
      >
        <Empty description="Failed to load analytics">
          <Button icon={<ReloadOutlined />} onClick={() => void fetchData(rangeKey)}>
            Retry
          </Button>
        </Empty>
      </ReportsPageShell>
    );
  }

  const { summary, points, generatedAt } = data;

  return (
    <ReportsPageShell
      title="Smart Vote"
      subtitle="Track participation, weighted consensus, and polarization over time."
      metaTitle="Reports · Smart Vote"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                  onChange={(val) => handleRangePresetChange(val as RangeKey)}
                />
              </Space>
            </Col>

            <Col xs={24} md={12} lg={12} style={{ textAlign: 'right' }}>
              <Space direction="vertical" size={4} style={{ alignItems: 'flex-end' }}>
                <Space>
                  <Text type="secondary">Custom dates disabled (API limitation)</Text>
                  <RangePicker value={[start, end]} disabled />
                </Space>
                <Text type="secondary">
                  Generated {dayjs(generatedAt).format('MMM D, YYYY · HH:mm')}
                </Text>
              </Space>
            </Col>
          </Row>
        </ProCard>

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
          <Col xs={24} lg={16}>
            <Card>
              <Title id={headingId} level={4} style={{ marginBottom: 8 }}>
                Governance Health Trends
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                Tracking the quality of decision making over time. High consensus
                with low polarization is the ideal state.
              </Paragraph>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={points}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="label"
                      tickFormatter={(val) => dayjs(val as string).format('MM-DD')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(val) =>
                        dayjs(val as string).format('MMM D, YYYY')
                      }
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="consensus"
                      name="Consensus"
                      stroke="#52c41a"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="polarization"
                      name="Polarization"
                      stroke="#fa541c"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="participation"
                      name="Participation"
                      stroke="#1890ff"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card>
              <Title level={4} style={{ marginBottom: 12 }}>
                Metric Definitions
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Paragraph>
                  <Text strong>Consensus %</Text> measures the alignment of weighted
                  votes. A score of 100% means perfect agreement among all cohorts.
                </Paragraph>
                <Paragraph>
                  <Text strong>Polarization %</Text> tracks the divergence between
                  opposing voting blocks. High polarization indicates a divided
                  community.
                </Paragraph>
                <Paragraph>
                  <Text strong>Participation</Text> indicates the relative volume of
                  votes cast compared to the active user base.
                </Paragraph>
                <Paragraph type="secondary">
                  Data is aggregated daily. Sudden spikes in polarization may
                  trigger automatic moderation alerts.
                </Paragraph>
              </Space>
            </Card>
          </Col>
        </Row>

        <Card>
          <Title id={domainHeadingId} level={4} style={{ marginBottom: 8 }}>
            Domain breakdown (Ekoh-weighted Smart Vote)
          </Title>
          <Alert
            message="Data Simulated"
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
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
    </ReportsPageShell>
  );
}