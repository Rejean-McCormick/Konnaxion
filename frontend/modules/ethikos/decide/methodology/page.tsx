// FILE: frontend/modules/ethikos/decide/methodology/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer } from '@ant-design/pro-components';
import { Alert, Collapse, Steps, Typography } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';

export default function Methodology() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.decide.methodology.decideMethodology"));

  return (
    <PageContainer ghost>
      <Typography.Title>{i18nT("ui.ethikos.decide.methodology.howWeCountVotes")}</Typography.Title>

      <Collapse
        items={[
          {
            key: 'weighting',
            label: i18nT("ui.ethikos.decide.methodology.text1StakeWeightedCounting"),
            children: (
              <Typography.Paragraph>
                {i18nT("ui.ethikos.decide.methodology.eachBallotIsTalliedWithQuadraticWeighting")}
              </Typography.Paragraph>
            ),
          },
          {
            key: 'verification',
            label: i18nT("ui.ethikos.decide.methodology.text2IdentityVerification"),
            children: (
              <Typography.Paragraph>
                {i18nT("ui.ethikos.decide.methodology.votersAuthenticateViaTheDesjardinsMeritocraticId")}
              </Typography.Paragraph>
            ),
          },
        ]}
      />

      <Steps
        current={3}
        items={[
          { title: i18nT("ui.ethikos.decide.methodology.propose") },
          { title: i18nT("ui.ethikos.decide.methodology.deliberate") },
          { title: i18nT("ui.ethikos.decide.methodology.vote") },
          { title: i18nT("ui.ethikos.decide.methodology.audit") },
        ]}
        style={{ marginTop: 40 }}
      />

      <Alert
        type="info"
        message={i18nT("ui.ethikos.decide.methodology.openData")}
        description={i18nT("ui.ethikos.decide.methodology.rawBallotsArePublishedSha256Hashed")}
        showIcon
        style={{ marginTop: 24 }}
      />
    </PageContainer>
  );
}
