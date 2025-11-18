// app/ethikos/pulse/overview/page.tsx
'use client';

import type { ReactNode } from 'react';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
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
import {
  BarChartOutlined,
  ClockCircleOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import ChartCard from '@/components/charts/ChartCard';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseOverview } from '@/services/pulse';
import EthikosPageShell from '../../EthikosPageShell';

const { Text } = Typography;

const KPI_DEFINITIONS: Record<string, { description: string; color: string }> = {
  topics: {
    description:
      'New debate topics created across Ethikos over the last 30 days.',
    color: 'blue',
  },
  stances: {
    description:
      'Individual stance submissions (positions / votes) linked to debates in the last 30 days.',
    color: 'green',
  },
  arguments: {
    description:
      'Arguments, comments and replies added to debates over the last 30 days.',
    color: 'purple',
  },
  votes: {
    description:
      'Weighted votes cast across topics and outcomes in the last 30 days.',
    color: 'volcano',
  },
};

/* ------------------------------------------------------------------ */
/*  Data-fetching hook                                                 */
/* ------------------------------------------------------------------ */

function usePulseOverview() {
  return useRequest(fetchPulseOverview, { refreshDeps: [] });
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PulseOverview() {
  usePageTitle('Pulse · Overview');

  const { data, loading, error, refresh } = usePulseOverview();
  const lastUpdated = data ? dayjs(data.refreshedAt).format('HH:mm:ss') : null;

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
        onClick={refresh}
        size="small"
        type="text"
      />
    </Space>
  );

  let body: ReactNode;

  /* ---------- loading skeleton ---------- */
  if (loading && !data) {
    body = (
      <PageContainer ghost>
        <Skeleton active />
      </PageContainer>
    );
  } else if (error) {
    /* ---------- error state ---------- */
    body = (
      <PageContainer ghost>
        <Empty
          description="Failed to load metrics"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button icon={<SyncOutlined />} onClick={refresh}>
            Retry
          </Button>
        </Empty>
      </PageContainer>
    );
  } else if (data && data.kpis.length === 0) {
    /* ---------- empty state ---------- */
    body = (
      <PageContainer ghost>
        <Empty description="No KPI data yet" />
      </PageContainer>
    );
  } else if (data) {
    /* ---------- happy path ---------- */
    body = (
      <PageContainer ghost>
        <Alert
          type="info"
          showIcon
          message="Aggregated participation metrics (last 30 days)"
          description="Debates, stances, arguments and votes aggregated daily across all Ethikos topics. Use this view as a quick pulse before drilling into trends or live participation."
          style={{ marginBottom: 16 }}
        />

        <ProCard gutter={16} wrap>
          {/* KPI grid with sparkline charts */}
          <ProCard colSpan={{ xs: 24, xl: 16 }} ghost>
            <ProCard gutter={[16, 16]} wrap>
              {data.kpis.map((kpi) => (
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
          </ProCard>

          {/* Interpretation / metric dictionary */}
          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <InfoCircleOutlined />
                <span>How to read these KPIs</span>
              </Space>
            }
          >
            <List
              size="small"
              dataSource={data.kpis}
              renderItem={(kpi) => {
                const meta = KPI_DEFINITIONS[kpi.key] ?? {
                  description: 'Activity metric in the Ethikos opinion layer.',
                  color: 'default',
                };
                return (
                  <List.Item key={kpi.key}>
                    <List.Item.Meta
                      title={
                        <Space size="small">
                          <Tag color={meta.color}>{kpi.label}</Tag>
                          {typeof kpi.delta === 'number' && (
                            <Text type={kpi.delta >= 0 ? 'success' : 'danger'}>
                              {kpi.delta >= 0 ? `+${kpi.delta}%` : `${kpi.delta}%`}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Text type="secondary">{meta.description}</Text>
                      }
                    />
                  </List.Item>
                );
              }}
            />
          </ProCard>
        </ProCard>

        {/* Navigation to deeper analytics views */}
        <ProCard
          ghost
          style={{ marginTop: 16 }}
          title={
            <Space>
              <LineChartOutlined />
              <span>Where to go next</span>
            </Space>
          }
        >
          <Space wrap>
            <Button href="/ethikos/pulse/live">Live participation</Button>
            <Button href="/ethikos/pulse/trends">Opinion trends</Button>
            <Button href="/ethikos/pulse/health">Participation health</Button>
            <Button href="/ethikos/insights" icon={<BarChartOutlined />}>
              Full analytics
            </Button>
          </Space>
        </ProCard>
      </PageContainer>
    );
  } else {
    // Fallback: no data and not loading/error
    body = (
      <PageContainer ghost>
        <Empty description="No data available" />
      </PageContainer>
    );
  }

  return (
    <EthikosPageShell
      title="Pulse · Overview"
      subtitle="30-day snapshot of debates, stances, arguments and votes across Ethikos."
      primaryAction={
        <Button
          type="primary"
          href="/ethikos/insights"
          icon={<BarChartOutlined />}
        >
          Open opinion analytics
        </Button>
      }
      secondaryActions={secondaryActions}
    >
      {body}
    </EthikosPageShell>
  );
}
