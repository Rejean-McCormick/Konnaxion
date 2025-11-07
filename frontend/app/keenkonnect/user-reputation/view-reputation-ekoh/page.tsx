'use client';

import React from 'react';
import { Card, Statistic, Row, Col, List, Typography, Divider } from 'antd';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;

interface Expertise {
  id: string;
  name: string;
  weight: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
}

export default function ViewReputationEkoh(): JSX.Element {
  const reputation = {
    ekohScore: 1234,
    smartVoteWeight: 75, // percentage
  };

  const expertiseAreas: Expertise[] = [
    { id: '1', name: 'Frontend Development', weight: '30%' },
    { id: '2', name: 'Backend Development', weight: '25%' },
    { id: '3', name: 'UI/UX Design', weight: '20%' },
    { id: '4', name: 'Data Science', weight: '15%' },
    { id: '5', name: 'DevOps', weight: '10%' },
  ];

  const achievements: Achievement[] = [
    {
      id: 'a1',
      title: 'Top Contributor',
      description: 'Awarded for significant expertise contributions to the community.',
    },
    {
      id: 'a2',
      title: 'Innovation Leader',
      description: 'Recognized for innovative solutions and creative problem-solving.',
    },
  ];

  return (
    <PageContainer title="View Reputation (Ekoh)">
      {/* Score summary */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="Ekoh Score" value={reputation.ekohScore} />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card>
            <Statistic title="Smart Vote Weight" value={reputation.smartVoteWeight} suffix="%" />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Charts placeholders */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Expertise Contributions">
            <div
              style={{
                height: 200,
                textAlign: 'center',
                lineHeight: '200px',
                background: '#f0f2f5',
              }}
            >
              Pie Chart Placeholder
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card title="Score Trend">
            <div
              style={{
                height: 200,
                textAlign: 'center',
                lineHeight: '200px',
                background: '#f0f2f5',
              }}
            >
              Trend Line Chart Placeholder
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Expertise list */}
      <Title level={4}>Expertise Areas &amp; Weights</Title>
      <List
        itemLayout="horizontal"
        dataSource={expertiseAreas}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <List.Item.Meta title={item.name} description={`Weight: ${item.weight}`} />
          </List.Item>
        )}
      />

      <Divider />

      {/* Achievements */}
      <Title level={4}>Achievements &amp; Badges</Title>
      <List
        grid={{ gutter: 16, column: 2 }}
        dataSource={achievements}
        renderItem={(item) => (
          <List.Item key={item.id}>
            <Card title={item.title}>
              <Text>{item.description}</Text>
            </Card>
          </List.Item>
        )}
      />
    </PageContainer>
  );
}
