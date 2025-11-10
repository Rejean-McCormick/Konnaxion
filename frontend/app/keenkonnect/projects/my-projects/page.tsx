'use client';

import React, { useMemo, useState } from 'react';
import { Table, Card, Button, Row, Col, Select, Typography, Divider, Space, Tag } from 'antd';
import { EyeOutlined, EditOutlined, RocketOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

type ProjectStatus = 'draft' | 'active' | 'archived';

interface Project {
  id: string;
  name: string;
  owner: string;
  members: number;
  status: ProjectStatus;
  createdAt: string; // ISO date string
}

export default function MyProjectsPage(): JSX.Element {
  const router = useRouter();

  // TODO: remplacez par vos données réelles (fetch/SWR, etc.)
  const [projects] = useState<Project[]>([
    { id: 'p-1', name: 'Sustainable Plastics', owner: 'Alice', members: 8, status: 'active', createdAt: '2025-08-01' },
    { id: 'p-2', name: 'AI Team Matching', owner: 'Bob', members: 5, status: 'draft', createdAt: '2025-09-15' },
    { id: 'p-3', name: 'Energy Dashboard', owner: 'Clara', members: 12, status: 'archived', createdAt: '2025-02-10' },
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

  const columns: ColumnsType<Project> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (value: string, record: Project): React.ReactNode => (
        <Space>
          <Text strong>{value}</Text>
          <Tag>{record.members} members</Tag>
        </Space>
      ),
    },
    {
      title: 'Owner',
      dataIndex: 'owner',
      key: 'owner',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (value: ProjectStatus): React.ReactNode => <Tag>{value}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Project): React.ReactNode => (
        <Space>
          <Button icon={<EyeOutlined />} onClick={() => handleView(record.id)}>
            View
          </Button>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record.id)}>
            Edit
          </Button>
          <Button type="primary" icon={<RocketOutlined />} onClick={() => handleLaunch(record.id)}>
            Launch
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>My Projects</Title>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/keenkonnect/projects/create-new-project')}
          >
            Create New Project
          </Button>
        </Col>
      </Row>

      <Divider />

      <Card bordered={false}>
        <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Text>Status:</Text>
          </Col>
          <Col>
            <Select<ProjectStatus | 'all'>
              value={statusFilter}
              onChange={(v: ProjectStatus | 'all') => setStatusFilter(v)}
              style={{ width: 180 }}
            >
              <Select.Option value="all">All</Select.Option>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="archived">Archived</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table<Project>
          rowKey={(record: Project) => record.id}
          dataSource={filtered}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
