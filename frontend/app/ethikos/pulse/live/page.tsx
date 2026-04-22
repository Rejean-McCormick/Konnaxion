// FILE: frontend/app/ethikos/pulse/live/page.tsx
'use client';

import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Button,
  Empty,
  List,
  Space,
  Switch,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ThunderboltOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  FireOutlined,
  MessageOutlined,
  ProfileOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import ChartCard from '@/components/charts/ChartCard';
import { fetchPulseLiveData, type LiveCounter } from '@/services/pulse';
import { get } from '@/services/_request';

dayjs.extend(relativeTime);

/* ------------------------------------------------------------------ */
/*  Minimal API DTOs (aligned with services/pulse.ts)                  */
/* ------------------------------------------------------------------ */

type TopicStatus = 'open' | 'closed' | 'archived';

type EthikosTopicApi = {
  id: number;
  title: string;
  status: TopicStatus;
  created_at: string;
  last_activity: string;
};

type EthikosStanceApi = {
  id: number;
  topic: number;
  value: number; // −3…+3
  timestamp: string;
};

type EthikosArgumentApi = {
  id: number;
  topic: number;
  user: string;
  content: string;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Types & helpers                                                    */
/* ------------------------------------------------------------------ */

type FeedItem =
  | {
      id: string;
      ts: string;
      kind: 'topic';
      topicId: number;
      title: string;
      summary: string;
    }
  | {
      id: string;
      ts: string;
      kind: 'stance';
      topicId: number;
      title: string;
      summary: string;
      extra: { value: number };
    }
  | {
      id: string;
      ts: string;
      kind: 'argument';
      topicId: number;
      title: string;
      summary: string;
    };

function truncate(value: string, max = 100): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

/* ------------------------------------------------------------------ */
/*  Local data loaders                                                 */
/* ------------------------------------------------------------------ */

async function fetchRecentActivity(): Promise<FeedItem[]> {
  const [topics, stances, args] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<EthikosArgumentApi[]>('ethikos/arguments/'),
  ]);

  const topicById = new Map<number, EthikosTopicApi>(
    topics.map((topic) => [topic.id, topic]),
  );

  const items: FeedItem[] = [
    ...topics.map<FeedItem>((topic) => ({
      id: `topic-${topic.id}-${topic.created_at}`,
      ts: topic.created_at,
      kind: 'topic',
      topicId: topic.id,
      title: topic.title,
      summary:
        topic.status === 'open'
          ? 'New debate created'
          : `Debate status changed to ${topic.status}`,
    })),
    ...stances.map<FeedItem>((stance) => ({
      id: `stance-${stance.id}`,
      ts: stance.timestamp,
      kind: 'stance',
      topicId: stance.topic,
      title: topicById.get(stance.topic)?.title ?? `Topic #${stance.topic}`,
      summary: `New stance submitted: ${stance.value >= 0 ? '+' : ''}${stance.value}`,
      extra: { value: stance.value },
    })),
    ...args.map<FeedItem>((argument) => ({
      id: `arg-${argument.id}`,
      ts: argument.created_at,
      kind: 'argument',
      topicId: argument.topic,
      title: topicById.get(argument.topic)?.title ?? `Topic #${argument.topic}`,
      summary: `${argument.user} commented: ${truncate(argument.content, 120)}`,
    })),
  ];

  return items
    .sort((a, b) => dayjs(b.ts).valueOf() - dayjs(a.ts).valueOf())
    .slice(0, 20);
}

async function fetchOpenTopics(): Promise<EthikosTopicApi[]> {
  const topics = await get<EthikosTopicApi[]>('ethikos/topics/');

  return topics
    .filter((topic) => topic.status === 'open')
    .sort(
      (a, b) =>
        dayjs(b.last_activity).valueOf() - dayjs(a.last_activity).valueOf(),
    );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PulseLive(): JSX.Element {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);

  const liveReq = useRequest<{ counters: LiveCounter[] }, []>(fetchPulseLiveData, {
    pollingInterval: autoRefresh ? 20_000 : undefined,
    onSuccess: () => setLastUpdated(dayjs().format('HH:mm:ss')),
  });

  const feedReq = useRequest<FeedItem[], []>(fetchRecentActivity, {
    pollingInterval: autoRefresh ? 20_000 : undefined,
  });

  const openReq = useRequest<EthikosTopicApi[], []>(fetchOpenTopics, {
    pollingInterval: autoRefresh ? 30_000 : undefined,
  });

  const refreshAll = React.useCallback(() => {
    void liveReq.refresh();
    void feedReq.refresh();
    void openReq.refresh();
  }, [liveReq, feedReq, openReq]);

  const counters = liveReq.data?.counters ?? [];

  const openColumns = React.useMemo<ProColumns<EthikosTopicApi>[]>(() => {
    return [
      {
        title: 'Debate',
        dataIndex: 'title',
        ellipsis: true,
        render: (dom, row) => (
          <Space size="small">
            <FireOutlined />
            <a href={`/ethikos/deliberate/${row.id}`}>{dom}</a>
          </Space>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 120,
        render: (_, row) =>
          row.status === 'open' ? (
            <Tag color="green">Open</Tag>
          ) : (
            <Tag>{row.status}</Tag>
          ),
      },
      {
        title: 'Last activity',
        dataIndex: 'last_activity',
        width: 180,
        render: (_, row) => (
          <Tooltip title={dayjs(row.last_activity).format('YYYY-MM-DD HH:mm')}>
            {dayjs(row.last_activity).fromNow()}
          </Tooltip>
        ),
      },
      {
        title: 'Created',
        dataIndex: 'created_at',
        width: 160,
        render: (_, row) => (
          <Tooltip title={dayjs(row.created_at).format('YYYY-MM-DD HH:mm')}>
            {dayjs(row.created_at).fromNow()}
          </Tooltip>
        ),
      },
    ];
  }, []);

  const secondaryActions = (
    <Space>
      {lastUpdated && (
        <Badge
          count={
            <Tooltip title={`Last refreshed at ${lastUpdated}`}>
              <ClockCircleOutlined style={{ color: '#52c41a' }} />
            </Tooltip>
          }
        />
      )}
      <Space size="small" align="center">
        <ThunderboltOutlined />
        <span>Auto-refresh</span>
        <Switch checked={autoRefresh} onChange={setAutoRefresh} size="small" />
      </Space>
      <Button icon={<SyncOutlined />} onClick={refreshAll} size="small">
        Refresh
      </Button>
    </Space>
  );

  const primaryAction = (
    <Button href="/ethikos/pulse/trends" type="primary">
      View opinion trends
    </Button>
  );

  return (
    <EthikosPageShell
      title="Pulse · Live participation"
      sectionLabel="Pulse"
      subtitle="Real-time counters, latest activity, and currently open debates."
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={liveReq.loading && !counters.length}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Live view"
          description="This page auto-refreshes every 20 seconds while enabled. Use manual Refresh if needed."
        />

        <ProCard gutter={16} wrap>
          {counters.map((counter) => {
            const trend = counter.trend ?? 0;

            return (
              <StatisticCard
                key={counter.label}
                colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
                statistic={{
                  title: (
                    <Space>
                      {counter.label}
                      <Badge
                        status={
                          trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'
                        }
                      />
                    </Space>
                  ),
                  value: counter.value,
                  precision: 0,
                }}
                chart={
                  <ChartCard
                    type="line"
                    height={50}
                    data={counter.history.map(({ ts, value }) => ({
                      x: ts,
                      y: value,
                    }))}
                  />
                }
              />
            );
          })}
        </ProCard>

        <ProCard gutter={[16, 16]} wrap style={{ marginTop: 16 }}>
          <ProCard
            colSpan={{ xs: 24, xl: 16 }}
            title={
              <Space>
                <MessageOutlined />
                <span>Live activity</span>
              </Space>
            }
            extra={
              <Typography.Text type="secondary">
                Latest 20 items across debates, stances, and comments
              </Typography.Text>
            }
            loading={feedReq.loading && !feedReq.data}
          >
            {feedReq.data && feedReq.data.length === 0 ? (
              <Empty description="No recent activity yet" />
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={feedReq.data ?? []}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      avatar={
                        item.kind === 'topic' ? (
                          <ProfileOutlined />
                        ) : item.kind === 'stance' ? (
                          <Tag color={item.extra.value >= 0 ? 'green' : 'red'}>
                            {item.extra.value >= 0 ? '+' : ''}
                            {item.extra.value}
                          </Tag>
                        ) : (
                          <MessageOutlined />
                        )
                      }
                      title={
                        <Space size="small" wrap>
                          <a href={`/ethikos/deliberate/${item.topicId}`}>
                            {item.title}
                          </a>
                          <Tag
                            color={
                              item.kind === 'topic'
                                ? 'blue'
                                : item.kind === 'stance'
                                  ? 'purple'
                                  : 'cyan'
                            }
                          >
                            {item.kind}
                          </Tag>
                        </Space>
                      }
                      description={
                        <Space size="small" wrap>
                          <span>{item.summary}</span>
                          <Typography.Text type="secondary">
                            · {dayjs(item.ts).fromNow()}
                          </Typography.Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, xl: 8 }}
            title={
              <Space>
                <FireOutlined />
                <span>Open debates</span>
              </Space>
            }
            loading={openReq.loading && !openReq.data}
          >
            {openReq.data && openReq.data.length === 0 ? (
              <Empty description="No open debates at the moment" />
            ) : (
              <ProTable<EthikosTopicApi>
                rowKey="id"
                columns={openColumns}
                dataSource={openReq.data ?? []}
                pagination={{ pageSize: 6 }}
                search={false}
                size="small"
                toolBarRender={false}
              />
            )}
          </ProCard>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}