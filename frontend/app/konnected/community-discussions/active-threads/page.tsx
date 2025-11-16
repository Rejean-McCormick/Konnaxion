// C:\MyCode\Konnaxionv14\frontend\app\konnected\community-discussions\active-threads\page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
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
import {
  FireOutlined,
  MessageTwoTone,
  QuestionCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/shared/api';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;

const ACTIVE_THREADS_ENDPOINT =
  '/api/konnected/community-discussions/active-threads';

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

/** Local UI state → query params mapping */
type TopicFilter = 'all' | 'questions' | 'discussions';
type SortOption = 'recent' | 'most_replies' | 'most_active';

function useActiveThreads(params: {
  page: number;
  pageSize: number;
  search: string;
  topicFilter: TopicFilter;
  sort: SortOption;
}) {
  const queryParams = useMemo(() => {
    const base: Record<string, string | number | undefined> = {
      page: params.page,
      page_size: params.pageSize,
      q: params.search.trim() || undefined,
      sort:
        params.sort === 'recent'
          ? 'last_activity_desc'
          : params.sort === 'most_replies'
          ? 'replies_desc'
          : 'participants_desc',
    };

    if (params.topicFilter === 'questions') {
      base.kind = 'question';
    } else if (params.topicFilter === 'discussions') {
      base.kind = 'discussion';
    }

    return base;
  }, [params.page, params.pageSize, params.search, params.topicFilter, params.sort]);

  return useQuery<ActiveThreadsResponse, Error, ActiveThreadsResponse, [string, typeof queryParams]>({
    queryKey: ['konnected-active-threads', queryParams],
    staleTime: 60_000,
    queryFn: async () => {
      const res = await api.get<ActiveThreadsResponse>(ACTIVE_THREADS_ENDPOINT, {
        params: queryParams,
      });
      // FIX: api.get returns an AxiosResponse; we need the data payload
      return res.data;
    },
  });
}

export default function ActiveThreadsPage() {
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
      Start new discussion
    </Button>
  );

  const headerSecondaryActions = (
    <Space>
      <Tooltip title="Refresh active threads">
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
            placeholder="Search by title, category, or keyword"
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
            Search
          </Button>
        </Space>

        <Space wrap>
          <Space>
            <Text type="secondary">Thread type:</Text>
            <Select<TopicFilter>
              value={topicFilter}
              onChange={(val) => {
                setTopicFilter(val);
                setPage(1);
              }}
              style={{ width: 180 }}
            >
              <Option value="all">All threads</Option>
              <Option value="questions">Questions only</Option>
              <Option value="discussions">Open discussions</Option>
            </Select>
          </Space>

          <Space>
            <Text type="secondary">Sort by:</Text>
            <Select<SortOption>
              value={sort}
              onChange={(val) => {
                setSort(val);
                setPage(1);
              }}
              style={{ width: 200 }}
            >
              <Option value="recent">Most recent activity</Option>
              <Option value="most_replies">Most replies</Option>
              <Option value="most_active">Most participants</Option>
            </Select>
          </Space>
        </Space>

        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          Active Threads shows forum topics with recent replies and engagement across
          KonnectED’s knowledge forums. Use filters to focus on questions needing
          answers or heavily active thematic discussions.
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
              Pinned
            </Tag>
          )}
          {item.kind === 'question' && (
            <Tag color="blue">
              <QuestionCircleOutlined style={{ marginRight: 4 }} />
              Question
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
              <Text type="secondary">replies</Text>
            </Space>
            {item.participants_count != null && (
              <Space>
                <TeamOutlined />
                <Text strong>{item.participants_count}</Text>
                <Text type="secondary">participants</Text>
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
                  ? 'Open'
                  : item.status === 'closed'
                  ? 'Closed'
                  : 'Archived'}
              </Tag>
            )}
            <Text type="secondary">
              Last activity{' '}
              {Number.isNaN(lastActivity.getTime())
                ? 'recently'
                : lastActivity.toLocaleString()}
              {item.last_activity_by ? ` • by ${item.last_activity_by}` : ''}
            </Text>
          </Space>
        </Space>

        {item.linked_resource_title && (
          <Text type="secondary">
            Linked resource: <strong>{item.linked_resource_title}</strong>
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
          message="Unable to load active threads"
          description={error?.message ?? 'An unexpected error occurred.'}
          showIcon
          action={
            <Button size="small" onClick={() => refetch()} icon={<ReloadOutlined />}>
              Retry
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
                <div>No active threads match your filters.</div>
                <div>
                  You can adjust filters or{' '}
                  <Button
                    type="link"
                    onClick={() =>
                      router.push(
                        '/konnected/community-discussions/start-new-discussion',
                      )
                    }
                  >
                    start a new discussion
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
                  <Text>{item.replies_count} replies</Text>
                  {item.participants_count != null && (
                    <>
                      <TeamOutlined />
                      <Text>{item.participants_count} participants</Text>
                    </>
                  )}
                </Space>,
              ]}
              extra={
                item.is_unread ? (
                  <Badge status="processing" text="New activity" />
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
                        Pinned
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
                        Started by <strong>{item.created_by_name}</strong>
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
      title="Community Discussions – Active Threads"
      subtitle="Subject-based forums for learners and educators. These threads show recent activity across KonnectED’s thematic forums."
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
