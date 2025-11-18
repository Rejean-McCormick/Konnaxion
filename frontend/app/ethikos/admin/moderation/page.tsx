// app/ethikos/admin/moderation/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Alert,
  App as AntdApp,
  Badge,
  Button,
  Drawer,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchModerationQueue, actOnReport, type ModerationPayload } from '@/services/admin';

const { Text, Paragraph } = Typography;

type ModerationStatus = 'Pending' | 'Resolved' | 'Escalated';
type ModerationTargetType = 'topic' | 'post' | 'user';
type Severity = 'low' | 'medium' | 'high';

interface ModerationQueueItem {
  id: string;
  /** Debate topic / argument / participant */
  targetType: ModerationTargetType;
  /** ID of the target (argumentId, topicId, userId, etc.) */
  targetId: string;
  /** Debate / consultation context (topic title) */
  contextTitle?: string;
  /** Short preview of the argument or message */
  contentPreview?: string;
  /** Who authored the offending content */
  authorName?: string;
  authorId?: string;
  /** Who reported */
  reporterName?: string;
  reporterId?: string;
  /** Primary reason label (Spam, Harassment, etc.) */
  reason?: string;
  /** Free-text notes / message from reporter */
  reporterMessage?: string;
  /** Number of merged reports for same target */
  reportCount?: number;
  /** When the first report was created (ISO) */
  createdAt?: string;
  /** When last moderation action happened (ISO) */
  lastActionAt?: string;
  /** Queue status */
  status: ModerationStatus;
  /** Heuristic severity classification */
  severity?: Severity;
}

/**
 * Normalizes whatever the backend returns from admin/moderation
 * into a richer, Ethikos‑specific moderation item.
 *
 * Works with the current ModerationPayload shape and can tolerate
 * future expansions (topicId, argumentId, severity, etc.).
 */
function adaptModerationItems(raw: unknown): ModerationQueueItem[] {
  if (!raw) return [];

  let items: any[] = [];
  if (Array.isArray(raw)) {
    items = raw;
  } else if ((raw as any)?.items && Array.isArray((raw as any).items)) {
    items = (raw as any).items;
  }

  return items.map((item: any): ModerationQueueItem => {
    const status: ModerationStatus =
      item.status === 'Resolved' || item.status === 'Escalated'
        ? item.status
        : 'Pending';

    // Basic heuristics to enrich from whatever the backend gives us
    const targetType: ModerationTargetType =
      (item.targetType as ModerationTargetType) ??
      (item.entityType as ModerationTargetType) ??
      'post';

    const severity: Severity =
      (item.severity as Severity) ??
      (item.priority as Severity) ??
      'medium';

    return {
      id: String(item.id),
      targetType,
      targetId: String(
        item.targetId ??
          item.argumentId ??
          item.postId ??
          item.topicId ??
          item.userId ??
          item.id,
      ),
      contextTitle:
        item.contextTitle ??
        item.threadTitle ??
        item.topicTitle ??
        item.debateTitle,
      contentPreview: item.content ?? item.contentSnippet ?? item.preview,
      authorName: item.authorName ?? item.offenderName ?? item.user,
      authorId: item.authorId ?? item.offenderId,
      reporterName: item.reporterName ?? item.reporter,
      reporterId: item.reporterId,
      reason: item.type ?? item.reason,
      reporterMessage: item.message ?? item.notes,
      reportCount: item.reportCount ?? item.count ?? 1,
      createdAt: item.createdAt ?? item.created_at ?? item.timestamp,
      lastActionAt: item.lastActionAt ?? item.updated_at,
      status,
      severity,
    };
  });
}

export default function EthikosModerationPage(): JSX.Element {
  usePageTitle('Admin · Moderation');

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<ModerationStatus | 'all'>(
    'Pending',
  );
  const [detailDrawerItem, setDetailDrawerItem] = useState<ModerationQueueItem | null>(
    null,
  );
  const [globalActionLoading, setGlobalActionLoading] = useState(false);

  const { message } = AntdApp.useApp();

  // ahooks generics: <Data, Params>
  const {
    data: rawData,
    loading,
    error,
    refresh,
  } = useRequest<ModerationPayload, []>(fetchModerationQueue);

  const items: ModerationQueueItem[] = useMemo(
    () => adaptModerationItems(rawData),
    [rawData],
  );

  const filteredItems = useMemo(() => {
    if (activeStatusFilter === 'all') return items;
    return items.filter((item) => item.status === activeStatusFilter);
  }, [items, activeStatusFilter]);

  const unauthorized =
    (error as any)?.response?.status === 403 || (error as any)?.status === 403;

  const onSingleAction = async (
    record: ModerationQueueItem,
    action: 'approve' | 'remove',
  ) => {
    try {
      setGlobalActionLoading(true);
      // actOnReport: remove = true => delete argument/content, false => approve+resolve
      const remove = action === 'remove';
      await actOnReport(record.id, remove);
      message.success(
        remove
          ? 'Debate content removed and report resolved.'
          : 'Content approved and report resolved.',
      );
      await refresh();
    } catch {
      message.error('Unable to process moderation action. Please try again.');
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const onBulkAction = async (action: 'approve' | 'remove') => {
    if (!selectedRowKeys.length) {
      message.info('Select at least one report to apply a bulk action.');
      return;
    }

    setGlobalActionLoading(true);
    try {
      const remove = action === 'remove';

      const promises = selectedRowKeys.map((id) =>
        actOnReport(String(id), remove).catch((err) => err),
      );

      const results = await Promise.all(promises);
      const failures = results.filter((r) => r instanceof Error);

      if (failures.length === 0) {
        message.success(
          remove
            ? 'Selected debate content removed and reports resolved.'
            : 'Selected content approved and reports resolved.',
        );
      } else if (failures.length === selectedRowKeys.length) {
        message.error('Bulk action failed for all selected reports.');
      } else {
        message.warning(
          'Bulk action completed with some failures. Check the queue and retry if needed.',
        );
      }

      setSelectedRowKeys([]);
      await refresh();
    } catch {
      message.error('Unexpected error while processing bulk action.');
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const severityTag = (severity?: Severity): ReactNode => {
    switch (severity) {
      case 'high':
        return (
          <Tag color="red" icon={<ExclamationCircleOutlined />}>
            High
          </Tag>
        );
      case 'low':
        return <Tag color="green">Low</Tag>;
      case 'medium':
      default:
        return <Tag color="gold">Medium</Tag>;
    }
  };

  const statusBadge = (status: ModerationStatus): ReactNode => {
    switch (status) {
      case 'Resolved':
        return <Badge status="success" text="Resolved" />;
      case 'Escalated':
        return <Badge status="warning" text="Escalated" />;
      case 'Pending':
      default:
        return <Badge status="processing" text="Pending" />;
    }
  };

  const targetTag = (record: ModerationQueueItem): ReactNode => {
    const label =
      record.targetType === 'topic'
        ? 'Topic'
        : record.targetType === 'user'
        ? 'Participant'
        : 'Argument';

    return <Tag>{label}</Tag>;
  };

  const columns: ProColumns<ModerationQueueItem>[] = [
    {
      title: 'Context & content',
      dataIndex: 'contentPreview',
      width: 360,
      ellipsis: true,
      render: (_: ReactNode, record) => (
        <Space direction="vertical" size={2}>
          <Space size={6}>
            {targetTag(record)}
            {record.reason && <Tag>{record.reason}</Tag>}
          </Space>
          {record.contextTitle && (
            <Text strong ellipsis={{ tooltip: record.contextTitle }}>
              {record.contextTitle}
            </Text>
          )}
          {record.contentPreview && (
            <Text type="secondary" ellipsis={{ tooltip: record.contentPreview }}>
              {record.contentPreview}
            </Text>
          )}
          {record.reporterMessage && (
            <Text type="secondary" italic ellipsis={{ tooltip: record.reporterMessage }}>
              Reporter note: {record.reporterMessage}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'People',
      dataIndex: 'authorName',
      width: 220,
      render: (_: ReactNode, record) => (
        <Space direction="vertical" size={2}>
          {record.authorName && (
            <Text>
              Author: <Text strong>{record.authorName}</Text>
            </Text>
          )}
          {record.reporterName && (
            <Text type="secondary">Reported by {record.reporterName}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Reports',
      dataIndex: 'reportCount',
      width: 140,
      align: 'center',
      // NOTE: ProColumns.render signature is (dom, entity, index, action, schema)
      // so we take `dom` as ReactNode and read the value from `record`.
      render: (_: ReactNode, record) => {
        const value = record.reportCount ?? 1;
        const rawCount = record.reportCount ?? 0;

        return (
          <Space direction="vertical" size={2}>
            <Badge
              count={value}
              style={{ backgroundColor: '#722ed1' }}
              overflowCount={99}
            />
            {severityTag(record.severity)}
            {rawCount >= 3 && (
              <Tooltip title="This argument may have been auto-hidden after 3 independent reports, per Ethikos policy.">
                <Tag color="volcano">Auto‑hide threshold reached</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 140,
      render: (_: ReactNode, record) => statusBadge(record.status),
      filters: true,
      valueEnum: {
        Pending: { text: 'Pending' },
        Escalated: { text: 'Escalated' },
        Resolved: { text: 'Resolved' },
      },
    },
    {
      title: 'Timeline',
      dataIndex: 'createdAt',
      width: 220,
      render: (_: ReactNode, record) => (
        <Space direction="vertical" size={2}>
          {record.createdAt && (
            <Text type="secondary">
              Reported{' '}
              {new Date(record.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          )}
          {record.lastActionAt && (
            <Text type="secondary">
              Last action{' '}
              {new Date(record.lastActionAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_: ReactNode, record) => {
        const disabled =
          unauthorized || globalActionLoading || record.status === 'Resolved';

        return (
          <Space>
            <Tooltip title="Review full report details">
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => setDetailDrawerItem(record)}
              />
            </Tooltip>

            <Tooltip title="Content complies with Ethikos guidelines, resolve report">
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                type="default"
                disabled={disabled}
                onClick={() => onSingleAction(record, 'approve')}
              >
                Approve
              </Button>
            </Tooltip>

            <Popconfirm
              title="Remove content?"
              description="This will remove the content for everyone and resolve all associated reports."
              okText="Remove"
              okType="danger"
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              disabled={disabled}
              onConfirm={() => onSingleAction(record, 'remove')}
            >
              <Tooltip title="Remove content and resolve report">
                <Button size="small" icon={<StopOutlined />} danger disabled={disabled}>
                  Remove
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const statusFilterButtons = (
    <Space>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Pending')}
        type={activeStatusFilter === 'Pending' ? 'primary' : 'default'}
      >
        Pending
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Escalated')}
        type={activeStatusFilter === 'Escalated' ? 'primary' : 'default'}
      >
        Escalated
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Resolved')}
        type={activeStatusFilter === 'Resolved' ? 'primary' : 'default'}
      >
        Resolved
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('all')}
        type={activeStatusFilter === 'all' ? 'primary' : 'default'}
      >
        All
      </Button>
    </Space>
  );

  return (
    <PageContainer ghost loading={loading}>
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Space
          align="center"
          style={{
            width: '100%',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <Text strong>Ethikos moderation queue</Text>
            <br />
            <Text type="secondary">
              Review and act on reports for debate arguments, topics, and participant
              behaviour.
            </Text>
          </div>
          <Space>
            {statusFilterButtons}
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refresh()}
              loading={loading || globalActionLoading}
              disabled={!!unauthorized}
            >
              Refresh queue
            </Button>
          </Space>
        </Space>

        {unauthorized && (
          <Alert
            type="error"
            showIcon
            message="You do not have permission to moderate Ethikos debates."
            description="If you believe this is an error, ask an administrator to grant you an Ethikos moderator or admin role."
          />
        )}

        {!unauthorized && (
          <Alert
            type="info"
            showIcon
            message="Ethikos moderation guidelines"
            description={
              <>
                Arguments that receive three or more independent reports are
                automatically hidden until a moderator reviews them. Approve content
                that fits the Ethikos charter (respect, evidence‑based reasoning, and
                inclusion), remove content that clearly violates it, and escalate
                borderline or sensitive cases.
              </>
            }
          />
        )}

        {error && !unauthorized && (
          <Alert
            type="error"
            showIcon
            message="Unable to load the moderation queue."
            description="Check your connection or try again. If the problem persists, the Ethikos moderation service may be temporarily unavailable."
          />
        )}

        {items.length === 0 && !loading && !error && !unauthorized && (
          <Alert
            type="success"
            showIcon
            message="No open reports."
            description="There are currently no unresolved reports on Ethikos debates. New reports will appear here in real time."
          />
        )}

        <ProTable<ModerationQueueItem>
          rowKey="id"
          search={false}
          options={false}
          loading={loading || globalActionLoading}
          columns={columns}
          dataSource={filteredItems}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} reports`,
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          tableAlertRender={({ selectedRowKeys: keys }) => (
            <Space size={8}>
              <Text strong>{keys.length}</Text>
              <Text>selected</Text>
            </Space>
          )}
          tableAlertOptionRender={() => (
            <Space>
              <Tooltip title="Content is acceptable, resolve selected reports">
                <Button
                  size="small"
                  icon={<CheckCircleOutlined />}
                  disabled={!selectedRowKeys.length || unauthorized}
                  onClick={() => onBulkAction('approve')}
                >
                  Bulk approve
                </Button>
              </Tooltip>
              <Tooltip title="Remove content and resolve selected reports">
                <Popconfirm
                  title="Remove selected content?"
                  description="This will remove content for all selected reports and resolve them."
                  okText="Remove"
                  okType="danger"
                  icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
                  disabled={!selectedRowKeys.length || unauthorized}
                  onConfirm={() => onBulkAction('remove')}
                >
                  <Button
                    size="small"
                    danger
                    icon={<StopOutlined />}
                    disabled={!selectedRowKeys.length || unauthorized}
                  >
                    Bulk remove
                  </Button>
                </Popconfirm>
              </Tooltip>
            </Space>
          )}
          scroll={{ x: 1100 }}
        />

        <Drawer
          title="Report details"
          width={480}
          open={!!detailDrawerItem}
          onClose={() => setDetailDrawerItem(null)}
        >
          {detailDrawerItem && (
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Space>
                {targetTag(detailDrawerItem)}
                {severityTag(detailDrawerItem.severity)}
                {statusBadge(detailDrawerItem.status)}
                {detailDrawerItem.reason && <Tag>{detailDrawerItem.reason}</Tag>}
              </Space>

              {detailDrawerItem.contextTitle && (
                <div>
                  <Text strong>Debate / topic</Text>
                  <Paragraph>{detailDrawerItem.contextTitle}</Paragraph>
                </div>
              )}

              {detailDrawerItem.contentPreview && (
                <div>
                  <Text strong>Argument / message</Text>
                  <Paragraph>{detailDrawerItem.contentPreview}</Paragraph>
                </div>
              )}

              <div>
                <Text strong>People</Text>
                <Paragraph>
                  {detailDrawerItem.authorName && (
                    <>
                      Author: <Text strong>{detailDrawerItem.authorName}</Text>
                      <br />
                    </>
                  )}
                  {detailDrawerItem.reporterName && (
                    <>
                      Reporter: <Text>{detailDrawerItem.reporterName}</Text>
                      <br />
                    </>
                  )}
                  {detailDrawerItem.reportCount && (
                    <>Reports merged: {detailDrawerItem.reportCount}</>
                  )}
                </Paragraph>
              </div>

              {detailDrawerItem.reporterMessage && (
                <div>
                  <Text strong>Reporter note</Text>
                  <Paragraph>{detailDrawerItem.reporterMessage}</Paragraph>
                </div>
              )}

              <div>
                <Text strong>Timeline</Text>
                <Paragraph type="secondary">
                  {detailDrawerItem.createdAt && (
                    <>
                      Reported:{' '}
                      {new Date(detailDrawerItem.createdAt).toLocaleString(
                        undefined,
                        { dateStyle: 'medium', timeStyle: 'short' },
                      )}
                      <br />
                    </>
                  )}
                  {detailDrawerItem.lastActionAt && (
                    <>
                      Last action:{' '}
                      {new Date(detailDrawerItem.lastActionAt).toLocaleString(
                        undefined,
                        { dateStyle: 'medium', timeStyle: 'short' },
                      )}
                    </>
                  )}
                </Paragraph>
              </div>

              <Alert
                type="info"
                showIcon
                message="Next steps"
                description="Use the actions in the table to approve or remove this content. For borderline arguments or repeat offenders, escalate via your internal Ethikos governance process."
              />
            </Space>
          )}
        </Drawer>
      </Space>
    </PageContainer>
  );
}
