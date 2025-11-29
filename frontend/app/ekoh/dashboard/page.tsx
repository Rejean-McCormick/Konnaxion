// FILE: frontend/app/ekoh/dashboard/page.tsx
'use client';

// app/ekoh/dashboard/page.tsx
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Card, Statistic, Row, Col, Tabs } from 'antd';
import type { TabsProps } from 'antd';
import LineChart from '@/components/dashboard-components/LineChart';
import EkohPageShell from '@/app/ekoh/EkohPageShell';

type TrendPoint = { time: string; score: number };

const EkohDashboard = (): JSX.Element => {
  // Simulated user metrics
  const [ekohScore] = useState<number>(80);
  const [smartVoteWeight] = useState<number>(70);
  const [badgesEarned] = useState<number>(12);

  // Trend data (Ekoh score over time)
  const [trendData, setTrendData] = useState<TrendPoint[]>([
    { time: '08:00', score: 70 },
    { time: '10:00', score: 72 },
    { time: '12:00', score: 75 },
    { time: '14:00', score: 78 },
    { time: '16:00', score: 80 },
    { time: '18:00', score: 82 },
    { time: '20:00', score: 80 },
  ]);

  // Notable achievements and recent contributions (mock data)
  const notableAchievements: string[] = [
    'Reached Expert Level 5',
    'Highest vote weight: 78%',
    'Awarded "Community Champion" badge',
  ];

  const recentContributions: string[] = [
    'Voted on Economic Reform Proposal',
    'Commented on Climate Policy Debate',
    'Shared article on Smart Voting Impact',
  ];

  // Optional simulation to refresh the trend chart
  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
      const newScore = 70 + Math.floor(Math.random() * 20);

      setTrendData((prev) => [...prev.slice(-6), { time: newTime, score: newScore }]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const tabItems: TabsProps['items'] = [
    {
      key: 'overview',
      label: 'Overview',
      children: (
        <p>
          This section provides an overall summary of your reputation, voting influence, expertise,
          and badges.
        </p>
      ),
    },
    {
      key: 'votingInfluence',
      label: 'Voting Influence',
      children: (
        <p>
          Detailed view on your Smart Vote weight and how it affects overall decisions.
        </p>
      ),
    },
    {
      key: 'expertise',
      label: 'Expertise',
      children: <p>Breakdown of your expertise areas and performance therein.</p>,
    },
    {
      key: 'badges',
      label: 'Badges',
      children: <p>Review your earned badges and achievements in detail.</p>,
    },
  ];

  return (
    <>
      <Head>
        <title>Ekoh Dashboard</title>
        <meta
          name="description"
          content="Overview of your reputation and influence in the Ekoh system."
        />
      </Head>

      <EkohPageShell
        title="Ekoh dashboard"
        subtitle="Overview of your reputation, voting influence, expertise, and badges."
      >
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
          <LineChart
            data={trendData.map((item) => ({
              time: item.time,
              value: item.score,
            }))}
          />
        </Card>

        {/* Detailed views tabs (Ant Design `items` API) */}
        <Card className="mb-6">
          <Tabs defaultActiveKey="overview" items={tabItems} />
        </Card>

        {/* Achievements & Recent Contributions */}
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Card title="Notable Achievements" className="mb-6">
              <ul>
                {notableAchievements.map((achievement) => (
                  <li key={achievement}>{achievement}</li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card title="Recent Contributions" className="mb-6">
              <ul>
                {recentContributions.map((contribution) => (
                  <li key={contribution}>{contribution}</li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>
      </EkohPageShell>
    </>
  );
};

export default EkohDashboard;
