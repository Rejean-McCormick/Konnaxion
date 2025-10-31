'use client'

// File: /pages/konnected/certifications/exam-dashboard-results.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
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
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Text } = Typography;

// Interface pour représenter une tentative d'examen
interface ExamResult {
  id: string;
  examName: string;
  dateTaken: string;
  score: number;
  result: 'Pass' | 'Fail';
  details: string; // Description détaillée ou récapitulatif
}

// Examen à venir (si l'utilisateur est inscrit)
const upcomingExam = {
  examName: 'Certification Exam Level 1',
  examDate: '2023-10-10 10:00',
  status: 'Registered',
};

// Historique des examens réalisés
const examResultsData: ExamResult[] = [
  {
    id: '1',
    examName: 'Certification Exam Level 1',
    dateTaken: '2023-08-10',
    score: 78,
    result: 'Pass',
    details: 'Score global de 78%. Excellente performance en théorie, à améliorer en pratique.',
  },
  {
    id: '2',
    examName: 'Certification Exam Level 1',
    dateTaken: '2023-07-05',
    score: 65,
    result: 'Fail',
    details: 'Score global de 65%. Points faibles identifiés en gestion des situations critiques.',
  },
];

// Exemples de certificats obtenus
const certificationsEarned = [
  { id: 'cert1', title: 'Certification Exam Level 1', pdfLink: '#' },
  { id: 'cert2', title: 'Advanced Certification Exam', pdfLink: '#' },
];

const ExamDashboardResults: NextPage = () => {
  // État pour gérer le Drawer de détail d'une tentative d'examen
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Exam Name',
      dataIndex: 'examName',
      key: 'examName',
    },
    {
      title: 'Date Taken',
      dataIndex: 'dateTaken',
      key: 'dateTaken',
    },
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
      render: (result: 'Pass' | 'Fail') => (
        <Text strong style={{ color: result === 'Pass' ? 'green' : 'red' }}>
          {result}
        </Text>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: ExamResult) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => {
            setSelectedExam(record);
            setDrawerVisible(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  return (
    <PageContainer title="Exam Dashboard & Results">
      {/* Section Examen à venir */}
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
      {/* Section Résumé des résultats pour le dernier examen terminé */}
      {examResultsData.length > 0 && (
        <Card title="Latest Exam Result" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Statistic
                title="Score Achieved"
                value={examResultsData[0].score}
                suffix="%"
              />
            </Col>
            <Col xs={24} md={12}>
              <Statistic
                title="Result"
                value={examResultsData[0].result}
                valueStyle={{
                  color:
                    examResultsData[0].result === 'Pass' ? '#3f8600' : '#cf1322',
                }}
              />
            </Col>
          </Row>
        </Card>
      )}
      {/* Tableau historique des examens */}
      <Card title="Exam History" style={{ marginBottom: 24 }}>
        <Table
          columns={columns}
          dataSource={examResultsData}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
      {/* Liste des certifications obtenues */}
      <Card title="Certificates Earned" style={{ marginBottom: 24 }}>
        <List
          dataSource={certificationsEarned}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button icon={<FilePdfOutlined />} type="link">
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
      {/* Section Prochaines Étapes */}
      <Card>
        <Alert
          message="Next Steps: Explore further certification programs to advance your career."
          type="info"
          showIcon
        />
        <div style={{ marginTop: 16 }}>
          <Button type="primary" href="/konnected/certifications/programs">
            Certification Programs
          </Button>
        </div>
      </Card>
      {/* Drawer pour détailler l'examen sélectionné */}
      <Drawer
        title="Exam Details"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
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
              <Text strong style={{ color: selectedExam.result === 'Pass' ? 'green' : 'red' }}>
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
};

// Correction : envelopper la page dans MainLayout via getLayout
ExamDashboardResults.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ExamDashboardResults;
