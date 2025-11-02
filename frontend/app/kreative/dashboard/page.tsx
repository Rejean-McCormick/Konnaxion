'use client';
import React from 'react';
import { NextPage } from 'next';
import { Card, Avatar, Button, Carousel, List, Row, Col, Typography, Space } from 'antd';
import { PictureOutlined, BulbOutlined, UploadOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;

// Dummy data for Featured Project
const featuredProject = {
  title: 'Dreamscape: A Visual Journey',
  imageUrl: 'https://via.placeholder.com/600x300.png?text=Featured+Project',
};

// Dummy data for Inspiration Gallery Preview (carousel items)
const inspirationGallery = [
  { id: '1', imageUrl: 'https://via.placeholder.com/600x300.png?text=Art+1' },
  { id: '2', imageUrl: 'https://via.placeholder.com/600x300.png?text=Art+2' },
  { id: '3', imageUrl: 'https://via.placeholder.com/600x300.png?text=Art+3' },
  { id: '4', imageUrl: 'https://via.placeholder.com/600x300.png?text=Art+4' },
];

// Dummy data for Top Creator Spotlight
const topCreator = {
  name: 'Sophia Rivera',
  avatar: 'https://via.placeholder.com/80.png?text=S',
  stats: '48 Projects · 1200 Likes',
};

// Dummy data for Quick Links
const quickLinks = [
  { title: 'Explore Ideas', icon: <BulbOutlined style={{ fontSize: 24 }} />, link: '/kreative/explore' },
  { title: 'Submit Work', icon: <UploadOutlined style={{ fontSize: 24 }} />, link: '/kreative/submit' },
  { title: 'View Gallery', icon: <PictureOutlined style={{ fontSize: 24 }} />, link: '/kreative/gallery' },
];

// Dummy data for Recent Activity Feed
const recentActivities = [
  { id: 'a1', text: 'User John submitted a new Art piece in Photography', time: '2 hours ago' },
  { id: 'a2', text: 'User Emma started a new idea: “Urban Sketching”', time: '5 hours ago' },
  { id: 'a3', text: 'User Liam commented on “Dreamscape: A Visual Journey”', time: '1 day ago' },
  { id: 'a4', text: 'User Olivia liked a work in Digital Art', time: '2 days ago' },
];

const KreativeDashboard: NextPage = () => {
  return (
    <PageContainer title="Kreative Dashboard">
      <Row gutter={[24, 24]}>
        {/* Featured Project Highlight */}
        <Col xs={24} md={16}>
          <Card hoverable cover={<img alt="Featured Project" src={featuredProject.imageUrl} />}>
            <Title level={3}>{featuredProject.title}</Title>
          </Card>
        </Col>
        {/* Top Creator Spotlight */}
        <Col xs={24} md={8}>
          <Card>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar size={80} src={topCreator.avatar} />
              <Title level={4} style={{ margin: 0 }}>{topCreator.name}</Title>
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
                    style={{ width: '100%', height: '300px', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </Carousel>
          </Card>
        </Col>
        {/* Quick Links */}
        <Col xs={24} md={8}>
          <Card title="Quick Links">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {quickLinks.map((link, index) => (
                <Button
                  key={index}
                  type="primary"
                  block
                  icon={link.icon}
                  onClick={() => { window.location.href = link.link; }}
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
    </PageContainer>
  );
};

KreativeDashboard.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default KreativeDashboard;
