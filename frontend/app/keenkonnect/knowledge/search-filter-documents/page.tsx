'use client'

// pages/keenkonnect/knowledge/search-filter-documents/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Form, Input, Select, DatePicker, Button, Table, Row, Col, Card, Divider } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface DocumentResource {
  key: string;
  title: string;
  snippet: string;
  author: string;
  tags: string[];
  language: string;
  version: string;
  lastUpdated: string;
  relevanceScore: number;
}

// Données simulées pour les documents
const sampleDocuments: DocumentResource[] = [
  {
    key: '1',
    title: 'Robotics Blueprint',
    snippet: 'Detailed blueprint for advanced robotics design...',
    author: 'Alice',
    tags: ['Robotics', 'Engineering'],
    language: 'English',
    version: '1.0',
    lastUpdated: '2023-09-01',
    relevanceScore: 85,
  },
  {
    key: '2',
    title: 'Healthcare Protocols',
    snippet: 'Updated protocols for modern healthcare systems...',
    author: 'Bob',
    tags: ['Healthcare', 'Medicine'],
    language: 'French',
    version: '2.1',
    lastUpdated: '2023-08-28',
    relevanceScore: 78,
  },
  {
    key: '3',
    title: 'AI Research Paper',
    snippet: 'A research paper discussing the latest trends in AI...',
    author: 'Charlie',
    tags: ['Technology', 'AI'],
    language: 'English',
    version: '1.2',
    lastUpdated: '2023-09-03',
    relevanceScore: 90,
  },
  {
    key: '4',
    title: 'Sustainable Energy Report',
    snippet: 'Comprehensive report on sustainable energy solutions...',
    author: 'Diana',
    tags: ['Energy', 'Environment'],
    language: 'English',
    version: '3.0',
    lastUpdated: '2023-08-20',
    relevanceScore: 80,
  },
];

const SearchFilterDocuments = () => {
  const [form] = Form.useForm();
  // États pour les filtres
  const [keyword, setKeyword] = useState('');
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);
  const [tagFilter, setTagFilter] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[any, any] | null>(null);
  const [sortCriteria, setSortCriteria] = useState<string>('relevance');

  // Filtrage des documents
  const filteredDocuments = useMemo(() => {
    return sampleDocuments.filter((doc) => {
      const matchesKeyword =
        keyword === '' ||
        doc.title.toLowerCase().includes(keyword.toLowerCase()) ||
        doc.snippet.toLowerCase().includes(keyword.toLowerCase());
      const matchesAuthor =
        authorFilter.length === 0 || authorFilter.includes(doc.author);
      const matchesTags =
        tagFilter.length === 0 || tagFilter.every(tag => doc.tags.includes(tag));
      let matchesDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const docDate = dayjs(doc.lastUpdated);
        matchesDate = docDate.isAfter(dateRange[0]) && docDate.isBefore(dateRange[1]);
      }
      return matchesKeyword && matchesAuthor && matchesTags && matchesDate;
    });
  }, [keyword, authorFilter, tagFilter, dateRange]);

  // Tri des résultats
  const sortedDocuments = useMemo(() => {
    const docs = [...filteredDocuments];
    if (sortCriteria === 'relevance') {
      docs.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } else if (sortCriteria === 'date') {
      docs.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
    } else if (sortCriteria === 'popularity') {
      // Si la popularité devait être calculée sur un autre critère, l'implémenter ici.
    }
    return docs;
  }, [filteredDocuments, sortCriteria]);

  // Définition des colonnes pour le tableau (simulant ProTable)
  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Snippet', dataIndex: 'snippet', key: 'snippet' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Language', dataIndex: 'language', key: 'language' },
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    { title: 'Relevance', dataIndex: 'relevanceScore', key: 'relevanceScore' },
  ];

  return (
    <>
      <Head>
        <title>Search & Filter Documents</title>
        <meta name="description" content="Advanced search and filter interface for repository documents." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Search & Filter Documents</h1>
        
        {/* Panneau de recherche et filtres */}
        <Card className="mb-6">
          <Form form={form} layout="vertical">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item label="Keywords">
                  <Input.Search placeholder="Enter keywords" allowClear onSearch={setKeyword} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Authors">
                  <Select mode="multiple" placeholder="Select authors" onChange={setAuthorFilter}>
                    {['Alice', 'Bob', 'Charlie', 'Diana'].map(author => (
                      <Option key={author} value={author}>{author}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Tags">
                  <Select mode="multiple" placeholder="Select tags" onChange={setTagFilter}>
                    {['Robotics', 'Healthcare', 'Technology', 'Energy', 'Environment'].map(tag => (
                      <Option key={tag} value={tag}>{tag}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Date Range">
                  <RangePicker onChange={(dates) => setDateRange(dates as any)} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item label="Sort By">
                  <Select defaultValue="relevance" onChange={setSortCriteria}>
                    <Option value="relevance">Relevance</Option>
                    <Option value="date">Date</Option>
                    <Option value="popularity">Popularity</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item>
                  <Button type="primary" onClick={() => form.submit()}>
                    Apply Filters
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        {/* Résultats */}
        <Card>
          <Table columns={columns} dataSource={sortedDocuments} pagination={{ pageSize: 5 }} />
        </Card>
      </div>
    </>
  );



export default SearchFilterDocuments;
}
