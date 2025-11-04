'use client'

import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components'
import { Tag } from 'antd'
import { useRequest } from 'ahooks'
import usePageTitle from '@/hooks/usePageTitle'
import { fetchAuditLogs } from '@/services/admin'

type LogRow = {
  id: string
  actor: string
  action: string
  target: string
  severity: 'info' | 'warn' | 'critical'
  ts: string
}

type AuditPayload = { items: LogRow[] }

export default function AuditLogs() {
  usePageTitle('Admin · Audit Logs')

  // On force la donnée au payload JSON (pas l'AxiosResponse)
  const { data, loading } = useRequest<AuditPayload>(async () => {
    const res = await fetchAuditLogs()
    return (res as any).data ?? (res as AuditPayload)
  })

  const columns: ProColumns<LogRow>[] = [
    { title: 'Time', dataIndex: 'ts', valueType: 'dateTime', width: 180, sorter: true },
    { title: 'Actor', dataIndex: 'actor', width: 120 },
    { title: 'Action', dataIndex: 'action', width: 200 },
    { title: 'Target', dataIndex: 'target', ellipsis: true },
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 120,
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Warn', value: 'warn' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (val, row) => row.severity === val,
      render: (_, row) => (
        <Tag color={row.severity === 'critical' ? 'red' : row.severity === 'warn' ? 'orange' : 'blue'}>
          {row.severity}
        </Tag>
      ),
    },
  ]

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<LogRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        pagination={{ pageSize: 15 }}
        search={false}
      />
    </PageContainer>
  )
}
