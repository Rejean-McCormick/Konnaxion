// File: /pages/konnected/teams-collaboration/my-teams.tsx
'use client';
import React from 'react';
import { NextPage } from 'next';
import { Table, Button, Avatar, List, Menu, Dropdown, Typography, Space } from 'antd';
import { SettingOutlined, DownOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Text, Title } = Typography;

// Interface pour définir la structure d'un membre d'équipe
interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

// Interface pour définir la structure d'une équipe
interface Team {
  id: string;
  teamName: string;
  role: 'Leader' | 'Member';
  membersCount: number;
  // Quelques dernières activités à afficher en aperçu
  recentActivity: string[];
  // Liste détaillée des membres de l'équipe
  roster: TeamMember[];
}

// Exemple de données simulées pour les équipes de l'utilisateur
const teamsData: Team[] = [
  {
    id: 'team1',
    teamName: 'Alpha Innovators',
    role: 'Leader',
    membersCount: 5,
    recentActivity: [
      'John joined the team',
      'Meeting scheduled for 14:00',
      'Project milestone completed'
    ],
    roster: [
      { id: 'm1', name: 'John Doe', role: 'Member', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
      { id: 'm2', name: 'Alice Smith', role: 'Member', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
      { id: 'm3', name: 'Bob Johnson', role: 'Member', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
      { id: 'm4', name: 'Eve Davis', role: 'Member', avatar: 'https://randomuser.me/api/portraits/women/4.jpg' },
      { id: 'm5', name: 'Charlie Brown', role: 'Leader', avatar: 'https://randomuser.me/api/portraits/men/5.jpg' },
    ],
  },
  {
    id: 'team2',
    teamName: 'Beta Coders',
    role: 'Member',
    membersCount: 8,
    recentActivity: [
      'New repository added',
      'Bug fixes deployed',
      'Code review completed'
    ],
    roster: [
      { id: 'm6', name: 'Diana Prince', role: 'Leader', avatar: 'https://randomuser.me/api/portraits/women/6.jpg' },
      { id: 'm7', name: 'Bruce Wayne', role: 'Member', avatar: 'https://randomuser.me/api/portraits/men/7.jpg' },
      { id: 'm8', name: 'Clark Kent', role: 'Member', avatar: 'https://randomuser.me/api/portraits/men/8.jpg' },
      // ... autres membres
    ],
  },
  // Ajoutez d'autres équipes si besoin...
];

const TeamsCollaboration: NextPage = () => {
  // Définition du menu d'actions pour une équipe, disponible uniquement si l'utilisateur est leader
  const teamActionsMenu = (
    <Menu>
      <Menu.Item key="settings">
        <a href="#">Manage Team Settings</a>
      </Menu.Item>
      <Menu.Item key="invite">
        <a href="#">Invite New Member</a>
      </Menu.Item>
    </Menu>
  );

  // Colonnes du tableau de liste des équipes
  const columns = [
    {
      title: 'Team Name',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (text: string, record: Team) => (
        <Space>
          <span>{text}</span>
          {record.role === 'Leader' && (
            <Text type="success" strong>
              (Leader)
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Members',
      dataIndex: 'membersCount',
      key: 'membersCount',
    },
    {
      title: 'Recent Activity',
      dataIndex: 'recentActivity',
      key: 'recentActivity',
      render: (activities, row) => (
        <List
          dataSource={activities.slice(0, 2) ?? []} // Afficher les 2 dernières activités en aperçu
          renderItem={(activity) => (
            <List.Item style={{ padding: 0 }}>
              <Text type="secondary">{activity}</Text>
            </List.Item>
          )}
          size="small"
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Team) =>
        record.role === 'Leader' ? (
          <Dropdown overlay={teamActionsMenu}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                Actions <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        ) : null,
    },
  ];

  // Fonction de rendu pour la zone détaillée (row expansion)
  const expandedRowRender = (record: Team) => {
    return (
      <div style={{ padding: '16px 24px', background: '#fafafa' }}>
        <Title level={5}>Team Roster</Title>
        <List
          grid={{ gutter: 16, column: 4 }}
          dataSource={record.roster ?? []}
          renderItem={(member: TeamMember) => (
            <List.Item>
              <Space direction="vertical" align="center">
                <Avatar src={member.avatar} size={48} />
                <Text>{member.name}</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {member.role}
                </Text>
              </Space>
            </List.Item>
          )}
        />
        <br />
        <Title level={5}>Recent Activity Log</Title>
        <List
          dataSource={record.recentActivity ?? []}
          renderItem={(activity) => (
            <List.Item>
              <Text>{activity}</Text>
            </List.Item>
          )}
          size="small"
        />
      </div>
    );

  return (
    <PageContainer title="My Teams">
      <div style={{ marginBottom: 24, textAlign: 'right' }}>
        <Button
          type="primary"
          icon={<UsergroupAddOutlined />}
          href="/konnected/teams-collaboration/team-builder"
        >
          Team Builder
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={teamsData}
        rowKey="id"
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 5 }}
        // Mise en évidence des équipes où l'utilisateur est Leader
        rowClassName={(record: Team) => (record.role === 'Leader' ? 'team-leader-row' : '')}
      />
      <style jsx>{`
        .team-leader-row {
          background-color: #f6ffed;
        }
      `}</style>
    </PageContainer>
  );


  return <MainLayout>{page}</MainLayout>;

export default TeamsCollaboration;
}}
