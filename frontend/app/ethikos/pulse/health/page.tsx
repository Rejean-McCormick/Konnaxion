// FILE: frontend/app/ethikos/pulse/health/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { TranslateFunction } from '@/i18n/runtime';
import { ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { Pie, Radar } from '@ant-design/plots';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Badge,
  Button,
  Empty,
  List,
  Skeleton,
  Space,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { fetchPulseHealth, type HealthSummary } from '@/services/pulse';

const { Text } = Typography;

type RadarPoint = { metric: string; score: number };
type PiePoint = { type: string; value: number };
type PlotConfig = { data?: unknown[]; [key: string]: unknown };

function computeHealthStatus(
  i18nT: TranslateFunction,
  constructiveness?: number,
  engagement?: number,
): { status: 'success' | 'warning' | 'error'; label: string } {
  const c = constructiveness ?? 0;
  const e = engagement ?? 0;

  if (c >= 70 && e >= 50) return { status: 'success', label: i18nT('ui.ethikos.pulse.health.healthy') };
  if (c >= 50) return { status: 'warning', label: i18nT('ui.ethikos.pulse.health.watch') };
  return { status: 'error', label: i18nT('ui.ethikos.pulse.health.atRisk') };
}

function asRadarPoints(value: unknown): RadarPoint[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is RadarPoint =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as RadarPoint).metric === 'string' &&
      typeof (item as RadarPoint).score === 'number',
  );
}

function asPiePoints(value: unknown): PiePoint[] {
  if (!Array.isArray(value)) return [];

  return value.filter(
    (item): item is PiePoint =>
      !!item &&
      typeof item === 'object' &&
      typeof (item as PiePoint).type === 'string' &&
      typeof (item as PiePoint).value === 'number',
  );
}

function formatRefreshTime(refreshedAt?: string): string | null {
  if (!refreshedAt) return null;
  const parsed = dayjs(refreshedAt);
  return parsed.isValid() ? parsed.format('HH:mm:ss') : null;
}

export default function PulseHealth(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const shellTitle = i18nT("ui.ethikos.pulse.health.pulseParticipationHealth");

  const { data, loading, error, refresh } = useRequest<HealthSummary, []>(
    fetchPulseHealth,
  );

  const lastUpdated = formatRefreshTime(data?.refreshedAt);

  if (loading && !data) {
    return (
      <EthikosPageShell title={shellTitle} sectionLabel={i18nT("ui.ethikos.pulse.health.pulse")}>
        <PageContainer ghost>
          <Skeleton active />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (error) {
    return (
      <EthikosPageShell title={shellTitle} sectionLabel={i18nT("ui.ethikos.pulse.health.pulse")}>
        <PageContainer ghost>
          <Empty
            description={i18nT("ui.ethikos.pulse.health.failedToLoadParticipationHealth")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              icon={<SyncOutlined />}
              onClick={() => void refresh()}
              type="primary"
            >
              {i18nT("ui.ethikos.pulse.health.retry")}
            </Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (!data) {
    return (
      <EthikosPageShell title={shellTitle} sectionLabel={i18nT("ui.ethikos.pulse.health.pulse")}>
        <PageContainer ghost>
          <Empty description={i18nT("ui.ethikos.pulse.health.noParticipationDataAvailableYet")} />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  const radarConfig = (data.radarConfig ?? {}) as PlotConfig;
  const pieConfig = (data.pieConfig ?? {}) as PlotConfig;

  const radarPoints = asRadarPoints(radarConfig.data);
  const piePoints = asPiePoints(pieConfig.data);

  const metricMap = new Map<string, number>();
  for (const point of radarPoints) {
    metricMap.set(point.metric, point.score);
  }

  const participation = metricMap.get('Participation') ?? 0;
  const engagement = metricMap.get('Engagement') ?? 0;
  const balance = metricMap.get('Balance') ?? 0;
  const constructiveness = metricMap.get('Constructiveness') ?? 0;

  const { status: healthStatus, label: healthLabel } = computeHealthStatus(
    i18nT,
    constructiveness,
    engagement,
  );

  const totalSentiment = piePoints.reduce((sum, point) => sum + point.value, 0);

  const sentimentDetails = piePoints.map((point) => {
    const percent =
      totalSentiment > 0 ? Math.round((point.value / totalSentiment) * 100) : 0;

    return {
      label: point.type,
      count: point.value,
      percent,
    };
  });

  const hasRadarData = radarPoints.length > 0;
  const hasPieData = piePoints.length > 0;

  const secondaryActions = (
    <Space>
      <Badge status={healthStatus} text={healthLabel} />
      {lastUpdated && (
        <Badge
          count={
            <Tooltip title={i18nT("ui.ethikos.pulse.health.lastRefreshedAt", { lastUpdated: lastUpdated })}>
              <ClockCircleOutlined />
            </Tooltip>
          }
        />
      )}
      <Button
        icon={<SyncOutlined />}
        onClick={() => void refresh()}
        size="small"
        type="text"
      />
    </Space>
  );

  return (
    <EthikosPageShell
      title={shellTitle}
      sectionLabel={i18nT("ui.ethikos.pulse.health.pulse")}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost>
        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.pulse.health.participation"),
              value: participation,
              suffix: '%',
              description: (
                <Text type="secondary">
                  {i18nT("ui.ethikos.pulse.health.shareOfUsersWhoHaveExpressedA")}
                </Text>
              ),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.pulse.health.engagement"),
              value: engagement,
              suffix: '%',
              description: (
                <Text type="secondary">
                  {i18nT("ui.ethikos.pulse.health.votingAndReactionsAcrossRecentDebates")}
                </Text>
              ),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.pulse.health.balance"),
              value: balance,
              suffix: '%',
              description: (
                <Text type="secondary">
                  {i18nT("ui.ethikos.pulse.health.howEvenlyPositionsAreDistributedBetweenPositive")}
                </Text>
              ),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.pulse.health.constructiveness"),
              value: constructiveness,
              suffix: '%',
              description: (
                <Text type="secondary">
                  {i18nT("ui.ethikos.pulse.health.compositeOfParticipationAndBalance")}
                </Text>
              ),
            }}
          />
        </ProCard>

        <ProCard gutter={[16, 16]} wrap>
          <ProCard
            colSpan={{ xs: 24, xl: 14 }}
            title={i18nT("ui.ethikos.pulse.health.participationHealthRadar")}
            extra={<Text type="secondary">{i18nT("ui.ethikos.pulse.health.eachAxisNormalisedTo0100")}</Text>}
          >
            {hasRadarData ? (
              <Radar {...(radarConfig as React.ComponentProps<typeof Radar>)} />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={i18nT("ui.ethikos.pulse.health.noParticipationHealthDataYet")}
              />
            )}
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 10 }}
            title={i18nT("ui.ethikos.pulse.health.ethicsSentimentBreakdown")}
            split="horizontal"
          >
            <ProCard ghost>
              {hasPieData ? (
                <Pie {...(pieConfig as React.ComponentProps<typeof Pie>)} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={i18nT("ui.ethikos.pulse.health.noSentimentDataYet")}
                />
              )}
            </ProCard>

            <ProCard ghost>
              {sentimentDetails.length ? (
                <List
                  size="small"
                  dataSource={sentimentDetails}
                  renderItem={(item) => (
                    <List.Item key={item.label}>
                      <Space>
                        <Text strong>{item.label}</Text>
                        <Text type="secondary">
                          {item.count} {i18nT("ui.ethikos.pulse.health.stances")}{item.percent}%)
                        </Text>
                      </Space>
                    </List.Item>
                  )}
                />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={i18nT("ui.ethikos.pulse.health.noSentimentBreakdownAvailable")}
                />
              )}
            </ProCard>
          </ProCard>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}