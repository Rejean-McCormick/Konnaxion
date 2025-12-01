// FILE: frontend/app/kontrol/audit-log/page.tsx
'use client';

import React, { useRef } from 'react';
import { Tag, Button, message, Space } from 'antd';
import { 
  CloudDownloadOutlined, 
  ReloadOutlined, 
  SafetyCertificateOutlined,
  UserOutlined,
  RobotOutlined
} from '@ant-design/icons';
import { 
  PageContainer, 
  ProTable, 
  type ProColumns, 
  type ActionType 
} from '@ant-design/pro-components';

// --- Types ---
type LogItem = {
  id: string;
  actor: string;
  role: 'admin' | 'moderator' | 'system';
  action: string;
  module: string;
  target: string;
  ip: string;
  timestamp: string;
  status: 'success' | 'failure';
};

// --- Mock Data ---
const MOCK_LOGS: LogItem[] = [
  { id: 'LOG-8821', actor: 'admin_jane', role: 'admin', action: 'DELETE_COMMENT', module: 'Moderation', target: 'Comment #992', ip: '192.168.1.12', timestamp: '2025-12-01 10:45:00', status: 'success' },
  { id: 'LOG-8820', actor: 'mod_tom', role: 'moderator', action: 'BAN_USER', module: 'User Mgmt', target: 'User @spammer', ip: '10.0.0.55', timestamp: '2025-12-01 10:05:22', status: 'success' },
  { id: 'LOG-8819', actor: 'system', role: 'system', action: 'AUTO_ARCHIVE', module: 'System', target: 'Thread #404', ip: '127.0.0.1', timestamp: '2025-12-01 02:00:00', status: 'success' },
  { id: 'LOG-8818', actor: 'unknown', role: 'system', action: 'LOGIN_ATTEMPT', module: 'Auth', target: 'admin_jane', ip: '45.22.11.90', timestamp: '2025-11-30 23:55:10', status: 'failure' },
  { id: 'LOG-8817', actor: 'admin_jane', role: 'admin', action: 'UPDATE_CONFIG', module: 'Konsensus', target: 'Global Thresholds', ip: '192.168.1.12', timestamp: '2025-11-30 14:30:00', status: 'success' },
];

export default function AuditLogPage() {
  const actionRef = useRef<ActionType>();

  // Helper for Actor Icons
  const getActorIcon = (role: string) => {
    switch (role) {
      case 'admin': return <SafetyCertificateOutlined style={{ color: '#faad14' }} />;
      case 'system': return <RobotOutlined style={{ color: '#1890ff' }} />;
      default: return <UserOutlined style={{ color: '#52c41a' }} />;
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
      search: false, // In real app, enable search if backend supports it
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
    message.loading('Generating audit report...', 1.5)
      .then(() => message.success('Audit_Log_2025-12-01.csv downloaded'));
  };

  return (
    <PageContainer
      title="System Audit Log"
      subTitle="Immutable record of all administrative and system actions."
      extra={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()}>
          Refresh
        </Button>,
        <Button key="export" type="primary" icon={<CloudDownloadOutlined />} onClick={handleExport}>
          Export CSV
        </Button>
      ]}
    >
      <ProTable<LogItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          // Mock API call
          return {
            data: MOCK_LOGS,
            success: true,
            total: MOCK_LOGS.length,
          };
        }}
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
      />
    </PageContainer>
  );
}