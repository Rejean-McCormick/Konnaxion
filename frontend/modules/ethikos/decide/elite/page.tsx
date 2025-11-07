'use client'

import { PageContainer, ProTable, StatisticCard } from '@ant-design/pro-components';
import { Progress, Statistic } from 'antd';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchEliteBallots } from '@/services/decide';
import type { Ballot } from '@/types';

export default function EliteBallots() {
  usePageTitle('Decide · Elite Ballots');

  const { data, loading } = useRequest(fetchEliteBallots);

  const columns = [
    { title: 'Title', dataIndex: 'title', width: 260 },
    {
      title: 'Closes In',
      dataIndex: 'closesAt',
      width: 180,
render: (v, row) => (
  <Statistic.Countdown value={dayjs(v).valueOf()} format="D[d] HH:mm:ss" />
),
    },
    {
      title: 'Turnout',
      dataIndex: 'turnout',
      width: 160,
      render: (v, row) => <Progress type="circle" percent={v} />,
    },
    { title: 'Scope', dataIndex: 'scope', width: 100 },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<Ballot & { turnout: number }>
        rowKey="id"
        columns={columns}
        dataSource={data?.ballots}
        pagination={{ pageSize: 8 }}
        search={false}
      />
    </PageContainer>
  );
}
