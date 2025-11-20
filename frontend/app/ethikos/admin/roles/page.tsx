// app/ethikos/admin/roles/page.tsx
'use client';

import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import {
  PageContainer,
  ProTable,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Segmented,
  Space,
  Statistic,
  Switch,
  Tag,
  Typography,
} from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchRoles,
  toggleRole,
  type RoleRow,
  type RolePayload,
} from '@/services/admin';

const { Text } = Typography;

type StatusFilter = 'all' | 'enabled' | 'disabled';

export default function RoleManagement() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  // ahooks v3 generics: <Data, ParamsTuple>. No params → []
  const { data, loading, refresh } = useRequest<RolePayload, []>(fetchRoles);

  const stats = useMemo(() => {
    const items = data?.items ?? [];
    const totalRoles = items.length;
    const enabledRoles = items.filter((r) => r.enabled).length;
    const totalUsers = items.reduce(
      (sum, r) => sum + (r.userCount ?? 0),
      0,
    );
    return { totalRoles, enabledRoles, totalUsers };
  }, [data]);

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    if (statusFilter === 'enabled') return items.filter((r) => r.enabled);
    if (statusFilter === 'disabled') return items.filter((r) => !r.enabled);
    return items;
  }, [data, statusFilter]);

  const columns: ProColumns<RoleRow>[] = [
    {
      title: 'Role',
      dataIndex: 'name',
      width: 220,
      ellipsis: true,
    },
    {
      title: 'Users',
      dataIndex: 'userCount',
      width: 120,
      align: 'right',
      render: (dom: ReactNode) => <Tag>{dom}</Tag>,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      width: 140,
      valueType: 'switch',
      render: (_: ReactNode, row: RoleRow) => (
        <Switch
          checked={row.enabled}
          onChange={async (checked: boolean) => {
            await toggleRole(row.id, checked);
            refresh();
          }}
        />
      ),
    },
  ];

  return (
    <EthikosPageShell
      title="Role management"
      sectionLabel="Admin"
      subtitle="Configure who can moderate debates, manage consultations, or access sensitive impact dashboards in Ethikos."
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
            message="Role-based access for Ethikos"
            description={
              <Text type="secondary">
                Use roles to control who can moderate debates, manage
                consultations, or access sensitive impact dashboards.
                Toggling a role updates access for all users in that group.
              </Text>
            }
          />

          <Space
            align="center"
            style={{
              width: '100%',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
            }}
          >
            <Space size="large" wrap>
              <Statistic title="Defined roles" value={stats.totalRoles} />
              <Statistic title="Enabled roles" value={stats.enabledRoles} />
              <Statistic title="Assigned users" value={stats.totalUsers} />
            </Space>

            <Space>
              <Segmented
                value={statusFilter}
                onChange={(value) =>
                  setStatusFilter(value as StatusFilter)
                }
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Enabled', value: 'enabled' },
                  { label: 'Disabled', value: 'disabled' },
                ]}
              />
              <Button
                icon={<ReloadOutlined />}
                onClick={() => refresh()}
                type="default"
              >
                Refresh
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
          toolBarRender={() => [
            <Text key="hint" type="secondary">
              Toggle a role to enable or disable its permissions
              platform-wide.
            </Text>,
          ]}
        />
      </PageContainer>
    </EthikosPageShell>
  );
}
