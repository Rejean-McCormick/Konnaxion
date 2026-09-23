// FILE: frontend/modules/ethikos/admin/moderation/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { Button, Popconfirm, Space, Tag, Typography } from 'antd'

import usePageTitle from '@/hooks/usePageTitle'
import {
  actOnReport,
  fetchModerationQueue,
  type ModerationPayload,
  type ModerationQueueItem,
  type ModerationSeverity,
  type ModerationStatus,
} from '@/services/admin'

const { Text } = Typography

type Report = ModerationQueueItem

function severityColor(severity?: ModerationSeverity): string {
  if (severity === 'high') {
    return 'red'
  }

  if (severity === 'medium') {
    return 'orange'
  }

  return 'blue'
}

function statusColor(status: ModerationStatus): string {
  if (status === 'Resolved') {
    return 'green'
  }

  if (status === 'Escalated') {
    return 'orange'
  }

  return 'gold'
}

export default function Moderation(): JSX.Element {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.admin.moderation.adminModeration"))

  const { data, loading, refresh } = useRequest<ModerationPayload, []>(
    fetchModerationQueue,
  )

  const handleModeration = async (
    id: string,
    remove: boolean,
  ): Promise<void> => {
    await actOnReport(id, remove)
    refresh()
  }

  const columns: ProColumns<Report>[] = [
    {
      title: i18nT("ui.ethikos.admin.moderation.content"),
      dataIndex: 'contentPreview',
      ellipsis: true,
      render: (_dom, row) => (
        <Space direction="vertical" size={2}>
          {row.contextTitle && <Text strong>{row.contextTitle}</Text>}
          <Text type="secondary">
            {row.contentPreview ?? i18nT("ui.ethikos.admin.moderation.noPreviewAvailable")}
          </Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.reporter_d37b68"),
      dataIndex: 'reporterName',
      width: 160,
      render: (_dom, row) => row.reporterName ?? 'Unknown',
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.type"),
      dataIndex: 'reason',
      width: 180,
      render: (_dom, row) => (
        <Space size={4} wrap>
          <Tag color={severityColor(row.severity)}>
            {row.reason ?? i18nT("ui.ethikos.admin.moderation.report")}
          </Tag>
          {typeof row.reportCount === 'number' && row.reportCount > 1 && (
            <Tag>{row.reportCount} {i18nT("ui.ethikos.admin.moderation.reports")}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.status"),
      dataIndex: 'status',
      width: 140,
      render: (_dom, row) => (
        <Tag color={statusColor(row.status)}>{row.status}</Tag>
      ),
      filters: [
        { text: i18nT("ui.ethikos.admin.moderation.pending"), value: 'Pending' },
        { text: i18nT("ui.ethikos.admin.moderation.resolved"), value: 'Resolved' },
        { text: i18nT("ui.ethikos.admin.moderation.escalated"), value: 'Escalated' },
      ],
      onFilter: (value, row) => row.status === String(value),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.actions"),
      width: 210,
      render: (_dom, row) =>
        row.status === 'Pending' ? (
          <Space size="small">
            <Popconfirm
              title={i18nT("ui.ethikos.admin.moderation.removeContent")}
              onConfirm={() => {
                void handleModeration(row.id, true)
              }}
            >
              <Button size="small" danger>
                {i18nT("ui.ethikos.admin.moderation.remove")}
              </Button>
            </Popconfirm>

            <Popconfirm
              title={i18nT("ui.ethikos.admin.moderation.dismissReport")}
              onConfirm={() => {
                void handleModeration(row.id, false)
              }}
            >
              <Button size="small">{i18nT("ui.ethikos.admin.moderation.dismiss")}</Button>
            </Popconfirm>
          </Space>
        ) : null,
    },
  ]

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<Report>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={{ pageSize: 10 }}
        search={false}
        options={false}
      />
    </PageContainer>
  )
}