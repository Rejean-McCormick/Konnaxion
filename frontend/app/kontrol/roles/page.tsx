// FILE: frontend/app/kontrol/roles/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import { 
  Button, 
  Tag, 
  Space, 
  Avatar, 
  Dropdown, 
  message, 
  Drawer, 
  Typography, 
  Switch,
  Tree,
  Alert
} from 'antd';
import { 
  PlusOutlined, 
  EllipsisOutlined, 
  TeamOutlined, 
  SafetyCertificateOutlined,
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  LockOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  PageContainer, 
  ProTable, 
  type ProColumns, 
  type ActionType,
  ProCard,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect
} from '@ant-design/pro-components';

const { Text, Title, Paragraph } = Typography;

// --- Types ---
type RoleItem = {
  id: string;
  name: string;
  description: string;
  type: 'system' | 'custom';
  userCount: number;
  permissionsCount: number;
  updatedAt: string;
  baseRole: 'admin' | 'moderator' | 'user' | 'guest';
};

// --- Mock Data ---
const MOCK_ROLES: RoleItem[] = [
  {
    id: 'ROLE_ADMIN',
    name: 'Super Admin',
    description: 'Full system access. Cannot be deleted.',
    type: 'system',
    userCount: 3,
    permissionsCount: 142,
    updatedAt: '2024-01-01',
    baseRole: 'admin'
  },
  {
    id: 'ROLE_MODERATOR',
    name: 'Global Moderator',
    description: 'Can manage content and users across all modules.',
    type: 'system',
    userCount: 8,
    permissionsCount: 45,
    updatedAt: '2024-03-15',
    baseRole: 'moderator'
  },
  {
    id: 'ROLE_CUST_1',
    name: 'Ethikos Expert',
    description: 'Can moderate Ethikos debates but no user management.',
    type: 'custom',
    userCount: 12,
    permissionsCount: 18,
    updatedAt: '2025-11-20',
    baseRole: 'user'
  },
  {
    id: 'ROLE_CUST_2',
    name: 'Content Creator',
    description: 'Can publish directly to Kreative without approval.',
    type: 'custom',
    userCount: 156,
    permissionsCount: 12,
    updatedAt: '2025-10-05',
    baseRole: 'user'
  }
];

// Mock Permission Tree Data
const PERMISSION_TREE = [
  {
    title: 'Platform Core',
    key: 'core',
    children: [
      { title: 'View Dashboard', key: 'core.view_dashboard' },
      { title: 'Manage Users', key: 'core.manage_users' },
      { title: 'System Settings', key: 'core.settings' },
    ],
  },
  {
    title: 'Moderation',
    key: 'mod',
    children: [
      { title: 'View Queue', key: 'mod.view_queue' },
      { title: 'Delete Content', key: 'mod.delete_content' },
      { title: 'Ban Users', key: 'mod.ban_users' },
    ],
  },
  {
    title: 'Ethikos (Debates)',
    key: 'ethikos',
    children: [
      { title: 'Create Topic', key: 'ethikos.create_topic' },
      { title: 'Lock Topic', key: 'ethikos.lock_topic' },
      { title: 'Pin Argument', key: 'ethikos.pin_argument' },
    ],
  },
];

export default function RolesPermissionsPage() {
  const actionRef = useRef<ActionType>();
  
  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleItem | undefined>(undefined);
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenDrawer = (record?: RoleItem) => {
    setCurrentRole(record);
    setIsEditing(!!record);
    setDrawerOpen(true);
  };

  const handleDelete = (role: RoleItem) => {
    message.success(`Role ${role.name} deleted`);
    actionRef.current?.reload();
  };

  const columns: ProColumns<RoleItem>[] = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      copyable: true,
      render: (dom, entity) => (
        <Space>
          <SafetyCertificateOutlined style={{ color: entity.type === 'system' ? '#faad14' : '#1890ff' }} />
          <Space direction="vertical" size={0}>
            <Text strong>{dom}</Text>
            {entity.type === 'system' && <Tag bordered={false} color="orange" style={{fontSize: 10, lineHeight: '14px', padding: '0 4px'}}>SYSTEM</Tag>}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      sorter: (a, b) => a.userCount - b.userCount,
      render: (val) => (
        <Tag icon={<TeamOutlined />}>{val}</Tag>
      )
    },
    {
      title: 'Permissions',
      dataIndex: 'permissionsCount',
      render: (val) => <Tag color="blue">{val} capabilities</Tag>
    },
    {
      title: 'Last Updated',
      dataIndex: 'updatedAt',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', label: 'Edit Permissions', icon: <EditOutlined />, onClick: () => handleOpenDrawer(record) },
              { key: 'clone', label: 'Clone Role', icon: <CopyOutlined /> },
              { type: 'divider' },
              { 
                key: 'delete', 
                label: 'Delete Role', 
                icon: <DeleteOutlined />, 
                danger: true, 
                disabled: record.type === 'system',
                onClick: () => handleDelete(record)
              },
            ],
          }}
        >
          <Button type="text" icon={<EllipsisOutlined style={{ fontSize: 18 }} />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <PageContainer
      title="Roles & Permissions"
      subTitle="Define access levels and capabilities for platform administrators and users."
      extra={[
        <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => handleOpenDrawer()}>
          Create New Role
        </Button>
      ]}
    >
      <ProTable<RoleItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async () => ({ data: MOCK_ROLES, success: true })}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
        headerTitle="Active Roles"
      />

      {/* --- Role Editor Drawer --- */}
      <Drawer
        width={720}
        open={drawerOpen}
        onClose={() => { setDrawerOpen(false); setCurrentRole(undefined); }}
        title={isEditing ? `Edit Role: ${currentRole?.name}` : 'Create New Role'}
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="primary" onClick={() => { message.success('Role saved successfully'); setDrawerOpen(false); }}>
              Save Changes
            </Button>
          </Space>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          
          {/* Warning for System Roles */}
          {currentRole?.type === 'system' && (
            <Alert 
              message="System Role" 
              description="This is a core system role. Some permissions cannot be removed to prevent system lockout."
              type="warning"
              showIcon
              icon={<LockOutlined />}
            />
          )}

          {/* Basic Info Form */}
          <ProCard title="Role Details" bordered headerBordered>
            <ProForm submitter={false} initialValues={currentRole}>
              <ProForm.Group>
                <ProFormText
                  width="md"
                  name="name"
                  label="Role Name"
                  placeholder="e.g. Content Moderator"
                  rules={[{ required: true }]}
                  disabled={currentRole?.type === 'system'}
                />
                <ProFormSelect
                  width="sm"
                  name="baseRole"
                  label="Base Access Level"
                  options={[
                    { label: 'Administrator', value: 'admin' },
                    { label: 'Moderator', value: 'moderator' },
                    { label: 'Standard User', value: 'user' },
                  ]}
                  rules={[{ required: true }]}
                  tooltip="Determines the baseline access level before granular permissions are applied."
                />
              </ProForm.Group>
              <ProFormTextArea
                name="description"
                label="Description"
                placeholder="Describe what this role is used for..."
              />
            </ProForm>
          </ProCard>

          {/* Permission Matrix */}
          <ProCard 
            title="Capabilities Matrix" 
            bordered 
            headerBordered 
            extra={<Button size="small">Select All</Button>}
          >
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <Tree
                checkable
                defaultExpandAll
                treeData={PERMISSION_TREE}
                defaultCheckedKeys={isEditing ? ['core.view_dashboard', 'ethikos.create_topic'] : []}
              />
            </div>
          </ProCard>

          {/* Danger Zone (only for custom roles) */}
          {currentRole?.type !== 'system' && isEditing && (
            <ProCard title="Danger Zone" bordered headerBordered style={{ borderColor: '#ffa39e' }} headStyle={{ backgroundColor: '#fff1f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space direction="vertical" size={2}>
                  <Text strong>Delete this Role</Text>
                  <Text type="secondary">Once deleted, users with this role will revert to the default 'User' role.</Text>
                </Space>
                <Button danger>Delete Role</Button>
              </div>
            </ProCard>
          )}

        </Space>
      </Drawer>
    </PageContainer>
  );
}