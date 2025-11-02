'use client'

// File: /pages/konnected/learning-paths/manage-existing-paths.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import {
  Table,
  Button,
  Modal,
  Typography,
  Input,
  Space,
  Empty,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title } = Typography;
const { Search } = Input;

interface LearningPath {
  id: string;
  title: string;
  lastUpdated: string;
  status: 'Published' | 'Draft';
}

const initialPaths: LearningPath[] = [
  {
    id: '1',
    title: 'Introduction to Programming',
    lastUpdated: '2023-09-15',
    status: 'Published',
  },
  {
    id: '2',
    title: 'Advanced Web Development',
    lastUpdated: '2023-08-10',
    status: 'Draft',
  },
  // Ajoutez d'autres parcours selon les besoins
];

const ManageExistingPaths: NextPage = () => {
  const [paths, setPaths] = useState<LearningPath[]>(initialPaths);
  const [searchText, setSearchText] = useState<string>('');
  
  // Filtrage des parcours selon le texte de recherche
  const filteredPaths = paths.filter((path) =>
    path.title.toLowerCase().includes(searchText.toLowerCase())
  );

  // Gestion de la suppression d'un parcours
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Confirm Deletion',
      content: 'Are you sure you want to delete this learning path?',
      okType: 'danger',
      onOk: () => {
        setPaths(paths.filter((path) => path.id !== id));
        message.success('Learning path deleted successfully');
      },
    });
  };

  // Colonnes du tableau
  const columns = [
    {
      title: 'Path Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Last Updated',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: LearningPath) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            type="link"
            onClick={() => {
              // Redirection vers la page d'édition (ex: /learning-paths/edit/[id])
              window.location.href = `/learning-paths/edit/${record.id}`;
            }}
          >
            Edit
          </Button>
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
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Search
          placeholder="Search by path name"
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} href="/learning-paths/create">
          Create New Path
        </Button>
      </div>

      {filteredPaths.length > 0 ? (
        <Table
          dataSource={filteredPaths}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      ) : (
        <Empty description="No learning paths found.">
          <Button type="primary" href="/learning-paths/create">
            Create New Path
          </Button>
        </Empty>
      )}
    </PageContainer>
  );
};

ManageExistingPaths.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ManageExistingPaths;
