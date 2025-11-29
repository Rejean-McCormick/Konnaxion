// FILE: frontend/app/ethikos/deliberate/[topic]/page.tsx
// C:\MyCode\Konnaxionv14\frontend\app\ethikos\deliberate\[topic]\page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Alert,
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
  message,
} from 'antd';
import { useParams } from 'next/navigation';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchTopicDetail,
  fetchTopicPreview,
  type TopicDetailResponse,
  type TopicPreviewResponse,
} from '@/services/deliberate';
import { get, post } from '@/services/_request';

dayjs.extend(relativeTime);

const { Title, Paragraph, Text } = Typography;
const { TextArea } = Input;

/* ------------------------------------------------------------------ */
/*  Local types                                                        */
/* ------------------------------------------------------------------ */

type Preview = TopicPreviewResponse;
type TopicDetail = TopicDetailResponse;
type Statement = TopicDetail['statements'][number];

interface EthikosStancePoint {
  id: number;
  topic: number;
  value: number; // -3 … +3
  timestamp: string;
  user?: string;
}

interface UserMeApi {
  username: string;
  name: string | null;
  email: string;
  url: string;
}

interface StanceStats {
  total: number;
  average: number;
  positive: number;
  neutral: number;
  negative: number;
  counts: Record<number, number>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

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

  for (const s of stances) {
    const v = Math.max(-3, Math.min(3, s.value));
    counts[v] = (counts[v] ?? 0) + 1;
    total += 1;
    sum += v;

    if (v > 0) positive += 1;
    else if (v < 0) negative += 1;
    else neutral += 1;
  }

  const average = total > 0 ? sum / total : 0;

  return {
    total,
    average,
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

async function fetchTopicStances(topicId: string): Promise<EthikosStancePoint[]> {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) return [];
  return get<EthikosStancePoint[]>('ethikos/stances/', {
    params: { topic: numericId },
  });
}

async function submitTopicStance(topicId: string, value: number): Promise<void> {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid topic id: ${topicId}`);
  }
  await post('ethikos/stances/', {
    topic: numericId,
    value,
  });
}

async function submitTopicArgument(topicId: string, content: string): Promise<void> {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid topic id: ${topicId}`);
  }
  await post('ethikos/arguments/', {
    topic: numericId,
    content,
  });
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function TopicThreadPage() {
  const params = useParams<{ topic: string }>();
  const topicParam = params?.topic;
  const topicId =
    typeof topicParam === 'string'
      ? topicParam
      : Array.isArray(topicParam)
      ? topicParam[0]
      : undefined;

  // Topic meta (title, category, opened at, latest)
  const {
    data: preview,
    loading: loadingPreview,
  } = useRequest<Preview, []>(
    () => fetchTopicPreview(topicId!),
    {
      ready: !!topicId,
      refreshDeps: [topicId],
    },
  );

  // Full statements thread
  const {
    data: detail,
    loading: loadingDetail,
    refresh: refreshDetail,
  } = useRequest<TopicDetail, []>(
    () => fetchTopicDetail(topicId!),
    {
      ready: !!topicId,
      refreshDeps: [topicId],
    },
  );

  // All stances for this topic
  const {
    data: stances,
    loading: loadingStances,
    refresh: refreshStances,
  } = useRequest<EthikosStancePoint[], []>(
    () => fetchTopicStances(topicId!),
    {
      ready: !!topicId,
      refreshDeps: [topicId],
    },
  );

  // Current user (for pre-filling their stance)
  const { data: me } = useRequest<UserMeApi, []>(() => get<UserMeApi>('users/me/'));

  const [stanceValue, setStanceValue] = useState<number>(0);
  const [stanceHydrated, setStanceHydrated] = useState(false);
  const [savingStance, setSavingStance] = useState(false);

  const [newArgument, setNewArgument] = useState('');
  const [savingArgument, setSavingArgument] = useState(false);

  // Initialize slider from existing stance once
  useEffect(() => {
    if (stanceHydrated) return;
    if (!me || !stances) return;

    const my = stances.find((s) => s.user === me.username);
    if (my) {
      setStanceValue(Math.max(-3, Math.min(3, my.value)));
    }
    setStanceHydrated(true);
  }, [me, stances, stanceHydrated]);

  const stanceStats = useMemo(
    () => computeStanceStats(stances ?? []),
    [stances],
  );

  const sortedStatements = useMemo(() => {
    const items = detail?.statements ?? [];
    return [...items].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }, [detail?.statements]);

  const sliderMarks: Record<number, React.ReactNode> = {
    [-3]: '−3',
    [-2]: '',
    [-1]: '−1',
    0: '0',
    1: '+1',
    2: '',
    3: '+3',
  };

  const handleSubmitStance = async () => {
    if (!topicId) return;
    setSavingStance(true);
    try {
      await submitTopicStance(topicId, stanceValue);
      message.success('Stance saved');
      await refreshStances();
    } catch (err) {
      message.error('Could not save your stance. Please try again.');
    } finally {
      setSavingStance(false);
    }
  };

  const handleSubmitArgument = async () => {
    if (!topicId) return;
    const body = newArgument.trim();
    if (!body) return;

    setSavingArgument(true);
    try {
      await submitTopicArgument(topicId, body);
      message.success('Argument posted');
      setNewArgument('');
      await refreshDetail();
    } catch (err) {
      message.error('Could not post your argument. Please try again.');
    } finally {
      setSavingArgument(false);
    }
  };

  if (!topicId) {
    return (
      <EthikosPageShell
        title="Deliberation thread"
        sectionLabel="Deliberate"
        subtitle="Nuanced stance‑taking and structured arguments on a single question."
      >
        <PageContainer ghost>
          <Empty description="No topic specified" />
        </PageContainer>
      </EthikosPageShell>
    );
  }

  const shellTitle = preview?.title ?? 'Deliberation thread';
  const shellSubtitle = preview
    ? 'Nuanced stance‑taking and structured arguments on this topic.'
    : 'Nuanced stance‑taking and structured arguments on a single question.';

  return (
    <EthikosPageShell
      title={shellTitle}
      sectionLabel="Deliberate"
      subtitle={shellSubtitle}
    >
      <PageContainer ghost loading={loadingPreview && !preview}>
        {preview ? (
          <>
            <Title level={3} style={{ marginTop: 0 }}>
              {preview.title}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 24 }}>
              {preview.category ? `${preview.category} · ` : ''}
              {preview.createdAt ? dayjs(preview.createdAt).fromNow() : null}
            </Paragraph>

            <ProCard gutter={16} wrap>
              {/* Left column: stance capture + summary */}
              <ProCard colSpan={{ xs: 24, md: 8 }} bordered split="horizontal">
                <ProCard title="Your stance" bordered={false}>
                  <Paragraph type="secondary">
                    Use the scale below to register how strongly you are for or against this topic.
                    You can update your stance as the debate evolves.
                  </Paragraph>

                  <div style={{ marginTop: 16 }}>
                    <Slider
                      min={-3}
                      max={3}
                      step={1}
                      dots
                      marks={sliderMarks}
                      value={stanceValue}
                      tooltip={{
                        formatter: (v) =>
                          typeof v === 'number' ? stanceLabel(v) : '',
                      }}
                      onChange={(v) => setStanceValue(v as number)}
                    />
                    <Space
                      style={{
                        marginTop: 8,
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                    >
                      <Text type="secondary">Strongly against</Text>
                      <Text type="secondary">Neutral</Text>
                      <Text type="secondary">Strongly for</Text>
                    </Space>

                    <Paragraph style={{ marginTop: 8 }}>
                      Current selection:{' '}
                      <Text strong>{stanceLabel(stanceValue)}</Text>
                    </Paragraph>

                    <Space style={{ marginTop: 8 }}>
                      <Button
                        type="primary"
                        onClick={handleSubmitStance}
                        loading={savingStance}
                      >
                        Save stance
                      </Button>
                      <Button
                        onClick={() => setStanceValue(0)}
                        disabled={savingStance}
                      >
                        Reset to neutral
                      </Button>
                    </Space>

                    <Alert
                      style={{ marginTop: 16 }}
                      type="info"
                      showIcon
                      message="One stance per topic"
                      description="You can adjust your position at any time; only your latest stance is used in the consensus."
                    />
                  </div>
                </ProCard>

                <ProCard title="Collective stance" bordered={false}>
                  <Paragraph type="secondary">
                    Snapshot of all recorded stances on this topic.
                  </Paragraph>

                  <Space
                    size="large"
                    style={{ marginTop: 16, flexWrap: 'wrap' }}
                  >
                    <Statistic
                      title="Participants"
                      value={stanceStats.total}
                      loading={loadingStances}
                    />
                    <Statistic
                      title="Average stance"
                      value={stanceStats.average}
                      precision={2}
                      loading={loadingStances}
                    />
                    <Statistic
                      title="For / Against balance"
                      value={
                        stanceStats.total > 0
                          ? Math.round(
                              (1 -
                                Math.abs(
                                  stanceStats.positive - stanceStats.negative,
                                ) /
                                  stanceStats.total) *
                                100,
                            )
                          : 100
                      }
                      suffix="%"
                      loading={loadingStances}
                    />
                  </Space>

                  <Divider />

                  {stanceStats.total > 0 ? (
                    <Space
                      direction="vertical"
                      style={{ width: '100%' }}
                      size="small"
                    >
                      <div>
                        <Text>For</Text>
                        <Progress
                          percent={Math.round(
                            (stanceStats.positive / stanceStats.total) * 100,
                          )}
                          showInfo
                        />
                      </div>
                      <div>
                        <Text>Neutral</Text>
                        <Progress
                          percent={Math.round(
                            (stanceStats.neutral / stanceStats.total) * 100,
                          )}
                          showInfo
                        />
                      </div>
                      <div>
                        <Text>Against</Text>
                        <Progress
                          percent={Math.round(
                            (stanceStats.negative / stanceStats.total) * 100,
                          )}
                          showInfo
                        />
                      </div>

                      <Paragraph style={{ marginTop: 8 }}>
                        <Tag color="geekblue">−3 … +3 scale</Tag>{' '}
                        <Text type="secondary">
                          0 = neutral; negative values = against; positive values
                          = for.
                        </Text>
                      </Paragraph>
                    </Space>
                  ) : (
                    <Empty
                      description="No stances recorded yet"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      style={{ marginTop: 16 }}
                    />
                  )}
                </ProCard>
              </ProCard>

              {/* Right column: debate thread + contribution form */}
              <ProCard colSpan={{ xs: 24, md: 16 }} bordered split="horizontal">
                <ProCard title="Debate thread" bordered={false}>
                  {detail?.statements?.length ? (
                    <Tabs
                      defaultActiveKey="timeline"
                      items={[
                        {
                          key: 'timeline',
                          label: 'Timeline',
                          children: (
                            <Timeline
                              items={detail.statements.map((s) => ({
                                key: s.id,
                                children: <StatementTimelineItem statement={s} />,
                              }))}
                            />
                          ),
                        },
                        {
                          key: 'list',
                          label: 'List view',
                          children: (
                            <List<Statement>
                              dataSource={sortedStatements}
                              loading={loadingDetail && !detail}
                              locale={{
                                emptyText: (
                                  <Empty description="No arguments yet" />
                                ),
                              }}
                              renderItem={(s) => (
                                <li key={s.id}>
                                  <StatementComment
                                    author={s.author}
                                    datetime={dayjs(s.createdAt).fromNow()}
                                    body={s.body}
                                  />
                                </li>
                              )}
                            />
                          ),
                        },
                      ]}
                    />
                  ) : loadingDetail ? (
                    <Card loading />
                  ) : (
                    <Empty description="No arguments yet" />
                  )}
                </ProCard>

                <ProCard title="Add an argument" bordered={false}>
                  <Paragraph type="secondary">
                    Contribute a concise, evidence-based argument. Links and
                    sources are encouraged; personal attacks are not allowed.
                  </Paragraph>

                  <TextArea
                    rows={4}
                    placeholder="Write your argument…"
                    value={newArgument}
                    onChange={(e) => setNewArgument(e.target.value)}
                    style={{ marginTop: 8 }}
                  />

                  <Space style={{ marginTop: 8 }}>
                    <Button
                      type="primary"
                      onClick={handleSubmitArgument}
                      loading={savingArgument}
                      disabled={!newArgument.trim()}
                    >
                      Post argument
                    </Button>
                    <Button
                      onClick={() => setNewArgument('')}
                      disabled={savingArgument || !newArgument}
                    >
                      Clear
                    </Button>
                  </Space>

                  <Paragraph style={{ marginTop: 8 }}>
                    <Text type="secondary">
                      Reminder: arguments that are off-topic or abusive may be
                      hidden after repeated reports.
                    </Text>
                  </Paragraph>
                </ProCard>
              </ProCard>
            </ProCard>

            {/* Optional quick glance at the last few statements from the preview */}
            {preview.latest?.length ? (
              <Card
                title="Latest highlights"
                style={{ marginTop: 24 }}
                bodyStyle={{ padding: 0 }}
              >
                <List
                  dataSource={preview.latest}
                  renderItem={(s) => (
                    <li key={s.id}>
                      <StatementComment
                        author={s.author}
                        body={s.body}
                      />
                    </li>
                  )}
                />
              </Card>
            ) : null}
          </>
        ) : (
          !loadingPreview && <Empty />
        )}
      </PageContainer>
    </EthikosPageShell>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub‑components                                                     */
/* ------------------------------------------------------------------ */

function StatementTimelineItem({ statement }: { statement: Statement }) {
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
        <Text strong>{statement.author}</Text>
        <Text type="secondary">
          {dayjs(statement.createdAt).format('YYYY-MM-DD HH:mm')}
        </Text>
      </div>
      <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
        {statement.body}
      </Paragraph>
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
}) {
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
