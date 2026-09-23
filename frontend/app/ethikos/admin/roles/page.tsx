// FILE: frontend/app/ethikos/admin/roles/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { ReloadOutlined } from '@ant-design/icons';
import {
  PageContainer,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  Alert,
  App as AntdApp,
  Button,
  Segmented,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchRoles,
  type RolePayload,
  type RoleRow,
  toggleRole,
} from '@/services/admin';

const { Text } = Typography;

type StatusFilter = 'all' | 'enabled' | 'disabled';

const STATUS_FILTER_OPTIONS = (i18nT: TranslateFunction): { label: string; value: StatusFilter }[] => ([
  { label: i18nT("ui.ethikos.admin.roles.all"), value: 'all' },
  { label: i18nT("ui.ethikos.admin.roles.enabled"), value: 'enabled' },
  { label: i18nT("ui.ethikos.admin.roles.disabled"), value: 'disabled' },
]);

export default function RoleManagement(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);

  const { message } = AntdApp.useApp();

  const {
    data,
    loading,
    error,
    refresh,
  } = useRequest<RolePayload, []>(() => fetchRoles());

  const items = useMemo(() => data?.items ?? [], [data]);

  const stats = useMemo(() => {
    const totalRoles = items.length;
    const enabledRoles = items.filter((role) => role.enabled).length;
    const totalUsers = items.reduce(
      (sum, role) => sum + (role.userCount ?? 0),
      0,
    );

    return {
      totalRoles,
      enabledRoles,
      totalUsers,
    };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (statusFilter === 'enabled') {
      return items.filter((role) => role.enabled);
    }

    if (statusFilter === 'disabled') {
      return items.filter((role) => !role.enabled);
    }

    return items;
  }, [items, statusFilter]);

  const onToggleRole = async (
    role: RoleRow,
    checked: boolean,
  ): Promise<void> => {
    try {
      setUpdatingRoleId(role.id);

      await toggleRole(role.id, checked);

      message.success(
        checked ? i18nT("ui.ethikos.admin.roles.enabled_2bb24b", { name: role.name }) : i18nT("ui.ethikos.admin.roles.disabled_c47717", { name: role.name }),
      );

      refresh();
    } catch {
      message.error(i18nT("ui.ethikos.admin.roles.unableToUpdateThisRolePleaseTry"));
    } finally {
      setUpdatingRoleId(null);
    }
  };

  const columns: ProColumns<RoleRow>[] = [
    {
      title: i18nT("ui.ethikos.admin.roles.role"),
      dataIndex: 'name',
      width: 260,
      ellipsis: true,
      render: (_dom, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.name}</Text>

          {row.role && (
            <Text type="secondary" ellipsis>
              {i18nT("ui.ethikos.admin.roles.permissionRole")} {row.role}
            </Text>
          )}

          {row.topicTitle && (
            <Text type="secondary" ellipsis>
              {i18nT("ui.ethikos.admin.roles.topic")} {row.topicTitle}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.admin.roles.users"),
      dataIndex: 'userCount',
      width: 120,
      align: 'right',
      render: (_dom, row) => <Tag>{row.userCount ?? 0}</Tag>,
    },
    {
      title: i18nT("ui.ethikos.admin.roles.enabled"),
      dataIndex: 'enabled',
      width: 140,
      render: (_dom, row) => (
        <Switch
          checked={Boolean(row.enabled)}
          loading={updatingRoleId === row.id}
          disabled={loading || updatingRoleId !== null}
          onChange={(checked) => {
            void onToggleRole(row, checked);
          }}
        />
      ),
    },
  ];

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.admin.roles.roleManagement")}
      sectionLabel={i18nT("ui.ethikos.admin.roles.admin")}
      subtitle={i18nT("ui.ethikos.admin.roles.configureWhoCanModerateDebatesManageConsultations")}
    >
      <PageContainer ghost loading={loading}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%', marginBottom: 16 }}
        >
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.admin.roles.roleBasedAccessForEthikos")}
            description={
              <Text type="secondary">
                {i18nT("ui.ethikos.admin.roles.useRolesToControlWhoCanModerate")}
              </Text>
            }
          />

          {error && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.admin.roles.unableToLoadEthikosRoles")}
              description={i18nT("ui.ethikos.admin.roles.checkYourConnectionOrTryAgainIf")}
            />
          )}

          <Space
            align="center"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Space size="large" wrap>
              <Statistic title={i18nT("ui.ethikos.admin.roles.definedRoles")} value={stats.totalRoles} />
              <Statistic title={i18nT("ui.ethikos.admin.roles.enabledRoles")} value={stats.enabledRoles} />
              <Statistic title={i18nT("ui.ethikos.admin.roles.assignedUsers")} value={stats.totalUsers} />
            </Space>

            <Space wrap>
              <Segmented<StatusFilter>
                value={statusFilter}
                onChange={(value) => setStatusFilter(value)}
                options={STATUS_FILTER_OPTIONS(i18nT)}
              />

              <Button
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
                type="default"
                loading={loading}
                disabled={updatingRoleId !== null}
              >
                {i18nT("ui.ethikos.admin.roles.refresh")}
              </Button>
            </Space>
          </Space>
        </Space>

        <ProTable<RoleRow>
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          pagination={false}
          search={false}
          loading={loading}
          options={false}
          toolBarRender={() => [
            <Text key="hint" type="secondary">
              {i18nT("ui.ethikos.admin.roles.toggleARoleToEnableOrDisable")}
            </Text>,
          ]}
        />
      </PageContainer>
    </EthikosPageShell>
  );
}