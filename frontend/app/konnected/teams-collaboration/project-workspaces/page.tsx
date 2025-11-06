'use client';

// File: app/konnected/teams-collaboration/project-workspaces/page.tsx
import React from 'react';
import { Table, Button, Tag, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

// Workspace data shape
interface Workspace {
  id: string;
  projectName: string;
  teamName: string;
  status: 'Active' | 'Inactive';
  isLaunched: boolean;
  onlineMembers: number;
  userRole: 'Leader' | 'Member';
}

// Example data
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

export default function ProjectWorkspacesPage() {
  const router = useRouter(); // fixed: create router once at top level (rules of hooks)

  const handleWorkspaceAction = (workspace: Workspace) => {
    if (!workspace.isLaunched && workspace.userRole === 'Leader') {
      // Example: launch action
      // TODO: call API then refresh or navigate
      message.success(`Workspace ${workspace.projectName} launched successfully.`);
      return;
    }
    // Navigate to workspace
    router.push(`/konnected/teams-collaboration/project-workspaces/${workspace.id}`);

  const columns: ColumnsType<Workspace> = [
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
      render: (status: Workspace['status']) =>
        status === 'Active' ? <Tag color="green">Active</Tag> : <Tag color="volcano">Inactive</Tag>,
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
      render: (_: unknown, record: Workspace) => {
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
      <Table columns={columns} dataSource={workspaceData} rowKey="id" pagination={{ pageSize: 5 }} />
    </PageContainer>
  );
}

/*
Notes:
- Removed NextPage type and legacy static getLayout. In the App Router, use a layout.tsx file
  in this route segment if you need a layout wrapper.
- Fixed rule-of-hooks violation by moving useRouter() to the component top level.
- Removed unused Typography/Title import.
*/
