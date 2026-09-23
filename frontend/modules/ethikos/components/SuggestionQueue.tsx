// FILE: frontend/modules/ethikos/components/SuggestionQueue.tsx
'use client'

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  Alert,
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  message,
  Select,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  fetchArgumentSuggestions,
  submitArgumentSuggestion,
} from '@/services/ethikos'
import type {
  ArgumentSide,
  ArgumentSuggestionApi,
  ArgumentSuggestionStatus,
  EthikosId,
  SubmitArgumentSuggestionPayload,
} from '@/services/ethikos'

const { Text, Paragraph } = Typography
const { TextArea } = Input

type SuggestionSide = ArgumentSide | null
type SuggestionStatusFilter = ArgumentSuggestionStatus | 'all'

export interface SuggestionQueueProps {
  topicId: EthikosId
  /**
   * Parent filtering semantics:
   * - undefined: show all suggestions for the topic.
   * - null: show only top-level suggestions.
   * - id: show only suggestions attached to that parent argument.
   */
  parentId?: EthikosId | null
  side?: SuggestionSide
  status?: SuggestionStatusFilter
  title?: string
  description?: string
  emptyText?: string
  submitLabel?: string
  showComposer?: boolean
  showStatusFilter?: boolean
  autoLoad?: boolean
  disabled?: boolean
  className?: string
  onSubmitted?: (suggestion: ArgumentSuggestionApi) => void
  onLoaded?: (suggestions: ArgumentSuggestionApi[]) => void
  onError?: (error: string) => void
}

interface SuggestionFormValues {
  content?: string
  side?: ArgumentSide | 'none'
}

const STATUS_LABELS: Record<ArgumentSuggestionStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  revision_requested: 'Revision requested',
}

const STATUS_COLORS: Record<ArgumentSuggestionStatus, string> = {
  pending: 'gold',
  accepted: 'green',
  rejected: 'red',
  revision_requested: 'blue',
}

const STATUS_FILTER_OPTIONS = (i18nT: TranslateFunction): { label: string; value: SuggestionStatusFilter }[] => ([
    { label: i18nT("ui.ethikos.suggestionqueue.allStatuses"), value: 'all' },
    { label: i18nT("ui.ethikos.suggestionqueue.pending"), value: 'pending' },
    { label: i18nT("ui.ethikos.suggestionqueue.accepted"), value: 'accepted' },
    { label: i18nT("ui.ethikos.suggestionqueue.rejected"), value: 'rejected' },
    { label: i18nT("ui.ethikos.suggestionqueue.revisionRequested"), value: 'revision_requested' },
  ])

const SIDE_LABELS: Record<ArgumentSide, string> = {
  pro: 'Pro',
  con: 'Con',
}

const SIDE_COLORS: Record<ArgumentSide, string> = {
  pro: 'green',
  con: 'red',
}

function toId(value: EthikosId | null | undefined): string | null {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

function normalizeContent(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function displayAuthor(i18nT: TranslateFunction, value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') {
    return i18nT("ui.ethikos.suggestionqueue.anonymous")
  }

  return String(value)
}

function formatDate(i18nT: TranslateFunction, value?: string | null): string {
  if (!value) return i18nT("ui.ethikos.suggestionqueue.unknownDate")

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleString()
}

function sortSuggestions(
  suggestions: ArgumentSuggestionApi[],
): ArgumentSuggestionApi[] {
  return [...suggestions].sort((a, b) => {
    const left = a.created_at ? Date.parse(a.created_at) : 0
    const right = b.created_at ? Date.parse(b.created_at) : 0
    return right - left
  })
}

function suggestionParentId(item: ArgumentSuggestionApi): string | null {
  return toId(item.parent_id ?? item.parent)
}

function SuggestionStatusTag({
  status,
}: {
  status: ArgumentSuggestionStatus
}) {
  return (
    <Tag color={STATUS_COLORS[status] ?? 'default'}>
      {STATUS_LABELS[status] ?? status}
    </Tag>
  )
}

function SuggestionSideTag({ side }: { side?: ArgumentSide | null }) {
  const { t: i18nT } = useLanguage();
  if (!side) {
    return <Tag>{i18nT("ui.ethikos.suggestionqueue.general")}</Tag>
  }

  return <Tag color={SIDE_COLORS[side] ?? 'default'}>{SIDE_LABELS[side]}</Tag>
}

export default function SuggestionQueue({
  topicId,
  parentId,
  side = null,
  status = 'all',
  title: titleProp,
  description: descriptionProp,
  emptyText: emptyTextProp,
  submitLabel = 'Submit suggestion',
  showComposer = true,
  showStatusFilter = true,
  autoLoad = true,
  disabled = false,
  className,
  onSubmitted,
  onLoaded,
  onError,
}: SuggestionQueueProps) {
  const { t: i18nT } = useLanguage();
  const title = titleProp ?? i18nT("ui.ethikos.suggestionqueue.suggestionQueue");
  const description = descriptionProp ?? i18nT("ui.ethikos.suggestionqueue.proposeANewArgumentOrReplyFor");
  const emptyText = emptyTextProp ?? i18nT("ui.ethikos.suggestionqueue.noSuggestionsYet");
  const [form] = Form.useForm<SuggestionFormValues>()
  const [suggestions, setSuggestions] = useState<ArgumentSuggestionApi[]>([])
  const [statusFilter, setStatusFilter] =
    useState<SuggestionStatusFilter>(status)
  const [loading, setLoading] = useState(Boolean(autoLoad))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const normalizedTopicId = useMemo(() => toId(topicId), [topicId])
  const normalizedParentId = useMemo(() => toId(parentId), [parentId])
  const parentFilterEnabled = parentId !== undefined

  useEffect(() => {
    setStatusFilter(status)
  }, [status])

  useEffect(() => {
    form.setFieldsValue({
      side: side ?? 'none',
    })
  }, [form, side])

  const reportError = useCallback(
    (fallback: string, err?: unknown) => {
      const nextError = err instanceof Error ? err.message : fallback
      setError(nextError)
      onError?.(nextError)
      return nextError
    },
    [onError],
  )

  const filterSuggestions = useCallback(
    (rows: ArgumentSuggestionApi[]) =>
      rows.filter((row) => {
        if (statusFilter !== 'all' && row.status !== statusFilter) {
          return false
        }

        if (!parentFilterEnabled) {
          return true
        }

        const rowParentId = suggestionParentId(row)

        if (normalizedParentId === null) {
          return rowParentId === null
        }

        return rowParentId === normalizedParentId
      }),
    [normalizedParentId, parentFilterEnabled, statusFilter],
  )

  const visibleSuggestions = useMemo(
    () => sortSuggestions(filterSuggestions(suggestions)),
    [filterSuggestions, suggestions],
  )

  const pendingCount = useMemo(
    () => visibleSuggestions.filter((item) => item.status === 'pending').length,
    [visibleSuggestions],
  )

  const loadSuggestions = useCallback(async () => {
    if (!normalizedTopicId) {
      setSuggestions([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const rows = await fetchArgumentSuggestions(normalizedTopicId)
      const filtered = sortSuggestions(filterSuggestions(rows))

      setSuggestions(rows)
      onLoaded?.(filtered)
    } catch (err) {
      reportError('Unable to load argument suggestions.', err)
    } finally {
      setLoading(false)
    }
  }, [filterSuggestions, normalizedTopicId, onLoaded, reportError])

  useEffect(() => {
    if (autoLoad) {
      void loadSuggestions()
    }
  }, [autoLoad, loadSuggestions])

  const handleSubmit = useCallback(
    async (values: SuggestionFormValues) => {
      if (!normalizedTopicId) {
        reportError('Topic id is required before submitting a suggestion.')
        return
      }

      const content = normalizeContent(values.content)
      if (!content) {
        reportError('Suggestion content is required.')
        return
      }

      const selectedSide =
        values.side && values.side !== 'none' ? values.side : side ?? null

      const payload: SubmitArgumentSuggestionPayload = {
        topic: normalizedTopicId,
        content,
        ...(normalizedParentId ? { parent_id: normalizedParentId } : {}),
        ...(selectedSide ? { side: selectedSide } : {}),
      }

      setSubmitting(true)
      setError(null)

      try {
        const created = await submitArgumentSuggestion(payload)

        setSuggestions((current) => sortSuggestions([created, ...current]))
        form.resetFields()
        form.setFieldsValue({ side: side ?? 'none' })

        onSubmitted?.(created)
        message.success(i18nT("ui.ethikos.suggestionqueue.suggestionSubmitted"))
      } catch (err) {
        reportError('Unable to submit argument suggestion.', err)
      } finally {
        setSubmitting(false)
      }
    },
    [
      form,
      normalizedParentId,
      normalizedTopicId,
      onSubmitted,
      reportError,
      side,, i18nT
    ],
  )

  const contextDescription = useMemo(() => {
    if (!parentFilterEnabled) {
      return null
    }

    if (normalizedParentId === null) {
      return 'Showing top-level suggestions only.'
    }

    return `Showing suggestions for argument #${normalizedParentId}.`
  }, [normalizedParentId, parentFilterEnabled])

  return (
    <Card
      className={className}
      title={
        <Space size={8} wrap>
          <span>{title}</span>
          {pendingCount > 0 && <Tag color="gold">{pendingCount} {i18nT("ui.ethikos.suggestionqueue.pending_e22586")}</Tag>}
        </Space>
      }
      extra={
        <Space size={8} wrap>
          {showStatusFilter && (
            <Select
              size="small"
              value={statusFilter}
              style={{ minWidth: 180 }}
              options={STATUS_FILTER_OPTIONS(i18nT)}
              disabled={loading || submitting}
              onChange={(value) =>
                setStatusFilter(value as SuggestionStatusFilter)
              }
            />
          )}

          <Button
            size="small"
            onClick={() => {
              void loadSuggestions()
            }}
            disabled={loading || submitting || !normalizedTopicId}
          >
            {i18nT("ui.ethikos.suggestionqueue.refresh")}
          </Button>
        </Space>
      }
    >
      {description && (
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          {description}
        </Paragraph>
      )}

      {contextDescription && (
        <Paragraph type="secondary" style={{ marginTop: -8 }}>
          {contextDescription}
        </Paragraph>
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
        />
      )}

      {showComposer && (
        <Form<SuggestionFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => {
            void handleSubmit(values)
          }}
          disabled={disabled || submitting}
          initialValues={{
            side: side ?? 'none',
          }}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="content"
            label={i18nT("ui.ethikos.suggestionqueue.suggestion")}
            rules={[
              {
                required: true,
                whitespace: true,
                message: i18nT("ui.ethikos.suggestionqueue.enterASuggestionBeforeSubmitting"),
              },
            ]}
          >
            <TextArea
              rows={4}
              maxLength={2000}
              showCount
              placeholder={i18nT("ui.ethikos.suggestionqueue.suggestANewArgumentClarificationOrReply")}
            />
          </Form.Item>

          <Space align="end" wrap>
            <Form.Item
              name="side"
              label={i18nT("ui.ethikos.suggestionqueue.side")}
              style={{ minWidth: 160, marginBottom: 0 }}
            >
              <Select
                options={[
                  { label: i18nT("ui.ethikos.suggestionqueue.general"), value: 'none' },
                  { label: i18nT("ui.ethikos.suggestionqueue.pro"), value: 'pro' },
                  { label: i18nT("ui.ethikos.suggestionqueue.con"), value: 'con' },
                ]}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting}
                disabled={disabled || !normalizedTopicId}
              >
                {submitLabel}
              </Button>
            </Form.Item>
          </Space>
        </Form>
      )}

      <Spin spinning={loading}>
        {visibleSuggestions.length === 0 ? (
          <Empty description={emptyText} />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={visibleSuggestions}
            rowKey={(item) => String(item.id)}
            renderItem={(item) => (
              <List.Item>
                <Space direction="vertical" size={6} style={{ width: '100%' }}>
                  <Space size={6} wrap>
                    <SuggestionStatusTag status={item.status} />
                    <SuggestionSideTag side={item.side ?? null} />

                    {item.parent != null && (
                      <Tag>{i18nT("ui.ethikos.suggestionqueue.replyTo")}{String(item.parent)}</Tag>
                    )}

                    {item.accepted_argument != null && (
                      <Tag color="green">
                        {i18nT("ui.ethikos.suggestionqueue.acceptedAs")}{String(item.accepted_argument)}
                      </Tag>
                    )}
                  </Space>

                  <Paragraph style={{ marginBottom: 0 }}>
                    {item.content}
                  </Paragraph>

                  <Text type="secondary">
                    {i18nT("ui.ethikos.suggestionqueue.suggestedBy")} {displayAuthor(i18nT, item.created_by)} ·{' '}
                    {formatDate(i18nT, item.created_at)}
                    {item.reviewed_by ? (
                      <>
                        {' '}
                        {i18nT("ui.ethikos.suggestionqueue.reviewedBy")} {displayAuthor(i18nT, item.reviewed_by)}
                        {item.reviewed_at
                          ? i18nT("ui.ethikos.suggestionqueue.text", { value1: formatDate(i18nT, item.reviewed_at) })
                          : ''}
                      </>
                    ) : null}
                  </Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  )
}