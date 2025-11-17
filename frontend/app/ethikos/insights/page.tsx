'use client';

import React, { useState } from 'react';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import { Line, Area, Heatmap, Pie, Radar, Bar } from '@ant-design/plots';
import {
  Badge,
  Button,
  DatePicker,
  Divider,
  Empty,
  Select,
  Skeleton,
  Space,
  Tabs,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SyncOutlined,
  ClockCircleOutlined,
  FilterOutlined,
  AreaChartOutlined,
  BarChartOutlined,
  PieChartOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs, { Dayjs } from 'dayjs';

import ChartCard from '@/components/charts/ChartCard';
import usePageTitle from '@/hooks/usePageTitle';
import {
  fetchPulseOverview,
  fetchPulseTrends,
  fetchPulseHealth,
  fetchPulseLiveData,
} from '@/services/pulse';
import { fetchImpactOutcomes } from '@/services/impact';
import {
  fetchDecisionResults,
  type DecisionResult,
  type DecisionScope,
} from '@/services/decide';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text } = Typography;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

type OpinionAnalyticsData = {
  overview: Awaited<ReturnType<typeof fetchPulseOverview>>;
  trends: Awaited<ReturnType<typeof fetchPulseTrends>>;
  health: Awaited<ReturnType<typeof fetchPulseHealth>>;
  live: Awaited<ReturnType<typeof fetchPulseLiveData>>;
  outcomes: Awaited<ReturnType<typeof fetchImpactOutcomes>>;
  decisions: Awaited<ReturnType<typeof fetchDecisionResults>>;
};

type DecisionRow = DecisionResult & { key: string };

/* ------------------------------------------------------------------ */
/*  Aggregate loader                                                   */
/* ------------------------------------------------------------------ */

async function fetchOpinionAnalytics(): Promise<OpinionAnalyticsData> {
  const [overview, trends, health, live, outcomes, decisions] =
    await Promise.all([
      fetchPulseOverview(),
      fetchPulseTrends(),
      fetchPulseHealth(),
      fetchPulseLiveData(),
      fetchImpactOutcomes(),
      fetchDecisionResults(),
    ]);

  return { overview, trends, health, live, outcomes, decisions };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EthikosOpinionAnalytics(): JSX.Element {
  usePageTitle('Ethikos · Opinion Analytics');

  const [timeRange, setTimeRange] = useState<RangeValue>(() => [
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [scopeFilter, setScopeFilter] = useState<'all' | DecisionScope>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');

  const { data, loading, error, refresh } =
    useRequest<OpinionAnalyticsData, []>(fetchOpinionAnalytics);

  const lastUpdated = data
    ? dayjs(
        data.overview?.refreshedAt ??
          data.health?.refreshedAt ??
          new Date().toISOString(),
      ).format('HH:mm:ss')
    : null;

  /* ---------- loading skeleton ---------- */
  if (loading && !data) {
    return (
      <PageContainer ghost>
        <Skeleton active />
      </PageContainer>
    );
  }

  /* ---------- error state ---------- */
  if (error) {
    return (
      <PageContainer ghost>
        <Empty
          description="Failed to load opinion analytics"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button icon={<SyncOutlined />} onClick={refresh} type="primary">
            Retry
          </Button>
        </Empty>
      </PageContainer>
    );
  }

  /* ---------- empty safeguard ---------- */
  if (!data) {
    return (
      <PageContainer ghost>
        <Empty description="No analytics data available yet" />
      </PageContainer>
    );
  }

  const { overview, trends, health, live, outcomes, decisions } = data;

  const allRegions = Array.from(
    new Set(
      decisions.items
        .map((d) => d.region)
        .filter((r): r is string => !!r),
    ),
  );

  const [start, end] = timeRange ?? [];

  const filteredDecisions: DecisionRow[] = decisions.items
    .filter((d) => {
      if (scopeFilter !== 'all' && d.scope !== scopeFilter) return false;
      if (regionFilter !== 'all' && (d.region ?? 'Unspecified') !== regionFilter)
        return false;
      if (start && end) {
        const closed = dayjs(d.closesAt);
        if (!closed.isBetween(start, end, 'day', '[]')) return false;
      }
      return true;
    })
    .map((d) => ({ ...d, key: d.id }));

  // Aggregate decision outcomes by region (for bar chart)
  const decisionRegionMap = new Map<
    string,
    { region: string; passed: number; rejected: number }
  >();

  for (const d of filteredDecisions) {
    const regionName = d.region ?? 'Unspecified';
    const bucket =
      decisionRegionMap.get(regionName) ?? {
        region: regionName,
        passed: 0,
        rejected: 0,
      };
    if (d.passed) bucket.passed += 1;
    else bucket.rejected += 1;
    decisionRegionMap.set(regionName, bucket);
  }

  const decisionOutcomeData = Array.from(decisionRegionMap.values()).flatMap(
    (b) => [
      { region: b.region, result: 'Passed', count: b.passed },
      { region: b.region, result: 'Rejected', count: b.rejected },
    ],
  );

  const decisionOutcomeConfig = {
    data: decisionOutcomeData,
    xField: 'count',
    yField: 'region',
    seriesField: 'result',
    isStack: true as const,
    legend: { position: 'top-left' as const },
  };

  const decisionsColumns: ColumnsType<DecisionRow> = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 260,
    },
    {
      title: 'Result',
      dataIndex: 'passed',
      width: 120,
      render: (value: boolean) => (
        <Tag color={value ? 'green' : 'red'}>
          {value ? 'PASSED' : 'REJECTED'}
        </Tag>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      width: 120,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: 160,
      render: (value?: string) => value ?? '—',
    },
    {
      title: 'Closed at',
      dataIndex: 'closesAt',
      width: 200,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <PageContainer
      ghost
      extra={
        <Space>
          {lastUpdated && (
            <Badge
              count={
                <Tooltip title={`Last refreshed at ${lastUpdated}`}>
                  <ClockCircleOutlined style={{ color: '#52c41a' }} />
                </Tooltip>
              }
            />
          )}
          <Button
            icon={<SyncOutlined />}
            onClick={() => refresh()}
            size="small"
            type="text"
          />
        </Space>
      }
    >
      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                           */}
      {/* ------------------------------------------------------------------ */}
      <ProCard ghost style={{ marginBottom: 16 }}>
        <Space wrap align="center">
          <Space>
            <FilterOutlined />
            <Text strong>Filters</Text>
          </Space>

          <Divider type="vertical" />

          <Space size="small">
            <Text type="secondary">Time window</Text>
            <RangePicker
              allowEmpty={[true, true]}
              value={timeRange ?? undefined}
              onChange={(range) => setTimeRange(range as RangeValue)}
            />
          </Space>

          <Space size="small">
            <Text type="secondary">Scope</Text>
            <Select<'all' | DecisionScope>
              style={{ minWidth: 120 }}
              value={scopeFilter}
              onChange={(val) => setScopeFilter(val)}
            >
              <Option value="all">All</Option>
              <Option value="Elite">Elite</Option>
              <Option value="Public">Public</Option>
            </Select>
          </Space>

          <Space size="small">
            <Text type="secondary">Region</Text>
            <Select<string | 'all'>
              style={{ minWidth: 160 }}
              value={regionFilter}
              onChange={(val) => setRegionFilter(val)}
            >
              <Option value="all">All regions</Option>
              {allRegions.map((region) => (
                <Option key={region} value={region}>
                  {region}
                </Option>
              ))}
            </Select>
          </Space>
        </Space>
      </ProCard>

      {/* ------------------------------------------------------------------ */}
      {/* Overview KPIs (Pulse overview)                                    */}
      {/* ------------------------------------------------------------------ */}
      <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
        {overview.kpis.map((kpi) => (
          <StatisticCard
            key={kpi.label}
            colSpan={{
              xs: 24,
              sm: 12,
              md: 12,
              lg: 6,
            }}
            statistic={{
              title: kpi.label,
              value: kpi.value,
              suffix: kpi.delta !== undefined ? '%' : undefined,
              description:
                kpi.delta !== undefined ? (
                  <span
                    style={{
                      color: kpi.delta >= 0 ? '#3f8600' : '#cf1322',
                    }}
                  >
                    {kpi.delta >= 0 ? '▲' : '▼'} {Math.abs(kpi.delta)}%
                  </span>
                ) : null,
            }}
            chart={
              <ChartCard
                type="area"
                height={60}
                data={kpi.history.map((h) => ({
                  x: h.date,
                  y: h.value,
                }))}
                tooltip={{
                  formatter: (datum: any) =>
                    `${dayjs(datum.x).format('MMM D')}: ${datum.y}`,
                }}
              />
            }
          />
        ))}
      </ProCard>

      {/* ------------------------------------------------------------------ */}
      {/* Live participation counters                                       */}
      {/* ------------------------------------------------------------------ */}
      <ProCard
        title={
          <Space>
            <AreaChartOutlined />
            <span>Live participation</span>
          </Space>
        }
        gutter={[16, 16]}
        wrap
        style={{ marginBottom: 16 }}
      >
        {live.counters.map((c) => (
          <StatisticCard
            key={c.label}
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: (
                <Space>
                  {c.label}
                  <Badge
                    status={
                      c.trend && c.trend > 0
                        ? 'success'
                        : c.trend && c.trend < 0
                        ? 'error'
                        : 'default'
                    }
                  />
                </Space>
              ),
              value: c.value,
              precision: 0,
            }}
            chart={
              <ChartCard
                type="line"
                data={c.history.map(({ ts, value }) => ({
                  x: ts,
                  y: value,
                }))}
                height={50}
              />
            }
          />
        ))}
      </ProCard>

      {/* ------------------------------------------------------------------ */}
      {/* Trends & participation health                                     */}
      {/* ------------------------------------------------------------------ */}
      <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
        <ProCard
          colSpan={{ xs: 24, xl: 16 }}
          title={
            <Space>
              <AreaChartOutlined />
              <span>Opinion trends</span>
            </Space>
          }
        >
          <Tabs
            items={trends.charts.map((c) => ({
              key: c.key,
              label: c.title,
              children: (
                <ProCard ghost>
                  {c.type === 'line' && <Line {...c.config} />}
                  {c.type === 'area' && <Area {...c.config} />}
                  {c.type === 'heatmap' && <Heatmap {...c.config} />}
                </ProCard>
              ),
            }))}
          />
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, xl: 8 }}
          title={
            <Space>
              <PieChartOutlined />
              <span>Participation health</span>
            </Space>
          }
        >
          <ProCard split="horizontal" ghost>
            <ProCard title="Diversity radar">
              <Radar {...health.radarConfig} />
            </ProCard>
            <ProCard title="Ethics score breakdown">
              <Pie {...health.pieConfig} />
            </ProCard>
          </ProCard>
        </ProCard>
      </ProCard>

      {/* ------------------------------------------------------------------ */}
      {/* Outcomes & decisions                                              */}
      {/* ------------------------------------------------------------------ */}
      <ProCard
        title={
          <Space>
            <BarChartOutlined />
            <span>Decision outcomes & engagement</span>
          </Space>
        }
        gutter={[16, 16]}
        wrap
      >
        {/* Outcome KPIs */}
        <ProCard colSpan={24} ghost style={{ marginBottom: 8 }}>
          <Space wrap>
            {outcomes.kpis.map((kpi) => (
              <StatisticCard
                key={kpi.key}
                statistic={{
                  title: kpi.label,
                  value: kpi.value,
                  description:
                    kpi.delta !== undefined ? `${kpi.delta} vs previous` : undefined,
                }}
              />
            ))}
          </Space>
        </ProCard>

        {/* Outcome charts */}
        <ProCard colSpan={{ xs: 24, lg: 12 }}>
          <Tabs
            items={outcomes.charts.map((c) => ({
              key: c.key,
              label: c.title,
              children: (
                <ProCard ghost>
                  {c.type === 'line' && <Line {...c.config} />}
                  {c.type === 'bar' && <Bar {...c.config} />}
                </ProCard>
              ),
            }))}
          />
        </ProCard>

        {/* Decisions table + regional outcome chart */}
        <ProCard colSpan={{ xs: 24, lg: 12 }} split="horizontal" ghost>
          <ProCard title="Closed decisions">
            <Table<DecisionRow>
              size="small"
              rowKey="id"
              columns={decisionsColumns}
              dataSource={filteredDecisions}
              pagination={{ pageSize: 6 }}
            />
          </ProCard>

          <ProCard title="Outcomes by region">
            {decisionOutcomeData.length === 0 ? (
              <Empty
                description="No decisions in the selected filters"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <Bar {...decisionOutcomeConfig} />
            )}
          </ProCard>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
