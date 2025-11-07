'use client'

// pages/konnected/learning-library/search-filters/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Form, Input, DatePicker, Select, Slider, Button, Table, Row, Col, Card, Divider } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Resource {
  key: string;
  title: string;
  author: string;
  subject: string;
  resourceType: string; // Document, Video, Quiz, etc.
  difficulty: number;   // Niveau de difficulté (1 à 5)
  createdAt: string;    // Date de publication
  rating: number;       // sur 5
}

// Exemple de données simulées pour les ressources
const sampleResources: Resource[] = [
  {
    key: '1',
    title: 'Introduction to Robotics',
    author: 'Alice',
    subject: 'Robotics',
    resourceType: 'Video',
    difficulty: 2,
    createdAt: '2023-09-01',
    rating: 4,
  },
  {
    key: '2',
    title: 'Advanced Healthcare Protocols',
    author: 'Bob',
    subject: 'Healthcare',
    resourceType: 'Document',
    difficulty: 5,
    createdAt: '2023-08-28',
    rating: 5,
  },
  {
    key: '3',
    title: 'Machine Learning Fundamentals',
    author: 'Charlie',
    subject: 'Technology',
    resourceType: 'Article',
    difficulty: 3,
    createdAt: '2023-09-03',
    rating: 4,
  },
  {
    key: '4',
    title: 'Sustainable Energy Solutions',
    author: 'Diana',
    subject: 'Energy',
    resourceType: 'Video',
    difficulty: 1,
    createdAt: '2023-08-20',
    rating: 3,
  },
  {
    key: '5',
    title: 'Design Thinking Essentials',
    author: 'Edward',
    subject: 'Design',
    resourceType: 'Quiz',
    difficulty: 4,
    createdAt: '2023-08-25',
    rating: 4,
  },
];

const SearchFilters = () => {
  // États pour les filtres de recherche
  const [keyword, setKeyword] = useState('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [subjectFilter, setSubjectFilter] = useState<string[]>([]);
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string[]>([]);
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 5]);
  const [sortCriteria, setSortCriteria] = useState<string>('relevance');

  // Filtrage des ressources selon les valeurs des filtres
  const filteredResources = useMemo(() => {
    return sampleResources.filter(resource => {
      // Filtre de recherche par titre et auteur
      const matchesKeyword =
        keyword === '' ||
        resource.title.toLowerCase().includes(keyword.toLowerCase()) ||
        resource.author.toLowerCase().includes(keyword.toLowerCase());
      // Filtre auteur (si renseigné séparément)
      const matchesAuthor = authorFilter === '' || resource.author.toLowerCase().includes(authorFilter.toLowerCase());
      // Filtre date
      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const resourceDate = dayjs(resource.createdAt);
        matchesDate = resourceDate.isAfter(dateRange[0]) && resourceDate.isBefore(dateRange[1]);
      }
      // Filtre par sujet
      const matchesSubject = subjectFilter.length === 0 || subjectFilter.includes(resource.subject);
      // Filtre par type de ressource
      const matchesResourceType = resourceTypeFilter.length === 0 || resourceTypeFilter.includes(resource.resourceType);
      // Filtre par niveau de difficulté
      const matchesDifficulty = resource.difficulty >= difficultyRange[0] && resource.difficulty <= difficultyRange[1];

      return matchesKeyword && matchesAuthor && matchesDate && matchesSubject && matchesResourceType && matchesDifficulty;
    });
  }, [keyword, authorFilter, dateRange, subjectFilter, resourceTypeFilter, difficultyRange]);

  // Définition des colonnes pour le tableau des résultats
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Subject', dataIndex: 'subject', key: 'subject' },
    { title: 'Type', dataIndex: 'resourceType', key: 'resourceType' },
    { title: 'Difficulty', dataIndex: 'difficulty', key: 'difficulty' },
    { title: 'Created At', dataIndex: 'createdAt', key: 'createdAt' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Resource) => (
        <Button type="link" onClick={() => window.location.href = `/konnected/learning-library/resource/${record.key}`}>
          Open
        </Button>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Search & Filters</title>
        <meta name="description" content="Advanced search interface with detailed filters for learning resources." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Search & Filters</h1>
        
        {/* Formulaire de recherche avancée */}
        <Card className="mb-6">
          <Form layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Keywords">
                  <Input
                    placeholder="Search by title or author"
                    allowClear
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Author">
                  <Input
                    placeholder="Filter by author"
                    allowClear
                    onChange={(e) => setAuthorFilter(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Date Range">
                  <RangePicker onChange={(dates) => setDateRange(dates as any)} style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Subjects">
                  <Select mode="multiple" placeholder="Select subjects" allowClear onChange={(value) => setSubjectFilter(value)}>
                    <Option value="Robotics">Robotics</Option>
                    <Option value="Healthcare">Healthcare</Option>
                    <Option value="Technology">Technology</Option>
                    <Option value="Energy">Energy</Option>
                    <Option value="Design">Design</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Resource Type">
                  <Select mode="multiple" placeholder="Select type(s)" allowClear onChange={(value) => setResourceTypeFilter(value)}>
                    <Option value="Document">Document</Option>
                    <Option value="Video">Video</Option>
                    <Option value="Article">Article</Option>
                    <Option value="Quiz">Quiz</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Difficulty">
                  <Slider
                    range
                    min={1}
                    max={5}
                    defaultValue={[1, 5]}
                    onChange={(value: [number, number]) => setDifficultyRange(value)}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Sort By">
                  <Select defaultValue="relevance" onChange={(value) => setSortCriteria(value)}>
                    <Option value="relevance">Relevance</Option>
                    <Option value="date">Newest</Option>
                    <Option value="rating">Highest Rated</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Button type="primary" onClick={() => { /* les filtres s'appliquent en temps réel grâce aux hooks */ }}>
              Apply Filters
            </Button>
          </Form>
        </Card>

        <Divider />

        {/* Résultats de la recherche */}
        <Card>
          <Table dataSource={filteredResources} columns={columns} pagination={{ pageSize: 5 }} />
        </Card>
      </div>
    </>
  );



export default SearchFilters;
}
