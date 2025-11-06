'use client'

// File: /pages/konnected/community-discussions/active-threads.tsx
import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import {
  List,
  Card,
  Input,
  Select,
  Space,
  Typography,
  Pagination,
} from 'antd';
import {
  SearchOutlined,
  QuestionCircleOutlined,
  MessageTwoTone,
} from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;
const { Option } = Select;

interface Thread {
  id: string;
  title: string;
  snippet: string;
  author: string;
  repliesCount: number;
  lastActivity: string; // date string for simplification
  category: 'Math' | 'Science' | 'General';
  threadType: 'question' | 'discussion';
}

// Données simulées pour les threads
const dummyThreads: Thread[] = [
  {
    id: 't1',
    title: 'How to solve quadratic equations?',
    snippet: 'I’m struggling with solving quadratic equations. Can anyone explain...',
    author: 'Alice',
    repliesCount: 15,
    lastActivity: '2025-12-01 14:30',
    category: 'Math',
    threadType: 'question',
  },
  {
    id: 't2',
    title: 'The impact of climate change on ecosystems',
    snippet: 'Let’s discuss how various ecosystems are being affected by the recent...',
    author: 'Bob',
    repliesCount: 8,
    lastActivity: '2025-12-01 10:15',
    category: 'Science',
    threadType: 'discussion',
  },
  {
    id: 't3',
    title: 'Study tips for final exams',
    snippet: 'I’d like to share some study tips and ask for suggestions for better...',
    author: 'Carol',
    repliesCount: 22,
    lastActivity: '2025-11-30 18:45',
    category: 'General',
    threadType: 'discussion',
  },
  {
    id: 't4',
    title: 'What is the derivative of sin(x)?',
    snippet: 'I know the derivative is cos(x), but how can I remember this easily?',
    author: 'David',
    repliesCount: 10,
    lastActivity: '2025-12-01 16:00',
    category: 'Math',
    threadType: 'question',
  },
  // ... Ajoutez d'autres threads au besoin
];

const ActiveThreadsPage: NextPage = () => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortOption, setSortOption] = useState<'recent' | 'replies'>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;

  // Filtrage et tri des threads
  const filteredThreads = useMemo(() => {
    let threads = [...dummyThreads]; // copie pour éviter la mutation
    if (selectedCategory !== 'All') {
      threads = threads.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery) {
      threads = threads.filter((t) =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.snippet.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (sortOption === 'recent') {
      threads = threads.slice().sort(
        (a, b) =>
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    } else {
      threads = threads.slice().sort((a, b) => b.repliesCount - a.repliesCount);
    }
    return threads;
  }, [searchQuery, selectedCategory, sortOption]);

  // Gestion de la pagination
  const paginatedThreads = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredThreads.slice(startIndex, startIndex + pageSize);
  }, [filteredThreads, currentPage, pageSize]);

  // Fonction de clic sur un thread (redirection vers la page de détail)
  const openThread = (thread: Thread) => {
    console.log('Ouvrir le thread:', thread.title);
    // Exemple de redirection : Router.push(`/konnected/community-discussions/thread/${thread.id}`);

  return (
    <PageContainer title="Active Threads">
      <Space style={{ marginBottom: 24 }} size="large" wrap>
        <Input
          placeholder="Search threads..."
          prefix={<SearchOutlined />}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          style={{ width: 300 }}
        />
        <Select
          value={selectedCategory}
          onChange={(value) => {
            setSelectedCategory(value);
            setCurrentPage(1);
          }}
          style={{ width: 150 }}
        >
          <Option value="All">All Categories</Option>
          <Option value="Math">Math</Option>
          <Option value="Science">Science</Option>
          <Option value="General">General</Option>
        </Select>
        <Select
          value={sortOption}
          onChange={(value) => {
            setSortOption(value);
            setCurrentPage(1);
          }}
          style={{ width: 180 }}
        >
          <Option value="recent">Sort by Recent Activity</Option>
          <Option value="replies">Sort by Most Replies</Option>
        </Select>
      </Space>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={paginatedThreads}
        renderItem={(thread: Thread) => (
          <List.Item
            onClick={() => openThread(thread)}
            style={{ cursor: 'pointer' }}
          >
            <Card hoverable>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Space>
                  {thread.threadType === 'question' ? (
                    <QuestionCircleOutlined
                      style={{ fontSize: 18, color: '#1890ff' }}
                    />
                  ) : (
                    <MessageTwoTone
                      twoToneColor="#52c41a"
                      style={{ fontSize: 18 }}
                    />
                  )}
                  <Title level={4} style={{ margin: 0 }}>
                    {thread.title}
                  </Title>
                </Space>
                <Text>{thread.snippet}</Text>
                <Space>
                  <Text strong>Author:</Text> {thread.author}
                  <Text strong>Replies:</Text> {thread.repliesCount}
                  <Text strong>Last Activity:</Text> {thread.lastActivity}
                </Space>
              </Space>
            </Card>
          </List.Item>
        )}
      />

      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredThreads.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </div>
    </PageContainer>
  );


  return <MainLayout>{page}</MainLayout>;

export default ActiveThreadsPage;
