// FILE: frontend/app/ethikos/impact/tracker/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  AuditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  FlagOutlined,
  LinkOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  App,
  Button,
  Empty,
  Progress,
  Segmented,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchImpactTracker,
  type ImpactStatus,
  patchImpactStatus,
  type TrackerItem,
} from '@/services/impact';

dayjs.extend(relativeTime);

const { Paragraph, Text } = Typography;

type TrackerPayload = { items: TrackerItem[] };
type StatusFilter = 'all' | 'active' | 'needs-attention' | ImpactStatus;

type TrackerRow = TrackerItem & {
  action?: string | null;
  actionLabel?: string | null;
  nextMilestone?: string | null;
  next_milestone?: string | null;
  dueAt?: string | null;
  due_at?: string | null;
  evidenceUrl?: string | null;
  evidence_url?: string | null;
  feedbackCount?: number | null;
  feedback_count?: number | null;
  blockedReason?: string | null;
  blocked_reason?: string | null;
};

const STATUS_VALUES: ImpactStatus[] = [
  'Planned',
  'In-Progress',
  'Completed',
  'Blocked',
];

const STATUS_LABELS: Record<ImpactStatus, string> = {
  Planned: 'Planned',
  'In-Progress': 'In progress',
  Completed: 'Completed',
  Blocked: 'Blocked',
};

const STATUS_COLORS: Record<ImpactStatus, string> = {
  Planned: 'default',
  'In-Progress': 'processing',
  Completed: 'success',
  Blocked: 'error',
};

const FILTER_OPTIONS = (i18nT: TranslateFunction): { label: string; value: StatusFilter }[] => ([
  { label: i18nT("ui.ethikos.impact.tracker.active"), value: 'active' },
  { label: i18nT("ui.ethikos.impact.tracker.needsAttention"), value: 'needs-attention' },
  { label: i18nT("ui.ethikos.impact.tracker.all"), value: 'all' },
  { label: i18nT("ui.ethikos.impact.tracker.planned"), value: 'Planned' },
  { label: i18nT("ui.ethikos.impact.tracker.inProgress"), value: 'In-Progress' },
  { label: i18nT("ui.ethikos.impact.tracker.completed"), value: 'Completed' },
  { label: i18nT("ui.ethikos.impact.tracker.blocked"), value: 'Blocked' },
]);

function isActive(status: ImpactStatus): boolean {
  return status === 'Planned' || status === 'In-Progress';
}

function isOverdue(item: TrackerRow): boolean {
  const dueAt = item.dueAt ?? item.due_at;

  if (!dueAt || item.status === 'Completed') {
    return false;
  }

  const parsed = dayjs(dueAt);

  return parsed.isValid() && parsed.isBefore(dayjs(), 'day');
}

function optionalString(
  item: TrackerRow,
  keys: Array<keyof TrackerRow>,
): string | undefined {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return undefined;
}

function optionalNumber(
  item: TrackerRow,
  keys: Array<keyof TrackerRow>,
): number | undefined {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return undefined;
}

function formatRelative(i18nT: TranslateFunction, value?: string | null): string {
  if (!value) {
    return i18nT("ui.ethikos.impact.tracker.noActivityYet");
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.fromNow() : 'Unknown';
}

function formatDate(i18nT: TranslateFunction, value?: string | null): string {
  if (!value) {
    return i18nT("ui.ethikos.impact.tracker.noDateSet");
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : 'Unknown';
}

function route(path: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}sidebar=ethikos`;
}

export default function ImpactTracker(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { message } = App.useApp();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, loading, error, mutate, refresh } = useRequest<
    TrackerPayload,
    []
  >(fetchImpactTracker);

  const items = useMemo<TrackerRow[]>(
    () => (data?.items ?? []) as TrackerRow[],
    [data],
  );

  const stats = useMemo(() => {
    const total = items.length;
    const planned = items.filter((item) => item.status === 'Planned').length;
    const inProgress = items.filter(
      (item) => item.status === 'In-Progress',
    ).length;
    const completed = items.filter(
      (item) => item.status === 'Completed',
    ).length;
    const blocked = items.filter((item) => item.status === 'Blocked').length;
    const active = planned + inProgress;
    const overdue = items.filter(isOverdue).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      planned,
      inProgress,
      completed,
      blocked,
      active,
      overdue,
      completionRate,
      needsAttention: blocked + overdue,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') {
      return items;
    }

    if (statusFilter === 'active') {
      return items.filter((item) => isActive(item.status));
    }

    if (statusFilter === 'needs-attention') {
      return items.filter((item) => item.status === 'Blocked' || isOverdue(item));
    }

    return items.filter((item) => item.status === statusFilter);
  }, [items, statusFilter]);

  const statusOptions = useMemo(
    () =>
      STATUS_VALUES.map((value) => ({
        value,
        label: STATUS_LABELS[value],
      })),
    [],
  );

  const handleStatusChange = async (
    id: string,
    status: ImpactStatus,
  ): Promise<void> => {
    setUpdatingId(id);

    try {
      await patchImpactStatus(id, status);

      if (data) {
        const next: TrackerPayload = {
          items: data.items.map((item) =>
            item.id === id
              ? {
                  ...item,
                  status,
                  updatedAt: new Date().toISOString(),
                }
              : item,
          ),
        };

        mutate(next);
      } else {
        refresh();
      }

      message.success(i18nT("ui.ethikos.impact.tracker.impactStatusUpdated"));
    } catch (requestError) {
      console.error('Failed to update impact status', requestError);
      message.error(i18nT("ui.ethikos.impact.tracker.couldNotUpdateImpactStatus"));
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: ProColumns<TrackerRow>[] = [
    {
      title: i18nT("ui.ethikos.impact.tracker.decisionPromise"),
      dataIndex: 'title',
      width: 340,
      ellipsis: true,
      render: (_dom, row) => {
        const action =
          optionalString(row, ['action', 'actionLabel']) ??
          i18nT("ui.ethikos.impact.tracker.followUpActionNotSpecifiedYet");

        return (
          <Space direction="vertical" size={2}>
            <Text strong>{row.title}</Text>
            <Text type="secondary">{action}</Text>

            {row.status === 'Blocked' ? (
              <Tag icon={<ExclamationCircleOutlined />} color="error">
                {i18nT("ui.ethikos.impact.tracker.needsUnblock")}
              </Tag>
            ) : null}

            {isOverdue(row) ? (
              <Tag icon={<ClockCircleOutlined />} color="volcano">
                {i18nT("ui.ethikos.impact.tracker.overdue")}
              </Tag>
            ) : null}
          </Space>
        );
      },
    },
    {
      title: i18nT("ui.ethikos.impact.tracker.owner"),
      dataIndex: 'owner',
      width: 180,
      ellipsis: true,
      render: (_dom, row) =>
        row.owner ? (
          <Text>{row.owner}</Text>
        ) : (
          <Text type="secondary">{i18nT("ui.ethikos.impact.tracker.noOwnerAssigned")}</Text>
        ),
    },
    {
      title: i18nT("ui.ethikos.impact.tracker.status"),
      dataIndex: 'status',
      width: 260,
      render: (_dom, row) => {
        const isUpdating = updatingId === row.id;
        const isDisabled = updatingId !== null && !isUpdating;

        return (
          <Space wrap>
            <Tag color={STATUS_COLORS[row.status]}>
              {STATUS_LABELS[row.status]}
            </Tag>

            <Select<ImpactStatus>
              size="small"
              style={{ minWidth: 140 }}
              value={row.status}
              options={statusOptions}
              loading={isUpdating}
              disabled={isDisabled}
              onChange={(value) => {
                void handleStatusChange(row.id, value);
              }}
            />
          </Space>
        );
      },
    },
    {
      title: i18nT("ui.ethikos.impact.tracker.nextMilestone"),
      key: 'milestone',
      width: 260,
      render: (_dom, row) => {
        const milestone =
          optionalString(row, ['nextMilestone', 'next_milestone']) ??
          i18nT("ui.ethikos.impact.tracker.noMilestoneRecorded");
        const dueAt = row.dueAt ?? row.due_at;

        return (
          <Space direction="vertical" size={2}>
            <Text>{milestone}</Text>
            <Text type={isOverdue(row) ? 'danger' : 'secondary'}>
              {i18nT("ui.ethikos.impact.tracker.due")} {formatDate(i18nT, dueAt)}
            </Text>
          </Space>
        );
      },
    },
    {
      title: i18nT("ui.ethikos.impact.tracker.evidenceFeedback"),
      key: 'evidence',
      width: 220,
      render: (_dom, row) => {
        const evidenceUrl = optionalString(row, ['evidenceUrl', 'evidence_url']);
        const feedbackCount = optionalNumber(row, [
          'feedbackCount',
          'feedback_count',
        ]);

        return (
          <Space direction="vertical" size={4}>
            {evidenceUrl ? (
              <Button
                size="small"
                icon={<LinkOutlined />}
                href={evidenceUrl}
                target="_blank"
              >
                {i18nT("ui.ethikos.impact.tracker.evidence")}
              </Button>
            ) : (
              <Text type="secondary">{i18nT("ui.ethikos.impact.tracker.noEvidenceLinked")}</Text>
            )}

            <Button
              size="small"
              type="link"
              href={route('/ethikos/impact/feedback')}
              style={{ padding: 0 }}
            >
              {feedbackCount ?? 0} {i18nT("ui.ethikos.impact.tracker.feedbackItems")}
            </Button>
          </Space>
        );
      },
    },
    {
      title: i18nT("ui.ethikos.impact.tracker.lastActivity"),
      dataIndex: 'updatedAt',
      width: 180,
      sorter: (a, b) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      render: (_dom, row) => <Text>{formatRelative(i18nT, row.updatedAt)}</Text>,
    },
  ];

  const secondaryActions = (
    <Space wrap>
      <Button href={route('/ethikos/impact/outcomes')}>{i18nT("ui.ethikos.impact.tracker.outcomes")}</Button>
      <Button href={route('/ethikos/impact/feedback')}>{i18nT("ui.ethikos.impact.tracker.feedback")}</Button>
      <Button
        icon={<ReloadOutlined />}
        onClick={() => refresh()}
        type="default"
        loading={loading}
        disabled={updatingId !== null}
      >
        {i18nT("ui.ethikos.impact.tracker.refresh")}
      </Button>
    </Space>
  );

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.impact.tracker.impactTracker")}
      sectionLabel={i18nT("ui.ethikos.impact.tracker.impact")}
      metaTitle={i18nT("ui.ethikos.impact.tracker.impactTracker_9590e1")}
      subtitle={i18nT("ui.ethikos.impact.tracker.followEthikosDecisionsFromPromiseToAction")}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={loading}>
        {error ? (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={i18nT("ui.ethikos.impact.tracker.unableToLoadImpactTracker")}
            description={i18nT("ui.ethikos.impact.tracker.checkTheImpactServiceAndRetry")}
          />
        ) : null}

        <ProCard
          title={
            <Space>
              <FlagOutlined />
              <span>{i18nT("ui.ethikos.impact.tracker.impactWorkflow")}</span>
            </Space>
          }
          style={{ marginBottom: 16 }}
        >
          <ProCard gutter={[16, 16]} wrap ghost>
            <ProCard colSpan={{ xs: 24, md: 6 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <AuditOutlined />
                  <Text strong>{i18nT("ui.ethikos.impact.tracker.text1Decision")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.impact.tracker.startFromADecisionConsultationOrDeliberation")}
                </Paragraph>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 6 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <SendOutlined />
                  <Text strong>{i18nT("ui.ethikos.impact.tracker.text2Action")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.impact.tracker.trackTheFollowUpActionAndAssign")}
                </Paragraph>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 6 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <FileSearchOutlined />
                  <Text strong>{i18nT("ui.ethikos.impact.tracker.text3Evidence")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.impact.tracker.linkEvidenceSoProgressCanBeVerified")}
                </Paragraph>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 6 }} bordered>
              <Space direction="vertical" size={8}>
                <Space>
                  <CheckCircleOutlined />
                  <Text strong>{i18nT("ui.ethikos.impact.tracker.text4Closure")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.impact.tracker.closeReviseOrUnblockTheCommitmentBased")}
                </Paragraph>
              </Space>
            </ProCard>
          </ProCard>
        </ProCard>

        {stats.needsAttention > 0 ? (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message={i18nT("ui.ethikos.impact.tracker.trackedItemNeedAttention", { needsAttention: stats.needsAttention, value1: stats.needsAttention === 1 ? '' : 's' })}
            description={i18nT("ui.ethikos.impact.tracker.blockedOrOverdueItemsShouldBeReviewed")}
          />
        ) : null}

        <ProCard gutter={[16, 16]} wrap style={{ marginBottom: 16 }}>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, xl: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.impact.tracker.trackedDecisions"),
              value: stats.total,
              description: i18nT("ui.ethikos.impact.tracker.decisionOutcomesBeingFollowed"),
            }}
          />

          <StatisticCard
            colSpan={{ xs: 24, sm: 12, xl: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.impact.tracker.activeFollowUp"),
              value: stats.active,
              description: i18nT("ui.ethikos.impact.tracker.plannedOrInProgress"),
            }}
          />

          <StatisticCard
            colSpan={{ xs: 24, sm: 12, xl: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.impact.tracker.blocked"),
              value: stats.blocked,
              description: i18nT("ui.ethikos.impact.tracker.needsActionOrClarification"),
            }}
          />

          <StatisticCard
            colSpan={{ xs: 24, sm: 12, xl: 6 }}
            statistic={{
              title: i18nT("ui.ethikos.impact.tracker.completionRate"),
              value: stats.completionRate,
              suffix: '%',
              description: (
                <Progress
                  percent={stats.completionRate}
                  size="small"
                  showInfo={false}
                />
              ),
            }}
          />
        </ProCard>

        <ProCard
          title={i18nT("ui.ethikos.impact.tracker.trackedCommitments")}
          extra={
            <Space wrap>
              <Tooltip title={i18nT("ui.ethikos.impact.tracker.activeFilterHint")}>
                <Segmented<StatusFilter>
                  value={statusFilter}
                  options={FILTER_OPTIONS(i18nT)}
                  onChange={(value) => setStatusFilter(value)}
                />
              </Tooltip>
            </Space>
          }
        >
          {filteredItems.length === 0 && !loading ? (
            <Empty description={i18nT("ui.ethikos.impact.tracker.noTrackedCommitmentsMatchTheCurrentFilter")} />
          ) : (
            <ProTable<TrackerRow>
              rowKey="id"
              columns={columns}
              dataSource={filteredItems}
              pagination={{ pageSize: 12 }}
              search={false}
              options={false}
              loading={loading}
              toolBarRender={() => [
                <Text key="hint" type="secondary">
                  {i18nT("ui.ethikos.impact.tracker.updateStatusWhenADecisionMovesFrom")}
                </Text>,
              ]}
            />
          )}
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}