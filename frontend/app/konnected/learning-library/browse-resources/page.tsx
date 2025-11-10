'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Row,
  Col,
  Card,
  Typography,
  Input,
  Select,
  Tag,
  Rate,
  Space,
  Table,
  Pagination,
  Button,
} from 'antd';
import type { TableProps } from 'antd';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

type Level = 'Beginner' | 'Intermediate' | 'Advanced';
type Language = 'English' | 'French' | 'Spanish';

interface Resource {
  key: string;
  title: string;
  subject: string;
  level: Level;
  language: Language;
  resourceType: 'Video' | 'Article' | 'Course' | 'Quiz';
  rating: number; // 1..5
  tags?: string[];
}

const SUBJECTS = ['Robotics', 'Healthcare', 'AI', 'Sustainability', 'Design'];
const LEVELS: Level[] = ['Beginner', 'Intermediate', 'Advanced'];
const LANGUAGES: Language[] = ['English', 'French', 'Spanish'];

// NOTE: D’après le code original, c’est du mock. Je le conserve tel quel.
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
    resourceType: 'Article',
    rating: 5,
  },
  {
    key: '3',
    title: 'AI Ethics Fundamentals',
    subject: 'AI',
    level: 'Intermediate',
    language: 'English',
    resourceType: 'Course',
    rating: 4,
  },
  {
    key: '4',
    title: 'Sustainable Design Basics',
    subject: 'Sustainability',
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

export default function Page() {
  const router = useRouter();

  // State
  const [searchText, setSearchText] = useState<string>('');
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<Level | undefined>();
  const [selectedLanguage, setSelectedLanguage] = useState<Language | undefined>();
  const [current, setCurrent] = useState<number>(1);
  const pageSize = 8;

  // Filtrage
  const filteredResources = useMemo(() => {
    return sampleResources.filter((r) => {
      const matchesSearch =
        !searchText ||
        r.title.toLowerCase().includes(searchText.toLowerCase()) ||
        r.subject.toLowerCase().includes(searchText.toLowerCase());

      const matchesSubject =
        selectedSubjects.length === 0 || selectedSubjects.includes(r.subject);

      const matchesLevel = !selectedLevel || r.level === selectedLevel;
      const matchesLanguage = !selectedLanguage || r.language === selectedLanguage;

      return matchesSearch && matchesSubject && matchesLevel && matchesLanguage;
    });
  }, [searchText, selectedSubjects, selectedLevel, selectedLanguage]);

  // Pagination manuelle (Table sans pagination intégrée)
  const pagedResources = useMemo(() => {
    const start = (current - 1) * pageSize;
    return filteredResources.slice(start, start + pageSize);
  }, [filteredResources, current]);

  // Colonnes du tableau
  const columns: TableProps<Resource>['columns'] = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record) => (
        <Space direction="vertical" size={0}>
          <a
            onClick={() =>
              router.push(`/konnected/learning-library/resource/${record.key}`)
            }
          >
            {text}
          </a>
          <Text type="secondary">
            {record.resourceType} · {record.level} · {record.language}
          </Text>
          {record.tags && record.tags.length > 0 && (
            <Space direction="horizontal" size={4} wrap>
              {record.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </Space>
          )}
        </Space>
      ),
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      filters: SUBJECTS.map((s) => ({ text: s, value: s })),
      onFilter: (value, r) => r.subject === value,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      width: 160,
      render: (v: number) => <Rate disabled allowHalf defaultValue={v} />,
      sorter: (a, b) => a.rating - b.rating,
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Title level={2} style={{ marginBottom: 0 }}>
            Learning Library
          </Title>
          <Paragraph type="secondary" style={{ marginTop: 4 }}>
            Browse curated resources by subject, level and language.
          </Paragraph>
        </Col>

        <Col xs={24} md={8}>
          <Card title={<Space><FilterOutlined />Filters</Space>}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Search
                placeholder="Search by title or subject"
                allowClear
                enterButton={<SearchOutlined />}
                onSearch={(value: string) => {
                  setCurrent(1);
                  setSearchText(value);
                }}
              />

              <div>
                <Text strong>Subjects</Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Select subjects"
                  value={selectedSubjects}
                  onChange={(value: string[]) => {
                    setCurrent(1);
                    setSelectedSubjects(value);
                  }}
                  options={SUBJECTS.map((s) => ({ label: s, value: s }))}
                />
              </div>

              <div>
                <Text strong>Level</Text>
                <Select
                  allowClear
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Select level"
                  value={selectedLevel}
                  onChange={(value: Level | undefined) => {
                    setCurrent(1);
                    setSelectedLevel(value);
                  }}
                  options={LEVELS.map((l) => ({ label: l, value: l }))}
                />
              </div>

              <div>
                <Text strong>Language</Text>
                <Select
                  allowClear
                  style={{ width: '100%', marginTop: 8 }}
                  placeholder="Select language"
                  value={selectedLanguage}
                  onChange={(value: Language | undefined) => {
                    setCurrent(1);
                    setSelectedLanguage(value);
                  }}
                  options={LANGUAGES.map((l) => ({ label: l, value: l }))}
                />
              </div>

              <Space style={{ marginTop: 8 }}>
                <Button icon={<DownloadOutlined />}>Export</Button>
                <Button icon={<ShareAltOutlined />}>Share</Button>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Resources">
            <Table<Resource>
              rowKey="key"
              columns={columns}
              dataSource={pagedResources}
              pagination={false}
              onRow={(record: Resource) => ({
                onClick: () =>
                  router.push(`/konnected/learning-library/resource/${record.key}`),
              })}
            />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
              <Pagination
                current={current}
                pageSize={pageSize}
                total={filteredResources.length}
                onChange={(page: number) => setCurrent(page)}
                showSizeChanger={false}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
