// FILE: frontend/app/kontrol/users/all/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import { 
  Tag, 
  Button, 
  Dropdown, 
  message, 
  Drawer, 
  Descriptions, 
  Space, 
  Avatar, 
  Typography,
  Badge,
  Tabs,
  List,
  Empty
} from 'antd';
import { 
  EllipsisOutlined, 
  UserAddOutlined, 
  UserOutlined,
  StopOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  LockOutlined
} from '@ant-design/icons';
import { 
  PageContainer, 
  ProTable, 
  type ProColumns, 
  type ActionType 
} from '@ant-design/pro-components';

const { Text } = Typography;

// --- Types ---
type UserItem = {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  role: 'admin' | 'moderator' | 'user';
  status: 'active' | 'banned' | 'pending';
  joinedAt: string;
  lastLogin: string;
  reputationScore: number;
};

export default function AllUsersPage() {
  const actionRef = useRef<ActionType>();
  
  // State for Drawer & Active Filter Tab
  const [currentRow, setCurrentRow] = useState<UserItem | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<React.Key>('all');

  const handleAction = (key: string, record: UserItem) => {
    if (key === 'view') {
      setCurrentRow(record);
      setDrawerOpen(true);
    } else if (key === 'ban') {
      message.success(`User ${record.username} has been banned.`);
      // In a real app, you would make a POST/PATCH call here
      actionRef.current?.reload();
    } else if (key === 'reset') {
      message.info(`Password reset email sent to ${record.email}`);
    }
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: 'User',
      dataIndex: 'username',
      copyable: true,
      width: 200,
      render: (dom, entity) => (
        <Space>
          <Avatar 
            icon={<UserOutlined />} 
            style={{ 
              backgroundColor: entity.role === 'admin' ? '#f56a00' : 
                               entity.status === 'banned' ? '#ff4d4f' : '#87d068' 
            }} 
          />
          <Space direction="vertical" size={0}>
            <Text strong>{entity.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>ID: {entity.id}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: {
        admin: { text: 'Admin', status: 'Error' },
        moderator: { text: 'Moderator', status: 'Warning' },
        user: { text: 'User', status: 'Default' },
      },
      render: (_, entity) => {
        let color = 'default';
        if (entity.role === 'admin') color = 'gold';
        if (entity.role === 'moderator') color = 'cyan';
        return <Tag color={color}>{entity.role.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Reputation',
      dataIndex: 'reputationScore',
      sorter: true,
      search: false,
      render: (dom, entity) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: entity.reputationScore > 0 ? '#52c41a' : '#ff4d4f' }} />
          {dom}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueEnum: {
        active: { text: 'Active', status: 'Success' },
        banned: { text: 'Banned', status: 'Error' },
        pending: { text: 'Pending', status: 'Processing' },
      },
      render: (_, entity) => {
        const statusMap = {
          active: { status: 'success', text: 'Active' },
          banned: { status: 'error', text: 'Banned' },
          pending: { status: 'warning', text: 'Pending' },
        };
        // @ts-ignore
        const s = statusMap[entity.status] || statusMap.active;
        // @ts-ignore
        return <Badge status={s.status} text={s.text} />;
      }
    },
    {
      title: 'Joined',
      dataIndex: 'joinedAt',
      valueType: 'date',
      search: false,
    },
    {
      title: 'Action',
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { 
                key: 'view', 
                label: 'View Details', 
                icon: <HistoryOutlined />,
                onClick: () => handleAction('view', record) 
              },
              { 
                key: 'reset', 
                label: 'Reset Password',
                onClick: () => handleAction('reset', record)
              },
              { type: 'divider' },
              { 
                key: 'ban', 
                label: 'Ban User', 
                danger: true, 
                icon: <StopOutlined />,
                onClick: () => handleAction('ban', record) 
              },
            ],
          }}
        >
          <a key="action"><EllipsisOutlined style={{ fontSize: 18 }} /></a>
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer
      title="User Management"
      subTitle="Manage user access, roles, and account status."
      extra={<Button type="primary" icon={<UserAddOutlined />}>Add User</Button>}
    >
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        
        // 1. DYNAMIC REQUEST TO REAL BACKEND
        request={async (params) => {
          // Construct Query Params
          const searchParams = new URLSearchParams();
          if (params.username) searchParams.append('search', params.username);
          if (params.email) searchParams.append('search', params.email);
          
          try {
            const response = await fetch(`/api/admin/users/?${searchParams.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch users');
            
            const data = await response.json();
            
            // Map Django Serializer Data -> Frontend UserItem
            // Backend sends: is_active, is_staff, is_superuser, date_joined
            // Frontend expects: status, role, joinedAt
            const mappedData: UserItem[] = (data.results || []).map((u: any) => {
                // Determine Role
                let role: UserItem['role'] = 'user';
                if (u.is_superuser) role = 'admin';
                else if (u.is_staff) role = 'moderator';

                // Determine Status
                let status: UserItem['status'] = 'active';
                if (!u.is_active) status = 'banned'; 
                // Note: 'pending' isn't standard in default Django User, 
                // so we default to active/banned for now.

                // Filter based on Tab selection (Client-side filtering for specific logic)
                if (activeTab === 'banned' && status !== 'banned') return null;
                if (activeTab === 'admin' && role === 'user') return null;

                return {
                    id: u.id,
                    username: u.username,
                    email: u.email,
                    role: role,
                    status: status,
                    joinedAt: u.joined_at, // mapped in serializer
                    lastLogin: u.last_login || 'Never',
                    reputationScore: u.reputation_score || 0
                };
            }).filter(Boolean); // Remove nulls from filtering

            return { 
              data: mappedData, 
              success: true,
              total: mappedData.length 
            };

          } catch (error) {
            console.error(error);
            message.error('Error loading users list');
            return { data: [], success: false };
          }
        }}
        
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        
        // 2. TOOLBAR TABS
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeTab,
            items: [
              { key: 'all', label: 'All Users' },
              { key: 'banned', label: 'Banned Only' },
              { key: 'admin', label: 'Staff (Admins)' },
            ],
            onChange: (key) => {
              setActiveTab(key);
              actionRef.current?.reload(); // Trigger re-fetch
            }
          }
        }}
        pagination={{
          pageSize: 10,
        }}
      />

      {/* 3. PROFILE DRAWER */}
      <Drawer
        width={700}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setCurrentRow(undefined); }}
        title={
          <Space>
             <Avatar icon={<UserOutlined />} src={currentRow?.avatar} />
             <span>Profile: {currentRow?.username}</span>
          </Space>
        }
        extra={
            <Button onClick={() => setDrawerOpen(false)}>Close</Button>
        }
      >
        {currentRow && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: 'Overview',
                children: (
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <Descriptions title="Account Info" column={2} bordered size="small">
                      <Descriptions.Item label="User ID">{currentRow.id}</Descriptions.Item>
                      <Descriptions.Item label="Email">{currentRow.email}</Descriptions.Item>
                      <Descriptions.Item label="Role">
                        <Tag color="blue">{currentRow.role.toUpperCase()}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Status">
                          <Tag color={currentRow.status === 'active' ? 'green' : 'red'}>{currentRow.status.toUpperCase()}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Joined Date">{currentRow.joinedAt}</Descriptions.Item>
                      <Descriptions.Item label="Last Login">{currentRow.lastLogin}</Descriptions.Item>
                    </Descriptions>

                    <Descriptions title="Reputation & Trust" column={1} bordered size="small">
                      <Descriptions.Item label="Reputation Score">
                         <Space>
                            <Text strong style={{ color: currentRow.reputationScore > 0 ? '#52c41a' : '#ff4d4f' }}>
                                {currentRow.reputationScore}
                            </Text>
                            <Text type="secondary">(Top 15%)</Text>
                         </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label="Trust Level">
                         <Badge status="success" text="Verified Human" />
                      </Descriptions.Item>
                    </Descriptions>

                    <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
                        <Text type="secondary"><SafetyCertificateOutlined /> Admin Notes:</Text>
                        <p style={{ marginTop: 8, marginBottom: 0 }}>
                            User has been flagged 2 times in the last month for minor spam. Monitoring recommended.
                        </p>
                    </div>
                  </Space>
                )
              },
              {
                key: '2',
                label: 'Activity Log',
                children: (
                   <List
                     dataSource={[
                       { title: 'Posted a comment', time: '2 hours ago' },
                       { title: 'Voted on Proposal #42', time: '1 day ago' },
                       { title: 'Logged in from new IP', time: '3 days ago' },
                       { title: 'Password changed', time: '1 month ago', icon: <LockOutlined /> }
                     ]}
                     renderItem={item => (
                        <List.Item>
                           <List.Item.Meta
                              avatar={item.icon || <HistoryOutlined />}
                              title={item.title}
                              description={item.time}
                           />
                        </List.Item>
                     )}
                   />
                )
              },
              {
                key: '3',
                label: 'Permissions',
                children: (
                  <Empty description="No custom permissions overrides set for this user." image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )
              }
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
}