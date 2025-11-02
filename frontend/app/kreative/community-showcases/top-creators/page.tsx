'use client';


import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Table, Avatar, Select, Typography, Space, Button } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';


const { Title, Text } = Typography;
const { Option } = Select;

// Define the interface for a creator.
interface Creator {
  id: string;
  name: string;
  avatar: string;
  contributions: number;
  specialty: string;
  // Optionally, include a field to determine ranking within a time frame if needed.
  // For our dummy data, we will assume this value is already computed.
}

// Dummy data for creators.
const dummyCreators: Creator[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    avatar: 'https://via.placeholder.com/80.png?text=A',
    contributions: 125,
    specialty: 'Digital Art',
  },
  {
    id: '2',
    name: 'Bob Smith',
    avatar: 'https://via.placeholder.com/80.png?text=B',
    contributions: 110,
    specialty: 'Photography',
  },
  {
    id: '3',
    name: 'Carol Lee',
    avatar: 'https://via.placeholder.com/80.png?text=C',
    contributions: 105,
    specialty: 'Mixed Media',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'https://via.placeholder.com/80.png?text=D',
    contributions: 95,
    specialty: 'Painting',
  },
  {
    id: '5',
    name: 'Eva Martinez',
    avatar: 'https://via.placeholder.com/80.png?text=E',
    contributions: 88,
    specialty: 'Illustration',
  },
  // Add additional dummy entries as needed.
];

const TopCreators: NextPage = () => {
  // State for filtering by time frame.
  const [timeFrame, setTimeFrame] = useState<'all-time' | 'this-month'>('all-time');

  // For demonstration, we'll assume that "this-month" filtering returns a subset.
  // In production, this logic would use real data.
  const filteredCreators = useMemo(() => {
    if (timeFrame === 'this-month') {
      // Return a subset of creators (for demo, we'll take the first three)
      return dummyCreators.slice(0, 3);
    }
    return dummyCreators;
  }, [timeFrame]);

  // Define table columns.
  const columns = [
    {
      title: 'Rank',
      key: 'rank',
      render: (_: any, _record: Creator, index: number) => {
        // For top 3, display a trophy icon; otherwise, show the numeric rank.
        if (index < 3) {
          return <TrophyOutlined style={{ fontSize: 20, color: '#faad14' }} />;
        }
        return <Text>{index + 1}</Text>;
      },
      width: 80,
    },
    {
      title: 'Creator',
      key: 'creator',
      render: (text: any, record: Creator) => (
        <Space>
          <Avatar src={record.avatar} />
          <Button type="link" onClick={() => router.push(`/kreative/profile/${record.id}`)}>
            {record.name}
          </Button>
        </Space>
      ),
      width: 250,
    },
    {
      title: 'Contributions',
      dataIndex: 'contributions',
      key: 'contributions',
      render: (value: number) => <Text>{value}</Text>,
      width: 150,
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
            onChange={(value: 'all-time' | 'this-month') => setTimeFrame(value)}
            style={{ width: 180 }}
          >
            <Option value="all-time">All Time</Option>
            <Option value="this-month">This Month</Option>
          </Select>
        </Space>
      </Space>
      <Table
        columns={columns}
        dataSource={filteredCreators}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </PageContainer>
  );
};

TopCreators.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default TopCreators;
