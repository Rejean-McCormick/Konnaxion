// FILE: frontend/app/kontrol/moderation/community/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import { 
  Button, 
  Tag, 
  Space, 
  Avatar, 
  Progress, 
  Dropdown, 
  message, 
  Drawer, 
  Descriptions, 
  Switch, 
  Typography, 
  List,
  Alert
} from 'antd';
import { 
  TeamOutlined, 
  EllipsisOutlined, 
  StopOutlined, 
  LockOutlined, 
  SafetyCertificateOutlined,
  CommentOutlined,
  FireOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { 
  PageContainer, 
  ProTable, 
  type ProColumns, 
  type ActionType,
  ProCard
} from '@ant-design/pro-components';

const { Text, Title } = Typography;

// --- Types ---
type CommunityContext = {
  id: string;
  name: string;
  module: 'Ethikos' | 'Ekoh' | 'Konnected' | 'Kreative';
  type: 'Debate' | 'Group' | 'Course' | 'Project';
  activeUsers: number;
  openFlags: number;
  toxicityScore: number; // 0-100
  status: 'active' | 'locked' | 'archived';
  lastActivity: string;
  moderators: string[];
};

// --- Mock Data ---
const MOCK_COMMUNITIES: CommunityContext[] = [
  {
    id: 'ETH-404',
    name: 'Debate: AI Rights & Ethics',
    module: 'Ethikos',
    type: 'Debate',
    activeUsers: 142,
    openFlags: 15,
    toxicityScore: 85,
    status: 'active',
    lastActivity: '2 mins ago',
    moderators: ['@mod_tom'],
  },
  {
    id: 'KON-102',
    name: 'React Learners Group',
    module: 'Konnected',
    type: 'Group',
    activeUsers: 560,
    openFlags: 2,
    toxicityScore: 12,
    status: 'active',
    lastActivity: '1 hour ago',
    moderators: ['@teacher_ann', '@helper_bob'],
  },
  {
    id: 'EKO-991',
    name: 'Proposal #22: Carbon Tax',
    module: 'Ekoh',
    type: 'Debate',
    activeUsers: 89,
    openFlags: 8,
    toxicityScore: 65,
    status: 'locked',
    lastActivity: '1 day ago',
    moderators: [],
  },
  {
    id: 'KRE-005',
    name: 'NFT Showcase: Space Cats',
    module: 'Kreative',
    type: 'Project',
    activeUsers: 1200,
    openFlags: 45,
    toxicityScore: 40,
    status: 'active',
    lastActivity: '5 mins ago',
    moderators: ['@artist_zoe'],
  },
];

export default function CommunityModerationPage() {
  const actionRef = useRef<ActionType>();
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState<CommunityContext | undefined>(undefined);

  const handleOpenDrawer = (record: CommunityContext) => {
    setCurrentContext(record);
    setDrawerOpen(true);
  };

  const handleAction = (key: string, record: CommunityContext) => {
    if (key === 'lock') {
      message.warning(`Locked context: ${record.name}`);
      actionRef.current?.reload();
    } else if (key === 'clear') {
      message.success(`All flags cleared for ${record.name}`);
    }
  };

  const columns: ProColumns<CommunityContext>[] = [
    {
      title: 'Context Name',
      dataIndex: 'name',
      copyable: true,
      render: (dom, entity) => (
        <Space>
          <Avatar 
            shape="square" 
            style={{ backgroundColor: entity.module === 'Ethikos' ? '#722ed1' : '#1890ff' }}
          >
            {entity.module[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{dom}</Text>
            <Tag size="small">{entity.type}</Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      valueType: 'select',
      valueEnum: {
        Ethikos: { text: 'Ethikos' },
        Ekoh: { text: 'Ekoh' },
        Konnected: { text: 'Konnected' },
        Kreative: { text: 'Kreative' },
      },
      width: 120,
    },
    {
      title: 'Health (Toxicity)',
      dataIndex: 'toxicityScore',
      sorter: (a, b) => a.toxicityScore - b.toxicityScore,
      width: 180,
      render: (_, entity) => (
        <Space>
          <Progress 
            type="circle" 
            percent={entity.toxicityScore} 
            width={32} 
            strokeColor={entity.toxicityScore > 80 ? '#ff4d4f' : entity.toxicityScore > 50 ? '#faad14' : '#52c41a'} 
            format={() => ''}
          />
          <Text type={entity.toxicityScore > 80 ? 'danger' : 'secondary'}>
            {entity.toxicityScore > 80 ? 'Critical' : entity.toxicityScore > 50 ? 'Heated' : 'Healthy'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Active Flags',
      dataIndex: 'openFlags',
      sorter: (a, b) => a.openFlags - b.openFlags,
      render: (val) => (
        <Tag color={Number(val) > 10 ? 'red' : 'default'} icon={<WarningOutlined />}>
          {val} Open
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: {
        active: { text: 'Active', status: 'Success' },
        locked: { text: 'Locked', status: 'Error' },
        archived: { text: 'Archived', status: 'Default' },
      },
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'manage', label: 'Manage Context', icon: <SafetyCertificateOutlined />, onClick: () => handleOpenDrawer(record) },
              { key: 'history', label: 'View Logs', icon: <ClockCircleOutlined /> },
              { type: 'divider' },
              { key: 'lock', label: record.status === 'locked' ? 'Unlock' : 'Lock Thread', icon: <LockOutlined />, danger: record.status !== 'locked' },
            ],
            onClick: ({ key }) => { if(key === 'lock') handleAction('lock', record) }
          }}
        >
          <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer
      title="Community Moderation"
      subTitle="Manage discussion spaces, groups, and debates at the container level."
      extra={[
        <Button key="refresh" onClick={() => actionRef.current?.reload()}>Refresh Metrics</Button>,
        <Button key="create" type="primary">New Report</Button>
      ]}
    >
      <ProTable<CommunityContext>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async () => ({ data: MOCK_COMMUNITIES, success: true })}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
        headerTitle="Context Health Monitor"
        toolBarRender={() => [
          <Button key="filter" icon={<FireOutlined />}>High Toxicity Only</Button>
        ]}
      />

      {/* --- Context Management Drawer --- */}
      <Drawer
        width={600}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setCurrentContext(undefined); }}
        title={currentContext ? `Manage: ${currentContext.name}` : 'Context Manager'}
      >
        {currentContext && (
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            
            {/* Health Banner */}
            {currentContext.toxicityScore > 70 && (
              <Alert 
                message="High Toxicity Detected" 
                description="This context has an unusually high rate of reported content. Consider enabling Slow Mode or assigning temporary moderators."
                type="error"
                showIcon
              />
            )}

            {/* Quick Controls */}
            <ProCard title="Governance Controls" bordered headerBordered>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text><LockOutlined /> Lock Context (Read-only)</Text>
                  <Switch checked={currentContext.status === 'locked'} onChange={() => message.info('Toggle Lock')} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text><ClockCircleOutlined /> Slow Mode (1 post/10m)</Text>
                  <Switch />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text><StopOutlined /> Require Approval for New Users</Text>
                  <Switch defaultChecked />
                </div>
              </Space>
            </ProCard>

            {/* Metrics */}
            <Descriptions title="Live Metrics" bordered size="small" column={2}>
              <Descriptions.Item label="Active Users">{currentContext.activeUsers}</Descriptions.Item>
              <Descriptions.Item label="Open Flags">{currentContext.openFlags}</Descriptions.Item>
              <Descriptions.Item label="Last Activity">{currentContext.lastActivity}</Descriptions.Item>
              <Descriptions.Item label="Total Comments">8,921</Descriptions.Item>
            </Descriptions>

            {/* Moderators List */}
            <List
              header={<Text strong>Assigned Moderators</Text>}
              bordered
              dataSource={currentContext.moderators}
              renderItem={item => (
                <List.Item actions={[<a key="remove">Remove</a>]}>
                  <Space>
                    <Avatar size="small" icon={<TeamOutlined />} />
                    {item}
                  </Space>
                </List.Item>
              )}
              footer={<Button type="dashed" block icon={<TeamOutlined />}>Assign New Moderator</Button>}
            />

            <Button type="primary" danger block size="large" icon={<StopOutlined />}>
              Emergency Freeze (Suspend Context)
            </Button>
          </Space>
        )}
      </Drawer>
    </PageContainer>
  );
}