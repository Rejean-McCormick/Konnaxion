'use client'

// pages/konnected/learning-library/browse-resources/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Table, Input, Select, Row, Col, Card, Divider, Tag, Button } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;

interface Resource {
  key: string;
  title: string;
  subject: string;
  level: string; // ex. Beginner, Intermediate, Advanced
  language: string;
  resourceType: string; // document, video, quiz, etc.
  rating: number; // sur 5
}

// Exemple de données simulées pour les ressources
const sampleResources: Resource[] = [
  {
    key: '1',
    title: 'Introduction to Robotics',
    subject: 'Robotics',
    level: 'Beginner',
    language: 'English',
    resourceType: 'Video',
    rating: 4,
  },
  {
    key: '2',
    title: 'Advanced Healthcare Protocols',
    subject: 'Healthcare',
    level: 'Advanced',
    language: 'French',
    resourceType: 'Document',
    rating: 5,
  },
  {
    key: '3',
    title: 'Machine Learning Fundamentals',
    subject: 'Technology',
    level: 'Intermediate',
    language: 'English',
    resourceType: 'Article',
    rating: 4,
  },
  {
    key: '4',
    title: 'Sustainable Energy Solutions',
    subject: 'Energy',
    level: 'Beginner',
    language: 'English',
    resourceType: 'Video',
    rating: 3,
  },
  {
    key: '5',
    title: 'Design Thinking Essentials',
    subject: 'Design',
    level: 'Intermediate',
    language: 'English',
    resourceType: 'Quiz',
    rating: 4,
  },
];

const BrowseResources: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState('All');
  const [languageFilter, setLanguageFilter] = useState('All');

  // Filtrage des ressources selon les critères saisis
  const filteredResources = useMemo(() => {
    return sampleResources.filter(resource => {
      const matchesSearch = searchText === '' || resource.title.toLowerCase().includes(searchText.toLowerCase()) || resource.resourceType.toLowerCase().includes(searchText.toLowerCase());
      const matchesSubject = subjectFilter === 'All' || resource.subject === subjectFilter;
      const matchesLevel = levelFilter === 'All' || resource.level === levelFilter;
      const matchesLanguage = languageFilter === 'All' || resource.language === languageFilter;
      return matchesSearch && matchesSubject && matchesLevel && matchesLanguage;
    });
  }, [searchText, subjectFilter, levelFilter, languageFilter]);

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Resource) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Affichage d'une icône indicative selon le type de ressource */}
          {record.resourceType === 'Video' && <Tag color="blue">🎥</Tag>}
          {record.resourceType === 'Document' && <Tag color="green">📄</Tag>}
          {record.resourceType === 'Quiz' && <Tag color="purple">❓</Tag>}
          {record.resourceType === 'Article' && <Tag color="orange">📰</Tag>}
          <span style={{ marginLeft: 8 }}>{text}</span>
        </div>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level',
    },
    {
      title: 'Language',
      dataIndex: 'language',
      key: 'language',
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => `${rating} / 5`,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Resource) => (
        <Button type="link" onClick={() => router.push(`/konnected/learning-library/resource/${record.key}`)}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Browse Resources</title>
        <meta name="description" content="Browse and search for educational content in the learning library." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Browse Resources</h1>
        
        {/* Barre de recherche et filtres */}
        <Card className="mb-4">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Search placeholder="Search resources" allowClear onSearch={(value) => setSearchText(value)} />
            </Col>
            <Col xs={24} sm={4}>
              <Select defaultValue="All" style={{ width: '100%' }} onChange={(value) => setSubjectFilter(value)}>
                <Option value="All">All Subjects</Option>
                <Option value="Robotics">Robotics</Option>
                <Option value="Healthcare">Healthcare</Option>
                <Option value="Technology">Technology</Option>
                <Option value="Energy">Energy</Option>
                <Option value="Design">Design</Option>
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Select defaultValue="All" style={{ width: '100%' }} onChange={(value) => setLevelFilter(value)}>
                <Option value="All">All Levels</Option>
                <Option value="Beginner">Beginner</Option>
                <Option value="Intermediate">Intermediate</Option>
                <Option value="Advanced">Advanced</Option>
              </Select>
            </Col>
            <Col xs={24} sm={4}>
              <Select defaultValue="All" style={{ width: '100%' }} onChange={(value) => setLanguageFilter(value)}>
                <Option value="All">All Languages</Option>
                <Option value="English">English</Option>
                <Option value="French">French</Option>
                {/* Ajoutez d'autres langues si nécessaire */}
              </Select>
            </Col>
          </Row>
        </Card>

        <Divider />

        {/* Table des ressources */}
        <Card>
          <Table
            dataSource={filteredResources}
            columns={columns}
            pagination={{ pageSize: 5 }}
          />
        </Card>
      </div>
    </>
  );
};

BrowseResources.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default BrowseResources;
