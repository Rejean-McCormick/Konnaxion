// FILE: frontend/modules/ethikos/pulse/trends/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Area, Heatmap, Line } from '@ant-design/plots';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Tabs } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseTrends } from '@/services/pulse';

export default function PulseTrends() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.pulse.trends.pulseTrends"));

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
