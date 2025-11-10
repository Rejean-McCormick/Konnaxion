'use client';

import React, { useMemo, useState } from 'react';
import {
  Row,
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
import { SearchOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { Text } = Typography;
const { Option } = Select;

type Discipline = 'Art' | 'Music' | 'Writing' | 'Technology' | 'Other';
type JoinType = 'open' | 'invite-only';
type DisciplineFilter = Discipline | 'All';
type JoinTypeFilter = JoinType | 'All';

interface CollaborativeSpace {
  id: string;
  name: string;
  description: string;
  discipline: Discipline;
  memberCount: number;
  joinType: JoinType;
  createdAt: string; // ISO date
}

// Demo data
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
    description:
      'A space for writers to share ideas, get feedback, and find collaborators.',
    discipline: 'Writing',
    memberCount: 25,
    joinType: 'open',
    createdAt: '2025-11-18T09:15:00Z',
  },
  {
    id: '4',
    name: 'Tech & Art Fusion',
    description:
      'Where creativity meets innovation: join us to build interactive art installations.',
    discipline: 'Technology',
    memberCount: 18,
    joinType: 'invite-only',
    createdAt: '2025-11-22T11:45:00Z',
  },
];

export default function FindSpacesPage(): JSX.Element {
  const router = useRouter();

  // Filters, tri, pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDiscipline, setSelectedDiscipline] =
    useState<DisciplineFilter>('All');
  const [selectedJoinType, setSelectedJoinType] =
    useState<JoinTypeFilter>('All');
  const [sortOption, setSortOption] =
    useState<'mostActive' | 'newest'>('mostActive');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 4;

  // Modal d’invitation
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<CollaborativeSpace | null>(
    null,
  );

  // Filtre + tri
  const filteredSpaces = useMemo(() => {
    let spaces = dummySpaces;

    if (selectedDiscipline !== 'All') {
      spaces = spaces.filter((s) => s.discipline === selectedDiscipline);
    }
    if (selectedJoinType !== 'All') {
      spaces = spaces.filter((s) => s.joinType === selectedJoinType);
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      spaces = spaces.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      );
    }

    if (sortOption === 'newest') {
      // copie pour éviter la mutation
      return [...spaces].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    }
    // proxy d’activité = memberCount
    return [...spaces].sort((a, b) => b.memberCount - a.memberCount);
  }, [searchQuery, selectedDiscipline, selectedJoinType, sortOption]);

  // Pagination
  const paginatedSpaces = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSpaces.slice(start, start + pageSize);
  }, [filteredSpaces, currentPage]);

  // Actions
  function handleJoin(space: CollaborativeSpace) {
    if (space.joinType === 'open') {
      antdMessage.success(`You have joined "${space.name}"!`);
      router.push(`/kreative/collaborative-spaces/${space.id}`);
      return;
    }
    setSelectedSpace(space);
    setJoinModalVisible(true);
  }

  function confirmJoinRequest() {
    if (selectedSpace) {
      antdMessage.success(
        `Your request to join "${selectedSpace.name}" has been sent.`,
      );
    }
    setJoinModalVisible(false);
    setSelectedSpace(null);
  }

  return (
    <PageContainer title="Find Spaces">
      <Space direction="vertical" style={{ width: '100%', marginBottom: 24 }} size="large">
        <Space wrap>
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

          <Select
            value={selectedDiscipline}
            onChange={(v) => {
              setSelectedDiscipline(v as DisciplineFilter);
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

          <Select
            value={selectedJoinType}
            onChange={(v) => {
              setSelectedJoinType(v as JoinTypeFilter);
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="All">All Join Types</Option>
            <Option value="open">Open</Option>
            <Option value="invite-only">Invite-Only</Option>
          </Select>

          <Select
            value={sortOption}
            onChange={(v) => {
              setSortOption(v as 'mostActive' | 'newest');
              setCurrentPage(1);
            }}
            style={{ width: 180 }}
          >
            <Option value="mostActive">Most Active</Option>
            <Option value="newest">Newest</Option>
          </Select>
        </Space>
      </Space>

      <Row gutter={[24, 24]}>
        {paginatedSpaces.map((space) => (
          <Col key={space.id} xs={24} sm={12} md={8}>
            <Card
              hoverable
              title={space.name}
              extra={<Text type="secondary">{space.memberCount} Members</Text>}
              actions={[
                <Button
                  key="join"
                  type="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleJoin(space);
                  }}
                >
                  {space.joinType === 'open' ? 'Join' : 'Request to Join'}
                </Button>,
              ]}
              onClick={() =>
                router.push(`/kreative/collaborative-spaces/${space.id}`)
              }
            >
              <Card.Meta description={<Text>{space.description}</Text>} />
              <div style={{ marginTop: 12 }}>
                <Text strong>Discipline:</Text> <Text>{space.discipline}</Text>
                <br />
                <Text strong>Status:</Text>{' '}
                <Text>{space.joinType === 'open' ? 'Open' : 'Invite-Only'}</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredSpaces.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>

      <Modal
        title="Request to Join Space"
        open={joinModalVisible}
        onOk={confirmJoinRequest}
        onCancel={() => setJoinModalVisible(false)}
        okText="Send Request"
        cancelText="Cancel"
      >
        {selectedSpace && (
          <p>
            Do you want to send a join request for the space:{' '}
            <strong>{selectedSpace.name}</strong>?
          </p>
        )}
      </Modal>
    </PageContainer>
  );
}
