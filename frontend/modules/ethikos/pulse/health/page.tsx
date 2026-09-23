// FILE: frontend/modules/ethikos/pulse/health/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Pie, Radar } from '@ant-design/plots';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchPulseHealth } from '@/services/pulse';

export default function PulseHealth() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.pulse.health.pulseParticipationHealth"));

  const { data, loading } = useRequest(fetchPulseHealth);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        <ProCard colSpan={12} title={i18nT("ui.ethikos.pulse.health.diversityRadar")}>
          <Radar {...data?.radarConfig} />
        </ProCard>

        <ProCard colSpan={12} title={i18nT("ui.ethikos.pulse.health.ethicsScoreBreakdown")}>
          <Pie {...data?.pieConfig} />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
