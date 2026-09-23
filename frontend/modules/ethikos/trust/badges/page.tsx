// FILE: frontend/modules/ethikos/trust/badges/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Badge as AntBadge, Card, Empty } from 'antd';
import dayjs from 'dayjs';

import usePageTitle from '@/hooks/usePageTitle';
import {
  fetchUserBadges,
  type TrustBadgePayload,
  type Badge as UserBadge,
} from '@/services/trust';

function formatEarnedDate(i18nT: TranslateFunction, value?: string): string {
  if (!value) {
    return i18nT("ui.ethikos.trust.badges.unknownDate");
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('MMM D, YYYY') : value;
}

export default function Badges(): JSX.Element {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.trust.badges.trustBadges"));

  const { data, loading } = useRequest<TrustBadgePayload, []>(fetchUserBadges);

  const badges: UserBadge[] = data?.earned ?? [];

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        {!loading && badges.length === 0 && (
          <Empty description={i18nT("ui.ethikos.trust.badges.noBadgesEarnedYet")} />
        )}

        {badges.map((badge) => {
          const earnedDate = formatEarnedDate(i18nT, badge.earnedAt);

          return (
            <AntBadge.Ribbon
              text={earnedDate}
              color="green"
              key={badge.id}
            >
              <Card
                title={badge.label}
                style={{ width: 260, marginBottom: 16 }}
              >
                <p>{badge.description}</p>
                <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                  {i18nT("ui.ethikos.trust.badges.earnedOn")} {earnedDate}
                </p>
              </Card>
            </AntBadge.Ribbon>
          );
        })}
      </ProCard>
    </PageContainer>
  );
}