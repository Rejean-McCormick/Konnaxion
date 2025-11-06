'use client'

// pages/keenkonnect/workspaces/my-workspaces/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, List, Button, Badge, Row, Col, Select, Divider, Typography } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

interface Workspace {
  id: string;
  name: string;
  project: string;
  status: 'active' | 'inactive';
  description: string;
  environment: string; // Ex: "Python environment", "Design whiteboard"
}

// Données simulées pour les workspaces
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

const MyWorkspaces: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();

  // État pour le filtre par projet
  const [selectedProject, setSelectedProject] = useState<string>('All');

  // Filtrage des workspaces selon le projet sélectionné
  const filteredWorkspaces = useMemo(() => {
    if (selectedProject === 'All') return sampleWorkspaces;
    return sampleWorkspaces.filter(ws => ws.project === selectedProject);
  }, [selectedProject]);

  // Calcul du nombre de workspaces actifs
  const activeCount = useMemo(() => {
    return sampleWorkspaces.filter(ws => ws.status === 'active').length;
  }, []);

  // Liste des projets disponibles (unique)
  const projectOptions = useMemo(() => {
    const projects = Array.from(new Set(sampleWorkspaces.map(ws => ws.project)));
    return ['All', ...projects];
  }, []);

  // Gestion des actions sur un workspace
  const handleWorkspaceAction = (ws: Workspace) => {
    // Selon le statut, redirigez ou lancez une action
    if (ws.status === 'active') {
      router.push(`/keenkonnect/workspaces/launch-workspace?id=${ws.id}`);
    } else {
      router.push(`/keenkonnect/workspaces/launch-workspace?id=${ws.id}`);
    }

  const handleManageSettings = (ws: Workspace) => {
    router.push(`/keenkonnect/workspaces/manage-workspace?id=${ws.id}`);

  return (
    <>
      <Head>
        <title>My Workspaces</title>
        <meta name="description" content="View and manage your interactive workspaces on KeenKonnect." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de page */}
        <Title level={2}>My Workspaces</Title>
        <Divider />

        {/* Résumé des workspaces actifs */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col>
            <Text strong>Total Active Workspaces: {activeCount}</Text>
          </Col>
        </Row>

        {/* Filtres */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12}>
            <Text>Filter by Project:</Text>
            <Select
              value={selectedProject}
              onChange={(value) => setSelectedProject(value)}
              style={{ width: '100%' }}
            >
              {projectOptions.map((project) => (
                <Option key={project} value={project}>{project}</Option>
              ))}
            </Select>
          </Col>
        </Row>
        <Divider />

        {/* Liste des workspaces */}
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
                <p><strong>Project:</strong> {workspace.project}</p>
                <p><strong>Description:</strong> {workspace.description}</p>
                <p><strong>Environment:</strong> {workspace.environment}</p>
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between' }}>
                  <Button type="primary" onClick={() => handleWorkspaceAction(workspace)}>
                    {workspace.status === 'active' ? 'Join Now' : 'Launch'}
                  </Button>
                  <Button onClick={() => handleManageSettings(workspace)}>
                    Manage Settings
                  </Button>
                </div>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </>
  );



export default MyWorkspaces;
