'use client';

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

import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseHealth, type HealthSummary } from '@/services/pulse';

const { Text } = Typography;

export default function PulseHealth() {
  usePageTitle('Pulse · Participation Health');

  const { data, loading, error, refresh } = useRequest<HealthSummary, []>(
    fetchPulseHealth,
  );
  const lastUpdated = data
    ? dayjs(data.refreshedAt).format('HH:mm:ss')
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
          description="Failed to load participation health"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            icon={<SyncOutlined />}
            onClick={refresh}
            type="primary"
          >
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
        <Empty description="No participation data available yet" />
      </PageContainer>
    );
  }

  /* ---------- derive metrics from configs ---------- */
  const radarPoints =
    (data.radarConfig?.data as { metric: string; score: number }[]) ?? [];
  const metricMap = new Map<string, number>();

  radarPoints.forEach((p) => {
    if (p && typeof p.metric === 'string') {
      metricMap.set(p.metric, p.score);
    }
  });

  const participation = metricMap.get('Participation');
  const engagement = metricMap.get('Engagement');
  const balance = metricMap.get('Balance');
  const constructiveness = metricMap.get('Constructiveness');

  const piePoints =
    (data.pieConfig?.data as { type: string; value: number }[]) ?? [];
  const totalSentiment =
    piePoints.reduce(
      (sum, p) => (typeof p.value === 'number' ? sum + p.value : sum),
      0,
    ) || 0;

  const sentimentDetails = piePoints.map((p) => {
    const percent =
      totalSentiment > 0
        ? Math.round((p.value / totalSentiment) * 100)
        : 0;

    return {
      label: p.type,
      count: p.value,
      percent,
    };
  });

  /* ---------- main layout ---------- */
  return (
    <PageContainer
      ghost
      extra={
        <Space>
          {lastUpdated && (
            <Badge
              count={
                <Tooltip title={`Last refreshed at ${lastUpdated}`}>
                  <ClockCircleOutlined />
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
      }
    >
      {/* High-level participation health KPIs */}
      <ProCard
        gutter={[16, 16]}
        wrap
        style={{ marginBottom: 16 }}
      >
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
                How evenly positions are distributed between positive
                and negative.
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
          extra={
            <Text type="secondary">
              Each axis normalised to 0–100.
            </Text>
          }
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
  );
}
