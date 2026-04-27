// FILE: frontend/app/ethikos/impact/tracker/page.tsx
'use client';

import { useMemo, useState } from 'react';
import {
  PageContainer,
  ProTable,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Empty,
  Segmented,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchImpactTracker,
  patchImpactStatus,
  type ImpactStatus,
  type TrackerItem,
} from '@/services/impact';

dayjs.extend(relativeTime);

const { Text } = Typography;

type TrackerPayload = { items: TrackerItem[] };
type StatusFilter = 'all' | 'active' | ImpactStatus;

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

const FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: 'Active', value: 'active' },
  { label: 'All', value: 'all' },
  { label: 'Planned', value: 'Planned' },
  { label: 'In progress', value: 'In-Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Blocked', value: 'Blocked' },
];

export default function ImpactTracker(): JSX.Element {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const { data, loading, mutate, refresh } = useRequest<TrackerPayload, []>(
    fetchImpactTracker,
  );

  const items = data?.items ?? [];

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

    return {
      total,
      planned,
      inProgress,
      completed,
      blocked,
      active,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') {
      return items;
    }

    if (statusFilter === 'active') {
      return items.filter(
        (item) =>
          item.status === 'Planned' || item.status === 'In-Progress',
      );
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
        return;
      }

      refresh();
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: ProColumns<TrackerItem>[] = [
    {
      title: 'Topic',
      dataIndex: 'title',
      width: 260,
      ellipsis: true,
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      width: 180,
      ellipsis: true,
      render: (_dom, row) =>
        row.owner ? row.owner : <Text type="secondary">Unknown</Text>,
    },
    {
      title: 'Status',
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
      title: 'Last activity',
      dataIndex: 'updatedAt',
      width: 200,
      sorter: (a, b) =>
        dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      render: (_dom, row) =>
        row.updatedAt ? (
          <Text>{dayjs(row.updatedAt).fromNow()}</Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
  ];

  return (
    <EthikosPageShell
      title="Impact tracker"
      sectionLabel="Impact"
      metaTitle="Impact · Tracker"
      subtitle="Track the implementation status and follow-up of Ethikos debates and decisions."
    >
      <PageContainer ghost loading={loading}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%', marginBottom: 16 }}
        >
          <Alert
            type="info"
            showIcon
            message="Impact tracker"
            description={
              <Text type="secondary">
                Each row represents an Ethikos decision topic. Use the status to
                indicate whether a debate is still planned, currently in
                progress, completed, or blocked awaiting follow-up.
              </Text>
            }
          />

          <Space
            align="center"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Space size="large" wrap>
              <Statistic title="Tracked topics" value={stats.total} />
              <Statistic
                title="Active (planned + in progress)"
                value={stats.active}
              />
              <Statistic title="Completed" value={stats.completed} />
              <Statistic title="Blocked" value={stats.blocked} />
            </Space>

            <Space wrap>
              <Segmented<StatusFilter>
                value={statusFilter}
                options={FILTER_OPTIONS}
                onChange={(value) => setStatusFilter(value)}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
                type="default"
                loading={loading}
                disabled={updatingId !== null}
              >
                Refresh
              </Button>
            </Space>
          </Space>
        </Space>

        {filteredItems.length === 0 && !loading ? (
          <Empty description="No Ethikos topics found yet. Create a debate or consultation to start tracking impact." />
        ) : (
          <ProTable<TrackerItem>
            rowKey="id"
            columns={columns}
            dataSource={filteredItems}
            pagination={{ pageSize: 12 }}
            search={false}
            options={false}
            loading={loading}
            toolBarRender={() => [
              <Text key="hint" type="secondary">
                Adjust the status when a debate moves from planning to active
                work or when a decision is finalised.
              </Text>,
            ]}
          />
        )}
      </PageContainer>
    </EthikosPageShell>
  );
}




