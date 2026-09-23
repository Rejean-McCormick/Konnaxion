// FILE: frontend/app/ethikos/admin/moderation/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
  StopOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
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
import { useMemo, useState } from 'react';
import type { Key, ReactNode } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { actOnReport, fetchModerationQueue } from '@/services/admin';

const { Text, Paragraph } = Typography;

type ModerationStatus = 'Pending' | 'Resolved' | 'Escalated';
type ModerationTargetType = 'topic' | 'post' | 'user';
type ModerationSeverity = 'low' | 'medium' | 'high';
type ModerationAction = 'approve' | 'remove';

interface ModerationQueueItem {
  id: string;
  targetType: ModerationTargetType;
  targetId: string;
  contextTitle?: string;
  contentPreview?: string;
  authorName?: string;
  authorId?: string;
  reporterName?: string;
  reporterId?: string;
  reason?: string;
  reporterMessage?: string;
  reportCount?: number;
  createdAt?: string;
  lastActionAt?: string;
  status: ModerationStatus;
  severity?: ModerationSeverity;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function unwrapPayload(raw: unknown): unknown {
  if (!isRecord(raw)) {
    return raw;
  }

  if ('data' in raw && raw.data !== undefined) {
    return raw.data;
  }

  return raw;
}

function extractItems(raw: unknown): unknown[] {
  const payload = unwrapPayload(raw);

  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.items)) {
    return payload.items;
  }

  if (Array.isArray(payload.results)) {
    return payload.results;
  }

  if (Array.isArray(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload.data)) {
    if (Array.isArray(payload.data.items)) {
      return payload.data.items;
    }

    if (Array.isArray(payload.data.results)) {
      return payload.data.results;
    }
  }

  return [];
}

function readString(record: UnknownRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function readNumber(record: UnknownRecord, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value);

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }
  }

  return undefined;
}

function coerceStatus(value: unknown): ModerationStatus {
  if (typeof value !== 'string') {
    return 'Pending';
  }

  const normalized = value.toLowerCase();

  if (normalized === 'resolved' || normalized === 'reviewed') {
    return 'Resolved';
  }

  if (normalized === 'escalated') {
    return 'Escalated';
  }

  return 'Pending';
}

function coerceTargetType(value: unknown): ModerationTargetType {
  if (value === 'topic' || value === 'post' || value === 'user') {
    return value;
  }

  if (
    value === 'argument' ||
    value === 'comment' ||
    value === 'message' ||
    value === 'reply'
  ) {
    return 'post';
  }

  return 'post';
}

function coerceSeverity(value: unknown): ModerationSeverity {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value;
  }

  if (value === 'critical') {
    return 'high';
  }

  return 'medium';
}

function adaptModerationItems(raw: unknown): ModerationQueueItem[] {
  return extractItems(raw)
    .filter(isRecord)
    .map((item, index): ModerationQueueItem => {
      const id =
        readString(item, ['id', 'reportId', 'report_id']) ??
        `moderation-report-${index}`;

      return {
        id,
        targetType: coerceTargetType(
          item.targetType ??
            item.target_type ??
            item.entityType ??
            item.entity_type ??
            item.type,
        ),
        targetId:
          readString(item, [
            'targetId',
            'target_id',
            'argumentId',
            'argument_id',
            'postId',
            'post_id',
            'topicId',
            'topic_id',
            'userId',
            'user_id',
            'id',
          ]) ?? id,
        contextTitle: readString(item, [
          'contextTitle',
          'context_title',
          'threadTitle',
          'thread_title',
          'topicTitle',
          'topic_title',
          'debateTitle',
          'debate_title',
        ]),
        contentPreview: readString(item, [
          'contentPreview',
          'content_preview',
          'contentSnippet',
          'content_snippet',
          'content',
          'preview',
        ]),
        authorName: readString(item, [
          'authorName',
          'author_name',
          'offenderName',
          'offender_name',
          'user',
          'username',
          'author',
        ]),
        authorId: readString(item, [
          'authorId',
          'author_id',
          'offenderId',
          'offender_id',
          'userId',
          'user_id',
        ]),
        reporterName: readString(item, [
          'reporterName',
          'reporter_name',
          'reporter',
        ]),
        reporterId: readString(item, ['reporterId', 'reporter_id']),
        reason: readString(item, [
          'reason',
          'reportReason',
          'report_reason',
          'category',
          'type',
        ]),
        reporterMessage: readString(item, [
          'reporterMessage',
          'reporter_message',
          'message',
          'notes',
        ]),
        reportCount:
          readNumber(item, ['reportCount', 'report_count', 'count']) ?? 1,
        createdAt: readString(item, [
          'createdAt',
          'created_at',
          'timestamp',
          'reportedAt',
          'reported_at',
        ]),
        lastActionAt: readString(item, [
          'lastActionAt',
          'last_action_at',
          'updatedAt',
          'updated_at',
        ]),
        status: coerceStatus(item.status),
        severity: coerceSeverity(item.severity ?? item.priority),
      };
    });
}

function isUnauthorizedError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  if (error.status === 403) {
    return true;
  }

  const response = error.response;

  return isRecord(response) && response.status === 403;
}

function formatDate(value?: string): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function EthikosModerationPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<
    ModerationStatus | 'all'
  >('Pending');
  const [detailDrawerItem, setDetailDrawerItem] =
    useState<ModerationQueueItem | null>(null);
  const [globalActionLoading, setGlobalActionLoading] = useState(false);

  const { message } = AntdApp.useApp();

  const {
    data: rawData,
    loading,
    error,
    refresh,
  } = useRequest(fetchModerationQueue);

  const items = useMemo(() => adaptModerationItems(rawData), [rawData]);

  const filteredItems = useMemo(() => {
    if (activeStatusFilter === 'all') {
      return items;
    }

    return items.filter((item) => item.status === activeStatusFilter);
  }, [activeStatusFilter, items]);

  const unauthorized = isUnauthorizedError(error);
  const selectedCount = selectedRowKeys.length;

  const onSingleAction = async (
    record: ModerationQueueItem,
    action: ModerationAction,
  ): Promise<void> => {
    try {
      setGlobalActionLoading(true);

      const remove = action === 'remove';

      await actOnReport(record.id, remove);

      message.success(
        remove
          ? i18nT("ui.ethikos.admin.moderation.debateContentRemovedAndReportResolved")
          : i18nT("ui.ethikos.admin.moderation.contentApprovedAndReportResolved"),
      );

      refresh();
    } catch {
      message.error(i18nT("ui.ethikos.admin.moderation.unableToProcessModerationActionPleaseTry"));
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const onBulkAction = async (action: ModerationAction): Promise<void> => {
    if (selectedRowKeys.length === 0) {
      message.info(i18nT("ui.ethikos.admin.moderation.selectAtLeastOneReportToApply"));
      return;
    }

    setGlobalActionLoading(true);

    try {
      const remove = action === 'remove';

      const results = await Promise.allSettled(
        selectedRowKeys.map((id) => actOnReport(String(id), remove)),
      );

      const failures = results.filter((result) => result.status === 'rejected');

      if (failures.length === 0) {
        message.success(
          remove
            ? i18nT("ui.ethikos.admin.moderation.selectedContentRemovedAndReportsResolved")
            : i18nT("ui.ethikos.admin.moderation.selectedContentApprovedAndReportsResolved"),
        );
      } else if (failures.length === selectedRowKeys.length) {
        message.error(i18nT("ui.ethikos.admin.moderation.bulkActionFailedForAllSelectedReports"));
      } else {
        message.warning(
          i18nT("ui.ethikos.admin.moderation.reportSCouldNotBeProcessedThe", { length: failures.length }),
        );
      }

      setSelectedRowKeys([]);
      refresh();
    } catch {
      message.error(i18nT("ui.ethikos.admin.moderation.unableToCompleteBulkActionPleaseTry"));
    } finally {
      setGlobalActionLoading(false);
    }
  };

  const severityTag = (severity?: ModerationSeverity): ReactNode => {
    if (!severity) {
      return null;
    }

    const color =
      severity === 'high' ? 'red' : severity === 'medium' ? 'orange' : 'blue';

    const text =
      severity === 'high'
        ? i18nT("ui.ethikos.admin.moderation.highSeverity")
        : severity === 'medium'
          ? 'Medium'
          : 'Low';

    return (
      <Tag color={color}>
        <ExclamationCircleOutlined /> {text}
      </Tag>
    );
  };

  const targetTag = (record: ModerationQueueItem): ReactNode => {
    const label =
      record.targetType === 'topic'
        ? i18nT("ui.ethikos.admin.moderation.debateTopic_24a2d8")
        : record.targetType === 'user'
          ? 'Participant'
          : i18nT("ui.ethikos.admin.moderation.argumentPost");

    return <Tag>{label}</Tag>;
  };

  const statusBadge = (status: ModerationStatus): ReactNode => {
    if (status === 'Resolved') {
      return (
        <Badge
          status="success"
          text={
            <Space size={4}>
              <CheckCircleOutlined />
              {i18nT("ui.ethikos.admin.moderation.resolved")}
            </Space>
          }
        />
      );
    }

    if (status === 'Escalated') {
      return <Badge status="warning" text={i18nT("ui.ethikos.admin.moderation.escalated")} />;
    }

    return <Badge status="processing" text={i18nT("ui.ethikos.admin.moderation.pendingReview")} />;
  };

  const statusFilterButtons = (
    <Space wrap>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Pending')}
        type={activeStatusFilter === 'Pending' ? 'primary' : 'default'}
      >
        {i18nT("ui.ethikos.admin.moderation.pending")}
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Escalated')}
        type={activeStatusFilter === 'Escalated' ? 'primary' : 'default'}
      >
        {i18nT("ui.ethikos.admin.moderation.escalated")}
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('Resolved')}
        type={activeStatusFilter === 'Resolved' ? 'primary' : 'default'}
      >
        {i18nT("ui.ethikos.admin.moderation.resolved")}
      </Button>
      <Button
        size="small"
        onClick={() => setActiveStatusFilter('all')}
        type={activeStatusFilter === 'all' ? 'primary' : 'default'}
      >
        {i18nT("ui.ethikos.admin.moderation.all")}
      </Button>
    </Space>
  );

  const headerActions = (
    <Space wrap>
      {statusFilterButtons}
      <Button
        icon={<ReloadOutlined />}
        onClick={() => refresh()}
        loading={loading || globalActionLoading}
        disabled={unauthorized}
      >
        {i18nT("ui.ethikos.admin.moderation.refreshQueue")}
      </Button>
    </Space>
  );

  const columns: ProColumns<ModerationQueueItem>[] = [
    {
      title: i18nT("ui.ethikos.admin.moderation.content"),
      dataIndex: 'contentPreview',
      ellipsis: true,
      render: (_dom, record) => (
        <Space direction="vertical" size={2}>
          {record.contextTitle && (
            <Text strong ellipsis>
              {record.contextTitle}
            </Text>
          )}
          <Text type="secondary" ellipsis>
            {record.contentPreview ?? i18nT("ui.ethikos.admin.moderation.noPreviewAvailable")}
          </Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.people"),
      dataIndex: 'authorName',
      width: 220,
      render: (_dom, record) => (
        <Space direction="vertical" size={2}>
          {record.authorName && (
            <Text ellipsis>
              {i18nT("ui.ethikos.admin.moderation.author")} <Text strong>{record.authorName}</Text>
            </Text>
          )}
          {record.reporterName && (
            <Text type="secondary" ellipsis>
              {i18nT("ui.ethikos.admin.moderation.reporter")} {record.reporterName}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.reason"),
      dataIndex: 'reason',
      width: 210,
      render: (_dom, record) => (
        <Space size={4} wrap>
          {severityTag(record.severity)}
          {record.reason && <Tag>{record.reason}</Tag>}
          {typeof record.reportCount === 'number' && record.reportCount > 1 && (
            <Tag>{record.reportCount} {i18nT("ui.ethikos.admin.moderation.reports")}</Tag>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.status"),
      dataIndex: 'status',
      width: 170,
      filters: [
        { text: i18nT("ui.ethikos.admin.moderation.pending"), value: 'Pending' },
        { text: i18nT("ui.ethikos.admin.moderation.escalated"), value: 'Escalated' },
        { text: i18nT("ui.ethikos.admin.moderation.resolved"), value: 'Resolved' },
      ],
      onFilter: (value, record) => record.status === String(value),
      render: (_dom, record) => statusBadge(record.status),
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.timeline"),
      dataIndex: 'createdAt',
      width: 220,
      render: (_dom, record) => {
        const createdAt = formatDate(record.createdAt);
        const lastActionAt = formatDate(record.lastActionAt);

        return (
          <Text type="secondary">
            {createdAt && (
              <>
                {i18nT("ui.ethikos.admin.moderation.reported")} {createdAt}
                <br />
              </>
            )}
            {lastActionAt && <>{i18nT("ui.ethikos.admin.moderation.lastAction")} {lastActionAt}</>}
            {!createdAt && !lastActionAt && i18nT("ui.ethikos.admin.moderation.noTimestamp")}
          </Text>
        );
      },
    },
    {
      title: i18nT("ui.ethikos.admin.moderation.actions"),
      key: 'actions',
      width: 240,
      fixed: 'right',
      render: (_dom, record) => {
        const disabled =
          unauthorized || globalActionLoading || record.status === 'Resolved';

        return (
          <Space size="small" wrap>
            <Tooltip title={i18nT("ui.ethikos.admin.moderation.viewDetails")}>
              <Button
                size="small"
                icon={<EyeOutlined />}
                onClick={() => setDetailDrawerItem(record)}
              />
            </Tooltip>

            <Tooltip title={i18nT("ui.ethikos.admin.moderation.approveContentAndResolveReport")}>
              <Button
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => onSingleAction(record, 'approve')}
                disabled={disabled}
              >
                {i18nT("ui.ethikos.admin.moderation.approve")}
              </Button>
            </Tooltip>

            <Popconfirm
              title={i18nT("ui.ethikos.admin.moderation.removeContent")}
              description={i18nT("ui.ethikos.admin.moderation.thisWillRemoveTheContentForEveryone")}
              okText={i18nT("ui.ethikos.admin.moderation.remove")}
              okType="danger"
              icon={<ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
              disabled={disabled}
              onConfirm={() => onSingleAction(record, 'remove')}
            >
              <Tooltip title={i18nT("ui.ethikos.admin.moderation.removeContentAndResolveReport")}>
                <Button
                  size="small"
                  icon={<StopOutlined />}
                  danger
                  disabled={disabled}
                >
                  {i18nT("ui.ethikos.admin.moderation.remove")}
                </Button>
              </Tooltip>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.admin.moderation.moderationQueue")}
      sectionLabel={i18nT("ui.ethikos.admin.moderation.admin")}
      subtitle={i18nT("ui.ethikos.admin.moderation.reviewAndActOnReportsForDebate")}
      secondaryActions={headerActions}
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          {unauthorized && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.admin.moderation.youDoNotHavePermissionToModerate")}
              description={i18nT("ui.ethikos.admin.moderation.ifYouBelieveThisIsAnError")}
            />
          )}

          {!unauthorized && (
            <Alert
              type="info"
              showIcon
              message={i18nT("ui.ethikos.admin.moderation.ethikosModerationGuidelines")}
              description={i18nT("ui.ethikos.admin.moderation.argumentsThatReceiveMultipleIndependentReportsMay")}
            />
          )}

          {error && !unauthorized && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.admin.moderation.unableToLoadTheModerationQueue")}
              description={i18nT("ui.ethikos.admin.moderation.checkYourConnectionOrTryAgainIf")}
            />
          )}

          {items.length === 0 && !loading && !error && !unauthorized && (
            <Alert
              type="success"
              showIcon
              message={i18nT("ui.ethikos.admin.moderation.noOpenReports")}
              description={i18nT("ui.ethikos.admin.moderation.thereAreCurrentlyNoUnresolvedReportsOn")}
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
              showTotal: (total) => i18nT("ui.ethikos.admin.moderation.reportsCount", { count: total }),
            }}
            rowSelection={{
              selectedRowKeys,
              onChange: (keys) => setSelectedRowKeys([...keys]),
              getCheckboxProps: (record) => ({
                disabled:
                  unauthorized ||
                  globalActionLoading ||
                  record.status === 'Resolved',
              }),
            }}
            tableAlertRender={({ selectedRowKeys: keys }) => (
              <Space size={8}>
                <Text strong>{keys.length}</Text>
                <Text>{i18nT("ui.ethikos.admin.moderation.selected")}</Text>
              </Space>
            )}
            tableAlertOptionRender={() => (
              <Space wrap>
                <Tooltip title={i18nT("ui.ethikos.admin.moderation.contentIsAcceptableResolveReportsAndKeep")}>
                  <Button
                    size="small"
                    icon={<CheckCircleOutlined />}
                    onClick={() => onBulkAction('approve')}
                    disabled={
                      unauthorized || globalActionLoading || selectedCount === 0
                    }
                  >
                    {i18nT("ui.ethikos.admin.moderation.bulkApprove")}
                  </Button>
                </Tooltip>

                <Popconfirm
                  title={i18nT("ui.ethikos.admin.moderation.removeSelectedContent")}
                  description={i18nT("ui.ethikos.admin.moderation.thisWillRemoveContentForAllSelected")}
                  okText={i18nT("ui.ethikos.admin.moderation.remove")}
                  okType="danger"
                  icon={
                    <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
                  }
                  disabled={
                    unauthorized || globalActionLoading || selectedCount === 0
                  }
                  onConfirm={() => onBulkAction('remove')}
                >
                  <Tooltip title={i18nT("ui.ethikos.admin.moderation.removeContentAndResolveSelectedReports")}>
                    <Button
                      size="small"
                      danger
                      icon={<StopOutlined />}
                      disabled={
                        unauthorized ||
                        globalActionLoading ||
                        selectedCount === 0
                      }
                    >
                      {i18nT("ui.ethikos.admin.moderation.bulkRemove")}
                    </Button>
                  </Tooltip>
                </Popconfirm>
              </Space>
            )}
            scroll={{ x: 1100 }}
          />

          <Drawer
            title={i18nT("ui.ethikos.admin.moderation.reportDetails")}
            width={480}
            open={!!detailDrawerItem}
            onClose={() => setDetailDrawerItem(null)}
          >
            {detailDrawerItem && (
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <Space wrap>
                  {targetTag(detailDrawerItem)}
                  {severityTag(detailDrawerItem.severity)}
                  {statusBadge(detailDrawerItem.status)}
                  {detailDrawerItem.reason && (
                    <Tag>{detailDrawerItem.reason}</Tag>
                  )}
                </Space>

                {detailDrawerItem.contextTitle && (
                  <div>
                    <Text strong>{i18nT("ui.ethikos.admin.moderation.debateTopic")}</Text>
                    <Paragraph>{detailDrawerItem.contextTitle}</Paragraph>
                  </div>
                )}

                {detailDrawerItem.contentPreview && (
                  <div>
                    <Text strong>{i18nT("ui.ethikos.admin.moderation.argumentMessage")}</Text>
                    <Paragraph>{detailDrawerItem.contentPreview}</Paragraph>
                  </div>
                )}

                <div>
                  <Text strong>{i18nT("ui.ethikos.admin.moderation.people")}</Text>
                  <Paragraph>
                    {detailDrawerItem.authorName && (
                      <>
                        {i18nT("ui.ethikos.admin.moderation.author")}{' '}
                        <Text strong>{detailDrawerItem.authorName}</Text>
                        <br />
                      </>
                    )}
                    {detailDrawerItem.reporterName && (
                      <>
                        {i18nT("ui.ethikos.admin.moderation.reporter")} <Text>{detailDrawerItem.reporterName}</Text>
                        <br />
                      </>
                    )}
                    {detailDrawerItem.reportCount && (
                      <>{i18nT("ui.ethikos.admin.moderation.reportsMerged")} {detailDrawerItem.reportCount}</>
                    )}
                  </Paragraph>
                </div>

                {detailDrawerItem.reporterMessage && (
                  <div>
                    <Text strong>{i18nT("ui.ethikos.admin.moderation.reporterNote")}</Text>
                    <Paragraph>{detailDrawerItem.reporterMessage}</Paragraph>
                  </div>
                )}

                <div>
                  <Text strong>{i18nT("ui.ethikos.admin.moderation.timeline")}</Text>
                  <Paragraph type="secondary">
                    {formatDate(detailDrawerItem.createdAt) && (
                      <>
                        {i18nT("ui.ethikos.admin.moderation.reported")} {formatDate(detailDrawerItem.createdAt)}
                        <br />
                      </>
                    )}
                    {formatDate(detailDrawerItem.lastActionAt) && (
                      <>
                        {i18nT("ui.ethikos.admin.moderation.lastAction")}{' '}
                        {formatDate(detailDrawerItem.lastActionAt)}
                      </>
                    )}
                    {!formatDate(detailDrawerItem.createdAt) &&
                      !formatDate(detailDrawerItem.lastActionAt) &&
                      i18nT("ui.ethikos.admin.moderation.noTimestampAvailable")}
                  </Paragraph>
                </div>

                <Alert
                  type="info"
                  showIcon
                  message={i18nT("ui.ethikos.admin.moderation.nextSteps")}
                  description={i18nT("ui.ethikos.admin.moderation.useTheActionsInTheTableTo")}
                />
              </Space>
            )}
          </Drawer>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}