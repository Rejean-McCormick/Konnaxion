'use client'

import type { ReactNode } from 'react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Switch, Tag } from 'antd'
import { useRequest } from 'ahooks'
import usePageTitle from '@/hooks/usePageTitle'
import { fetchRoles, toggleRole } from '@/services/admin'

type RoleRow = { id: string; name: string; userCount: number; enabled: boolean }
type RolePayload = { items: RoleRow[] }

export default function RoleManagement() {
  usePageTitle('Admin · Role Management') // sets <title> on the client :contentReference[oaicite:3]{index=3}

  // useRequest: data shape is { items: RoleRow[] }; no params → params tuple is []
  const { data, loading, refresh } = useRequest<RolePayload, []>(fetchRoles) // :contentReference[oaicite:4]{index=4}

  const columns: ProColumns<RoleRow>[] = [
    { title: 'Role', dataIndex: 'name', width: 200 },
    {
      title: 'Users',
      dataIndex: 'userCount',
      width: 100,
      render: (dom: ReactNode) => <Tag>{dom}</Tag>, // avoid implicit any
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      width: 120,
      render: (_: ReactNode, row: RoleRow) => (
        <Switch
          checked={row.enabled}
          onChange={async (checked) => {
            await toggleRole(row.id, checked) // PATCH /admin/roles/:id { enabled } :contentReference[oaicite:5]{index=5}
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
