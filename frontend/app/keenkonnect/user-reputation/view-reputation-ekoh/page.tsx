'use client';
import React from 'react';
import { NextPage } from 'next';
import { Card, Statistic, Row, Col, List, Typography, Divider } from 'antd';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout'; // Assurez-vous que ce chemin est correct

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

const ViewReputationEkoh: NextPage = () => {
  // Données simulées pour l'exemple
  const reputation = {
    ekohScore: 1234,
    smartVoteWeight: 75, // exprimé en pourcentage

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
      {/* Section récapitulative des scores */}
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

      {/* Section Graphique */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card title="Expertise Contributions">
            {/* Ici vous intégrerez un pie chart pour visualiser la répartition des contributions */}
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
            {/* Ici vous intégrerez une courbe de tendance illustrant l’évolution du score dans le temps */}
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

      {/* Liste d'expertise */}
      <Title level={4}>Expertise Areas & Weights</Title>
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

      {/* Achèvements et badges */}
      <Title level={4}>Achievements & Badges</Title>
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

// Correction : envelopper la page dans MainLayout

  return <MainLayout>{page}</MainLayout>;

export default ViewReputationEkoh;
