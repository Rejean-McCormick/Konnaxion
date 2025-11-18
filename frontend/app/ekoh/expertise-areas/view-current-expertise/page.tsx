'use client'

// app/ekoh/expertise-areas/view-current-expertise/page.tsx
import React from 'react';
import Head from 'next/head';
import { Card, List, Progress, Tag } from 'antd';
import EkohPageShell from '@/app/ekoh/EkohPageShell';

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

export default function ViewCurrentExpertise(): JSX.Element {
  return (
    <>
      <Head>
        <title>Expertise Areas</title>
        <meta
          name="description"
          content="View your recognized expertise areas along with proficiency levels and contribution details."
        />
      </Head>

      <EkohPageShell
        title="Expertise Areas"
        subtitle="Overview of your recognized domains, proficiency levels, and contributions."
      >
        <Card className="mb-6">
          <List
            itemLayout="vertical"
            dataSource={expertiseData ?? []}
            renderItem={(item) => (
              <List.Item key={item.id}>
                <List.Item.Meta
                  title={
                    <span>
                      {item.domain}{' '}
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
      </EkohPageShell>
    </>
  );
}
