'use client';

import { useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Badge as AntBadge,
  Card,
  Divider,
  Empty,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchUserBadges, type Badge as TrustBadge } from '@/services/trust';

const { Text, Paragraph } = Typography;

type SortOrder = 'newest' | 'oldest';
type TimeFilter = 'all' | '90d' | '365d';

const BADGE_CATEGORY_META: Record<string, { label: string; color: string }> = {
  'first-stance': { label: 'Stances', color: 'blue' },
  'argument-builder': { label: 'Arguments', color: 'purple' },
  'active-voter': { label: 'Voting', color: 'green' },
};

export default function Badges() {
  usePageTitle('Trust · Badges');

  const { data, loading } = useRequest<TrustBadge[], []>(fetchUserBadges);
  const badges = data ?? [];

  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Early empty state: no badges at all
  if (!loading && badges.length === 0) {
    return (
      <PageContainer ghost>
        <ProCard>
          <Empty description="No badges earned yet">
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              Take part in debates, contribute arguments, and cast weighted votes
              to start unlocking trust badges based on your real activity.
            </Paragraph>
          </Empty>
        </ProCard>
      </PageContainer>
    );
  }

  const filteredBadges = useMemo(() => {
    let result = [...badges];

    if (timeFilter !== 'all') {
      const days = timeFilter === '90d' ? 90 : 365;
      const cutoff = dayjs().subtract(days, 'day');
      result = result.filter((b) => dayjs(b.earnedAt).isAfter(cutoff));
    }

    result.sort((a, b) => {
      const da = dayjs(a.earnedAt).valueOf();
      const db = dayjs(b.earnedAt).valueOf();
      return sortOrder === 'newest' ? db - da : da - db;
    });

    return result;
  }, [badges, sortOrder, timeFilter]);

  const totalBadges = badges.length;
  const recent90 = badges.filter((b) =>
    dayjs(b.earnedAt).isAfter(dayjs().subtract(90, 'day')),
  ).length;

  let firstEarned: string | undefined;
  let lastEarned: string | undefined;

  if (badges.length > 0) {
    const first = badges[0];

    if (first) {
      firstEarned = first.earnedAt;
      lastEarned = first.earnedAt;

      badges.forEach((b) => {
        const d = dayjs(b.earnedAt);
        if (dayjs(firstEarned!).isAfter(d)) {
          firstEarned = b.earnedAt;
        }
        if (dayjs(lastEarned!).isBefore(d)) {
          lastEarned = b.earnedAt;
        }
      });
    }
  }

  return (
    <PageContainer ghost loading={loading}>
      {/* Summary / explanation */}
      <ProCard gutter={[16, 16]} wrap>
        <ProCard
          colSpan={{ xs: 24, md: 12 }}
          bordered
          title="Reputation badges"
          subTitle="Derived from what you actually do in ethiKos"
        >
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph type="secondary">
              Badges are granted automatically from your real activity in debates,
              arguments and weighted votes. They cannot be edited or purchased.
            </Paragraph>
            <Paragraph type="secondary">
              Use them as a compact way to communicate your track record when you
              join new consultations or structured debates.
            </Paragraph>
          </Space>
        </ProCard>

        <ProCard colSpan={{ xs: 24, md: 12 }} bordered title="At a glance">
          <Space size="large" wrap>
            <Statistic title="Badges earned" value={totalBadges} />
            <Statistic title="Last 90 days" value={recent90} />
            {firstEarned && (
              <Statistic
                title="First badge"
                value={dayjs(firstEarned).format('MMM D, YYYY')}
              />
            )}
            {lastEarned && (
              <Statistic
                title="Most recent"
                value={dayjs(lastEarned).format('MMM D, YYYY')}
              />
            )}
          </Space>
        </ProCard>
      </ProCard>

      {/* Badge grid + controls */}
      <ProCard
        style={{ marginTop: 16 }}
        bordered
        title="Your badges"
        extra={
          <Space size="middle" wrap>
            <Space size={4}>
              <Text type="secondary">Show</Text>
              <Select<TimeFilter>
                size="small"
                value={timeFilter}
                onChange={setTimeFilter}
                style={{ minWidth: 150 }}
                options={[
                  { value: 'all', label: 'All time' },
                  { value: '90d', label: 'Last 90 days' },
                  { value: '365d', label: 'Last 12 months' },
                ]}
              />
            </Space>
            <Space size={4}>
              <Text type="secondary">Sort</Text>
              <Select<SortOrder>
                size="small"
                value={sortOrder}
                onChange={setSortOrder}
                style={{ minWidth: 150 }}
                options={[
                  { value: 'newest', label: 'Newest first' },
                  { value: 'oldest', label: 'Oldest first' },
                ]}
              />
            </Space>
          </Space>
        }
      >
        <Divider style={{ margin: '8px 0 16px' }} />

        <ProCard gutter={[16, 16]} wrap>
          {filteredBadges.length > 0 ? (
            filteredBadges.map((badge) => {
              const meta = BADGE_CATEGORY_META[badge.id];

              return (
                <AntBadge.Ribbon
                  key={badge.id}
                  text={dayjs(badge.earnedAt).format('MMM D, YYYY')}
                  color="green"
                >
                  <Card
                    hoverable
                    title={
                      <Space size={8}>
                        <span>{badge.label}</span>
                        {meta && <Tag color={meta.color}>{meta.label}</Tag>}
                      </Space>
                    }
                    style={{ width: 260, marginBottom: 16 }}
                  >
                    <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                      {badge.description}
                    </Paragraph>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Earned on {dayjs(badge.earnedAt).format('MMM D, YYYY')}
                    </Text>
                  </Card>
                </AntBadge.Ribbon>
              );
            })
          ) : (
            <Empty description="No badges in this view" />
          )}
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
