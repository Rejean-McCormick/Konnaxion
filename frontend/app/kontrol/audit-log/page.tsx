// FILE: frontend/app/kontrol/audit-log/page.tsx
'use client';

import React, { useRef } from 'react';
import { Tag, Button, message, Space } from 'antd';
import {
  CloudDownloadOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProTable,
  type ProColumns,
  type ActionType,
} from '@ant-design/pro-components';

// --- Domain types for the table ---
export type LogItemRole = 'admin' | 'moderator' | 'system';
export type LogItemStatus = 'success' | 'failure';

export type LogItem = {
  id: string;
  actor: string;
  role: LogItemRole;
  action: string;
  module: string;
  target: string;
  ip: string;
  timestamp: string;
  status: LogItemStatus;
};

// --- API response types (from Django backend) ---
type AuditLogApiItem = {
  id: string | number;
  actor_name?: string | null;
  actor_username?: string | null;
  role?: LogItemRole | null;
  action: string;
  module: string;
  target: string;
  ip_address?: string | null;
  created: string;
  status: LogItemStatus;
};

type AuditLogApiResponse = {
  results?: AuditLogApiItem[];
  count: number;
};

export default function AuditLogPage() {
  const actionRef = useRef<ActionType>();

  // Helper for Actor Icons
  const getActorIcon = (role: LogItemRole) => {
    switch (role) {
      case 'admin':
        return <SafetyCertificateOutlined style={{ color: '#faad14' }} />;
      case 'system':
        return <RobotOutlined style={{ color: '#1890ff' }} />;
      case 'moderator':
      default:
        return <UserOutlined style={{ color: '#52c41a' }} />;
    }
  };

  // Helper for Action Colors
  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('BAN')) return 'red';
    if (action.includes('UPDATE') || action.includes('EDIT')) return 'blue';
    if (action.includes('LOGIN')) return 'purple';
    return 'default';
  };

  const columns: ProColumns<LogItem>[] = [
    {
      title: 'Log ID',
      dataIndex: 'id',
      copyable: true,
      width: 100,
      search: false,
      fixed: 'left',
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      width: 140,
      render: (dom, entity) => (
        <Space>
          {getActorIcon(entity.role)}
          <span>{dom}</span>
        </Space>
      ),
    },
    {
      title: 'Module',
      dataIndex: 'module',
      width: 120,
      valueType: 'select',
      valueEnum: {
        Moderation: { text: 'Moderation' },
        'User Mgmt': { text: 'User Mgmt' },
        System: { text: 'System' },
        Auth: { text: 'Auth' },
        Konsensus: { text: 'Konsensus' },
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 160,
      render: (_, entity) => (
        <Tag color={getActionColor(entity.action)} style={{ fontWeight: 500 }}>
          {entity.action}
        </Tag>
      ),
    },
    {
      title: 'Target / Details',
      dataIndex: 'target',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 100,
      valueEnum: {
        success: { text: 'Success', status: 'Success' },
        failure: { text: 'Failure', status: 'Error' },
      },
    },
    {
      title: 'IP Address',
      dataIndex: 'ip',
      valueType: 'text',
      width: 120,
      copyable: true,
      search: false,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      sorter: true,
      width: 180,
    },
  ];

  const handleExport = () => {
    // In a real implementation, this would trigger a backend CSV download endpoint
    message
      .loading('Generating audit report...', 1.5)
      .then(() => message.success('Audit_Log_Export.csv downloaded'));
  };

  return (
    <PageContainer
      title="System Audit Log"
      subTitle="Immutable record of all administrative and system actions."
      extra={[
        <Button
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={() => actionRef.current?.reload()}
        >
          Refresh
        </Button>,
        <Button
          key="export"
          type="primary"
          icon={<CloudDownloadOutlined />}
          onClick={handleExport}
        >
          Export CSV
        </Button>,
      ]}
    >
      <ProTable<LogItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 20,
          showSizeChanger: true,
        }}
        options={{
          density: true,
          fullScreen: true,
          setting: true,
        }}
        dateFormatter="string"
        headerTitle="Recent Activity"
        /**
         * WIRED: Fetch from Django API
         * The return type is fully annotated to keep TypeScript happy.
         */
        request={async (params): Promise<{
          data: LogItem[];
          success: boolean;
          total?: number;
        }> => {
          try {
            const searchParams = new URLSearchParams();

            // Pagination
            const current = params.current ?? 1;
            const pageSize = params.pageSize ?? 20;
            searchParams.append('page', String(current));
            searchParams.append('page_size', String(pageSize));

            // Filtering / Searching
            if (params.module) {
              searchParams.append('search', String(params.module));
            }
            if (params.action) {
              searchParams.append('search', String(params.action));
            }

            // Sorting: default to newest first
            // (Assuming backend supports ?ordering=-created)
            searchParams.append('ordering', '-created');

            const response = await fetch(
              `/api/admin/audit-log/?${searchParams.toString()}`,
            );

            if (!response.ok) {
              throw new Error('Failed to fetch logs');
            }

            const data = (await response.json()) as AuditLogApiResponse;

            const rawResults = Array.isArray(data.results)
              ? data.results
              : [];

            const mappedData: LogItem[] = rawResults.map((item) => {
              const actorName =
                item.actor_name ??
                item.actor_username ??
                'System';

              const role: LogItemRole =
                item.role && ['admin', 'moderator', 'system'].includes(item.role)
                  ? item.role
                  : 'system';

              const status: LogItemStatus =
                item.status === 'failure' ? 'failure' : 'success';

              return {
                id: String(item.id),
                actor: actorName,
                role,
                action: item.action,
                module: item.module,
                target: item.target,
                ip: item.ip_address ?? '-',
                timestamp: item.created,
                status,
              };
            });

            return {
              data: mappedData,
              success: true,
              total: data.count,
            };
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Audit log fetch error:', error);
            message.error('Failed to load audit logs');
            return {
              data: [],
              success: false,
            };
          }
        }}
      />
    </PageContainer>
  );
}
