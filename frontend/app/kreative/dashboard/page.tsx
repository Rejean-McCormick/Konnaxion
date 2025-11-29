// FILE: frontend/app/kreative/dashboard/page.tsx
// app/kreative/dashboard/page.tsx
'use client';

import React from 'react';
import {
  Card,
  Avatar,
  Button,
  Carousel,
  List,
  Row,
  Col,
  Typography,
  Space,
} from 'antd';
import {
  PictureOutlined,
  BulbOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import KreativePageShell from '@/app/kreative/kreativePageShell';

const { Title, Text } = Typography;

// Resolve backend base and derive a separate media base.
// This makes NEXT_PUBLIC_API_BASE=http://localhost:8000/api work
// while media stays served from http://localhost:8000/media/…
const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000';
const API_BASE = RAW_API_BASE.replace(/\/+$/, ''); // trim trailing slashes

// If API is at ".../api", media is at the host root.
// Otherwise, media is served from the same base.
const MEDIA_BASE = API_BASE.endsWith('/api')
  ? API_BASE.slice(0, -4) // drop trailing "/api"
  : API_BASE;

type QuickLink = {
  title: string;
  icon: React.ReactNode;
  href: string;
};

/** Featured Project */
const featuredProject = {
  title: 'Dreamscape: A Visual Journey',
  imageUrl: `${MEDIA_BASE}/media/kreative/artworks/artwork_0.png`,
};

/** Inspiration Gallery (carousel) */
const inspirationGallery = [
  {
    id: '1',
    imageUrl: `${MEDIA_BASE}/media/kreative/artworks/artwork_0.png`,
  },
  {
    id: '2',
    imageUrl: `${MEDIA_BASE}/media/kreative/artworks/artwork_1.png`,
  },
  {
    id: '3',
    imageUrl: `${MEDIA_BASE}/media/kreative/artworks/artwork_2.png`,
  },
  {
    id: '4',
    imageUrl: `${MEDIA_BASE}/media/kreative/artworks/default_profile.png`,
  },
];

/** Top Creator */
const topCreator = {
  name: 'Sophia Rivera',
  avatar: `${MEDIA_BASE}/media/kreative/artworks/default_profile.png`,
  stats: '48 Projects · 1200 Likes',
};

/** Quick Links (wired to existing Kreative routes) */
const quickLinks: QuickLink[] = [
  {
    title: 'Explore Ideas',
    icon: <BulbOutlined style={{ fontSize: 24 }} />,
    href: '/kreative/creative-hub/explore-ideas',
  },
  {
    title: 'Submit Work',
    icon: <UploadOutlined style={{ fontSize: 24 }} />,
    href: '/kreative/creative-hub/submit-creative-work',
  },
  {
    title: 'View Gallery',
    icon: <PictureOutlined style={{ fontSize: 24 }} />,
    href: '/kreative/creative-hub/inspiration-gallery',
  },
];

/** Recent Activity */
const recentActivities = [
  {
    id: 'a1',
    text: 'User John submitted a new Art piece in Photography',
    time: '2 hours ago',
  },
  {
    id: 'a2',
    text: 'User Emma started a new idea: “Urban Sketching”',
    time: '5 hours ago',
  },
  {
    id: 'a3',
    text: 'User Liam commented on “Dreamscape: A Visual Journey”',
    time: '1 day ago',
  },
  {
    id: 'a4',
    text: 'User Olivia liked a work in Digital Art',
    time: '2 days ago',
  },
];

export default function KreativeDashboardPage(): JSX.Element {
  const router = useRouter();

  return (
    <KreativePageShell title="Kreative Dashboard">
      <Row gutter={[24, 24]}>
        {/* Featured Project Highlight */}
        <Col xs={24} md={16}>
          <Card
            hoverable
            cover={
              <img
                alt="Featured Project"
                src={featuredProject.imageUrl}
                style={{ objectFit: 'cover' }}
              />
            }
          >
            <Title level={3}>{featuredProject.title}</Title>
          </Card>
        </Col>

        {/* Top Creator Spotlight */}
        <Col xs={24} md={8}>
          <Card>
            <Space
              direction="vertical"
              align="center"
              style={{ width: '100%' }}
            >
              <Avatar size={80} src={topCreator.avatar} />
              <Title level={4} style={{ margin: 0 }}>
                {topCreator.name}
              </Title>
              <Text type="secondary">{topCreator.stats}</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Inspiration Gallery Preview */}
        <Col xs={24} md={16}>
          <Card title="Inspiration Gallery Preview">
            <Carousel autoplay dotPosition="bottom">
              {inspirationGallery.map((item) => (
                <div key={item.id}>
                  <img
                    alt={`Art ${item.id}`}
                    src={item.imageUrl}
                    style={{
                      width: '100%',
                      height: 300,
                      objectFit: 'cover',
                    }}
                  />
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>

        {/* Quick Links */}
        <Col xs={24} md={8}>
          <Card title="Quick Links">
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              {quickLinks.map((link) => (
                <Button
                  key={link.title}
                  type="primary"
                  block
                  icon={link.icon}
                  onClick={() => router.push(link.href)}
                >
                  {link.title}
                </Button>
              ))}
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Feed */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24}>
          <Card title="Recent Activity">
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.text}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </KreativePageShell>
  );
}
