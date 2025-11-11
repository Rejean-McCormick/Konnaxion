'use client';

import React, { useMemo, useState } from 'react';
import {
  Row,
  Col,
  Card,
  Modal,
  Pagination,
  Tabs,
  Button,
  Typography,
  Space,
} from 'antd';
import { HeartOutlined, HeartFilled } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';

const { Title, Text, Paragraph } = Typography;

type Category = 'All' | 'Photography' | 'Painting' | 'Digital Art';

interface CreativeWork {
  id: string;
  title: string;
  description: string;
  creator: string;
  category: Exclude<Category, 'All'>;
  imageUrl: string;
  likes: number;
  liked?: boolean;
}

// Dummy data for the gallery
const dummyWorks: CreativeWork[] = [
  {
    id: '1',
    title: 'Sunset Overdrive',
    description: 'A breathtaking view of the sunset captured in high resolution.',
    creator: 'Alice Johnson',
    category: 'Photography',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Sunset',
    likes: 34,
    liked: false,
  },
  {
    id: '2',
    title: 'Abstract Colors',
    description: 'A vibrant abstract painting exploring the interplay of color.',
    creator: 'Bob Smith',
    category: 'Painting',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Abstract+Painting',
    likes: 58,
    liked: false,
  },
  {
    id: '3',
    title: 'Digital Dreams',
    description: 'A surreal piece of digital art mixing technology and imagination.',
    creator: 'Carla Gomez',
    category: 'Digital Art',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Digital+Art',
    likes: 72,
    liked: false,
  },
  {
    id: '4',
    title: 'City Reflections',
    description: 'A dramatic urban photograph showcasing reflections on wet streets.',
    creator: 'David Lee',
    category: 'Photography',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=City+Reflections',
    likes: 43,
    liked: false,
  },
  {
    id: '5',
    title: 'Impressionist Waves',
    description: 'An impressionist painting capturing the movement of ocean waves.',
    creator: 'Eva Martinez',
    category: 'Painting',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Impressionist+Waves',
    likes: 66,
    liked: false,
  },
  {
    id: '6',
    title: 'Virtual Reality',
    description: 'An innovative digital artwork blending real and virtual elements.',
    creator: 'Felix Zhang',
    category: 'Digital Art',
    imageUrl: 'https://via.placeholder.com/400x300.png?text=Virtual+Reality',
    likes: 51,
    liked: false,
  },
];

export default function InspirationGalleryPage(): JSX.Element {
  // State for category filtering, pagination, Modal, and works.
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedWork, setSelectedWork] = useState<CreativeWork | null>(null);
  const [works, setWorks] = useState<CreativeWork[]>(dummyWorks);

  // Tabs (AntD v5) items
  const tabItems = useMemo(
    () => [
      { key: 'All', label: 'All' },
      { key: 'Photography', label: 'Photography' },
      { key: 'Painting', label: 'Painting' },
      { key: 'Digital Art', label: 'Digital Art' },
    ],
    []
  );

  // Filter works based on selected category.
  const filteredWorks = useMemo(() => {
    if (selectedCategory === 'All') return works;
    return works.filter((work) => work.category === selectedCategory);
  }, [selectedCategory, works]);

  // Paginate the filtered works.
  const paginatedWorks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWorks.slice(startIndex, startIndex + pageSize);
  }, [filteredWorks, currentPage]);

  // Handle like toggle.
  const toggleLike = (id: string): void => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, liked: !w.liked, likes: w.liked ? w.likes - 1 : w.likes + 1 } : w
      )
    );
  };

  // Open Modal for work details.
  const openWorkModal = (work: CreativeWork): void => {
    setSelectedWork(work);
    setModalVisible(true);
  };

  // Close the details Modal.
  const closeModal = (): void => {
    setModalVisible(false);
    setSelectedWork(null);
  };

  return (
    <PageContainer title="Inspiration Gallery">
      {/* Category Filter (AntD v5 Tabs API) */}
      <Tabs
        activeKey={selectedCategory}
        onChange={(key) => {
          setSelectedCategory(key as Category);
          setCurrentPage(1);
        }}
        type="card"
        items={tabItems}
        style={{ marginBottom: 24 }}
      />

      {/* Gallery Grid */}
      <Row gutter={[16, 16]}>
        {paginatedWorks.map((work) => (
          <Col key={work.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              cover={
                <img
                  alt={work.title}
                  src={work.imageUrl}
                  style={{ height: 200, objectFit: 'cover' }}
                />
              }
              actions={[
                <Button
                  key="like"
                  type="text"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(work.id);
                  }}
                >
                  {work.liked ? (
                    <HeartFilled style={{ color: 'red', fontSize: 18 }} />
                  ) : (
                    <HeartOutlined style={{ fontSize: 18 }} />
                  )}
                  <Text style={{ marginLeft: 4 }}>{work.likes}</Text>
                </Button>,
              ]}
              onClick={() => openWorkModal(work)}
            >
              <Card.Meta
                title={work.title}
                description={
                  <>
                    <Text>{work.creator}</Text>
                    <br />
                    {/* Replace ellipsis={{}} with CSS line clamp */}
                    <Paragraph type="secondary" className="lineClamp2">
                      {work.description}
                    </Paragraph>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredWorks.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      {/* Modal for work details */}
      <Modal open={modalVisible} footer={null} onCancel={closeModal} width={800}>
        {selectedWork && (
          <>
            <img
              alt={selectedWork.title}
              src={selectedWork.imageUrl}
              style={{ width: '100%', maxHeight: 400, objectFit: 'contain' }}
            />
            <div style={{ marginTop: 16 }}>
              <Title level={3}>{selectedWork.title}</Title>
              <Text strong>By: </Text>
              <Text>{selectedWork.creator}</Text>
              <p style={{ marginTop: 12 }}>{selectedWork.description}</p>
              <Space>
                <Button type="text" onClick={() => toggleLike(selectedWork.id)}>
                  {selectedWork.liked ? (
                    <HeartFilled style={{ color: 'red', fontSize: 20 }} />
                  ) : (
                    <HeartOutlined style={{ fontSize: 20 }} />
                  )}
                  <Text style={{ marginLeft: 4 }}>{selectedWork.likes} Likes</Text>
                </Button>
              </Space>
            </div>
          </>
        )}
      </Modal>

      <style jsx>{`
        /* Multi-line clamp to replace AntD ellipsis { rows } */
        .lineClamp2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </PageContainer>
  );
}
