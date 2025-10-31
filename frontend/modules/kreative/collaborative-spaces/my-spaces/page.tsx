'use client';
"use client";

// File: /pages/kreative/collaborative-spaces/my-spaces.tsx
import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { List, Button, Input, Select, Badge, Avatar, Space, Row, Col, Typography } from 'antd';
import { TeamOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;
const { Option } = Select;

// Define an interface for a collaborative space.
interface CollaborativeSpace {
  id: string;
  name: string;
  topic: string;
  membersCount: number;
  category: 'Studio' | 'Club' | 'Community';
  unreadCount: number; // Number of unread messages or new activity.
}

// Dummy data for collaborative spaces.
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
  // Additional spaces can be added here.
];

const MySpacesPage: NextPage = () => {
  // State for category filtering.
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  // State for search query.
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter spaces based on selected category and search input.
  const filteredSpaces = useMemo(() => {
    let spaces = dummySpaces;
    if (selectedCategory !== 'All') {
      spaces = spaces.filter((space) => space.category === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      spaces = spaces.filter((space) =>
        space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        space.topic.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return spaces;
  }, [selectedCategory, searchQuery]);

  // Function to handle entering a space.
  const enterSpace = (id: string) => {
    const router = useRouter();
    router.push(`/kreative/collaborative-spaces/${id}`);
  };

  return (
    <PageContainer title="My Spaces">
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Space>
            {/* Search Input */}
            <Input
              placeholder="Search spaces..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
            />
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onChange={(value) => setSelectedCategory(value)}
              style={{ width: 180 }}
            >
              <Option value="All">All Categories</Option>
              <Option value="Studio">Studio</Option>
              <Option value="Club">Club</Option>
              <Option value="Community">Community</Option>
            </Select>
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
      {/* Collaborative Spaces List */}
      <List
        itemLayout="horizontal"
        dataSource={filteredSpaces}
        renderItem={(space: CollaborativeSpace) => (
          <List.Item key={space.id} actions={[
            <Button type="primary" onClick={() => enterSpace(space.id)}>
              Enter Space
            </Button>,
          ]}>
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
                <Space direction="vertical">
                  <Text strong>Topic:</Text> <Text>{space.topic}</Text>
                  <Text strong>Members:</Text> <Text>{space.membersCount}</Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </PageContainer>
  );
};

MySpacesPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default MySpacesPage;
