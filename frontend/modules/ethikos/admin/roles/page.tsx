'use client'

import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Switch, Tag } from 'antd'
import { useRequest } from 'ahooks'
import usePageTitle from '@/hooks/usePageTitle'
import { fetchRoles, toggleRole, type RoleRow, type RolePayload } from '@/services/admin'

export default function RoleManagement() {
  usePageTitle('Admin · Role Management')

  const { data, loading, refresh } = useRequest<RolePayload>(() => fetchRoles())

  const columns: ProColumns<RoleRow>[] = [
    { title: 'Role', dataIndex: 'name', width: 200 },
    {
      title: 'Users',
      dataIndex: 'userCount',
      width: 100,
      render: (dom) => <Tag>{dom}</Tag>,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      width: 120,
      render: (_, row) => (
        <Switch
          checked={row.enabled}
          onChange={async (checked) => {
            await toggleRole(row.id, checked)
            refresh()
          }}
        />
      ),
    },
  ]

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<RoleRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={false}
        search={false}
      />
    </PageContainer>
  )
}
