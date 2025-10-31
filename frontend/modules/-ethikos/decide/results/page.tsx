import { PageContainer, ProTable } from '@ant-design/pro-components';
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

  const columns = [
    { title: 'Title', dataIndex: 'title', width: 260 },
    {
      title: 'Result',
      dataIndex: 'passed',
      width: 120,
      render: (v: boolean) => (
        <Tag color={v ? 'green' : 'red'}>{v ? 'PASSED' : 'REJECTED'}</Tag>
      ),
      filters: [
        { text: 'Passed', value: 'true' },
        { text: 'Rejected', value: 'false' },
      ],
      onFilter: (val: any, row: ResultRow) => String(row.passed) === val,
    },
    { title: 'Scope', dataIndex: 'scope', width: 120, filters: true },
    { title: 'Region', dataIndex: 'region', width: 140, filters: true },
    { title: 'Closed', dataIndex: 'closesAt', valueType: 'date' },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<ResultRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        pagination={{ pageSize: 10 }}
        search={false}
      />
    </PageContainer>
  );
}
