// FILE: frontend/app/kreative/collaborative-spaces/my-spaces/page.tsx
// C:\MyCode\Konnaxionv14\frontend\app\kreative\collaborative-spaces\my-spaces\page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  List,
  Button,
  Input,
  Select,
  Badge,
  Avatar,
  Space,
  Row,
  Col,
  Typography,
  Empty,
} from 'antd';
import { TeamOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import KreativePageShell from '@/app/kreative/kreativePageShell';

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

  const filteredSpaces = useMemo<CollaborativeSpace[]>(() => {
    let spaces = dummySpaces;

    if (selectedCategory !== 'All') {
      spaces = spaces.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      spaces = spaces.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.topic.toLowerCase().includes(q),
      );
    }

    return spaces;
  }, [selectedCategory, searchQuery]);

  const enterSpace = (id: string) => {
    router.push(`/kreative/collaborative-spaces/${id}`);
  };

  const hasSpaces = filteredSpaces.length > 0;

  return (
    <KreativePageShell
      title="My Spaces"
      subtitle="Spaces you’ve joined or created across the Kreative collaborative hub."
      primaryAction={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() =>
            router.push('/kreative/collaborative-spaces/start-new-space')
          }
        >
          Start a New Space
        </Button>
      }
    >
      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 24 }}
      >
        <Col>
          <Space wrap>
            <Input
              placeholder="Search spaces..."
              prefix={<SearchOutlined />}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
            <Select
              value={selectedCategory}
              onChange={(value: string) => setSelectedCategory(value)}
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
      </Row>

      {hasSpaces ? (
        <List<CollaborativeSpace>
          itemLayout="horizontal"
          dataSource={filteredSpaces}
          renderItem={(space) => (
            <List.Item
              key={space.id}
              actions={[
                <Button
                  key="enter"
                  type="primary"
                  onClick={() => enterSpace(space.id)}
                >
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
                title={
                  <Title level={4} style={{ margin: 0 }}>
                    {space.name}
                  </Title>
                }
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
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="You’re not part of any spaces yet. Start a new one or explore available spaces."
        />
      )}
    </KreativePageShell>
  );
}
