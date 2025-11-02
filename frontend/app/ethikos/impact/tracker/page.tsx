'use client'

import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Select } from 'antd';
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
    mutate(d => ({
      items: d!.items.map(r => (r.id === id ? { ...r, status } : r)),
    }));
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', width: 260 },
    { title: 'Owner', dataIndex: 'owner', width: 160 },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 160,
      render: (v: TrackerRow['status'], row: TrackerRow) => (
        <Select
          value={v}
          options={[
            { value: 'Planned', label: 'Planned' },
            { value: 'In-Progress', label: 'In-Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Blocked', label: 'Blocked' },
          ]}
          onChange={val => onStatusChange(row.id, val)}
        />
      ),
    },
    { title: 'Updated', dataIndex: 'updatedAt', valueType: 'fromNow', sorter: true },
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
