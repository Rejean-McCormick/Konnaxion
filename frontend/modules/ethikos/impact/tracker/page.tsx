// FILE: frontend/modules/ethikos/impact/tracker/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Select } from 'antd';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import React from 'react';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchImpactTracker, patchImpactStatus } from '@/services/impact';

dayjs.extend(relativeTime);

type TrackerRow = {
  id: string;
  title: string;
  owner: string;
  status: 'Planned' | 'In-Progress' | 'Completed' | 'Blocked';
  updatedAt: string;
};

type TrackerResponse = {
  items: TrackerRow[];
};

export default function ImpactTracker() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.impact.tracker.impactTracker_9590e1"));

  // ahooks: useRequest<TData, TParams>
  const { data, loading, mutate } = useRequest<TrackerResponse, []>(fetchImpactTracker);

  const onStatusChange = async (id: string, status: TrackerRow['status']) => {
    await patchImpactStatus(id, status);
    if (data) {
      mutate({
        ...data,
        items: data.items.map((r) => (r.id === id ? { ...r, status } : r)),
      });
    }
  };

  const statusOptions: { value: TrackerRow['status']; label: string }[] = [
    { value: 'Planned', label: i18nT("ui.ethikos.impact.tracker.planned") },
    { value: 'In-Progress', label: i18nT("ui.ethikos.impact.tracker.inProgress_eb5332") },
    { value: 'Completed', label: i18nT("ui.ethikos.impact.tracker.completed") },
    { value: 'Blocked', label: i18nT("ui.ethikos.impact.tracker.blocked") },
  ];

  const columns: ProColumns<TrackerRow>[] = [
    { title: i18nT("ui.ethikos.impact.tracker.title"), dataIndex: 'title', width: 260 },
    { title: i18nT("ui.ethikos.impact.tracker.owner"), dataIndex: 'owner', width: 160 },
    {
      title: i18nT("ui.ethikos.impact.tracker.status"),
      dataIndex: 'status',
      width: 180,
      render: (_, row) => (
        <Select<TrackerRow['status']>
          value={row.status}
          options={statusOptions}
          onChange={(val) => onStatusChange(row.id, val)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: i18nT("ui.ethikos.impact.tracker.updated"),
      dataIndex: 'updatedAt',
      sorter: (a, b) => dayjs(a.updatedAt).valueOf() - dayjs(b.updatedAt).valueOf(),
      render: (_, row) => dayjs(row.updatedAt).fromNow(),
      width: 160,
    },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<TrackerRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        pagination={{ pageSize: 12 }}
        search={false}
      />
    </PageContainer>
  );
}
