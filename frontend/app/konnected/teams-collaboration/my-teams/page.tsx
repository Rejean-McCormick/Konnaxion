/* eslint-disable react/jsx-key */
'use client';

import React, { useMemo, useState } from 'react';
import { Button, Dropdown, List, Space, Table, Typography, Avatar } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import type { MenuProps } from 'antd';
import { DownOutlined, UsergroupAddOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

const { Text } = Typography;

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
}

interface Team {
  id: string;
  name: string;
  project: string;
  members: TeamMember[];
  recentActivity: string[];
}

type TeamRow = {
  key: string;
  teamId: string;
  teamName: string;
  projectName: string;
  membersCount: number;
  roster: TeamMember[];
  recentActivity: string[];
};

const teamsData: Team[] = [
  {
    id: 't-1',
    name: 'Frontend Guild',
    project: 'Design System',
    members: [
      { id: 'u-1', name: 'John Doe', role: 'Lead' },
      { id: 'u-2', name: 'Alice Smith', role: 'Developer' },
      { id: 'u-3', name: 'Bob Johnson', role: 'Developer' },
      { id: 'u-4', name: 'Eve Davis', role: 'QA' },
      { id: 'u-5', name: 'Charlie Brown', role: 'Designer' },
    ],
    recentActivity: [
      'John joined the team',
      'Alice commented on PR #42',
      'Bob merged branch feature/layout'
    ],
  },
  {
    id: 't-2',
    name: 'Backend Core',
    project: 'API Platform',
    members: [
      { id: 'u-6', name: 'Diana Prince', role: 'Lead' },
      { id: 'u-7', name: 'Bruce Wayne', role: 'SRE' },
      { id: 'u-8', name: 'Clark Kent', role: 'Developer' },
    ],
    recentActivity: [
      'Diana created issue API-120',
      'Bruce deployed v2.3.1',
      'Clark fixed failing tests'
    ],
  },
];

const toRows = (input: Team[]): TeamRow[] =>
  input.map((t) => ({
    key: t.id,
    teamId: t.id,
    teamName: t.name,
    projectName: t.project,
    membersCount: t.members.length,
    roster: t.members,
    recentActivity: t.recentActivity,
  }));

export default function Page() {
  const [selectedTeamKeys, setSelectedTeamKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<TeamRow[]>(() => toRows(teamsData));

  const columns: ColumnsType<TeamRow> = [
    {
      title: 'Équipe',
      dataIndex: 'teamName',
      key: 'teamName',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">ID&nbsp;: {record.teamId}</Text>
        </Space>
      ),
    },
    {
      title: 'Projet',
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: 'Membres',
      dataIndex: 'roster',
      key: 'roster',
      render: (_: TeamMember[], record) => (
        <List
          dataSource={record.roster.slice(0, 3)}
          renderItem={(m: TeamMember) => (
            <List.Item style={{ paddingInline: 0 }} key={m.id}>
              <List.Item.Meta
                avatar={<Avatar>{m.name.charAt(0)}</Avatar>}
                title={<Text>{m.name}</Text>}
                description={<Text type="secondary">{m.role}</Text>}
              />
            </List.Item>
          )}
        />
      ),
    },
    {
      title: 'Activité récente',
      dataIndex: 'recentActivity',
      key: 'recentActivity',
      render: (activities: string[]) => (
        <List
          size="small"
          dataSource={activities.slice(0, 3)}
          renderItem={(msg) => <List.Item style={{ paddingInline: 0 }}>{msg}</List.Item>}
        />
      ),
      responsive: ['lg'],
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_: unknown, record) => {
        const onMenuClick: MenuProps['onClick'] = ({ key }) => {
          switch (key) {
            case 'view':
              // TODO: router.push(`/konnected/teams-collaboration/my-teams/${record.teamId}`);
              break;
            case 'invite':
              // TODO: ouvrir un modal d’invitation
              break;
            case 'archive':
              setData((prev) => prev.filter((r) => r.key !== record.key));
              break;
            default:
              break;
          }
        };

        const items: MenuProps['items'] = [
          { key: 'view', label: 'Voir l’équipe' },
          { key: 'invite', label: 'Inviter des membres' },
          { type: 'divider' },
          { key: 'archive', danger: true, label: 'Archiver' },
        ];

        return (
          <Dropdown menu={{ items, onClick: onMenuClick }} trigger={['click']}>
            <Button>
              Actions <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const rowSelection: TableProps<TeamRow>['rowSelection'] = {
    selectedRowKeys: selectedTeamKeys,
    onChange: (keys) => setSelectedTeamKeys(keys),
  };

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.teamName.localeCompare(b.teamName)),
    [data]
  );

  return (
    <PageContainer
      header={{
        title: 'Mes équipes',
        extra: [
          <Button key="new" type="primary" icon={<PlusOutlined />}>
            Nouvelle équipe
          </Button>,
          <Button key="invite" icon={<UsergroupAddOutlined />}>
            Inviter
          </Button>,
        ],
      }}
    >
      <Table<TeamRow>
        rowKey="key"
        size="middle"
        bordered
        columns={columns}
        dataSource={sortedData}
        rowSelection={rowSelection}
        pagination={{ pageSize: 8, showSizeChanger: false }}
        scroll={{ x: 900 }}
      />
    </PageContainer>
  );
}
