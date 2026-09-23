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
  PageContainer,
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
        text: label,
        value: label,
      })),
    [rows],
  )

  const columns = React.useMemo<ProColumns<TopicRow>[]>(
    () => [
      {
        title: i18nT("ui.ethikos.deliberate.elite.topic"),
        dataIndex: 'title',
        ellipsis: true,
        render: (_dom, row) => (
          <Space direction="vertical" size={2}>
            <Button
              type="link"
              onClick={() => openPreview(row)}
              style={{
                padding: 0,
                height: 'auto',
                textAlign: 'left',
                whiteSpace: 'normal',
              }}
            >
              {row.title}
            </Button>

            <Space size={6} wrap>
              {row.hot ? (
                <Tooltip title={i18nT("ui.ethikos.deliberate.elite.recentActivity")}>
                  <Tag icon={<FireOutlined />} color="volcano">
                    {i18nT("ui.ethikos.deliberate.elite.active")}
                  </Tag>
                </Tooltip>
              ) : null}

              {row.stanceCount === 0 && row.status === 'open' ? (
                <Tag color="gold">{i18nT("ui.ethikos.deliberate.elite.needsFirstStance")}</Tag>
              ) : null}
            </Space>
          </Space>
        ),
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.theme"),
        dataIndex: 'categoryLabel',
        filters: categoryFilters,
        onFilter: (value, row) =>
          String(row.categoryLabel ?? '') === String(value),
        render: (_dom, row) =>
          row.categoryLabel ? (
            <Tag color="geekblue">{row.categoryLabel}</Tag>
          ) : (
            <Text type="secondary">{i18nT("ui.ethikos.deliberate.elite.uncategorised")}</Text>
          ),
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.status"),
        dataIndex: 'status',
        width: 120,
        filters: [
          { text: i18nT("ui.ethikos.deliberate.elite.open"), value: 'open' },
          { text: i18nT("ui.ethikos.deliberate.elite.closed"), value: 'closed' },
          { text: i18nT("ui.ethikos.deliberate.elite.archived"), value: 'archived' },
        ],
        onFilter: (value, row) => row.status === String(value),
        render: (_dom, row) => (
          <Tag color={statusColor(row.status)}>{row.status}</Tag>
        ),
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.stances"),
        dataIndex: 'stanceCount',
        sorter: (a, b) => a.stanceCount - b.stanceCount,
        align: 'right',
        width: 110,
      },
      {
        title: i18nT("ui.ethikos.deliberate.elite.lastActivity"),
        dataIndex: 'lastActivity',
        sorter: (a, b) =>
          dayjs(a.lastActivity).valueOf() - dayjs(b.lastActivity).valueOf(),
        width: 160,
        render: (_dom, row) => {
          const lastActivity = dayjs(row.lastActivity)

          return lastActivity.isValid() ? (
            lastActivity.fromNow()
          ) : (
            <Text type="secondary">{i18nT("ui.ethikos.deliberate.elite.unknown")}</Text>
          )
        },
      },
      {
        title: '',
        width: 130,
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
    ],
    [categoryFilters, openPreview, router, i18nT],
  )

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
      <PageContainer
        ghost
        loading={loading}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refresh()}
              type="text"
              title={i18nT("ui.ethikos.deliberate.elite.refreshTopics")}
            />
            <NewTopicButton onCreated={refresh} />
          </Space>
        }
      >
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
          extra={
            <Text type="secondary">
              {i18nT("ui.ethikos.deliberate.elite.openAThreadToReadTheQuestion")}
            </Text>
          }
        >
          <ProTable<TopicRow>
            rowKey="id"
            columns={columns}
            dataSource={rows}
            search={{ labelWidth: 90, filterType: 'light' }}
            pagination={{ pageSize: 10 }}
            options={false}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={i18nT("ui.ethikos.deliberate.elite.noDeliberationTopicsAvailableYet")}
                />
              ),
            }}
          />
        </ProCard>

        <Drawer
          width={560}
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
      </PageContainer>
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