'use client';

import React, { useMemo, useState } from 'react';
import { List, Button, Input, Select, Badge, Avatar, Space, Row, Col, Typography } from 'antd';
import { TeamOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;

// Collaborative space model
interface CollaborativeSpace {
  id: string;
  name: string;
  topic: string;
  membersCount: number;
  category: 'Studio' | 'Club' | 'Community';
  unreadCount: number;
}

// Demo data
const dummySpaces: CollaborativeSpace[] = [
  {
    id: '1',
    name: 'Creative Studio Alpha',
    topic: 'Graphic Design & Illustration',
    membersCount: 12,
    category: 'Studio',
    unreadCount: 3,
  },
  {
    id: '2',
    name: 'Music Club Beta',
    topic: 'Indie & Electronic Music',
    membersCount: 20,
    category: 'Club',
    unreadCount: 0,
  },
  {
    id: '3',
    name: 'Writers Community Gamma',
    topic: 'Creative Writing & Storytelling',
    membersCount: 15,
    category: 'Community',
    unreadCount: 5,
  },
];

export default function MySpacesPage(): JSX.Element {
  const router = useRouter();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredSpaces = useMemo(() => {
    let spaces = dummySpaces;
    if (selectedCategory !== 'All') {
      spaces = spaces.filter((s) => s.category === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      spaces = spaces.filter((s) => s.name.toLowerCase().includes(q) || s.topic.toLowerCase().includes(q));
    }
    return spaces;
  }, [selectedCategory, searchQuery]);

  const enterSpace = (id: string) => {
    router.push(`/kreative/collaborative-spaces/${id}`);

  return (
    <PageContainer title="My Spaces">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            <Input
              placeholder="Search spaces..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            <Select
              value={selectedCategory}
              onChange={setSelectedCategory}
              style={{ width: 200 }}
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Studio', label: 'Studio' },
                { value: 'Club', label: 'Club' },
                { value: 'Community', label: 'Community' },
              ]}
            />
          </Space>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/kreative/collaborative-spaces/create')}
          >
            Start a New Space
          </Button>
        </Col>
      </Row>

      <List
        itemLayout="horizontal"
        dataSource={filteredSpaces ?? []}
        renderItem={(space: CollaborativeSpace) => (
          <List.Item
            key={space.id}
            actions={[
              <Button key="enter" type="primary" onClick={() => enterSpace(space.id)}>
                Enter Space
              </Button>,
            ]}
          >
            <List.Item.Meta
              avatar={
                space.unreadCount > 0 ? (
                  <Badge count={space.unreadCount} offset={[-5, 5]}>
                    <Avatar size="large" icon={<TeamOutlined />} />
                  </Badge>
                ) : (
                  <Avatar size="large" icon={<TeamOutlined />} />
                )
              }
              title={<Title level={4} style={{ margin: 0 }}>{space.name}</Title>}
              description={
                <Space direction="vertical" size={0}>
                  <Text strong>Topic:</Text>
                  <Text>{space.topic}</Text>
                  <Text strong>Members:</Text>
                  <Text>{space.membersCount}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </PageContainer>
  );
}
}
