'use client';

import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { Select } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchImpactTracker, patchImpactStatus } from '@/services/impact';

type TrackerRow = {
  id: string;
  title: string;
  owner: string;
  status: 'Planned' | 'In-Progress' | 'Completed' | 'Blocked';
  updatedAt: string;
};

export default function ImpactTracker() {
  usePageTitle('Impact · Tracker');

  const { data, loading, mutate } = useRequest(fetchImpactTracker);

  const onStatusChange = async (id: string, status: TrackerRow['status']) => {
    await patchImpactStatus(id, status);
    mutate((d) => ({
      items: d!.items.map((r) => (r.id === id ? { ...r, status } : r)),
    }));
  };

  const columns: ProColumns<TrackerRow>[] = [
    { title: 'Title', dataIndex: 'title', width: 260 },
    { title: 'Owner', dataIndex: 'owner', width: 160 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 180,
      render: (_, row) => (
        <Select
          value={row.status}
          options={[
            { value: 'Planned', label: 'Planned' },
            { value: 'In-Progress', label: 'In-Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Blocked', label: 'Blocked' },
          ]}
          onChange={(val) => onStatusChange(row.id, val as TrackerRow['status'])}
          style={{ width: '100%' }}
        />
      ),
    },
    { title: 'Updated', dataIndex: 'updatedAt', valueType: 'dateTime', sorter: true },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<TrackerRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={{ pageSize: 12 }}
        search={false}
      />
    </PageContainer>
  );
}
