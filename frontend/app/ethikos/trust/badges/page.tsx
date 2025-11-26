// app/ethikos/trust/badges/page.tsx
'use client';

// Source references (current code + services):
// - Current page baseline in dump: app/ethikos/trust/badges/page.tsx
// - Trust services (types + fetchUserBadges): frontend/services/trust.ts

import { useMemo, useState } from 'react';
import { PageContainer, ProCard, ProList } from '@ant-design/pro-components';
import {
  Badge as AntBadge,
  Divider,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '../../EthikosPageShell';
import { fetchUserBadges, type Badge as TrustBadge } from '@/services/trust';

const { Text, Paragraph } = Typography;

type SortOrder = 'newest' | 'oldest';
type TimeFilter = 'all' | '90d' | '365d';
type CatalogCategory = 'Stances' | 'Arguments' | 'Voting';
type CatalogShow = 'all' | 'earned' | 'locked';

type CatalogItem = {
  id: string;
  label: string;
  description: string;
  category: CatalogCategory;
  requirement: string;
};

const BADGE_CATEGORY_META: Record<
  string,
  { label: CatalogCategory; color: string }
> = {
  'first-stance': { label: 'Stances', color: 'blue' },
  'argument-builder': { label: 'Arguments', color: 'purple' },
  'active-voter': { label: 'Voting', color: 'green' },
};

// Central catalog (mirrors service logic/IDs)
const BADGE_CATALOG: CatalogItem[] = [
  {
    id: 'first-stance',
    label: 'First stance',
    description: 'Recorded your first stance in a debate.',
    category: 'Stances',
    requirement: 'Post at least one stance in any Ethikos debate.',
  },
  {
    id: 'argument-builder',
    label: 'Argument builder',
    description: 'Contributed at least 5 arguments to debates.',
    category: 'Arguments',
    requirement: 'Publish 5+ arguments across debates.',
  },
  {
    id: 'active-voter',
    label: 'Active voter',
    description: 'Cast at least 10 weighted votes across the platform.',
    category: 'Voting',
    requirement: 'Submit 10+ weighted votes on proposals.',
  },
];

export default function Badges() {
  const { data, loading } = useRequest<TrustBadge[], []>(fetchUserBadges);
  const badges = data ?? [];
  const earnedIds = useMemo(() => new Set(badges.map((b) => b.id)), [badges]);

  // Controls for "Your badges" grid
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');

  // Controls for "Badge catalog"
  const [catalogCategory, setCatalogCategory] = useState<
    CatalogCategory | 'All'
  >('All');
  const [catalogShow, setCatalogShow] = useState<CatalogShow>('all');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Detail modal for a selected badge
  const [detail, setDetail] = useState<TrustBadge | null>(null);
  const detailMeta = detail ? BADGE_CATEGORY_META[detail.id] : undefined;

  // ---------- derived stats ----------
  const totalBadges = badges.length;
  const recent90 = badges.filter((b) =>
    dayjs(b.earnedAt).isAfter(dayjs().subtract(90, 'day')),
  ).length;

  let firstEarned: string | undefined;
  let lastEarned: string | undefined;
  if (badges.length > 0) {
    const dates = badges.map((b) => b.earnedAt);
    firstEarned = dates.reduce((min, d) =>
      dayjs(d).isBefore(min) ? d : min,
    );
    lastEarned = dates.reduce((max, d) =>
      dayjs(d).isAfter(max) ? d : max,
    );
  }

  // ---------- "Your badges" grid (filters + sorting) ----------
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

  // ---------- "Badge catalog" with earned/locked status ----------
  const catalogRows = useMemo(() => {
    let rows = BADGE_CATALOG.map((c) => {
      const earned = earnedIds.has(c.id);
      const earnedBadge = badges.find((b) => b.id === c.id);
      return {
        ...c,
        earned,
        earnedAt: earnedBadge?.earnedAt,
      };
    });

    if (catalogCategory !== 'All') {
      rows = rows.filter((r) => r.category === catalogCategory);
    }

    if (catalogShow === 'earned') rows = rows.filter((r) => r.earned);
    if (catalogShow === 'locked') rows = rows.filter((r) => !r.earned);

    const q = catalogSearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.label.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.requirement.toLowerCase().includes(q),
      );
    }

    // Keep earned first within each view for clarity
    rows.sort((a, b) =>
      a.earned === b.earned
        ? a.label.localeCompare(b.label)
        : a.earned
        ? -1
        : 1,
    );
    return rows;
  }, [badges, earnedIds, catalogCategory, catalogShow, catalogSearch]);

  const shellProps = {
    title: 'Badges',
    sectionLabel: 'Trust',
  } as const;

  return (
    <EthikosPageShell {...shellProps}>
      <PageContainer ghost loading={loading}>
        {/* Summary / explanation */}
        <ProCard gutter={[16, 16]} wrap>
          <ProCard
            colSpan={{ xs: 24, md: 12 }}
            bordered
            title="Reputation badges"
            subTitle="Derived from what you actually do in Ethikos"
          >
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Paragraph type="secondary">
                Badges are granted automatically from your real activity in
                debates, arguments and weighted votes. They cannot be edited or
                purchased.
              </Paragraph>
              <Paragraph type="secondary">
                Use them as a compact way to communicate your track record when
                you join new consultations or structured debates.
              </Paragraph>
            </Space>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, md: 12 }}
            bordered
            title="At a glance"
          >
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
                    <ProCard
                      hoverable
                      onClick={() => setDetail(badge)}
                      title={
                        <Space size={8}>
                          <span>{badge.label}</span>
                          {meta && <Tag color={meta.color}>{meta.label}</Tag>}
                        </Space>
                      }
                      style={{ width: 260, marginBottom: 16 }}
                    >
                      <Paragraph
                        type="secondary"
                        style={{ marginBottom: 8 }}
                      >
                        {badge.description}
                      </Paragraph>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Earned on{' '}
                        {dayjs(badge.earnedAt).format('MMM D, YYYY')}
                      </Text>
                    </ProCard>
                  </AntBadge.Ribbon>
                );
              })
            ) : (
              <Empty description="No badges in this view" />
            )}
          </ProCard>
        </ProCard>

        {/* Catalog & criteria */}
        <ProCard
          style={{ marginTop: 16 }}
          title="Badge catalog & criteria"
          bordered
          extra={
            <Space wrap>
              <Select<CatalogShow>
                size="small"
                value={catalogShow}
                onChange={setCatalogShow}
                style={{ minWidth: 140 }}
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'earned', label: 'Earned' },
                  { value: 'locked', label: 'Locked' },
                ]}
              />
              <Select<CatalogCategory | 'All'>
                size="small"
                value={catalogCategory}
                onChange={setCatalogCategory}
                style={{ minWidth: 160 }}
                options={[
                  { value: 'All', label: 'All categories' },
                  { value: 'Stances', label: 'Stances' },
                  { value: 'Arguments', label: 'Arguments' },
                  { value: 'Voting', label: 'Voting' },
                ]}
              />
              <Input
                size="small"
                placeholder="Search catalog…"
                allowClear
                value={catalogSearch}
                onChange={(e) => setCatalogSearch(e.target.value)}
                style={{ width: 220 }}
              />
            </Space>
          }
        >
          <ProList<CatalogItem & { earned: boolean; earnedAt?: string }>
            rowKey="id"
            dataSource={catalogRows}
            split
            metas={{
              title: {
                dataIndex: 'label',
              },
              subTitle: {
                render: (
                  _: unknown,
                  row: CatalogItem & { earned: boolean; earnedAt?: string },
                ) => {
                  const meta = BADGE_CATEGORY_META[row.id];
                  return meta ? (
                    <Tag color={meta.color}>{meta.label}</Tag>
                  ) : null;
                },
              },
              description: {
                render: (
                  _: unknown,
                  row: CatalogItem & { earned: boolean; earnedAt?: string },
                ) => (
                  <Space direction="vertical" size={2}>
                    <Text type="secondary">{row.description}</Text>
                    <Text type="secondary">
                      Criteria: {row.requirement}
                    </Text>
                  </Space>
                ),
              },
              extra: {
                render: (
                  _: unknown,
                  row: CatalogItem & { earned: boolean; earnedAt?: string },
                ) =>
                  row.earned ? (
                    <Tag color="green">
                      Earned{' '}
                      {row.earnedAt &&
                        `· ${dayjs(row.earnedAt).format('MMM D, YYYY')}`}
                    </Tag>
                  ) : (
                    <Tag>Locked</Tag>
                  ),
              },
            }}
          />
        </ProCard>

        {/* Detail modal */}
        <Modal
          open={!!detail}
          title={
            detail ? (
              <Space size={8}>
                <span>{detail.label}</span>
                {detailMeta && (
                  <Tag color={detailMeta.color}>{detailMeta.label}</Tag>
                )}
              </Space>
            ) : (
              'Badge'
            )
          }
          onCancel={() => setDetail(null)}
          onOk={() => setDetail(null)}
          okText="Close"
          cancelButtonProps={{ style: { display: 'none' } }}
        >
          {detail ? (
            <Space
              direction="vertical"
              size="small"
              style={{ width: '100%' }}
            >
              <Paragraph>{detail.description}</Paragraph>
              <Text type="secondary">
                Earned on {dayjs(detail.earnedAt).format('MMMM D, YYYY')}
              </Text>
            </Space>
          ) : null}
        </Modal>
      </PageContainer>
    </EthikosPageShell>
  );
}
