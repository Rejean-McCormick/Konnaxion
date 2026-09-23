// FILE: frontend/app/konnected/community-discussions/moderation/page.tsx
﻿'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  App as AntdApp,
  Badge,
  Button,
  Drawer,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import { actOnReport, fetchModerationQueue } from '@/services/admin';

const { Text, Paragraph } = Typography;

type ModerationStatus = 'Pending' | 'Resolved' | 'Escalated';

type ModerationTargetType = 'topic' | 'post' | 'user';

type Severity = 'low' | 'medium' | 'high';

interface ModerationQueueItem {
  id: string;
  /** Post / Topic / User */
  targetType: ModerationTargetType;
  /** ID of the target (postId, topicId, userId, etc.) */
  targetId: string;
  /** Human-readable context, e.g. thread title */
  contextTitle?: string;
  /** Short preview of offending content */
  contentPreview?: string;
  /** Who authored the offending content */
  authorName?: string;
  authorId?: string;
  /** Who reported */
  reporterName?: string;
  reporterId?: string;
  /** Primary reason label */
  reason?: string;
  /** Free-text notes / message from reporter */
  reporterMessage?: string;
  /** Number of merged reports for same target */
  reportCount?: number;
  /** When the first report was created (ISO string) */
  createdAt?: string;
  /** When last action occurred (ISO string) */
  lastActionAt?: string;
  /** Current status in queue */
  status: ModerationStatus;
  /** Rough severity bucket */
  severity?: Severity;
}


type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function optionalString(value: unknown): string | undefined {
  return value == null ? undefined : String(value);
}

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

function normalizeTargetType(value: unknown): ModerationTargetType {
  return value === 'topic' || value === 'user' || value === 'post' ? value : 'post';
}

function normalizeSeverity(value: unknown): Severity {
  return value === 'low' || value === 'high' || value === 'medium' ? value : 'medium';
}

function isUnauthorizedError(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (value.status === 403) return true;
  return isRecord(value.response) && value.response.status === 403;
}

/**
 * Adapt the existing admin moderation payload into the richer
 * ModerationQueueItem shape expected by the KonnectED UI.
 *
 * This is defensive: it works with the current minimal shape
 * (id, content, reporter, type, status) and can absorb future
 * backend fields with zero changes on the frontend.
 */
function adaptModerationItems(raw: unknown): ModerationQueueItem[] {
  const items: unknown[] = Array.isArray(raw)
    ? raw
    : isRecord(raw) && Array.isArray(raw.items)
      ? raw.items
      : [];

  return items.filter(isRecord).map((item): ModerationQueueItem => {
    const status: ModerationStatus =
      item.status === 'Resolved' || item.status === 'Escalated'
        ? item.status
        : 'Pending';

    return {
      id: String(item.id ?? ''),
      targetType: normalizeTargetType(item.targetType ?? item.entityType),
      targetId: String(item.targetId ?? item.postId ?? item.topicId ?? item.userId ?? item.id ?? ''),
      contextTitle: optionalString(item.contextTitle ?? item.threadTitle ?? item.topicTitle),
      contentPreview: optionalString(item.content ?? item.contentSnippet ?? item.preview),
      authorName: optionalString(item.authorName ?? item.offenderName ?? item.user),
      authorId: optionalString(item.authorId ?? item.offenderId),
      reporterName: optionalString(item.reporterName ?? item.reporter),
      reporterId: optionalString(item.reporterId),
      reason: optionalString(item.type ?? item.reason),
      reporterMessage: optionalString(item.message ?? item.notes),
      reportCount: optionalNumber(item.reportCount ?? item.count) ?? 1,
      createdAt: optionalString(item.createdAt ?? item.created_at ?? item.timestamp),
      lastActionAt: optionalString(item.lastActionAt ?? item.updated_at),
      status,
      severity: normalizeSeverity(item.severity ?? item.priority),
    };
  });
}

export default function CommunityModerationPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<ModerationStatus | 'all'>('Pending');
  const [detailDrawerItem, setDetailDrawerItem] = useState<ModerationQueueItem | null>(null);
  const [globalActionLoading, setGlobalActionLoading] = useState(false);

  const { message } = AntdApp.useApp();

  const {
    data: rawData,
    loading,
    error,
    refresh,
  } = useRequest(fetchModerationQueue);

  const items: ModerationQueueItem[] = useMemo(
    () => adaptModerationItems(rawData),
    [rawData],
  );

  const filteredItems = useMemo(() => {
    if (activeStatusFilter === 'all') return items;
    return items.filter((item) => item.status === activeStatusFilter);
  }, [items, activeStatusFilter]);

  const unauthorized = isUnauthorizedError(error);

  const onSingleAction = async (
    record: ModerationQueueItem,
    action: 'approve' | 'remove',
  ) => {
    try {
      setGlobalActionLoading(true);
      // actOnReport: remove = true => delete, false => keep
      const remove = action === 'remove';
      await actOnReport(record.id, remove);
      message.success(
        remove
          ? i18nT("ui.konnected.communityDiscussions.moderation.contentRemovedAndReportResolved")
          : i18nT("ui.konnected.communityDiscussions.moderation.contentApprovedAndReportResolved"),
      );
      await refresh();
    } catch {
      message.error(i18nT("ui.konnected.communityDiscussions.moderation.unableToProcessModerationActionPleaseTry"));
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const onBulkAction = async (action: 'approve' | 'remove') => {
    if (!selectedRowKeys.length) {
      message.info(i18nT("ui.konnected.communityDiscussions.moderation.selectAtLeastOneItemToApply"));
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
            ? i18nT("ui.konnected.communityDiscussions.moderation.selectedContentRemovedAndReportsResolved")
            : i18nT("ui.konnected.communityDiscussions.moderation.selectedContentApprovedAndReportsResolved"),
        );
      } else if (failures.length === selectedRowKeys.length) {
        message.error(i18nT("ui.konnected.communityDiscussions.moderation.bulkActionFailedForAllSelectedItems"));
      } else {
        message.warning(
          i18nT("ui.konnected.communityDiscussions.moderation.bulkActionCompletedWithSomeFailuresCheck"),
        );
      }

      setSelectedRowKeys([]);
      await refresh();
    } catch {
      message.error(i18nT("ui.konnected.communityDiscussions.moderation.unexpectedErrorWhileProcessingBulkAction"));
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const severityTag = (severity?: Severity): ReactNode => {
    switch (severity) {
      case 'high':
        return (
          <Tag color="red" icon={<ExclamationCircleOutlined />}>
            {i18nT("ui.konnected.communityDiscussions.moderation.high")}
          </Tag>
        );
      case 'low':
        return <Tag color="green">{i18nT("ui.konnected.communityDiscussions.moderation.low")}</Tag>;
      case 'medium':
      default:
        return <Tag color="gold">{i18nT("ui.konnected.communityDiscussions.moderation.medium")}</Tag>;
    }
  };

  const statusBadge = (status: ModerationStatus): ReactNode => {
    switch (status) {
      case 'Resolved':
        return <Badge status="success" text={i18nT("ui.konnected.communityDiscussions.moderation.resolved")} />;
      case 'Escalated':
        return <Badge status="warning" text={i18nT("ui.konnected.communityDiscussions.moderation.escalated")} />;
      case 'Pending':
      default:
        return <Badge status="processing" text={i18nT("ui.konnected.communityDiscussions.moderation.pending")} />;
    }
  };

  const targetTag = (record: ModerationQueueItem): ReactNode => {
    const label =
      record.targetType === 'topic'
        ? 'Topic'
        : record.targetType === 'user'
        ? 'User'
        : 'Post';

    return <Tag>{label}</Tag>;
  };

  const columns: ProColumns<ModerationQueueItem>[] = [
    {
      title: i18nT("ui.konnected.communityDiscussions.moderation.content"),
      dataIndex: 'contentPreview',
      width: 320,
      ellipsis: true,
      render: (_, record) => (
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
              {i18nT("ui.konnected.communityDiscussions.moderation.reporterNote")} {record.reporterMessage}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.communityDiscussions.moderation.people"),
      dataIndex: 'authorName',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.authorName && (
            <Text>
              {i18nT("ui.konnected.communityDiscussions.moderation.author")} <Text strong>{record.authorName}</Text>
            </Text>
          )}
          {record.reporterName && (
            <Text type="secondary">
              {i18nT("ui.konnected.communityDiscussions.moderation.reportedBy")} {record.reporterName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.communityDiscussions.moderation.reports"),
      dataIndex: 'reportCount',
      width: 120,
      align: 'center',
      render: (value, record) => (
        <Space direction="vertical" size={2}>
          <Badge
            count={value ?? 1}
            style={{ backgroundColor: '#722ed1' }}
            overflowCount={99}
          />
          {severityTag(record.severity)}
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.communityDiscussions.moderation.status"),
      dataIndex: 'status',
      width: 140,
      render: (_, record) => statusBadge(record.status),
      filters: true,
      valueEnum: {
        Pending: { text: i18nT("ui.konnected.communityDiscussions.moderation.pending") },
        Escalated: { text: i18nT("ui.konnected.communityDiscussions.moderation.escalated") },
        Resolved: { text: i18nT("ui.konnected.communityDiscussions.moderation.resolved") },
      },
    },
    {
      title: i18nT("ui.konnected.communityDiscussions.moderation.timeline"),
      dataIndex: 'createdAt',
      width: 220,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          {record.createdAt && (
            <Text type="secondary">
              {i18nT("ui.konnected.communityDiscussions.moderation.reported")}{' '}
              {new Date(record.createdAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </Text>
          )}
          {record.lastActionAt && (
            <Text type="secondary">
              {i18nT("ui.konnected.communityDiscussions.moderation.lastAction")}{' '}
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
      title: i18nT("ui.konnected.communityDiscussions.moderation.actions"),
      key: 'actions',
      width: 220,
      fixed: 'right',
      render: (_, record) => {
        const disabled = unauthorized || globalActionLoading || record.status === 'Resolved';

        return (
          <Space>
            <Tooltip title={i18nT("ui.konnected.communityDiscussions.moderation.reviewFullReportDetails")}>
              <Button
                icon={<EyeOutlined />}
                size="small"
                onClick={() => setDetailDrawerItem(record)}
              />
            </Tooltip>

            <Tooltip title={i18nT("ui.konnected.communityDiscussions.moderation.contentIsAcceptableResolveReport")}>
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                type="default"
                disabled={disabled}
                onClick={() => onSingleAction(record, 'approve')}
              >
                {i18nT("ui.konnected.communityDiscussions.moderation.approve")}
              </Button>
            </Tooltip>

            <Popconfirm
              title={i18nT("ui.konnected.communityDiscussions.moderation.removeContent")}
              description={i18nT("ui.konnected.communityDiscussions.moderation.thisWillRemoveTheContentForEveryone")}
              okText={i18nT("ui.konnected.communityDiscussions.moderation.remove")}
              okType="danger"
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              disabled={disabled}
              onConfirm={() => onSingleAction(record, 'remove')}
            >
              <Tooltip title={i18nT("ui.konnected.communityDiscussions.moderation.removeContentAndResolveReport")}>
                <Button
                  size="small"
                  icon={<StopOutlined />}
                  danger
                  disabled={disabled}
                >
                  {i18nT("ui.konnected.communityDiscussions.moderation.remove")}
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  const bulkActions = (
    <Space>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Pending')}
        type={activeStatusFilter === 'Pending' ? 'primary' : 'default'}
      >
        {i18nT("ui.konnected.communityDiscussions.moderation.pending")}
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Escalated')}
        type={activeStatusFilter === 'Escalated' ? 'primary' : 'default'}
      >
        {i18nT("ui.konnected.communityDiscussions.moderation.escalated")}
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Resolved')}
        type={activeStatusFilter === 'Resolved' ? 'primary' : 'default'}
      >
        {i18nT("ui.konnected.communityDiscussions.moderation.resolved")}
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('all')}
        type={activeStatusFilter === 'all' ? 'primary' : 'default'}
      >
        {i18nT("ui.konnected.communityDiscussions.moderation.all")}
      </Button>
    </Space>
  );

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.communityDiscussions.moderation.communityModeration")}
      subtitle={i18nT("ui.konnected.communityDiscussions.moderation.reviewAndActOnReportsForForum")}
      primaryAction={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => refresh()}
          loading={loading || globalActionLoading}
        >
          {i18nT("ui.konnected.communityDiscussions.moderation.refreshQueue")}
        </Button>
      }
      secondaryActions={bulkActions}
    >
      {unauthorized && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.konnected.communityDiscussions.moderation.youDoNotHavePermissionToModerate")}
          description={i18nT("ui.konnected.communityDiscussions.moderation.ifYouBelieveThisIsAnError")}
        />
      )}

      {!unauthorized && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.konnected.communityDiscussions.moderation.moderationGuidelines")}
          description={
            <>
              {i18nT("ui.konnected.communityDiscussions.moderation.approveContentThatAlignsWithYourCommunity")}
            </>
          }
        />
      )}

      {error && !unauthorized && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.konnected.communityDiscussions.moderation.unableToLoadModerationQueue")}
          description={i18nT("ui.konnected.communityDiscussions.moderation.checkYourConnectionOrTryAgainIf")}
        />
      )}

      {items.length === 0 && !loading && !error && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.konnected.communityDiscussions.moderation.noOpenReports")}
          description={i18nT("ui.konnected.communityDiscussions.moderation.yourCommunityIsAllClearNewReports")}
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
          showTotal: (total) => i18nT("ui.konnected.communityDiscussions.moderation.reportsCount", { count: total }),
        }}
        sticky
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        tableAlertRender={({ selectedRowKeys: keys }) => (
          <Space size={8}>
            <Text strong>{keys.length}</Text>
            <Text>{i18nT("ui.konnected.communityDiscussions.moderation.selected")}</Text>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space>
            <Tooltip title={i18nT("ui.konnected.communityDiscussions.moderation.resolveAndKeepContent")}>
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                disabled={!selectedRowKeys.length || unauthorized}
                onClick={() => onBulkAction('approve')}
              >
                {i18nT("ui.konnected.communityDiscussions.moderation.bulkApprove")}
              </Button>
            </Tooltip>
            <Tooltip title={i18nT("ui.konnected.communityDiscussions.moderation.removeContentAndResolveReports")}>
              <Popconfirm
                title={i18nT("ui.konnected.communityDiscussions.moderation.removeSelectedContent")}
                description={i18nT("ui.konnected.communityDiscussions.moderation.thisWillRemoveContentForAllSelected")}
                okText={i18nT("ui.konnected.communityDiscussions.moderation.remove")}
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
                  {i18nT("ui.konnected.communityDiscussions.moderation.bulkRemove")}
                </Button>
              </Popconfirm>
            </Tooltip>
          </Space>
        )}
        scroll={{ x: 1100 }}
      />

      <Drawer
        title={i18nT("ui.konnected.communityDiscussions.moderation.reportDetails")}
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
                <Text strong>{i18nT("ui.konnected.communityDiscussions.moderation.threadContext")}</Text>
                <Paragraph>{detailDrawerItem.contextTitle}</Paragraph>
              </div>
            )}

            {detailDrawerItem.contentPreview && (
              <div>
                <Text strong>{i18nT("ui.konnected.communityDiscussions.moderation.contentPreview")}</Text>
                <Paragraph>{detailDrawerItem.contentPreview}</Paragraph>
              </div>
            )}

            <div>
              <Text strong>{i18nT("ui.konnected.communityDiscussions.moderation.people")}</Text>
              <Paragraph>
                {detailDrawerItem.authorName && (
                  <>
                    {i18nT("ui.konnected.communityDiscussions.moderation.author")} <Text strong>{detailDrawerItem.authorName}</Text>
                    <br />
                  </>
                )}
                {detailDrawerItem.reporterName && (
                  <>
                    {i18nT("ui.konnected.communityDiscussions.moderation.reporter")} <Text>{detailDrawerItem.reporterName}</Text>
                    <br />
                  </>
                )}
                {detailDrawerItem.reportCount && (
                  <>{i18nT("ui.konnected.communityDiscussions.moderation.reportsMerged")} {detailDrawerItem.reportCount}</>
                )}
              </Paragraph>
            </div>

            {detailDrawerItem.reporterMessage && (
              <div>
                <Text strong>{i18nT("ui.konnected.communityDiscussions.moderation.reporterNote_96bc48")}</Text>
                <Paragraph>{detailDrawerItem.reporterMessage}</Paragraph>
              </div>
            )}

            <div>
              <Text strong>{i18nT("ui.konnected.communityDiscussions.moderation.timeline")}</Text>
              <Paragraph type="secondary">
                {detailDrawerItem.createdAt && (
                  <>
                    {i18nT("ui.konnected.communityDiscussions.moderation.reported_f0fd54")}{' '}
                    {new Date(detailDrawerItem.createdAt).toLocaleString(
                      undefined,
                      { dateStyle: 'medium', timeStyle: 'short' },
                    )}
                    <br />
                  </>
                )}
                {detailDrawerItem.lastActionAt && (
                  <>
                    {i18nT("ui.konnected.communityDiscussions.moderation.lastAction_d6e246")}{' '}
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
              message={i18nT("ui.konnected.communityDiscussions.moderation.nextSteps")}
              description={i18nT("ui.konnected.communityDiscussions.moderation.useTheActionsInTheTableTo")}
            />
          </Space>
        )}
      </Drawer>

      <Modal
        open={false}
        footer={null}
        closable={false}
        destroyOnHidden
        // Reserved for future: escalation / mute / ban workflows
      />
    </KonnectedPageShell>
  );
}

// app/konnected/community-discussions/moderation/page.tsx
