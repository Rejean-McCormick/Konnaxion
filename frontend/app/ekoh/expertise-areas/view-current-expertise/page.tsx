'use client'

// pages/ekoh/expertise-areas/view-current-expertise/index.tsx
import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, List, Progress, Tag, Typography } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title } = Typography;

// Exemple de données simulées pour l'expertise de l'utilisateur
interface Expertise {
  id: string;
  domain: string;
  proficiency: number; // en pourcentage
  contributions: number;
  lastUpdated: string; // format ISO ou date formatée
}

const expertiseData: Expertise[] = [
  {
    id: '1',
    domain: 'Economy',
    proficiency: 80,
    contributions: 45,
    lastUpdated: '2023-08-28',
  },
  {
    id: '2',
    domain: 'Politics',
    proficiency: 65,
    contributions: 30,
    lastUpdated: '2023-08-25',
  },
  {
    id: '3',
    domain: 'Technology',
    proficiency: 75,
    contributions: 38,
    lastUpdated: '2023-08-27',
  },
];

const ViewCurrentExpertise: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  return (
    <>
      <Head>
        <title>Expertise Areas</title>
        <meta name="description" content="View your recognized expertise areas along with proficiency levels and contribution details." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de la page */}
        <Title level={2}>Expertise Areas</Title>

        {/* Liste des domaines d'expertise */}
        <Card className="mb-6">
          <List
            itemLayout="vertical"
            dataSource={expertiseData}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  title={
                    <span>
                      {item.domain}{" "}
                      <Tag color="blue">Proficiency: {item.proficiency}%</Tag>
                    </span>
                  }
                  description={
                    <span>
                      Contributions: {item.contributions} | Last Updated: {item.lastUpdated}
                    </span>
                  }
                />
                <Progress percent={item.proficiency} status="active" />
              </List.Item>
            )}
          />
        </Card>
      </div>
    </>
  );



export default ViewCurrentExpertise;
