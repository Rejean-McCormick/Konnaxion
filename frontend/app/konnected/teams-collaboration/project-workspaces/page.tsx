"use client";
// File: /pages/konnected/teams-collaboration/project-workspaces.tsx
import React from 'react';
import { NextPage } from 'next';
import { Table, Button, Tag, Typography, Space, message } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title } = Typography;

// Interface décrivant la structure d'un workspace
interface Workspace {
  id: string;
  projectName: string;
  teamName: string;
  status: 'Active' | 'Inactive';
  isLaunched: boolean;
  onlineMembers: number;
  userRole: 'Leader' | 'Member';
}

// Exemple de données de workspaces
const workspaceData: Workspace[] = [
  {
    id: '1',
    projectName: 'Project Alpha',
    teamName: 'Alpha Innovators',
    status: 'Active',
    isLaunched: true,
    onlineMembers: 4,
    userRole: 'Leader',
  },
  {
    id: '2',
    projectName: 'Project Beta',
    teamName: 'Beta Coders',
    status: 'Inactive',
    isLaunched: false,
    onlineMembers: 0,
    userRole: 'Member',
  },
  {
    id: '3',
    projectName: 'Project Gamma',
    teamName: 'Gamma Team',
    status: 'Active',
    isLaunched: true,
    onlineMembers: 2,
    userRole: 'Member',
  },
];

const ProjectWorkspaces: NextPage = () => {
  // Gestion de l'action sur un workspace
  const handleWorkspaceAction = (workspace: Workspace) => {
    const router = useRouter();
    if (!workspace.isLaunched && workspace.userRole === 'Leader') {
      // Pour un workspace non lancé accessible aux leaders, déclenchement de l'action de lancement
      console.log(`Launching workspace: ${workspace.projectName}`);
      // Par exemple, appeler une API puis rediriger ou mettre à jour l'état
      message.success(`Workspace ${workspace.projectName} lancé avec succès.`);
    } else {
      // Pour un workspace lancé, naviguer vers la page du workspace
      router.push(`/konnected/teams-collaboration/project-workspaces/${workspace.id}`);
    }
  };

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Workspace/Project Name',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: 'Team Name',
      dataIndex: 'teamName',
      key: 'teamName',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'Active' ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="volcano">Inactive</Tag>
        ),
    },
    {
      title: 'Online Members',
      dataIndex: 'onlineMembers',
      key: 'onlineMembers',
      render: (onlineMembers: number) => <span>{onlineMembers} online</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Workspace) => {
        let buttonLabel = '';
        if (!record.isLaunched && record.userRole === 'Leader') {
          buttonLabel = 'Launch Workspace';
        } else if (record.isLaunched) {
          buttonLabel = record.userRole === 'Leader' ? 'Open Workspace' : 'Join Workspace';
        } else {
          buttonLabel = 'Join Workspace';
        }
        return (
          <Button type="primary" onClick={() => handleWorkspaceAction(record)}>
            {buttonLabel}
          </Button>
        );
      },
    },
  ];

  return (
    <PageContainer title="Project Workspaces">
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => router.push('/konnected/teams-collaboration/launch-new-workspace')}
        >
          Launch New Workspace
        </Button>
      </Space>
      <Table
        columns={columns}
        dataSource={workspaceData}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </PageContainer>
  );
};

ProjectWorkspaces.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ProjectWorkspaces;
