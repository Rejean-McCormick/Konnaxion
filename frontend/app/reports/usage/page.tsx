'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Divider,
  Empty,
  Progress,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BarChartOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  ProjectOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';

const { Text, Title } = Typography;

/* ------------------------------------------------------------------ */
/* Types                                                             */
/* ------------------------------------------------------------------ */

type TimeRangeKey = '7d' | '30d' | '90d';

type UsagePoint = {
  label: string; // e.g. "2025-11-01"
  activeUsers: number;
  newUsers: number;
  sessions: number;
};

type ModuleUsageRow = {
  key: string;
  module: string;
  activeUsers: number;
  avgSessionMinutes: number;
  retentionRate: number; // 0-100
  lastActive: string;
};

type UsageReport = {
  generatedAt: string;
  points: UsagePoint[];
  modules: ModuleUsageRow[];
};

/* ------------------------------------------------------------------ */
/* Mock data generator                                               */
/* ------------------------------------------------------------------ */

function generateMockPoints(days: number): UsagePoint[] {
  const today = new Date();
  const result: UsagePoint[] = [];

  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const base = 200 + (i % 10) * 15;
    const activeUsers = base + Math.round(Math.random() * 80);
    const newUsers = 20 + Math.round(Math.random() * 15);
    const sessions = activeUsers * (1.2 + Math.random() * 0.8);

    const label = d.toISOString().slice(0, 10); // YYYY-MM-DD

    result.push({
      label,
      activeUsers,
      newUsers,
      sessions: Math.round(sessions),
    });
  }

  return result;
}

function getDaysForRange(range: TimeRangeKey): number {
  switch (range) {
    case '7d':
      return 7;
    case '90d':
      return 90;
    case '30d':
    default:
      return 30;
  }
}

function buildMockReport(range: TimeRangeKey): UsageReport {
  const days = getDaysForRange(range);
  const points = generateMockPoints(days);

  const last = points[points.length - 1];

  const baseModules: ModuleUsageRow[] = [
    {
      key: 'ekoh',
      module: 'Ekoh · Collective reputation',
      activeUsers: Math.round(last.activeUsers * 0.65),
      avgSessionMinutes: 9.4,
      retentionRate: 82,
      lastActive: last.label,
    },
    {
      key: 'ethikos',
      module: 'Ethikos · Deliberation & ethics',
      activeUsers: Math.round(last.activeUsers * 0.54),
      avgSessionMinutes: 12.1,
      retentionRate: 76,
      lastActive: last.label,
    },
    {
      key: 'keenkonnect',
      module: 'KeenKonnect · Teams & projects',
      activeUsers: Math.round(last.activeUsers * 0.38),
      avgSessionMinutes: 14.7,
      retentionRate: 71,
      lastActive: last.label,
    },
    {
      key: 'konnected',
      module: 'Konnected · Learning & community',
      activeUsers: Math.round(last.activeUsers * 0.42),
      avgSessionMinutes: 16.3,
      retentionRate: 79,
      lastActive: last.label,
    },
    {
      key: 'kreative',
      module: 'Kreative · Ideas & showcases',
      activeUsers: Math.round(last.activeUsers * 0.29),
      avgSessionMinutes: 11.2,
      retentionRate: 68,
      lastActive: last.label,
    },
  ];

  // Slightly scale module numbers so they don’t exceed totals too much
  const scale = last.activeUsers / baseModules.reduce(
    (sum, m) => sum + m.activeUsers,
    0,
  );

  const modules = baseModules.map((m) => ({
    ...m,
    activeUsers: Math.round(m.activeUsers * scale * 1.1),
  }));

  const generatedAt = new Date().toISOString();

  return {
    generatedAt,
    points,
    modules,
  };
}

/* ------------------------------------------------------------------ */
/* Helpers for derived aggregates                                    */
/* ------------------------------------------------------------------ */

function getAggregates(report: UsageReport | undefined) {
  if (!report || !report.points.length) {
    return {
      totalUniqueUsers: 0,
      activeToday: 0,
      newInPeriod: 0,
      modulesTouched: 0,
    };
  }

  const { points, modules } = report;
  const last = points[points.length - 1];
  const uniqueUsers = Math.max(...points.map((p) => p.activeUsers));
  const newInPeriod = points.reduce((sum, p) => sum + p.newUsers, 0);

  return {
    totalUniqueUsers: uniqueUsers,
    activeToday: last.activeUsers,
    newInPeriod,
    modulesTouched: modules.filter((m) => m.activeUsers > 0).length,
  };
}

/* ------------------------------------------------------------------ */
/* Table columns                                                     */
/* ------------------------------------------------------------------ */

type ModuleRow = ModuleUsageRow;

const moduleColumns: ColumnsType<ModuleRow> = [
  {
    title: 'Module',
    dataIndex: 'module',
    key: 'module',
    render: (value: string) => (
      <Space size="small">
        <ProjectOutlined />
        <span>{value}</span>
      </Space>
    ),
  },
  {
    title: 'Active users',
    dataIndex: 'activeUsers',
    key: 'activeUsers',
    sorter: (a, b) => a.activeUsers - b.activeUsers,
    render: (value: number) => (
      <Space size="small">
        <UserOutlined />
        <span>{value.toLocaleString('en-US')}</span>
      </Space>
    ),
  },
  {
    title: 'Avg. session',
    dataIndex: 'avgSessionMinutes',
    key: 'avgSessionMinutes',
    sorter: (a, b) => a.avgSessionMinutes - b.avgSessionMinutes,
    render: (value: number) => `${value.toFixed(1)} min`,
  },
  {
    title: '30-day retention',
    dataIndex: 'retentionRate',
    key: 'retentionRate',
    sorter: (a, b) => a.retentionRate - b.retentionRate,
    render: (value: number) => (
      <Space size="small">
        <Progress
          type="circle"
          width={40}
          percent={value}
          size="small"
          format={(p) => `${p}%`}
        />
        <Tag color={value >= 80 ? 'green' : value >= 70 ? 'blue' : 'gold'}>
          {value >= 80
            ? 'Strong'
            : value >= 70
            ? 'Healthy'
            : 'Watch'}
        </Tag>
      </Space>
    ),
  },
  {
    title: 'Last active',
    dataIndex: 'lastActive',
    key: 'lastActive',
    render: (value: string) => (
      <Space size="small">
        <CalendarOutlined />
        <span>{value}</span>
      </Space>
    ),
  },
];

/* ------------------------------------------------------------------ */
/* Main page                                                         */
/* ------------------------------------------------------------------ */

export default function ReportsUsagePage() {
  const [range, setRange] = useState<TimeRangeKey>('30d');
  
  // Standard React state instead of ahooks for simplicity/compatibility
  const [data, setData] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = async (r: TimeRangeKey) => {
    setLoading(true);
    setError(false);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600)); 
      const report = buildMockReport(r);
      setData(report);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(range);
  }, [range]);

  const aggregates = useMemo(() => getAggregates(data || undefined), [data]);

  const lastUpdatedLabel = data
    ? new Date(data.generatedAt).toLocaleTimeString()
    : null;

  const headerExtra = (
    <Space wrap>
      {lastUpdatedLabel && (
        <Tooltip title={`Last generated at ${lastUpdatedLabel}`}>
          <Badge
            status="processing"
            text={
              <Text type="secondary">
                Updated {lastUpdatedLabel}
              </Text>
            }
          />
        </Tooltip>
      )}
      <Segmented<TimeRangeKey>
        value={range}
        onChange={(val) => setRange(val as TimeRangeKey)}
        options={[
          { label: '7 days', value: '7d' },
          { label: '30 days', value: '30d' },
          { label: '90 days', value: '90d' },
        ]}
      />
      <Tooltip title="Reload usage snapshot">
        <Button
          icon={<ReloadOutlined />}
          onClick={() => fetchData(range)}
          type="default"
          size="small"
        >
          Refresh
        </Button>
      </Tooltip>
    </Space>
  );

  if (loading && !data) {
    return (
      <PageContainer
        ghost
        header={{
          title: 'Usage Analytics',
          breadcrumb: {
            routes: [
              { path: '/reports', breadcrumbName: 'Reports' },
              { path: '', breadcrumbName: 'Usage' },
            ],
          },
        }}
        extra={headerExtra}
      >
        <Skeleton active />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer
        ghost
        header={{ title: 'Usage Analytics' }}
        extra={headerExtra}
      >
        <ProCard>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space size="small">
              <InfoCircleOutlined />
              <Text type="danger">
                Unable to load usage data right now.
              </Text>
            </Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => fetchData(range)}
              type="primary"
            >
              Retry
            </Button>
          </Space>
        </ProCard>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer
        ghost
        header={{ title: 'Usage Analytics' }}
        extra={headerExtra}
      >
        <Empty description="No usage data available yet" />
      </PageContainer>
    );
  }

  const { totalUniqueUsers, activeToday, newInPeriod, modulesTouched } =
    aggregates;

  return (
    <PageContainer
      ghost
      header={{
        title: 'Usage Analytics',
        breadcrumb: {
          routes: [
            { path: '/reports', breadcrumbName: 'Reports' },
            { path: '', breadcrumbName: 'Usage' },
          ],
        },
      }}
      extra={headerExtra}
    >
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        {/* Intro / context */}
        <ProCard ghost>
          <Space
            direction="vertical"
            size={4}
            style={{ width: '100%' }}
          >
            <Title level={4} style={{ marginBottom: 0 }}>
              Platform usage overview
            </Title>
            <Text type="secondary">
              Snapshot of how many people are actively using Konnaxion,
              which modules they touch, and how this evolves over time. Data
              is aggregated from sign-ins, page views and workspace events.
            </Text>
          </Space>
        </ProCard>

        {/* KPI strip */}
        <ProCard ghost gutter={16} wrap>
          <StatisticCard
            statistic={{
              title: (
                <Space size={4}>
                  <TeamOutlined />
                  <span>Total unique users</span>
                </Space>
              ),
              value: totalUniqueUsers,
              suffix: 'users',
            }}
          />
          <StatisticCard
            statistic={{
              title: (
                <Space size={4}>
                  <UserOutlined />
                  <span>Active today</span>
                </Space>
              ),
              value: activeToday,
              suffix: 'users',
            }}
          />
          <StatisticCard
            statistic={{
              title: (
                <Space size={4}>
                  <UserAddOutlined />
                  <span>New in period</span>
                </Space>
              ),
              value: newInPeriod,
              suffix: 'signups',
            }}
          />
          <StatisticCard
            statistic={{
              title: (
                <Space size={4}>
                  <ProjectOutlined />
                  <span>Modules touched</span>
                </Space>
              ),
              value: modulesTouched,
              suffix: '/ 5',
            }}
          />
        </ProCard>

        {/* Time series + quick notes */}
        <ProCard gutter={16} wrap>
          <ProCard colSpan={{ xs: 24, lg: 16 }} title="Active vs New Users">
            <div style={{ height: 300, width: '100%' }}>
              <ResponsiveContainer>
                <LineChart data={data.points}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <RechartsTooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="activeUsers" 
                    name="Active Users" 
                    stroke="#1890ff" 
                    strokeWidth={2} 
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="newUsers" 
                    name="New Signups" 
                    stroke="#52c41a" 
                    strokeWidth={2} 
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ProCard>

          <ProCard colSpan={{ xs: 24, lg: 8 }} title="Highlights">
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space align="start">
                <Tag icon={<BarChartOutlined />} color="blue">
                  Concentration
                </Tag>
                <Text type="secondary">
                  Most activity is concentrated in the last few days of the
                  selected range. Use shorter windows (7 days) to monitor
                  spikes after launches.
                </Text>
              </Space>
              <Space align="start">
                <Tag icon={<UserOutlined />} color="green">
                  Engagement
                </Tag>
                <Text type="secondary">
                  Combine active users with retention per module to identify
                  where people stay engaged vs. where they churn quickly.
                </Text>
              </Space>
              <Space align="start">
                <Tag icon={<CalendarOutlined />} color="gold">
                  Seasonality
                </Tag>
                <Text type="secondary">
                  Expand to 90 days to detect weekly patterns (e.g. higher
                  usage around events or recurring workshops).
                </Text>
              </Space>
            </Space>
          </ProCard>
        </ProCard>

        <Divider />

        {/* Usage by module */}
        <ProCard
          title={
            <Space>
              <ProjectOutlined />
              <span>Usage by module</span>
            </Space>
          }
          extra={
            <Tooltip title="Per-module usage is approximate in this mock implementation.">
              <InfoCircleOutlined />
            </Tooltip>
          }
        >
          <Table<ModuleRow>
            size="middle"
            rowKey="key"
            columns={moduleColumns}
            dataSource={data.modules}
            pagination={{ pageSize: 8 }}
          />
        </ProCard>
      </Space>
    </PageContainer>
  );
}