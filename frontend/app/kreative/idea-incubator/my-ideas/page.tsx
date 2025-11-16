// C:\MyCode\Konnaxionv14\frontend\app\kreative\idea-incubator\my-ideas\page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Badge, Button, Input, List, Select, Space, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;

type IdeaStatus = 'Seeking Collaboration' | 'In Progress';
type StatusFilter = 'All' | IdeaStatus;

interface Idea {
  id: string;
  title: string;
  status: IdeaStatus;
  dateCreated: string; // YYYY-MM-DD
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
];

export default function MyIdeasPage(): JSX.Element {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');

  const filteredIdeas = useMemo<Idea[]>(() => {
    let ideas = dummyIdeas;
    if (selectedStatus !== 'All') {
      ideas = ideas.filter((idea) => idea.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      ideas = ideas.filter((idea) => idea.title.toLowerCase().includes(q));
    }
    return ideas;
  }, [searchQuery, selectedStatus]);

  return (
    <PageContainer title="My Ideas">
      <Space direction="vertical" size="middle" style={{ width: '100%', marginBottom: 24 }}>
        <Space>
          <Input
            placeholder="Search by title."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select<StatusFilter>
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            style={{ width: 220 }}
            options={[
              { value: 'All', label: 'All Status' },
              { value: 'Seeking Collaboration', label: 'Seeking Collaboration' },
              { value: 'In Progress', label: 'In Progress' },
            ]}
          />
        </Space>
      </Space>

      <List<Idea>
        itemLayout="vertical"
        dataSource={filteredIdeas}
        renderItem={(idea) => (
          <List.Item
            key={idea.id}
            actions={[
              <Button
                key="edit"
                type="primary"
                onClick={() => router.push(`/kreative/idea-incubator/edit/${idea.id}`)}
              >
                Edit
              </Button>,
              <Button
                key="view"
                onClick={() => router.push(`/kreative/idea-incubator/view/${idea.id}`)}
              >
                View
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {idea.newActivity && (
                    <Badge count="New" style={{ backgroundColor: '#52c41a' }} />
                  )}
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
}
