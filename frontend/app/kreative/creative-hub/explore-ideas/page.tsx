'use client';

import React, { useMemo, useState } from 'react';
import { Row, Col, Card, Input, Select, Typography, Space, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { Title, Text, Paragraph } = Typography;

type Domain = 'Art' | 'Music' | 'Writing';
type SortOpt = 'newest' | 'popular';

interface CreativeIdea {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  domain: Domain;        // e.g., 'Art', 'Music', 'Writing'
  thumbnail: string;     // URL for a thumbnail image
  date: string;          // ISO date string for "newest" sort
  popularity: number;    // e.g., likes/views for "most popular" sort
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

export default function ExploreIdeasPage() {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Domain>('All');
  const [sortOption, setSortOption] = useState<SortOpt>('newest');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 9;

  // Filter and sort the creative ideas.
  const filteredIdeas = useMemo(() => {
    let ideas = [...creativeIdeasData];

    if (selectedCategory !== 'All') {
      ideas = ideas.filter((idea) => idea.domain === selectedCategory);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      ideas = ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(q) ||
          idea.excerpt.toLowerCase().includes(q)
      );
    }
    ideas =
      sortOption === 'newest'
        ? ideas.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          )
        : ideas.sort((a, b) => b.popularity - a.popularity);

    return ideas;
  }, [searchQuery, selectedCategory, sortOption]);

  // Apply pagination to the filtered ideas.
  const paginatedIdeas = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredIdeas.slice(startIndex, startIndex + pageSize);
  }, [filteredIdeas, currentPage]);

  const handleCardClick = (idea: CreativeIdea) => {
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
            onChange={(value: 'All' | Domain) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Domains' },
              { value: 'Art', label: 'Art' },
              { value: 'Music', label: 'Music' },
              { value: 'Writing', label: 'Writing' },
            ]}
            style={{ width: 180 }}
          />

          <Select
            value={sortOption}
            onChange={(value: SortOpt) => {
              setSortOption(value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'newest', label: 'Newest' },
              { value: 'popular', label: 'Most Popular' },
            ]}
            style={{ width: 180 }}
          />
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
                {/* Single-line title clamp without AntD ellipsis rows */}
                <Title level={4} className="clamp-1" style={{ marginBottom: 8 }}>
                  {idea.title}
                </Title>

                {/* Multi-line summary clamp without AntD ellipsis rows */}
                <Paragraph className="clamp-2" type="secondary" style={{ marginBottom: 12 }}>
                  {idea.excerpt}
                </Paragraph>

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

      <style jsx>{`
        .clamp-1 {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </PageContainer>
  );
}
