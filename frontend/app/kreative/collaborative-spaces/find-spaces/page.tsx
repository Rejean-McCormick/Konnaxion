'use client';


import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Modal,
  Pagination,
  Space,
  Typography,
  message as antdMessage,
 } from 'antd';
import { SearchOutlined, UserAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;
const { Option } = Select;

// Interface for a collaborative space.
interface CollaborativeSpace {
  id: string;
  name: string;
  description: string;
  discipline: 'Art' | 'Music' | 'Writing' | 'Technology' | 'Other';
  memberCount: number;
  joinType: 'open' | 'invite-only'; // Determines whether a user can join directly or must request
  createdAt: string; // ISO date string for sorting
  // You can add additional fields as needed.
}

// Dummy data for the available spaces.
const dummySpaces: CollaborativeSpace[] = [
  {
    id: '1',
    name: 'Urban Art Collective',
    description: 'A community for street artists and mural enthusiasts.',
    discipline: 'Art',
    memberCount: 35,
    joinType: 'open',
    createdAt: '2025-11-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Indie Music Makers',
    description: 'Join to collaborate on original music projects and recordings.',
    discipline: 'Music',
    memberCount: 50,
    joinType: 'invite-only',
    createdAt: '2025-11-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Writers’ Lounge',
    description: 'A space for writers to share ideas, get feedback, and find collaborators.',
    discipline: 'Writing',
    memberCount: 25,
    joinType: 'open',
    createdAt: '2025-11-18T09:15:00Z',
  },
  {
    id: '4',
    name: 'Tech & Art Fusion',
    description: 'Where creativity meets innovation: join us to build interactive art installations.',
    discipline: 'Technology',
    memberCount: 18,
    joinType: 'invite-only',
    createdAt: '2025-11-22T11:45:00Z',
  },
  // Additional dummy spaces can be added here.
];

const FindSpaces: NextPage = () => {
  // State for filters and sorting.
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [selectedJoinType, setSelectedJoinType] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'mostActive' | 'newest'>('mostActive');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4;

  // State for Modal join request.
  const [joinModalVisible, setJoinModalVisible] = useState<boolean>(false);
  const [selectedSpace, setSelectedSpace] = useState<CollaborativeSpace | null>(null);

  // Filter and sort the spaces.
  const filteredSpaces = useMemo(() => {
    let spaces = dummySpaces;
    if (selectedDiscipline !== 'All') {
      spaces = spaces.filter(space => space.discipline === selectedDiscipline);
    }
    if (selectedJoinType !== 'All') {
      spaces = spaces.filter(space => space.joinType === selectedJoinType);
    }
    if (searchQuery.trim() !== '') {
      spaces = spaces.filter(
        space =>
          space.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          space.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOption === 'newest') {
      spaces = spaces.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortOption === 'mostActive') {
      // For simplicity, sort by memberCount as a proxy for activity.
      spaces = spaces.sort((a, b) => b.memberCount - a.memberCount);
    }
    return spaces;
  }, [searchQuery, selectedDiscipline, selectedJoinType, sortOption]);

  // Apply pagination.
  const paginatedSpaces = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSpaces.slice(start, start + pageSize);
  }, [filteredSpaces, currentPage]);

  // Handle join action.
  const handleJoin = (space: CollaborativeSpace) => {
    const router = useRouter();
    if (space.joinType === 'open') {
      // Direct join.
      antdMessage.success(`You have joined "${space.name}"!`);
      // Optionally, redirect to the space's main page.
      router.push(`/kreative/collaborative-spaces/${space.id}`);
    } else {
      // For invite-only, open a modal.
      setSelectedSpace(space);
      setJoinModalVisible(true);
    }

  // Confirm join request.
  const confirmJoinRequest = () => {
    if (selectedSpace) {
      antdMessage.success(`Your request to join "${selectedSpace.name}" has been sent.`);
      // Here, integrate API call to process join request.
    }
    setJoinModalVisible(false);
    setSelectedSpace(null);

  return (
    <PageContainer title="Find Spaces">
      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="large">
        <Space wrap>
          {/* Search Input */}
          <Input
            placeholder="Search spaces..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            style={{ width: 300 }}
          />
          {/* Discipline Filter */}
          <Select
            value={selectedDiscipline}
            onChange={(value) => {
              setSelectedDiscipline(value);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="All">All Disciplines</Option>
            <Option value="Art">Art</Option>
            <Option value="Music">Music</Option>
            <Option value="Writing">Writing</Option>
            <Option value="Technology">Technology</Option>
            <Option value="Other">Other</Option>
          </Select>
          {/* Join Type Filter */}
          <Select
            value={selectedJoinType}
            onChange={(value) => {
              setSelectedJoinType(value);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="All">All Join Types</Option>
            <Option value="open">Open</Option>
            <Option value="invite-only">Invite-Only</Option>
          </Select>
          {/* Sorting Options */}
          <Select
            value={sortOption}
            onChange={(value) => {
              setSortOption(value as 'mostActive' | 'newest');
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="mostActive">Most Active</Option>
            <Option value="newest">Newest</Option>
          </Select>
        </Space>
      </Space>
      {/* Render the list of space cards */}
      <Row gutter={[24, 24]}>
        {paginatedSpaces.map((space) => (
          <Col key={space.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              title={space.name}
              extra={<Text type="secondary">{space.memberCount} Members</Text>}
              actions={[
                <Button type="primary" onClick={(e) => { e.stopPropagation(); handleJoin(space); }}>
                  {space.joinType === 'open' ? 'Join' : 'Request to Join'}
                </Button>,
              ]}
              onClick={() => {
                const router = useRouter();
                // Optionally, clicking the card can navigate to a space detail view.
                router.push(`/kreative/collaborative-spaces/${space.id}`);
              }}
            >
              <Card.Meta
                description={<Text>{space.description}</Text>}
              />
              <div style={{ marginTop: 12 }}>
                <Text strong>Discipline:</Text> <Text>{space.discipline}</Text>
                <br />
                <Text strong>Status:</Text> <Text>{space.joinType === 'open' ? 'Open' : 'Invite-Only'}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
      {/* Pagination */}
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredSpaces.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
      {/* Modal for Invite-Only Join Request */}
      <Modal
        title="Request to Join Space"
        open={joinModalVisible}
        onOk={confirmJoinRequest}
        onCancel={() => setJoinModalVisible(false)}
        okText="Send Request"
        cancelText="Cancel"
      >
        {selectedSpace && (
          <p>Do you want to send a join request for the space: <strong>{selectedSpace.name}</strong>?</p>
        )}
      </Modal>
    </PageContainer>
  );


  return <MainLayout>{page}</MainLayout>;

export default FindSpaces;
}}}
