'use client'

import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { Badge, Space } from 'antd';
import { useInterval, useRequest } from 'ahooks';
import ChartCard from '@/components/charts/ChartCard';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseLiveData } from '@/services/pulse';   // correct import

export default function PulseLive() {
  usePageTitle('Pulse · Live Metrics');

  // custom hook (polls every 20 s)
  const { data, loading, refresh } = usePulseLive(true);

  // manual refresh safety-net
  useInterval(refresh, 20_000);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        {data?.counters.map((c) => {
          // trend is optional, so normalise to 0 for TS safety
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
/*  Local data-fetching hook                                           */
/* ------------------------------------------------------------------ */
function usePulseLive(polling = false) {
  return useRequest(fetchPulseLiveData, {
    pollingInterval: polling ? 20_000 : undefined,
  });
}
