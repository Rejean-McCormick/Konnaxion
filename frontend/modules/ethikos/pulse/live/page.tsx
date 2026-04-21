'use client'

import { useEffect } from 'react';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Badge, Space } from 'antd';
import { useRequest } from 'ahooks';
import ChartCard from '@/components/charts/ChartCard';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseLiveData } from '@/services/pulse';

export default function PulseLive() {
  usePageTitle('Pulse · Live Metrics');

  // Single polling source only.
  const { data, loading, refresh } = usePulseLive(true);

  // Refresh once when the tab becomes visible again.
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refresh]);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        {data?.counters.map((c) => {
          const trend = c.trend ?? 0;

          return (
            <StatisticCard
              key={c.label}
              statistic={{
                title: (
                  <Space>
                    {c.label}
                    <Badge
                      status={
                        trend > 0
                          ? 'success'
                          : trend < 0
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
                  data={c.history.map(({ ts, value }) => ({ x: ts, y: value }))}
                  height={50}
                />
              }
            />
          );
        })}
      </ProCard>
    </PageContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  Local data-fetching hook                                          */
/* ------------------------------------------------------------------ */
function usePulseLive(polling = false) {
  return useRequest(fetchPulseLiveData, {
    pollingInterval: polling ? 20_000 : undefined,
  });
}