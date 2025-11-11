'use client';

import { PageContainer, ProTable, type ProColumns } from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchDecisionResults } from '@/services/decide';

type ResultRow = {
  id: string;
  title: string;
  scope: 'Elite' | 'Public';
  passed: boolean;
  closesAt: string;
  region: string;
};

export default function ResultsArchive() {
  usePageTitle('Decide · Results Archive');

  const { data, loading } = useRequest(fetchDecisionResults);

  // Note the second generic argument (`any`) so valueType isn't restricted to "text"
  const columns: ProColumns<ResultRow, any>[] = [
    { title: 'Title', dataIndex: 'title', width: 260 },
    {
      title: 'Result',
      dataIndex: 'passed',
      width: 120,
      // Avoid implicit-any by annotating both params
      render: (_: any, row: ResultRow) => (
        <Tag color={row.passed ? 'green' : 'red'}>{row.passed ? 'PASSED' : 'REJECTED'}</Tag>
      ),
      // Use boolean filter values to match the Table's onFilter type
      filters: [
        { text: 'Passed', value: true },
        { text: 'Rejected', value: false },
      ],
      // Keep the wider param type that AntD expects to avoid typing conflicts
      onFilter: (value: React.Key | boolean, row: ResultRow) => {
        const v = typeof value === 'boolean' ? value : String(value) === 'true';
        return row.passed === v;
      },
    },
    { title: 'Scope', dataIndex: 'scope', width: 120 },
    { title: 'Region', dataIndex: 'region', width: 140 },
    { title: 'Closed', dataIndex: 'closesAt', valueType: 'dateTime' },
  ];

  return (
    <PageContainer ghost loading={loading}>
      {/* Match ProTable's generics with the columns declaration */}
      <ProTable<ResultRow, any>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={{ pageSize: 10 }}
        search={false}
      />
    </PageContainer>
  );
}
