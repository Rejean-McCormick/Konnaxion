// FILE: frontend/app/ethikos/pulse/overview/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { pulseKpiLabel } from '@/i18n/uiModelLabels';
import {
  BarChartOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  SyncOutlined,
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
  Empty,
  List,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import ChartCard from '@/components/charts/ChartCard';
import { fetchPulseOverview } from '@/services/pulse';

const { Text } = Typography;

type OverviewData = Awaited<ReturnType<typeof fetchPulseOverview>>;

type KpiMeta = {
  description: string;
  color: string;
};

const KPI_DEFINITIONS = (i18nT: TranslateFunction): Record<string, KpiMeta> => ({
  topics: {
    description: i18nT("ui.ethikos.pulse.overview.newDebateTopicsCreatedAcrossEthikosOver"),
    color: 'blue',
  },
  stances: {
    description:
      i18nT("ui.ethikos.pulse.overview.individualStanceSubmissionsLinkedToDebatesIn"),
    color: 'green',
  },
  arguments: {
    description:
      i18nT("ui.ethikos.pulse.overview.argumentsCommentsAndRepliesAddedToDebates"),
    color: 'purple',
  },
  votes: {
    description:
      i18nT("ui.ethikos.pulse.overview.weightedVotesCastAcrossTopicsAndOutcomes"),
    color: 'volcano',
  },
});

function usePulseOverview() {
  return useRequest<OverviewData, []>(fetchPulseOverview, {
    refreshDeps: [],
  });
}

function renderDelta(delta?: number): ReactNode {
  if (typeof delta !== 'number') {
    return null;
  }

  const positive = delta >= 0;

  return (
    <span
      style={{
        color: positive ? '#3f8600' : '#cf1322',
      }}
    >
      {positive ? '▲' : '▼'} {Math.abs(delta)}%
    </span>
  );
}

export default function PulseOverview() {
  const { t: i18nT } = useLanguage();
  const { data, loading, error, refresh } = usePulseOverview();
  const lastUpdated = data?.refreshedAt
    ? dayjs(data.refreshedAt).format('HH:mm:ss')
    : null;

  const secondaryActions = (
    <Space>
      {lastUpdated && (
        <Badge
          count={
            <Tooltip title={i18nT("ui.ethikos.pulse.overview.lastRefreshedAt", { lastUpdated: lastUpdated })}>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          }
        />
      )}
      <Button
        aria-label={i18nT("ui.ethikos.pulse.overview.refreshPulseOverview")}
        disabled={loading}
        icon={<SyncOutlined spin={loading} />}
        onClick={() => void refresh()}
        size="small"
        type="text"
      />
    </Space>
  );

  let body: ReactNode;

  if (loading && !data) {
    body = (
      <PageContainer ghost>
        <Skeleton active />
      </PageContainer>
    );
  } else if (error) {
    body = (
      <PageContainer ghost>
        <Empty
          description={i18nT("ui.ethikos.pulse.overview.failedToLoadMetrics")}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button icon={<SyncOutlined />} onClick={() => void refresh()}>
            {i18nT("ui.ethikos.pulse.overview.retry")}
          </Button>
        </Empty>
      </PageContainer>
    );
  } else if (data && data.kpis.length === 0) {
    body = (
      <PageContainer ghost>
        <Empty description={i18nT("ui.ethikos.pulse.overview.noKpiDataYet")} />
      </PageContainer>
    );
  } else if (data) {
    body = (
      <PageContainer ghost>
        <Alert
          description={i18nT("ui.ethikos.pulse.overview.debatesStancesArgumentsAndVotesAggregatedDaily")}
          message={i18nT("ui.ethikos.pulse.overview.aggregatedParticipationMetricsLast30Days")}
          showIcon
          style={{ marginBottom: 16 }}
          type="info"
        />

        <ProCard gutter={16} wrap>
          <ProCard colSpan={{ xs: 24, xl: 16 }} ghost>
            <ProCard gutter={[16, 16]} wrap>
              {data.kpis.map((kpi) => (
                <StatisticCard
                  key={kpi.key ?? kpi.label}
                  colSpan={{
                    xs: 24,
                    sm: 12,
                    md: 12,
                    lg: 6,
                  }}
                  statistic={{
                    title: pulseKpiLabel(i18nT, kpi.key, kpi.label),
                    value: kpi.value,
                    suffix: kpi.delta !== undefined ? '%' : undefined,
                    description: renderDelta(kpi.delta),
                  }}
                  chart={
                    <ChartCard
                      type="area"
                      height={60}
                      data={kpi.history.map((point) => ({
                        x: point.date,
                        y: point.value,
                      }))}
                      tooltip={{
                        formatter: (datum: { x: string; y: number }) =>
                          `${dayjs(datum.x).format('MMM D')}: ${datum.y}`,
                      }}
                    />
                  }
                />
              ))}
            </ProCard>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <InfoCircleOutlined />
                <span>{i18nT("ui.ethikos.pulse.overview.howToReadTheseKpis")}</span>
              </Space>
            }
          >
            <List
              dataSource={data.kpis}
              renderItem={(kpi) => {
                const meta = KPI_DEFINITIONS(i18nT)[kpi.key] ?? {
                  description: i18nT("ui.ethikos.pulse.overview.activityMetricInTheEthikosOpinionLayer"),
                  color: 'default',
                };

                return (
                  <List.Item key={kpi.key}>
                    <List.Item.Meta
                      title={
                        <Space size="small">
                          <Tag color={meta.color}>{pulseKpiLabel(i18nT, kpi.key, kpi.label)}</Tag>
                          {typeof kpi.delta === 'number' && (
                            <Text type={kpi.delta >= 0 ? 'success' : 'danger'}>
                              {kpi.delta >= 0 ? i18nT("ui.ethikos.pulse.overview.text", { delta: kpi.delta }) : i18nT("ui.ethikos.pulse.overview.text_86f229", { delta: kpi.delta })}
                            </Text>
                          )}
                        </Space>
                      }
                      description={<Text type="secondary">{meta.description}</Text>}
                    />
                  </List.Item>
                );
              }}
              size="small"
            />
          </ProCard>
        </ProCard>

        <ProCard
          ghost
          style={{ marginTop: 16 }}
          title={
            <Space>
              <LineChartOutlined />
              <span>{i18nT("ui.ethikos.pulse.overview.whereToGoNext")}</span>
            </Space>
          }
        >
          <Space wrap>
            <Button href="/ethikos/pulse/live">{i18nT("ui.ethikos.pulse.overview.liveParticipation")}</Button>
            <Button href="/ethikos/pulse/trends">{i18nT("ui.ethikos.pulse.overview.opinionTrends")}</Button>
            <Button href="/ethikos/pulse/health">{i18nT("ui.ethikos.pulse.overview.participationHealth")}</Button>
            <Button href="/ethikos/insights" icon={<BarChartOutlined />}>
              {i18nT("ui.ethikos.pulse.overview.fullAnalytics")}
            </Button>
          </Space>
        </ProCard>
      </PageContainer>
    );
  } else {
    body = (
      <PageContainer ghost>
        <Empty description={i18nT("ui.ethikos.pulse.overview.noDataAvailable")} />
      </PageContainer>
    );
  }

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.pulse.overview.pulseOverview")}
      subtitle={i18nT("ui.ethikos.pulse.overview.text30DaySnapshotOfDebatesStancesArguments")}
      primaryAction={
        <Button
          type="primary"
          href="/ethikos/insights"
          icon={<BarChartOutlined />}
        >
          {i18nT("ui.ethikos.pulse.overview.openOpinionAnalytics")}
        </Button>
      }
      secondaryActions={secondaryActions}
    >
      {body}
    </EthikosPageShell>
  );
}
