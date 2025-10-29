'use client'

// File: /pages/keenkonnect/ai-team-matching/my-matches.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import { Tabs, List, Button, Badge } from 'antd';
import PageContainer from '@/components/PageContainer'; // Composant contenant le header et le layout global

// Définition d'un type pour représenter un match
interface Match {
  id: string;
  name: string;
  matchScore: number; // Pourcentage de match par exemple
  commonInterests: string; // Chaîne résumant les intérêts ou points communs
  new?: boolean; // Flag indiquant un nouveau match pour ajouter un badge
}

// Exemple de données en local pour les "Team Matches"
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
  // Ajoutez d'autres données selon les besoins
];

// Exemple de données en local pour les "Partner Matches" (collaborateurs individuels)
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
  // Ajoutez d'autres données si nécessaire
];

const { TabPane } = Tabs;

const MyMatchesPage: NextPage = () => {
  // On peut utiliser un state pour gérer l'onglet actif si des traitements spécifiques doivent être appliqués
  const [activeTab, setActiveTab] = useState<string>('team');

  // Fonction de rendu générique pour un élément de la liste
  const renderMatchItem = (item: Match) => (
    <List.Item
      key={item.id}
      actions={[
        // Action « Connect » pour démarrer une interaction
        <Button type="primary" key="connect">Connect</Button>,
        // Action pour consulter le profil ou l'équipe
        <Button key="view">View Profile/Team</Button>,
      ]}
    >
      <List.Item.Meta
        // Le titre inclut éventuellement un Badge si le match est récent
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
    // Le PageContainer gère la structure globale et le header de la page
    <PageContainer title="My Matches">
      <Tabs defaultActiveKey="team" onChange={setActiveTab}>
        <TabPane
          // Intitulé de l'onglet Team Matches avec possibilité d'y intégrer un badge de notification si besoin
          tab="Team Matches"
          key="team"
        >
          <List
            itemLayout="horizontal"
            dataSource={teamMatches}
            renderItem={renderMatchItem}
          />
        </TabPane>
        <TabPane
          tab="Partner Matches"
          key="partner"
        >
          <List
            itemLayout="horizontal"
            dataSource={partnerMatches}
            renderItem={renderMatchItem}
          />
        </TabPane>
      </Tabs>
    </PageContainer>
  );
};

// Si votre projet utilise une méthode de layout global via getLayout (par exemple dans _app.tsx), vous pouvez l'intégrer ainsi :
MyMatchesPage.getLayout = function getLayout(page: React.ReactNode) {
  // MainLayout est le layout global qui intègre header, sidebar, etc.
  // Assurez-vous de l'importer depuis le dossier correspondant (par ex. '@/layout-components/MainLayout')
  // Exemple :
  // return <MainLayout>{page}</MainLayout>;
  return page; // Pour l'exemple, on retourne la page directement
};

export default MyMatchesPage;
