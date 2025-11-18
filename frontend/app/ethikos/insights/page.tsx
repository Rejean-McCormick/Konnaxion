// app/ethikos/insights/page.tsx
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
        const closedTs = new Date(d.closesAt).getTime();
        const startTs = start.toDate().getTime();
        const endTs = end.toDate().getTime();
        if (!Number.isFinite(closedTs)) return false;
        if (closedTs < startTs || closedTs > endTs) return false;
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
    const region = d.region ?? 'Unspecified';
    const bucket = decisionRegionMap.get(region) ?? {
      region,
      passed: 0,
      rejected: 0,
    };
    if (d.passed) {
      bucket.passed += 1;
    } else {
      bucket.rejected += 1;
    }
    decisionRegionMap.set(region, bucket);
  }

  const decisionOutcomeData = [
    ...Array.from(decisionRegionMap.values()).map((r) => ({
      region: r.region,
      outcome: 'Passed',
      value: r.passed,
    })),
    ...Array.from(decisionRegionMap.values()).map((r) => ({
      region: r.region,
      outcome: 'Rejected',
      value: r.rejected,
    })),
  ];

  const decisionOutcomeConfig = {
    data: decisionOutcomeData,
    isGroup: true,
    xField: 'region',
    yField: 'value',
    seriesField: 'outcome',
  };

  const decisionsColumns: ColumnsType<DecisionRow> = [
    {
      title: 'Decision',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 260,
    },
    {
      title: 'Result',
      dataIndex: 'passed',
      key: 'passed',
      width: 120,
      render: (passed: boolean) => (
        <Tag color={passed ? 'green' : 'red'}>
          {passed ? 'PASSED' : 'REJECTED'}
        </Tag>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      key: 'scope',
      width: 120,
      render: (scope: DecisionScope) => (
        <Tag color={scope === 'Elite' ? 'geekblue' : 'default'}>{scope}</Tag>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      ellipsis: true,
      render: (region?: string) => region ?? <Text type="secondary">Unspecified</Text>,
    },
    {
      title: 'Closed at',
      dataIndex: 'closesAt',
      key: 'closesAt',
      width: 180,
      render: (value: string) => dayjs(value).format('YYYY-MM-DD'),
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
      <ProCard gutter={[16, 16]} wrap>
        {/* Outcome KPIs */}
        <ProCard
          colSpan={{ xs: 24, xl: 8 }}
          title={
            <Space>
              <BarChartOutlined />
              <span>Impact · Outcomes</span>
            </Space>
          }
        >
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Space size="large" wrap>
              {outcomes.kpis.map((kpi) => (
                <StatisticCard
                  key={kpi.key}
                  statistic={{
                    title: kpi.label,
                    value: kpi.value,
                    suffix: kpi.key === 'agreement' ? '%' : undefined,
                    description:
                      typeof kpi.delta === 'number' ? (
                        <span
                          style={{
                            color: kpi.delta >= 0 ? '#3f8600' : '#cf1322',
                          }}
                        >
                          {kpi.delta >= 0 ? '▲' : '▼'} {Math.abs(kpi.delta)}%
                        </span>
                      ) : null,
                  }}
                />
              ))}
            </Space>

            <Divider />

            <Space direction="vertical" size={8}>
              <Text type="secondary">Highlights</Text>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                <li>
                  <Text>
                    <Text strong>{outcomes.kpis.find((k) => k.key === 'resolved')?.value ?? 0}</Text>{' '}
                    decisions resolved overall.
                  </Text>
                </li>
                <li>
                  <Text>
                    Average agreement is{' '}
                    <Text strong>
                      {outcomes.kpis.find((k) => k.key === 'agreement')?.value ?? 0}%
                    </Text>
                    , combining stance direction and turnout.
                  </Text>
                </li>
                <li>
                  <Text>
                    Participation volume is{' '}
                    <Text strong>
                      {outcomes.kpis.find((k) => k.key === 'participation')?.value ??
                        0}
                    </Text>{' '}
                    total stances across all debates.
                  </Text>
                </li>
              </ul>
            </Space>
          </Space>
        </ProCard>

        {/* Outcome charts */}
        <ProCard
          colSpan={{ xs: 24, xl: 8 }}
          title={
            <Space>
              <BarChartOutlined />
              <span>Outcome distribution</span>
            </Space>
          }
        >
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

        {/* Closed decisions table */}
        <ProCard
          colSpan={{ xs: 24, xl: 8 }}
          title="Closed decisions · outcomes vs engagement"
          extra={
            <Text type="secondary">
              Filtered: {filteredDecisions.length} / {decisions.items.length}
            </Text>
          }
        >
          <ProCard split="horizontal" ghost>
            <ProCard title="Outcomes by region">
              {decisionOutcomeData.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No regional outcome data for current filters"
                />
              ) : (
                <Bar {...decisionOutcomeConfig} />
              )}
            </ProCard>

            <ProCard title="Closed decisions">
              <Table<DecisionRow>
                size="small"
                columns={decisionsColumns}
                dataSource={filteredDecisions}
                pagination={{ pageSize: 8 }}
                rowKey="key"
              />
            </ProCard>
          </ProCard>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
