'use client'

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Tabs } from 'antd';
import { useRequest } from 'ahooks';
import { Line, Area, Heatmap } from '@ant-design/plots';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseTrends } from '@/services/pulse';

export default function PulseTrends() {
  usePageTitle('Pulse · Trends');

  const { data, loading } = useRequest(fetchPulseTrends);

  return (
    <PageContainer ghost loading={loading}>
      <Tabs
        items={data?.charts.map((c, idx) => ({
          key: idx.toString(),
          label: c.title,
          children: (
            <ProCard ghost>
              {c.type === 'line' && <Line {...c.config} />}
              {c.type === 'area' && <Area {...c.config} />}
              {c.type === 'heatmap' && <Heatmap {...c.config} />}
            </ProCard>
          ),
        }))}
      />
    </PageContainer>
  );
}
