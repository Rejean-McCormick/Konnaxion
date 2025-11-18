// app/konnected/learning-library/recommended-resources/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ReloadOutlined,
  SettingOutlined,
  LikeOutlined,
  DislikeOutlined,
  StarFilled,
  ArrowRightOutlined,
  BookOutlined,
  FireOutlined,
} from '@ant-design/icons';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Text } = Typography;

type ResourceType = 'article' | 'video' | 'lesson' | 'quiz' | 'dataset';

interface KnowledgeResource {
  id: string;
  title: string;
  summary: string;
  subject?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  language?: string;
  type: ResourceType;
  tags?: string[];
  estimatedDurationMinutes?: number;
  // e.g. /course/[slug] or /konnected/learning-library/resource/[id]
  viewerUrl?: string;
  // Whether this resource is available in offline bundles
  offlineAvailable?: boolean;
  // Optional label if this resource is part of a learning path / certification
  partOfPathTitle?: string;
}

interface LearningProgress {
  resourceId: string;
  progressPercent: number; // 0..100
  lastTouchedAt?: string;
}

type RecommendationSource = 'ml' | 'editorial' | 'trend';

interface KnowledgeRecommendationItem {
  recommendationId: string;
  score?: number;
  reason?: string;
  recommendedAt: string;
  source?: RecommendationSource;
  resource: KnowledgeResource;
  progress?: LearningProgress;
}

interface RecommendationsResponse {
  results: KnowledgeRecommendationItem[];
  count: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers to normalize API responses                                */
/* ------------------------------------------------------------------ */

function normalizeList<T = unknown>(raw: unknown): { items: T[]; count?: number } {
  if (Array.isArray(raw)) {
    return { items: raw as T[] };
  }

  if (raw && typeof raw === 'object') {
    const obj = raw as { results?: unknown; items?: unknown; count?: number };
    const items =
      (Array.isArray(obj.results) && (obj.results as T[])) ||
      (Array.isArray(obj.items) && (obj.items as T[])) ||
      [];
    return { items, count: typeof obj.count === 'number' ? obj.count : undefined };
  }

  return { items: [] };
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }

  return res.json();
}

// Simple numeric normalizer to cope with string/number fields from the API
function safeNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

function normalizeRecommendations(raw: unknown): RecommendationsResponse {
  const { items, count } = normalizeList<any>(raw);

  const mapped: KnowledgeRecommendationItem[] = items.map(
    (row: any, index: number) => {
      // Support both:
      // - Recommendations API with row.resource, row.progress, row.score, row.reason...
      // - Plain knowledge resources list where row itself is the resource.
      const resourceRaw = row.resource ?? row;
      const id = resourceRaw.id ?? row.id ?? index;

      const rawType = (resourceRaw.type ?? resourceRaw.resource_type ?? 'article') as string;
      const normalizedType: ResourceType =
        rawType === 'doc'
          ? 'article'
          : rawType === 'course'
          ? 'lesson'
          : (['article', 'video', 'lesson', 'quiz', 'dataset'] as const).includes(
              rawType as ResourceType,
            )
          ? (rawType as ResourceType)
          : 'article';

      const resource: KnowledgeResource = {
        id: String(id),
        title: resourceRaw.title ?? 'Untitled resource',
        summary: resourceRaw.summary ?? resourceRaw.description ?? '',
        subject: resourceRaw.subject ?? undefined,
        level: resourceRaw.level ?? undefined,
        language: resourceRaw.language ?? undefined,
        type: normalizedType,
        tags: resourceRaw.tags ?? resourceRaw.keywords ?? [],
        estimatedDurationMinutes:
          resourceRaw.estimatedDurationMinutes ??
          resourceRaw.estimated_minutes ??
          resourceRaw.estimated_duration_minutes ??
          undefined,
        viewerUrl: resourceRaw.viewerUrl ?? resourceRaw.url ?? undefined,
        offlineAvailable: Boolean(
          resourceRaw.offlineAvailable ??
            resourceRaw.is_offline_available ??
            resourceRaw.offlineEligible ??
            resourceRaw.offline_eligible,
        ),
        partOfPathTitle:
          resourceRaw.partOfPathTitle ??
          resourceRaw.path_title ??
          resourceRaw.path_label ??
          undefined,
      };

      const progressSource = row.progress ?? resourceRaw.progress;
      let progress: LearningProgress | undefined;
      if (progressSource) {
        const rawPercent =
          progressSource.progressPercent ?? progressSource.progress_percent;
        const percent = Math.max(0, Math.min(100, safeNumber(rawPercent)));

        progress = {
          resourceId: String(id),
          progressPercent: percent,
          lastTouchedAt:
            progressSource.lastTouchedAt ?? progressSource.last_touched_at,
        };
      }

      const rawScore = row.score ?? row.relevance_score;

      return {
        recommendationId: String(row.id ?? `rec-${id}`),
        score: typeof rawScore === 'number' ? rawScore : undefined,
        reason: typeof row.reason === 'string' ? row.reason : undefined,
        recommendedAt:
          row.recommendedAt ??
          row.recommended_at ??
          resourceRaw.created_at ??
          new Date().toISOString(),
        source: row.source as RecommendationSource | undefined,
        resource,
        progress,
      };
    },
  );

  return {
    results: mapped,
    count: typeof count === 'number' ? count : mapped.length,
  };
}

/**
 * Strategy:
 * 1. Try the dedicated /api/knowledge-recommendations/ endpoint (when wired).
 * 2. Fall back to the main KnowledgeResource list. To stay robust against
 *    backend refactors, we try the known path variants used across v14:
 *      - /api/knowledge-resources/
 *      - /api/knowledge/resources/
 *      - /api/konnected/resources/  (current DRF router)
 */
async function fetchRecommendations(): Promise<RecommendationsResponse> {
  // 1) Dedicated recommendations endpoint
  try {
    const raw = await fetchJson('/api/knowledge-recommendations/');
    return normalizeRecommendations(raw);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      'Falling back to KnowledgeResource list for recommendations',
      err,
    );
  }

  // 2) Fallback: generic knowledge resources list
  const fallbackEndpoints = [
    '/api/knowledge-resources/',
    '/api/knowledge/resources/',
    '/api/konnected/resources/',
  ];

  for (const url of fallbackEndpoints) {
    try {
      const rawFallback = await fetchJson(url);
      return normalizeRecommendations(rawFallback);
    } catch {
      // try next variant
    }
  }

  throw new Error('Unable to load knowledge resources from any endpoint.');
}

/**
 * Optional: send feedback so the ML layer can learn.
 * For now this is best-effort; failures are non-blocking for the UI.
 */
async function sendRecommendationFeedback(
  item: KnowledgeRecommendationItem,
  feedback: 'like' | 'dislike',
): Promise<void> {
  try {
    await fetch('/api/knowledge-recommendations/feedback/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        recommendationId: item.recommendationId,
        resourceId: item.resource.id,
        feedback,
      }),
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to send recommendation feedback', err);
  }
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function RecommendedResourcesPage(): JSX.Element {
  const router = useRouter();

  const [recommendations, setRecommendations] = useState<KnowledgeRecommendationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
  const [likeInFlightIds, setLikeInFlightIds] = useState<Set<string>>(new Set());

  const hasRecommendations = recommendations.length > 0;

  const sortedRecommendations = useMemo(
    () =>
      [...recommendations].sort((a, b) => {
        if (typeof a.score === 'number' && typeof b.score === 'number') {
          return b.score - a.score;
        }

        return (
          new Date(b.recommendedAt).getTime() -
          new Date(a.recommendedAt).getTime()
        );
      }),
    [recommendations],
  );

  const handleReload = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchRecommendations();
      setRecommendations(data.results);
      setHasLoadedOnce(true);

      if (!data.results.length) {
        message.info(
          'No personalized recommendations yet. Try completing a few lessons or rating resources.',
        );
      }
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to load recommendations right now.';
      setError(msg);

      if (!hasLoadedOnce) {
        // Soft fallback: try to use cached sample data from localStorage if present
        try {
          const cached = window.localStorage.getItem(
            'konnected:sample:knowledge-recommendations',
          );
          if (cached) {
            const parsed = JSON.parse(cached) as unknown;
            const normalized = normalizeRecommendations(parsed);
            setRecommendations(normalized.results);
          }
        } catch {
          // ignore
        }
      }
    } finally {
      setLoading(false);
    }
  }, [hasLoadedOnce]);

  useEffect(() => {
    void handleReload();
  }, [handleReload]);

  const handleViewResource = (item: KnowledgeRecommendationItem) => {
    const href =
      item.resource.viewerUrl ??
      `/konnected/learning-library/resource/${encodeURIComponent(
        item.resource.id,
      )}`;

    router.push(href);
  };

  const handleFeedback = async (
    item: KnowledgeRecommendationItem,
    feedback: 'like' | 'dislike',
  ) => {
    const key = `${item.recommendationId}:${feedback}`;

    setLikeInFlightIds((prev) => {
      const next = new Set(prev);
      next.add(key);
      return next;
    });

    try {
      await sendRecommendationFeedback(item, feedback);
      message.success(
        feedback === 'like'
          ? 'Thanks! We will show you more content like this.'
          : 'We will show you this type of content less often.',
      );
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Could not send feedback. Please try again later.';
      message.error(msg);
    } finally {
      setLikeInFlightIds((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const renderHeaderTags = () => (
    <Space size={[8, 8]} wrap>
      <Tag icon={<StarFilled />} color="gold">
        Personalized
      </Tag>
      <Tag icon={<BookOutlined />} color="geekblue">
        Knowledge Library
      </Tag>
      <Tag icon={<FireOutlined />} color="volcano">
        Early prototype
      </Tag>
    </Space>
  );

  return (
    <>
      <Head>
        <title>Recommended resources – KonnectED</title>
      </Head>

      <KonnectedPageShell
        title="Recommended resources"
        subtitle="Personalized learning suggestions based on your activity in the KonnectED Knowledge Library."
        primaryAction={
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void handleReload()}
            loading={loading}
          >
            Refresh recommendations
          </Button>
        }
        secondaryActions={
          <Space>
            <Button
              icon={<BookOutlined />}
              onClick={() =>
                router.push('/konnected/learning-library/browse-resources')
              }
            >
              Browse library
            </Button>
            <Button icon={<SettingOutlined />} disabled>
              Recommendation settings
            </Button>
          </Space>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space size={8} align="center">
                  <span>Recommended for you</span>
                  {renderHeaderTags()}
                </Space>
              }
            >
              {error && (
                <Alert
                  type="warning"
                  showIcon
                  style={{ marginBottom: 16 }}
                  message="We couldn't load live recommendations."
                  description={
                    <span>
                      {error}{' '}
                      <Text type="secondary">
                        If this keeps happening, the personalized recommendation
                        API for KonnectED may not be wired yet. In that case we
                        will fall back to generic library suggestions.
                      </Text>
                    </span>
                  }
                />
              )}

              {!hasRecommendations && loading && (
                <div
                  style={{
                    minHeight: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton active paragraph={{ rows: 4 }} />
                </div>
              )}

              {!loading && !hasRecommendations && !error && (
                <Empty
                  description={
                    <Space direction="vertical" size={4}>
                      <span>No recommendations yet.</span>
                      <Text type="secondary">
                        Start a learning path or complete a few resources so we
                        can tailor suggestions to you.
                      </Text>
                    </Space>
                  }
                />
              )}

              {hasRecommendations && (
                <List
                  itemLayout="vertical"
                  dataSource={sortedRecommendations}
                  renderItem={(rec) => (
                    <List.Item
                      key={rec.recommendationId}
                      actions={[
                        <Space key="actions" size={8}>
                          <Button
                            type="link"
                            icon={<ArrowRightOutlined />}
                            onClick={() => handleViewResource(rec)}
                          >
                            Open
                          </Button>
                          <Button
                            type="text"
                            icon={<LikeOutlined />}
                            loading={likeInFlightIds.has(
                              `${rec.recommendationId}:like`,
                            )}
                            onClick={() => handleFeedback(rec, 'like')}
                          >
                            Helpful
                          </Button>
                          <Button
                            type="text"
                            icon={<DislikeOutlined />}
                            loading={likeInFlightIds.has(
                              `${rec.recommendationId}:dislike`,
                            )}
                            onClick={() => handleFeedback(rec, 'dislike')}
                          >
                            Not for me
                          </Button>
                        </Space>,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space direction="vertical" size={0}>
                            <Space size={8} wrap>
                              <Text strong>{rec.resource.title}</Text>
                              {rec.resource.type && (
                                <Tag
                                  color="geekblue"
                                  style={{ textTransform: 'capitalize' }}
                                >
                                  {rec.resource.type}
                                </Tag>
                              )}
                              {rec.resource.level && (
                                <Tag color="purple">{rec.resource.level}</Tag>
                              )}
                              {rec.resource.subject && (
                                <Tag color="blue">{rec.resource.subject}</Tag>
                              )}
                              {rec.source && (
                                <Tag>
                                  {rec.source === 'ml'
                                    ? 'Suggested by AI'
                                    : rec.source === 'editorial'
                                    ? 'Curator pick'
                                    : 'Trending'}
                                </Tag>
                              )}
                            </Space>
                            {rec.reason && (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {rec.reason}
                              </Text>
                            )}
                          </Space>
                        }
                        description={
                          <Space
                            direction="vertical"
                            size={4}
                            style={{ width: '100%' }}
                          >
                            {rec.resource.summary && (
                              <Text>{rec.resource.summary}</Text>
                            )}
                            <Space size={[8, 8]} wrap>
                              {rec.resource.language && (
                                <Tag>{rec.resource.language}</Tag>
                              )}
                              {rec.resource.tags?.map((tag) => (
                                <Tag key={tag}>{tag}</Tag>
                              ))}
                              {rec.resource.estimatedDurationMinutes != null && (
                                <Tag>
                                  ≈ {rec.resource.estimatedDurationMinutes} min
                                </Tag>
                              )}
                              {rec.resource.offlineAvailable && (
                                <Tag color="green">Offline available</Tag>
                              )}
                              {rec.resource.partOfPathTitle && (
                                <Tag color="magenta">
                                  Part of{' '}
                                  <Text strong>
                                    {rec.resource.partOfPathTitle}
                                  </Text>
                                </Tag>
                              )}
                            </Space>
                            <Row gutter={16}>
                              <Col xs={24} sm={12}>
                                {rec.progress ? (
                                  <Space
                                    direction="vertical"
                                    size={2}
                                    style={{ width: '100%' }}
                                  >
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}
                                    >
                                      Your progress
                                    </Text>
                                    <Progress
                                      percent={rec.progress.progressPercent}
                                      size="small"
                                      status={
                                        rec.progress.progressPercent === 100
                                          ? 'success'
                                          : 'active'
                                      }
                                    />
                                    {rec.progress.lastTouchedAt && (
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: 12 }}
                                      >
                                        Last activity:{' '}
                                        {new Date(
                                          rec.progress.lastTouchedAt,
                                        ).toLocaleString()}
                                      </Text>
                                    )}
                                  </Space>
                                ) : (
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    You have not started this resource yet.
                                  </Text>
                                )}
                              </Col>
                              <Col xs={24} sm={12}>
                                <Space
                                  direction="vertical"
                                  size={2}
                                  style={{ width: '100%' }}
                                >
                                  {typeof rec.score === 'number' && (
                                    <Text
                                      type="secondary"
                                      style={{ fontSize: 12 }}
                                    >
                                      Relevance score:{' '}
                                      <Text strong>
                                        {(rec.score * 100).toFixed(0)}%
                                      </Text>
                                    </Text>
                                  )}
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: 12 }}
                                  >
                                    Recommended on:{' '}
                                    {new Date(
                                      rec.recommendedAt,
                                    ).toLocaleDateString()}
                                  </Text>
                                </Space>
                              </Col>
                            </Row>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <Card title="How these recommendations work">
                <Space direction="vertical" size={4}>
                  <Text>
                    KonnectED recommendations are an early prototype. They will
                    eventually use your learning paths, progress, and Ekoh score
                    to tailor suggestions.
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    For now, recommendations may rely on simple heuristics like
                    subject matches, language preferences, and popularity.
                  </Text>
                </Space>
              </Card>

              <Card title="Tips to improve recommendations">
                <List
                  size="small"
                  dataSource={[
                    'Complete or mark a few lessons as done.',
                    'Rate or leave feedback on resources.',
                    'Join a learning path and follow it for a while.',
                    'Try content in your preferred language first.',
                  ]}
                  renderItem={(tip) => <List.Item>{tip}</List.Item>}
                />
              </Card>

              <Card title="KonnectED tips & summary">
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Looking for a more structured experience?
                  </Text>
                  <Button
                    type="primary"
                    icon={<BookOutlined />}
                    onClick={() =>
                      router.push('/konnected/learning-paths/my-learning-path')
                    }
                  >
                    Go to my learning paths
                  </Button>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Or browse curated learning paths and certification programs
                    from the main dashboard.
                  </Text>
                </Space>
              </Card>
            </Space>
          </Col>
        </Row>
      </KonnectedPageShell>
    </>
  );
}
