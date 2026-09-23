// FILE: frontend/modules/ethikos/admin/roles/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { Switch, Tag } from 'antd'
import type { ReactNode } from 'react'

import usePageTitle from '@/hooks/usePageTitle'
import { fetchRoles, type RolePayload, type RoleRow, toggleRole } from '@/services/admin'

export default function RoleManagement() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.admin.roles.adminRoleManagement"))

  // Fix TS2558: ahooks v3 expects 2 generics: <Data, ParamsTuple>
  // No params → params tuple is []
  const { data, loading, refresh } = useRequest<RolePayload, []>(fetchRoles)

  const columns: ProColumns<RoleRow>[] = [
    { title: i18nT("ui.ethikos.admin.roles.role"), dataIndex: 'name', width: 200 },
    {
      title: i18nT("ui.ethikos.admin.roles.users"),
      dataIndex: 'userCount',
      width: 100,
      render: (dom: ReactNode) => <Tag>{dom}</Tag>,
    },
    {
      title: i18nT("ui.ethikos.admin.roles.enabled"),
      dataIndex: 'enabled',
      width: 120,
      render: (_: ReactNode, row: RoleRow) => (
        <Switch
          checked={row.enabled}
          onChange={async (checked: boolean) => {
            await toggleRole(row.id, checked)
            refresh() // typed as () => void by ahooks
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
