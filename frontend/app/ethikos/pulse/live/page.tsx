// app/ethikos/pulse/live/page.tsx
'use client';

/**
 * Updated implementation based on Ant Design / ProComponents plan:
 * - Keep KPI counters with sparkline charts
 * - Add live activity feed (topics, stances, arguments)
 * - Add "Open debates" table with last activity
 * - Wire into existing services/hooks and axios helper
 */

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
import { useInterval, useRequest } from 'ahooks';

import EthikosPageShell from '../../EthikosPageShell';
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
/*  Local data loaders                                                 */
/* ------------------------------------------------------------------ */

async function fetchRecentActivity(): Promise<FeedItem[]> {
  const [topics, stances, args] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<EthikosArgumentApi[]>('ethikos/arguments/'),
  ]);

  const topicById = new Map<number, EthikosTopicApi>(
    topics.map((t) => [t.id, t]),
  );

  const items: FeedItem[] = [
    // New or updated debates (use created + last_activity as signals)
    ...topics.map<FeedItem>((t) => ({
      id: `topic-${t.id}-${t.created_at}`,
      ts: t.created_at,
      kind: 'topic',
      topicId: t.id,
      title: t.title,
      summary:
        t.status === 'open'
          ? 'New debate created'
          : `Debate status changed to ${t.status}`,
    })),
    // Stances
    ...stances.map<FeedItem>((s) => ({
      id: `stance-${s.id}`,
      ts: s.timestamp,
      kind: 'stance',
      topicId: s.topic,
      title: topicById.get(s.topic)?.title ?? `Topic #${s.topic}`,
      summary: `New stance submitted: ${s.value >= 0 ? '+' : ''}${s.value}`,
      extra: { value: s.value },
    })),
    // Arguments
    ...args.map<FeedItem>((a) => ({
      id: `arg-${a.id}`,
      ts: a.created_at,
      kind: 'argument',
      topicId: a.topic,
      title: topicById.get(a.topic)?.title ?? `Topic #${a.topic}`,
      summary: `${a.user} commented: ${truncate(a.content, 120)}`,
    })),
  ];

  // Sort newest first and take a reasonable slice
  return items
    .sort((a, b) => dayjs(b.ts).valueOf() - dayjs(a.ts).valueOf())
    .slice(0, 20);
}

async function fetchOpenTopics(): Promise<EthikosTopicApi[]> {
  const topics = await get<EthikosTopicApi[]>('ethikos/topics/');
  return topics
    .filter((t) => t.status === 'open')
    .sort(
      (a, b) =>
        dayjs(b.last_activity).valueOf() - dayjs(a.last_activity).valueOf(),
    );
}

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

function truncate(s: string, n = 100) {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function PulseLive(): JSX.Element {
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null);

  // Counters (with 20s polling by default)
  const liveReq = useRequest<{ counters: LiveCounter[] }, []>(
    fetchPulseLiveData,
    {
      pollingInterval: autoRefresh ? 20_000 : undefined,
      onSuccess: () => setLastUpdated(dayjs().format('HH:mm:ss')),
    },
  );

  // Live activity feed (stances, arguments, topics)
  const feedReq = useRequest<FeedItem[], []>(fetchRecentActivity, {
    pollingInterval: autoRefresh ? 20_000 : undefined,
  });

  // Open debates table
  const openReq = useRequest<EthikosTopicApi[], []>(fetchOpenTopics, {
    pollingInterval: autoRefresh ? 30_000 : undefined,
  });

  // Manual refresh safety-net (kept from original)
  useInterval(() => {
    if (!autoRefresh) return;
    liveReq.refresh();
  }, 20_000);

  const refreshAll = React.useCallback(() => {
    liveReq.refresh();
    feedReq.refresh();
    openReq.refresh();
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
        render: (dom) =>
          dom === 'open' ? <Tag color="green">Open</Tag> : <Tag>{String(dom)}</Tag>,
      },
      {
        title: 'Last activity',
        dataIndex: 'last_activity',
        width: 180,
        render: (dom) => (
          <Tooltip title={dayjs(dom).format('YYYY-MM-DD HH:mm')}>
            {dayjs(dom).fromNow()}
          </Tooltip>
        ),
      },
      {
        title: 'Created',
        dataIndex: 'created_at',
        width: 160,
        render: (dom) => (
          <Tooltip title={dayjs(dom).format('YYYY-MM-DD HH:mm')}>
            {dayjs(dom).fromNow()}
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
        <span>Auto‑refresh</span>
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
      subtitle="Real‑time counters, latest activity, and currently open debates."
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={liveReq.loading && !counters.length}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Live view"
          description="This page auto‑refreshes every 20 seconds while enabled. Use manual Refresh if needed."
        />

        {/* KPI counters with sparkline charts */}
        <ProCard gutter={16} wrap>
          {counters.map((c) => {
            const trend = c.trend ?? 0;
            return (
              <StatisticCard
                key={c.label}
                colSpan={{ xs: 24, sm: 12, md: 12, lg: 6 }}
                statistic={{
                  title: (
                    <Space>
                      {c.label}
                      <Badge
                        status={trend > 0 ? 'success' : trend < 0 ? 'error' : 'default'}
                      />
                    </Space>
                  ),
                  value: c.value,
                  precision: 0,
                }}
                chart={
                  <ChartCard
                    type="line"
                    height={50}
                    data={c.history.map(({ ts, value }) => ({
                      x: ts,
                      y: value,
                    }))}
                  />
                }
              />
            );
          })}
        </ProCard>

        {/* Live activity feed + Open debates */}
        <ProCard gutter={[16, 16]} wrap style={{ marginTop: 16 }}>
          {/* Live activity feed */}
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

          {/* Open debates table */}
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
