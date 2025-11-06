'use client'

// pages/keenkonnect/projects/my-projects/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Table, Card, Button, Row, Col, Select, Typography, Divider, Space } from 'antd';
import { EyeOutlined, EditOutlined, RocketOutlined, PlusOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;
const { Option } = Select;

// Définition du type d'un projet
interface Project {
  key: string;
  name: string;
  role: 'Owner' | 'Member';
  status: 'Active' | 'Completed';
  lastUpdated: string; // date formatée
  category?: string;
}

// Données simulées pour les projets
const sampleProjects: Project[] = [
  { key: '1', name: 'Project Alpha', role: 'Owner', status: 'Active', lastUpdated: '2023-09-01', category: 'Innovation' },
  { key: '2', name: 'Project Beta', role: 'Member', status: 'Completed', lastUpdated: '2023-08-15', category: 'Research' },
  { key: '3', name: 'Project Gamma', role: 'Owner', status: 'Active', lastUpdated: '2023-09-03', category: 'Development' },
  { key: '4', name: 'Project Delta', role: 'Member', status: 'Active', lastUpdated: '2023-08-28', category: 'Marketing' },
  { key: '5', name: 'Project Epsilon', role: 'Member', status: 'Completed', lastUpdated: '2023-07-30', category: 'Design' },
];

const MyProjects: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Filtrage des projets selon le statut et la catégorie
  const filteredProjects = useMemo(() => {
    return sampleProjects.filter((project) => {
      const statusMatch = statusFilter === 'All' || project.status === statusFilter;
      const categoryMatch = categoryFilter === 'All' || project.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [statusFilter, categoryFilter]);

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Project Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Project) => (
        <Text strong style={{ cursor: 'pointer' }} onClick={() => router.push(`/keenkonnect/projects/project-workspace?id=${record.key}`)}>
          {name}
        </Text>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Project) => (
        <Space>
          <Button icon={<EyeOutlined />} size="small" onClick={() => router.push(`/keenkonnect/projects/project-workspace?id=${record.key}`)}>View</Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => router.push(`/keenkonnect/projects/manage-project?id=${record.key}`)}>Manage</Button>
          <Button icon={<RocketOutlined />} size="small" onClick={() => router.push(`/keenkonnect/projects/project-workspace?id=${record.key}`)}>Go to Workspace</Button>
        </Space>
      ),
    },
  ];

  // Calcul du résumé des projets
  const totalProjects = sampleProjects.length;
  const activeCount = sampleProjects.filter(proj => proj.status === 'Active').length;
  const completedCount = sampleProjects.filter(proj => proj.status === 'Completed').length;

  return (
    <>
      <Head>
        <title>My Projects</title>
        <meta name="description" content="View and manage your projects within KeenKonnect." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de la page */}
        <Title level={2}>My Projects</Title>
        <Divider />

        {/* Résumé des projets */}
        <Row gutter={16} className="mb-4">
          <Col xs={24} sm={8}>
            <Card>
              <Text strong>Total Projects:</Text> <Text>{totalProjects}</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Text strong>Active:</Text> <Text>{activeCount}</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Text strong>Completed:</Text> <Text>{completedCount}</Text>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={12}>
            <Text>Status:</Text>
            <Select defaultValue="All" style={{ width: '100%' }} onChange={(value) => setStatusFilter(value)}>
              <Option value="All">All</Option>
              <Option value="Active">Active</Option>
              <Option value="Completed">Completed</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12}>
            <Text>Category:</Text>
            <Select defaultValue="All" style={{ width: '100%' }} onChange={(value) => setCategoryFilter(value)}>
              <Option value="All">All</Option>
              <Option value="Innovation">Innovation</Option>
              <Option value="Research">Research</Option>
              <Option value="Development">Development</Option>
              <Option value="Marketing">Marketing</Option>
              <Option value="Design">Design</Option>
            </Select>
          </Col>
        </Row>

        <Divider />

        {/* Tableau de projets */}
        <Card className="mb-4">
          <Table columns={columns} dataSource={filteredProjects} pagination={false} />
        </Card>

        {/* Bouton pour créer un nouveau projet */}
        <Row justify="end">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => router.push('/keenkonnect/projects/create-new-project')}>
            Create New Project
          </Button>
        </Row>
      </div>
    </>
  );



export default MyProjects;
