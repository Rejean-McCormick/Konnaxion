'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Tabs,
  Space,
  Segmented,
  Tooltip,
  Badge,
  Empty,
  Skeleton,
  Button,
  Typography,
} from 'antd';
import { Line, Area, Heatmap } from '@ant-design/plots';
import {
  AreaChartOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  SyncOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseTrends } from '@/services/pulse';

type TimeRangeKey = '7d' | '30d' | '60d';

const { Text } = Typography;

function getDaysForRange(range: TimeRangeKey): number {
  switch (range) {
    case '7d':
      return 7;
    case '30d':
      return 30;
    case '60d':
    default:
      return 60;
  }
}

function filterSeriesByDays(data: any[], days: number): any[] {
  if (!Array.isArray(data) || data.length === 0) return data;

  const now = dayjs();
  const start = now.startOf('day').subtract(days - 1, 'day');
  const startTs = start.valueOf();
  const endTs = now.endOf('day').valueOf();

  return data.filter((row: any) => {
    const value = row?.date ?? row?.x ?? row?.ts;
    if (!value) return true;

    const d = dayjs(value).startOf('day');
    const ts = d.valueOf();

    return ts >= startTs && ts <= endTs;
  });
}

export default function PulseTrends(): JSX.Element {
  usePageTitle('Pulse · Trends');

  const [range, setRange] = useState<TimeRangeKey>('30d');

  const { data, loading, error, refresh } = useRequest(fetchPulseTrends);
  const charts = data?.charts ?? [];

  const enhancedConfigs = useMemo(
    () =>
      charts.map((chart) => {
        // Heatmap is an aggregate over hours/days, keep it as-is
        if (chart.type === 'heatmap') {
          return chart.config;
        }

        const baseData = (chart.config?.data ?? []) as any[];
        const days = getDaysForRange(range);
        const filtered = filterSeriesByDays(baseData, days);

        return {
          ...chart.config,
          data: filtered,
        };
      }),
    [charts, range],
  );

  const lastUpdatedLabel = useMemo(() => {
    if (!charts.length) return null;

    // Use the last date from the last non-heatmap series as a simple "data up to" marker
    for (let i = charts.length - 1; i >= 0; i -= 1) {
      const chart = charts[i];
      if (!chart) continue;
      if (chart.type === 'heatmap') continue;

      const series = (chart.config?.data ?? []) as any[];
      if (!series.length) continue;

      const last = series[series.length - 1] as any;
      if (!last?.date) continue;

      return dayjs(last.date).format('MMM D');
    }
    return null;
  }, [charts]);

  // ---------- loading skeleton ----------
  if (loading && !data) {
    return (
      <PageContainer ghost>
        <Skeleton active />
      </PageContainer>
    );
  }

  // ---------- error state ----------
  if (error) {
    return (
      <PageContainer ghost>
        <ProCard ghost>
          <Space
            direction="vertical"
            size="large"
            style={{ width: '100%', textAlign: 'center' }}
          >
            <Empty description="Unable to load trend data" />
            <Button
              icon={<SyncOutlined />}
              onClick={refresh}
              type="primary"
            >
              Retry
            </Button>
          </Space>
        </ProCard>
      </PageContainer>
    );
  }

  // ---------- empty safeguard ----------
  if (!charts.length) {
    return (
      <PageContainer ghost>
        <Empty description="No trend data available yet" />
      </PageContainer>
    );
  }

  const tabItems = charts.map((chart, idx) => {
    let icon: React.ReactNode = <AreaChartOutlined />;

    if (chart.type === 'heatmap') icon = <HeatMapOutlined />;
    if (chart.type === 'area') icon = <BarChartOutlined />;
    if (chart.type === 'line') icon = <AreaChartOutlined />;

    const cfg = enhancedConfigs[idx];

    return {
      key: chart.key ?? String(idx),
      label: (
        <Space size={4}>
          {icon}
          <span>{chart.title}</span>
        </Space>
      ),
      children: (
        <ProCard ghost>
          {chart.type === 'line' && <Line {...cfg} />}
          {chart.type === 'area' && <Area {...cfg} />}
          {chart.type === 'heatmap' && <Heatmap {...cfg} />}
        </ProCard>
      ),
    };
  });

  return (
    <PageContainer
      ghost
      extra={
        <Space>
          {lastUpdatedLabel && (
            <Tooltip title={`Data up to ${lastUpdatedLabel}`}>
              <Badge count={<ClockCircleOutlined />} />
            </Tooltip>
          )}

          <Segmented
            size="small"
            options={[
              { label: '7 d', value: '7d' as TimeRangeKey },
              { label: '30 d', value: '30d' as TimeRangeKey },
              { label: '60 d', value: '60d' as TimeRangeKey },
            ]}
            value={range}
            onChange={(value) => setRange(value as TimeRangeKey)}
          />

          <Button
            icon={<SyncOutlined />}
            onClick={refresh}
            size="small"
            type="text"
          />
        </Space>
      }
    >
      <ProCard ghost>
        <Space direction="vertical" size="small" style={{ marginBottom: 16 }}>
          <Text strong>Ethikos participation trends</Text>
          <Text type="secondary">
            Time-series view of debates, stances, and deliberation activity over
            the last {getDaysForRange(range)} days.
          </Text>
        </Space>

        <Tabs items={tabItems} />
      </ProCard>
    </PageContainer>
  );
}
