// FILE: frontend/app/ekoh/achievements-badges/earned-badges-display/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { Card, List, Modal, Select, Row, Col, Typography, Empty, Divider } from 'antd';
import EkohPageShell from '@/app/ekoh/EkohPageShell';

const { Text } = Typography;
const { Option } = Select;

interface Badge {
  id: string;
  name: string;
  icon: string;
  category: string;
  dateEarned: string;
  description: string;
}

// Temporary mock data – to be replaced by a real Ekoh badges service
const sampleBadges: Badge[] = [
  {
    id: '1',
    name: 'Top Contributor',
    icon: '/badges/top-contributor.png',
    category: 'Expertise',
    dateEarned: '2023-08-20',
    description: 'Awarded for exceptional contributions in discussions.',
  },
  {
    id: '2',
    name: 'Community Champion',
    icon: '/badges/community-champion.png',
    category: 'Community',
    dateEarned: '2023-07-15',
    description: 'Recognizes outstanding community engagement and support.',
  },
  {
    id: '3',
    name: 'Innovator',
    icon: '/badges/innovator.png',
    category: 'Innovation',
    dateEarned: '2023-06-10',
    description: 'Awarded for innovative ideas and solutions.',
  },
  {
    id: '4',
    name: 'Expert Reviewer',
    icon: '/badges/expert-reviewer.png',
    category: 'Expertise',
    dateEarned: '2023-05-22',
    description: 'Given to users providing insightful reviews.',
  },
  {
    id: '5',
    name: 'Active Participant',
    icon: '/badges/active-participant.png',
    category: 'Community',
    dateEarned: '2023-09-01',
    description: 'Recognizes consistent participation over time.',
  },
];

export default function EarnedBadgesDisplay(): JSX.Element {
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [sortOrder, setSortOrder] = useState<string>('Newest');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const totalBadges = sampleBadges.length;
  const userLevel =
    totalBadges >= 5 ? 'Gold' : totalBadges >= 3 ? 'Silver' : 'Bronze';

  const displayedBadges = useMemo(() => {
    let badges = [...sampleBadges];

    if (filterCategory !== 'All') {
      badges = badges.filter((badge) => badge.category === filterCategory);
    }

    badges.sort((a, b) => {
      const dateA = new Date(a.dateEarned).getTime();
      const dateB = new Date(b.dateEarned).getTime();
      return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
    });

    return badges;
  }, [filterCategory, sortOrder]);

  const showBadgeDetails = (badge: Badge) => {
    setSelectedBadge(badge);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBadge(null);
  };

  return (
    <>
      <Head>
        <title>Achievements & Badges – Ekoh</title>
        <meta
          name="description"
          content="View all your earned Ekoh badges and achievements with filtering and detailed views."
        />
      </Head>

      <EkohPageShell
        title="Achievements & badges"
        subtitle="View the badges you have earned in Ekoh and explore what they represent."
      >
        {/* Summary */}
        <Card className="mb-6">
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Text strong>Total badges:&nbsp;</Text>
              <Text>{totalBadges}</Text>
            </Col>
            <Col xs={24} sm={12}>
              <Text strong>Level:&nbsp;</Text>
              <Text>{userLevel}</Text>
            </Col>
          </Row>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <Divider orientation="left">Filters</Divider>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Text>Filter by category</Text>
              <Select
                defaultValue="All"
                style={{ width: '100%', marginTop: 8 }}
                onChange={(v) => setFilterCategory(v)}
              >
                <Option value="All">All</Option>
                <Option value="Expertise">Expertise</Option>
                <Option value="Community">Community</Option>
                <Option value="Innovation">Innovation</Option>
              </Select>
            </Col>
            <Col xs={24} sm={12}>
              <Text>Sort by date earned</Text>
              <Select
                defaultValue="Newest"
                style={{ width: '100%', marginTop: 8 }}
                onChange={(v) => setSortOrder(v)}
              >
                <Option value="Newest">Newest</Option>
                <Option value="Oldest">Oldest</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Badge grid */}
        <Card>
          {displayedBadges.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4, xl: 4 }}
              dataSource={displayedBadges}
              renderItem={(badge: Badge) => (
                <List.Item>
                  <Card
                    hoverable
                    onClick={() => showBadgeDetails(badge)}
                    cover={
                      <img
                        alt={badge.name}
                        src={badge.icon}
                        style={{
                          padding: '10px',
                          objectFit: 'contain',
                          height: 120,
                        }}
                      />
                    }
                  >
                    <Card.Meta
                      title={badge.name}
                      description={badge.category}
                    />
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No badges earned yet." />
          )}
        </Card>

        {/* Detail modal */}
        <Modal
          title={selectedBadge?.name}
          open={modalVisible}
          onOk={closeModal}
          onCancel={closeModal}
          footer={null}
        >
          {selectedBadge && (
            <div>
              <img
                alt={selectedBadge.name}
                src={selectedBadge.icon}
                style={{
                  width: '100%',
                  maxHeight: 150,
                  objectFit: 'contain',
                  marginBottom: 16,
                }}
              />
              <p>
                <strong>Description:</strong> {selectedBadge.description}
              </p>
              <p>
                <strong>Date earned:</strong> {selectedBadge.dateEarned}
              </p>
            </div>
          )}
        </Modal>
      </EkohPageShell>
    </>
  );
}
