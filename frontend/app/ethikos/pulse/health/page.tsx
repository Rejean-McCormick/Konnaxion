// FILE: frontend/app/ethikos/pulse/health/page.tsx
'use client';

/**
 * Updated from app dump and aligned with existing service API.
 * Baseline reference: app/ethikos/pulse/health/page.tsx in the dump. :contentReference[oaicite:0]{index=0}
 * Service contract & data shape: services/pulse.ts (fetchPulseHealth, HealthSummary). :contentReference[oaicite:1]{index=1}
 * Header/refresh pattern mirrored from Pulse Overview page implementation. :contentReference[oaicite:2]{index=2}
 */

import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import { Pie, Radar } from '@ant-design/plots';
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
import { SyncOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '../../EthikosPageShell';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseHealth, type HealthSummary } from '@/services/pulse';

const { Text } = Typography;

type RadarPoint = { metric: string; score: number };
type PiePoint = { type: string; value: number };

function computeHealthStatus(
  constructiveness?: number,
  engagement?: number,
): { status: 'success' | 'warning' | 'error'; label: string } {
  const c = constructiveness ?? 0;
  const e = engagement ?? 0;

  if (c >= 70 && e >= 50) return { status: 'success', label: 'Healthy' };
  if (c >= 50) return { status: 'warning', label: 'Watch' };
  return { status: 'error', label: 'At risk' };
}

export default function PulseHealth(): JSX.Element {
  usePageTitle('Pulse · Participation Health');

  const { data, loading, error, refresh } = useRequest<HealthSummary, []>(
    fetchPulseHealth,
  );

  const lastUpdated = data ? dayjs(data.refreshedAt).format('HH:mm:ss') : null;
  const shellTitle = 'Pulse · Participation Health';

  /* ---------- loading skeleton ---------- */
  if (loading && !data) {
    return (
      <EthikosPageShell title={shellTitle} sectionLabel="Pulse">
        <PageContainer ghost>
          <Skeleton active />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  /* ---------- error state ---------- */
  if (error) {
    return (
      <EthikosPageShell title={shellTitle} sectionLabel="Pulse">
        <PageContainer ghost>
          <Empty
            description="Failed to load participation health"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button icon={<SyncOutlined />} onClick={refresh} type="primary">
              Retry
            </Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  /* ---------- empty safeguard ---------- */
  if (!data) {
    return (
      <EthikosPageShell title={shellTitle} sectionLabel="Pulse">
        <PageContainer ghost>
          <Empty description="No participation data available yet" />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  /* ---------- derive metrics from configs ---------- */
  const radarPoints = (data.radarConfig?.data as RadarPoint[]) ?? [];
  const metricMap = new Map<string, number>();
  radarPoints.forEach((p) => {
    if (p && typeof p.metric === 'string') metricMap.set(p.metric, p.score);
  });

  const participation = metricMap.get('Participation');
  const engagement = metricMap.get('Engagement');
  const balance = metricMap.get('Balance');
  const constructiveness = metricMap.get('Constructiveness');

  const { status: healthStatus, label: healthLabel } = computeHealthStatus(
    constructiveness,
    engagement,
  );

  const piePoints = (data.pieConfig?.data as PiePoint[]) ?? [];
  const totalSentiment =
    piePoints.reduce(
      (sum, p) => (typeof p.value === 'number' ? sum + p.value : sum),
      0,
    ) || 0;

  const sentimentDetails = piePoints.map((p) => {
    const percent =
      totalSentiment > 0 ? Math.round((p.value / totalSentiment) * 100) : 0;
    return { label: p.type, count: p.value, percent };
  });

  const secondaryActions = (
    <Space>
      <Badge status={healthStatus} text={healthLabel} />
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
        onClick={refresh}
        size="small"
        type="text"
      />
    </Space>
  );

  return (
    <EthikosPageShell
      title={shellTitle}
      sectionLabel="Pulse"
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost>
        {/* KPI summary */}
        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: 'Participation',
              value: participation ?? 0,
              suffix: '%',
              description: (
                <Text type="secondary">
                  Share of users who have expressed a stance.
                </Text>
              ),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: 'Engagement',
              value: engagement ?? 0,
              suffix: '%',
              description: (
                <Text type="secondary">
                  Voting and reactions across recent debates.
                </Text>
              ),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: 'Balance',
              value: balance ?? 0,
              suffix: '%',
              description: (
                <Text type="secondary">
                  How evenly positions are distributed between positive and
                  negative.
                </Text>
              ),
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
            statistic={{
              title: 'Constructiveness',
              value: constructiveness ?? 0,
              suffix: '%',
              description: (
                <Text type="secondary">
                  Composite of participation and balance.
                </Text>
              ),
            }}
          />
        </ProCard>

        {/* Radar + sentiment breakdown */}
        <ProCard gutter={[16, 16]} wrap>
          <ProCard
            colSpan={{ xs: 24, xl: 14 }}
            title="Participation health radar"
            extra={<Text type="secondary">Each axis normalised to 0–100.</Text>}
          >
            <Radar {...data.radarConfig} />
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 10 }}
            title="Ethics sentiment breakdown"
            split="horizontal"
          >
            <ProCard ghost>
              <Pie {...data.pieConfig} />
            </ProCard>

            <ProCard ghost>
              <List
                size="small"
                dataSource={sentimentDetails}
                renderItem={(item) => (
                  <List.Item>
                    <Space>
                      <Text strong>{item.label}</Text>
                      <Text type="secondary">
                        {item.count} stances ({item.percent}%)
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            </ProCard>
          </ProCard>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}
