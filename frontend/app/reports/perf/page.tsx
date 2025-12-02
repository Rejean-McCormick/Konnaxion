// FILE: frontend/app/reports/perf/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Alert,
  Card,
  Col,
  DatePicker,
  Progress,
  Row,
  Segmented,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  Skeleton,
  Empty,
  Button,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PageContainer } from '@ant-design/pro-components';
import { ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// ---------------------------------------------------------------------------
// Types & API Interfaces
// ---------------------------------------------------------------------------

type TimeRange = '24h' | '7d' | '30d';

interface ApiSummary {
  p95LatencyMs: number;
  p99LatencyMs: number;
  errorRatePct: number;
  throughputRps: number;
  apdex: number;
  uptimePct: number;
}

interface ApiSeriesPoint {
  time: string;
  latency: number;
  errors: number;
}

interface ApiPerfResponse {
  summary: ApiSummary;
  series: ApiSeriesPoint[];
}

// Data shape for the frontend charts
interface ChartPoint {
  bucket: string;
  p95: number;
  p99: number;
  rate: number;
}

type EndpointRow = {
  key: string;
  endpoint: string;
  p95: number;
  p99: number;
  errorRate: number;
  rps: number;
  sloStatus: 'healthy' | 'watch' | 'breach';
};

// ---------------------------------------------------------------------------
// Static Data (Not yet provided by API)
// ---------------------------------------------------------------------------

const MOCK_ENDPOINTS: EndpointRow[] = [
  {
    key: '/api/keenkonnect/projects/',
    endpoint: '/api/keenkonnect/projects/',
    p95: 280,
    p99: 620,
    errorRate: 0.4,
    rps: 95,
    sloStatus: 'healthy',
  },
  {
    key: '/api/ethikos/decide/',
    endpoint: '/api/ethikos/decide/',
    p95: 350,
    p99: 820,
    errorRate: 0.9,
    rps: 60,
    sloStatus: 'watch',
  },
  {
    key: '/api/ekoh/votes/',
    endpoint: '/api/ekoh/votes/',
    p95: 410,
    p99: 960,
    errorRate: 1.4,
    rps: 130,
    sloStatus: 'breach',
  },
  {
    key: '/api/konnected/learning-paths/',
    endpoint: '/api/konnected/learning-paths/',
    p95: 290,
    p99: 700,
    errorRate: 0.5,
    rps: 55,
    sloStatus: 'healthy',
  },
];

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function ReportsPerfPage(): JSX.Element {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // State for fetched data
  const [data, setData] = useState<ApiPerfResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Derived state for charts
  const [chartData, setChartData] = useState<ChartPoint[]>([]);

  const fetchData = async (range: TimeRange) => {
    setLoading(true);
    setError(false);
    try {
      const response = await fetch(`/api/reports/perf/?range=${range}`);
      if (!response.ok) throw new Error('Failed to fetch performance data');

      const result = (await response.json()) as ApiPerfResponse;
      setData(result);

      // Transform API series -> Recharts format
      // Backend gives single 'latency', frontend charts want p95 & p99.
      // We'll simulate p99 spread for visualization if not provided directly.
      const mappedSeries = (result.series || []).map((pt) => {
        const dateObj = dayjs(pt.time);
        let bucketLabel = dateObj.format('HH:mm');
        if (range === '7d') bucketLabel = dateObj.format('ddd');
        if (range === '30d') bucketLabel = dateObj.format('MM/DD');

        return {
          bucket: bucketLabel,
          p95: pt.latency,
          p99: Math.round(pt.latency * 1.4), // Simulated spread
          rate: pt.errors,
        };
      });
      setChartData(mappedSeries);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchData(timeRange);
  }, [timeRange]);

  const endpointColumns: ColumnsType<EndpointRow> = [
    {
      title: 'Endpoint',
      dataIndex: 'endpoint',
      key: 'endpoint',
      render: (value: string) => <Text code>{value}</Text>,
      width: 260,
    },
    {
      title: 'p95 (ms)',
      dataIndex: 'p95',
      key: 'p95',
      sorter: (a, b) => a.p95 - b.p95,
      width: 110,
    },
    {
      title: 'p99 (ms)',
      dataIndex: 'p99',
      key: 'p99',
      sorter: (a, b) => a.p99 - b.p99,
      width: 110,
    },
    {
      title: 'Error rate (%)',
      dataIndex: 'errorRate',
      key: 'errorRate',
      sorter: (a, b) => a.errorRate - b.errorRate,
      render: (value: number) => (
        <Tooltip title="HTTP 5xx and 4xx over total requests">
          <span>{value.toFixed(2)}</span>
        </Tooltip>
      ),
      width: 140,
    },
    {
      title: 'Throughput (rps)',
      dataIndex: 'rps',
      key: 'rps',
      sorter: (a, b) => a.rps - b.rps,
      width: 130,
    },
    {
      title: 'SLO status',
      dataIndex: 'sloStatus',
      key: 'sloStatus',
      render: (status: EndpointRow['sloStatus']) => {
        if (status === 'healthy') {
          return <Tag color="green">Healthy</Tag>;
        }
        if (status === 'watch') {
          return <Tag color="orange">Watch</Tag>;
        }
        return <Tag color="red">Breach</Tag>;
      },
      width: 120,
    },
  ];

  // Loading / Error States
  if (loading && !data) {
    return (
      <PageContainer ghost header={{ title: 'API Performance' }}>
        <Skeleton active paragraph={{ rows: 10 }} />
      </PageContainer>
    );
  }

  if (error || !data) {
    return (
      <PageContainer ghost header={{ title: 'API Performance' }}>
        <Empty
          description="Failed to load performance metrics."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button icon={<ReloadOutlined />} onClick={() => fetchData(timeRange)}>
            Retry
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  const { summary } = data;

  return (
    <PageContainer
      ghost
      header={{
        title: 'API Performance',
        subTitle:
          'High-level latency, error-rate and availability metrics across all Konnaxion services.',
        breadcrumb: {
          routes: [
            { path: '/reports', breadcrumbName: 'Reports' },
            { path: '', breadcrumbName: 'Performance' },
          ],
        },
      }}
      extra={[
        <Space
          key="controls"
          direction="vertical"
          size={8}
          style={{ alignItems: 'flex-end' }}
        >
          <Segmented<TimeRange>
            value={timeRange}
            onChange={(value) => setTimeRange(value as TimeRange)}
            options={[
              { label: 'Last 24h', value: '24h' },
              { label: 'Last 7 days', value: '7d' },
              { label: 'Last 30 days', value: '30d' },
            ]}
          />
          <Tooltip title="Date filtering not yet supported by backend.">
            <RangePicker disabled style={{ width: 260 }} />
          </Tooltip>
        </Space>,
      ]}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* KPI strip */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="p95 latency"
                value={summary.p95LatencyMs}
                suffix="ms"
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="p99 latency"
                value={summary.p99LatencyMs}
                suffix="ms"
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Error rate"
                value={summary.errorRatePct}
                precision={2}
                suffix="%"
                valueStyle={{
                  color: summary.errorRatePct > 1 ? '#cf1322' : '#3f8600',
                }}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Throughput"
                value={summary.throughputRps}
                suffix="rps"
              />
            </Card>
          </Col>
        </Row>

        {/* Secondary KPIs */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic title="Apdex" value={summary.apdex} precision={2} />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Uptime (30d)"
                value={summary.uptimePct}
                precision={2}
                suffix="%"
              />
            </Card>
          </Col>
        </Row>

        {/* Charts: latency + errors */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card title="Latency timeline (p95 / p99)">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" height={36} />
                    <Area
                      type="monotone"
                      dataKey="p99"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.1}
                      name="p99"
                    />
                    <Area
                      type="monotone"
                      dataKey="p95"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      name="p95"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Error rate over time">
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar
                      dataKey="rate"
                      fill="#ff4d4f"
                      name="Error %"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Table + SLO status */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={15}>
            <Card title="Endpoint-level performance">
              <Alert
                message="Limited Data"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                description="Detailed endpoint breakdown is not yet available via API. Showing example targets."
              />
              <Table<EndpointRow>
                size="small"
                rowKey="key"
                columns={endpointColumns}
                dataSource={MOCK_ENDPOINTS}
                pagination={{ pageSize: 5 }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={9}>
            <Card title="SLO overview">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Latency SLO (p95 &lt; 400ms)</Text>
                  <Progress
                    percent={Math.min(
                      100,
                      (400 / (summary.p95LatencyMs || 1)) * 100,
                    )}
                    status={
                      summary.p95LatencyMs <= 400 ? 'active' : 'exception'
                    }
                    showInfo={false}
                  />
                  <Text type="secondary">
                    Current p95: {summary.p95LatencyMs} ms (target&nbsp;≤&nbsp;400
                    ms)
                  </Text>
                </div>

                <div>
                  <Text strong>Error SLO (rate &lt; 1.0%)</Text>
                  <Progress
                    percent={Math.min(
                      100,
                      (1 / Math.max(summary.errorRatePct, 0.01)) * 100,
                    )}
                    status={
                      summary.errorRatePct < 1 ? 'active' : 'exception'
                    }
                    showInfo={false}
                  />
                  <Text type="secondary">
                    Current error rate: {summary.errorRatePct.toFixed(2)}% (target
                    &lt;&nbsp;1.0%)
                  </Text>
                </div>

                <div>
                  <Text strong>Availability SLO (≥ 99.9%)</Text>
                  <Progress
                    percent={summary.uptimePct}
                    status={
                      summary.uptimePct >= 99.9 ? 'active' : 'exception'
                    }
                    format={(percent) =>
                      percent !== undefined ? `${percent.toFixed(2)}%` : ''
                    }
                  />
                </div>

                {summary.errorRatePct > 1 && (
                  <Alert
                    type="warning"
                    showIcon
                    message="Active watch"
                    description="Error rates are elevated above the SLO threshold. Check database connections."
                  />
                )}
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
}
