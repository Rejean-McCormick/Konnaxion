// app/ethikos/pulse/trends/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
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
  Switch,
  message,
} from 'antd';
import { Line, Area, Heatmap } from '@ant-design/plots';
import {
  AreaChartOutlined,
  BarChartOutlined,
  HeatMapOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  BarChartOutlined as InsightsIcon,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '../../EthikosPageShell';
import { fetchPulseTrends } from '@/services/pulse';

type TimeRangeKey = '7d' | '30d' | '60d';

const { Text } = Typography;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

/**
 * Build a comparison dataset that overlays the previous period onto
 * the current period. The previous period is time-shifted so that
 * day indices align (D‑1 prev maps to D‑1 current).
 */
function buildComparisonDataset(baseData: any[], days: number) {
  const now = dayjs().endOf('day');
  const startCurrent = now.startOf('day').subtract(days - 1, 'day');
  const startPrev = startCurrent.subtract(days, 'day');
  const endPrev = startCurrent.subtract(1, 'day').endOf('day');

  const getTs = (v: any) => dayjs(v?.date ?? v?.x ?? v?.ts).valueOf();

  const current = baseData
    .filter((r) => {
      const ts = getTs(r);
      return ts >= startCurrent.valueOf() && ts <= now.valueOf();
    })
    .map((r) => ({
      ...(r as any),
      date: dayjs(getTs(r)).format('YYYY-MM-DD'),
      period: 'This period',
    }));

  const prevRaw = baseData.filter((r) => {
    const ts = getTs(r);
    return ts >= startPrev.valueOf() && ts <= endPrev.valueOf();
  });

  const prev = prevRaw.map((r) => {
    const d = dayjs(getTs(r)).startOf('day');
    const dayIndex = d.diff(startPrev, 'day'); // 0..days-1
    const alignedDate = startCurrent.add(dayIndex, 'day').format('YYYY-MM-DD');
    return {
      ...(r as any),
      date: alignedDate,
      period: 'Previous period',
    };
  });

  return [...prev, ...current];
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PulseTrends(): JSX.Element {
  const [range, setRange] = useState<TimeRangeKey>('30d');
  const [smoothLines, setSmoothLines] = useState<boolean>(true);
  const [comparePrev, setComparePrev] = useState<boolean>(false);
  const { data, loading, error, refresh } = useRequest<
    Awaited<ReturnType<typeof fetchPulseTrends>>,
    []
  >(fetchPulseTrends);

  const charts = data?.charts ?? [];
  const [activeKey, setActiveKey] = useState<string | undefined>(undefined);

  // Ensure we select first tab once charts are available
  useEffect(() => {
    if (!activeKey && charts.length) {
      setActiveKey(charts[0].key);
    }
  }, [charts, activeKey]);

  // Build per-tab configs with time-range filter, smoothing and comparison overlay.
  const enhancedConfigs = useMemo(
    () =>
      charts.map((chart) => {
        // Heatmap is an aggregate over hours/days, keep it mostly as-is
        if (chart.type === 'heatmap') {
          return {
            ...chart.config,
          };
        }

        const baseData = (chart.config?.data ?? []) as any[];
        const days = getDaysForRange(range);

        const cfg: any = {
          ...chart.config,
          data: filterSeriesByDays(baseData, days),
          smooth: smoothLines,
          // Some nice defaults for readability
          xField: chart.config?.xField ?? 'date',
          yField: chart.config?.yField ?? 'value',
          appendPadding: [8, 8, 8, 8],
          tooltip: {
            ...(chart.config?.tooltip ?? {}),
            // G2Plot formatter shape
            formatter: (datum: any) => {
              const x = datum.date ?? datum.x ?? datum.ts;
              return { name: datum.period ?? 'value', value: datum.value, title: dayjs(x).format('MMM D') };
            },
          },
          xAxis: {
            ...(chart.config?.xAxis ?? {}),
            label: { ...(chart.config?.xAxis?.label ?? {}), autoHide: true },
          },
        };

        if (comparePrev) {
          const comp = buildComparisonDataset(baseData, days);
          cfg.data = comp;
          cfg.seriesField = 'period';
          // When comparing, area charts look better unstacked so trends are comparable
          if (chart.type === 'area') {
            cfg.isStack = false;
          }
        }

        return cfg;
      }),
    [charts, range, smoothLines, comparePrev],
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
      const lastDate = last?.date ?? last?.x ?? last?.ts;
      if (!lastDate) continue;

      return dayjs(lastDate).format('MMM D');
    }
    return null;
  }, [charts]);

  /* ------------------------------------------------------------------ */
  /*  Export current tab to CSV                                         */
  /* ------------------------------------------------------------------ */

  async function exportCurrentChartCsv() {
    if (!charts.length || !activeKey) {
      message.info('Nothing to export.');
      return;
    }

    const idx = charts.findIndex((c) => c.key === activeKey);
    if (idx < 0) {
      message.info('Nothing to export.');
      return;
    }

    const chart = charts[idx];
    const cfg = enhancedConfigs[idx];

    // Only export series‑based charts; heatmap becomes a wide matrix (skip for now)
    if (chart.type === 'heatmap') {
      message.warning('Heatmap export is not supported.');
      return;
    }

    const rows = (cfg?.data ?? []) as Array<{ date?: string; x?: any; ts?: number; value: number; period?: string }>;

    const header = comparePrev ? ['date', 'value', 'period'] : ['date', 'value'];
    const encodeCell = (value: unknown): string => {
      const str = value === null || value === undefined ? '' : String(value);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const toDate = (r: any) => {
      const x = r.date ?? r.x ?? r.ts;
      return dayjs(x).format('YYYY-MM-DD');
    };

    const csv = [header, ...rows.map((r) => (comparePrev ? [toDate(r), r.value, r.period ?? 'This period'] : [toDate(r), r.value]))]
      .map((row) => row.map(encodeCell).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `${chart.key}-${range}-${comparePrev ? 'compare' : 'single'}-${timestamp}.csv`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    message.success('Exported current chart as CSV.');
  }

  /* ------------------------------------------------------------------ */
  /*  Loading / error / empty states                                    */
  /* ------------------------------------------------------------------ */

  if (loading && !data) {
    return (
      <EthikosPageShell
        title="Pulse · Trends"
        sectionLabel="Pulse"
        subtitle="Topic creation, stances and deliberation activity over time, with optional previous‑period comparison."
        primaryAction={
          <Button type="primary" href="/ethikos/insights" icon={<InsightsIcon />}>
            Open opinion analytics
          </Button>
        }
      >
        <PageContainer ghost>
          <Skeleton active />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (error) {
    return (
      <EthikosPageShell
        title="Pulse · Trends"
        sectionLabel="Pulse"
        subtitle="Topic creation, stances and deliberation activity over time, with optional previous‑period comparison."
        primaryAction={
          <Button type="primary" href="/ethikos/insights" icon={<InsightsIcon />}>
            Open opinion analytics
          </Button>
        }
      >
        <PageContainer ghost>
          <ProCard ghost>
            <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
              <Empty description="Unable to load trend data" />
              <Button icon={<SyncOutlined />} onClick={refresh} type="primary">
                Retry
              </Button>
            </Space>
          </ProCard>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (!charts.length) {
    return (
      <EthikosPageShell
        title="Pulse · Trends"
        sectionLabel="Pulse"
        subtitle="Topic creation, stances and deliberation activity over time, with optional previous‑period comparison."
        primaryAction={
          <Button type="primary" href="/ethikos/insights" icon={<InsightsIcon />}>
            Open opinion analytics
          </Button>
        }
      >
        <PageContainer ghost>
          <Empty description="No trend data available yet" />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Build Tabs                                                         */
  /* ------------------------------------------------------------------ */

  const tabItems = charts.map((chart, idx) => {
    let icon: React.ReactNode = <AreaChartOutlined />;

    if (chart.type === 'heatmap') icon = <HeatMapOutlined />;
    if (chart.type === 'area') icon = <BarChartOutlined />;
    if (chart.type === 'line') icon = <AreaChartOutlined />;

    const cfg = enhancedConfigs[idx];

    return {
      key: chart.key,
      label: (
        <Space size="small">
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

  /* ------------------------------------------------------------------ */
  /*  Secondary actions (top‑right in shell)                             */
  /* ------------------------------------------------------------------ */

  const secondaryActions = (
    <Space wrap>
      <Segmented
        size="small"
        value={range}
        onChange={(val) => setRange(val as TimeRangeKey)}
        options={[
          { label: '7d', value: '7d' },
          { label: '30d', value: '30d' },
          { label: '60d', value: '60d' },
        ]}
      />
      <Tooltip title="Smooth lines">
        <Switch size="small" checked={smoothLines} onChange={setSmoothLines} />
      </Tooltip>
      <Tooltip title="Compare with previous period">
        <Switch size="small" checked={comparePrev} onChange={setComparePrev} />
      </Tooltip>
      <Tooltip title="Last data point in the underlying series">
        <Badge
          count={
            <Space size={4}>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
              <Text type="secondary">{lastUpdatedLabel ?? '—'}</Text>
            </Space>
          }
          style={{ backgroundColor: '#f0f0f0' }}
        />
      </Tooltip>
      <Button icon={<DownloadOutlined />} size="small" onClick={exportCurrentChartCsv}>
        Export CSV
      </Button>
      <Button icon={<SyncOutlined />} size="small" onClick={refresh} />
    </Space>
  );

  /* ------------------------------------------------------------------ */
  /*  Render                                                             */
  /* ------------------------------------------------------------------ */

  return (
    <EthikosPageShell
      title="Pulse · Trends"
      sectionLabel="Pulse"
      subtitle="Topic creation, stances, and deliberation activity over time. Filter by range, smooth lines, and optionally overlay the previous period."
      primaryAction={
        <Button type="primary" href="/ethikos/insights" icon={<InsightsIcon />}>
          Open opinion analytics
        </Button>
      }
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost>
        <Tabs items={tabItems} activeKey={activeKey} onChange={setActiveKey} />
      </PageContainer>
    </EthikosPageShell>
  );
}
