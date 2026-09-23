
// FILE: frontend/app/ethikos/insights/page.tsx
// app/ethikos/insights/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { scopeLabel } from '@/i18n/uiModelLabels';
import { impactKpiLabel, pulseCounterLabel, pulseKpiLabel } from '@/i18n/uiModelLabels';
import {
  ArrowRightOutlined,
  BranchesOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ColumnWidthOutlined,
  DashboardOutlined,
  FilterOutlined,
  LineChartOutlined,
  RadarChartOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
  SyncOutlined,
  TrophyOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  Badge,
  Button,
  DatePicker,
  Divider,
  Empty,
  Select,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import React, { useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import ChartCard from '@/components/charts/ChartCard';
import {
  type DecisionResult,
  type DecisionScope,
  fetchDecisionResults,
} from '@/services/decide';
import { fetchImpactOutcomes } from '@/services/impact';
import {
  fetchPulseHealth,
  fetchPulseLiveData,
  fetchPulseOverview,
} from '@/services/pulse';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Text, Paragraph } = Typography;

type RangeValue = [Dayjs | null, Dayjs | null] | null;

type PulseOverviewData = Awaited<ReturnType<typeof fetchPulseOverview>>;
type PulseHealthData = Awaited<ReturnType<typeof fetchPulseHealth>>;
type PulseLiveData = Awaited<ReturnType<typeof fetchPulseLiveData>>;
type ImpactOutcomesData = Awaited<ReturnType<typeof fetchImpactOutcomes>>;
type DecisionsData = Awaited<ReturnType<typeof fetchDecisionResults>>;

type EthikosOverviewData = {
  overview?: PulseOverviewData;
  health?: PulseHealthData;
  live?: PulseLiveData;
  outcomes?: ImpactOutcomesData;
  decisions?: DecisionsData;
  errors: string[];
};

type SafeLoadResult<T> = {
  data?: T;
  error?: string;
};

type DecisionRow = DecisionResult & { key: string };

type WorkflowCard = {
  title: string;
  description: string;
  href: string;
  action: string;
  icon: React.ReactNode;
};

async function safeLoad<T>(
  label: string,
  loader: () => Promise<T>,
): Promise<SafeLoadResult<T>> {
  try {
    return {
      data: await loader(),
    };
  } catch (error) {
    return {
      error: `${label}: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function fetchEthikosOverview(): Promise<EthikosOverviewData> {
  const [overview, health, live, outcomes, decisions] = await Promise.all([
    safeLoad('Pulse overview', fetchPulseOverview),
    safeLoad('Pulse health', fetchPulseHealth),
    safeLoad('Live activity', fetchPulseLiveData),
    safeLoad('Impact outcomes', fetchImpactOutcomes),
    safeLoad('Decision results', fetchDecisionResults),
  ]);

  return {
    overview: overview.data,
    health: health.data,
    live: live.data,
    outcomes: outcomes.data,
    decisions: decisions.data,
    errors: [
      overview.error,
      health.error,
      live.error,
      outcomes.error,
      decisions.error,
    ].filter((message): message is string => Boolean(message)),
  };
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

function formatDate(i18nT: TranslateFunction, value?: string): string {
  if (!value) {
    return i18nT("ui.ethikos.insights.unknown");
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : 'Unknown';
}

function route(path: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}sidebar=ethikos`;
}

export default function EthikosOverviewPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [timeRange, setTimeRange] = useState<RangeValue>(() => [
    dayjs().subtract(30, 'day'),
    dayjs(),
  ]);
  const [scopeFilter, setScopeFilter] = useState<'all' | DecisionScope>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');

  const { data, loading, error, refresh } =
    useRequest<EthikosOverviewData, []>(fetchEthikosOverview);

  const overview = data?.overview;
  const health = data?.health;
  const live = data?.live;
  const outcomes = data?.outcomes;
  const decisions = data?.decisions;

  const decisionItems = decisions?.items ?? [];
  const liveCounters = live?.counters ?? [];
  const outcomeKpis = outcomes?.kpis ?? [];
  const overviewKpis = overview?.kpis ?? [];

  const [start, end] = timeRange ?? [];

  const lastUpdated = data
    ? dayjs(
        overview?.refreshedAt ??
          health?.refreshedAt ??
          new Date().toISOString(),
      ).format('HH:mm:ss')
    : null;

  const agreementKpi = outcomeKpis.find((kpi) => kpi.key === 'agreement');
  const topicsKpi = outcomeKpis.find((kpi) => kpi.key === 'topics');
  const stancesKpi = outcomeKpis.find((kpi) => kpi.key === 'stances');
  const openKpi = outcomeKpis.find((kpi) => kpi.key === 'open');

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

  const recentDecisions = filteredDecisions.slice(0, 6);

  const workflowCards: WorkflowCard[] = [
    {
      title: i18nT("ui.ethikos.insights.deliberate"),
      description: i18nT("ui.ethikos.insights.openATopicInspectTheArgumentThread"),
      href: route('/ethikos/deliberate/elite'),
      action: 'Open topics',
      icon: <StarOutlined />,
    },
    {
      title: i18nT("ui.ethikos.insights.decide"),
      description: i18nT("ui.ethikos.insights.reviewPublicConsultationsOrExpertDecisionsAnd"),
      href: route('/ethikos/decide/public'),
      action: 'Vote now',
      icon: <SafetyCertificateOutlined />,
    },
    {
      title: i18nT("ui.ethikos.insights.trackImpact"),
      description: i18nT("ui.ethikos.insights.followOutcomesAndImplementationProgressAfterDecisions"),
      href: route('/ethikos/impact/tracker'),
      action: 'Track impact',
      icon: <RadarChartOutlined />,
    },
    {
      title: i18nT("ui.ethikos.insights.monitorPulse"),
      description: i18nT("ui.ethikos.insights.checkLiveParticipationDebateHealthAndTrend"),
      href: route('/ethikos/pulse/live'),
      action: 'View pulse',
      icon: <ColumnWidthOutlined />,
    },
  ];

  const decisionsColumns: ColumnsType<DecisionRow> = [
    {
      title: i18nT("ui.ethikos.insights.decision"),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: i18nT("ui.ethikos.insights.result"),
      dataIndex: 'passed',
      key: 'passed',
      width: 110,
      render: (_passed: boolean, row) => (
        <Tag color={row.passed ? 'green' : 'red'}>
          {row.passed ? i18nT("ui.ethikos.insights.passed") : i18nT("ui.ethikos.insights.rejected")}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.ethikos.insights.scope"),
      dataIndex: 'scope',
      key: 'scope',
      width: 110,
      render: (_scope: DecisionScope, row) => (
        <Tag color={row.scope === 'Elite' ? 'geekblue' : 'default'}>
          {scopeLabel(i18nT, row.scope)}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.ethikos.insights.closed"),
      dataIndex: 'closesAt',
      key: 'closesAt',
      width: 130,
      render: (_value: string, row) => formatDate(i18nT, row.closesAt),
    },
  ];

  const secondaryActions = (
    <Space>
      {lastUpdated && (
        <Badge
          count={
            <Tooltip title={i18nT("ui.ethikos.insights.lastRefreshedAt", { lastUpdated: lastUpdated })}>
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
    title: i18nT("ui.ethikos.insights.ethikosOverview"),
    subtitle:
      i18nT("ui.ethikos.insights.yourCurrentDeliberationDecisionTrustPulseAnd"),
    sectionLabel: i18nT("ui.ethikos.insights.overview"),
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
            description={i18nT("ui.ethikos.insights.failedToLoadEthikosOverview")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              icon={<SyncOutlined />}
              onClick={() => refresh()}
              type="primary"
            >
              {i18nT("ui.ethikos.insights.retry")}
            </Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  const hasAnyData =
    overviewKpis.length > 0 ||
    liveCounters.length > 0 ||
    outcomeKpis.length > 0 ||
    decisionItems.length > 0;

  if (!hasAnyData) {
    return (
      <EthikosPageShell {...shellProps}>
        <PageContainer ghost>
          <Empty description={i18nT("ui.ethikos.insights.noEthikosOverviewDataAvailableYet")} />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  return (
    <EthikosPageShell {...shellProps}>
      <PageContainer ghost>
        {data?.errors.length ? (
          <Alert
            showIcon
            type="warning"
            style={{ marginBottom: 16 }}
            message={i18nT("ui.ethikos.insights.someOverviewSectionsCouldNotBeRefreshed")}
            description={
              <Space direction="vertical" size={2}>
                {data.errors.map((message) => (
                  <Text key={message} type="secondary">
                    {message}
                  </Text>
                ))}
              </Space>
            }
          />
        ) : null}

        <ProCard
          title={
            <Space>
              <DashboardOutlined />
              <span>{i18nT("ui.ethikos.insights.whereToStart")}</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <ProCard gutter={[16, 16]} wrap ghost>
            {workflowCards.map((item) => (
              <ProCard
                key={item.title}
                colSpan={{ xs: 24, md: 12, xl: 6 }}
                bordered
              >
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Space>
                    {item.icon}
                    <Text strong>{item.title}</Text>
                  </Space>

                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {item.description}
                  </Paragraph>

                  <Button href={item.href} type="primary" icon={<ArrowRightOutlined />}>
                    {item.action}
                  </Button>
                </Space>
              </ProCard>
            ))}
          </ProCard>
        </ProCard>

        <ProCard
          title={i18nT("ui.ethikos.insights.currentSnapshot")}
          gutter={[16, 16]}
          wrap
          style={{ marginBottom: 16 }}
        >
          {overviewKpis.length > 0 ? (
            overviewKpis.slice(0, 4).map((kpi) => (
              <StatisticCard
                key={kpi.key ?? kpi.label}
                colSpan={{ xs: 24, sm: 12, lg: 6 }}
                statistic={{
                  title: pulseKpiLabel(i18nT, kpi.key, kpi.label),
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
              />
            ))
          ) : (
            <ProCard>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={i18nT("ui.ethikos.insights.noKpiSnapshotAvailableYet")}
              />
            </ProCard>
          )}
        </ProCard>

        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <WarningOutlined />
                <span>{i18nT("ui.ethikos.insights.needsAttention")}</span>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.insights.openDebates"),
                  value: openKpi?.value ?? 0,
                  description: i18nT("ui.ethikos.insights.topicsStillAvailableForParticipation"),
                }}
              />

              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.insights.totalStances"),
                  value: stancesKpi?.value ?? 0,
                  description: i18nT("ui.ethikos.insights.participationVolumeAcrossEthikos"),
                }}
              />

              <Button href={route('/ethikos/deliberate/elite')} block>
                {i18nT("ui.ethikos.insights.reviewOpenTopics")}
              </Button>
            </Space>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <CheckCircleOutlined />
                <span>{i18nT("ui.ethikos.insights.decisionHealth")}</span>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.insights.trackedTopics"),
                  value: topicsKpi?.value ?? 0,
                  description: i18nT("ui.ethikos.insights.topicsIncludedInOutcomeTracking"),
                }}
              />

              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.insights.averageAgreement"),
                  value: agreementKpi?.value ?? 0,
                  suffix: '%',
                  description: i18nT("ui.ethikos.insights.derivedFromTopicLevelEthikosStances"),
                }}
              />

              <Button href={route('/ethikos/decide/results')} block>
                {i18nT("ui.ethikos.insights.reviewResults")}
              </Button>
            </Space>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <LineChartOutlined />
                <span>{i18nT("ui.ethikos.insights.liveActivity")}</span>
              </Space>
            }
          >
            {liveCounters.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={i18nT("ui.ethikos.insights.noLiveCountersAvailableYet")}
              />
            ) : (
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {liveCounters.slice(0, 3).map((counter) => (
                  <StatisticCard
                    key={counter.key ?? counter.label}
                    statistic={{
                      title: (
                        <Space>
                          {pulseCounterLabel(i18nT, counter.key, counter.label)}
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
                        height={44}
                        axis={{ x: false, y: false }}
                        padding={0}
                        legend={false}
                      />
                    }
                  />
                ))}

                <Button href={route('/ethikos/pulse/live')} block>
                  {i18nT("ui.ethikos.insights.openLivePulse")}
                </Button>
              </Space>
            )}
          </ProCard>
        </ProCard>

        <ProCard
          title={
            <Space>
              <FilterOutlined />
              <span>{i18nT("ui.ethikos.insights.recentDecisions")}</span>
            </Space>
          }
          extra={
            <Text type="secondary">
              {i18nT("ui.ethikos.insights.showing")} {recentDecisions.length} / {decisionItems.length}
            </Text>
          }
          style={{ marginBottom: 16 }}
        >
          <Space wrap align="center" style={{ marginBottom: 16 }}>
            <Space size="small">
              <Text type="secondary">{i18nT("ui.ethikos.insights.timeWindow")}</Text>
              <RangePicker
                allowEmpty={[true, true]}
                value={timeRange ?? undefined}
                onChange={(range) => setTimeRange(range as RangeValue)}
              />
            </Space>

            <Space size="small">
              <Text type="secondary">{i18nT("ui.ethikos.insights.scope")}</Text>
              <Select<'all' | DecisionScope>
                style={{ minWidth: 140 }}
                value={scopeFilter}
                onChange={(value) => setScopeFilter(value)}
              >
                <Option value="all">{i18nT("ui.ethikos.insights.all")}</Option>
                <Option value="Elite">{i18nT("ui.ethikos.insights.expert")}</Option>
                <Option value="Public">{i18nT("ui.ethikos.insights.public")}</Option>
              </Select>
            </Space>

            <Space size="small">
              <Text type="secondary">{i18nT("ui.ethikos.insights.region")}</Text>
              <Select<string | 'all'>
                style={{ minWidth: 160 }}
                value={regionFilter}
                onChange={(value) => setRegionFilter(value)}
              >
                <Option value="all">{i18nT("ui.ethikos.insights.allRegions")}</Option>
                {allRegions.map((region) => (
                  <Option key={region} value={region}>
                    {region}
                  </Option>
                ))}
              </Select>
            </Space>
          </Space>

          {recentDecisions.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={i18nT("ui.ethikos.insights.noDecisionsMatchTheCurrentFilters")}
            />
          ) : (
            <Table<DecisionRow>
              size="small"
              columns={decisionsColumns}
              dataSource={recentDecisions}
              pagination={false}
              rowKey="key"
            />
          )}

          <Divider />

          <Space wrap>
            <Button href={route('/ethikos/decide/results')}>
              {i18nT("ui.ethikos.insights.openFullResults")}
            </Button>
            <Button href={route('/ethikos/impact/outcomes')}>
              {i18nT("ui.ethikos.insights.viewOutcomes")}
            </Button>
            <Button href={route('/ethikos/impact/tracker')}>
              {i18nT("ui.ethikos.insights.trackImplementation")}
            </Button>
          </Space>
        </ProCard>

        <ProCard
          title={i18nT("ui.ethikos.insights.deepDiveAreas")}
          gutter={[16, 16]}
          wrap
        >
          <ProCard
            colSpan={{ xs: 24, md: 12, xl: 6 }}
            bordered
            title={
              <Space>
                <ColumnWidthOutlined />
                <span>{i18nT("ui.ethikos.insights.pulse")}</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              {i18nT("ui.ethikos.insights.liveActivityDebateHealthTrendsAndParticipation")}
            </Paragraph>
            <Button href={route('/ethikos/pulse/overview')}>
              {i18nT("ui.ethikos.insights.openPulseOverview")}
            </Button>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, md: 12, xl: 6 }}
            bordered
            title={
              <Space>
                <RadarChartOutlined />
                <span>{i18nT("ui.ethikos.insights.impact")}</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              {i18nT("ui.ethikos.insights.outcomesFeedbackAndImplementationTrackingAfterDecisions")}
            </Paragraph>
            <Button href={route('/ethikos/impact/tracker')}>
              {i18nT("ui.ethikos.insights.openImpactTracker")}
            </Button>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, md: 12, xl: 6 }}
            bordered
            title={
              <Space>
                <TrophyOutlined />
                <span>{i18nT("ui.ethikos.insights.trust")}</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              {i18nT("ui.ethikos.insights.profileCredibilityBadgesAndCredentialsForDeliberation")}
            </Paragraph>
            <Button href={route('/ethikos/trust/profile')}>
              {i18nT("ui.ethikos.insights.openTrustProfile")}
            </Button>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, md: 12, xl: 6 }}
            bordered
            title={
              <Space>
                <BranchesOutlined />
                <span>{i18nT("ui.ethikos.insights.learn")}</span>
              </Space>
            }
          >
            <Paragraph type="secondary">
              {i18nT("ui.ethikos.insights.guidesGlossaryAndChangelogForUsingEthikos")}
            </Paragraph>
            <Button href={route('/ethikos/learn/guides')}>
              {i18nT("ui.ethikos.insights.openGuides")}
            </Button>
          </ProCard>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}
