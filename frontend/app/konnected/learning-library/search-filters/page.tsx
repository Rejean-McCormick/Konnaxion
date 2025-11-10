'use client';

import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Slider,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { SearchOutlined, FilterOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

import MainLayout from '@/components/layout-components/MainLayout';
import type { ColumnsType } from 'antd/es/table';

const { Title, Paragraph, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

type Resource = {
  id: string;
  title: string;
  subject: string;
  type: 'Article' | 'Video' | 'Course' | 'Book' | 'Podcast';
  difficulty: number; // 1-5
  createdAt: string;  // ISO
  tags: string[];
};

const MOCK_RESOURCES: Resource[] = [
  {
    id: '1',
    title: 'Sustainable Design Principles',
    subject: 'Sustainability',
    type: 'Article',
    difficulty: 2,
    createdAt: '2025-01-02',
    tags: ['eco', 'design'],
  },
  {
    id: '2',
    title: 'Advanced TypeScript Patterns',
    subject: 'Engineering',
    type: 'Course',
    difficulty: 4,
    createdAt: '2025-03-12',
    tags: ['typescript', 'patterns'],
  },
  {
    id: '3',
    title: 'Community Moderation 101',
    subject: 'Community',
    type: 'Video',
    difficulty: 1,
    createdAt: '2024-11-14',
    tags: ['moderation', 'basics'],
  },
  {
    id: '4',
    title: 'Ethical AI in Decision Making',
    subject: 'Ethics',
    type: 'Podcast',
    difficulty: 3,
    createdAt: '2025-07-09',
    tags: ['ai', 'ethics'],
  },
];

const ALL_SUBJECTS = ['Sustainability', 'Engineering', 'Community', 'Ethics', 'Leadership'];
const ALL_TYPES: Resource['type'][] = ['Article', 'Video', 'Course', 'Book', 'Podcast'];

const SearchFiltersPage = () => {
  // Recherche simple
  const [query, setQuery] = useState<string>('');

  // Filtres
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [difficultyRange, setDifficultyRange] = useState<[number, number]>([1, 5]);
  const [resourceTypes, setResourceTypes] = useState<Resource['type'][]>([]);
  const [category, setCategory] = useState<string>('All');

  const [advancedOpen, setAdvancedOpen] = useState(false);

  const resetFilters = () => {
    setQuery('');
    setSelectedSubjects([]);
    setDateRange(null);
    setDifficultyRange([1, 5]);
    setResourceTypes([]);
    setCategory('All');
  };

  const filteredData = useMemo(() => {
    return MOCK_RESOURCES.filter((res) => {
      // Query
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const hay = `${res.title} ${res.subject} ${res.tags.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      // Subjects
      if (selectedSubjects.length > 0 && !selectedSubjects.includes(res.subject)) {
        return false;
      }

      // Types
      if (resourceTypes.length > 0 && !resourceTypes.includes(res.type)) {
        return false;
      }

      // Difficulty
      if (res.difficulty < difficultyRange[0] || res.difficulty > difficultyRange[1]) {
        return false;
      }

      // Date range
      if (dateRange) {
        const [start, end] = dateRange;
        const resDate = dayjs(res.createdAt);
        if (resDate.isBefore(start, 'day') || resDate.isAfter(end, 'day')) {
          return false;
        }
      }

      // Category (démo)
      if (category !== 'All') {
        // exemple de mapping fictif
        if (category === 'Featured' && res.id !== '1') return false;
        if (category === 'New' && dayjs().diff(dayjs(res.createdAt), 'day') > 60) return false;
      }

      return true;
    });
  }, [query, selectedSubjects, resourceTypes, difficultyRange, dateRange, category]);

  const columns: ColumnsType<Resource> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (_: unknown, record: Resource) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.title}</Text>
          <Text type="secondary">{record.subject}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (t) => <Tag>{t}</Tag>,
    },
    {
      title: 'Difficulty',
      dataIndex: 'difficulty',
      key: 'difficulty',
      render: (d) => (
        <Space>
          <Text>{d}</Text>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (d) => dayjs(d).format('YYYY-MM-DD'),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      render: (tags: string[]) => (
        <Space wrap>
          {tags.map((t) => (
            <Tag key={t}>{t}</Tag>
          ))}
        </Space>
      ),
    },
  ];

  const handleDifficultyChange = (value: number | [number, number]) => {
    if (Array.isArray(value) && value.length === 2) {
      setDifficultyRange([value[0], value[1]]);
    }
  };

  return (
    <MainLayout>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Title level={2}>Learning Library — Search &amp; Filters</Title>
          <Paragraph type="secondary">
            Recherchez dans les ressources avec des filtres combinables (matière, type, difficulté, plage de dates, etc.).
          </Paragraph>
        </Col>

        {/* Barre de recherche + actions */}
        <Col span={24}>
          <Card>
            <Row gutter={[12, 12]} align="middle">
              <Col xs={24} md={12}>
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Rechercher par titre / sujet / tag…"
                  allowClear
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col xs={24} md={12}>
                <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                  <Button icon={<FilterOutlined />} onClick={() => setAdvancedOpen(true)}>
                    Filtres avancés
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={resetFilters}>
                    Réinitialiser
                  </Button>
                </Space>
              </Col>
            </Row>

            <Divider />

            {/* Filtres rapides */}
            <Row gutter={[12, 12]}>
              <Col xs={24} md={8}>
                <Text strong>Matières</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Sélectionner des matières"
                  value={selectedSubjects}
                  onChange={setSelectedSubjects}
                >
                  {ALL_SUBJECTS.map((s) => (
                    <Option key={s} value={s}>
                      {s}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={8}>
                <Text strong>Types</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  placeholder="Sélectionner des types"
                  value={resourceTypes}
                  onChange={(vals) => setResourceTypes(vals as Resource['type'][])}
                >
                  {ALL_TYPES.map((t) => (
                    <Option key={t} value={t}>
                      {t}
                    </Option>
                  ))}
                </Select>
              </Col>

              <Col xs={24} md={8}>
                <Text strong>Difficulté</Text>
                <Slider
                  range={{ draggableTrack: true }}
                  min={1}
                  max={5}
                  step={1}
                  value={difficultyRange}
                  onChange={handleDifficultyChange}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Résultats */}
        <Col span={24}>
          <Card>
            <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text type="secondary">Résultats: {filteredData.length}</Text>
              <Select value={category} onChange={setCategory} style={{ width: 180 }}>
                <Option value="All">Toutes les catégories</Option>
                <Option value="Featured">Mises en avant</Option>
                <Option value="New">Nouveautés</Option>
              </Select>
            </Space>

            <Table<Resource> rowKey="id" columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} />
          </Card>
        </Col>
      </Row>

      {/* Filtres avancés */}
      <Modal
        open={advancedOpen}
        title="Filtres avancés"
        onOk={() => setAdvancedOpen(false)}
        onCancel={() => setAdvancedOpen(false)}
        okText="Appliquer"
      >
        <Form layout="vertical">
          <Form.Item label="Plage de dates">
            <RangePicker onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Mots-clés">
            <Input
              placeholder="Mots-clés additionnels…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              allowClear
            />
          </Form.Item>
        </Form>
      </Modal>
    </MainLayout>
  );
};

export default SearchFiltersPage;
