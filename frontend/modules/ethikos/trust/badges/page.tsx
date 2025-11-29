// FILE: frontend/modules/ethikos/trust/badges/page.tsx
'use client';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Badge as AntBadge, Card, Empty } from 'antd';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchUserBadges } from '@/services/trust';
import type { Badge as UserBadge } from '@/services/trust';

export default function Badges() {
  usePageTitle('Trust · Badges');

  // ✅ FIX: add second generic argument `[]`
  const { data, loading } = useRequest<UserBadge[], []>(fetchUserBadges);
  const badges = data ?? [];

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        {!loading && badges.length === 0 && (
          <Empty description="No badges earned yet" />
        )}

        {badges.map((badge) => (
          <AntBadge.Ribbon
            text={dayjs(badge.earnedAt).format('MMM D, YYYY')}
            color="green"
            key={badge.id}
          >
            <Card
              title={badge.label}
              style={{ width: 260, marginBottom: 16 }}
            >
              <p>{badge.description}</p>
              <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                Earned on {dayjs(badge.earnedAt).format('MMM D, YYYY')}
              </p>
            </Card>
          </AntBadge.Ribbon>
        ))}
      </ProCard>
    </PageContainer>
  );
}
