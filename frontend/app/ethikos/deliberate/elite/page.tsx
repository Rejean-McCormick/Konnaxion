// FILE: frontend/app/ethikos/deliberate/elite/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRightOutlined,
  BranchesOutlined,
  FireOutlined,
  PlusOutlined,
  ReadOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  StarOutlined,
} from '@ant-design/icons'
import {
  ModalForm,
  ProCard,
  type ProColumns,
  ProFormSelect,
  ProFormText,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components'
import { useInterval, useRequest } from 'ahooks'
import {
  Alert,
  App,
  Button,
  Drawer,
  Empty,
  Input,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'

import EthikosPageShell from '@/app/ethikos/EthikosPageShell'
import styles from './page.module.css'
import {
  createEliteTopic,
  fetchEliteTopics,
  fetchTopicPreview,
} from '@/services/deliberate'
import type {
  CreateEliteTopicPayload,
  EliteTopic,
} from '@/services/deliberate'
import { fetchEthikosCategories } from '@/services/ethikos'
import type {
  EthikosCategoryApi,
  EthikosId,
  TopicPreviewResponse,
} from '@/services/ethikos'

dayjs.extend(relativeTime)

const { Paragraph, Text } = Typography

type TopicStatus = 'open' | 'closed' | 'archived'
type TableMode = 'wide' | 'compact' | 'mobile'

type CategoryLike =
  | string
  | {
      id?: EthikosId
      name?: string
      description?: string | null
    }
  | null
  | undefined

type RawEliteTopic = Partial<EliteTopic> & {
  id: EthikosId
  title: string
  category?: CategoryLike
  categoryLabel?: string
  category_name?: string | null
  createdAt?: string
  created_at?: string
  lastActivity?: string
  last_activity?: string
  hot?: boolean
  stanceCount?: number
  total_votes?: number | null
  status?: TopicStatus
}

interface TopicRow {
  id: string
  title: string
  categoryId?: EthikosId
  categoryLabel?: string
  createdAt: string
  lastActivity: string
  hot: boolean
  stanceCount: number
  status: TopicStatus
}

interface PreviewState {
  topicId: string
  fallbackTitle: string
  fallbackCategory?: string
}

type CreateTopicForm = {
  title: string
  categoryId: EthikosId
}

function getCategoryLabel(category: CategoryLike): string | undefined {
  if (!category) {
    return undefined
  }

  if (typeof category === 'string') {
    return category
  }

  return category.name || undefined
}

function getCategoryId(category: CategoryLike): EthikosId | undefined {
  if (!category || typeof category === 'string') {
    return undefined
  }

  return category.id
}

function normalizeStatus(value: unknown): TopicStatus {
  if (value === 'open' || value === 'closed' || value === 'archived') {
    return value
  }

  return 'open'
}

function statusColor(status: TopicStatus): string {
  if (status === 'open') {
    return 'green'
  }

  if (status === 'closed') {
    return 'volcano'
  }

  return 'default'
}

function normalizeTopic(raw: RawEliteTopic): TopicRow {
  const createdAt =
    raw.createdAt ??
    raw.created_at ??
    raw.lastActivity ??
    raw.last_activity ??
    new Date().toISOString()

  const lastActivity =
    raw.lastActivity ??
    raw.last_activity ??
    raw.createdAt ??
    raw.created_at ??
    createdAt

  const stanceCount =
    typeof raw.stanceCount === 'number'
      ? raw.stanceCount
      : typeof raw.total_votes === 'number'
        ? raw.total_votes
        : 0

  const categoryLabel =
    raw.categoryLabel ??
    raw.category_name ??
    getCategoryLabel(raw.category)

  const lastActivityDate = dayjs(lastActivity)
  const hot =
    typeof raw.hot === 'boolean'
      ? raw.hot
      : lastActivityDate.isValid() &&
        lastActivityDate.isAfter(dayjs().subtract(24, 'hour')) &&
        stanceCount >= 3

  return {
    id: String(raw.id),
    title: raw.title,
    categoryId: getCategoryId(raw.category),
    categoryLabel: categoryLabel || undefined,
    createdAt,
    lastActivity,
    hot,
    stanceCount,
    status: normalizeStatus(raw.status),
  }
}

async function fetchEliteRows(): Promise<{ list: TopicRow[] }> {
  const response = await fetchEliteTopics()

  return {
    list: (response?.list ?? []).map((topic) =>
      normalizeTopic(topic as unknown as RawEliteTopic),
    ),
  }
}

function previewOpenedAt(preview?: TopicPreviewResponse): string | undefined {
  return preview?.createdAt
}

function previewId(
  preview: TopicPreviewResponse | undefined,
  fallbackId: string | null,
): string {
  if (preview?.id != null) {
    return String(preview.id)
  }

  return fallbackId ?? ''
}

function previewTitle(
  preview: TopicPreviewResponse | undefined,
  fallback?: PreviewState | null,
): string {
  return preview?.title || fallback?.fallbackTitle || 'Topic preview'
}

function previewCategory(
  preview: TopicPreviewResponse | undefined,
  fallback?: PreviewState | null,
): string {
  return preview?.category || fallback?.fallbackCategory || 'Uncategorised'
}

function previewHasBody(preview?: TopicPreviewResponse): boolean {
  return Boolean(
    preview?.description ||
      (Array.isArray(preview?.latest) && preview.latest.length > 0),
  )
}

function topicUrl(topicId: string): string {
  return `/ethikos/deliberate/${topicId}?sidebar=ethikos`
}

export default function EliteAgora(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter()
  const { message } = App.useApp()

  const {
    data,
    loading,
    error,
    refresh,
  } = useRequest<{ list: TopicRow[] }, []>(fetchEliteRows)

  useInterval(refresh, 60_000)

  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [previewState, setPreviewState] =
    React.useState<PreviewState | null>(null)
  const [query, setQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<string>()
  const [statusFilter, setStatusFilter] = React.useState<TopicStatus>()
  const tableRegionRef = React.useRef<HTMLDivElement>(null)
  const [tableWidth, setTableWidth] = React.useState(0)

  React.useEffect(() => {
    const element = tableRegionRef.current

    if (!element) {
      return
    }

    const updateWidth = () => {
      setTableWidth(element.getBoundingClientRect().width)
    }

    updateWidth()

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateWidth)
      return () => window.removeEventListener('resize', updateWidth)
    }

    const observer = new ResizeObserver(([entry]) => {
      if (entry) {
        setTableWidth(entry.contentRect.width)
      }
    })

    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
  } = useRequest<TopicPreviewResponse, [string]>(fetchTopicPreview, {
    manual: true,
    onError: (requestError) => {
      console.error('Failed to load topic preview', requestError)
      message.error(i18nT("ui.ethikos.deliberate.elite.couldNotLoadTopicPreview"))
    },
  })

  const previewTopicId = previewState?.topicId ?? null

  const openPreview = React.useCallback(
    (row: TopicRow) => {
      setPreviewState({
        topicId: row.id,
        fallbackTitle: row.title,
        fallbackCategory: row.categoryLabel,
      })
      setPreviewOpen(true)
      loadPreview(row.id)
    },
    [loadPreview],
  )

  const closePreview = React.useCallback(() => {
    setPreviewOpen(false)
    setPreviewState(null)
  }, [])

  const rows = React.useMemo(() => data?.list ?? [], [data])
  const openRows = React.useMemo(
    () => rows.filter((topic) => topic.status === 'open'),
    [rows],
  )

  const tableMode = React.useMemo<TableMode>(() => {
    if (tableWidth === 0) {
      return 'compact'
    }

    if (tableWidth < 560) {
      return 'mobile'
    }

    if (tableWidth < 980) {
      return 'compact'
    }

    return 'wide'
  }, [tableWidth])

  const filteredRows = React.useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase()

    return rows.filter((topic) => {
      if (
        normalizedQuery &&
        !`${topic.title} ${topic.categoryLabel ?? ''}`
          .toLocaleLowerCase()
          .includes(normalizedQuery)
      ) {
        return false
      }

      if (categoryFilter && topic.categoryLabel !== categoryFilter) {
        return false
      }

      if (statusFilter && topic.status !== statusFilter) {
        return false
      }

      return true
    })
  }, [categoryFilter, query, rows, statusFilter])

  const headerStats = React.useMemo(
    () => [
      {
        label: i18nT("ui.ethikos.deliberate.elite.openTopics"),
        value: openRows.length,
        description: i18nT("ui.ethikos.deliberate.elite.availableForStanceAndArgumentContributions"),
      },
      {
        label: i18nT("ui.ethikos.deliberate.elite.avgStancesTopic"),
        value: rows.length
          ? Number(
              (
                rows.reduce((sum, topic) => sum + topic.stanceCount, 0) /
                rows.length
              ).toFixed(1),
            )
          : 0,
        description: i18nT("ui.ethikos.deliberate.elite.participationSignalAcrossListedTopics"),
      },
      {
        label: i18nT("ui.ethikos.deliberate.elite.needsAttention"),
        value: openRows.filter((topic) => topic.stanceCount === 0).length,
        description: i18nT("ui.ethikos.deliberate.elite.openTopicsWithoutRecordedStances"),
      },
      {
        label: i18nT("ui.ethikos.deliberate.elite.trending"),
        value: rows.filter((topic) => topic.hot).length,
        description: i18nT("ui.ethikos.deliberate.elite.activeInTheLast24Hours"),
      },
    ],
    [openRows, rows, i18nT],
  )

  const categoryFilters = React.useMemo(
    () =>
      Array.from(
        new Set(
          rows
            .map((topic) => topic.categoryLabel)
            .filter((label): label is string => Boolean(label)),
        ),
      ).map((label) => ({
        label,
        value: label,
      })),
    [rows],
  )

  const statusOptions = React.useMemo(
    () => [
      { label: i18nT("ui.ethikos.deliberate.elite.open"), value: 'open' },
      { label: i18nT("ui.ethikos.deliberate.elite.closed"), value: 'closed' },
      { label: i18nT("ui.ethikos.deliberate.elite.archived"), value: 'archived' },
    ],
    [i18nT],
  )

  const renderTopicCell = React.useCallback(
    (row: TopicRow) => (
      <div className={styles.topicCell}>
        <Button
          type="link"
          onClick={() => openPreview(row)}
          className={styles.topicButton}
        >
          {row.title}
        </Button>

        <Space size={6} wrap className={styles.topicSignals}>
          {row.hot ? (
            <Tooltip title={i18nT("ui.ethikos.deliberate.elite.recentActivity")}>
              <Tag icon={<FireOutlined />} color="volcano">
                {i18nT("ui.ethikos.deliberate.elite.active")}
              </Tag>
            </Tooltip>
          ) : null}

          {row.stanceCount === 0 && row.status === 'open' ? (
            <Tag color="gold">
              {i18nT("ui.ethikos.deliberate.elite.needsFirstStance")}
            </Tag>
          ) : null}
        </Space>
      </div>
    ),
    [i18nT, openPreview],
  )

  const renderMetadata = React.useCallback(
    (row: TopicRow, mobile = false) => {
      const lastActivity = dayjs(row.lastActivity)
      const activityLabel = lastActivity.isValid()
        ? lastActivity.fromNow()
        : i18nT("ui.ethikos.deliberate.elite.unknown")

      return (
        <div
          className={mobile ? styles.mobileMetadata : styles.metadataStack}
        >
          <div className={styles.metadataTags}>
            {row.categoryLabel ? (
              <Tag color="geekblue">{row.categoryLabel}</Tag>
            ) : (
              <Text type="secondary">
                {i18nT("ui.ethikos.deliberate.elite.uncategorised")}
              </Text>
            )}
            <Tag color={statusColor(row.status)}>{row.status}</Tag>
          </div>

          <div className={styles.metadataFacts}>
            <Text>
              <strong>{row.stanceCount}</strong>{' '}
              {i18nT("ui.ethikos.deliberate.elite.stances")}
            </Text>
            <Text type="secondary">
              {i18nT("ui.ethikos.deliberate.elite.lastActivity")}: {activityLabel}
            </Text>
          </div>

          <Button
            type="primary"
            size="small"
            className={styles.openThreadButton}
            onClick={() => router.push(topicUrl(row.id))}
          >
            {i18nT("ui.ethikos.deliberate.elite.openThread")}
          </Button>
        </div>
      )
    },
    [i18nT, router],
  )

  const columns = React.useMemo<ProColumns<TopicRow>[]>(() => {
    if (tableMode === 'mobile') {
      return [
        {
          title: i18nT("ui.ethikos.deliberate.elite.topic"),
          dataIndex: 'title',
          render: (_dom, row) => (
            <div className={styles.mobileTopicRow}>
              {renderTopicCell(row)}
              {renderMetadata(row, true)}
            </div>
          ),
        },
      ]
    }

    if (tableMode === 'compact') {
      return [
        {
          title: i18nT("ui.ethikos.deliberate.elite.topic"),
          dataIndex: 'title',
          render: (_dom, row) => renderTopicCell(row),
        },
        {
          title: '',
          key: 'metadata',
          width: 220,
          render: (_dom, row) => renderMetadata(row),
        },
      ]
    }

    return [
      {
        title: i18nT("ui.ethikos.deliberate.elite.topic"),
        dataIndex: 'title',
        render: (_dom, row) => renderTopicCell(row),
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.theme"),
        dataIndex: 'categoryLabel',
        width: 150,
        render: (_dom, row) =>
          row.categoryLabel ? (
            <Tag color="geekblue">{row.categoryLabel}</Tag>
          ) : (
            <Text type="secondary">
              {i18nT("ui.ethikos.deliberate.elite.uncategorised")}
            </Text>
          ),
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.status"),
        dataIndex: 'status',
        width: 110,
        render: (_dom, row) => (
          <Tag color={statusColor(row.status)}>{row.status}</Tag>
        ),
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.stances"),
        dataIndex: 'stanceCount',
        sorter: (a, b) => a.stanceCount - b.stanceCount,
        align: 'right',
        width: 90,
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.lastActivity"),
        dataIndex: 'lastActivity',
        sorter: (a, b) =>
          dayjs(a.lastActivity).valueOf() - dayjs(b.lastActivity).valueOf(),
        width: 140,
        render: (_dom, row) => {
          const lastActivity = dayjs(row.lastActivity)

          return lastActivity.isValid() ? (
            lastActivity.fromNow()
          ) : (
            <Text type="secondary">
              {i18nT("ui.ethikos.deliberate.elite.unknown")}
            </Text>
          )
        },
      },
      {
        title: '',
        key: 'action',
        width: 125,
        render: (_dom, row) => (
          <Button
            type="primary"
            size="small"
            onClick={() => router.push(topicUrl(row.id))}
          >
            {i18nT("ui.ethikos.deliberate.elite.openThread")}
          </Button>
        ),
      },
    ]
  }, [i18nT, renderMetadata, renderTopicCell, router, tableMode])

  const openedAt = previewOpenedAt(preview)
  const resolvedPreviewId = previewId(preview, previewTopicId)
  const drawerTitle = previewTitle(preview, previewState)
  const drawerCategory = previewCategory(preview, previewState)
  const hasPreviewBody = previewHasBody(preview)

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.deliberate.elite.expertDeliberation")}
      metaTitle={i18nT("ui.ethikos.deliberate.elite.expertDeliberation")}
      subtitle={
        <span>
          {i18nT("ui.ethikos.deliberate.elite.chooseAStructuredDebateTopicReviewThe")}
        </span>
      }
      sectionLabel={i18nT("ui.ethikos.deliberate.elite.deliberate")}
      primaryAction={
        <Link href="/ethikos/deliberate/guidelines?sidebar=ethikos" prefetch={false}>
          <Button icon={<ReadOutlined />}>{i18nT("ui.ethikos.deliberate.elite.participationGuidelines")}</Button>
        </Link>
      }
    >
      <div className={styles.pageContent}>
        <ProCard
          title={
            <Space>
              <BranchesOutlined />
              <span>{i18nT("ui.ethikos.deliberate.elite.deliberationWorkflow")}</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <ProCard gutter={[16, 16]} wrap ghost>
            <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <StarOutlined />
                  <Text strong>{i18nT("ui.ethikos.deliberate.elite.text1ChooseATopic")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.deliberate.elite.startFromAnOpenPublicOrExpert")}
                </Paragraph>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <SafetyCertificateOutlined />
                  <Text strong>{i18nT("ui.ethikos.deliberate.elite.text2FormAStance")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.deliberate.elite.useThe3To3ScaleTo")}
                </Paragraph>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <ArrowRightOutlined />
                  <Text strong>{i18nT("ui.ethikos.deliberate.elite.text3AddReasons")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.deliberate.elite.addArgumentsRepliesSourcesAndSuggestionsSo")}
                </Paragraph>
              </Space>
            </ProCard>
          </ProCard>
        </ProCard>

        {error ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={i18nT("ui.ethikos.deliberate.elite.unableToLoadDeliberationTopics")}
            description={i18nT("ui.ethikos.deliberate.elite.checkTheDeliberateServiceAndTheCanonical")}
          />
        ) : null}

        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          {headerStats.map((stat) => (
            <StatisticCard
              key={stat.label}
              colSpan={{ xs: 24, sm: 12, xl: 6 }}
              statistic={{
                title: stat.label,
                value: stat.value,
                description: stat.description,
              }}
            />
          ))}
        </ProCard>

        <ProCard
          title={i18nT("ui.ethikos.deliberate.elite.topicsReadyForDeliberation")}
        >
          <div className={styles.topicToolbar}>
            <Text type="secondary" className={styles.topicToolbarHint}>
              {i18nT("ui.ethikos.deliberate.elite.openAThreadToReadTheQuestion")}
            </Text>
            <Space size={8}>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
                type="text"
                title={i18nT("ui.ethikos.deliberate.elite.refreshTopics")}
              />
              <NewTopicButton onCreated={refresh} />
            </Space>
          </div>

          <div ref={tableRegionRef} className={styles.tableRegion}>
            <div className={styles.filters}>
              <Input
                allowClear
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={i18nT("ui.ethikos.deliberate.elite.topic")}
                aria-label={i18nT("ui.ethikos.deliberate.elite.topic")}
              />
              <Select
                allowClear
                value={categoryFilter}
                onChange={(value) => setCategoryFilter(value)}
                placeholder={i18nT("ui.ethikos.deliberate.elite.theme")}
                aria-label={i18nT("ui.ethikos.deliberate.elite.theme")}
                options={categoryFilters}
              />
              <Select
                allowClear
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as TopicStatus | undefined)
                }
                placeholder={i18nT("ui.ethikos.deliberate.elite.status")}
                aria-label={i18nT("ui.ethikos.deliberate.elite.status")}
                options={statusOptions}
              />
            </div>

            <div
              className={
                tableMode === 'mobile'
                  ? `${styles.tableShell} ${styles.mobileTable}`
                  : styles.tableShell
              }
            >
              <ProTable<TopicRow>
                rowKey="id"
                columns={columns}
                dataSource={filteredRows}
                loading={loading}
                search={false}
                pagination={{ pageSize: 10, showSizeChanger: false }}
                options={false}
                toolBarRender={false}
                rowClassName={styles.topicRow ?? ''}
                scroll={tableMode === 'wide' ? { x: 980 } : undefined}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={i18nT("ui.ethikos.deliberate.elite.noDeliberationTopicsAvailableYet")}
                    />
                  ),
                }}
              />
            </div>
          </div>
        </ProCard>

        <Drawer
          width="min(560px, 100vw)"
          open={previewOpen}
          onClose={closePreview}
          title={i18nT("ui.ethikos.deliberate.elite.topicPreview")}
          extra={
            resolvedPreviewId ? (
              <Button
                type="primary"
                onClick={() => router.push(topicUrl(resolvedPreviewId))}
              >
                {i18nT("ui.ethikos.deliberate.elite.openThread")}
              </Button>
            ) : null
          }
        >
          {previewLoading ? (
            <Empty description={i18nT("ui.ethikos.deliberate.elite.loadingPreview")} />
          ) : preview || previewState ? (
            <>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary">{i18nT("ui.ethikos.deliberate.elite.question")}</Text>
                  <h3 style={{ marginTop: 4 }}>{drawerTitle}</h3>
                </div>

                <Space wrap>
                  <Tag color="geekblue">{drawerCategory}</Tag>
                  {openedAt ? (
                    <Tag>{dayjs(openedAt).format('YYYY-MM-DD HH:mm')}</Tag>
                  ) : null}
                </Space>

                {preview?.description ? (
                  <div>
                    <Text type="secondary">{i18nT("ui.ethikos.deliberate.elite.context")}</Text>
                    <Paragraph style={{ marginTop: 4 }}>
                      {preview.description}
                    </Paragraph>
                  </div>
                ) : null}

                {preview?.latest && preview.latest.length > 0 ? (
                  <div>
                    <Text type="secondary">{i18nT("ui.ethikos.deliberate.elite.latestStatements")}</Text>
                    <ul style={{ paddingLeft: 20, marginTop: 8 }}>
                      {preview.latest.map((statement) => (
                        <li key={statement.id}>
                          <Text strong>{statement.author}</Text>
                          <span> — {statement.body}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : hasPreviewBody ? null : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={i18nT("ui.ethikos.deliberate.elite.noStatementsYetOpenTheThreadTo")}
                  />
                )}

                <Button
                  type="primary"
                  disabled={!resolvedPreviewId}
                  icon={<ArrowRightOutlined />}
                  onClick={() =>
                    router.push(topicUrl(resolvedPreviewId))
                  }
                >
                  {i18nT("ui.ethikos.deliberate.elite.openTopicThread")}
                </Button>
              </Space>
            </>
          ) : (
            <Empty description={i18nT("ui.ethikos.deliberate.elite.noPreviewDataAvailable")} />
          )}
        </Drawer>
      </div>
    </EthikosPageShell>
  )
}

function NewTopicButton({ onCreated }: { onCreated: () => void }): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [visible, setVisible] = React.useState(false)
  const { message } = App.useApp()

  const { data: categories, loading: loadingCategories } = useRequest<
    EthikosCategoryApi[],
    []
  >(fetchEthikosCategories)

  const { runAsync, loading } = useRequest<
    { id: string },
    [CreateEliteTopicPayload]
  >(createEliteTopic, {
    manual: true,
    onSuccess: () => {
      message.success(i18nT("ui.ethikos.deliberate.elite.topicCreated"))
      setVisible(false)
      onCreated()
    },
    onError: (requestError) => {
      console.error('Failed to create topic', requestError)
      message.error(i18nT("ui.ethikos.deliberate.elite.couldNotCreateTopic"))
    },
  })

  return (
    <>
      <Button
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setVisible(true)}
      >
        {i18nT("ui.ethikos.deliberate.elite.newTopic")}
      </Button>

      <ModalForm<CreateTopicForm>
        title={i18nT("ui.ethikos.deliberate.elite.createNewDeliberationTopic")}
        open={visible}
        onOpenChange={setVisible}
        onFinish={async (values) => {
          await runAsync({
            title: values.title,
            category: values.categoryId,
          })

          return true
        }}
        submitter={{ submitButtonProps: { loading } }}
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.ethikos.deliberate.elite.createAQuestionThatCanBeDebated")}
          description={i18nT("ui.ethikos.deliberate.elite.aGoodDeliberationTopicIsSpecificEnough")}
        />

        <ProFormText
          name="title"
          label={i18nT("ui.ethikos.deliberate.elite.questionOrTopicTitle")}
          placeholder={i18nT("ui.ethikos.deliberate.elite.exampleShouldPublicDatasetsRequireConsentReceipts")}
          rules={[{ required: true, min: 10 }]}
        />

        <ProFormSelect
          name="categoryId"
          label={i18nT("ui.ethikos.deliberate.elite.theme")}
          fieldProps={{
            loading: loadingCategories,
            placeholder: i18nT("ui.ethikos.deliberate.elite.selectATheme"),
          }}
          options={(categories ?? []).map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          rules={[{ required: true, message: i18nT("ui.ethikos.deliberate.elite.pleaseSelectATheme") }]}
        />
      </ModalForm>
    </>
  )
}