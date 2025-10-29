'use client'

// pages/keenkonnect/workspaces/browse-available-workspaces/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { List, Card, Input, Select, Button, Row, Col, Pagination, Divider, Tag, Typography } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;
const { Text } = Typography;

interface Workspace {
  id: string;
  name: string;
  owner: string;
  purpose: string;
  tools: string[];
  currentUsers: number;
  lastActive: string;
  isJoinable: boolean;
}

// Exemple de données simulées pour les workspaces
const sampleWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Data Science Hub',
    owner: 'Alice',
    purpose: 'Collaborative workspace for data analysis and machine learning projects.',
    tools: ['Data Science Notebook', 'Python'],
    currentUsers: 10,
    lastActive: '2023-09-06 10:00',
    isJoinable: true,
  },
  {
    id: '2',
    name: 'VR Collaboration Space',
    owner: 'Bob',
    purpose: 'Virtual reality space for immersive teamwork.',
    tools: ['VR', '3D Modeling'],
    currentUsers: 5,
    lastActive: '2023-09-06 09:30',
    isJoinable: false,
  },
  {
    id: '3',
    name: 'Programming Lab',
    owner: 'Charlie',
    purpose: 'Workspace for coding projects and software development.',
    tools: ['Programming', 'Collaboration Tools'],
    currentUsers: 8,
    lastActive: '2023-09-06 11:15',
    isJoinable: true,
  },
  {
    id: '4',
    name: 'Design Studio',
    owner: 'Diana',
    purpose: 'Creative space for design brainstorming and UI/UX work.',
    tools: ['Design Tools', 'Whiteboard'],
    currentUsers: 3,
    lastActive: '2023-09-06 08:45',
    isJoinable: true,
  },
  {
    id: '5',
    name: 'Innovators Room',
    owner: 'Edward',
    purpose: 'Workspace for innovative projects and ideation.',
    tools: ['Brainstorming', 'Prototyping'],
    currentUsers: 12,
    lastActive: '2023-09-06 10:30',
    isJoinable: false,
  },
];

const BrowseAvailableWorkspaces: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  // États pour la recherche et les filtres
  const [searchText, setSearchText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('All');
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4; // ajustable

  // Filtrer les workspaces en fonction des critères
  const filteredWorkspaces = useMemo(() => {
    return sampleWorkspaces.filter((workspace) => {
      const matchesSearch = workspace.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesTool = selectedTool === 'All' || workspace.tools.includes(selectedTool);
      return matchesSearch && matchesTool;
    });
  }, [searchText, selectedTool]);

  // Appliquer la pagination
  const paginatedWorkspaces = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWorkspaces.slice(startIndex, startIndex + pageSize);
  }, [filteredWorkspaces, currentPage, pageSize]);

  // Gestion de l'action de rejoindre ou de demander l'accès
  const handleJoinAction = (workspace: Workspace) => {
    if (workspace.isJoinable) {
      router.push(`/keenkonnect/workspaces/join?id=${workspace.id}`);
    } else {
      router.push(`/keenkonnect/workspaces/request-access?id=${workspace.id}`);
    }
  };

  return (
    <>
      <Head>
        <title>Browse Available Workspaces</title>
        <meta name="description" content="Explore and join public workspaces available for collaboration." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de page */}
        <h1 className="text-2xl font-bold mb-4">Browse Available Workspaces</h1>
        
        {/* Contrôles de recherche et de filtre */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12}>
            <Search
              placeholder="Search workspaces..."
              allowClear
              onSearch={(value) => {
                setSearchText(value);
                setCurrentPage(1);
              }}
            />
          </Col>
          <Col xs={24} sm={12}>
            <Select
              defaultValue="All"
              style={{ width: '100%' }}
              onChange={(value) => {
                setSelectedTool(value);
                setCurrentPage(1);
              }}
            >
              <Option value="All">All Tools</Option>
              <Option value="Data Science Notebook">Data Science Notebook</Option>
              <Option value="VR">VR</Option>
              <Option value="Programming">Programming</Option>
              <Option value="Design Tools">Design Tools</Option>
              <Option value="3D Modeling">3D Modeling</Option>
              <Option value="Whiteboard">Whiteboard</Option>
              <Option value="Brainstorming">Brainstorming</Option>
              <Option value="Prototyping">Prototyping</Option>
            </Select>
          </Col>
        </Row>
        <Divider />

        {/* Liste des workspaces */}
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
          dataSource={paginatedWorkspaces}
          renderItem={(workspace: Workspace) => (
            <List.Item key={workspace.id}>
              <Card
                hoverable
                title={workspace.name}
                extra={<Text type="secondary">{workspace.owner}</Text>}
                actions={[
                  <Button type="primary" onClick={() => handleJoinAction(workspace)}>
                    {workspace.isJoinable ? 'Join' : 'Request Access'}
                  </Button>,
                ]}
              >
                <p>{workspace.purpose}</p>
                <div style={{ marginBottom: 8 }}>
                  {workspace.tools.map((tool, index) => (
                    <Tag key={index}>{tool}</Tag>
                  ))}
                </div>
                <Divider />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Tag color="blue">{workspace.currentUsers} Users</Tag>
                  <Tag color="volcano">Last Active: {workspace.lastActive}</Tag>
                </div>
              </Card>
            </List.Item>
          )}
        />

        {/* Pagination */}
        <Row justify="center" className="mt-4">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredWorkspaces.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </Row>
      </div>
    </>
  );
};

BrowseAvailableWorkspaces.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default BrowseAvailableWorkspaces;
