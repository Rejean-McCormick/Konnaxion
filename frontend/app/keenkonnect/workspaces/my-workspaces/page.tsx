'use client';

import React, { useMemo, useState } from 'react';
import { Card, List, Button, Badge, Row, Col, Select, Divider, Typography } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface Workspace {
  id: string;
  name: string;
  project: string;
  status: 'active' | 'inactive';
  description: string;
  environment: string; // e.g. "Python environment", "Design whiteboard"
}

const sampleWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Workspace Alpha',
    project: 'Project Alpha',
    status: 'active',
    description: 'Interactive Python coding environment for data analysis.',
    environment: 'Python environment',
  },
  {
    id: '2',
    name: 'Workspace Beta',
    project: 'Project Beta',
    status: 'inactive',
    description: 'Digital whiteboard for design brainstorming.',
    environment: 'Design whiteboard',
  },
  {
    id: '3',
    name: 'Workspace Gamma',
    project: 'Project Alpha',
    status: 'active',
    description: 'Collaborative space for real-time coding and testing.',
    environment: 'Development environment',
  },
  {
    id: '4',
    name: 'Workspace Delta',
    project: 'Project Delta',
    status: 'inactive',
    description: 'Project planning and management space.',
    environment: 'Planning Board',
  },
];

export default function MyWorkspaces() {
  const router = useRouter();

  // Filter by project
  const [selectedProject, setSelectedProject] = useState<string>('All');

  const filteredWorkspaces = useMemo(() => {
    if (selectedProject === 'All') return sampleWorkspaces;
    return sampleWorkspaces.filter((ws) => ws.project === selectedProject);
  }, [selectedProject]);

  const activeCount = useMemo(
    () => sampleWorkspaces.filter((ws) => ws.status === 'active').length,
    []
  );

  const projectOptions = useMemo(() => {
    const projects = Array.from(new Set(sampleWorkspaces.map((ws) => ws.project)));
    return ['All', ...projects];
  }, []);

  const handleWorkspaceAction = (ws: Workspace) => {
    // Use the real route that exists in your app
    router.push(`/keenkonnect/workspaces/launch-new-workspace?id=${ws.id}`);
  };

  const handleManageSettings = (ws: Workspace) => {
    // Reuse the same page and flag "manage" to avoid 404s until a settings page exists
    router.push(`/keenkonnect/workspaces/launch-new-workspace?id=${ws.id}&manage=1`);
  };

  return (
    <div className="container mx-auto p-5">
      <Title level={2}>My Workspaces</Title>
      <Divider />

      <Row gutter={[16, 16]} className="mb-4">
        <Col>
          <Text strong>Total Active Workspaces: {activeCount}</Text>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12}>
          <Text>Filter by Project:</Text>
          <Select
            value={selectedProject}
            onChange={(value) => setSelectedProject(value)}
            style={{ width: '100%' }}
            options={projectOptions.map((p) => ({ label: p, value: p }))}
          />
        </Col>
      </Row>

      <Divider />

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
        dataSource={filteredWorkspaces}
        renderItem={(workspace: Workspace) => (
          <List.Item key={workspace.id}>
            <Card
              hoverable
              title={workspace.name}
              extra={
                workspace.status === 'active' ? (
                  <Badge status="success" text="Active" />
                ) : (
                  <Badge status="default" text="Inactive" />
                )
              }
            >
              <p>
                <strong>Project:</strong> {workspace.project}
              </p>
              <p>
                <strong>Description:</strong> {workspace.description}
              </p>
              <p>
                <strong>Environment:</strong> {workspace.environment}
              </p>
              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                <Button type="primary" onClick={() => handleWorkspaceAction(workspace)}>
                  {workspace.status === 'active' ? 'Join Now' : 'Launch'}
                </Button>
                <Button onClick={() => handleManageSettings(workspace)}>Manage Settings</Button>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
