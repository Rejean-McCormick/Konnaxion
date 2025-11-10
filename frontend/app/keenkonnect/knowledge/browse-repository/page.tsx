// app/keenkonnect/knowledge/browse-repository/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Table, Input, Select, Button, Row, Col, Card, Divider } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';

type Category = 'All' | 'Robotics' | 'Healthcare' | 'Technology' | 'Environment';
type Language = 'All' | 'English' | 'French';

interface DocumentResource {
  key: string;
  title: string;
  category: Exclude<Category, 'All'>;
  language: Exclude<Language, 'All'>;
  version: string;
  lastUpdated: string; // ISO date string (yyyy-mm-dd)
}

// Données d’exemple (remplacez par vos données réelles)
const sampleResources: DocumentResource[] = [
  {
    key: '1',
    title: 'Robotics Blueprint',
    category: 'Robotics',
    language: 'English',
    version: '1.0',
    lastUpdated: '2023-09-01',
  },
  {
    key: '2',
    title: 'Healthcare Protocols',
    category: 'Healthcare',
    language: 'French',
    version: '2.1',
    lastUpdated: '2023-08-28',
  },
  {
    key: '3',
    title: 'AI Research Paper',
    category: 'Technology',
    language: 'English',
    version: '1.2',
    lastUpdated: '2023-09-03',
  },
  {
    key: '4',
    title: 'Sustainable Energy Report',
    category: 'Environment',
    language: 'English',
    version: '3.0',
    lastUpdated: '2023-08-20',
  },
];

export default function BrowseRepositoryPage(): JSX.Element {
  const router = useRouter();

  const [searchText, setSearchText] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('All');

  // Filtrage mémoire des ressources
  const filteredResources = useMemo(() => {
    return sampleResources.filter((resource) => {
      const matchesSearch = resource.title
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const matchesCategory =
        selectedCategory === 'All' || resource.category === selectedCategory;

      const matchesLanguage =
        selectedLanguage === 'All' || resource.language === selectedLanguage;

      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [searchText, selectedCategory, selectedLanguage]);

  const columns: ColumnsType<DocumentResource> = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Language', dataIndex: 'language', key: 'language' },
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: DocumentResource) => (
        <Button
          onClick={() =>
            router.push(
              `/keenkonnect/knowledge/document/${encodeURIComponent(record.key)}`
            )
          }
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <h1 style={{ marginBottom: 0 }}>Browse Knowledge Repository</h1>
      <Divider style={{ marginTop: 12 }} />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Input.Search
            placeholder="Search documents"
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(v) => setSearchText(v)}
          />
        </Col>

        <Col xs={24} md={8}>
          <Select<Category>
            value={selectedCategory}
            onChange={(v) => setSelectedCategory(v)}
            style={{ width: '100%' }}
            options={[
              { label: 'All Categories', value: 'All' },
              { label: 'Robotics', value: 'Robotics' },
              { label: 'Healthcare', value: 'Healthcare' },
              { label: 'Technology', value: 'Technology' },
              { label: 'Environment', value: 'Environment' },
            ]}
          />
        </Col>

        <Col xs={24} md={8}>
          <Select<Language>
            value={selectedLanguage}
            onChange={(v) => setSelectedLanguage(v)}
            style={{ width: '100%' }}
            options={[
              { label: 'All Languages', value: 'All' },
              { label: 'English', value: 'English' },
              { label: 'French', value: 'French' },
            ]}
          />
        </Col>
      </Row>

      <Divider />

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <Button
          type="primary"
          onClick={() => router.push('/keenkonnect/knowledge/upload-new-document')}
        >
          Upload New Document
        </Button>
      </div>

      <Table<DocumentResource>
        rowKey="key"
        columns={columns}
        dataSource={filteredResources}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
