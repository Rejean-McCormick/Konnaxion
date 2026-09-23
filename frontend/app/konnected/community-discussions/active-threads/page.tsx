// FILE: frontend/app/konnected/community-discussions/active-threads/page.tsx
﻿// C:\MyCode\Konnaxionv14\frontend\app\konnected\community-discussions\active-threads\page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  FireOutlined,
  MessageTwoTone,
  QuestionCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Empty,
  Input,
  List,
  Pagination,
  Select,
  Skeleton,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import { api } from '@/shared/api';

const { Text, Paragraph } = Typography;
const { Option } = Select;

// Real backend endpoints (joined with api baseURL)
const FORUM_TOPICS_ENDPOINT = 'konnected/forum-topics/';
const FORUM_POSTS_ENDPOINT = 'konnected/forum-posts/';

type TopicKind = 'question' | 'discussion';
type TopicStatus = 'open' | 'closed' | 'archived';

export interface ForumTopicSummary {
  id: string;
  title: string;
  category?: string | null;
  kind?: TopicKind | null; // question vs discussion
  status?: TopicStatus | null;
  tags?: string[];
  replies_count: number;
  participants_count?: number;
  last_activity_at: string;
  last_activity_by?: string | null;
  last_activity_snippet?: string | null;
  created_by_name?: string | null;
  created_by_avatar_url?: string | null;
  is_pinned?: boolean;
  is_unread?: boolean;
  linked_resource_title?: string | null; // if tied to a KnowledgeResource
}

interface ActiveThreadsResponse {
  results: ForumTopicSummary[];
  page: number;
  page_size: number;
  total: number;
}

// Shape returned by /api/konnected/forum-topics/
interface ForumTopicApi {
  id: number | string;
  title: string;
  category?: string | null;
  creator?: string | number | null;
  created_at: string;
  updated_at: string;
}

// Shape returned by /api/konnected/forum-posts/
interface ForumPostApi {
  id: number | string;
  topic: number | string;
  author?: string | number | null;
  content: string;
  created_at: string;
  updated_at: string;
}

/** Local UI state → query params mapping (purely client-side) */
type TopicFilter = 'all' | 'questions' | 'discussions';
type SortOption = 'recent' | 'most_replies' | 'most_active';

function useActiveThreads(params: {
  page: number;
  pageSize: number;
  search: string;
  topicFilter: TopicFilter;
  sort: SortOption;
}) {
  const queryState = useMemo(
    () => ({
      page: params.page,
      pageSize: params.pageSize,
      search: params.search.trim().toLowerCase(),
      topicFilter: params.topicFilter,
      sort: params.sort,
    }),
    [params.page, params.pageSize, params.search, params.topicFilter, params.sort],
  );

  return useQuery<ActiveThreadsResponse, Error>({
    queryKey: ['konnected-active-threads', queryState],
    staleTime: 60_000,
    queryFn: async () => {
      // Fetch raw topics and posts from the real backend.
      const [topicsRes, postsRes] = await Promise.all([
        api.get<ForumTopicApi[]>(FORUM_TOPICS_ENDPOINT),
        api.get<ForumPostApi[]>(FORUM_POSTS_ENDPOINT),
      ]);

      const topics = topicsRes.data ?? [];
      const posts = postsRes.data ?? [];

      // Aggregate per-topic stats from posts.
      const perTopicStats = new Map<
        number,
        { replies: number; lastActivityAt: string; lastActivityBy?: string | null }
      >();

      for (const post of posts) {
        const topicIdNum = Number(post.topic);
        if (!Number.isFinite(topicIdNum)) continue;

        const current = perTopicStats.get(topicIdNum) ?? {
          replies: 0,
          lastActivityAt: '',
          lastActivityBy: undefined,
        };

        const candidateTs = post.updated_at || post.created_at;
        const candidateTime = new Date(candidateTs).getTime();
        const existingTime = new Date(current.lastActivityAt || 0).getTime();

        if (!Number.isNaN(candidateTime) && candidateTime >= existingTime) {
          current.lastActivityAt = candidateTs;
          current.lastActivityBy =
            post.author != null ? String(post.author) : current.lastActivityBy;
        }

        current.replies += 1;
        perTopicStats.set(topicIdNum, current);
      }

      // Build forum summaries from topics + aggregated stats.
      let summaries: ForumTopicSummary[] = topics.map((topic) => {
        const topicIdNum = Number(topic.id);
        const stats = Number.isFinite(topicIdNum)
          ? perTopicStats.get(topicIdNum as number)
          : undefined;

        const creatorName =
          topic.creator != null ? String(topic.creator) : undefined;

        const lastActivityAt =
          stats?.lastActivityAt || topic.updated_at || topic.created_at;

        const inferredKind: TopicKind =
          topic.title?.trim().endsWith('?') ? 'question' : 'discussion';

        return {
          id: String(topic.id),
          title: topic.title,
          category: topic.category ?? null,
          kind: inferredKind,
          status: 'open',
          tags: undefined,
          replies_count: stats?.replies ?? 0,
          participants_count: undefined,
          last_activity_at: lastActivityAt,
          last_activity_by: stats?.lastActivityBy ?? creatorName ?? null,
          last_activity_snippet: undefined,
          created_by_name: creatorName ?? null,
          created_by_avatar_url: null,
          is_pinned: false,
          is_unread: false,
          linked_resource_title: null,
        };
      });

      // Client-side search filter.
      if (queryState.search) {
        summaries = summaries.filter((t) => {
          const haystack = `${t.title} ${t.category ?? ''}`.toLowerCase();
          return haystack.includes(queryState.search);
        });
      }

      // Thread type filter based on inferred kind.
      if (queryState.topicFilter === 'questions') {
        summaries = summaries.filter((t) => t.kind === 'question');
      } else if (queryState.topicFilter === 'discussions') {
        summaries = summaries.filter((t) => t.kind === 'discussion');
      }

      // Sorting.
      summaries.sort((a, b) => {
        if (queryState.sort === 'most_replies') {
          return (b.replies_count ?? 0) - (a.replies_count ?? 0);
        }
        if (queryState.sort === 'most_active') {
          const aMetric = (a.participants_count ?? 0) || a.replies_count;
          const bMetric = (b.participants_count ?? 0) || b.replies_count;
          return bMetric - aMetric;
        }

        // Default: most recent activity.
        const aTime = new Date(a.last_activity_at).getTime();
        const bTime = new Date(b.last_activity_at).getTime();
        return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
      });

      const total = summaries.length;
      const startIndex = (queryState.page - 1) * queryState.pageSize;
      const endIndex = startIndex + queryState.pageSize;
      const pageResults = summaries.slice(startIndex, endIndex);

      return {
        results: pageResults,
        page: queryState.page,
        page_size: queryState.pageSize,
        total,
      };
    },
  });
}

export default function ActiveThreadsPage() {
  const { t: i18nT } = useLanguage();
  const router = useRouter();

  // Paging + filters
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [pendingSearch, setPendingSearch] = useState('');
  const [topicFilter, setTopicFilter] = useState<TopicFilter>('all');
  const [sort, setSort] = useState<SortOption>('recent');

  const { data, isLoading, isFetching, isError, error, refetch } = useActiveThreads({
    page,
    pageSize,
    search,
    topicFilter,
    sort,
  });

  const threads = (data?.results ?? []) as ForumTopicSummary[];
  const total = data?.total ?? 0;

  const hasResults = threads.length > 0;

  const headerPrimaryAction = (
    <Button
      type="primary"
      icon={<QuestionCircleOutlined />}
      onClick={() =>
        router.push('/konnected/community-discussions/start-new-discussion')
      }
    >
      {i18nT("ui.konnected.communityDiscussions.activeThreads.startNewDiscussion")}
    </Button>
  );

  const headerSecondaryActions = (
    <Space>
      <Tooltip title={i18nT("ui.konnected.communityDiscussions.activeThreads.refreshActiveThreads")}>
        <Button icon={<ReloadOutlined />} onClick={() => refetch()} loading={isFetching} />
      </Tooltip>
    </Space>
  );

  const handleSearchSubmit = (value: string) => {
    setSearch(value.trim());
    setPage(1);
  };

  const handleClickThread = (topic: ForumTopicSummary) => {
    // NOTE: adjust route if your thread detail URL differs
    router.push(`/konnected/community-discussions/thread/${topic.id}`);
  };

  const renderHeaderFilters = () => (
    <Card style={{ marginBottom: 16 }}>
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%' }} wrap>
          <Input
            allowClear
            placeholder={i18nT("ui.konnected.communityDiscussions.activeThreads.searchByTitleCategoryOrKeyword")}
            prefix={<SearchOutlined />}
            value={pendingSearch}
            onChange={(e) => setPendingSearch(e.target.value)}
            onPressEnter={(e) =>
              handleSearchSubmit((e.target as HTMLInputElement).value)
            }
            style={{ maxWidth: 360 }}
          />
          <Button
            onClick={() => handleSearchSubmit(pendingSearch)}
            icon={<SearchOutlined />}
            type="default"
          >
            {i18nT("ui.konnected.communityDiscussions.activeThreads.search")}
          </Button>
        </Space>

        <Space wrap>
          <Space>
            <Text type="secondary">{i18nT("ui.konnected.communityDiscussions.activeThreads.threadType")}</Text>
            <Select<TopicFilter>
              value={topicFilter}
              onChange={(val) => {
                setTopicFilter(val);
                setPage(1);
              }}
              style={{ width: 180 }}
            >
              <Option value="all">{i18nT("ui.konnected.communityDiscussions.activeThreads.allThreads")}</Option>
              <Option value="questions">{i18nT("ui.konnected.communityDiscussions.activeThreads.questionsOnly")}</Option>
              <Option value="discussions">{i18nT("ui.konnected.communityDiscussions.activeThreads.openDiscussions")}</Option>
            </Select>
          </Space>

          <Space>
            <Text type="secondary">{i18nT("ui.konnected.communityDiscussions.activeThreads.sortBy")}</Text>
            <Select<SortOption>
              value={sort}
              onChange={(val) => {
                setSort(val);
                setPage(1);
              }}
              style={{ width: 200 }}
            >
              <Option value="recent">{i18nT("ui.konnected.communityDiscussions.activeThreads.mostRecentActivity")}</Option>
              <Option value="most_replies">{i18nT("ui.konnected.communityDiscussions.activeThreads.mostReplies")}</Option>
              <Option value="most_active">{i18nT("ui.konnected.communityDiscussions.activeThreads.mostParticipants")}</Option>
            </Select>
          </Space>
        </Space>

        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {i18nT("ui.konnected.communityDiscussions.activeThreads.activeThreadsShowsForumTopicsWithRecent")}
        </Paragraph>
      </Space>
    </Card>
  );

  const renderListItemMeta = (item: ForumTopicSummary) => {
    const lastActivity = new Date(item.last_activity_at);

    return (
      <Space direction="vertical" style={{ width: '100%' }} size={4}>
        <Space wrap>
          {item.is_pinned && (
            <Tag color="gold">
              <FireOutlined style={{ marginRight: 4 }} />
              {i18nT("ui.konnected.communityDiscussions.activeThreads.pinned")}
            </Tag>
          )}
          {item.kind === 'question' && (
            <Tag color="blue">
              <QuestionCircleOutlined style={{ marginRight: 4 }} />
              {i18nT("ui.konnected.communityDiscussions.activeThreads.question")}
            </Tag>
          )}
          {item.category && <Tag>{item.category}</Tag>}
          {item.tags?.map((tag) => (
            <Tag key={tag} bordered={false}>
              {tag}
            </Tag>
          ))}
        </Space>

        <Space align="center" style={{ justifyContent: 'space-between', width: '100%' }}>
          <Space wrap>
            <Space>
              <MessageTwoTone />
              <Text strong>{item.replies_count}</Text>
              <Text type="secondary">{i18nT("ui.konnected.communityDiscussions.activeThreads.replies")}</Text>
            </Space>
            {item.participants_count != null && (
              <Space>
                <TeamOutlined />
                <Text strong>{item.participants_count}</Text>
                <Text type="secondary">{i18nT("ui.konnected.communityDiscussions.activeThreads.participants")}</Text>
              </Space>
            )}
          </Space>

          <Space wrap>
            {item.status && (
              <Tag
                color={
                  item.status === 'open'
                    ? 'green'
                    : item.status === 'closed'
                    ? 'default'
                    : 'red'
                }
              >
                {item.status === 'open'
                  ? i18nT("ui.konnected.communityDiscussions.activeThreads.open")
                  : item.status === 'closed'
                  ? i18nT("ui.konnected.communityDiscussions.activeThreads.closed")
                  : i18nT("ui.konnected.communityDiscussions.activeThreads.archived")}
              </Tag>
            )}
            <Text type="secondary">
              {i18nT("ui.konnected.communityDiscussions.activeThreads.lastActivity")}{' '}
              {Number.isNaN(lastActivity.getTime())
                ? i18nT("ui.konnected.communityDiscussions.activeThreads.recently")
                : lastActivity.toLocaleString()}
              {item.last_activity_by ? i18nT("ui.konnected.communityDiscussions.activeThreads.by", { last_activity_by: item.last_activity_by }) : ''}
            </Text>
          </Space>
        </Space>

        {item.linked_resource_title && (
          <Text type="secondary">
            {i18nT("ui.konnected.communityDiscussions.activeThreads.linkedResource")} <strong>{item.linked_resource_title}</strong>
          </Text>
        )}

        {item.last_activity_snippet && (
          <Text type="secondary" ellipsis>
            “{item.last_activity_snippet}”
          </Text>
        )}
      </Space>
    );
  };

  const renderList = () => {
    if (isLoading && !data) {
      // Skeleton list while first load
      return (
        <Card>
          <List
            itemLayout="vertical"
            dataSource={[1, 2, 3, 4, 5]}
            renderItem={(key) => (
              <List.Item key={key}>
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </List.Item>
            )}
          />
        </Card>
      );
    }

    if (isError) {
      return (
        <Alert
          type="error"
          message={i18nT("ui.konnected.communityDiscussions.activeThreads.unableToLoadActiveThreads")}
          description={error?.message ?? i18nT("ui.konnected.communityDiscussions.activeThreads.anUnexpectedErrorOccurred")}
          showIcon
          action={
            <Button size="small" onClick={() => refetch()} icon={<ReloadOutlined />}>
              {i18nT("ui.konnected.communityDiscussions.activeThreads.retry")}
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      );
    }

    if (!hasResults) {
      return (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <>
                <div>{i18nT("ui.konnected.communityDiscussions.activeThreads.noActiveThreadsMatchYourFilters")}</div>
                <div>
                  {i18nT("ui.konnected.communityDiscussions.activeThreads.youCanAdjustFiltersOr")}{' '}
                  <Button
                    type="link"
                    onClick={() =>
                      router.push(
                        '/konnected/community-discussions/start-new-discussion',
                      )
                    }
                  >
                    {i18nT("ui.konnected.communityDiscussions.activeThreads.startANewDiscussion")}
                  </Button>
                  .
                </div>
              </>
            }
          />
        </Card>
      );
    }

    return (
      <Card>
        <List<ForumTopicSummary>
          itemLayout="vertical"
          dataSource={threads}
          rowKey={(item) => item.id}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleClickThread(item)}
              actions={[
                <Space key="stats">
                  <MessageTwoTone />
                  <Text>{item.replies_count} {i18nT("ui.konnected.communityDiscussions.activeThreads.replies")}</Text>
                  {item.participants_count != null && (
                    <>
                      <TeamOutlined />
                      <Text>{item.participants_count} {i18nT("ui.konnected.communityDiscussions.activeThreads.participants")}</Text>
                    </>
                  )}
                </Space>,
              ]}
              extra={
                item.is_unread ? (
                  <Badge status="processing" text={i18nT("ui.konnected.communityDiscussions.activeThreads.newActivity")} />
                ) : undefined
              }
            >
              <List.Item.Meta
                avatar={
                  <Avatar src={item.created_by_avatar_url ?? undefined}>
                    {item.created_by_name?.charAt(0) ?? '?'}
                  </Avatar>
                }
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    {item.is_pinned && (
                      <Tag color="gold" icon={<FireOutlined />}>
                        {i18nT("ui.konnected.communityDiscussions.activeThreads.pinned")}
                      </Tag>
                    )}
                  </Space>
                }
                description={
                  <Space
                    direction="vertical"
                    size={4}
                    style={{ width: '100%', marginTop: 4 }}
                  >
                    {item.created_by_name && (
                      <Text type="secondary">
                        {i18nT("ui.konnected.communityDiscussions.activeThreads.startedBy")} <strong>{item.created_by_name}</strong>
                      </Text>
                    )}
                    {renderListItemMeta(item)}
                  </Space>
                }
              />
            </List.Item>
          )}
        />

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={total}
            showSizeChanger={false}
            onChange={(p) => setPage(p)}
          />
        </div>
      </Card>
    );
  };

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.communityDiscussions.activeThreads.communityDiscussionsActiveThreads")}
      subtitle={i18nT("ui.konnected.communityDiscussions.activeThreads.subjectBasedForumsForLearnersAndEducators")}
      primaryAction={headerPrimaryAction}
      secondaryActions={headerSecondaryActions}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {renderHeaderFilters()}
        {renderList()}
      </Space>
    </KonnectedPageShell>
  );
}
