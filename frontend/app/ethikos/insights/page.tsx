// FILE: frontend/app/ethikos/insights/page.tsx
// app/ethikos/insights/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
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
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import ChartCard from '@/components/charts/ChartCard';
import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
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

type ChartDatum = Record<string, unknown>;

function toChartData(data: unknown): ChartDatum[] {
  return Array.isArray(data) ? (data as ChartDatum[]) : [];
}

function asLineConfig(
  config: unknown,
): React.ComponentProps<typeof Line> {
  return config as React.ComponentProps<typeof Line>;
}

function asAreaConfig(
  config: unknown,
): React.ComponentProps<typeof Area> {
  return config as React.ComponentProps<typeof Area>;
}

function asHeatmapConfig(
  config: unknown,
): React.ComponentProps<typeof Heatmap> {
  return config as React.ComponentProps<typeof Heatmap>;
}

function asPieConfig(
  config: unknown,
): React.ComponentProps<typeof Pie> {
  return config as React.ComponentProps<typeof Pie>;
}

function asRadarConfig(
  config: unknown,
): React.ComponentProps<typeof Radar> {
  return config as React.ComponentProps<typeof Radar>;
}

function asBarConfig(
  config: unknown,
): React.ComponentProps<typeof Bar> {
  return config as React.ComponentProps<typeof Bar>;
}

function formatTrendStatus(trend?: number): 'success' | 'error' | 'default' {
  if (typeof trend !== 'number') {
    return 'default';
  }

  if (trend > 0) {
    return 'success';
  }

  if (trend < 0) {
    return 'error';
  }

  return 'default';
}

function formatDate(value?: string): string {
  if (!value) {
    return 'Unknown';
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : 'Unknown';
}

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

  return {
    overview,
    trends,
    health,
    live,
    outcomes,
    decisions,
  };
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function EthikosOpinionAnalytics(): JSX.Element {
  const [timeRange, setTimeRange] = useState<RangeValue>(() => [
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [scopeFilter, setScopeFilter] = useState<'all' | DecisionScope>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');

  const { data, loading, error, refresh } =
    useRequest<OpinionAnalyticsData, []>(fetchOpinionAnalytics);

  const overview = data?.overview;
  const trends = data?.trends;
  const health = data?.health;
  const live = data?.live;
  const outcomes = data?.outcomes;
  const decisions = data?.decisions;

  const decisionItems = decisions?.items ?? [];
  const [start, end] = timeRange ?? [];

  const lastUpdated = data
    ? dayjs(
        data.overview.refreshedAt ??
          data.health.refreshedAt ??
          new Date().toISOString(),
      ).format('HH:mm:ss')
    : null;

  const allRegions = useMemo(
    () =>
      Array.from(
        new Set(
          decisionItems
            .map((decision) => decision.region)
            .filter((region): region is string => Boolean(region)),
        ),
      ),
    [decisionItems],
  );

  const filteredDecisions: DecisionRow[] = useMemo(
    () =>
      decisionItems
        .filter((decision) => {
          if (scopeFilter !== 'all' && decision.scope !== scopeFilter) {
            return false;
          }

          if (
            regionFilter !== 'all' &&
            (decision.region ?? 'Unspecified') !== regionFilter
          ) {
            return false;
          }

          if (start && end) {
            const closedTs = dayjs(decision.closesAt).valueOf();
            const startTs = start.startOf('day').valueOf();
            const endTs = end.endOf('day').valueOf();

            if (!Number.isFinite(closedTs)) {
              return false;
            }

            if (closedTs < startTs || closedTs > endTs) {
              return false;
            }
          }

          return true;
        })
        .map((decision) => ({
          ...decision,
          key: decision.id,
        })),
    [decisionItems, end, regionFilter, scopeFilter, start],
  );

  const decisionOutcomeData = useMemo(() => {
    const buckets = new Map<
      string,
      { region: string; passed: number; rejected: number }
    >();

    for (const decision of filteredDecisions) {
      const region = decision.region ?? 'Unspecified';
      const bucket = buckets.get(region) ?? {
        region,
        passed: 0,
        rejected: 0,
      };

      if (decision.passed) {
        bucket.passed += 1;
      } else {
        bucket.rejected += 1;
      }

      buckets.set(region, bucket);
    }

    return Array.from(buckets.values()).flatMap((bucket) => [
      {
        region: bucket.region,
        outcome: 'Passed',
        value: bucket.passed,
      },
      {
        region: bucket.region,
        outcome: 'Rejected',
        value: bucket.rejected,
      },
    ]);
  }, [filteredDecisions]);

  const decisionOutcomeConfig = useMemo(
    () =>
      asBarConfig({
        data: decisionOutcomeData,
        isGroup: true,
        xField: 'region',
        yField: 'value',
        seriesField: 'outcome',
        autoFit: true,
      }),
    [decisionOutcomeData],
  );

  const agreementKpi = outcomes?.kpis.find((kpi) => kpi.key === 'agreement');
  const topicsKpi = outcomes?.kpis.find((kpi) => kpi.key === 'topics');
  const stancesKpi = outcomes?.kpis.find((kpi) => kpi.key === 'stances');
  const openKpi = outcomes?.kpis.find((kpi) => kpi.key === 'open');

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
      render: (_passed: boolean, row) => (
        <Tag color={row.passed ? 'green' : 'red'}>
          {row.passed ? 'PASSED' : 'REJECTED'}
        </Tag>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      key: 'scope',
      width: 120,
      render: (_scope: DecisionScope, row) => (
        <Tag color={row.scope === 'Elite' ? 'geekblue' : 'default'}>
          {row.scope}
        </Tag>
      ),
    },
    {
      title: 'Region',
      dataIndex: 'region',
      key: 'region',
      ellipsis: true,
      render: (_region: string | undefined, row) =>
        row.region ?? <Text type="secondary">Unspecified</Text>,
    },
    {
      title: 'Closed at',
      dataIndex: 'closesAt',
      key: 'closesAt',
      width: 180,
      render: (_value: string, row) => formatDate(row.closesAt),
    },
  ];

  const secondaryActions = (
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
        loading={loading}
      />
    </Space>
  );

  const shellProps = {
    title: 'Opinion analytics',
    subtitle:
      'Cross-cutting analytics across debates, participation and decision outcomes in ethiKos.',
    sectionLabel: 'Insights',
    secondaryActions,
  } as const;

  if (loading && !data) {
    return (
      <EthikosPageShell {...shellProps}>
        <PageContainer ghost>
          <Skeleton active />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (error) {
    return (
      <EthikosPageShell {...shellProps}>
        <PageContainer ghost>
          <Empty
            description="Failed to load opinion analytics"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              icon={<SyncOutlined />}
              onClick={() => refresh()}
              type="primary"
            >
              Retry
            </Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (!overview || !trends || !health || !live || !outcomes || !decisions) {
    return (
      <EthikosPageShell {...shellProps}>
        <PageContainer ghost>
          <Empty description="No analytics data available yet" />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  return (
    <EthikosPageShell {...shellProps}>
      <PageContainer ghost>
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
                onChange={(value) => setScopeFilter(value)}
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
                onChange={(value) => setRegionFilter(value)}
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

        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          {overview.kpis.map((kpi) => (
            <StatisticCard
              key={kpi.key ?? kpi.label}
              colSpan={{
                xs: 24,
                sm: 12,
                md: 12,
                lg: 6,
              }}
              statistic={{
                title: kpi.label,
                value: kpi.value,
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
              chart={
                <ChartCard
                  type="area"
                  height={60}
                  data={kpi.history.map((point) => ({
                    x: point.x,
                    y: point.y,
                  }))}
                  tooltip={{
                    formatter: (datum: { x?: string | number; y?: number }) =>
                      `${dayjs(datum.x).format('MMM D')}: ${datum.y ?? 0}`,
                  }}
                />
              }
            />
          ))}
        </ProCard>

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
          {live.counters.length === 0 ? (
            <ProCard>
              <Empty description="No live counters available yet" />
            </ProCard>
          ) : (
            live.counters.map((counter) => (
              <StatisticCard
                key={counter.label}
                colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
                statistic={{
                  title: (
                    <Space>
                      {counter.label}
                      <Badge status={formatTrendStatus(counter.trend)} />
                    </Space>
                  ),
                  value: counter.value,
                  precision: 0,
                }}
                chart={
                  <ChartCard
                    type="line"
                    data={counter.history.map((point) => ({
                      x: point.x,
                      y: point.y,
                    }))}
                    height={50}
                  />
                }
              />
            ))
          )}
        </ProCard>

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
            {trends.charts.length === 0 ? (
              <Empty description="No trend charts available yet" />
            ) : (
              <Tabs
                items={trends.charts.map((chart) => ({
                  key: chart.key,
                  label: chart.title,
                  children: (
                    <ProCard ghost>
                      {chart.type === 'line' && (
                        <Line {...asLineConfig(chart.config)} />
                      )}
                      {chart.type === 'area' && (
                        <Area {...asAreaConfig(chart.config)} />
                      )}
                      {chart.type === 'heatmap' && (
                        <Heatmap {...asHeatmapConfig(chart.config)} />
                      )}
                    </ProCard>
                  ),
                }))}
              />
            )}
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
                {toChartData(health.radarConfig.data).length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No radar data available yet"
                  />
                ) : (
                  <Radar {...asRadarConfig(health.radarConfig)} />
                )}
              </ProCard>

              <ProCard title="Ethics score breakdown">
                {toChartData(health.pieConfig.data).length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No breakdown data available yet"
                  />
                ) : (
                  <Pie {...asPieConfig(health.pieConfig)} />
                )}
              </ProCard>
            </ProCard>
          </ProCard>
        </ProCard>

        <ProCard gutter={[16, 16]} wrap>
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
                      <Text strong>{topicsKpi?.value ?? 0}</Text> total topics
                      are tracked across ethiKos.
                    </Text>
                  </li>
                  <li>
                    <Text>
                      Average agreement is{' '}
                      <Text strong>{agreementKpi?.value ?? 0}%</Text>, derived
                      from topic-level Ethikos stances.
                    </Text>
                  </li>
                  <li>
                    <Text>
                      Participation volume is{' '}
                      <Text strong>{stancesKpi?.value ?? 0}</Text> total
                      stances, with <Text strong>{openKpi?.value ?? 0}</Text>{' '}
                      debates still open.
                    </Text>
                  </li>
                </ul>
              </Space>
            </Space>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <BarChartOutlined />
                <span>Outcome distribution</span>
              </Space>
            }
          >
            {outcomes.charts.length === 0 ? (
              <Empty description="No outcome charts available yet" />
            ) : (
              <Tabs
                items={outcomes.charts.map((chart) => ({
                  key: chart.key,
                  label: chart.title,
                  children: (
                    <ProCard ghost>
                      {chart.type === 'line' && (
                        <Line {...asLineConfig(chart.config)} />
                      )}
                      {chart.type === 'bar' && (
                        <Bar {...asBarConfig(chart.config)} />
                      )}
                    </ProCard>
                  ),
                }))}
              />
            )}
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title="Closed decisions · outcomes vs engagement"
            extra={
              <Text type="secondary">
                Filtered: {filteredDecisions.length} / {decisionItems.length}
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
    </EthikosPageShell>
  );
}