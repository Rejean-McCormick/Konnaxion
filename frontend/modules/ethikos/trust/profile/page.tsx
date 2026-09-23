// FILE: frontend/modules/ethikos/trust/profile/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Avatar, Descriptions, Tag, Timeline, Typography } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchUserProfile, type ReputationProfile } from '@/services/trust';

const { Text } = Typography;

export default function MyProfile() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.trust.profile.trustMyProfile"));

  // ahooks generics: <Data, Params>
  const { data, loading } = useRequest<ReputationProfile, []>(fetchUserProfile);

  const level = data?.level ?? 'Visitor';
  const score = data?.score ?? 0;
  const dimensions = data?.dimensions ?? [];
  const recent = data?.recent ?? [];

  const initial = level.charAt(0);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard split="vertical">
        {/* Left column: compact summary */}
        <ProCard colSpan="25%">
          <Avatar size={120}>{initial}</Avatar>

          <Descriptions size="small" column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label={i18nT("ui.ethikos.trust.profile.level")}>
              <Tag color="blue">{level}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label={i18nT("ui.ethikos.trust.profile.reputationScore")}>
              <Text>{score}</Text>
            </Descriptions.Item>

            <Descriptions.Item label={i18nT("ui.ethikos.trust.profile.dimensions")}>
              {dimensions.length ? (
                dimensions.map((d) => (
                  <Tag key={d.key} style={{ marginBottom: 4 }}>
                    {d.label}: {d.score}
                  </Tag>
                ))
              ) : (
                <Text type="secondary">{i18nT("ui.ethikos.trust.profile.noReputationDataYet")}</Text>
              )}
            </Descriptions.Item>
          </Descriptions>
        </ProCard>

        {/* Right column: recent activity derived from `recent` */}
        <ProCard title={i18nT("ui.ethikos.trust.profile.recentActivity")} ghost>
          {recent.length ? (
            <Timeline
              items={recent.map((item) => ({
                color: item.change >= 0 ? 'green' : 'red',
                children: (
                  <>
                    {item.label} · {item.change >= 0 ? '+' : ''}
                    {item.change}
                  </>
                ),
              }))}
            />
          ) : (
            <Text type="secondary">{i18nT("ui.ethikos.trust.profile.noRecentActivity")}</Text>
          )}
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
