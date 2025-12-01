'use client';

import React, { useRef, useState } from 'react';
import { 
  Button, 
  Tag, 
  Space, 
  Popconfirm, 
  message, 
  Tooltip, 
  Drawer, 
  Badge, 
  Tabs, 
  Typography,
  Avatar,
  List
} from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  FlagOutlined, 
  EyeOutlined,
  StopOutlined,
  UserOutlined,
  HistoryOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  ProTable, 
  type ProColumns, 
  type ActionType, 
  PageContainer,
  ProDescriptions,
  ProCard
} from '@ant-design/pro-components';

const { Paragraph, Text } = Typography;

// --- Types ---
type ModerationItem = {
  id: number;
  contentSnippet: string;
  fullContent: string;
  author: string;
  authorReputation: number;
  reportReason: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'comment' | 'post' | 'user_profile';
  reportCount: number;
  reporters: string[]; // List of users who flagged this
};

// --- Mock Data ---
const MOCK_DATA: ModerationItem[] = [
  { 
    id: 1, 
    contentSnippet: "This is a spam message...", 
    fullContent: "This is a spam message with a shady link: http://buy-crypto-now.fake. Buy now! Limited time offer!",
    author: "@spambot99", 
    authorReputation: 12,
    reportReason: "Spam / Advertising", 
    timestamp: "2025-12-01 09:30", 
    status: 'pending', 
    severity: 'medium', 
    type: 'comment',
    reportCount: 3,
    reporters: ['@user1', '@user2', '@mod_alice']
  },
  { 
    id: 2, 
    contentSnippet: "I hate everyone here!", 
    fullContent: "I hate everyone here! You are all wrong and stupid. Go away.",
    author: "@angry_user", 
    authorReputation: 450,
    reportReason: "Harassment", 
    timestamp: "2025-12-01 10:15", 
    status: 'pending', 
    severity: 'high', 
    type: 'comment',
    reportCount: 5,
    reporters: ['@victim1', '@bystander']
  },
  { 
    id: 3, 
    contentSnippet: "Check out my shady link", 
    fullContent: "Check out my shady link. It definitely won't steal your password.",
    author: "@hacker", 
    authorReputation: -5,
    reportReason: "Phishing Risk", 
    timestamp: "2025-11-30 22:00", 
    status: 'pending', 
    severity: 'critical', 
    type: 'post',
    reportCount: 12,
    reporters: ['@system_guard', '@admin_bob']
  },
  { 
    id: 4, 
    contentSnippet: "Just a normal profile", 
    fullContent: "Bio: I am just a normal user. nothing to see here.",
    author: "@innocent", 
    authorReputation: 1200,
    reportReason: "False Report", 
    timestamp: "2025-12-01 08:00", 
    status: 'resolved', 
    severity: 'low', 
    type: 'user_profile',
    reportCount: 1,
    reporters: ['@troll_user']
  },
];

export default function ModerationQueuePage() {
  const actionRef = useRef<ActionType>();
  
  // State for the Details Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ModerationItem | undefined>(undefined);

  const handleOpenDrawer = (record: ModerationItem) => {
    setCurrentRow(record);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setCurrentRow(undefined);
  };

  const handleAction = (action: string, id: number) => {
    message.success(`${action} applied to ticket #${id}`);
    actionRef.current?.reload(); 
    if (drawerOpen) handleCloseDrawer();
  };

  // Column Definitions
  const columns: ProColumns<ModerationItem>[] = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 100,
      valueEnum: {
        critical: { text: 'Critical', status: 'Error' },
        high: { text: 'High', status: 'Warning' },
        medium: { text: 'Medium', status: 'Processing' },
        low: { text: 'Low', status: 'Success' },
      },
      sorter: (a, b) => {
        const weight = { critical: 4, high: 3, medium: 2, low: 1 };
        return weight[a.severity] - weight[b.severity];
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        comment: { text: 'Comment' },
        post: { text: 'Post' },
        user_profile: { text: 'User Profile' },
      },
      width: 120,
    },
    {
      title: 'Content Snippet',
      dataIndex: 'contentSnippet',
      ellipsis: true,
      render: (dom, entity) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color="volcano" icon={<FlagOutlined />}>{entity.reportReason}</Tag>
            {entity.reportCount > 1 && <Badge count={entity.reportCount} style={{ backgroundColor: '#f5222d' }} />}
          </Space>
          <span style={{ color: '#666', fontSize: '13px', marginTop: 4, display: 'block' }}>
            "{dom}"
          </span>
        </Space>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      width: 140,
      copyable: true,
      render: (text, entity) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: entity.authorReputation < 0 ? '#ff4d4f' : '#87d068' }} />
          <a>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      search: false,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      valueEnum: {
        pending: { text: 'Pending', status: 'Processing' },
        reviewed: { text: 'Reviewed', status: 'Default' },
        resolved: { text: 'Resolved', status: 'Success' },
      },
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 160,
      render: (text, record) => [
        <Tooltip title="View Details" key="view">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleOpenDrawer(record)}
          />
        </Tooltip>,
        <Tooltip title="Dismiss (Keep)" key="dismiss">
          <Popconfirm
            title="Dismiss report?"
            description="The content will remain visible."
            onConfirm={() => handleAction('Report dismissed', record.id)}
          >
            <Button type="text" icon={<CheckCircleOutlined style={{ color: 'green' }} />} />
          </Popconfirm>
        </Tooltip>,
        <Tooltip title="Remove & Ban" key="ban">
          <Popconfirm
            title="Remove content & Ban user?"
            description="This is a severe action."
            onConfirm={() => handleAction('User banned & content removed', record.id)}
            okText="Ban & Remove"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<StopOutlined style={{ color: 'red' }} />} />
          </Popconfirm>
        </Tooltip>,
      ],
    },
  ];

  return (
    <PageContainer 
      title="Moderation Queue" 
      subTitle="Review and act on reported content from across the platform."
      extra={[
        <Button key="refresh" onClick={() => actionRef.current?.reload()}>Refresh Queue</Button>,
        <Button key="export" type="default">Export Logs</Button>
      ]}
    >
      <ProTable<ModerationItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          // In real app: await fetch('/api/admin/moderation', { params })
          console.log('Fetching with params', params);
          return {
            data: MOCK_DATA,
            success: true,
            total: MOCK_DATA.length,
          };
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        headerTitle="Active Flags"
        toolBarRender={() => [
          <Button key="bulk-approve" type="primary">Batch Dismiss</Button>,
          <Button key="bulk-ban" danger>Batch Remove</Button>
        ]}
      />

      {/* --- Detail Drawer --- */}
      <Drawer
        width={720}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={
          <Space>
            <WarningOutlined style={{ color: '#faad14' }} />
            <span>Moderation Ticket #{currentRow?.id}</span>
            <Tag color={currentRow?.severity === 'critical' ? 'red' : 'blue'}>
              {currentRow?.severity.toUpperCase()}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" danger onClick={() => handleAction('Content Removed', currentRow?.id || 0)}>
              Remove Content
            </Button>
          </Space>
        }
      >
        {currentRow && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Report Details',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Key Metrics */}
                    <ProCard split="vertical" bordered headerBordered>
                      <ProCard title="Reporters" colSpan="50%">
                         <List
                            size="small"
                            dataSource={currentRow.reporters}
                            renderItem={item => <List.Item><UserOutlined /> {item}</List.Item>}
                          />
                      </ProCard>
                      <ProCard title="Metadata" colSpan="50%">
                         <ProDescriptions column={1} size="small">
                            <ProDescriptions.Item label="Reason" valueType="text"><Text strong>{currentRow.reportReason}</Text></ProDescriptions.Item>
                            <ProDescriptions.Item label="Timestamp" valueType="dateTime">{currentRow.timestamp}</ProDescriptions.Item>
                            <ProDescriptions.Item label="Type">{currentRow.type}</ProDescriptions.Item>
                         </ProDescriptions>
                      </ProCard>
                    </ProCard>

                    {/* The Content */}
                    <ProCard title="Flagged Content" bordered headerBordered type="inner" title={<Space><InfoCircleOutlined /> Content Preview</Space>}>
                      <div style={{ 
                        padding: '16px', 
                        background: '#f9f9f9', 
                        borderRadius: '6px', 
                        border: '1px solid #eee',
                        minHeight: '100px'
                      }}>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {currentRow.fullContent}
                        </Paragraph>
                      </div>
                    </ProCard>
                  </Space>
                )
              },
              {
                key: '2',
                label: 'Author Context',
                children: (
                   <ProCard title={`Author: ${currentRow.author}`} bordered headerBordered>
                      <ProDescriptions column={2}>
                         <ProDescriptions.Item label="Reputation Score" valueType="digit">{currentRow.authorReputation}</ProDescriptions.Item>
                         <ProDescriptions.Item label="Account Age" valueType="text">2.5 Years</ProDescriptions.Item>
                         <ProDescriptions.Item label="Previous Violations" valueType="digit">0</ProDescriptions.Item>
                         <ProDescriptions.Item label="Role">User</ProDescriptions.Item>
                      </ProDescriptions>
                      <Button type="link" icon={<HistoryOutlined />}>View Full Activity Log</Button>
                   </ProCard>
                )
              }
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
}