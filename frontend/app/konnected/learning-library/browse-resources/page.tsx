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
  subject?: string;
  level?: KnowledgeLevel;
  language?: string;
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
/*  API endpoints                                                      */
/*  - Aligned with DRF router: /api/knowledge-resources/              */
/*  - Metadata endpoint is optional; call is non-blocking.            */
/* ------------------------------------------------------------------ */

const KNOWLEDGE_RESOURCES_ENDPOINT = '/api/knowledge-resources/';
const KNOWLEDGE_METADATA_ENDPOINT = '/api/knowledge-resources/metadata/';

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

  // Loading / error states
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMeta, setLoadingMeta] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /* ------------------------------------------------------------------ */
  /*  Data fetching                                                      */
  /* ------------------------------------------------------------------ */

  const fetchResources = useCallback(
    async (overridePage?: number, overridePageSize?: number) => {
      setLoading(true);
      setError(null);

      const currentPage = overridePage ?? page;
      const currentPageSize = overridePageSize ?? pageSize;

      try {
        const params: Record<string, unknown> = {
          page: currentPage,
          page_size: currentPageSize,
        };

        if (filters.query) {
          params.search = filters.query;
        }
        if (filters.subject) {
          params.subject = filters.subject;
        }
        if (filters.level) {
          params.level = filters.level;
        }
        if (filters.language) {
          params.language = filters.language;
        }
        if (filters.resourceType) {
          params.resource_type = filters.resourceType;
        }

        const ordering = mapSortToOrdering(filters.sort);
        if (ordering) {
          params.ordering = ordering;
        }

        const response = await axios.get<KnowledgeResourceListResponse>(
          KNOWLEDGE_RESOURCES_ENDPOINT,
          { params },
        );

        setResources(response.data.results ?? []);
        setTotal(response.data.count ?? response.data.results.length ?? 0);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Unable to load knowledge resources.';
        setError(msg);
        setResources([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [filters, page, pageSize],
  );

  const fetchMetadata = useCallback(async () => {
    setLoadingMeta(true);

    try {
      const response = await axios.get<KnowledgeMetadataResponse>(KNOWLEDGE_METADATA_ENDPOINT);
      const data = response.data;

      setSubjects(data.subjects ?? []);
      setLevels(data.levels ?? []);
      setLanguages(data.languages ?? []);
      setResourceTypes(data.resource_types ?? []);
    } catch {
      // Metadata is purely additive; failure should not block the main list.
    } finally {
      setLoadingMeta(false);
    }
  }, []);

  // Single effect: reacts to page / size / filters
  useEffect(() => {
    fetchResources(page, pageSize);
  }, [page, pageSize, fetchResources]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  /* ------------------------------------------------------------------ */
  /*  Handlers                                                          */
  /* ------------------------------------------------------------------ */

  const handleSearch = (value: string) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      query: value.trim(),
    }));
  };

  const handleFilterChange =
    <K extends keyof FiltersState>(key: K) =>
    (value: FiltersState[K]) => {
      setPage(1);
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    };

  const handleSortChange = (value: SortOption) => {
    setPage(1);
    setFilters((prev) => ({
      ...prev,
      sort: value,
    }));
  };

  const handleTableChangePage = (nextPage: number, nextPageSize?: number) => {
    setPage(nextPage);
    if (nextPageSize && nextPageSize !== pageSize) {
      setPageSize(nextPageSize);
    }
  };

  const handleOpenResource = (record: KnowledgeResource) => {
    // If you later add a dedicated resource detail route, adapt this.
    router.push(`/konnected/learning-library/resource/${record.id}`);
  };

  /* ------------------------------------------------------------------ */
  /*  Table columns                                                     */
  /* ------------------------------------------------------------------ */

  const columns: ColumnsType<KnowledgeResource> = useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
        render: (value: string, record) => (
          <Space direction="vertical" size={2}>
            <Button type="link" onClick={() => handleOpenResource(record)} style={{ padding: 0 }}>
              {value}
            </Button>
            {record.description && (
              <Text type="secondary" style={{ fontSize: 12 }}>
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
        render: (value?: string) =>
          value ? (
            <Tag color="blue">{value}</Tag>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Not specified
            </Text>
          ),
      },
      {
        title: 'Type',
        dataIndex: 'resource_type',
        key: 'resource_type',
        render: (value: string) => (
          <Tag color="geekblue" style={{ textTransform: 'capitalize' }}>
            {value || 'other'}
          </Tag>
        ),
      },
      {
        title: 'Level',
        dataIndex: 'level',
        key: 'level',
        render: (value?: KnowledgeLevel) =>
          value ? (
            <Tag color="purple" style={{ textTransform: 'capitalize' }}>
              {value}
            </Tag>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              General
            </Text>
          ),
      },
      {
        title: 'Language',
        dataIndex: 'language',
        key: 'language',
        render: (value?: string) =>
          value ? (
            <Tag>{value}</Tag>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              N/A
            </Text>
          ),
      },
      {
        title: 'Rating',
        dataIndex: 'average_rating',
        key: 'average_rating',
        render: (value?: number | null) =>
          typeof value === 'number' ? (
            <Space size={4}>
              <Rate allowHalf disabled defaultValue={value} />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {value.toFixed(1)}
              </Text>
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Not rated yet
            </Text>
          ),
      },
      {
        title: 'Tags',
        dataIndex: 'tags',
        key: 'tags',
        render: (tags?: string[]) =>
          tags && tags.length > 0 ? (
            <Space size={[4, 4]} wrap>
              {tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              No tags
            </Text>
          ),
      },
      {
        title: 'Estimated time',
        dataIndex: 'estimated_minutes',
        key: 'estimated_minutes',
        render: (value?: number | null) =>
          typeof value === 'number' ? (
            <Text>{value} min</Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Not specified
            </Text>
          ),
      },
      {
        title: 'Progress',
        dataIndex: 'user_progress_percent',
        key: 'user_progress_percent',
        render: (value?: number | null) =>
          typeof value === 'number' ? (
            <Text>{value.toFixed(0)}%</Text>
          ) : (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Not started
            </Text>
          ),
      },
      {
        title: 'Actions',
        key: 'actions',
        fixed: 'right',
        render: (_, record) => (
          <Space>
            <Button size="small" onClick={() => handleOpenResource(record)}>
              Open
            </Button>
            {record.is_offline_available && (
              <Button size="small" icon={<DownloadOutlined />}>
                Offline
              </Button>
            )}
          </Space>
        ),
      },
    ],
    [handleOpenResource],
  );

  const hasResults = resources.length > 0;

  const filtersActive = useMemo(
    () =>
      Boolean(
        filters.query ||
          filters.subject ||
          filters.level ||
          filters.language ||
          filters.resourceType,
      ),
    [filters],
  );

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <KonnectedPageShell
      title="Browse learning resources"
      subtitle="Explore the shared knowledge library and filter by subject, level, language, and more."
      primaryAction={
        <Space>
          <Button icon={<DownloadOutlined />}>Export selection</Button>
          <Button icon={<ShareAltOutlined />}>Share filters</Button>
        </Space>
      }
      secondaryActions={
        <Button icon={<FilterOutlined />} onClick={() => fetchResources(1, pageSize)}>
          Refresh
        </Button>
      }
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              {/* Search + quick filters row */}
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} md={10}>
                  <Search
                    placeholder="Search by title, subject, keywords…"
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    defaultValue={filters.query}
                  />
                </Col>

                <Col xs={24} md={14}>
                  <Row gutter={[8, 8]} justify="end">
                    <Col xs={24} md={12} lg={6}>
                      <Select
                        allowClear
                        placeholder="Subject"
                        value={filters.subject}
                        style={{ width: '100%' }}
                        loading={loadingMeta}
                        onChange={handleFilterChange('subject')}
                      >
                        {subjects.map((subject) => (
                          <Select.Option key={subject} value={subject}>
                            {subject}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>

                    <Col xs={24} md={12} lg={5}>
                      <Select
                        allowClear
                        placeholder="Level"
                        value={filters.level}
                        style={{ width: '100%' }}
                        loading={loadingMeta}
                        onChange={handleFilterChange('level')}
                      >
                        {levels.map((level) => (
                          <Select.Option key={level} value={level}>
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>

                    <Col xs={24} md={12} lg={5}>
                      <Select
                        allowClear
                        placeholder="Language"
                        value={filters.language}
                        style={{ width: '100%' }}
                        loading={loadingMeta}
                        onChange={handleFilterChange('language')}
                      >
                        {languages.map((lang) => (
                          <Select.Option key={lang} value={lang}>
                            {lang}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>

                    <Col xs={24} md={12} lg={5}>
                      <Select
                        allowClear
                        placeholder="Type"
                        value={filters.resourceType}
                        style={{ width: '100%' }}
                        loading={loadingMeta}
                        onChange={handleFilterChange('resourceType')}
                      >
                        {resourceTypes.map((t) => (
                          <Select.Option key={t} value={t}>
                            {t}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>

                    <Col xs={24} md={12} lg={3}>
                      <Select
                        value={filters.sort}
                        onChange={handleSortChange}
                        style={{ width: '100%' }}
                      >
                        <Select.Option value="relevance">Best match</Select.Option>
                        <Select.Option value="newest">Newest</Select.Option>
                        <Select.Option value="popular">Most popular</Select.Option>
                        <Select.Option value="shortest">Shortest first</Select.Option>
                        <Select.Option value="longest">Longest first</Select.Option>
                      </Select>
                    </Col>
                  </Row>
                </Col>
              </Row>

              {/* Active filters / helper text */}
              <Row>
                <Col span={24}>
                  {filtersActive ? (
                    <Space size={[8, 8]} wrap>
                      <Text type="secondary">Active filters:</Text>
                      {filters.subject && <Tag color="blue">Subject: {filters.subject}</Tag>}
                      {filters.level && (
                        <Tag color="purple">
                          Level:{' '}
                          {filters.level.charAt(0).toUpperCase() + filters.level.slice(1)}
                        </Tag>
                      )}
                      {filters.language && <Tag>Language: {filters.language}</Tag>}
                      {filters.resourceType && (
                        <Tag color="geekblue">Type: {filters.resourceType}</Tag>
                      )}
                      <Button
                        size="small"
                        onClick={() => {
                          setFilters({ query: '', sort: 'relevance' });
                          setPage(1);
                        }}
                      >
                        Clear filters
                      </Button>
                    </Space>
                  ) : (
                    <Text type="secondary">
                      Use the search box and filters above to explore the knowledge library.
                    </Text>
                  )}
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>

        <Col span={24}>
          <Card
            title="Library results"
            extra={
              <Space>
                <Button
                  icon={<FilterOutlined />}
                  onClick={() => fetchResources(1, pageSize)}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </Space>
            }
          >
            {error && (
              <Alert
                type="error"
                showIcon
                message="Unable to load resources"
                description={error}
                style={{ marginBottom: 16 }}
              />
            )}

            {loading && !hasResults ? (
              <Spin
                tip="Loading resources…"
                size="large"
                style={{
                  width: '100%',
                  minHeight: 200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div />
              </Spin>
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
