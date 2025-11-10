'use client';

import React, { useMemo, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import { Button, Table, Tabs, Tag, Space, Modal, message as antdMessage } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DeleteOutlined,
  FlagOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { TabPane } = Tabs;
const { confirm } = Modal;

type ModerationStatus = 'Pending' | 'Approved' | 'Flagged';
type ModerationQueue = 'Reported' | 'PendingApproval';

interface ModerationItem {
  id: string;
  contentSnippet: string;
  author: string;
  reportReason: string;
  date: string;
  status: ModerationStatus;
  queue: ModerationQueue;
}

const MOCK_ITEMS: ModerationItem[] = [
  {
    id: '1',
    contentSnippet: 'This is a reported post content...',
    author: 'User123',
    reportReason: 'Inappropriate language',
    date: '3h ago',
    status: 'Pending',
    queue: 'Reported',
  },
  {
    id: '2',
    contentSnippet: 'Another reported content snippet...',
    author: 'Member456',
    reportReason: 'Spam',
    date: '1 day ago',
    status: 'Pending',
    queue: 'Reported',
  },
  {
    id: '3',
    contentSnippet: 'Awaiting approval content...',
    author: 'Contributor789',
    reportReason: '',
    date: '2 days ago',
    status: 'Pending',
    queue: 'PendingApproval',
  },
];

export default function ModerationPage(): JSX.Element {
  const [activeTab, setActiveTab] = useState<ModerationQueue>('Reported');
  const [data, setData] = useState<ModerationItem[]>(MOCK_ITEMS);

  const filteredItems = useMemo<ModerationItem[]>(
    () => data.filter((item) => item.queue === activeTab),
    [activeTab, data],
  );

  const handleApprove = (record: ModerationItem) => {
    setData((prev) =>
      prev.map((item) =>
        item.id === record.id ? { ...item, status: 'Approved', queue: 'PendingApproval' } : item,
      ),
    );
    antdMessage.success('Content approved successfully');
  };

  const handleFlagUser = (record: ModerationItem) => {
    antdMessage.warning(`User ${record.author} has been flagged for review`);
  };

  const handleDelete = (record: ModerationItem) => {
    confirm({
      title: 'Delete this content?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        setData((prev) => prev.filter((item) => item.id !== record.id));
        antdMessage.success('Content deleted successfully');
      },
    });
  };

  const columns: ColumnsType<ModerationItem> = [
    {
      title: 'Content Snippet',
      dataIndex: 'contentSnippet',
      key: 'contentSnippet',
      render: (text: string) => (
        <span
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'inline-block',
            maxWidth: 480,
          }}
          title={text}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
      render: (text: string) => <strong>{text}</strong>,
      width: 160,
    },
    {
      // Dans le code d’origine, le titre dépendait de `activeTab`.
      // On garde la logique tout en restant sûr côté types.
      title: activeTab === 'Reported' ? 'Report Reason' : 'Note',
      key: 'reasonOrNote',
      render: (_: unknown, record: ModerationItem) =>
        activeTab === 'Reported' ? (
          <Tag icon={<ExclamationCircleOutlined />} color="error">
            {record.reportReason || '—'}
          </Tag>
        ) : (
          <Tag color="blue">Pending Approval</Tag>
        ),
      width: 220,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: ModerationItem) => (
        <Space>
          {record.status === 'Pending' && (
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
            >
              Approve
            </Button>
          )}
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            Delete
          </Button>
          {record.queue === 'Reported' && (
            <Button icon={<FlagOutlined />} onClick={() => handleFlagUser(record)}>
              Flag User
            </Button>
          )}
        </Space>
      ),
      width: 300,
    },
  ];

  return (
    <PageContainer title="Community Moderation">
      <Tabs activeKey={activeTab} onChange={(k) => setActiveTab(k as ModerationQueue)}>
        <TabPane tab="Reported" key="Reported" />
        <TabPane tab="Pending Approval" key="PendingApproval" />
      </Tabs>

      <Table<ModerationItem>
        rowKey="id"
        columns={columns}
        dataSource={filteredItems}
        pagination={{ pageSize: 10 }}
      />
    </PageContainer>
  );
}
