// FILE: frontend/modules/konsultations/pages/ConsultationHub.tsx
﻿'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Alert, Typography } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';

import {
  ConsultationForm,
  ConsultationList,
  ConsultationVotePanel,
  ImpactTimeline,
  ResultsDashboard,
  SuggestionBoard,
} from '../components';

const { Title, Paragraph, Text } = Typography;

export default function ConsultationHub(): JSX.Element {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.konsultations.pages.consultationhub.konsultationsConsultationHub"));

  return (
    <PageContainer ghost>
      {/* Intro / context */}
      <ProCard ghost style={{ marginBottom: 16 }}>
        <Title level={2} style={{ marginBottom: 8 }}>
          {i18nT("ui.konsultations.pages.consultationhub.consultationHub")}
        </Title>
        <Paragraph type="secondary">
          {i18nT("ui.konsultations.pages.consultationhub.centralHubForParticipatoryConsultationsDiscoverOpen")}
        </Paragraph>
        <Alert
          type="info"
          showIcon
          style={{ marginTop: 16 }}
          message={i18nT("ui.konsultations.pages.consultationhub.howThisHubIsStructured")}
          description={
            <Text>
              {i18nT("ui.konsultations.pages.consultationhub.theBlocksBelowAreWiredToDedicated")}
            </Text>
          }
        />
      </ProCard>

      {/* Main layout */}
      <ProCard gutter={16} wrap>
        {/* Open consultations + create new */}
        <ProCard
          title={i18nT("ui.konsultations.pages.consultationhub.openConsultations")}
          colSpan={{ xs: 24, md: 16 }}
          bordered
        >
          {/* List of active / upcoming consultations */}
          <ConsultationList />
        </ProCard>

        <ProCard
          title={i18nT("ui.konsultations.pages.consultationhub.startANewConsultation")}
          colSpan={{ xs: 24, md: 8 }}
          bordered
        >
          {/* Wizard / form to launch a new consultation */}
          <ConsultationForm />
        </ProCard>

        {/* Participation panel */}
        <ProCard
          title={i18nT("ui.konsultations.pages.consultationhub.participateInAConsultation")}
          colSpan={{ xs: 24 }}
          bordered
        >
          {/* Voting / stance capture for the currently focused consultation */}
          <ConsultationVotePanel />
        </ProCard>

        {/* Results + impact */}
        <ProCard
          title={i18nT("ui.konsultations.pages.consultationhub.resultsAnalytics")}
          colSpan={{ xs: 24, md: 12 }}
          bordered
        >
          {/* High-level KPIs, charts, breakdowns */}
          <ResultsDashboard />
        </ProCard>

        <ProCard
          title={i18nT("ui.konsultations.pages.consultationhub.impactOverTime")}
          colSpan={{ xs: 24, md: 12 }}
          bordered
        >
          {/* Timeline of how decisions are implemented and updated */}
          <ImpactTimeline />
        </ProCard>

        {/* Suggestions / qualitative input */}
        <ProCard
          title={i18nT("ui.konsultations.pages.consultationhub.suggestionsFromParticipants")}
          colSpan={{ xs: 24 }}
          bordered
        >
          {/* Board for proposed improvements, comments, ideas */}
          <SuggestionBoard suggestions={[]} />
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
