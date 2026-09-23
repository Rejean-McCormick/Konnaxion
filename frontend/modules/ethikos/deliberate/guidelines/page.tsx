// FILE: frontend/modules/ethikos/deliberate/guidelines/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer } from '@ant-design/pro-components';
import { Anchor, Divider, Typography } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';

export default function Guidelines() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.deliberate.guidelines.deliberateGuidelines"));

  return (
    <PageContainer ghost>
      <Anchor
        affix
        items={[
          { key: 'etiquette', href: '#etiquette', title: i18nT("ui.ethikos.deliberate.guidelines.text1Etiquette") },
          { key: 'evidence', href: '#evidence', title: i18nT("ui.ethikos.deliberate.guidelines.text2EvidenceRules") },
          { key: 'moderation', href: '#moderation', title: i18nT("ui.ethikos.deliberate.guidelines.text3ModerationAppeals") },
        ]}
      />

      <Typography.Title id="etiquette" level={3}>
        {i18nT("ui.ethikos.deliberate.guidelines.text1Etiquette")}
      </Typography.Title>
      <Typography.Paragraph>
        {i18nT("ui.ethikos.deliberate.guidelines.beConciseCivilAndOnTopicPersonal")}
      </Typography.Paragraph>

      <Divider />

      <Typography.Title id="evidence" level={3}>
        {i18nT("ui.ethikos.deliberate.guidelines.text2EvidenceRules")}
      </Typography.Title>
      <Typography.Paragraph>
        {i18nT("ui.ethikos.deliberate.guidelines.claimsMustCitePeerReviewedSourcesOr")}
      </Typography.Paragraph>

      <Divider />

      <Typography.Title id="moderation" level={3}>
        {i18nT("ui.ethikos.deliberate.guidelines.text3ModerationAppeals")}
      </Typography.Title>
      <Typography.Paragraph>
        {i18nT("ui.ethikos.deliberate.guidelines.firstStrikeCommentHiddenSecondStrike24")}
      </Typography.Paragraph>
    </PageContainer>
  );
}
