import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Tag, Popconfirm, Button } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchModerationQueue, actOnReport } from '@/services/admin';

type Report = {
  id: string;
  content: string;
  reporter: string;
  type: 'Spam' | 'Harassment' | 'Misinformation';
  status: 'Pending' | 'Resolved';
};

export default function Moderation() {
  usePageTitle('Admin · Moderation');

  const { data, loading, mutate } = useRequest(fetchModerationQueue);

  const action = async (id: string, approve: boolean) => {
    await actOnReport(id, approve);
    mutate();
  };

  const columns = [
    { title: 'Content', dataIndex: 'content', ellipsis: true },
    { title: 'Reporter', dataIndex: 'reporter', width: 120 },
    {
      title: 'Type',
      dataIndex: 'type',
      width: 140,
      render: (v: Report['type']) => <Tag color="orange">{v}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (v: Report['status']) => (
        <Tag color={v === 'Pending' ? 'gold' : 'green'}>{v}</Tag>
      ),
    },
    {
      title: 'Actions',
      width: 160,
      render: (_: any, row: Report) =>
        row.status === 'Pending' && (
          <>
            <Popconfirm title="Remove content?" onConfirm={() => action(row.id, true)}>
              <Button size="small" danger>
                Remove
              </Button>
            </Popconfirm>
            <Popconfirm title="Dismiss report?" onConfirm={() => action(row.id, false)}>
              <Button size="small" style={{ marginLeft: 8 }}>
                Dismiss
              </Button>
            </Popconfirm>
          </>
        ),
    },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<Report>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        pagination={{ pageSize: 10 }}
        search={false}
      />
    </PageContainer>
  );
}
