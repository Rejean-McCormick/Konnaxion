'use client';

import React from 'react';
import { Table, Avatar, Select, Typography, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TrophyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;

type TimeFrame = 'all-time' | 'this-month';

interface Creator {
  id: string;
  name: string;
  avatar: string;
  contributions: number;
  specialty: string;
}

const creatorsData: Creator[] = [
  { id: '1', name: 'Alice Johnson', avatar: 'https://via.placeholder.com/80.png?text=A', contributions: 125, specialty: 'Digital Art' },
  { id: '2', name: 'Bob Smith', avatar: 'https://via.placeholder.com/80.png?text=B', contributions: 110, specialty: 'Photography' },
  { id: '3', name: 'Carol Lee', avatar: 'https://via.placeholder.com/80.png?text=C', contributions: 105, specialty: 'Mixed Media' },
  { id: '4', name: 'David Kim', avatar: 'https://via.placeholder.com/80.png?text=D', contributions: 95, specialty: 'Painting' },
  { id: '5', name: 'Eva Martinez', avatar: 'https://via.placeholder.com/80.png?text=E', contributions: 88, specialty: 'Illustration' },
];

export default function TopCreatorsPage(): JSX.Element {
  const router = useRouter();
  const [timeFrame, setTimeFrame] = React.useState<TimeFrame>('all-time');

  const data = React.useMemo<Creator[]>(() => {
    return timeFrame === 'this-month' ? creatorsData.slice(0, 3) : creatorsData;
  }, [timeFrame]);

  const columns: ColumnsType<Creator> = [
    {
      title: 'Rank',
      key: 'rank',
      width: 80,
      render: (_value, _record, index) =>
        index < 3 ? <TrophyOutlined style={{ fontSize: 20, color: '#faad14' }} /> : <Text>{index + 1}</Text>,
    },
    {
      title: 'Creator',
      key: 'creator',
      width: 250,
      render: (_value, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <Button type="link" onClick={() => router.push(`/kreative/profile/${record.id}`)}>
            {record.name}
          </Button>
        </Space>
      ),
    },
    {
      title: 'Contributions',
      dataIndex: 'contributions',
      key: 'contributions',
      width: 150,
      render: (value: number) => <Text>{value}</Text>,
    },
    {
      title: 'Specialty',
      dataIndex: 'specialty',
      key: 'specialty',
    },
  ];

  return (
    <PageContainer title="Top Creators">
      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }}>
        <Title level={4}>Leaderboard</Title>
        <Space size="middle">
          <Text strong>Filter by Time Frame:</Text>
          <Select
            value={timeFrame}
            onChange={(v) => setTimeFrame(v as TimeFrame)}
            style={{ width: 180 }}
            options={[
              { value: 'all-time', label: 'All Time' },
              { value: 'this-month', label: 'This Month' },
            ]}
          />
        </Space>
      </Space>

      <Table<Creator>
        columns={columns}
        dataSource={data}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </PageContainer>
  );
}
