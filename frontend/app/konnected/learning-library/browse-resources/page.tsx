// app/konnected/learning-library/browse-resources/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Tag,
  Rate,
  Space,
  Table,
  Pagination,
  Button,
  Alert,
  Spin,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Text } = Typography;
const { Search } = Input;

/* ------------------------------------------------------------------ */
/*  Domain types (aligned with KnowledgeResource + list API)          */
/* ------------------------------------------------------------------ */

type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

type SortOption = 'relevance' | 'newest' | 'popular' | 'shortest' | 'longest';

interface KnowledgeResource {
  id: string | number;
  title: string;
  description?: string;
  subject: string;
  level: KnowledgeLevel;
  language: string;
  resource_type: string; // e.g. 'video' | 'article' | 'course' | 'quiz'
  average_rating?: number | null;
  tags?: string[];
  estimated_minutes?: number | null;
  is_offline_available?: boolean;
  user_progress_percent?: number | null;
}

interface KnowledgeResourceListResponse {
  count: number;
  results: KnowledgeResource[];
}

interface KnowledgeMetadataResponse {
  subjects: string[];
  levels: KnowledgeLevel[];
  languages: string[];
  resource_types: string[];
}

/* ------------------------------------------------------------------ */
/*  API endpoints (adapt path segments to match your OpenAPI)         */
/* ------------------------------------------------------------------ */

const KNOWLEDGE_RESOURCES_ENDPOINT = '/api/konnected/knowledge/resources/';
const KNOWLEDGE_METADATA_ENDPOINT = '/api/konnected/knowledge/resources-meta/';

interface FiltersState {
  query: string;
  subject?: string;
  level?: KnowledgeLevel;
  language?: string;
  resourceType?: string;
  sort: SortOption;
}

/* Map UI sort options to backend ordering query param */
function mapSortToOrdering(sort: SortOption): string | undefined {
  switch (sort) {
    case 'relevance':
      return '-search_score'; // typical search backend field
    case 'newest':
      return '-created_at';
    case 'popular':
      return '-popularity';
    case 'shortest':
      return 'estimated_minutes';
    case 'longest':
      return '-estimated_minutes';
    default:
      return undefined;
  }
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default function BrowseResourcesPage(): JSX.Element {
  const router = useRouter();

  // Filters & pagination
  const [filters, setFilters] = useState<FiltersState>({
    query: '',
    sort: 'relevance',
  });
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Data
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [total, setTotal] = useState<number>(0);

  // Metadata for filters
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<KnowledgeLevel[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [resourceTypes, setResourceTypes] = useState<string[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* -------------------------------------------------------------- */
  /*  Load metadata (subjects, levels, languages, types)            */
  /* -------------------------------------------------------------- */

  useEffect(() => {
    let cancelled = false;

    const loadMetadata = async () => {
      setLoadingMeta(true);
      try {
        const res = await axios.get<KnowledgeMetadataResponse>(
          KNOWLEDGE_METADATA_ENDPOINT,
        );
        if (cancelled) return;

        setSubjects(res.data.subjects ?? []);
        setLevels(res.data.levels ?? []);
        setLanguages(res.data.languages ?? []);
        setResourceTypes(res.data.resource_types ?? []);
      } catch (e) {
        // Non-blocking error: filters still work with empty options
        // eslint-disable-next-line no-console
        console.warn('Failed to load Knowledge metadata', e);
      } finally {
        if (!cancelled) {
          setLoadingMeta(false);
        }
      }
    };

    loadMetadata();

    return () => {
      cancelled = true;
    };
  }, []);

  /* -------------------------------------------------------------- */
  /*  Load resources list                                           */
  /* -------------------------------------------------------------- */

  const fetchResources = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const ordering = mapSortToOrdering(filters.sort);

      const res = await axios.get<KnowledgeResourceListResponse>(
        KNOWLEDGE_RESOURCES_ENDPOINT,
        {
          params: {
            page,
            page_size: pageSize,
            q: filters.query || undefined,
            subject: filters.subject || undefined,
            level: filters.level || undefined,
            language: filters.language || undefined,
            resource_type: filters.resourceType || undefined,
            ordering: ordering || undefined,
          },
        },
      );

      setResources(res.data.results ?? []);
      setTotal(res.data.count ?? 0);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Failed to load Knowledge resources', e);
      setError('Unable to load resources. Please try again.');
      setResources([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  /* -------------------------------------------------------------- */
  /*  Handlers                                                      */
  /* -------------------------------------------------------------- */

  const handleSearch = (value: string) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, query: value.trim() }));
  };

  const handleFilterChange = <K extends keyof FiltersState>(
    key: K,
    value: FiltersState[K],
  ) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleTableChangePage = (nextPage: number, nextPageSize?: number) => {
    setPage(nextPage);
    if (nextPageSize && nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
    }
  };

  const handleOpenResource = (record: KnowledgeResource) => {
    router.push(`/konnected/learning-library/resource/${record.id}`);
  };

  const handleSaveOffline = (record: KnowledgeResource) => {
    // Placeholder behaviour; plug into Offline Content API later
    // eslint-disable-next-line no-console
    console.info('Save offline requested for resource', record.id);
  };

  const handleShare = (record: KnowledgeResource) => {
    // Placeholder behaviour; plug into share/clipboard API later
    // eslint-disable-next-line no-console
    console.info('Share requested for resource', record.id);
  };

  /* -------------------------------------------------------------- */
  /*  Table configuration                                           */
  /* -------------------------------------------------------------- */

  const columns: ColumnsType<KnowledgeResource> = useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        width: 280,
        render: (value: string, record) => (
          <Space direction="vertical" size={2}>
            <Button
              type="link"
              style={{ padding: 0 }}
              onClick={() => handleOpenResource(record)}
            >
              {value}
            </Button>
            {record.description && (
              <Text type="secondary" ellipsis={{ tooltip: record.description }}>
                {record.description}
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: 'Subject',
        dataIndex: 'subject',
        key: 'subject',
        width: 140,
        render: (value: string) => <Tag>{value}</Tag>,
      },
      {
        title: 'Type',
        dataIndex: 'resource_type',
        key: 'resource_type',
        width: 120,
        render: (value: string) => (
          <Tag color="default">{value.charAt(0).toUpperCase() + value.slice(1)}</Tag>
        ),
      },
      {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
        width: 120,
        render: (value: KnowledgeLevel) => (
          <Tag>
            {value === 'beginner'
              ? 'Beginner'
              : value === 'intermediate'
              ? 'Intermediate'
              : 'Advanced'}
          </Tag>
        ),
      },
      {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        width: 120,
      },
      {
        title: 'Rating',
        dataIndex: 'average_rating',
        key: 'average_rating',
        width: 160,
        render: (value: number | null | undefined) =>
          value != null ? (
            <Space size={4}>
              <Rate allowHalf disabled value={value} />
              <Text type="secondary">{value.toFixed(1)}</Text>
            </Space>
          ) : (
            <Text type="secondary">Not rated</Text>
          ),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        width: 220,
        render: (tags?: string[]) => {
          if (!tags || !tags.length) {
            return <Text type="secondary">—</Text>;
          }
          const maxVisible = 3;
          const visible = tags.slice(0, maxVisible);
          const remaining = tags.length - visible.length;

          return (
            <Space size={[4, 4]} wrap>
              {visible.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
              {remaining > 0 && <Tag>+{remaining}</Tag>}
            </Space>
          );
        },
      },
      {
        title: 'Progress',
        dataIndex: 'user_progress_percent',
        key: 'user_progress_percent',
        width: 130,
        render: (value: number | null | undefined) =>
          value != null ? (
            <Text>{`${Math.round(value)}%`}</Text>
          ) : (
            <Text type="secondary">Not started</Text>
          ),
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        width: 190,
        render: (_: unknown, record) => (
          <Space>
            <Button type="primary" size="small" onClick={() => handleOpenResource(record)}>
              Open
            </Button>
            {record.is_offline_available && (
              <Button
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleSaveOffline(record)}
              >
                Offline
              </Button>
            )}
            <Button
              size="small"
              icon={<ShareAltOutlined />}
              onClick={() => handleShare(record)}
            />
          </Space>
        ),
      },
    ],
    [],
  );

  /* -------------------------------------------------------------- */
  /*  Derived UI bits                                               */
  /* -------------------------------------------------------------- */

  const hasResults = resources.length > 0;
  const showTotalLabel =
    total > 0 ? `${total} resource${total > 1 ? 's' : ''} found` : undefined;

  /* -------------------------------------------------------------- */
  /*  Render                                                        */
  /* -------------------------------------------------------------- */

  return (
    <KonnectedPageShell
      title="KonnectED · Knowledge · Browse resources"
      subtitle="Explore the shared learning library by subject, level, language, and content type."
      secondaryActions={
        <Space>
          <Button icon={<FilterOutlined />}>Filters</Button>
        </Space>
      }
      primaryAction={
        <Button
          type="primary"
          onClick={() => router.push('/konnected/learning-library/recommended-resources')}
        >
          View recommended
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        {/* Left column: Filters */}
        <Col xs={24} md={8} lg={7}>
          <Card
            title={
              <Space>
                <FilterOutlined />
                <span>Filter resources</span>
              </Space>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Search
                placeholder="Search by title, keywords, or description"
                allowClear
                enterButton={<SearchOutlined />}
                defaultValue={filters.query}
                onSearch={handleSearch}
              />

              <div>
                <Text strong>Subject</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  placeholder={loadingMeta ? 'Loading subjects…' : 'All subjects'}
                  loading={loadingMeta}
                  allowClear
                  value={filters.subject}
                  onChange={(value) => handleFilterChange('subject', value || undefined)}
                  options={subjects.map((s) => ({ label: s, value: s }))}
                />
              </div>

              <div>
                <Text strong>Level</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  placeholder="All levels"
                  allowClear
                  value={filters.level}
                  onChange={(value) => handleFilterChange('level', value || undefined)}
                  options={
                    levels.length
                      ? levels.map((lvl) => ({
                          label:
                            lvl === 'beginner'
                              ? 'Beginner'
                              : lvl === 'intermediate'
                              ? 'Intermediate'
                              : 'Advanced',
                          value: lvl,
                        }))
                      : [
                          { label: 'Beginner', value: 'beginner' },
                          { label: 'Intermediate', value: 'intermediate' },
                          { label: 'Advanced', value: 'advanced' },
                        ]
                  }
                />
              </div>

              <div>
                <Text strong>Language</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  placeholder="All languages"
                  allowClear
                  value={filters.language}
                  onChange={(value) => handleFilterChange('language', value || undefined)}
                  options={languages.map((lang) => ({ label: lang, value: lang }))}
                />
              </div>

              <div>
                <Text strong>Type</Text>
                <Select
                  style={{ width: '100%', marginTop: 4 }}
                  placeholder="All content types"
                  allowClear
                  value={filters.resourceType}
                  onChange={(value) =>
                    handleFilterChange('resourceType', value || undefined)
                  }
                  options={resourceTypes.map((t) => ({
                    label: t.charAt(0).toUpperCase() + t.slice(1),
                    value: t,
                  }))}
                />
              </div>

              <div>
                <Text strong>Sort by</Text>
                <Select<SortOption>
                  style={{ width: '100%', marginTop: 4 }}
                  value={filters.sort}
                  onChange={(value) => handleFilterChange('sort', value)}
                  options={[
                    { label: 'Relevance', value: 'relevance' },
                    { label: 'Newest first', value: 'newest' },
                    { label: 'Most popular', value: 'popular' },
                    { label: 'Shortest duration', value: 'shortest' },
                    { label: 'Longest duration', value: 'longest' },
                  ]}
                />
              </div>
            </Space>
          </Card>
        </Col>

        {/* Right column: Results table */}
        <Col xs={24} md={16} lg={17}>
          <Card
            title="Browse resources"
            extra={
              showTotalLabel && (
                <Text type="secondary" style={{ whiteSpace: 'nowrap' }}>
                  {showTotalLabel}
                </Text>
              )
            }
          >
            {error && (
              <div style={{ marginBottom: 16 }}>
                <Alert
                  type="error"
                  showIcon
                  message="Error loading resources"
                  description={error}
                />
              </div>
            )}

            {loading && !hasResults ? (
              <div
                style={{
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Spin tip="Loading resources…" />
              </div>
            ) : (
              <>
                <Table<KnowledgeResource>
                  rowKey={(row) => row.id}
                  size="middle"
                  bordered
                  columns={columns}
                  dataSource={resources}
                  loading={loading}
                  pagination={false}
                  scroll={{ x: 1100 }}
                  locale={{
                    emptyText: (
                      <div style={{ padding: '24px 0' }}>
                        <Text type="secondary">
                          No resources match your filters yet. Try adjusting your search
                          terms or filter options.
                        </Text>
                      </div>
                    ),
                  }}
                />

                <div
                  style={{
                    marginTop: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <Text type="secondary">
                    Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
                  </Text>

                  <Pagination
                    current={page}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger
                    pageSizeOptions={['6', '12', '24', '48']}
                    showTotal={(t) => `${t} item${t === 1 ? '' : 's'}`}
                    onChange={handleTableChangePage}
                  />
                </div>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </KonnectedPageShell>
  );
}
