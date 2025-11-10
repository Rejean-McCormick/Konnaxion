'use client';

import React, { useMemo, useState } from 'react';
import { List, Card, Input, Select, Button, Row, Col, Pagination, Divider, Tag, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Search } = Input;
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

export default function BrowseAvailableWorkspaces(): JSX.Element {
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredWorkspaces = useMemo(() => {
    return sampleWorkspaces.filter((workspace) => {
      const matchesSearch = workspace.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesTool = selectedTool === 'All' || workspace.tools.includes(selectedTool);
      return matchesSearch && matchesTool;
    });
  }, [searchText, selectedTool]);

  const paginatedWorkspaces = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWorkspaces.slice(startIndex, startIndex + pageSize);
  }, [filteredWorkspaces, currentPage]);

  const handleJoinAction = (workspace: Workspace) => {
    if (workspace.isJoinable) {
      router.push(`/keenkonnect/workspaces/join?id=${workspace.id}`);
    } else {
      router.push(`/keenkonnect/workspaces/request-access?id=${workspace.id}`);
    }
  };

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Browse Available Workspaces</h1>

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
            value={selectedTool}
            style={{ width: '100%' }}
            onChange={(value: string) => {
              setSelectedTool(value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: 'All Tools' },
              { value: 'Data Science Notebook', label: 'Data Science Notebook' },
              { value: 'VR', label: 'VR' },
              { value: 'Programming', label: 'Programming' },
              { value: 'Design Tools', label: 'Design Tools' },
              { value: '3D Modeling', label: '3D Modeling' },
              { value: 'Whiteboard', label: 'Whiteboard' },
              { value: 'Brainstorming', label: 'Brainstorming' },
              { value: 'Prototyping', label: 'Prototyping' },
            ]}
          />
        </Col>
      </Row>

      <Divider />

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
                <Button key="join" type="primary" onClick={() => handleJoinAction(workspace)}>
                  {workspace.isJoinable ? 'Join' : 'Request Access'}
                </Button>,
              ]}
            >
              <p>{workspace.purpose}</p>
              <div style={{ marginBottom: 8 }}>
                {workspace.tools.map((tool) => (
                  <Tag key={tool}>{tool}</Tag>
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

      <Row justify="center" className="mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredWorkspaces.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </Row>
    </div>
  );
}
