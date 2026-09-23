// FILE: frontend/modules/ethikos/impact/outcomes/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Bar, Line } from '@ant-design/plots';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Tabs } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchImpactOutcomes } from '@/services/impact';

export default function Outcomes() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.impact.outcomes.impactOutcomes"));

  const { data, loading } = useRequest(fetchImpactOutcomes);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        {data?.kpis.map(k => (
          <StatisticCard
            key={k.label}
            statistic={{ title: k.label, value: k.value, suffix: k.delta && '%' }}
          />
        ))}
      </ProCard>

      <Tabs
        items={data?.charts.map((c, i) => ({
          key: i.toString(),
          label: c.title,
          children: (
            <ProCard ghost>
              {c.type === 'line' && <Line {...c.config} />}
              {c.type === 'bar' && <Bar {...c.config} />}
            </ProCard>
          ),
        }))}
      />
    </PageContainer>
  );
}
