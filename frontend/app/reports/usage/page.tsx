'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';

import api from '@/api';

import ReportsPageShell from '../ReportsPageShell';

const { Text, Title } = Typography;

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type TimeRangeKey = '7d' | '30d' | '90d';

type UsagePoint = {
  label: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
};

type ModuleUsageRow = {
  key: string;
  module: string;
  activeUsers: number;
  avgSessionMinutes: number;
  retentionRate: number;
  lastActive: string;
};

type UsageReport = {
  generatedAt: string;
  points: UsagePoint[];
  modules: ModuleUsageRow[];
};

type UsageAggregates = {
  totalUniqueUsers: number;
  activeToday: number;
  newInPeriod: number;
  modulesTouched: number;
};

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */

function getAggregates(report: UsageReport | undefined): UsageAggregates {
  if (!report || report.points.length === 0) {
    return {
      totalUniqueUsers: 0,
      activeToday: 0,
      newInPeriod: 0,
      modulesTouched: 0,
    };
  }

  const points = report.points;
  const modules = report.modules;
  const lastPoint = points[points.length - 1];

  const totalUniqueUsers = Math.max(...points.map((p) => p.activeUsers));
  const newInPeriod = points.reduce((sum, p) => sum + p.newUsers, 0);
  const modulesTouched = modules.filter((m) => m.activeUsers > 0).length;

  return {
    totalUniqueUsers,
    activeToday: lastPoint?.activeUsers ?? 0,
    newInPeriod,
    modulesTouched,
  };
}

type ModuleRow = ModuleUsageRow;

const moduleColumns = (i18nT: TranslateFunction): ColumnsType<ModuleRow> => ([
  {
    title: i18nT("ui.reports.usage.module"),
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
    title: i18nT("ui.reports.usage.activeUsers"),
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
    title: i18nT("ui.reports.usage.avgSession"),
    dataIndex: 'avgSessionMinutes',
    key: 'avgSessionMinutes',
    sorter: (a, b) => a.avgSessionMinutes - b.avgSessionMinutes,
    render: (value: number) => `${value.toFixed(1)} min`,
  },
  {
    title: i18nT("ui.reports.usage.text30DayRetention"),
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
          {value >= 80 ? i18nT("ui.reports.usage.strong") : value >= 70 ? i18nT("ui.reports.usage.healthy") : i18nT("ui.reports.usage.watch")}
        </Tag>
      </Space>
    ),
  },
  {
    title: i18nT("ui.reports.usage.lastActive"),
    dataIndex: 'lastActive',
    key: 'lastActive',
    render: (value: string) => (
      <Space size="small">
        <CalendarOutlined />
        <span>{value}</span>
      </Space>
    ),
  },
]);

/* ------------------------------------------------------------------ */
/* Main page                                                          */
/* ------------------------------------------------------------------ */

export default function ReportsUsagePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [range, setRange] = useState<TimeRangeKey>('30d');
  const [data, setData] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (nextRange: TimeRangeKey) => {
    setLoading(true);
    setError(null);

    try {
      const report = await api.get<UsageReport>(`reports/usage/?range=${nextRange}`);
      setData(report);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load usage analytics.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData(range);
  }, [fetchData, range]);

  const aggregates = useMemo(
    () => getAggregates(data ?? undefined),
    [data],
  );

  const lastUpdatedLabel = data
    ? new Date(data.generatedAt).toLocaleTimeString()
    : null;

  const shellDescription =
    i18nT("ui.reports.usage.trackAdoptionActiveUsageAndModuleLevel");

  const headerExtra = (
    <Space wrap>
      {lastUpdatedLabel && (
        <Tooltip title={i18nT("ui.reports.usage.lastGeneratedAt", { lastUpdatedLabel: lastUpdatedLabel })}>
          <Badge
            status="processing"
            text={<Text type="secondary">{i18nT("ui.reports.usage.updated")} {lastUpdatedLabel}</Text>}
          />
        </Tooltip>
      )}

      <Segmented<TimeRangeKey>
        value={range}
        onChange={(val) => setRange(val as TimeRangeKey)}
        options={[
          { label: i18nT("ui.reports.usage.text7Days"), value: '7d' },
          { label: i18nT("ui.reports.usage.text30Days"), value: '30d' },
          { label: i18nT("ui.reports.usage.text90Days"), value: '90d' },
        ]}
      />

      <Tooltip title={i18nT("ui.reports.usage.reloadUsageSnapshot")}>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void fetchData(range)}
          type="default"
          size="small"
        >
          {i18nT("ui.reports.usage.refresh")}
        </Button>
      </Tooltip>
    </Space>
  );

  if (loading && !data) {
    return (
      <ReportsPageShell
        title={i18nT("ui.reports.usage.usageAnalytics")}
        subtitle={shellDescription}
        secondaryActions={headerExtra}
      >
        <PageContainer ghost>
          <Skeleton active />
        </PageContainer>
      </ReportsPageShell>
    );
  }

  if (error && !data) {
    return (
      <ReportsPageShell
        title={i18nT("ui.reports.usage.usageAnalytics")}
        subtitle={shellDescription}
        secondaryActions={headerExtra}
      >
        <PageContainer ghost>
          <ProCard>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Space size="small">
                <InfoCircleOutlined />
                <Text type="danger">{i18nT("ui.reports.usage.unableToLoadUsageDataRightNow")}</Text>
              </Space>

              <Text type="secondary">{error}</Text>

              <Button
                icon={<ReloadOutlined />}
                onClick={() => void fetchData(range)}
                type="primary"
              >
                {i18nT("ui.reports.usage.retry")}
              </Button>
            </Space>
          </ProCard>
        </PageContainer>
      </ReportsPageShell>
    );
  }

  if (!data) {
    return (
      <ReportsPageShell
        title={i18nT("ui.reports.usage.usageAnalytics")}
        subtitle={shellDescription}
        secondaryActions={headerExtra}
      >
        <PageContainer ghost>
          <Empty description={i18nT("ui.reports.usage.noUsageDataAvailableYet")} />
        </PageContainer>
      </ReportsPageShell>
    );
  }

  const { totalUniqueUsers, activeToday, newInPeriod, modulesTouched } =
    aggregates;

  return (
    <ReportsPageShell
      title={i18nT("ui.reports.usage.usageAnalytics")}
      subtitle={shellDescription}
      secondaryActions={headerExtra}
    >
      <PageContainer ghost>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {!!error && (
            <ProCard ghost>
              <Text type="warning">
                {i18nT("ui.reports.usage.usingTheLastAvailablePayloadLatestRefresh")} {error}
              </Text>
            </ProCard>
          )}

          <ProCard ghost>
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Title level={5} style={{ marginBottom: 0 }}>
                {i18nT("ui.reports.usage.overview")}
              </Title>
              <Text type="secondary">
                {i18nT("ui.reports.usage.snapshotOfHowManyPeopleAreActively")}
              </Text>
            </Space>
          </ProCard>

          <ProCard ghost gutter={16} wrap>
            <StatisticCard
              statistic={{
                title: (
                  <Space size={4}>
                    <TeamOutlined />
                    <span>{i18nT("ui.reports.usage.totalUniqueUsers")}</span>
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
                    <span>{i18nT("ui.reports.usage.activeToday")}</span>
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
                    <span>{i18nT("ui.reports.usage.newInPeriod")}</span>
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
                    <span>{i18nT("ui.reports.usage.modulesTouched")}</span>
                  </Space>
                ),
                value: modulesTouched,
                suffix: '/ 5',
              }}
            />
          </ProCard>

          <ProCard gutter={16} wrap>
            <ProCard colSpan={{ xs: 24, lg: 16 }} title={i18nT("ui.reports.usage.activeVsNewUsers")}>
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

            <ProCard colSpan={{ xs: 24, lg: 8 }} title={i18nT("ui.reports.usage.highlights")}>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <Space align="start">
                  <Tag icon={<BarChartOutlined />} color="blue">
                    {i18nT("ui.reports.usage.concentration")}
                  </Tag>
                  <Text type="secondary">
                    {i18nT("ui.reports.usage.mostActivityIsConcentratedInTheLast")}
                  </Text>
                </Space>

                <Space align="start">
                  <Tag icon={<UserOutlined />} color="green">
                    {i18nT("ui.reports.usage.engagement")}
                  </Tag>
                  <Text type="secondary">
                    {i18nT("ui.reports.usage.combineActiveUsersWithRetentionPerModule")}
                  </Text>
                </Space>

                <Space align="start">
                  <Tag icon={<CalendarOutlined />} color="gold">
                    {i18nT("ui.reports.usage.seasonality")}
                  </Tag>
                  <Text type="secondary">
                    {i18nT("ui.reports.usage.expandTo90DaysToDetectWeekly")}
                  </Text>
                </Space>
              </Space>
            </ProCard>
          </ProCard>

          <Divider />

          <ProCard
            title={
              <Space>
                <ProjectOutlined />
                <span>{i18nT("ui.reports.usage.usageByModule")}</span>
              </Space>
            }
            extra={
              <Tooltip title={i18nT("ui.reports.usage.perModuleUsageIsAggregatedFromBackend")}>
                <InfoCircleOutlined />
              </Tooltip>
            }
          >
            <Table<ModuleRow>
              size="middle"
              rowKey="key"
              columns={moduleColumns(i18nT)}
              dataSource={data.modules}
              pagination={{ pageSize: 8 }}
            />
          </ProCard>
        </Space>
      </PageContainer>
    </ReportsPageShell>
  );
}