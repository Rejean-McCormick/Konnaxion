// FILE: frontend/app/konnected/learning-library/[resourceId]/page.tsx
// app/konnected/learning-library/[resourceId]/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeftOutlined,
  BookOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  GlobalOutlined,
  LinkOutlined,
  PlayCircleOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Progress,
  Row,
  Skeleton,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/api';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Paragraph, Text, Title } = Typography;

type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

type ResourceType = 'article' | 'video' | 'lesson' | 'quiz' | 'dataset' | string;

interface KnowledgeResourceBase {
  id: string | number;
  title: string;
  description?: string | null;
  subject?: string | null;
  level?: KnowledgeLevel | string | null;
  language?: string | null;
  resource_type?: ResourceType | null;
  tags?: string[] | null;
  estimated_minutes?: number | null;
  is_offline_available?: boolean | null;
  user_progress_percent?: number | null;
  url?: string | null;
  type?: string | null;
  author?: string | null;
  created_at?: string | null;
}

/**
 * Detail view may include additional fields such as HTML body, plain text body,
 * or course/progress metadata. We keep this very permissive to align with the
 * backend without over-coupling.
 */
type KnowledgeResourceDetail = KnowledgeResourceBase & {
  body?: string | null;
  body_html?: string | null;
  content_html?: string | null;
  content?: string | null;
  last_updated_at?: string | null;
  // Generic extension point – any extra backend fields are allowed
  [key: string]: unknown;
};

/** Same backend base convention as other KonnectED pages. */
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/+$/, '');

/** Preferred order for detail endpoints (mirrors list/search endpoints). */
const KNOWLEDGE_DETAIL_ENDPOINTS = [
  '/api/konnected/resources/',
  '/api/knowledge-resources/',
  '/api/knowledge/resources/',
] as const;

/** Build a candidate absolute URL for a given endpoint + resource id. */
function buildDetailUrl(endpoint: string, id: string | number): string {
  const trimmedEndpoint = endpoint.trim();
  const stringId = encodeURIComponent(String(id));

  // If endpoint is already absolute, just append id
  if (/^https?:\/\//i.test(trimmedEndpoint)) {
    const base = trimmedEndpoint.replace(/\/+$/, '');
    return `${base}/${stringId}/`;
  }

  // If API_BASE is not configured, fall back to relative URL
  if (!API_BASE) {
    const base = trimmedEndpoint.replace(/\/+$/, '');
    return `${base}/${stringId}/`;
  }

  // Normal case: combine API_BASE with endpoint
  const withBase = trimmedEndpoint.startsWith('/')
    ? `${API_BASE}${trimmedEndpoint}`
    : `${API_BASE}/${trimmedEndpoint}`;

  const normalized = withBase.replace(/\/+$/, '');
  return `${normalized}/${stringId}/`;
}

/**
 * Fetch a single resource by id, trying all preferred endpoints.
 * - Returns the first successful response.
 * - Skips 404/405 and tries next endpoint.
 */
async function fetchResourceDetail(
  id: string | number,
): Promise<KnowledgeResourceDetail | null> {
  const urls = KNOWLEDGE_DETAIL_ENDPOINTS.map((ep) => buildDetailUrl(ep, id));

  for (const url of urls) {
    try {
      const res = await apiFetch(url, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        credentials: 'include',
      });

      if (!res.ok) {
        // Try next endpoint if clearly unsupported/missing
        if (res.status === 404 || res.status === 405) {
          continue;
        }
        // Other errors: abort and bubble up
        throw new Error(`Backend responded with status ${res.status}`);
      }

      const data = (await res.json()) as KnowledgeResourceDetail;
      if (data && data.title) {
        return data;
      }
      // If response shape is unexpected, continue to next endpoint
    } catch {
      // Network error or non-404/405 error: try next endpoint
      continue;
    }
  }

  return null;
}

/** Choose a short label for the resource type. */
function formatResourceType(i18nT: TranslateFunction, resource: KnowledgeResourceDetail | null): string {
  if (!resource) return i18nT("ui.konnected.learningLibrary.resourceid.resource");
  if (resource.resource_type) return String(resource.resource_type);
  if (resource.type) return String(resource.type);
  return i18nT("ui.konnected.learningLibrary.resourceid.resource");
}

/** Pick the best available content field for inline preview. */
function pickContentHtml(resource: KnowledgeResourceDetail | null): string | null {
  if (!resource) return null;
  if (typeof resource.body_html === 'string' && resource.body_html.trim().length) {
    return resource.body_html;
  }
  if (typeof resource.content_html === 'string' && resource.content_html.trim().length) {
    return resource.content_html;
  }
  // Fallback: plain text -> wrapped in <p>
  const plain =
    (typeof resource.body === 'string' && resource.body) ||
    (typeof resource.content === 'string' && resource.content) ||
    '';
  if (plain.trim().length) {
    const safe = plain.replace(/\n{2,}/g, '\n\n');
    const paragraphs = safe
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => `<p>${block}</p>`)
      .join('\n');
    return paragraphs || null;
  }
  return null;
}

/** Simple helper to normalise progress into a 0–100 range. */
function normalizeProgress(resource: KnowledgeResourceDetail | null): number {
  if (!resource) return 0;
  const raw = resource.user_progress_percent;
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    if (raw < 0) return 0;
    if (raw > 100) return 100;
    return raw;
  }
  return 0;
}

export default function LearningResourceViewerPage() {
  const { t: i18nT } = useLanguage();
  const router = useRouter();
  const params = useParams<{ resourceId: string }>();
  const resourceId = params.resourceId;

  const [resource, setResource] = useState<KnowledgeResourceDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load resource when the ID changes
  useEffect(() => {
    if (!resourceId) {
      setError(i18nT("ui.konnected.learningLibrary.resourceid.missingResourceIdentifierInTheUrl"));
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchResourceDetail(resourceId);
        if (cancelled) return;

        if (!data) {
          setError(i18nT("ui.konnected.learningLibrary.resourceid.thisLearningResourceCouldNotBeFound"));
          setResource(null);
        } else {
          setResource(data);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while loading the resource.',
        );
        setResource(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [resourceId, i18nT]);

  const progressPercent = useMemo(() => normalizeProgress(resource), [resource]);

  const inlineHtml = useMemo(() => pickContentHtml(resource), [resource]);

  const shellTitle = resource?.title ?? i18nT("ui.konnected.learningLibrary.resourceid.learningResource");
  const shellDescription =
    (resource?.description &&
      typeof resource.description === 'string' &&
      resource.description.trim().slice(0, 200)) ||
    i18nT("ui.konnected.learningLibrary.resourceid.viewDetailsAndContentForThisKonnected");

  const handleBackClick = () => {
    // Prefer going back if user arrived from another library page
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/konnected/learning-library/browse-resources');
    }
  };

  const handleOpenResource = () => {
    if (resource?.url && typeof window !== 'undefined') {
      window.open(resource.url, '_blank', 'noopener,noreferrer');
    }
  };

  const hasTags = Array.isArray(resource?.tags) && resource!.tags!.length > 0;

  return (
    <KonnectedPageShell
      title={shellTitle}
      subtitle={shellDescription}
      primaryAction={
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          disabled={!resource?.url}
          onClick={handleOpenResource}
        >
          {i18nT("ui.konnected.learningLibrary.resourceid.openResource")}
        </Button>
      }
      secondaryActions={
        <Button icon={<ArrowLeftOutlined />} onClick={handleBackClick}>
          {i18nT("ui.konnected.learningLibrary.resourceid.backToLibrary")}
        </Button>
      }
    >
      <Row gutter={24}>
        {/* Main viewer column */}
        <Col xs={24} lg={16}>
          <Card
            bordered
            title={
              <Space align="center">
                <BookOutlined />
                <span>{shellTitle}</span>
              </Space>
            }
            extra={
              <Space size="small">
                {resource?.resource_type && (
                  <Tag color="blue">{formatResourceType(i18nT, resource)}</Tag>
                )}
                {resource?.subject && (
                  <Tag icon={<TagOutlined />}>{resource.subject}</Tag>
                )}
                {resource?.language && (
                  <Tag icon={<GlobalOutlined />}>{resource.language}</Tag>
                )}
              </Space>
            }
          >
            {error && (
              <Alert
                type="error"
                showIcon
                message={i18nT("ui.konnected.learningLibrary.resourceid.unableToLoadResource")}
                description={error}
                style={{ marginBottom: 16 }}
              />
            )}

            {loading ? (
              <Skeleton active paragraph={{ rows: 8 }} />
            ) : !resource ? (
              <Alert
                type="warning"
                showIcon
                message={i18nT("ui.konnected.learningLibrary.resourceid.resourceNotAvailable")}
                description={i18nT("ui.konnected.learningLibrary.resourceid.thisLearningResourceIsNotAvailableOr")}
              />
            ) : (
              <>
                {resource.description && (
                  <>
                    <Paragraph>{resource.description}</Paragraph>
                    <Divider />
                  </>
                )}

                <Tabs
                  defaultActiveKey="overview"
                  items={[
                    {
                      key: 'overview',
                      label: i18nT("ui.konnected.learningLibrary.resourceid.overview"),
                      children: (
                        <>
                          {inlineHtml ? (
                            <div
                              className="konnected-resource-body"
                              style={{ lineHeight: 1.7 }}
                              // Content comes from the trusted backend (CMS)
                              dangerouslySetInnerHTML={{ __html: inlineHtml }}
                            />
                          ) : (
                            <Paragraph type="secondary">
                              {i18nT("ui.konnected.learningLibrary.resourceid.detailedContentForThisResourceWillAppear")}
                            </Paragraph>
                          )}
                        </>
                      ),
                    },
                    {
                      key: 'details',
                      label: i18nT("ui.konnected.learningLibrary.resourceid.details"),
                      children: (
                        <Space
                          direction="vertical"
                          size="middle"
                          style={{ width: '100%' }}
                        >
                          <div>
                            <Title level={5} style={{ marginBottom: 8 }}>
                              {i18nT("ui.konnected.learningLibrary.resourceid.keyInformation")}
                            </Title>
                            <Space direction="vertical" size={4}>
                              {resource.subject && (
                                <Text>
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.subject")} </Text>
                                  {resource.subject}
                                </Text>
                              )}
                              {resource.level && (
                                <Text>
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.level")} </Text>
                                  {String(resource.level)}
                                </Text>
                              )}
                              {resource.language && (
                                <Text>
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.language")} </Text>
                                  {resource.language}
                                </Text>
                              )}
                              {resource.resource_type && (
                                <Text>
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.type")} </Text>
                                  {formatResourceType(i18nT, resource)}
                                </Text>
                              )}
                              {resource.estimated_minutes != null && (
                                <Text>
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.estimatedDuration")} </Text>
                                  <Space>
                                    <ClockCircleOutlined />
                                    <span>{resource.estimated_minutes} {i18nT("ui.konnected.learningLibrary.resourceid.min")}</span>
                                  </Space>
                                </Text>
                              )}
                              {resource.author && (
                                <Text>
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.author")} </Text>
                                  {resource.author}
                                </Text>
                              )}
                              {resource.created_at && (
                                <Text type="secondary">
                                  <Text strong>{i18nT("ui.konnected.learningLibrary.resourceid.created")} </Text>
                                  {resource.created_at}
                                </Text>
                              )}
                            </Space>
                          </div>

                          {hasTags && (
                            <div>
                              <Title level={5} style={{ marginBottom: 8 }}>
                                {i18nT("ui.konnected.learningLibrary.resourceid.tags")}
                              </Title>
                              <Space size={[8, 8]} wrap>
                                {resource.tags!.map((tag) => (
                                  <Tag key={tag}>{tag}</Tag>
                                ))}
                              </Space>
                            </div>
                          )}
                        </Space>
                      ),
                    },
                    {
                      key: 'notes',
                      label: i18nT("ui.konnected.learningLibrary.resourceid.notes"),
                      children: (
                        <Paragraph type="secondary">
                          {i18nT("ui.konnected.learningLibrary.resourceid.personalNotesAndHighlightsForThisResource")}
                        </Paragraph>
                      ),
                    },
                  ]}
                />
              </>
            )}
          </Card>
        </Col>

        {/* Metadata / actions column */}
        <Col xs={24} lg={8}>
          <Card
            title={i18nT("ui.konnected.learningLibrary.resourceid.progress")}
            style={{ marginBottom: 16 }}
            extra={
              progressPercent >= 100 ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  {i18nT("ui.konnected.learningLibrary.resourceid.completed")}
                </Tag>
              ) : null
            }
          >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary">{i18nT("ui.konnected.learningLibrary.resourceid.yourProgress")}</Text>
              <Progress
                percent={progressPercent}
                status={progressPercent >= 100 ? 'success' : 'active'}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.konnected.learningLibrary.resourceid.progressValuesAreProvidedByTheKonnected")}
              </Text>
            </Space>
          </Card>

          <Card title={i18nT("ui.konnected.learningLibrary.resourceid.actions")} style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                icon={<PlayCircleOutlined />}
                block
                disabled={!resource?.url}
                onClick={handleOpenResource}
              >
                {i18nT("ui.konnected.learningLibrary.resourceid.openResource")}
              </Button>
              <Button icon={<DownloadOutlined />} block disabled={!resource}>
                {i18nT("ui.konnected.learningLibrary.resourceid.saveForOffline")}
              </Button>
              <Button
                icon={<LinkOutlined />}
                block
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    navigator.clipboard
                      ?.writeText(window.location.href)
                      .catch(() => undefined);
                  }
                }}
              >
                {i18nT("ui.konnected.learningLibrary.resourceid.copyLink")}
              </Button>
            </Space>
          </Card>

          <Card title={i18nT("ui.konnected.learningLibrary.resourceid.resourceMeta")}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text type="secondary">
                {i18nT("ui.konnected.learningLibrary.resourceid.thisPanelSummarisesTheMetadataForThe")}
              </Text>
            </Space>
          </Card>
        </Col>
      </Row>
    </KonnectedPageShell>
  );
}
