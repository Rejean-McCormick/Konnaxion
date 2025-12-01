// FILE: frontend/app/reports/smart-vote/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
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

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

type RangeKey = '7d' | '30d' | '90d';

type TrendPoint = {
  date: string;
  all: number;
  expert: number;
  public: number;
};

type DomainRow = {
  key: string;
  domain: string;
  questions: number;
  participation: number;
  consensus: number;
};

const computePresetRange = (rangeKey: RangeKey): [Dayjs, Dayjs] => {
  const end = dayjs();
  const days =
    rangeKey === '7d' ? 7 : rangeKey === '30d' ? 30 : 90;
  const start = end.subtract(days - 1, 'day');
  return [start, end];
};

/**
 * Simple mock generator so the chart looks realistic-ish
 * without touching the real reports-api yet.
 */
const buildMockTrendData = (rangeKey: RangeKey): TrendPoint[] => {
  const [start, end] = computePresetRange(rangeKey);
  const days = end.diff(start, 'day') + 1;

  // Ensure we don't generate too many points for long ranges if simulating API aggregation
  // For this mock, one point per day is fine up to 90 days.
  const baseLen = Math.max(7, Math.min(days, 90));
  const points: TrendPoint[] = [];

  for (let i = 0; i < baseLen; i += 1) {
    const date = start.add(i, 'day');
    // Create a bit of a wave pattern
    const phase = i / baseLen;

    const all = Math.round(200 + 80 * Math.sin(phase * Math.PI * 2));
    const expert = Math.round(70 + 30 * Math.sin(phase * Math.PI * 2 + 0.4));
    const pub = Math.max(0, all - expert);

    points.push({
      date: date.format('MM-DD'),
      all,
      expert,
      public: pub,
    });
  }

  return points;
};

const buildMockDomainRows = (rangeKey: RangeKey): DomainRow[] => {
  // Just vary the numbers slightly based on range so it feels dynamic
  const scale =
    rangeKey === '7d' ? 0.5 : rangeKey === '30d' ? 1 : 2;

  return [
    {
      key: 'economy',
      domain: 'Economy',
      questions: Math.round(12 * scale),
      participation: Math.round(68 + 4 * scale),
      consensus: Math.round(62 + 3 * scale),
    },
    {
      key: 'climate',
      domain: 'Climate & environment',
      questions: Math.round(9 * scale),
      participation: Math.round(72 + 2 * scale),
      consensus: Math.round(58 + 2 * scale),
    },
    {
      key: 'health',
      domain: 'Health & wellbeing',
      questions: Math.round(7 * scale),
      participation: Math.round(64 + 3 * scale),
      consensus: Math.round(66 + 2 * scale),
    },
    {
      key: 'education',
      domain: 'Education',
      questions: Math.round(6 * scale),
      participation: Math.round(59 + 2 * scale),
      consensus: Math.round(61 + 2 * scale),
    },
  ];
};

export default function SmartVoteReportPage(): JSX.Element {
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d');
  const [[start, end], setRange] = useState<[Dayjs, Dayjs]>(
    () => computePresetRange('30d'),
  );
  const [cohort, setCohort] = useState<'all' | 'expert' | 'public'>('all');

  const trendData = useMemo(
    () => buildMockTrendData(rangeKey),
    [rangeKey],
  );

  const domainRows = useMemo(
    () => buildMockDomainRows(rangeKey),
    [rangeKey],
  );

  const summary = useMemo(() => {
    const totalVotes = trendData.reduce((sum, p) => sum + p.all, 0);
    const days = trendData.length || 1;
    const avgPerDay = Math.round(totalVotes / days);

    const avgExpertShare =
      trendData.length === 0
        ? 0
        : Math.round(
            (trendData.reduce((sum, p) => sum + p.expert, 0) /
              totalVotes) *
              100,
          );

    const avgConsensus =
      domainRows.length === 0
        ? 0
        : Math.round(
            domainRows.reduce((sum, row) => sum + row.consensus, 0) /
              domainRows.length,
          );

    return {
      totalVotes,
      avgPerDay,
      avgExpertShare,
      avgConsensus,
      domains: domainRows.length,
    };
  }, [trendData, domainRows]);

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
      render: (value: number) => `${value}%`,
    },
    {
      title: 'Weighted consensus',
      dataIndex: 'consensus',
      key: 'consensus',
      width: '24%',
      render: (value: number) => `${value}%`,
    },
  ];

  const handleRangePresetChange = (value: RangeKey | string) => {
    const key = (value as RangeKey) ?? '30d';
    setRangeKey(key);
    setRange(computePresetRange(key));
  };

  const handleRangePickerChange = (
    values: null | [Dayjs, Dayjs],
  ) => {
    if (!values) return;
    setRange(values);
    // basic inference for the segmented control
    const days = values[1].diff(values[0], 'day') + 1;
    if (days <= 8) setRangeKey('7d');
    else if (days <= 35) setRangeKey('30d');
    else setRangeKey('90d');
  };

  // IDs for accessibility
  const headingId = 'smart-vote-trend-heading';
  const domainHeadingId = 'smart-vote-domain-heading';

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
            <Col xs={24} md={12} lg={8}>
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

            <Col xs={24} md={12} lg={8}>
              <Space direction="vertical" size={4}>
                <Text strong>Custom dates</Text>
                <RangePicker
                  allowClear={false}
                  value={[start, end]}
                  onChange={(vals) =>
                    handleRangePickerChange(
                      vals as [Dayjs, Dayjs] | null,
                    )
                  }
                />
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size={4}>
                <Text strong>Cohort view</Text>
                <Segmented
                  value={cohort}
                  options={[
                    { label: 'All voters', value: 'all' },
                    { label: 'Experts only', value: 'expert' },
                    { label: 'Public only', value: 'public' },
                  ]}
                  onChange={(val) =>
                    setCohort(val as 'all' | 'expert' | 'public')
                  }
                />
              </Space>
            </Col>
          </Row>
        </ProCard>

        {/* Big-number summary cards */}
        <ProCard gutter={16} wrap>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Votes in range',
              value: summary.totalVotes,
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Avg votes per day',
              value: summary.avgPerDay,
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Expert share of votes',
              value: summary.avgExpertShare,
              suffix: '%',
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Avg weighted consensus',
              value: summary.avgConsensus,
              suffix: '%',
              description: `${summary.domains} domains`,
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
                Smart Vote activity over time
              </Title>
              <Paragraph type="secondary" style={{ marginBottom: 24 }}>
                Daily aggregated votes for the selected time range and
                cohort. Use this chart to see spikes in participation
                around major consultations.
              </Paragraph>

              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {(cohort === 'all' || cohort === 'public') && (
                      <Line
                        type="monotone"
                        dataKey="public"
                        name="Public voters"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {(cohort === 'all' || cohort === 'expert') && (
                      <Line
                        type="monotone"
                        dataKey="expert"
                        name="Expert voters"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                    {cohort === 'all' && (
                      <Line
                        type="monotone"
                        dataKey="all"
                        name="All voters (total)"
                        dot={false}
                        strokeWidth={2}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <Alert
                style={{ marginTop: 24 }}
                type="info"
                showIcon
                message="Placeholder data"
                description={
                  <span>
                    This screen currently uses simulated Smart Vote
                    metrics. Once the reports-api is wired in, this
                    chart will be driven by{' '}
                    <code>/reports/smart-vote</code> with the selected
                    time range.
                  </span>
                }
              />
            </Card>
          </Col>

          {/* Side explanation / notes */}
          <Col xs={24} lg={8}>
            <Card>
              <Title level={4} style={{ marginBottom: 12 }}>
                How to read this dashboard
              </Title>
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Paragraph>
                  <Text strong>Votes in range</Text> counts all Smart
                  Vote stances recorded in the selected period. Use it
                  to gauge overall activity.
                </Paragraph>
                <Paragraph>
                  <Text strong>Expert share</Text> shows what portion of
                  votes come from users above the Ekoh expert
                  threshold in each relevant domain.
                </Paragraph>
                <Paragraph>
                  <Text strong>Weighted consensus</Text> aggregates
                  Ekoh-weighted stances into a percentage agreement
                  score per domain, then averages across domains.
                </Paragraph>
                <Paragraph type="secondary">
                  All definitions and thresholds follow the Konnaxion
                  v14 Smart Vote specification. Exact formulas live in
                  the reports-api and ETL layers.
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
          <Paragraph type="secondary" style={{ marginBottom: 16 }}>
            Aggregated participation and consensus per domain for the
            selected time range. This table mirrors the chart data for
            screen readers.
          </Paragraph>
          <Table<DomainRow>
            size="small"
            rowKey="key"
            columns={domainColumns}
            dataSource={domainRows}
            pagination={false}
            aria-labelledby={domainHeadingId}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}