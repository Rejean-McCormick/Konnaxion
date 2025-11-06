'use client'

// pages/keenkonnect/knowledge/browse-repository/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Table, Input, Select, Button, Row, Col, Card, Divider } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;

interface DocumentResource {
  key: string;
  title: string;
  category: string;
  language: string;
  version: string;
  lastUpdated: string;
}

// Données simulées pour les ressources
const sampleResources: DocumentResource[] = [
  { key: '1', title: 'Robotics Blueprint', category: 'Robotics', language: 'English', version: '1.0', lastUpdated: '2023-09-01' },
  { key: '2', title: 'Healthcare Protocols', category: 'Healthcare', language: 'French', version: '2.1', lastUpdated: '2023-08-28' },
  { key: '3', title: 'AI Research Paper', category: 'Technology', language: 'English', version: '1.2', lastUpdated: '2023-09-03' },
  { key: '4', title: 'Sustainable Energy Report', category: 'Energy', language: 'English', version: '3.0', lastUpdated: '2023-08-20' },
];

const BrowseRepository: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');

  // Filtrage des ressources selon les filtres
  const filteredResources = useMemo(() => {
    return sampleResources.filter((resource) => {
      const matchesSearch = resource.title.toLowerCase().includes(searchText.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || resource.category === selectedCategory;
      const matchesLanguage = selectedLanguage === 'All' || resource.language === selectedLanguage;
      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [searchText, selectedCategory, selectedLanguage]);

  // Colonnes pour la table
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Language', dataIndex: 'language', key: 'language' },
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DocumentResource) => (
        <>
          <Button type="link" onClick={() => router.push(`/keenkonnect/knowledge/view/${record.key}`)}>
            View
          </Button>
          <Button type="link" onClick={() => router.push(`/keenkonnect/knowledge/edit/${record.key}`)}>
            Edit
          </Button>
        </>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Browse Repository</title>
        <meta name="description" content="Browse technical documents and blueprints in your repository." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête */}
        <h1 className="text-2xl font-bold mb-4">Browse Repository</h1>
        
        {/* Barre de recherche et filtres */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search documents..."
              allowClear
              onSearch={value => setSearchText(value)}
            />
          </Col>
          <Col xs={24} sm={8}>
            <Select
              defaultValue="All"
              style={{ width: '100%' }}
              onChange={(value) => setSelectedCategory(value)}
            >
              <Option value="All">All Categories</Option>
              <Option value="Robotics">Robotics</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Technology">Technology</Option>
              <Option value="Energy">Energy</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select
              defaultValue="All"
              style={{ width: '100%' }}
              onChange={(value) => setSelectedLanguage(value)}
            >
              <Option value="All">All Languages</Option>
              <Option value="English">English</Option>
              <Option value="French">French</Option>
            </Select>
          </Col>
        </Row>

        {/* Bouton pour uploader un nouveau document */}
        <Row justify="end" className="mb-4">
          <Button type="primary" onClick={() => router.push('/keenkonnect/knowledge/upload-new-document')}>
            Upload New Document
          </Button>
        </Row>

        <Card>
          <Table columns={columns} dataSource={filteredResources} pagination={{ pageSize: 5 }} />
        </Card>
      </div>
    </>
  );



export default BrowseRepository;
