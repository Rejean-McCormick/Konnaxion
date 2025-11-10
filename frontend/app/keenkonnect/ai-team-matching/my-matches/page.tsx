// app/keenkonnect/ai-team-matching/my-matches/page.tsx
'use client';

import React, { useState } from 'react';
import { Tabs, List, Button, Badge } from 'antd';
import PageContainer from '@/components/PageContainer'; // Header + layout global (conteneur)

// Définition d'un type pour représenter un match
interface Match {
  id: string;
  name: string;
  matchScore: number;      // Pourcentage de match
  commonInterests: string; // Intérêts/points communs
  new?: boolean;           // Indique un nouveau match (pour le badge)
}

// Données locales : "Team Matches"
const teamMatches: Match[] = [
  {
    id: 'team1',
    name: 'Alpha Team',
    matchScore: 92,
    commonInterests: 'UI/UX, Backend, DevOps',
    new: true,
  },
  {
    id: 'team2',
    name: 'Beta Squad',
    matchScore: 85,
    commonInterests: 'Mobile, Frontend',
  },
];

// Données locales : "Partner Matches"
const partnerMatches: Match[] = [
  {
    id: 'partner1',
    name: 'Jean Dupont',
    matchScore: 88,
    commonInterests: 'Data Science, Machine Learning',
    new: true,
  },
  {
    id: 'partner2',
    name: 'Marie Curie',
    matchScore: 90,
    commonInterests: 'Research, AI Innovation',
  },
];

const { TabPane } = Tabs;

export default function MyMatchesPage() {
  // Onglet actif (si besoin de traitements spécifiques par onglet)
  const [activeTab, setActiveTab] = useState<string>('team');

  // Rendu d'un élément de la liste
  const renderMatchItem = (item: Match) => (
    <List.Item
      key={item.id}
      actions={[
        <Button type="primary" key="connect">Connect</Button>,
        <Button key="view">View Profile/Team</Button>,
      ]}
    >
      <List.Item.Meta
        title={
          <span>
            {item.name}
            {item.new && (
              <Badge count={'new'} style={{ backgroundColor: '#52c41a', marginLeft: 8 }} />
            )}
          </span>
        }
        description={`${item.matchScore}% de match - ${item.commonInterests}`}
      />
    </List.Item>
  );

  return (
    <PageContainer title="My Matches">
      <Tabs defaultActiveKey="team" onChange={setActiveTab}>
        <TabPane tab="Team Matches" key="team">
          <List
            itemLayout="horizontal"
            dataSource={teamMatches ?? []}
            renderItem={renderMatchItem}
          />
        </TabPane>
        <TabPane tab="Partner Matches" key="partner">
          <List
            itemLayout="horizontal"
            dataSource={partnerMatches ?? []}
            renderItem={renderMatchItem}
          />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
}
