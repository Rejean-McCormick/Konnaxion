'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button, Empty, Modal, Space, Table, Tag, Typography, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';

const { Title, Paragraph } = Typography;

type LearningPathStatus = 'Draft' | 'Published' | 'Archived';

export interface LearningPath {
  id: string;
  title: string;
  description?: string;
  createdAt: string; // ISO string
  modulesCount: number;
  learnersCount: number;
  status: LearningPathStatus;
}

export default function Page() {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading] = useState<boolean>(false);

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Delete this learning path?',
      content:
        'This action cannot be undone. If this path is assigned to learners, consider archiving instead.',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        setPaths(prev => prev.filter(p => p.id !== id));
        message.success('Learning path deleted');
      },
    });
  };

  const columns: ColumnsType<LearningPath> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: LearningPath) => (
        <Link href={`/konnected/learning-paths/manage-existing-paths/${record.id}`}>
          {text}
        </Link>
      ),
    },
    {
      title: 'Modules',
      dataIndex: 'modulesCount',
      key: 'modulesCount',
      width: 110,
      align: 'right',
    },
    {
      title: 'Learners',
      dataIndex: 'learnersCount',
      key: 'learnersCount',
      width: 120,
      align: 'right',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (iso: string) => new Date(iso).toLocaleDateString(),
      width: 140,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: LearningPathStatus) => {
        const color =
          status === 'Published' ? 'green' : status === 'Draft' ? 'gold' : 'default';
        return <Tag color={color}>{status}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 170,
      render: (_: unknown, record: LearningPath) => (
        <Space>
          <Link href={`/konnected/learning-paths/manage-existing-paths/${record.id}/edit`}>
            <Button icon={<EditOutlined />} type="link">
              Edit
            </Button>
          </Link>
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Manage Existing Paths">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <div />
        <Link href="/konnected/learning-paths/create-learning-path">
          <Button type="primary" icon={<PlusOutlined />}>
            Create Path
          </Button>
        </Link>
      </div>

      <Title level={4} style={{ marginBottom: 8 }}>Manage Existing Paths</Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        Review, edit, archive or delete learning paths. Published paths affect learners currently
        enrolled.
      </Paragraph>

      {paths.length > 0 ? (
        <Table<LearningPath>
          rowKey="id"
          columns={columns}
          dataSource={paths}
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 900 }}
        />
      ) : (
        <Empty description="No learning paths found.">
          <Link href="/konnected/learning-paths/create-learning-path">
            <Button type="primary">Create New Path</Button>
          </Link>
        </Empty>
      )}
    </PageContainer>
  );
}
