'use client'

// File: /pages/konnected/community-discussions/moderation.tsx
import React, { useState, useMemo } from 'react';
import { NextPage } from 'next';
import { Table, Tabs, Tag, Button, Space, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { TabPane } = Tabs;
const { confirm } = Modal;

// Interface pour une entrée de modération
interface ModerationItem {
  id: string;
  contentSnippet: string;
  author: string;
  reportReason: string; // pour les posts signalés
  date: string;
  status: 'Pending' | 'Approved' | 'Flagged';
  queue: 'Reported' | 'PendingApproval';
}

// Données fictives pour l'exemple
const dummyModerationItems: ModerationItem[] = [
  {
    id: '1',
    contentSnippet: 'Ce post contient des propos inappropriés sur...',
    author: 'John Doe',
    reportReason: 'Propos inappropriés',
    date: '2025-12-01 15:30',
    status: 'Pending',
    queue: 'Reported',
  },
  {
    id: '2',
    contentSnippet: "Nouvelle discussion sur les méthodes d'enseignement...",
    author: 'Alice Smith',
    reportReason: '',
    date: '2025-12-01 14:00',
    status: 'Pending',
    queue: 'PendingApproval',
  },
  {
    id: '3',
    contentSnippet: 'Ce thread a été signalé pour spam ou contenu indésirable.',
    author: 'Bob Johnson',
    reportReason: 'Spam',
    date: '2025-11-30 18:45',
    status: 'Pending',
    queue: 'Reported',
  },
  {
    id: '4',
    contentSnippet: 'Discussion ouverte sur la nouvelle réforme éducative...',
    author: 'Carol Lee',
    reportReason: '',
    date: '2025-12-01 16:20',
    status: 'Pending',
    queue: 'PendingApproval',
  },
];

const ModerationPage: NextPage = () => {
  // Onglet actif : "Reported" ou "PendingApproval"
  const [activeTab, setActiveTab] = useState<'Reported' | 'PendingApproval'>('Reported');

  // Filtrage des éléments selon l'onglet actif
  const filteredItems = useMemo(() => {
    return dummyModerationItems.filter(item => item.queue === activeTab);
  }, [activeTab]);

  // Gestion des actions pour une entrée de modération
  const handleApprove = (item: ModerationItem) => {
    message.success(`Content "${item.contentSnippet.substring(0, 20)}..." approved.`);
    // Ici, intégrez un appel API pour approuver l'élément
  };

  const handleFlagUser = (item: ModerationItem) => {
    message.warning(`User ${item.author} has been flagged/warned.`);
    // Intégrez ici la logique de signalement de l'utilisateur
  };

  const handleDelete = (item: ModerationItem) => {
    confirm({
      title: 'Confirmer la suppression',
      icon: <ExclamationCircleOutlined />,
      content: 'Êtes-vous sûr de vouloir supprimer ce contenu ? Cette action est irréversible.',
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk() {
        message.success(`Content "${item.contentSnippet.substring(0, 20)}..." deleted.`);
        // Intégrez ici la logique de suppression via API
      },
    });
  };

  // Définition des colonnes du tableau
  const columns = [
    {
      title: 'Content Snippet',
      dataIndex: 'contentSnippet',
      key: 'contentSnippet',
      render: (text: string) => <span>{text}</span>,
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: activeTab === 'Reported' ? 'Report Reason' : 'Note',
      dataIndex: 'reportReason',
      key: 'reportReason',
      render: (text: string) =>
        text ? <Tag color="volcano">{text}</Tag> : <Tag color="blue">Pending Approval</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) =>
        status === 'Approved' ? (
          <Tag color="green">Approved</Tag>
        ) : (
          <Tag color="orange">Pending</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: ModerationItem) => (
        <Space>
          {record.status === 'Pending' && (
            <Button size="small" type="primary" onClick={() => handleApprove(record)}>
              Approve
            </Button>
          )}
          <Button size="small" danger onClick={() => handleDelete(record)}>
            Delete
          </Button>
          {record.queue === 'Reported' && (
            <Button size="small" onClick={() => handleFlagUser(record)}>
              Flag User
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="Moderation">
      <Tabs
        defaultActiveKey="Reported"
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as 'Reported' | 'PendingApproval')}
        type="card"
        style={{ marginBottom: 24 }}
      >
        <TabPane tab="Reported Content" key="Reported" />
        <TabPane tab="Pending Approval" key="PendingApproval" />
      </Tabs>
      <Table
        columns={columns}
        dataSource={filteredItems}
        rowKey="id"
        pagination={{ pageSize: 5 }}
      />
    </PageContainer>
  );
};

ModerationPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default ModerationPage;
