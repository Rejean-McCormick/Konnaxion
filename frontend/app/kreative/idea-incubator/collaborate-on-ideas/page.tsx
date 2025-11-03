'use client';

// File: /pages/kreative/idea-incubator/my-ideas.tsx
import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { List, Button, Badge, Input, Select, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;
const { Option } = Select;

interface Idea {
  id: string;
  title: string;
  status: 'Seeking Collaboration' | 'In Progress';
  dateCreated: string; // e.g., YYYY-MM-DD
  newActivity: boolean;
}

const dummyIdeas: Idea[] = [
  {
    id: '1',
    title: 'Revolutionary App Concept',
    status: 'Seeking Collaboration',
    dateCreated: '2025-11-20',
    newActivity: true,
  },
  {
    id: '2',
    title: 'Sustainable Energy Initiative',
    status: 'In Progress',
    dateCreated: '2025-10-15',
    newActivity: false,
  },
  {
    id: '3',
    title: 'Urban Gardening Project',
    status: 'Seeking Collaboration',
    dateCreated: '2025-11-01',
    newActivity: true,
  },
  // Add more idea objects as needed...
];

const MyIdeasPage: NextPage = () => {
  // State for search query and status filter.
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Filter ideas based on search text and selected status.
  const filteredIdeas = useMemo(() => {
    let ideas = dummyIdeas;
    if (selectedStatus !== 'All') {
      ideas = ideas.filter((idea) => idea.status === selectedStatus);
    }
    if (searchQuery.trim() !== '') {
      ideas = ideas.filter((idea) =>
        idea.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return ideas;
  }, [searchQuery, selectedStatus]);

  return (
    <PageContainer title="My Ideas">
      {/* Filter Section */}
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <Space>
          <Input
            placeholder="Search by title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
          />
          <Select
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            style={{ width: 200 }}
          >
            <Option value="All">All Status</Option>
            <Option value="Seeking Collaboration">Seeking Collaboration</Option>
            <Option value="In Progress">In Progress</Option>
          </Select>
        </Space>
      </Space>
      {/* Ideas List */}
      <List
        itemLayout="vertical"
        dataSource={filteredIdeas}
        renderItem={(idea) => (
          <List.Item
            key={idea.id}
            actions={[
              <Button
                type="primary"
                onClick={() => router.push(`/kreative/idea-incubator/edit/${idea.id}`)}
              >
                Edit
              </Button>,
              <Button onClick={() => router.push(`/kreative/idea-incubator/view/${idea.id}`)}>
                View
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {idea.newActivity && <Badge count="New" style={{ backgroundColor: '#52c41a' }} />}
                  <Title level={4} style={{ margin: 0 }}>
                    {idea.title}
                  </Title>
                </Space>
              }
              description={
                <>
                  <Text type="secondary">Status: {idea.status}</Text>
                  <br />
                  <Text type="secondary">Created on: {idea.dateCreated}</Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </PageContainer>
  );
};

MyIdeasPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default MyIdeasPage;
