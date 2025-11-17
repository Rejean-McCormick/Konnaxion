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
  viewerUrl?: string; // e.g. /course/[slug] or /konnected/learning-library/resource/[id]
  offlineAvailable?: boolean;
  partOfPathTitle?: string; // e.g. certification/learning-path label
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

function normalizeRecommendations(raw: unknown): RecommendationsResponse {
  const { items, count } = normalizeList<any>(raw);

  const mapped: KnowledgeRecommendationItem[] = items.map((row: any, index: number) => {
    // Support both:
    // - Recommendations API with row.resource, row.progress, row.score, row.reason...
    // - Plain knowledge resources list where row itself is the resource.
    const resourceRaw = row.resource ?? row;
    const id = resourceRaw.id ?? row.id ?? index;

    const resource: KnowledgeResource = {
      id: String(id),
      title: resourceRaw.title ?? 'Untitled resource',
      summary: resourceRaw.summary ?? resourceRaw.description ?? '',
      subject: resourceRaw.subject ?? undefined,
      level: resourceRaw.level ?? undefined,
      language: resourceRaw.language ?? undefined,
      type: (resourceRaw.type ?? resourceRaw.resource_type ?? 'article') as ResourceType,
      tags: resourceRaw.tags ?? [],
      estimatedDurationMinutes:
        resourceRaw.estimatedDurationMinutes ??
        resourceRaw.estimated_minutes ??
        resourceRaw.estimated_duration_minutes ??
        undefined,
      viewerUrl: resourceRaw.viewerUrl ?? resourceRaw.url ?? undefined,
      offlineAvailable: Boolean(
        resourceRaw.offlineAvailable ?? resourceRaw.is_offline_available,
      ),
      partOfPathTitle: resourceRaw.partOfPathTitle ?? undefined,
    };

    const progressSource = row.progress ?? resourceRaw.progress;
    const progress: LearningProgress | undefined = progressSource
      ? {
          resourceId: String(id),
          progressPercent:
            progressSource.progressPercent ??
            progressSource.progress_percent ??
            0,
          lastTouchedAt: progressSource.lastTouchedAt ?? progressSource.last_touched_at,
        }
      : undefined;

    return {
      recommendationId: String(row.id ?? `rec-${id}`),
      score: typeof row.score === 'number' ? row.score : undefined,
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
  });

  return {
    results: mapped,
    count: typeof count === 'number' ? count : mapped.length,
  };
}

/**
 * Fetch personalized recommendations from backend.
 *
 * Strategy:
 * 1. Try dedicated endpoint: GET /api/knowledge-recommendations/
 * 2. If unavailable, fall back to: GET /api/knowledge-resources/
 */
async function fetchRecommendations(): Promise<RecommendationsResponse> {
  try {
    const raw = await fetchJson('/api/knowledge-recommendations/');
    return normalizeRecommendations(raw);
  } catch (err) {
    // If the dedicated recommendations endpoint is not implemented yet,
    // fall back to the main knowledge resources list.
    // This keeps the page usable while backend evolves.
    console.warn('Falling back to /api/knowledge-resources/ for recommendations', err);
  }

  const rawFallback = await fetchJson('/api/knowledge-resources/');
  return normalizeRecommendations(rawFallback);
}

/**
 * Send lightweight feedback about a recommendation.
 * Intended endpoint: POST /api/knowledge-recommendations/feedback/
 *
 * Errors are logged to console but do not break the UX.
 */
async function sendRecommendationFeedback(opts: {
  recommendationId: string;
  resourceId: string;
  action: 'like' | 'dislike' | 'dismiss' | 'save_for_later';
  rating?: number;
}) {
  try {
    await fetch('/api/knowledge-recommendations/feedback/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(opts),
    });
  } catch (err) {
    // Backend for feedback is optional; do not surface hard failures to the user.
    // A console warning is enough for debugging in development.
    // eslint-disable-next-line no-console
    console.warn('Failed to send recommendation feedback', err);
  }
}

export default function RecommendedResourcesPage(): JSX.Element {
  const router = useRouter();

  const [recommendations, setRecommendations] = useState<KnowledgeRecommendationItem[] | null>(
    null,
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasOfflineFallback, setHasOfflineFallback] = useState<boolean>(false);

  const loadRecommendations = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const data = await fetchRecommendations();
      setRecommendations(data.results ?? []);
      setHasOfflineFallback(false);

      // Optionally cache the last successful payload for offline use.
      try {
        localStorage.setItem('konnected:recommended-resources:last', JSON.stringify(data));
      } catch {
        // ignore localStorage failures
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : 'Unable to load personalized recommendations.';
      setError(msg);

      // Try to recover from a cached result (offline / backend down).
      try {
        const cached = localStorage.getItem('konnected:recommended-resources:last');
        if (cached) {
          const parsed = JSON.parse(cached) as RecommendationsResponse;
          setRecommendations(parsed.results ?? []);
          setHasOfflineFallback(true);
        }
      } catch {
        // ignore cache errors
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const refreshSuggestions = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await loadRecommendations();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadRecommendations]);

  const handleOpenPreferences = useCallback(() => {
    // Placeholder for a full preferences drawer / page
    message.info('Learning preferences editor will allow tuning recommendations (coming soon).');
  }, []);

  const handleViewResource = useCallback(
    (resource: KnowledgeResource) => {
      if (resource.viewerUrl) {
        router.push(resource.viewerUrl);
      } else {
        // Fallback: keep existing pattern for now
        router.push(`/konnected/learning-library/resource/${resource.id}`);
      }
    },
    [router],
  );

  const handleGoToCatalog = useCallback(() => {
    router.push('/konnected/learning-library/browse-resources');
  }, [router]);

  const handleGoToMyLearningPath = useCallback(() => {
    router.push('/konnected/learning-paths/my-learning-path');
  }, [router]);

  const handleFeedback = useCallback(
    async (
      rec: KnowledgeRecommendationItem,
      action: 'like' | 'dislike' | 'dismiss' | 'save_for_later',
    ) => {
      try {
        await sendRecommendationFeedback({
          recommendationId: rec.recommendationId,
          resourceId: rec.resource.id,
          action,
        });

        if (action === 'like') {
          message.success('Thanks for the feedback! We will show you more similar content.');
        } else if (action === 'dislike') {
          message.success('Got it. We will show you less of this kind of content.');
        } else if (action === 'save_for_later') {
          message.success('Saved for later learning.');
        } else if (action === 'dismiss') {
          message.success('This recommendation will be deprioritized.');
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Could not record feedback on this recommendation.';
        message.error(msg);
      }
    },
    [],
  );

  const hasRecommendations = useMemo(
    () => Boolean(recommendations && recommendations.length > 0),
    [recommendations],
  );

  return (
    <>
      <Head>
        <title>Recommended learning resources – KonnectED</title>
      </Head>

      <KonnectedPageShell
        title="Recommended for you"
        subtitle="Personalized learning suggestions based on your activity and interests."
        primaryAction={
          <Space>
            <Button icon={<SettingOutlined />} onClick={handleOpenPreferences}>
              Adjust preferences
            </Button>
            <Button
              icon={<ReloadOutlined />}
              loading={isRefreshing}
              onClick={refreshSuggestions}
            >
              Refresh suggestions
            </Button>
          </Space>
        }
        secondaryActions={
          <Button onClick={handleGoToCatalog} icon={<BookOutlined />}>
            Browse full library
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            {error && !hasRecommendations && (
              <Alert
                type="error"
                showIcon
                message="Unable to load recommendations"
                description={error}
                style={{ marginBottom: 16 }}
              />
            )}

            {hasOfflineFallback && (
              <Alert
                type="info"
                showIcon
                message="Showing last known recommendations"
                description="These suggestions were loaded from your device cache because the recommendation backend is currently unavailable."
                style={{ marginBottom: 16 }}
              />
            )}

            {loading && !hasRecommendations ? (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                <Skeleton active />
                <Skeleton active />
                <Skeleton active />
              </Space>
            ) : !hasRecommendations ? (
              <Empty
                description={
                  <Space direction="vertical">
                    <Text>No recommendations yet.</Text>
                    <Text type="secondary">
                      Start exploring the library or enroll in a learning path to help the system
                      learn your interests.
                    </Text>
                  </Space>
                }
              >
                <Button type="primary" icon={<BookOutlined />} onClick={handleGoToCatalog}>
                  Explore the library
                </Button>
              </Empty>
            ) : (
              <List
                itemLayout="vertical"
                dataSource={recommendations ?? []}
                renderItem={(rec) => (
                  <List.Item key={rec.recommendationId}>
                    <Card
                      hoverable
                      onClick={() => handleViewResource(rec.resource)}
                      style={{ width: '100%' }}
                    >
                      <Space
                        direction="vertical"
                        style={{ width: '100%' }}
                        size="small"
                      >
                        {/* Title row */}
                        <Space
                          style={{
                            width: '100%',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                          }}
                        >
                          <Space direction="vertical" size={4}>
                            <Space size={8} align="center">
                              <Typography.Title
                                level={4}
                                style={{ marginBottom: 0, cursor: 'pointer' }}
                              >
                                {rec.resource.title}
                              </Typography.Title>
                              {rec.source && (
                                <Tag color={rec.source === 'ml' ? 'blue' : 'green'}>
                                  {rec.source === 'ml'
                                    ? 'Suggested by AI'
                                    : rec.source === 'editorial'
                                    ? 'Curated'
                                    : 'Trending'}
                                </Tag>
                              )}
                            </Space>

                            {rec.resource.summary && (
                              <Text type="secondary">{rec.resource.summary}</Text>
                            )}
                          </Space>

                          <Button
                            type="link"
                            icon={<ArrowRightOutlined />}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewResource(rec.resource);
                            }}
                          >
                            Open
                          </Button>
                        </Space>

                        {/* Meta row */}
                        <Space
                          size={[8, 8]}
                          wrap
                          style={{ marginTop: 8, width: '100%', justifyContent: 'space-between' }}
                        >
                          <Space size={[8, 8]} wrap>
                            {rec.resource.subject && (
                              <Tag color="blue">{rec.resource.subject}</Tag>
                            )}
                            {rec.resource.level && (
                              <Tag color="purple">{rec.resource.level}</Tag>
                            )}
                            {rec.resource.language && (
                              <Tag>{rec.resource.language}</Tag>
                            )}
                            <Tag color="geekblue" icon={<BookOutlined />}>
                              {rec.resource.type}
                            </Tag>
                            {typeof rec.resource.estimatedDurationMinutes === 'number' && (
                              <Tag color="gold">
                                {rec.resource.estimatedDurationMinutes} min
                              </Tag>
                            )}
                            {rec.resource.offlineAvailable && (
                              <Tag color="success">Offline available</Tag>
                            )}
                            {rec.resource.partOfPathTitle && (
                              <Tag color="cyan">
                                Part of: {rec.resource.partOfPathTitle}
                              </Tag>
                            )}
                          </Space>

                          <Space direction="vertical" align="end">
                            {rec.progress ? (
                              <>
                                <Progress
                                  percent={rec.progress.progressPercent}
                                  size="small"
                                  style={{ minWidth: 80 }}
                                />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  In progress
                                </Text>
                              </>
                            ) : (
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                Not started yet
                              </Text>
                            )}

                            {typeof rec.score === 'number' && (
                              <Space size={4} align="center">
                                <StarFilled style={{ color: '#faad14' }} />
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                  Relevance {(rec.score * 100).toFixed(0)}%
                                </Text>
                              </Space>
                            )}
                          </Space>
                        </Space>

                        {/* Actions row: feedback & save */}
                        <Space
                          style={{ marginTop: 12, width: '100%', justifyContent: 'space-between' }}
                        >
                          <Space size={8}>
                            <Button
                              size="small"
                              icon={<LikeOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(rec, 'like');
                              }}
                            >
                              Helpful
                            </Button>
                            <Button
                              size="small"
                              icon={<DislikeOutlined />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(rec, 'dislike');
                              }}
                            >
                              Not relevant
                            </Button>
                          </Space>

                          <Space size={8}>
                            <Button
                              size="small"
                              type="link"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(rec, 'save_for_later');
                              }}
                            >
                              Save for later
                            </Button>
                            <Button
                              size="small"
                              type="text"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleFeedback(rec, 'dismiss');
                              }}
                            >
                              Dismiss
                            </Button>
                          </Space>
                        </Space>
                      </Space>
                    </Card>
                  </List.Item>
                )}
              />
            )}
          </Col>

          <Col xs={24} lg={8}>
            <Card
              title="How these suggestions work"
              extra={<FireOutlined style={{ color: '#fa8c16' }} />}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Text>
                  Recommendations combine your recent activity, completed resources, and
                  organization-wide priorities.
                </Text>
                <Text type="secondary">
                  In this initial version, suggestions may be based on generic relevance such as
                  topic popularity and recency if no personal history is available.
                </Text>
              </Space>

              <div style={{ marginTop: 16 }}>
                <Button
                  block
                  onClick={handleGoToMyLearningPath}
                  icon={<BookOutlined />}
                >
                  Go to my learning path
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </KonnectedPageShell>
    </>
  );
}
