'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Alert,
  App,
  Button,
  Card,
  Divider,
  Empty,
  Input,
  List,
  Progress,
  Slider,
  Space,
  Statistic,
  Tabs,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useParams } from 'next/navigation';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { get, post } from '@/services/_request';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

type TopicStatus = 'open' | 'closed' | 'archived';

interface EthikosCategoryApi {
  id: number;
  name: string;
  description?: string | null;
}

interface EthikosTopicApi {
  id: number;
  title: string;
  description: string;
  status: TopicStatus;
  total_votes?: number | null;
  last_activity: string;
  created_at: string;
  category?: EthikosCategoryApi | null;
  created_by?: string;
}

interface EthikosArgumentApi {
  id: number;
  topic: number;
  user: string;
  content: string;
  parent?: number | null;
  parent_id?: number | null;
  side?: 'pro' | 'con' | null;
  is_hidden?: boolean;
  created_at: string;
  updated_at?: string;
}

interface EthikosStancePoint {
  id: number;
  topic: number;
  value: number;
  timestamp: string;
  user?: string;
}

interface UserMeApi {
  username: string;
  name: string | null;
  email: string;
  url: string;
}

type Statement = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  parentId: string | null;
};

type TopicPageData = {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: string;
  status: TopicStatus;
  statements: Statement[];
  latest: Array<{
    id: string;
    author: string;
    body: string;
    createdAt: string;
  }>;
};

interface StanceStats {
  total: number;
  average: number;
  positive: number;
  neutral: number;
  negative: number;
  counts: Record<number, number>;
}

function toTopicId(topicId: string): number {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid topic id: ${topicId}`);
  }
  return numericId;
}

function clampStance(value: number): number {
  return Math.max(-3, Math.min(3, value));
}

function sortByCreatedDesc<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function sortByCreatedAsc<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

function computeStanceStats(stances: EthikosStancePoint[]): StanceStats {
  const counts: Record<number, number> = {
    [-3]: 0,
    [-2]: 0,
    [-1]: 0,
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  };

  let total = 0;
  let sum = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const stance of stances) {
    const value = clampStance(stance.value);
    counts[value] = (counts[value] ?? 0) + 1;
    total += 1;
    sum += value;

    if (value > 0) positive += 1;
    else if (value < 0) negative += 1;
    else neutral += 1;
  }

  return {
    total,
    average: total > 0 ? sum / total : 0,
    positive,
    neutral,
    negative,
    counts,
  };
}

function stanceLabel(value: number): string {
  switch (value) {
    case -3:
      return 'Strongly against';
    case -2:
      return 'Moderately against';
    case -1:
      return 'Somewhat against';
    case 0:
      return 'Neutral / undecided';
    case 1:
      return 'Somewhat for';
    case 2:
      return 'Moderately for';
    case 3:
      return 'Strongly for';
    default:
      return 'Neutral / undecided';
  }
}

async function fetchTopicPageData(topicId: string): Promise<TopicPageData> {
  const numericId = toTopicId(topicId);

  const [topic, rawArguments] = await Promise.all([
    get<EthikosTopicApi>(`ethikos/topics/${numericId}/`),
    get<EthikosArgumentApi[]>('ethikos/arguments/', {
      params: { topic: numericId },
    }),
  ]);

  const argumentsList = (rawArguments ?? []).filter((arg) => !arg.is_hidden);

  const statements = sortByCreatedAsc(argumentsList).map((arg) => ({
    id: String(arg.id),
    author: arg.user,
    body: arg.content,
    createdAt: arg.created_at,
    parentId:
      arg.parent != null
        ? String(arg.parent)
        : arg.parent_id != null
          ? String(arg.parent_id)
          : null,
  }));

  const latest = sortByCreatedDesc(argumentsList)
    .slice(0, 5)
    .map((arg) => ({
      id: String(arg.id),
      author: arg.user,
      body: arg.content,
      createdAt: arg.created_at,
    }));

  return {
    id: String(topic.id),
    title: topic.title,
    description: topic.description,
    category: topic.category?.name ?? '',
    createdAt: topic.created_at,
    status: topic.status,
    statements,
    latest,
  };
}

async function fetchTopicStances(topicId: string): Promise<EthikosStancePoint[]> {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) return [];

  return get<EthikosStancePoint[]>('ethikos/stances/', {
    params: { topic: numericId },
  });
}

async function submitTopicStance(topicId: string, value: number): Promise<void> {
  const numericId = toTopicId(topicId);

  await post('ethikos/stances/', {
    topic: numericId,
    value: clampStance(value),
  });
}

async function submitTopicArgument(topicId: string, content: string): Promise<void> {
  const numericId = toTopicId(topicId);

  await post('ethikos/arguments/', {
    topic: numericId,
    content,
  });
}

export default function TopicThreadPage(): JSX.Element {
  const { message } = App.useApp();

  const params = useParams<{ topic: string }>();
  const topicId = useMemo(() => {
    const raw = params?.topic;
    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  }, [params]);

  const {
    data: pageData,
    loading: loadingPageData,
    refresh: refreshPageData,
  } = useRequest<TopicPageData, []>(() => fetchTopicPageData(topicId!), {
    ready: !!topicId,
    refreshDeps: [topicId],
  });

  const {
    data: stances,
    loading: loadingStances,
    refresh: refreshStances,
  } = useRequest<EthikosStancePoint[], []>(() => fetchTopicStances(topicId!), {
    ready: !!topicId,
    refreshDeps: [topicId],
  });

  const { data: me } = useRequest<UserMeApi, []>(
    () => get<UserMeApi>('users/me/'),
    {
      ready: !!topicId,
    },
  );

  const [stanceValue, setStanceValue] = useState<number>(0);
  const [hydratedTopicId, setHydratedTopicId] = useState<string | null>(null);
  const [savingStance, setSavingStance] = useState(false);

  const [newArgument, setNewArgument] = useState('');
  const [savingArgument, setSavingArgument] = useState(false);

  useEffect(() => {
    setHydratedTopicId(null);
    setStanceValue(0);
  }, [topicId]);

  useEffect(() => {
    if (!topicId || hydratedTopicId === topicId || !me || !stances) return;

    const mine = stances.find((stance) => stance.user === me.username);
    setStanceValue(mine ? clampStance(mine.value) : 0);
    setHydratedTopicId(topicId);
  }, [topicId, hydratedTopicId, me, stances]);

  const stats = useMemo<StanceStats>(
    () => computeStanceStats(stances ?? []),
    [stances],
  );

  const loading = loadingPageData || loadingStances;

  const handleSaveStance = async (): Promise<void> => {
    if (!topicId) return;

    setSavingStance(true);
    try {
      await submitTopicStance(topicId, stanceValue);
      await refreshStances();
      message.success('Your stance has been recorded.');
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : 'Unable to save your stance right now.',
      );
    } finally {
      setSavingStance(false);
    }
  };

  const handlePostArgument = async (): Promise<void> => {
    if (!topicId) return;

    const trimmed = newArgument.trim();
    if (!trimmed) {
      message.warning('Please enter an argument before posting.');
      return;
    }

    setSavingArgument(true);
    try {
      await submitTopicArgument(topicId, trimmed);
      setNewArgument('');
      await refreshPageData();
      message.success('Your argument has been added.');
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : 'Unable to post your argument right now.',
      );
    } finally {
      setSavingArgument(false);
    }
  };

  if (!topicId) {
    return (
      <EthikosPageShell title="Deliberate · Topic" sectionLabel="Deliberate">
        <PageContainer ghost>
          <Empty description="Missing topic id" />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  if (!loading && !pageData) {
    return (
      <EthikosPageShell title="Deliberate · Topic" sectionLabel="Deliberate">
        <PageContainer ghost>
          <Empty description="Topic not found" />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  return (
    <EthikosPageShell
      title={pageData?.title ?? 'Deliberate · Topic'}
      sectionLabel="Deliberate"
      subtitle={
        pageData?.category
          ? `Category: ${pageData.category}`
          : 'Threaded debate with stance tracking on the −3…+3 scale.'
      }
    >
      <PageContainer ghost loading={loading}>
        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          <ProCard colSpan={{ xs: 24, md: 8 }}>
            <Statistic title="Total stances" value={stats.total} />
          </ProCard>
          <ProCard colSpan={{ xs: 24, md: 8 }}>
            <Statistic
              title="Average stance"
              value={Number(stats.average.toFixed(2))}
            />
          </ProCard>
          <ProCard colSpan={{ xs: 24, md: 8 }}>
            <Statistic
              title="Arguments"
              value={pageData?.statements.length ?? 0}
            />
          </ProCard>
        </ProCard>

        <Tabs
          items={[
            {
              key: 'thread',
              label: 'Thread',
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {pageData?.statements.length ? (
                    <ProCard title="Statements thread" ghost>
                      <Timeline
                        items={pageData.statements.map((statement) => ({
                          key: statement.id,
                          children: (
                            <StatementTimelineItem statement={statement} />
                          ),
                        }))}
                      />
                    </ProCard>
                  ) : (
                    <Empty description="No arguments yet" />
                  )}

                  <Card title="Add your argument">
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                        Keep your contribution concrete, evidence-based, and relevant
                        to the topic.
                      </Paragraph>

                      <TextArea
                        rows={5}
                        value={newArgument}
                        onChange={(e) => setNewArgument(e.target.value)}
                        placeholder="Write your argument here…"
                      />

                      <Space>
                        <Button
                          type="primary"
                          onClick={() => void handlePostArgument()}
                          loading={savingArgument}
                        >
                          Post argument
                        </Button>
                        <Button onClick={() => setNewArgument('')}>
                          Clear
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </Space>
              ),
            },
            {
              key: 'stance',
              label: 'Stance',
              children: (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Your stance"
                    description="Move the slider from strongly against (−3) to strongly for (+3), then save."
                  />

                  <Card>
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      <div>
                        <Title level={4} style={{ marginBottom: 8 }}>
                          {stanceLabel(stanceValue)}
                        </Title>
                        <Text type="secondary">Current value: {stanceValue}</Text>
                      </div>

                      <Slider
                        min={-3}
                        max={3}
                        step={1}
                        marks={{
                          [-3]: '-3',
                          [-2]: '-2',
                          [-1]: '-1',
                          0: '0',
                          1: '1',
                          2: '2',
                          3: '3',
                        }}
                        value={stanceValue}
                        onChange={(value) => {
                          if (typeof value === 'number') {
                            setStanceValue(value);
                          }
                        }}
                      />

                      <Space>
                        <Button
                          type="primary"
                          onClick={() => void handleSaveStance()}
                          loading={savingStance}
                        >
                          Save stance
                        </Button>
                      </Space>
                    </Space>
                  </Card>

                  <ProCard gutter={[16, 16]} wrap>
                    {([-3, -2, -1, 0, 1, 2, 3] as const).map((value) => {
                      const count = stats.counts[value] ?? 0;
                      const percent =
                        stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;

                      return (
                        <ProCard
                          key={value}
                          colSpan={{ xs: 24, sm: 12, md: 8, xl: 6 }}
                        >
                          <Space
                            direction="vertical"
                            size="small"
                            style={{ width: '100%' }}
                          >
                            <Text strong>
                              {value > 0 ? `+${value}` : value} · {stanceLabel(value)}
                            </Text>
                            <Progress percent={percent} />
                            <Text type="secondary">
                              {count} stance{count === 1 ? '' : 's'}
                            </Text>
                          </Space>
                        </ProCard>
                      );
                    })}
                  </ProCard>
                </Space>
              ),
            },
            {
              key: 'preview',
              label: 'Preview',
              children: pageData ? (
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <Card>
                    <Space direction="vertical" size="small">
                      <Title level={4} style={{ marginBottom: 0 }}>
                        {pageData.title}
                      </Title>
                      <Space wrap>
                        {pageData.category && <Tag>{pageData.category}</Tag>}
                        <Text type="secondary">
                          Opened {dayjs(pageData.createdAt).format('YYYY-MM-DD HH:mm')}
                        </Text>
                      </Space>
                    </Space>
                  </Card>

                  <Card title="Latest highlights" bodyStyle={{ padding: 0 }}>
                    {pageData.latest.length ? (
                      <List
                        dataSource={pageData.latest}
                        renderItem={(statement) => (
                          <List.Item key={statement.id}>
                            <StatementComment
                              author={statement.author}
                              datetime={dayjs(statement.createdAt).fromNow()}
                              body={statement.body}
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <Empty description="No highlights yet" />
                    )}
                  </Card>
                </Space>
              ) : (
                <Empty description="No preview available" />
              ),
            },
          ]}
        />

        <Divider />

        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          This thread uses the canonical Ethikos stance scale from −3 to +3 and
          stores arguments and stances directly against the topic.
        </Paragraph>
      </PageContainer>
    </EthikosPageShell>
  );
}

function StatementTimelineItem({
  statement,
}: {
  statement: Statement;
}): JSX.Element {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <Text strong>{statement.author}</Text>
        <Text type="secondary">
          {dayjs(statement.createdAt).format('YYYY-MM-DD HH:mm')}
        </Text>
      </div>

      <Paragraph style={{ marginTop: 4, marginBottom: 0, whiteSpace: 'pre-wrap' }}>
        {statement.body}
      </Paragraph>

      {statement.parentId && (
        <Text type="secondary">Reply to #{statement.parentId}</Text>
      )}
    </div>
  );
}

function StatementComment({
  author,
  datetime,
  body,
}: {
  author: React.ReactNode;
  datetime?: React.ReactNode;
  body: React.ReactNode;
}): JSX.Element {
  return (
    <div style={{ padding: '12px 0' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 4,
        }}
      >
        {author && <Text strong>{author}</Text>}
        {datetime && (
          <Text type="secondary" style={{ marginLeft: 'auto' }}>
            {datetime}
          </Text>
        )}
      </div>

      <Paragraph style={{ marginBottom: 0, whiteSpace: 'pre-wrap' }}>
        {body}
      </Paragraph>
    </div>
  );
}