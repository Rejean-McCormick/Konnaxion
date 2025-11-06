'use client'

import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Tag, Popconfirm, Button } from 'antd'
import { useRequest } from 'ahooks'
import usePageTitle from '@/hooks/usePageTitle'
import { fetchModerationQueue, actOnReport } from '@/services/admin'

type Report = {
  id: string
  content: string
  reporter: string
  type: 'Spam' | 'Harassment' | 'Misinformation'
  status: 'Pending' | 'Resolved'
}

type ModerationPayload = { items: Report[] }

export default function Moderation() {
  usePageTitle('Admin · Moderation')

  const { data, loading, mutate } = useRequest<ModerationPayload, []>(
    async () => await fetchModerationQueue()
  )

  const handleModeration = async (id: string, approve: boolean) => {
    await actOnReport(id, approve)
    await mutate()
  }

  const columns: ProColumns<Report>[] = [
    { title: 'Content', dataIndex: 'content', ellipsis: true },
    { title: 'Reporter', dataIndex: 'reporter', width: 120 },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 140,
      render: (_, row) => <Tag color="orange">{row.type}</Tag>,
      filters: [
        { text: 'Spam', value: 'Spam' },
        { text: 'Harassment', value: 'Harassment' },
        { text: 'Misinformation', value: 'Misinformation' },
      ],
      onFilter: (val, row) => row.type === (val as Report['type']),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (_, row) => (
        <Tag color={row.status === 'Pending' ? 'gold' : 'green'}>{row.status}</Tag>
      ),
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Resolved', value: 'Resolved' },
      ],
      onFilter: (val, row) => row.status === (val as Report['status']),
    },
    {
      title: 'Actions',
      width: 180,
      render: (_, row) =>
        row.status === 'Pending' ? (
          <>
            <Popconfirm title="Remove content?" onConfirm={() => handleModeration(row.id, true)}>
              <Button size="small" danger>Remove</Button>
            </Popconfirm>
            <Popconfirm title="Dismiss report?" onConfirm={() => handleModeration(row.id, false)}>
              <Button size="small" style={{ marginLeft: 8 }}>Dismiss</Button>
            </Popconfirm>
          </>
        ) : null,
    },
  ]

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<Report>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={{ pageSize: 10 }}
        search={false}
      />
    </PageContainer>
  )
}
