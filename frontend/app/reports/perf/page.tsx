// FILE: frontend/app/reports/perf/page.tsx
'use client';

import React, { useState } from 'react';
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
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from 'recharts';
import { PageContainer } from '@ant-design/pro-components';

const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

type TimeRange = '24h' | '7d' | '30d';

type LatencyPoint = {
  bucket: string;
  p95: number;
  p99: number;
};

type ErrorPoint = {
  bucket: string;
  rate: number;
};

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
// Mock data (Optimized for Recharts)
// ---------------------------------------------------------------------------

const SUMMARY = {
  p95LatencyMs: 320,
  p99LatencyMs: 780,
  errorRatePct: 0.8,
  throughputRps: 420,
  apdex: 0.93,
  uptimePct: 99.85,
};

const LATENCY_SERIES: Record<TimeRange, LatencyPoint[]> = {
  '24h': [
    { bucket: '00:00', p95: 340, p99: 780 },
    { bucket: '06:00', p95: 310, p99: 720 },
    { bucket: '12:00', p95: 290, p99: 710 },
    { bucket: '18:00', p95: 330, p99: 790 },
    { bucket: '23:59', p95: 350, p99: 810 },
  ],
  '7d': [
    { bucket: 'Mon', p95: 360, p99: 840 },
    { bucket: 'Tue', p95: 340, p99: 800 },
    { bucket: 'Wed', p95: 320, p99: 780 },
    { bucket: 'Thu', p95: 310, p99: 770 },
    { bucket: 'Fri', p95: 300, p99: 760 },
    { bucket: 'Sat', p95: 330, p99: 810 },
    { bucket: 'Sun', p95: 320, p99: 790 },
  ],
  '30d': [
    { bucket: 'Week 1', p95: 380, p99: 880 },
    { bucket: 'Week 2', p95: 340, p99: 820 },
    { bucket: 'Week 3', p95: 320, p99: 780 },
    { bucket: 'Week 4', p95: 310, p99: 760 },
  ],
};

const ERROR_SERIES: Record<TimeRange, ErrorPoint[]> = {
  '24h': [
    { bucket: '00:00', rate: 0.7 },
    { bucket: '06:00', rate: 0.5 },
    { bucket: '12:00', rate: 0.9 },
    { bucket: '18:00', rate: 1.1 },
    { bucket: '23:59', rate: 0.8 },
  ],
  '7d': [
    { bucket: 'Mon', rate: 0.9 },
    { bucket: 'Tue', rate: 0.8 },
    { bucket: 'Wed', rate: 1.0 },
    { bucket: 'Thu', rate: 0.6 },
    { bucket: 'Fri', rate: 0.7 },
    { bucket: 'Sat', rate: 0.5 },
    { bucket: 'Sun', rate: 0.8 },
  ],
  '30d': [
    { bucket: 'Week 1', rate: 1.2 },
    { bucket: 'Week 2', rate: 1.0 },
    { bucket: 'Week 3', rate: 0.9 },
    { bucket: 'Week 4', rate: 0.7 },
  ],
};

const ENDPOINT_ROWS: EndpointRow[] = [
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
// Page
// ---------------------------------------------------------------------------

export default function ReportsPerfPage(): JSX.Element {
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

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

  return (
    <PageContainer
      ghost
      header={{
        title: 'API Performance',
        subTitle: 'High-level latency, error-rate and availability metrics across all Konnaxion services.',
        breadcrumb: {
          routes: [
            { path: '/reports', breadcrumbName: 'Reports' },
            { path: '', breadcrumbName: 'Performance' },
          ],
        },
      }}
      extra={[
        <Space key="controls" direction="vertical" size={8} style={{ alignItems: 'flex-end' }}>
          <Segmented<TimeRange>
            value={timeRange}
            onChange={(value) => setTimeRange(value as TimeRange)}
            options={[
              { label: 'Last 24h', value: '24h' },
              { label: 'Last 7 days', value: '7d' },
              { label: 'Last 30 days', value: '30d' },
            ]}
          />
          <Tooltip title="Hook this up to real backend filters later. For now the data is static.">
            <RangePicker disabled style={{ width: 260 }} />
          </Tooltip>
        </Space>
      ]}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        
        <Alert
          type="info"
          showIcon
          className="mb-4"
          style={{ marginBottom: 24 }}
          message="Sample data"
          description="This performance dashboard currently uses mocked metrics. Wire it to /reports/perf API once the backend is ready."
        />

        {/* KPI strip */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="p95 latency"
                value={SUMMARY.p95LatencyMs}
                suffix="ms"
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="p99 latency"
                value={SUMMARY.p99LatencyMs}
                suffix="ms"
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Error rate"
                value={SUMMARY.errorRatePct}
                precision={2}
                suffix="%"
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Throughput"
                value={SUMMARY.throughputRps}
                suffix="rps"
              />
            </Card>
          </Col>
        </Row>

        {/* Secondary KPIs */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Apdex"
                value={SUMMARY.apdex}
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={12} md={6}>
            <Card>
              <Statistic
                title="Uptime (30d)"
                value={SUMMARY.uptimePct}
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
                  <AreaChart data={LATENCY_SERIES[timeRange]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend verticalAlign="top" height={36}/>
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
                  <BarChart data={ERROR_SERIES[timeRange]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="bucket" />
                    <YAxis />
                    <RechartsTooltip />
                    <Bar dataKey="rate" fill="#ff4d4f" name="Error %" radius={[4, 4, 0, 0]} />
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
              <Table<EndpointRow>
                size="small"
                rowKey="key"
                columns={endpointColumns}
                dataSource={ENDPOINT_ROWS}
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
                      (400 / SUMMARY.p95LatencyMs) * 100,
                    )}
                    status={SUMMARY.p95LatencyMs <= 400 ? 'active' : 'exception'}
                    showInfo={false}
                  />
                  <Text type="secondary">
                    Current p95: {SUMMARY.p95LatencyMs} ms (target&nbsp;≤&nbsp;400 ms)
                  </Text>
                </div>

                <div>
                  <Text strong>Error SLO (rate &lt; 1.0%)</Text>
                  <Progress
                    percent={Math.min(
                      100,
                      (1 / Math.max(SUMMARY.errorRatePct, 0.01)) * 100,
                    )}
                    status={
                      SUMMARY.errorRatePct < 1 ? 'active' : 'exception'
                    }
                    showInfo={false}
                  />
                  <Text type="secondary">
                    Current error rate: {SUMMARY.errorRatePct.toFixed(2)}% (target&nbsp;&lt;&nbsp;1.0%)
                  </Text>
                </div>

                <div>
                  <Text strong>Availability SLO (≥ 99.9%)</Text>
                  <Progress
                    percent={SUMMARY.uptimePct}
                    status={
                      SUMMARY.uptimePct >= 99.9 ? 'active' : 'exception'
                    }
                    format={(percent) =>
                      percent !== undefined ? `${percent.toFixed(2)}%` : ''
                    }
                  />
                </div>

                <Alert
                  type="warning"
                  showIcon
                  message="Active watch"
                  description={
                    <>
                      <div>
                        <Text>
                          Ethikos decision API is approaching latency and error SLO
                          thresholds.
                        </Text>
                      </div>
                      <div>
                        <Text type="secondary">
                          Consider checking database load and recent deploys.
                        </Text>
                      </div>
                    </>
                  }
                />
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
}