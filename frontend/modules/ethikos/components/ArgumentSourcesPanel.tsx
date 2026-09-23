// FILE: frontend/modules/ethikos/components/ArgumentSourcesPanel.tsx
'use client'

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  LinkOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import {
  Alert,
  App,
  Button,
  Card,
  Empty,
  Form,
  Input,
  List,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import dayjs from 'dayjs'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import {
  attachArgumentSource,
  fetchArgumentSources,
} from '@/services/ethikos'
import type {
  ArgumentSourceApi,
  CreateArgumentSourcePayload,
  EthikosId,
} from '@/services/ethikos'

const { Paragraph, Text } = Typography
const { TextArea } = Input

type SourceFormValues = {
  url?: string
  title?: string
  excerpt?: string
  source_type?: string
  citation_text?: string
  quote?: string
  note?: string
}

type SourceRow = ArgumentSourceApi & {
  citation_text?: string | null
  quote?: string | null
  note?: string | null
  is_removed?: boolean
}

export interface ArgumentSourcesPanelProps {
  argumentId: EthikosId
  title?: string
  compact?: boolean
  canAdd?: boolean
  refreshKey?: string | number
  emptyText?: React.ReactNode
  className?: string
  style?: React.CSSProperties
  onCreated?: (source: ArgumentSourceApi) => void
  onLoaded?: (sources: ArgumentSourceApi[]) => void
  onError?: (error: unknown) => void
}

function cleanText(value?: string | null): string | undefined {
  const cleaned = value?.trim()
  return cleaned ? cleaned : undefined
}

function hasArgumentId(value: EthikosId): boolean {
  return value !== undefined && value !== null && String(value).trim() !== ''
}

function isValidHttpUrl(value?: string): boolean {
  const cleaned = cleanText(value)
  if (!cleaned) return true

  try {
    const parsed = new URL(cleaned)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function sourceLabel(source: SourceRow): string {
  return (
    cleanText(source.title) ||
    cleanText(source.citation_text) ||
    cleanText(source.url) ||
    `Source ${source.id}`
  )
}

function sourceDescription(source: SourceRow): string | undefined {
  return (
    cleanText(source.excerpt) ||
    cleanText(source.quote) ||
    cleanText(source.note) ||
    undefined
  )
}

function sourceTypeLabel(i18nT: TranslateFunction, value?: string | null): string {
  const cleaned = cleanText(value)
  if (!cleaned) return i18nT("ui.ethikos.argumentsourcespanel.source")

  return cleaned
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase())
}

function formatDate(value?: string | null): string | undefined {
  const cleaned = cleanText(value)
  if (!cleaned) return undefined

  const parsed = dayjs(cleaned)
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : cleaned
}

function visibleSources(sources: ArgumentSourceApi[]): SourceRow[] {
  return (sources as SourceRow[]).filter((source) => !source.is_removed)
}

function buildPayload(values: SourceFormValues): CreateArgumentSourcePayload {
  const excerpt = cleanText(values.excerpt)
  const quote = cleanText(values.quote)

  return {
    url: cleanText(values.url),
    title: cleanText(values.title),
    source_type: cleanText(values.source_type),
    citation_text: cleanText(values.citation_text),
    excerpt,
    quote: quote || excerpt,
    note: cleanText(values.note),
  }
}

function hasAttachableContent(payload: CreateArgumentSourcePayload): boolean {
  return Boolean(
    cleanText(payload.url) ||
      cleanText(payload.citation_text) ||
      cleanText(payload.quote) ||
      cleanText(payload.note),
  )
}

export default function ArgumentSourcesPanel({
  argumentId,
  title: titleProp,
  compact = false,
  canAdd = true,
  refreshKey,
  emptyText: emptyTextProp,
  className,
  style,
  onCreated,
  onLoaded,
  onError,
}: ArgumentSourcesPanelProps): React.ReactElement {
  const { t: i18nT } = useLanguage();
  const title = titleProp ?? i18nT("ui.ethikos.argumentsourcespanel.sources");
  const emptyText = emptyTextProp ?? i18nT("ui.ethikos.argumentsourcespanel.noSourcesHaveBeenAttachedToThis");
  const { message } = App.useApp()
  const [form] = Form.useForm<SourceFormValues>()

  const [sources, setSources] = useState<ArgumentSourceApi[]>([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canUseArgument = hasArgumentId(argumentId)
  const rows = useMemo(() => visibleSources(sources), [sources])

  const loadSources = useCallback(async () => {
    if (!hasArgumentId(argumentId)) {
      setSources([])
      setError(null)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchArgumentSources(argumentId)
      setSources(result)
      onLoaded?.(result)
    } catch (caught) {
      setSources([])
      setError(i18nT("ui.ethikos.argumentsourcespanel.sourcesCouldNotBeLoaded"))
      onError?.(caught)
    } finally {
      setLoading(false)
    }
  }, [argumentId, onError, onLoaded, i18nT])

  useEffect(() => {
    void loadSources()
  }, [loadSources, refreshKey])

  async function handleSubmit(values: SourceFormValues): Promise<void> {
    if (!canUseArgument) {
      message.warning(i18nT("ui.ethikos.argumentsourcespanel.argumentIdIsRequiredBeforeAttachingA"))
      return
    }

    const payload = buildPayload(values)

    if (!hasAttachableContent(payload)) {
      message.warning(i18nT("ui.ethikos.argumentsourcespanel.provideAUrlCitationQuoteOrNote"))
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const created = await attachArgumentSource(argumentId, payload)

      setSources((current) => [
        created,
        ...current.filter((source) => source.id !== created.id),
      ])

      form.resetFields()
      setExpanded(false)
      onCreated?.(created)
      message.success(i18nT("ui.ethikos.argumentsourcespanel.sourceAttached"))
    } catch (caught) {
      setError(i18nT("ui.ethikos.argumentsourcespanel.sourceCouldNotBeAttached"))
      onError?.(caught)
      message.error(i18nT("ui.ethikos.argumentsourcespanel.sourceCouldNotBeAttached"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card
      className={className}
      style={style}
      size={compact ? 'small' : 'default'}
      title={
        <Space size="small" wrap>
          <SafetyCertificateOutlined />
          <span>{title}</span>
          <Tag>{rows.length}</Tag>
        </Space>
      }
      extra={
        <Space size="small">
          <Tooltip title={i18nT("ui.ethikos.argumentsourcespanel.refreshSources")}>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              loading={loading}
              disabled={!canUseArgument}
              onClick={() => void loadSources()}
            />
          </Tooltip>

          {canAdd && (
            <Button
              size="small"
              type={expanded ? 'default' : 'primary'}
              icon={<PlusOutlined />}
              disabled={!canUseArgument}
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded ? i18nT("ui.ethikos.argumentsourcespanel.cancel") : i18nT("ui.ethikos.argumentsourcespanel.add")}
            </Button>
          )}
        </Space>
      }
    >
      {!canUseArgument && (
        <Alert
          showIcon
          type="warning"
          message={i18nT("ui.ethikos.argumentsourcespanel.sourcesAreUnavailableUntilAnArgumentIs")}
          style={{ marginBottom: 12 }}
        />
      )}

      {error && (
        <Alert
          showIcon
          type="warning"
          message={error}
          style={{ marginBottom: 12 }}
        />
      )}

      {expanded && canAdd && canUseArgument && (
        <Form<SourceFormValues>
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ marginBottom: 16 }}
        >
          <Form.Item
            name="url"
            label={i18nT("ui.ethikos.argumentsourcespanel.sourceUrl")}
            rules={[
              {
                validator: async (_, value?: string) => {
                  if (isValidHttpUrl(value)) return
                  throw new Error('Enter a valid HTTP or HTTPS URL.')
                },
              },
            ]}
          >
            <Input
              allowClear
              placeholder="https://example.org/source"
              prefix={<LinkOutlined />}
            />
          </Form.Item>

          <Form.Item name="title" label={i18nT("ui.ethikos.argumentsourcespanel.title")}>
            <Input allowClear placeholder={i18nT("ui.ethikos.argumentsourcespanel.optionalSourceTitle")} />
          </Form.Item>

          <Form.Item name="citation_text" label={i18nT("ui.ethikos.argumentsourcespanel.citationText")}>
            <Input
              allowClear
              placeholder={i18nT("ui.ethikos.argumentsourcespanel.authorPublicationSectionCaseDatasetEtc")}
            />
          </Form.Item>

          <Form.Item name="source_type" label={i18nT("ui.ethikos.argumentsourcespanel.sourceType")}>
            <Input allowClear placeholder={i18nT("ui.ethikos.argumentsourcespanel.articleReportDatasetLaw")} />
          </Form.Item>

          <Form.Item name="quote" label={i18nT("ui.ethikos.argumentsourcespanel.quoteOrExcerpt")}>
            <TextArea
              allowClear
              autoSize={{ minRows: 2, maxRows: 5 }}
              placeholder={i18nT("ui.ethikos.argumentsourcespanel.optionalQuoteOrExcerptSupportingTheArgument")}
            />
          </Form.Item>

          <Form.Item name="note" label={i18nT("ui.ethikos.argumentsourcespanel.note")}>
            <TextArea
              allowClear
              autoSize={{ minRows: 2, maxRows: 5 }}
              placeholder={i18nT("ui.ethikos.argumentsourcespanel.optionalNoteExplainingWhyThisSourceMatters")}
            />
          </Form.Item>

          <Space>
            <Button htmlType="submit" type="primary" loading={submitting}>
              {i18nT("ui.ethikos.argumentsourcespanel.attachSource")}
            </Button>
            <Button
              disabled={submitting}
              onClick={() => {
                form.resetFields()
                setExpanded(false)
              }}
            >
              {i18nT("ui.ethikos.argumentsourcespanel.cancel")}
            </Button>
          </Space>
        </Form>
      )}

      {loading && rows.length === 0 ? (
        <Spin />
      ) : rows.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={emptyText}
        />
      ) : (
        <List
          size={compact ? 'small' : 'default'}
          dataSource={rows}
          renderItem={(source) => {
            const description = sourceDescription(source)
            const createdAt = formatDate(source.created_at)
            const label = sourceLabel(source)
            const url = cleanText(source.url)

            return (
              <List.Item key={source.id}>
                <List.Item.Meta
                  avatar={<LinkOutlined />}
                  title={
                    url ? (
                      <a href={url} target="_blank" rel="noreferrer">
                        {label}
                      </a>
                    ) : (
                      label
                    )
                  }
                  description={
                    <Space direction="vertical" size={4}>
                      <Space size="small" wrap>
                        <Tag>{sourceTypeLabel(i18nT, source.source_type)}</Tag>
                        {createdAt && (
                          <Text type="secondary">{i18nT("ui.ethikos.argumentsourcespanel.added")} {createdAt}</Text>
                        )}
                        {source.created_by != null && (
                          <Text type="secondary">
                            {i18nT("ui.ethikos.argumentsourcespanel.by")} {String(source.created_by)}
                          </Text>
                        )}
                      </Space>

                      {description && (
                        <Paragraph
                          type="secondary"
                          ellipsis={{
                            rows: compact ? 2 : 3,
                            expandable: true,
                          }}
                          style={{ marginBottom: 0 }}
                        >
                          {description}
                        </Paragraph>
                      )}

                      {source.note && source.quote && source.note !== source.quote && (
                        <Paragraph
                          type="secondary"
                          ellipsis={{
                            rows: compact ? 1 : 2,
                            expandable: true,
                          }}
                          style={{ marginBottom: 0 }}
                        >
                          {source.note}
                        </Paragraph>
                      )}
                    </Space>
                  }
                />
              </List.Item>
            )
          }}
        />
      )}
    </Card>
  )
}