// FILE: frontend/app/ethikos/deliberate/elite/page.tsx
'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  ModalForm,
  ProFormText,
  ProFormSelect,
  type ProColumns,
} from '@ant-design/pro-components'
import {
  Alert,
  App,
  Button,
  Drawer,
  Empty,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import {
  FireOutlined,
  PlusOutlined,
  ReadOutlined,
  ReloadOutlined,
} from '@ant-design/icons'
import { useInterval, useRequest } from 'ahooks'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import EthikosPageShell from '@/app/ethikos/EthikosPageShell'
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
  return preview?.title || fallback?.fallbackTitle || 'Preview'
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

export default function EliteAgora(): JSX.Element {
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

  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
  } = useRequest<TopicPreviewResponse, [string]>(fetchTopicPreview, {
    manual: true,
    onError: (requestError) => {
      console.error('Failed to load topic preview', requestError)
      message.error('Could not load topic preview.')
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

  const headerStats = React.useMemo(
    () => [
      {
        label: 'Open topics',
        value: rows.filter((topic) => topic.status === 'open').length,
      },
      {
        label: 'Avg stances / topic',
        value: rows.length
          ? Number(
              (
                rows.reduce((sum, topic) => sum + topic.stanceCount, 0) /
                rows.length
              ).toFixed(1),
            )
          : 0,
      },
      {
        label: 'Trending',
        value: rows.filter((topic) => topic.hot).length,
      },
    ],
    [rows],
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
        text: label,
        value: label,
      })),
    [rows],
  )

  const columns = React.useMemo<ProColumns<TopicRow>[]>(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        render: (_dom, row) => (
          <Button
            type="link"
            onClick={() => openPreview(row)}
            style={{ padding: 0 }}
          >
            {row.title}
          </Button>
        ),
      },
      {
        title: 'Category',
        dataIndex: 'categoryLabel',
        filters: categoryFilters,
        onFilter: (value, row) =>
          String(row.categoryLabel ?? '') === String(value),
        render: (_dom, row) =>
          row.categoryLabel ? (
            <Tag color="geekblue">{row.categoryLabel}</Tag>
          ) : (
            <Text type="secondary">Uncategorised</Text>
          ),
      },
      {
        title: 'Status',
        dataIndex: 'status',
        width: 110,
        filters: [
          { text: 'Open', value: 'open' },
          { text: 'Closed', value: 'closed' },
          { text: 'Archived', value: 'archived' },
        ],
        onFilter: (value, row) => row.status === String(value),
        render: (_dom, row) => {
          const color =
            row.status === 'open'
              ? 'green'
              : row.status === 'closed'
                ? 'volcano'
                : 'default'

          return <Tag color={color}>{row.status}</Tag>
        },
      },
      {
        title: 'Stances',
        dataIndex: 'stanceCount',
        sorter: (a, b) => a.stanceCount - b.stanceCount,
        align: 'right',
      },
      {
        title: 'Last activity',
        dataIndex: 'lastActivity',
        sorter: (a, b) =>
          dayjs(a.lastActivity).valueOf() - dayjs(b.lastActivity).valueOf(),
        render: (_dom, row) => {
          const lastActivity = dayjs(row.lastActivity)

          return lastActivity.isValid() ? (
            lastActivity.fromNow()
          ) : (
            <Text type="secondary">Unknown</Text>
          )
        },
      },
      {
        title: '',
        dataIndex: 'hot',
        width: 60,
        render: (_dom, row) =>
          row.hot ? (
            <Tooltip title="Trending">
              <FireOutlined style={{ color: '#fa541c' }} />
            </Tooltip>
          ) : null,
      },
    ],
    [categoryFilters, openPreview],
  )

  const openedAt = previewOpenedAt(preview)
  const resolvedPreviewId = previewId(preview, previewTopicId)
  const drawerTitle = previewTitle(preview, previewState)
  const drawerCategory = previewCategory(preview, previewState)
  const hasPreviewBody = previewHasBody(preview)

  return (
    <EthikosPageShell
      title="Deliberate · Elite Agora"
      metaTitle="Deliberate · Elite Agora"
      subtitle={
        <span>
          Expert-only structured debates in Korum using the −3…+3 stance scale
          and EkoH quorum context before surfacing aggregated results.
        </span>
      }
      primaryAction={
        <Link href="/ethikos/deliberate/guidelines" prefetch={false}>
          <Button icon={<ReadOutlined />}>Participation guidelines</Button>
        </Link>
      }
    >
      <PageContainer
        ghost
        loading={loading}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refresh()}
              type="text"
              title="Refresh list"
            />
            <NewTopicButton onCreated={refresh} />
          </Space>
        }
      >
        <ProCard ghost style={{ marginBottom: 16 }}>
          <Alert
            type="info"
            showIcon
            message="Elite agora – expert-only debates"
            description={
              <>
                <div>
                  Stances use the seven-level nuance scale from −3 “strongly
                  against” to +3 “strongly for”, with 0 as neutral.
                </div>
                <div>
                  Aggregated results are only surfaced once enough distinct
                  eligible experts have contributed on a topic.
                </div>
              </>
            }
          />
        </ProCard>

        {error ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="Unable to load elite topics."
            description="Check the Deliberate service and the canonical Ethikos topics endpoint."
          />
        ) : null}

        <ProCard gutter={16} wrap style={{ marginBottom: 16 }}>
          {headerStats.map((stat) => (
            <StatisticCard
              key={stat.label}
              colSpan={{ xs: 24, sm: 8 }}
              statistic={{ title: stat.label, value: stat.value }}
            />
          ))}
        </ProCard>

        <ProTable<TopicRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          search={{ labelWidth: 90, filterType: 'light' }}
          pagination={{ pageSize: 10 }}
          options={false}
        />

        <Drawer
          width={520}
          open={previewOpen}
          onClose={closePreview}
          title={drawerTitle}
        >
          {previewLoading ? (
            <Empty description="Loading…" />
          ) : preview || previewState ? (
            <>
              <p>
                <strong>Category:</strong> {drawerCategory}
              </p>

              {openedAt ? (
                <p>
                  <strong>Opened:</strong>{' '}
                  {dayjs(openedAt).format('YYYY-MM-DD HH:mm')}
                </p>
              ) : null}

              {preview?.description ? (
                <Paragraph>
                  <strong>Summary:</strong> {preview.description}
                </Paragraph>
              ) : null}

              {preview?.latest && preview.latest.length > 0 ? (
                <>
                  <h4>Latest statements</h4>
                  <ul>
                    {preview.latest.map((statement) => (
                      <li key={statement.id}>
                        <em>{statement.author}</em> — {statement.body}
                      </li>
                    ))}
                  </ul>
                </>
              ) : hasPreviewBody ? null : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No statements yet. Open the thread to start the discussion."
                />
              )}

              <Button
                type="primary"
                disabled={!resolvedPreviewId}
                onClick={() =>
                  router.push(`/ethikos/deliberate/${resolvedPreviewId}`)
                }
              >
                Go to thread →
              </Button>
            </>
          ) : (
            <Empty description="No preview data available." />
          )}
        </Drawer>
      </PageContainer>
    </EthikosPageShell>
  )
}

function NewTopicButton({ onCreated }: { onCreated: () => void }): JSX.Element {
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
      message.success('Topic created')
      setVisible(false)
      onCreated()
    },
    onError: (requestError) => {
      console.error('Failed to create topic', requestError)
      message.error('Could not create topic.')
    },
  })

  return (
    <>
      <Button
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setVisible(true)}
      >
        New topic
      </Button>

      <ModalForm<CreateTopicForm>
        title="Create new topic"
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
        <ProFormText
          name="title"
          label="Title"
          rules={[{ required: true, min: 10 }]}
        />

        <ProFormSelect
          name="categoryId"
          label="Category"
          fieldProps={{
            loading: loadingCategories,
            placeholder: 'Select a category',
          }}
          options={(categories ?? []).map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          rules={[{ required: true, message: 'Please select a category' }]}
        />
      </ModalForm>
    </>
  )
}