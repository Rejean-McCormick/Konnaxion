// C:\MyCode\Konnaxionv14\frontend\app\ethikos\decide\elite\page.tsx
'use client'

import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import type { ReactNode } from 'react'
import { Progress, Statistic } from 'antd'
import { useRequest } from 'ahooks'
import dayjs from 'dayjs'
import usePageTitle from '@/hooks/usePageTitle'
import { fetchEliteBallots } from '@/services/decide'
import type { Ballot } from '@/types'

type Row = Ballot & { turnout: number }

export default function EliteBallots() {
  usePageTitle('Decide · Elite Ballots')

  // ahooks v3 expects two generics: <TData, TParams>. No params → [].
  const { data, loading } = useRequest<{ ballots: Row[] }, []>(fetchEliteBallots)

  const columns: ProColumns<Row>[] = [
    { title: 'Title', dataIndex: 'title', width: 260 },
    {
      title: 'Closes In',
      dataIndex: 'closesAt',
      width: 180,
      render: (_dom: ReactNode, row: Row) => (
        <Statistic.Countdown value={dayjs(row.closesAt).valueOf()} format="D[d] HH:mm:ss" />
      ),
    },
    {
      title: 'Turnout',
      dataIndex: 'turnout',
      width: 160,
      render: (_dom: ReactNode, row: Row) => <Progress type="circle" percent={row.turnout} />,
    },
    { title: 'Scope', dataIndex: 'scope', width: 100 },
  ]

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<Row>
        rowKey="id"
        columns={columns}
        dataSource={data?.ballots ?? []}
        pagination={{ pageSize: 8 }}
        search={false}
      />
    </PageContainer>
  )
}
