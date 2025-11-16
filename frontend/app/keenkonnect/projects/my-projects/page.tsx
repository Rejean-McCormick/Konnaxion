'use client';

import React, { useMemo, useState } from 'react';
import { Button, Typography, Space, Tag, Select, Dropdown, Progress } from 'antd';
import {
  EyeOutlined,
  EditOutlined,
  RocketOutlined,
  PlusOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useRouter } from 'next/navigation';
import usePageTitle from '@/hooks/usePageTitle';

const { Text } = Typography;

type ProjectStatus = 'draft' | 'active' | 'archived';

interface Project {
  id: string;
  name: string;
  owner: string;
  members: number;
  status: ProjectStatus;
  createdAt: string; // ISO date string
  progress: number; // 0–100
}

export default function MyProjectsPage(): JSX.Element {
  const router = useRouter();
  usePageTitle('KeenKonnect – My Projects');

  // TODO: remplacer par des données réelles (API / SWR, etc.)
  const [projects] = useState<Project[]>([
    {
      id: 'p-1',
      name: 'Sustainable Plastics',
      owner: 'Alice',
      members: 8,
      status: 'active',
      createdAt: '2025-08-01',
      progress: 72,
    },
    {
      id: 'p-2',
      name: 'AI Team Matching',
      owner: 'Bob',
      members: 5,
      status: 'draft',
      createdAt: '2025-09-15',
      progress: 35,
    },
    {
      id: 'p-3',
      name: 'Energy Dashboard',
      owner: 'Clara',
      members: 12,
      status: 'archived',
      createdAt: '2025-02-10',
      progress: 100,
    },
  ]);

  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const filtered: Project[] = useMemo(() => {
    if (statusFilter === 'all') return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const handleView = (id: string): void => {
    router.push(`/keenkonnect/projects/${id}`);
  };

  const handleEdit = (id: string): void => {
    router.push(`/keenkonnect/projects/${id}/edit`);
  };

  const handleLaunch = (id: string): void => {
    router.push(`/keenkonnect/projects/${id}/launch`);
  };

  const statusColors: Record<
    ProjectStatus,
    'default' | 'processing' | 'success' | 'warning' | 'error'
  > = {
    draft: 'default',
    active: 'success',
    archived: 'warning',
  };

  const columns: ProColumns<Project>[] = [
    {
      title: 'Project',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{record.name}</Text>
          <Space size="small">
            <Tag icon={<TeamOutlined />}>{record.members} members</Tag>
            <Text type="secondary">Owner: {record.owner}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: {
        draft: { text: 'Draft' },
        active: { text: 'Active' },
        archived: { text: 'Archived' },
      },
      render: (_, record) => (
        <Tag color={statusColors[record.status]}>{record.status}</Tag>
      ),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      width: 200,
      // IMPORTANT : on utilise (_, record) pour respecter la signature ProColumns
      render: (_, record) => (
        <Progress
          percent={record.progress}
          size="small"
          status={record.progress === 100 ? 'success' : 'active'}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'date',
    },
    {
      title: 'Actions',
      key: 'actions',
      valueType: 'option',
      render: (_, record) => [
        <Dropdown.Button
          key="actions"
          type="primary"
          icon={<RocketOutlined />}
          onClick={() => handleLaunch(record.id)}
          menu={{
            items: [
              {
                key: 'view',
                label: (
                  <span>
                    <EyeOutlined style={{ marginRight: 8 }} />
                    View
                  </span>
                ),
              },
              {
                key: 'edit',
                label: (
                  <span>
                    <EditOutlined style={{ marginRight: 8 }} />
                    Edit
                  </span>
                ),
              },
              {
                key: 'launch',
                label: (
                  <span>
                    <RocketOutlined style={{ marginRight: 8 }} />
                    Launch
                  </span>
                ),
              },
            ],
            onClick: ({ key }) => {
              if (key === 'view') {
                handleView(record.id);
              } else if (key === 'edit') {
                handleEdit(record.id);
              } else if (key === 'launch') {
                handleLaunch(record.id);
              }
            },
          }}
        >
          Launch
        </Dropdown.Button>,
      ],
    },
  ];

  return (
    <div>
      <ProTable<Project>
        rowKey="id"
        headerTitle="My Projects"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 10 }}
        search={false}
        options={false}
        cardBordered
        toolBarRender={() => [
          <Space key="filters" align="center">
            <Text>Status:</Text>
            <Select<ProjectStatus | 'all'>
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: 180 }}
            >
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="archived">Archived</Select.Option>
            </Select>
          </Space>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              router.push('/keenkonnect/projects/create-new-project')
            }
          >
            Create New Project
          </Button>,
        ]}
      />
    </div>
  );
}
