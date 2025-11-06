'use client'

import React from 'react';
import { NextPage } from 'next';
import {
  Card,
  List,
  Avatar,
  Row,
  Col,
  Typography,
  Progress,
  Button
} from 'antd';
import {
  ReadOutlined,
  CommentOutlined,
  BookOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
// Ajout de l'import de MainLayout pour appliquer le layout global
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;

// Exemple de données pour le widget Recent Updates
const recentUpdates = [
  {
    id: '1',
    title: 'New Lesson on React Hooks',
    description: 'Learn about the latest features in React 17.',
    timestamp: '2023-09-20 14:30',
  },
  {
    id: '2',
    title: 'Updated Knowledge Unit: TypeScript Basics',
    description: 'Refreshed content with new examples.',
    timestamp: '2023-09-19 09:15',
  },
  {
    id: '3',
    title: 'New Resource on Ant Design',
    description: 'Tips and tricks for building UIs faster.',
    timestamp: '2023-09-18 11:00',
  },
];

// Exemple de données pour le widget Active Discussions
const activeDiscussions = [
  {
    id: '1',
    title: 'Best practices for state management in Next.js',
    author: {
      name: 'Alice',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    },
    replies: 12,
  },
  {
    id: '2',
    title: 'How to optimize performance in React apps?',
    author: {
      name: 'Bob',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    },
    replies: 8,
  },
  {
    id: '3',
    title: 'Sharing my experience with TypeScript in production',
    author: {
      name: 'Carol',
      avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    },
    replies: 5,
  },
  {
    id: '4',
    title: 'Discussion: Design Systems vs Component Libraries',
    author: {
      name: 'Dave',
      avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    },
    replies: 3,
  },
  {
    id: '5',
    title: 'Future of AI in Education',
    author: {
      name: 'Eve',
      avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    },
    replies: 15,
  },
];

const KonnectedDashboard: NextPage = () => {
  return (
    <PageContainer title="KonnectED Dashboard">
      <Row gutter={[24, 24]}>
        {/* Widget Recent Updates */}
        <Col xs={24} md={12}>
          <Card title="Recent Updates">
            <List
              itemLayout="horizontal"
              dataSource={recentUpdates}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={
                      <>
                        <Text>{item.description}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {item.timestamp}
                        </Text>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Widget Active Discussions */}
        <Col xs={24} md={12}>
          <Card title="Active Discussions">
            <List
              itemLayout="horizontal"
              dataSource={activeDiscussions}
              renderItem={(discussion) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={discussion.author.avatar} />}
                    title={discussion.title}
                    description={`By ${discussion.author.name} • ${discussion.replies} Replies`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Widget Learning Progress */}
        <Col xs={24} md={12}>
          <Card title="Learning Progress">
            <div style={{ marginBottom: 16 }}>
              <Text>Your current learning path is 60% complete</Text>
            </div>
            <Progress percent={60} status="active" />
          </Card>
        </Col>

        {/* Quick Access Icons */}
        <Col xs={24} md={12}>
          <Card title="Quick Access">
            <Row gutter={[16, 16]} justify="center">
              <Col style={{ textAlign: 'center' }}>
                <Button shape="circle" icon={<ReadOutlined />} size="large" />
                <div style={{ marginTop: 8 }}>Knowledge</div>
              </Col>
              <Col style={{ textAlign: 'center' }}>
                <Button shape="circle" icon={<CommentOutlined />} size="large" />
                <div style={{ marginTop: 8 }}>Community</div>
              </Col>
              <Col style={{ textAlign: 'center' }}>
                <Button shape="circle" icon={<BookOutlined />} size="large" />
                <div style={{ marginTop: 8 }}>Learning</div>
              </Col>
              <Col style={{ textAlign: 'center' }}>
                <Button shape="circle" icon={<DownloadOutlined />} size="large" />
                <div style={{ marginTop: 8 }}>Offline</div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );

// Correction : envelopper la page dans MainLayout via getLayout

  return <MainLayout>{page}</MainLayout>;

export default KonnectedDashboard;
