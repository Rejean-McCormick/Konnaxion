'use client';

import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Drawer,
  Typography,
  Pagination,
} from 'antd';
import { FileSearchOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';

const { Text } = Typography;
const { Option } = Select;

interface CertificationProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  levels: number;
  upcomingExamDates: string;
}

const dummyPrograms: CertificationProgram[] = [
  {
    id: '1',
    title: 'Full-Stack Web Development',
    description: 'Learn both frontend and backend technologies.',
    category: 'Technical',
    levels: 3,
    upcomingExamDates: '2023-11-05, 2023-12-10',
  },
  {
    id: '2',
    title: 'Digital Marketing Professional',
    description: 'Master online marketing and social media strategies.',
    category: 'Vocational',
    levels: 2,
    upcomingExamDates: '2023-10-20',
  },
  {
    id: '3',
    title: 'Data Science Certification',
    description: 'Learn data analysis, machine learning and visualization.',
    category: 'Technical',
    levels: 4,
    upcomingExamDates: '2023-11-15, 2023-12-20',
  },
];

const CertificationPrograms: NextPage = () => {
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedProgram, setSelectedProgram] = useState<CertificationProgram | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  // Filtrage
  const filteredPrograms = dummyPrograms.filter((program) => {
    const matchesKeyword =
      program.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      program.description.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || program.category === selectedCategory;
    return matchesKeyword && matchesCategory;
  });

  // Pagination
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Ouverture du Drawer
  const openDrawer = (program: CertificationProgram) => {
    setSelectedProgram(program);
    setDrawerVisible(true);
  };

  // Fermeture du Drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedProgram(null);
  };

  return (
    <PageContainer title="Certification Programs">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Search programs..."
            value={searchKeyword}
            onChange={(e) => {
              setSearchKeyword(e.target.value);
              setCurrentPage(1);
            }}
            prefix={<FileSearchOutlined />}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            style={{ width: '100%' }}
            placeholder="Filter by category"
            value={selectedCategory}
            onChange={(value) => {
              setSelectedCategory(value);
              setCurrentPage(1);
            }}
          >
            <Option value="All">All</Option>
            <Option value="Technical">Technical</Option>
            <Option value="Vocational">Vocational</Option>
          </Select>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        {paginatedPrograms.map((program) => (
          <Col xs={24} sm={12} md={8} key={program.id}>
            <Card
              title={program.title}
              extra={
                <Button type="link" onClick={() => openDrawer(program)}>
                  Learn More
                </Button>
              }
            >
              <Text>{program.description}</Text>
              <br />
              <Text strong>Levels:</Text> {program.levels}
              <br />
              <Text strong>Upcoming Exams:</Text> {program.upcomingExamDates}
              <br />
              <Button type="primary" style={{ marginTop: 8 }}>
                Register
              </Button>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredPrograms.length > pageSize && (
        <Row justify="center" style={{ marginTop: 24 }}>
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredPrograms.length}
            onChange={(page) => setCurrentPage(page)}
          />
        </Row>
      )}

      <Drawer
        title={selectedProgram?.title}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
      >
        {selectedProgram && (
          <>
            <p>
              <strong>Description: </strong>
              {selectedProgram.description}
            </p>
            <p>
              <strong>Category: </strong>
              {selectedProgram.category}
            </p>
            <p>
              <strong>Levels: </strong>
              {selectedProgram.levels}
            </p>
            <p>
              <strong>Upcoming Exam Dates: </strong>
              {selectedProgram.upcomingExamDates}
            </p>
            <Button type="primary" style={{ marginTop: 16 }}>
              Register Now
            </Button>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default CertificationPrograms;
