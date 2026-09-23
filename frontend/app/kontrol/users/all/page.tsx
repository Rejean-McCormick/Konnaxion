// FILE: frontend/app/kontrol/users/all/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  EllipsisOutlined,
  HistoryOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UserAddOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Dropdown,
  Empty,
  List,
  message,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';

import KontrolPageShell from '@/app/kontrol/KontrolPageShell';

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

type UserApiRecord = {
  id?: number;
  username?: string;
  email?: string;
  is_superuser?: boolean;
  is_staff?: boolean;
  is_active?: boolean;
  joined_at?: string;
  last_login?: string | null;
  reputation_score?: number;
};

type UsersApiResponse = {
  results?: unknown[];
  count?: number;
};

function isUsersApiResponse(data: unknown): data is UsersApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('results' in data || 'count' in data)
  );
}

export default function AllUsersPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [messageApi, messageContextHolder] = message.useMessage();
  const actionRef = useRef<ActionType>();

  const [currentRow, setCurrentRow] = useState<UserItem | undefined>(
    undefined,
  );
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleAction = (key: string, record: UserItem) => {
    if (key === 'view') {
      setCurrentRow(record);
      setDrawerOpen(true);
    } else if (key === 'ban' || key === 'reset') {
      messageApi.warning(
        i18nT("ui.kontrol.users.all.userMutationsAreUnavailableBecauseTheCurrent"),
      );
    }
  };

  const columns: ProColumns<UserItem>[] = [
    {
      title: i18nT("ui.kontrol.users.all.user"),
      dataIndex: 'username',
      copyable: true,
      width: 200,
      render: (dom, entity) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                entity.role === 'admin'
                  ? '#f56a00'
                  : entity.status === 'banned'
                  ? '#ff4d4f'
                  : '#87d068',
            }}
          />
          <Space direction="vertical" size={0}>
            <Text strong>{entity.username}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.kontrol.users.all.id")} {entity.id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.users.all.email"),
      dataIndex: 'email',
      copyable: true,
    },
    {
      title: i18nT("ui.kontrol.users.all.role"),
      dataIndex: 'role',
      valueType: 'select',
      valueEnum: {
        admin: { text: i18nT("ui.kontrol.users.all.admin"), status: 'Error' },
        moderator: { text: i18nT("ui.kontrol.users.all.moderator"), status: 'Warning' },
        user: { text: i18nT("ui.kontrol.users.all.user"), status: 'Default' },
      },
      render: (_, entity) => {
        let color: string = 'default';
        if (entity.role === 'admin') color = 'gold';
        if (entity.role === 'moderator') color = 'cyan';
        return <Tag color={color}>{entity.role.toUpperCase()}</Tag>;
      },
    },
    {
      title: i18nT("ui.kontrol.users.all.reputation"),
      dataIndex: 'reputationScore',
      sorter: true,
      search: false,
      render: (dom, entity) => (
        <Space>
          <SafetyCertificateOutlined
            style={{
              color:
                entity.reputationScore > 0 ? '#52c41a' : '#ff4d4f',
            }}
          />
          {dom}
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.users.all.status"),
      dataIndex: 'status',
      valueEnum: {
        active: { text: i18nT("ui.kontrol.users.all.active"), status: 'Success' },
        banned: { text: i18nT("ui.kontrol.users.all.banned"), status: 'Error' },
        pending: { text: i18nT("ui.kontrol.users.all.pending"), status: 'Processing' },
      },
      render: (_, entity) => {
        const statusMap: Record<
          UserItem['status'],
          { status: 'success' | 'error' | 'warning'; text: string }
        > = {
          active: { status: 'success', text: i18nT("ui.kontrol.users.all.active") },
          banned: { status: 'error', text: i18nT("ui.kontrol.users.all.banned") },
          pending: { status: 'warning', text: i18nT("ui.kontrol.users.all.pending") },
        };
        const s = statusMap[entity.status] ?? statusMap.active;
        return <Badge status={s.status} text={s.text} />;
      },
    },
    {
      title: i18nT("ui.kontrol.users.all.joined"),
      dataIndex: 'joinedAt',
      valueType: 'date',
      search: false,
    },
    {
      title: i18nT("ui.kontrol.users.all.action"),
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: i18nT("ui.kontrol.users.all.viewDetails"),
                icon: <HistoryOutlined />,
                onClick: () => handleAction('view', record),
              },
              {
                key: 'reset',
                label: i18nT("ui.kontrol.users.all.resetPassword"),
                disabled: true,
                onClick: () => handleAction('reset', record),
              },
              { type: 'divider' },
              {
                key: 'ban',
                label: i18nT("ui.kontrol.users.all.banUser"),
                disabled: true,
                danger: true,
                icon: <StopOutlined />,
                onClick: () => handleAction('ban', record),
              },
            ],
          }}
        >
          <a key="action">
            <EllipsisOutlined style={{ fontSize: 18 }} />
          </a>
        </Dropdown>
      ),
    },
  ];

  const title = i18nT("ui.kontrol.users.all.userManagement");
  const subtitle = (
    <>
      {i18nT("ui.kontrol.users.all.platformWideViewOfAllUsersAnd")}
    </>
  );

  const primaryAction = (
    <Button
      type="primary"
      icon={<UserAddOutlined />}
      disabled
      title={i18nT("ui.kontrol.users.all.userCreationIsUnavailableBecauseTheCurrent")}
    >
      {i18nT("ui.kontrol.users.all.addUserUnavailable")}
    </Button>
  );

  return (
    <KontrolPageShell
      title={title}
      subtitle={subtitle}
      scope="platform"
      moduleKey="kontrol"
      primaryAction={primaryAction}
      maxWidth={1200}
    >
      {messageContextHolder}
      <ProTable<UserItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          const searchParams = new URLSearchParams();
          if (params.username) {
            searchParams.append(
              'search',
              params.username as string,
            );
          }
          if (params.email) {
            searchParams.append(
              'search',
              params.email as string,
            );
          }

          try {
            const response = await fetch(
              `/api/admin/users/?${searchParams.toString()}`,
            );
            if (!response.ok)
              throw new Error('Failed to fetch users');

            const raw: unknown = await response.json();

            let results: unknown[] = [];

            if (isUsersApiResponse(raw)) {
              results = raw.results ?? [];
            } else if (Array.isArray(raw)) {
              results = raw;
            }

            const mappedData: UserItem[] = results
              .map((u) => {
                const user = u as UserApiRecord;

                let role: UserItem['role'] = 'user';
                if (user.is_superuser) role = 'admin';
                else if (user.is_staff) role = 'moderator';

                let status: UserItem['status'] = 'active';
                if (!user.is_active) status = 'banned';

                if (activeTab === 'banned' && status !== 'banned') {
                  return null;
                }
                if (
                  activeTab === 'admin' &&
                  role === 'user'
                ) {
                  return null;
                }

                return {
                  id: user.id ?? 0,
                  username: user.username ?? 'Unknown',
                  email: user.email ?? '',
                  role,
                  status,
                  joinedAt: user.joined_at ?? '',
                  lastLogin: user.last_login || 'Never',
                  reputationScore: user.reputation_score || 0,
                } as UserItem;
              })
              .filter((u): u is UserItem => u !== null);

            return {
              data: mappedData,
              success: true,
              total: mappedData.length,
            };
          } catch (error) {
             
            console.error(error);
            messageApi.error(i18nT("ui.kontrol.users.all.errorLoadingUsersList"));
            return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        toolbar={{
          menu: {
            type: 'tab',
            activeKey: activeTab,
            items: [
              { key: 'all', label: i18nT("ui.kontrol.users.all.allUsers") },
              { key: 'banned', label: i18nT("ui.kontrol.users.all.bannedOnly") },
              { key: 'admin', label: i18nT("ui.kontrol.users.all.staffAdmins") },
            ],
            onChange: (key) => {
              const k = key ?? 'all';
              setActiveTab(String(k));
              actionRef.current?.reload();
            },
          },
        }}
        pagination={{
          pageSize: 10,
        }}
      />

      {/* Profile Drawer */}
      <Drawer
        width={700}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setCurrentRow(undefined);
        }}
        title={
          <Space>
            <Avatar
              icon={<UserOutlined />}
              src={currentRow?.avatar}
            />
            <span>{i18nT("ui.kontrol.users.all.profile")} {currentRow?.username}</span>
          </Space>
        }
        extra={
          <Button onClick={() => setDrawerOpen(false)}>{i18nT("ui.kontrol.users.all.close")}</Button>
        }
      >
        {currentRow && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: i18nT("ui.kontrol.users.all.overview"),
                children: (
                  <Space
                    direction="vertical"
                    size="large"
                    style={{ width: '100%' }}
                  >
                    <Descriptions
                      title={i18nT("ui.kontrol.users.all.accountInfo")}
                      column={2}
                      bordered
                      size="small"
                    >
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.userId")}>
                        {currentRow.id}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.email")}>
                        {currentRow.email}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.role")}>
                        <Tag color="blue">
                          {currentRow.role.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.status")}>
                        <Tag
                          color={
                            currentRow.status === 'active'
                              ? 'green'
                              : 'red'
                          }
                        >
                          {currentRow.status.toUpperCase()}
                        </Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.joinedDate")}>
                        {currentRow.joinedAt}
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.lastLogin")}>
                        {currentRow.lastLogin}
                      </Descriptions.Item>
                    </Descriptions>

                    <Descriptions
                      title={i18nT("ui.kontrol.users.all.reputationTrust")}
                      column={1}
                      bordered
                      size="small"
                    >
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.reputationScore")}>
                        <Space>
                          <Text
                            strong
                            style={{
                              color:
                                currentRow.reputationScore > 0
                                  ? '#52c41a'
                                  : '#ff4d4f',
                            }}
                          >
                            {currentRow.reputationScore}
                          </Text>
                          <Text type="secondary">
                            {i18nT("ui.kontrol.users.all.top15")}
                          </Text>
                        </Space>
                      </Descriptions.Item>
                      <Descriptions.Item label={i18nT("ui.kontrol.users.all.trustLevel")}>
                        <Badge
                          status="success"
                          text={i18nT("ui.kontrol.users.all.verifiedHuman")}
                        />
                      </Descriptions.Item>
                    </Descriptions>

                    <div
                      style={{
                        background: '#f5f5f5',
                        padding: 16,
                        borderRadius: 8,
                      }}
                    >
                      <Text type="secondary">
                        <SafetyCertificateOutlined /> {i18nT("ui.kontrol.users.all.adminNotes")}
                      </Text>
                      <p
                        style={{
                          marginTop: 8,
                          marginBottom: 0,
                        }}
                      >
                        {i18nT("ui.kontrol.users.all.userHasBeenFlagged2TimesIn")}
                      </p>
                    </div>
                  </Space>
                ),
              },
              {
                key: '2',
                label: i18nT("ui.kontrol.users.all.activityLog"),
                children: (
                  <List
                    dataSource={[
                      {
                        title: i18nT("ui.kontrol.users.all.postedAComment"),
                        time: '2 hours ago',
                      },
                      {
                        title: i18nT("ui.kontrol.users.all.votedOnProposal42"),
                        time: '1 day ago',
                      },
                      {
                        title: i18nT("ui.kontrol.users.all.loggedInFromNewIp"),
                        time: '3 days ago',
                      },
                      {
                        title: i18nT("ui.kontrol.users.all.passwordChanged"),
                        time: '1 month ago',
                        icon: <LockOutlined />,
                      },
                    ]}
                    renderItem={(item) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={item.icon || <HistoryOutlined />}
                          title={item.title}
                          description={item.time}
                        />
                      </List.Item>
                    )}
                  />
                ),
              },
              {
                key: '3',
                label: i18nT("ui.kontrol.users.all.permissions"),
                children: (
                  <Empty
                    description={i18nT("ui.kontrol.users.all.noCustomPermissionsOverridesSetForThis")}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </KontrolPageShell>
  );
}
