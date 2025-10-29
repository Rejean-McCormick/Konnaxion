'use client'

// pages/ekoh/dashboard/index.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, Statistic, Row, Col, Tabs } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import LineChart from '@/components/dashboard-components/LineChart';

const { TabPane } = Tabs;

const EkohDashboard: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  // États simulant des données utilisateur
  const [ekohScore, setEkohScore] = useState<number>(80);
  const [smartVoteWeight, setSmartVoteWeight] = useState<number>(70);
  const [badgesEarned, setBadgesEarned] = useState<number>(12);

  // Données pour le graphique de tendance (Ekoh score over time)
  const [trendData, setTrendData] = useState<Array<{ time: string; score: number }>>([
    { time: '08:00', score: 70 },
    { time: '10:00', score: 72 },
    { time: '12:00', score: 75 },
    { time: '14:00', score: 78 },
    { time: '16:00', score: 80 },
    { time: '18:00', score: 82 },
    { time: '20:00', score: 80 },
  ]);

  // Notable achievements et recent contributions (données simulées)
  const notableAchievements = [
    'Reached Expert Level 5',
    'Highest vote weight: 78%',
    'Awarded "Community Champion" badge',
  ];
  const recentContributions = [
    'Voted on Economic Reform Proposal',
    'Commented on Climate Policy Debate',
    'Shared article on Smart Voting Impact',
  ];

  // Simulation d'actualisation du graphique (optionnelle)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simuler une mise à jour du score en ajoutant un nouveau point et en conservant les 7 derniers points
      const newTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newScore = 70 + Math.floor(Math.random() * 20);
      setTrendData(prev => [...prev.slice(-6), { time: newTime, score: newScore }]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Head>
        <title>Ekoh Dashboard</title>
        <meta name="description" content="Overview of your reputation and influence in the Ekoh system." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de la page */}
        <h1 className="text-2xl font-bold mb-4">Ekoh Dashboard</h1>

        {/* Overview cards */}
        <Row gutter={16} className="mb-6">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Ekoh Score" value={ekohScore} suffix="pts" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Smart Vote Weight" value={smartVoteWeight} suffix="%" />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic title="Badges Earned" value={badgesEarned} />
            </Card>
          </Col>
        </Row>

        {/* Reputation trend chart */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Reputation Trend Over Time</h2>
          {/* On transforme les données pour que le composant LineChart attende {time, value} */}
          <LineChart data={trendData.map(item => ({ time: item.time, value: item.score }))} />
        </Card>

        {/* Onglets pour les vues approfondies */}
        <Card className="mb-6">
          <Tabs defaultActiveKey="overview">
            <TabPane tab="Overview" key="overview">
              <p>This section provides an overall summary of your reputation, voting influence, expertise, and badges.</p>
            </TabPane>
            <TabPane tab="Voting Influence" key="votingInfluence">
              <p>Detailed view on your Smart Vote weight and how it affects overall decisions.</p>
            </TabPane>
            <TabPane tab="Expertise" key="expertise">
              <p>Breakdown of your expertise areas and performance therein.</p>
            </TabPane>
            <TabPane tab="Badges" key="badges">
              <p>Review your earned badges and achievements in detail.</p>
            </TabPane>
          </Tabs>
        </Card>

        {/* Achievements & Recent Contributions */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="Notable Achievements" className="mb-6">
              <ul>
                {notableAchievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Recent Contributions" className="mb-6">
              <ul>
                {recentContributions.map((contribution, index) => (
                  <li key={index}>{contribution}</li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

EkohDashboard.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default EkohDashboard;
