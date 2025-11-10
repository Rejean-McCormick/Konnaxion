// app/konnected/certifications/exam-preparation/page.tsx
'use client';

import React from 'react';
import {
  Card,
  List,
  Button,
  Steps,
  Progress,
  Alert,
  Typography,
  Row,
  Col,
} from 'antd';
import { CheckCircleTwoTone, ArrowRightOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;
const { Step } = Steps;

interface Module {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
}

const studyModules: Module[] = [
  { id: 'module1', title: 'Introduction to Certification Concepts', completed: true, progress: 100 },
  { id: 'module2', title: 'Advanced Topics and Best Practices', completed: false, progress: 50 },
  { id: 'module3', title: 'Practical Applications and Case Studies', completed: false, progress: 20 },
  { id: 'module4', title: 'Exam Strategies and Tips', completed: false, progress: 0 },
];

const studyPlanSteps = [
  'Read and review study materials',
  'Complete interactive practice exercises',
  'Attempt a practice quiz',
  'Review feedback and focus on weaknesses',
];

export default function ExamPreparationPage() {
  const overallProgress =
    studyModules.reduce((acc, mod) => acc + mod.progress, 0) / studyModules.length;

  const handleStartQuiz = () => {
    console.log('Starting practice exam...');
  };

  return (
    <PageContainer title="Exam Preparation">
      <Row gutter={[24, 24]}>
        {/* Study Modules Overview */}
        <Col xs={24} md={12}>
          <Card title="Study Modules Overview">
            <List
              itemLayout="horizontal"
              dataSource={studyModules ?? []}
              renderItem={(module: Module) => (
                <List.Item
                  actions={[
                    <Button type="link" key="view" icon={<ArrowRightOutlined />}>
                      View Content
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <span>
                        {module.title}{' '}
                        {module.completed && <CheckCircleTwoTone twoToneColor="#52c41a" />}
                      </span>
                    }
                    description={
                      <Text type="secondary">
                        {module.completed ? 'Completed' : `In progress: ${module.progress}%`}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Overall Progress + Plan */}
        <Col xs={24} md={12}>
          <Card title="Your Preparation Progress">
            <Text>Your overall progress:</Text>
            <Progress percent={Math.round(overallProgress)} status="active" />
            <br />
            <br />
            <Title level={5}>Recommended Study Plan</Title>
            <Steps direction="vertical" size="small" current={0}>
              {studyPlanSteps.map((step, index) => (
                <Step key={index} title={step} />
              ))}
            </Steps>
            <br />
            <Button type="primary" onClick={handleStartQuiz}>
              Start Practice Exam
            </Button>
          </Card>
        </Col>

        {/* Tips */}
        <Col xs={24}>
          <Alert
            message="Exam Tips: Remember to pace yourself, review your weak areas, and take breaks during your study sessions."
            type="info"
            showIcon
          />
        </Col>
      </Row>
    </PageContainer>
  );
}
