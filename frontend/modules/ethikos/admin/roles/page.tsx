'use client'

import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Switch, Tag } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchRoles, toggleRole } from '@/services/admin';

type RoleRow = { id: string; name: string; userCount: number; enabled: boolean };

export default function RoleManagement() {
  usePageTitle('Admin · Role Management');

  const { data, loading, mutate } = useRequest(fetchRoles);

  const columns = [
    { title: 'Role', dataIndex: 'name', width: 200 },
    {
      title: 'Users',
      dataIndex: 'userCount',
      width: 100,
      render: (v: number) => <Tag>{v}</Tag>,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      width: 120,
      render: (v: boolean, row: RoleRow) => (
        <Switch
          checked={v}
          onChange={async () => {
            await toggleRole(row.id, !v);
            mutate();
          }}
        />
      ),
    },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<RoleRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        pagination={false}
        search={false}
      />
    </PageContainer>
  );
}
