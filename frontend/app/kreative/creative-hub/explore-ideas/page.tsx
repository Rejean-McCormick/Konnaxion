'use client';

// File: /pages/kreative/creative-hub/explore-ideas.tsx
import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Row, Col, Card, Input, Select, Typography, Space, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

interface CreativeIdea {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  domain: string;       // e.g., 'Art', 'Music', 'Writing'
  thumbnail: string;    // URL for a thumbnail image
  date: string;         // ISO date string for "newest" sort
  popularity: number;   // e.g., number of likes/views for "most popular" sort
}

const creativeIdeasData: CreativeIdea[] = [
  {
    id: '1',
    title: 'The Beauty of Minimalism',
    excerpt: 'Exploring the art of less is more in design and creative expression.',
    author: 'Alice Martin',
    domain: 'Art',
    thumbnail: 'https://via.placeholder.com/300x200.png?text=Minimalism',
    date: '2025-11-20T10:00:00Z',
    popularity: 87,
  },
  {
    id: '2',
    title: 'Soundscapes: Music and Emotion',
    excerpt: 'How different chord progressions evoke specific emotional responses.',
    author: 'Brian Chen',
    domain: 'Music',
    thumbnail: 'https://via.placeholder.com/300x200.png?text=Soundscapes',
    date: '2025-11-18T14:30:00Z',
    popularity: 73,
  },
  {
    id: '3',
    title: 'Writing with Constraints',
    excerpt: 'Using constraints like lipograms to spark creativity.',
    author: 'Caroline Dupont',
    domain: 'Writing',
    thumbnail: 'https://via.placeholder.com/300x200.png?text=Constraints',
    date: '2025-11-15T09:00:00Z',
    popularity: 55,
  },
  {
    id: '4',
    title: 'Color Theory Basics',
    excerpt: 'Understanding complementary and analogous color schemes.',
    author: 'David Lopez',
    domain: 'Art',
    thumbnail: 'https://via.placeholder.com/300x200.png?text=Color+Theory',
    date: '2025-11-10T11:45:00Z',
    popularity: 61,
  },
];

const ExploreIdeasPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'newest' | 'popular'>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;

  // Filter and sort the creative ideas.
  const filteredIdeas = useMemo(() => {
    // Clone the data to avoid mutating the original array.
    let ideas = [...creativeIdeasData];

    if (selectedCategory !== 'All') {
      ideas = ideas.filter((idea) => idea.domain === selectedCategory);
    }
    if (searchQuery.trim() !== '') {
      ideas = ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOption === 'newest') {
      ideas = ideas.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } else if (sortOption === 'popular') {
      ideas = ideas.sort((a, b) => b.popularity - a.popularity);
    }
    return ideas;
  }, [searchQuery, selectedCategory, sortOption]);

  // Apply pagination to the filtered ideas.
  const paginatedIdeas = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredIdeas.slice(startIndex, startIndex + pageSize);
  }, [filteredIdeas, currentPage]);

  // Navigate to the idea detail page when a card is clicked.
  const handleCardClick = (idea: CreativeIdea) => {
    const router = useRouter();
    router.push(`/kreative/creative-hub/idea/${idea.id}`);
  };

  return (
    <PageContainer title="Explore Ideas">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Space wrap>
          <Input
            placeholder="Search ideas."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 300 }}
          />
          <Select
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="All">All Domains</Option>
            <Option value="Art">Art</Option>
            <Option value="Music">Music</Option>
            <Option value="Writing">Writing</Option>
          </Select>
          <Select
            value={sortOption}
            onChange={(value) => {
              setSortOption(value);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="newest">Newest</Option>
            <Option value="popular">Most Popular</Option>
          </Select>
        </Space>
        <Row gutter={[24, 24]}>
          {paginatedIdeas.map((idea) => (
            <Col key={idea.id} xs={24} sm={12} md={8}>
              <Card
                hoverable
                cover={
                  <img
                    alt={idea.title}
                    src={idea.thumbnail}
                    style={{ height: 160, objectFit: 'cover' }}
                  />
                }
                onClick={() => handleCardClick(idea)}
              >
                <Title level={4} ellipsis={{ rows: 1 }}>
                  {idea.title}
                </Title>
                <Paragraph type="secondary" ellipsis={{ rows: 2 }}>
                  {idea.excerpt}
                </Paragraph>
                <br />
                <Text strong>By:</Text> {idea.author}
              </Card>
            </Col>
          ))}
        </Row>
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredIdeas.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </div>
      </Space>
    </PageContainer>
  );
};

ExploreIdeasPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ExploreIdeasPage;
