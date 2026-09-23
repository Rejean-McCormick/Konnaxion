// FILE: frontend/app/kontrol/roles/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  CopyOutlined,
  DeleteOutlined,
  EditOutlined,
  EllipsisOutlined,
  LockOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  ProCard,
  type ProColumns,
  ProForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Drawer,
  Dropdown,
  message,
  Space,
  Tag,
  Tree,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';

import KontrolPageShell from '@/app/kontrol/KontrolPageShell';

const { Text } = Typography;

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

// --- Declared role preview data ---
const ROLE_PREVIEW_DATA: RoleItem[] = [
  {
    id: 'ROLE_ADMIN',
    name: 'Super Admin',
    description: 'Full system access. Cannot be deleted.',
    type: 'system',
    userCount: 3,
    permissionsCount: 142,
    updatedAt: '2024-01-01',
    baseRole: 'admin',
  },
  {
    id: 'ROLE_MODERATOR',
    name: 'Global Moderator',
    description: 'Can manage content and users across all modules.',
    type: 'system',
    userCount: 8,
    permissionsCount: 45,
    updatedAt: '2024-03-15',
    baseRole: 'moderator',
  },
  {
    id: 'ROLE_CUST_1',
    name: 'Ethikos Expert',
    description: 'Can moderate Ethikos debates but no user management.',
    type: 'custom',
    userCount: 12,
    permissionsCount: 18,
    updatedAt: '2025-11-20',
    baseRole: 'user',
  },
  {
    id: 'ROLE_CUST_2',
    name: 'Content Creator',
    description: 'Can publish directly to Kreative without approval.',
    type: 'custom',
    userCount: 156,
    permissionsCount: 12,
    updatedAt: '2025-10-05',
    baseRole: 'user',
  },
];

// Declared permission preview tree
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

export default function RolesPermissionsPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [messageApi, messageContextHolder] = message.useMessage();
  const actionRef = useRef<ActionType>();

  // Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<RoleItem | undefined>(
    undefined,
  );
  const [isEditing, setIsEditing] = useState(false);

  const handleOpenDrawer = (record?: RoleItem) => {
    setCurrentRole(record);
    setIsEditing(!!record);
    setDrawerOpen(true);
  };

  const handleDelete = (role: RoleItem) => {
    messageApi.warning(
      `Role mutation is unavailable for ${role.name}; Kontrol exposes no role-write contract in this build.`,
    );
  };

  const columns: ProColumns<RoleItem>[] = [
    {
      title: i18nT("ui.kontrol.roles.roleName"),
      dataIndex: 'name',
      copyable: true,
      render: (dom, entity) => (
        <Space>
          <SafetyCertificateOutlined
            style={{
              color: entity.type === 'system' ? '#faad14' : '#1890ff',
            }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{dom}</Text>
            {entity.type === 'system' && (
              <Tag
                bordered={false}
                color="orange"
                style={{
                  fontSize: 10,
                  lineHeight: '14px',
                  padding: '0 4px',
                }}
              >
                {i18nT("ui.kontrol.roles.system")}
              </Tag>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.roles.description"),
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: i18nT("ui.kontrol.roles.users"),
      dataIndex: 'userCount',
      sorter: (a, b) => a.userCount - b.userCount,
      render: val => (
        <Tag icon={<TeamOutlined />}>
          {val}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.kontrol.roles.permissions"),
      dataIndex: 'permissionsCount',
      render: val => (
        <Tag color="blue">
          {val} {i18nT("ui.kontrol.roles.capabilities")}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.kontrol.roles.lastUpdated"),
      dataIndex: 'updatedAt',
      valueType: 'date',
      sorter: true,
      search: false,
    },
    {
      title: i18nT("ui.kontrol.roles.actions"),
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                label: i18nT("ui.kontrol.roles.viewPermissions"),
                icon: <EditOutlined />,
                onClick: () => handleOpenDrawer(record),
              },
              {
                key: 'clone',
                label: i18nT("ui.kontrol.roles.cloneRole"),
                icon: <CopyOutlined />,
                disabled: true,
              },
              { type: 'divider' },
              {
                key: 'delete',
                label: i18nT("ui.kontrol.roles.deleteRole"),
                icon: <DeleteOutlined />,
                danger: true,
                disabled: true,
                onClick: () => handleDelete(record),
              },
            ],
          }}
        >
          <Button
            type="text"
            icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
          />
        </Dropdown>
      ),
    },
  ];

  const title = i18nT("ui.kontrol.roles.rolesPermissions");
  const subtitle = (
    <>
      {i18nT("ui.kontrol.roles.definePlatformWideAccessLevelsAndCapabilities")}
    </>
  );

  const primaryAction = (
    <Button
      key="create"
      type="primary"
      icon={<PlusOutlined />}
      disabled
      title={i18nT("ui.kontrol.roles.roleCreationIsUnavailableUntilABackend")}
    >
      {i18nT("ui.kontrol.roles.createRoleUnavailable")}
    </Button>
  );

  return (
    <KontrolPageShell
      title={title}
      subtitle={subtitle}
      scope="platform"
      metaTitle={i18nT("ui.kontrol.roles.kontrolPlatformRolesPermissions")}
      primaryAction={primaryAction}
      maxWidth={1200}
    >
      {messageContextHolder}
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        <Alert
          type="warning"
          showIcon
          message={i18nT("ui.kontrol.roles.readOnlyRolePreview")}
          description={i18nT("ui.kontrol.roles.kontrolDoesNotCurrentlyExposeABackend")}
        />
        {/* Scope / impact info for clarity inside Kontrol */}
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.kontrol.roles.platformLevelRoles")}
          description={
            <>
              <Text>
                {i18nT("ui.kontrol.roles.changesHereApplyToTheEntireKonnaxion")}
              </Text>
              <br />
              <Text type="secondary">
                {i18nT("ui.kontrol.roles.useModuleSpecificControlsInOtherSections")}
              </Text>
            </>
          }
        />

        <ProTable<RoleItem>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          request={async () => ({ data: ROLE_PREVIEW_DATA, success: true })}
          rowKey="id"
          search={{ labelWidth: 'auto' }}
          pagination={{ pageSize: 10 }}
          headerTitle={i18nT("ui.kontrol.roles.activeRoles")}
        />
      </Space>

      {/* --- Role Editor Drawer --- */}
      <Drawer
        width={720}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setCurrentRole(undefined);
        }}
        title={
          isEditing
            ? i18nT("ui.kontrol.roles.editRole", { name: currentRole?.name })
            : i18nT("ui.kontrol.roles.createNewRole")
        }
        extra={
          <Space>
            <Button onClick={() => setDrawerOpen(false)}>{i18nT("ui.kontrol.roles.cancel")}</Button>
            <Button
              type="primary"
              disabled
              title={i18nT("ui.kontrol.roles.rolePersistenceIsNotExposedByThe")}
            >
              {i18nT("ui.kontrol.roles.saveUnavailable")}
            </Button>
          </Space>
        }
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: '100%' }}
        >
          {/* Warning for System Roles */}
          {currentRole?.type === 'system' && (
            <Alert
              message={i18nT("ui.kontrol.roles.systemRole")}
              description={i18nT("ui.kontrol.roles.thisIsACoreSystemRoleSome")}
              type="warning"
              showIcon
              icon={<LockOutlined />}
            />
          )}

          {/* Basic Info Form */}
          <ProCard
            title={i18nT("ui.kontrol.roles.roleDetails")}
            bordered
            headerBordered
          >
            <ProForm
              submitter={false}
              initialValues={currentRole}
              disabled
            >
              <ProForm.Group>
                <ProFormText
                  width="md"
                  name="name"
                  label={i18nT("ui.kontrol.roles.roleName")}
                  placeholder={i18nT("ui.kontrol.roles.eGContentModerator")}
                  rules={[{ required: true }]}
                  disabled={currentRole?.type === 'system'}
                />
                <ProFormSelect
                  width="sm"
                  name="baseRole"
                  label={i18nT("ui.kontrol.roles.baseAccessLevel")}
                  options={[
                    { label: i18nT("ui.kontrol.roles.administrator"), value: 'admin' },
                    { label: i18nT("ui.kontrol.roles.moderator"), value: 'moderator' },
                    { label: i18nT("ui.kontrol.roles.standardUser"), value: 'user' },
                  ]}
                  rules={[{ required: true }]}
                  tooltip={i18nT("ui.kontrol.roles.determinesTheBaselineAccessLevelBeforeGranular")}
                />
              </ProForm.Group>
              <ProFormTextArea
                name="description"
                label={i18nT("ui.kontrol.roles.description")}
                placeholder={i18nT("ui.kontrol.roles.describeWhatThisRoleIsUsedFor")}
              />
            </ProForm>
          </ProCard>

          {/* Permission Matrix */}
          <ProCard
            title={i18nT("ui.kontrol.roles.capabilitiesMatrix")}
            bordered
            headerBordered
            extra={<Button size="small">{i18nT("ui.kontrol.roles.selectAll")}</Button>}
          >
            <div
              style={{
                maxHeight: '400px',
                overflowY: 'auto',
              }}
            >
              <Tree
                checkable
                defaultExpandAll
                treeData={PERMISSION_TREE}
                defaultCheckedKeys={
                  isEditing
                    ? ['core.view_dashboard', 'ethikos.create_topic']
                    : []
                }
              />
            </div>
          </ProCard>

          {/* Danger Zone (only for custom roles) */}
          {currentRole?.type !== 'system' && isEditing && (
            <ProCard
              title={i18nT("ui.kontrol.roles.dangerZone")}
              bordered
              headerBordered
              style={{ borderColor: '#ffa39e' }}
              headStyle={{ backgroundColor: '#fff1f0' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Space direction="vertical" size={2}>
                  <Text strong>{i18nT("ui.kontrol.roles.deleteThisRole")}</Text>
                  <Text type="secondary">
                    {i18nT("ui.kontrol.roles.onceDeletedUsersWithThisRoleWill")}
                  </Text>
                </Space>
                <Button danger>{i18nT("ui.kontrol.roles.deleteRole")}</Button>
              </div>
            </ProCard>
          )}
        </Space>
      </Drawer>
    </KontrolPageShell>
  );
}
