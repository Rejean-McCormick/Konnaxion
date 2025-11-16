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

/**
 * Fetch personalized recommendations from backend.
 * Intended endpoint: GET /api/learn/recommendations
 * You can later move this into services/learn.ts and reuse it.
 */
async function fetchRecommendations(): Promise<RecommendationsResponse> {
  const res = await fetch('/api/learn/recommendations', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`Failed to load recommendations (${res.status})`);
  }

  return (await res.json()) as RecommendationsResponse;
}

/**
 * Send lightweight feedback about a recommendation.
 * Intended endpoint: POST /api/learn/recommendations/feedback
 */
async function sendRecommendationFeedback(opts: {
  recommendationId: string;
  resourceId: string;
  action: 'like' | 'dislike' | 'dismiss' | 'save_for_later';
  rating?: number;
}) {
  // Fire-and-forget; errors are surfaced via message but do not break the UI.
  const res = await fetch('/api/learn/recommendations/feedback', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(opts),
  });

  if (!res.ok) {
    throw new Error('Could not record feedback');
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
      rating?: number,
    ) => {
      // Optimistic local update for "dismiss": remove card immediately.
      if (action === 'dismiss') {
        setRecommendations(prev => prev?.filter(r => r.recommendationId !== rec.recommendationId) ?? null);
      }

      try {
        await sendRecommendationFeedback({
          recommendationId: rec.recommendationId,
          resourceId: rec.resource.id,
          action,
          rating,
        });

        if (action === 'like') {
          message.success('Thanks for your feedback.');
        } else if (action === 'dislike') {
          message.info("We'll show fewer resources like this.");
        } else if (action === 'save_for_later') {
          message.success('Saved to your list.');
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Could not record your feedback. Please try again.';
        message.error(msg);

        // Rollback optimistic dismiss if it failed
        if (action === 'dismiss') {
          // Reload from cache/server
          loadRecommendations();
        }
      }
    },
    [loadRecommendations],
  );

  // Derive "continue your learning" items (non-complete progress entries).
  const continueItems = useMemo(
    () =>
      (recommendations ?? []).filter(
        rec =>
          rec.progress &&
          rec.progress.progressPercent > 0 &&
          rec.progress.progressPercent < 100,
      ),
    [recommendations],
  );

  // Simple KPI strip at the top.
  const kpis = useMemo(() => {
    const items = recommendations ?? [];
    const total = items.length;
    const inProgress = continueItems.length;
    const newOnly = total - inProgress;

    const totalMinutes = items.reduce(
      (sum, rec) => sum + (rec.resource.estimatedDurationMinutes ?? 0),
      0,
    );

    return {
      total,
      inProgress,
      newOnly,
      totalMinutes,
    };
  }, [recommendations, continueItems]);

  const hasAnyData = (recommendations?.length ?? 0) > 0;

  return (
    <>
      <Head>
        <title>KonnectED – Recommended Resources</title>
      </Head>

      <KonnectedPageShell
        title="Recommended Resources"
        subtitle={
          <>
            Curated suggestions based on your activity, interests, and learning progress.{' '}
            <Text type="secondary">
              Recommendations blend your profile, subjects you engage with, and global trends.
            </Text>
          </>
        }
        primaryAction={
          <Button
            type="primary"
            icon={<SettingOutlined />}
            onClick={handleOpenPreferences}
          >
            Tune recommendations
          </Button>
        }
        secondaryActions={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={refreshSuggestions}
              loading={isRefreshing}
            >
              Refresh
            </Button>
            <Button icon={<BookOutlined />} onClick={handleGoToCatalog}>
              Browse catalog
            </Button>
          </Space>
        }
      >
        {/* Error & offline notice */}
        {error && !hasAnyData && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="error"
              message="Unable to load personalized recommendations"
              description={error}
              showIcon
            />
          </div>
        )}

        {hasOfflineFallback && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="warning"
              showIcon
              message="Showing last known recommendations"
              description="We couldn't reach the recommendation service, so you're seeing the most recent cached suggestions."
            />
          </div>
        )}

        {/* KPI strip */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">Total suggestions</Text>
                <Text strong>{kpis.total}</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">Continue in progress</Text>
                <Text strong>{kpis.inProgress}</Text>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">New suggestions</Text>
                <Space size={4}>
                  <FireOutlined />
                  <Text strong>{kpis.newOnly}</Text>
                </Space>
              </Space>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small">
              <Space direction="vertical" size={4}>
                <Text type="secondary">Total learning time (approx.)</Text>
                <Text strong>
                  {kpis.totalMinutes > 0 ? `${kpis.totalMinutes} min` : '—'}
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* "Continue your learning" section */}
        {loading && !hasAnyData ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : continueItems.length > 0 ? (
          <div style={{ marginBottom: 32 }}>
            <Space
              align="center"
              style={{ marginBottom: 12, justifyContent: 'space-between', width: '100%' }}
            >
              <Text strong>Continue your learning</Text>
              <Button type="link" size="small" onClick={handleGoToMyLearningPath}>
                Go to My Learning Path <ArrowRightOutlined />
              </Button>
            </Space>

            <Row gutter={[16, 16]}>
              {continueItems.map(rec => (
                <Col xs={24} sm={12} md={8} key={rec.recommendationId}>
                  <Card
                    size="small"
                    hoverable
                    onClick={() => handleViewResource(rec.resource)}
                    extra={
                      <Button
                        type="link"
                        size="small"
                        onClick={e => {
                          e.stopPropagation();
                          handleViewResource(rec.resource);
                        }}
                      >
                        Continue
                      </Button>
                    }
                    title={rec.resource.title}
                  >
                    {rec.resource.subject && (
                      <Text type="secondary">{rec.resource.subject}</Text>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Progress
                        percent={rec.progress?.progressPercent ?? 0}
                        size="small"
                        status="active"
                      />
                    </div>
                    <div style={{ marginTop: 8 }}>
                      {rec.resource.tags?.slice(0, 3).map(tag => (
                        <Tag key={tag}>{tag}</Tag>
                      ))}
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        ) : null}

        {/* Main recommendation grid */}
        <div style={{ marginBottom: 16 }}>
          <Text strong style={{ fontSize: 16 }}>
            Personalized suggestions
          </Text>
        </div>

        {loading && !hasAnyData ? (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
            dataSource={Array.from({ length: 6 })}
            renderItem={(_, idx) => (
              <List.Item key={idx}>
                <Card>
                  <Skeleton active paragraph={{ rows: 4 }} />
                </Card>
              </List.Item>
            )}
          />
        ) : !hasAnyData ? (
          <Card>
            <Empty
              description={
                <>
                  <div>No personalized recommendations yet.</div>
                  <Text type="secondary">
                    Start by exploring the catalog or telling us your interests.
                  </Text>
                </>
              }
            >
              <Space>
                <Button type="primary" onClick={handleGoToCatalog}>
                  Browse catalog
                </Button>
                <Button onClick={handleOpenPreferences} icon={<SettingOutlined />}>
                  Tell us your interests
                </Button>
              </Space>
            </Empty>
          </Card>
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
            dataSource={recommendations ?? []}
            renderItem={rec => (
              <List.Item key={rec.recommendationId}>
                <Card
                  hoverable
                  title={rec.resource.title}
                  onClick={() => handleViewResource(rec.resource)}
                  extra={
                    <Button
                      type="link"
                      size="small"
                      onClick={e => {
                        e.stopPropagation();
                        handleViewResource(rec.resource);
                      }}
                    >
                      View <ArrowRightOutlined />
                    </Button>
                  }
                >
                  {/* Meta line: subject / level / type */}
                  <Space size={4} wrap style={{ marginBottom: 8 }}>
                    {rec.resource.subject && (
                      <Tag color="blue">{rec.resource.subject}</Tag>
                    )}
                    {rec.resource.level && (
                      <Tag color="geekblue">{rec.resource.level}</Tag>
                    )}
                    <Tag>{rec.resource.type}</Tag>
                    {rec.resource.language && (
                      <Tag color="default">{rec.resource.language}</Tag>
                    )}
                    {rec.resource.partOfPathTitle && (
                      <Tag color="purple">
                        <BookOutlined /> {rec.resource.partOfPathTitle}
                      </Tag>
                    )}
                    {rec.resource.offlineAvailable && (
                      <Tag color="green">Available offline</Tag>
                    )}
                  </Space>

                  {/* Summary */}
                  {rec.resource.summary && (
                    <Text style={{ display: 'block', marginBottom: 8 }}>
                      {rec.resource.summary}
                    </Text>
                  )}

                  {/* Reason / source */}
                  {rec.reason && (
                    <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                      {rec.reason}
                    </Text>
                  )}

                  {/* Progress & score */}
                  <Space
                    style={{ marginTop: 12, width: '100%', justifyContent: 'space-between' }}
                    align="center"
                  >
                    <Space size={4} align="center">
                      {rec.progress && rec.progress.progressPercent > 0 ? (
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
                    </Space>

                    {typeof rec.score === 'number' && (
                      <Space size={4} align="center">
                        <StarFilled style={{ color: '#faad14' }} />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Relevance {(rec.score * 100).toFixed(0)}%
                        </Text>
                      </Space>
                    )}
                  </Space>

                  {/* Actions row: feedback & save */}
                  <Space
                    style={{ marginTop: 12, width: '100%', justifyContent: 'space-between' }}
                  >
                    <Space size={8}>
                      <Button
                        size="small"
                        icon={<LikeOutlined />}
                        onClick={e => {
                          e.stopPropagation();
                          handleFeedback(rec, 'like');
                        }}
                      >
                        Helpful
                      </Button>
                      <Button
                        size="small"
                        icon={<DislikeOutlined />}
                        onClick={e => {
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
                        onClick={e => {
                          e.stopPropagation();
                          handleFeedback(rec, 'save_for_later');
                        }}
                      >
                        Save for later
                      </Button>
                      <Button
                        size="small"
                        type="text"
                        onClick={e => {
                          e.stopPropagation();
                          handleFeedback(rec, 'dismiss');
                        }}
                      >
                        Dismiss
                      </Button>
                    </Space>
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        )}
      </KonnectedPageShell>
    </>
  );
}
