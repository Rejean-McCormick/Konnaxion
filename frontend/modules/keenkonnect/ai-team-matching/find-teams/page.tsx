'use client'

// pages/keenkonnect/ai-team-matching/find-teams/index.tsx
import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, List, Input, Select, Button, Drawer, Row, Col, Tag, Divider } from 'antd';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;

interface Team {
  id: string;
  name: string;
  description: string;
  matchReason: string;
  domain: string;
  teamSize: number;
  isOpen: boolean;
  members: string[]; // liste des membres ou noms pour affichage dans le Drawer
}

// Exemple de données simulées pour les équipes recommandées
const sampleTeams: Team[] = [
  {
    id: '1',
    name: 'AI Innovators',
    description: 'A team focused on cutting-edge AI projects and research.',
    matchReason: 'Your skills in AI match this project’s needs.',
    domain: 'Technology',
    teamSize: 5,
    isOpen: true,
    members: ['Alice', 'Bob', 'Charlie'],
  },
  {
    id: '2',
    name: 'Data Wizards',
    description: 'Experts in data science and machine learning working on real-world challenges.',
    matchReason: 'Your expertise in data analytics is a perfect fit.',
    domain: 'Data Science',
    teamSize: 8,
    isOpen: false,
    members: ['Diana', 'Edward', 'Fiona', 'George'],
  },
  {
    id: '3',
    name: 'Robotics R&D',
    description: 'A collaborative group diving into the robotics innovations.',
    matchReason: 'Your background in robotics aligns with the team’s focus.',
    domain: 'Engineering',
    teamSize: 6,
    isOpen: true,
    members: ['Hugo', 'Ivy', 'Jack'],
  },
];

const FindTeams: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  
  // États pour la recherche et les filtres
  const [searchText, setSearchText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedTeamSize, setSelectedTeamSize] = useState<string>('All');
  
  // État pour le Drawer et la sélection d'équipe
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  // Filtrage des équipes en fonction des critères
  const filteredTeams = useMemo(() => {
    return sampleTeams.filter(team => {
      const matchesSearch = searchText === '' || team.name.toLowerCase().includes(searchText.toLowerCase());
      const matchesDomain = selectedDomain === 'All' || team.domain === selectedDomain;
      const matchesTeamSize =
        selectedTeamSize === 'All' ||
        (selectedTeamSize === 'Small' && team.teamSize < 6) ||
        (selectedTeamSize === 'Medium' && team.teamSize >= 6 && team.teamSize <= 10) ||
        (selectedTeamSize === 'Large' && team.teamSize > 10);
      return matchesSearch && matchesDomain && matchesTeamSize;
    });
  }, [searchText, selectedDomain, selectedTeamSize]);
  
  // Ouvrir le Drawer avec les détails d'une équipe
  const openDrawer = (team: Team) => {
    setSelectedTeam(team);
    setDrawerVisible(true);
  };

  // Fermer le Drawer
  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedTeam(null);
  };

  return (
    <>
      <Head>
        <title>Find Teams</title>
        <meta name="description" content="Discover team suggestions matched to your skills and interests using our AI-driven interface." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête */}
        <h1 className="text-2xl font-bold mb-4">Find Teams</h1>
        
        {/* Barre de recherche et filtres */}
        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Search placeholder="Search teams..." allowClear onSearch={value => setSearchText(value)} />
          </Col>
          <Col xs={24} sm={8}>
            <Select defaultValue="All" style={{ width: '100%' }} onChange={value => setSelectedDomain(value)}>
              <Option value="All">All Domains</Option>
              <Option value="Technology">Technology</Option>
              <Option value="Data Science">Data Science</Option>
              <Option value="Engineering">Engineering</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8}>
            <Select defaultValue="All" style={{ width: '100%' }} onChange={value => setSelectedTeamSize(value)}>
              <Option value="All">All Sizes</Option>
              <Option value="Small">Small (&lt; 6)</Option>
              <Option value="Medium">Medium (6-10)</Option>
              <Option value="Large">Large (&gt; 10)</Option>
            </Select>
          </Col>
        </Row>
        
        <Divider />
        
        {/* Liste de suggestions d'équipes */}
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3 }}
          dataSource={filteredTeams}
          renderItem={(team: Team) => (
            <List.Item key={team.id}>
              <Card
                hoverable
                title={team.name}
                extra={
                  team.isOpen ? (
                    <Tag color="green">Open</Tag>
                  ) : (
                    <Tag color="volcano">Approval Needed</Tag>
                  )
                }
              >
                <p>{team.description}</p>
                <p style={{ fontStyle: 'italic', color: '#888' }}>Match: {team.matchReason}</p>
                <Button type="primary" onClick={() => openDrawer(team)}>
                  View Team
                </Button>
              </Card>
            </List.Item>
          )}
        />
        
        {/* Drawer pour détails de l'équipe */}
        <Drawer
          title={selectedTeam?.name}
          placement="right"
          width={400}
          onClose={closeDrawer}
          open={drawerVisible}
        >
          {selectedTeam && (
            <div>
              <p><strong>Description:</strong> {selectedTeam.description}</p>
              <p><strong>Domain:</strong> {selectedTeam.domain}</p>
              <p><strong>Team Size:</strong> {selectedTeam.teamSize}</p>
              <p><strong>Members:</strong> {selectedTeam.members.join(', ')}</p>
              <Divider />
              <Button type="primary" onClick={() => {
                // Simulation d'une demande d'adhésion
                // Vous pouvez implémenter ici la logique réelle de demande.
                closeDrawer();
              }}>
                Request to Join
              </Button>
            </div>
          )}
        </Drawer>
      </div>
    </>
  );
};

FindTeams.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default FindTeams;
