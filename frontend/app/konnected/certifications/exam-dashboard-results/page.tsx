// app/konnected/certifications/exam-dashboard-results/page.tsx
'use client';

import React, { useState } from 'react';
import type { TableProps } from 'antd';
import {
  Card,
  Statistic,
  Table,
  Drawer,
  Button,
  Typography,
  Row,
  Col,
  List,
  Alert,
} from 'antd';
import { EyeOutlined, FilePdfOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';

const { Text } = Typography;

type ExamOutcome = 'Pass' | 'Fail';

interface ExamResult {
  id: string;
  examName: string;
  dateTaken: string;
  score: number;
  result: ExamOutcome;
  details: string;
}

const upcomingExam:
  | { examName: string; examDate: string; status: string }
  | null = {
  examName: 'Certification Exam Level 1',
  examDate: '2023-10-10 10:00',
  status: 'Registered',
};

const examResultsData: ExamResult[] = [
  {
    id: '1',
    examName: 'Certification Exam Level 1',
    dateTaken: '2023-08-10',
    score: 78,
    result: 'Pass',
    details:
      'Score global de 78%. Excellente performance en théorie, à améliorer en pratique.',
  },
  {
    id: '2',
    examName: 'Certification Exam Level 1',
    dateTaken: '2023-07-05',
    score: 65,
    result: 'Fail',
    details:
      'Score global de 65%. Points faibles identifiés en gestion des situations critiques.',
  },
];

const certificationsEarned: { id: string; title: string; pdfLink: string }[] = [
  { id: 'cert1', title: 'Certification Exam Level 1', pdfLink: '#' },
  { id: 'cert2', title: 'Advanced Certification Exam', pdfLink: '#' },
];

export default function ExamDashboardResultsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);

  const columns: TableProps<ExamResult>['columns'] = [
    { title: 'Exam Name', dataIndex: 'examName', key: 'examName' },
    { title: 'Date Taken', dataIndex: 'dateTaken', key: 'dateTaken' },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => `${score}%`,
    },
    {
      title: 'Result',
      dataIndex: 'result',
      key: 'result',
      render: (result: ExamOutcome) => (
        <Text strong style={{ color: result === 'Pass' ? 'green' : 'red' }}>
          {result}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: unknown, record: ExamResult) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedExam(record);
            setDrawerOpen(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const latest = examResultsData[0];

  return (
    <PageContainer title="Exam Dashboard & Results">
      {upcomingExam && (
        <Card title="Upcoming Exam" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Text strong>Exam:</Text> {upcomingExam.examName}
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Date:</Text> {upcomingExam.examDate}
            </Col>
            <Col xs={24} md={8}>
              <Text strong>Status:</Text> {upcomingExam.status}
            </Col>
          </Row>
        </Card>
      )}

      {latest && (
        <Card title="Latest Exam Result" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Statistic title="Score Achieved" value={latest.score} suffix="%" />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Result"
                value={latest.result}
                valueStyle={{
                  color: latest.result === 'Pass' ? '#3f8600' : '#cf1322',
                }}
              />
            </Col>
          </Row>
        </Card>
      )}

      <Card title="Exam History" style={{ marginBottom: 24 }}>
        <Table<ExamResult>
          columns={columns}
          dataSource={examResultsData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="Certificates Earned" style={{ marginBottom: 24 }}>
        <List
          dataSource={certificationsEarned}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button key="dl" icon={<FilePdfOutlined />} type="link" href={item.pdfLink}>
                  Download
                </Button>,
              ]}
            >
              <List.Item.Meta
                title={item.title}
                description={`Certificate ID: ${item.id}`}
              />
            </List.Item>
          )}
        />
      </Card>

      <Card>
        <Alert
          message="Next Steps: Explore further certification programs to advance your career."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" href="/konnected/certifications/certification-programs">
            Certification Programs
          </Button>
        </div>
      </Card>

      <Drawer
        title="Exam Details"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
      >
        {selectedExam && (
          <>
            <p>
              <strong>Exam Name:</strong> {selectedExam.examName}
            </p>
            <p>
              <strong>Date Taken:</strong> {selectedExam.dateTaken}
            </p>
            <p>
              <strong>Score:</strong> {selectedExam.score}%
            </p>
            <p>
              <strong>Result:</strong>{' '}
              <Text
                strong
                style={{ color: selectedExam.result === 'Pass' ? 'green' : 'red' }}
              >
                {selectedExam.result}
              </Text>
            </p>
            <p>
              <strong>Details:</strong>
            </p>
            <p>{selectedExam.details}</p>
          </>
        )}
      </Drawer>
    </PageContainer>
  );
}
