'use client'

// pages/ekoh/voting-influence/current-voting-weight/index.tsx
import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, Statistic, Row, Col, Typography, List, Divider } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Paragraph } = Typography;

// Données simulées pour le graphique comparatif
const weightComparisonData = [
  { category: 'Your Weight', weight: 70 },
  { category: 'Average Weight', weight: 50 },
  { category: 'Top Experts', weight: 90 },
];

// Données simulées pour les domaines à fort poids
const weightByDomain = [
  { domain: 'Economy', weight: '80%' },
  { domain: 'Politics', weight: '65%' },
  { domain: 'Technology', weight: '75%' },
];

const CurrentVotingWeight: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  // Poids de vote smart de l'utilisateur (exemple statique)
  const smartVoteWeight = 70; // par exemple en pourcentage

  return (
    <>
      <Head>
        <title>Current Voting Weight</title>
        <meta name="description" content="Overview of your current smart voting weight and comparison with averages." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de la page */}
        <Title level={2}>Current Voting Weight</Title>

        {/* Affichage proéminent du poids de vote */}
        <Card className="mb-6">
          <Row justify="center">
            <Col>
              <Statistic title="Smart Vote Weight" value={smartVoteWeight} suffix="%" />
            </Col>
          </Row>
        </Card>

        {/* Description explicative */}
        <Card className="mb-6">
          <Paragraph>
            Your Smart Vote weight represents your relative influence in collective decisions based on your Ekoh reputation.
            A higher percentage means that your vote carries more weight compared to the average user.
          </Paragraph>
        </Card>

        {/* Graphique comparatif */}
        <Card className="mb-6">
          <Title level={4}>Comparison with Others</Title>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={weightComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="weight" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Liste des domaines où le poids est élevé */}
        <Card className="mb-6">
          <Title level={4}>Highest Weight by Domain</Title>
          <List
            dataSource={weightByDomain}
            renderItem={(item) => (
              <List.Item>
                <strong>{item.domain}:</strong> {item.weight}
              </List.Item>
            )}
          />
        </Card>
      </div>
    </>
  );



export default CurrentVotingWeight;
