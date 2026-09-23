// FILE: frontend/app/ethikos/trust/badges/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProCard, ProList } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Badge as AntBadge,
  Divider,
  Empty,
  Input,
  Modal,
  Progress,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { fetchTrustBadges } from '@/services/trust';
import type {
  Badge as TrustBadge,
  TrustBadgePayload,
} from '@/services/trust';

const { Text, Paragraph } = Typography;

type SortOrder = 'newest' | 'oldest';
type TimeFilter = 'all' | '90d' | '365d';
type CatalogCategory = 'Stances' | 'Arguments' | 'Voting';
type CatalogCategoryFilter = CatalogCategory | 'All';
type CatalogShow = 'all' | 'earned' | 'locked';

interface CatalogItem {
  id: string;
  label: string;
  description: string;
  category: CatalogCategory;
  requirement: string;
}

interface CatalogRow extends CatalogItem {
  earned: boolean;
  progress: number;
  earnedAt?: string;
}

const BADGE_CATEGORY_META: Record<
  string,
  { label: CatalogCategory; color: string }
> = {
  'first-stance': { label: 'Stances', color: 'blue' },
  'argument-builder': { label: 'Arguments', color: 'purple' },
  'active-voter': { label: 'Voting', color: 'green' },
};

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

function getBadgeLabel(badge: TrustBadge): string {
  return badge.label || badge.title || badge.id;
}

function getBadgeDate(badge: TrustBadge): string | undefined {
  return badge.earnedAt ?? badge.createdAt;
}

function formatDate(i18nT: TranslateFunction, value?: string): string {
  if (!value) {
    return i18nT("ui.ethikos.trust.badges.notEarnedYet");
  }

  const date = dayjs(value);

  if (!date.isValid()) {
    return value;
  }

  return date.format('MMM D, YYYY');
}

function isWithinTimeFilter(badge: TrustBadge, timeFilter: TimeFilter): boolean {
  if (timeFilter === 'all') {
    return true;
  }

  const badgeDate = getBadgeDate(badge);

  if (!badgeDate) {
    return false;
  }

  const parsed = dayjs(badgeDate);

  if (!parsed.isValid()) {
    return true;
  }

  const days = timeFilter === '90d' ? 90 : 365;

  return parsed.isAfter(dayjs().subtract(days, 'day'));
}

function sortBadges(a: TrustBadge, b: TrustBadge, sortOrder: SortOrder): number {
  const aTime = getBadgeDate(a) ? dayjs(getBadgeDate(a)).valueOf() : 0;
  const bTime = getBadgeDate(b) ? dayjs(getBadgeDate(b)).valueOf() : 0;

  return sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
}

function badgeCategory(badgeId: string): CatalogCategory {
  return BADGE_CATEGORY_META[badgeId]?.label ?? 'Voting';
}

function badgeCategoryColor(badgeId: string): string {
  return BADGE_CATEGORY_META[badgeId]?.color ?? 'default';
}

function badgeProgressValue(badge: TrustBadge): number {
  if (badge.earned) {
    return 100;
  }

  if (!Number.isFinite(badge.progress)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(badge.progress)));
}

export default function TrustBadgesPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [catalogCategory, setCatalogCategory] =
    useState<CatalogCategoryFilter>('All');
  const [catalogShow, setCatalogShow] = useState<CatalogShow>('all');
  const [catalogSearch, setCatalogSearch] = useState('');
  const [detail, setDetail] = useState<TrustBadge | null>(null);

  const {
    data,
    loading,
    error,
    refresh,
  } = useRequest<TrustBadgePayload, []>(fetchTrustBadges);

  const earnedBadges = useMemo<TrustBadge[]>(
    () => data?.earned ?? [],
    [data],
  );

  const progressBadges = useMemo<TrustBadge[]>(
    () => data?.progress ?? [],
    [data],
  );

  const allBadges = useMemo<TrustBadge[]>(
    () => [...earnedBadges, ...progressBadges],
    [earnedBadges, progressBadges],
  );

  const earnedIds = useMemo(
    () => new Set(earnedBadges.map((badge) => badge.id)),
    [earnedBadges],
  );

  const visibleEarnedBadges = useMemo(
    () =>
      earnedBadges
        .filter((badge) => isWithinTimeFilter(badge, timeFilter))
        .sort((a, b) => sortBadges(a, b, sortOrder)),
    [earnedBadges, sortOrder, timeFilter],
  );

  const catalogRows = useMemo<CatalogRow[]>(() => {
    const byId = new Map(allBadges.map((badge) => [badge.id, badge]));

    return BADGE_CATALOG.map((catalogItem) => {
      const badge = byId.get(catalogItem.id);
      const earned = badge?.earned ?? earnedIds.has(catalogItem.id);

      return {
        ...catalogItem,
        earned,
        progress: badge ? badgeProgressValue(badge) : 0,
        earnedAt: badge?.earnedAt ?? badge?.createdAt,
      };
    });
  }, [allBadges, earnedIds]);

  const filteredCatalogRows = useMemo(() => {
    const query = catalogSearch.trim().toLowerCase();

    return catalogRows.filter((row) => {
      const matchesCategory =
        catalogCategory === 'All' || row.category === catalogCategory;

      const matchesShow =
        catalogShow === 'all' ||
        (catalogShow === 'earned' && row.earned) ||
        (catalogShow === 'locked' && !row.earned);

      const matchesSearch =
        query.length === 0 ||
        row.label.toLowerCase().includes(query) ||
        row.description.toLowerCase().includes(query) ||
        row.requirement.toLowerCase().includes(query);

      return matchesCategory && matchesShow && matchesSearch;
    });
  }, [catalogCategory, catalogRows, catalogSearch, catalogShow]);

  const earnedCount = earnedBadges.length;
  const progressCount = progressBadges.length;
  const totalCatalogCount = BADGE_CATALOG.length;
  const completionRate =
    totalCatalogCount > 0
      ? Math.round((earnedCount / totalCatalogCount) * 100)
      : 0;

  const detailMeta = detail ? BADGE_CATEGORY_META[detail.id] : undefined;

  const secondaryActions: ReactNode = (
    <Space wrap>
      <Tag color="green">{earnedCount} {i18nT("ui.ethikos.trust.badges.earned")}</Tag>
      <Tag color="blue">{progressCount} {i18nT("ui.ethikos.trust.badges.inProgress")}</Tag>
      <Tag color="purple">{completionRate}{i18nT("ui.ethikos.trust.badges.complete")}</Tag>
    </Space>
  );

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.trust.badges.badges")}
      sectionLabel={i18nT("ui.ethikos.trust.badges.trust")}
      subtitle={i18nT("ui.ethikos.trust.badges.trackEthikosTrustBadgesEarnedThroughStances")}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <ProCard gutter={16} wrap>
            <ProCard colSpan={{ xs: 24, md: 8 }}>
              <Statistic title={i18nT("ui.ethikos.trust.badges.earnedBadges")} value={earnedCount} />
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 8 }}>
              <Statistic title={i18nT("ui.ethikos.trust.badges.inProgress_b6bd42")} value={progressCount} />
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 8 }}>
              <Statistic
                suffix="%"
                title={i18nT("ui.ethikos.trust.badges.catalogCompletion")}
                value={completionRate}
              />
            </ProCard>
          </ProCard>

          <ProCard
            bordered
            title={i18nT("ui.ethikos.trust.badges.yourBadges")}
            extra={
              <Space wrap>
                <Select<TimeFilter>
                  size="small"
                  value={timeFilter}
                  style={{ width: 130 }}
                  onChange={setTimeFilter}
                  options={[
                    { label: i18nT("ui.ethikos.trust.badges.allTime"), value: 'all' },
                    { label: i18nT("ui.ethikos.trust.badges.last90Days"), value: '90d' },
                    { label: i18nT("ui.ethikos.trust.badges.lastYear"), value: '365d' },
                  ]}
                />

                <Select<SortOrder>
                  size="small"
                  value={sortOrder}
                  style={{ width: 130 }}
                  onChange={setSortOrder}
                  options={[
                    { label: i18nT("ui.ethikos.trust.badges.newestFirst"), value: 'newest' },
                    { label: i18nT("ui.ethikos.trust.badges.oldestFirst"), value: 'oldest' },
                  ]}
                />
              </Space>
            }
          >
            {error ? (
              <Empty
                description={i18nT("ui.ethikos.trust.badges.unableToLoadTrustBadges")}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Typography.Link onClick={() => refresh()}>
                  {i18nT("ui.ethikos.trust.badges.retry")}
                </Typography.Link>
              </Empty>
            ) : visibleEarnedBadges.length === 0 && !loading ? (
              <Empty
                description={i18nT("ui.ethikos.trust.badges.noEarnedBadgesMatchTheCurrentFilters")}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <ProList<TrustBadge>
                rowKey="id"
                dataSource={visibleEarnedBadges}
                loading={loading}
                pagination={{
                  pageSize: 6,
                  showSizeChanger: false,
                }}
                metas={{
                  title: {
                    render: (_dom, badge) => (
                      <Space wrap>
                        <Text strong>{getBadgeLabel(badge)}</Text>
                        <Tag color={badgeCategoryColor(badge.id)}>
                          {badgeCategory(badge.id)}
                        </Tag>
                      </Space>
                    ),
                  },
                  description: {
                    render: (_dom, badge) => (
                      <Space direction="vertical" size={2}>
                        <Text type="secondary">{badge.description}</Text>
                        <Text type="secondary">
                          {i18nT("ui.ethikos.trust.badges.earned_257f30")} {formatDate(i18nT, getBadgeDate(badge))}
                        </Text>
                      </Space>
                    ),
                  },
                  avatar: {
                    render: (_dom, badge) => (
                      <AntBadge
                        status={badge.earned ? 'success' : 'default'}
                        text={badge.earned ? i18nT("ui.ethikos.trust.badges.earned_257f30") : i18nT("ui.ethikos.trust.badges.locked")}
                      />
                    ),
                  },
                  actions: {
                    render: (_dom, badge) => [
                      <Typography.Link
                        key="details"
                        onClick={() => setDetail(badge)}
                      >
                        {i18nT("ui.ethikos.trust.badges.details")}
                      </Typography.Link>,
                    ],
                  },
                }}
              />
            )}
          </ProCard>

          <ProCard
            bordered
            title={i18nT("ui.ethikos.trust.badges.badgeCatalog")}
            extra={
              <Space wrap>
                <Input.Search
                  allowClear
                  size="small"
                  placeholder={i18nT("ui.ethikos.trust.badges.searchBadges")}
                  style={{ width: 220 }}
                  value={catalogSearch}
                  onChange={(event) => setCatalogSearch(event.target.value)}
                />

                <Select<CatalogCategoryFilter>
                  size="small"
                  value={catalogCategory}
                  style={{ width: 140 }}
                  onChange={setCatalogCategory}
                  options={[
                    { label: i18nT("ui.ethikos.trust.badges.allCategories"), value: 'All' },
                    { label: i18nT("ui.ethikos.trust.badges.stances"), value: 'Stances' },
                    { label: i18nT("ui.ethikos.trust.badges.arguments"), value: 'Arguments' },
                    { label: i18nT("ui.ethikos.trust.badges.voting"), value: 'Voting' },
                  ]}
                />

                <Select<CatalogShow>
                  size="small"
                  value={catalogShow}
                  style={{ width: 130 }}
                  onChange={setCatalogShow}
                  options={[
                    { label: i18nT("ui.ethikos.trust.badges.all"), value: 'all' },
                    { label: i18nT("ui.ethikos.trust.badges.earned_257f30"), value: 'earned' },
                    { label: i18nT("ui.ethikos.trust.badges.locked"), value: 'locked' },
                  ]}
                />
              </Space>
            }
          >
            {filteredCatalogRows.length === 0 ? (
              <Empty
                description={i18nT("ui.ethikos.trust.badges.noCatalogBadgesMatchTheCurrentFilters")}
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ) : (
              <ProList<CatalogRow>
                rowKey="id"
                dataSource={filteredCatalogRows}
                pagination={{
                  pageSize: 6,
                  showSizeChanger: false,
                }}
                metas={{
                  title: {
                    render: (_dom, row) => (
                      <Space wrap>
                        <Text strong>{row.label}</Text>
                        <Tag
                          color={BADGE_CATEGORY_META[row.id]?.color ?? 'default'}
                        >
                          {row.category}
                        </Tag>
                        {row.earned ? (
                          <Tag color="success">{i18nT("ui.ethikos.trust.badges.earned_257f30")}</Tag>
                        ) : (
                          <Tag>{i18nT("ui.ethikos.trust.badges.locked")}</Tag>
                        )}
                      </Space>
                    ),
                  },
                  description: {
                    render: (_dom, row) => (
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: '100%' }}
                      >
                        <Text type="secondary">{row.description}</Text>
                        <Text>{row.requirement}</Text>

                        {!row.earned && (
                          <Progress
                            size="small"
                            percent={row.progress}
                            status={row.progress > 0 ? 'active' : 'normal'}
                          />
                        )}

                        {row.earned && row.earnedAt && (
                          <Text type="secondary">
                            {i18nT("ui.ethikos.trust.badges.earned_257f30")} {formatDate(i18nT, row.earnedAt)}
                          </Text>
                        )}
                      </Space>
                    ),
                  },
                }}
              />
            )}
          </ProCard>

          <ProCard bordered title={i18nT("ui.ethikos.trust.badges.howBadgesAreUsed")}>
            <Paragraph type="secondary">
              {i18nT("ui.ethikos.trust.badges.badgesAreDerivedFromEthikosParticipationSignals")}
            </Paragraph>

            <Divider />

            <Space wrap>
              <Tag color="blue">{i18nT("ui.ethikos.trust.badges.stances")}</Tag>
              <Tag color="purple">{i18nT("ui.ethikos.trust.badges.arguments")}</Tag>
              <Tag color="green">{i18nT("ui.ethikos.trust.badges.voting")}</Tag>
            </Space>
          </ProCard>
        </Space>

        <Modal
          open={!!detail}
          title={detail ? getBadgeLabel(detail) : i18nT("ui.ethikos.trust.badges.badgeDetails")}
          footer={null}
          onCancel={() => setDetail(null)}
        >
          {detail && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space wrap>
                <Tag color={detailMeta?.color ?? 'default'}>
                  {detailMeta?.label ?? badgeCategory(detail.id)}
                </Tag>
                {detail.earned ? (
                  <Tag color="success">{i18nT("ui.ethikos.trust.badges.earned_257f30")}</Tag>
                ) : (
                  <Tag>{i18nT("ui.ethikos.trust.badges.locked")}</Tag>
                )}
              </Space>

              <Paragraph>{detail.description}</Paragraph>

              <div>
                <Text strong>{i18nT("ui.ethikos.trust.badges.progress")}</Text>
                <Progress percent={badgeProgressValue(detail)} />
              </div>

              <div>
                <Text strong>{i18nT("ui.ethikos.trust.badges.earnedDate")}</Text>
                <Paragraph type="secondary">
                  {formatDate(i18nT, getBadgeDate(detail))}
                </Paragraph>
              </div>
            </Space>
          )}
        </Modal>
      </PageContainer>
    </EthikosPageShell>
  );
}