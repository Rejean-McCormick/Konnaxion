// app/ethikos/admin/audit/page.tsx
'use client';

import type { ReactNode } from 'react';
import {
  PageContainer,
  ProTable,
  type ProColumns,
} from '@ant-design/pro-components';
import { Tag } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import {
  fetchAuditLogs,
  type AuditPayload,
  type LogRow,
} from '@/services/admin';

export default function AuditLogs(): JSX.Element {
  usePageTitle('Admin · Audit Logs');

  // ahooks v3: useRequest<Data, ParamsTuple>; no params → []
  const { data, loading } = useRequest<AuditPayload, []>(fetchAuditLogs);

  const columns: ProColumns<LogRow>[] = [
    {
      title: 'Time',
      dataIndex: 'ts',
      valueType: 'dateTime' as const,
      width: 180,
      sorter: true,
    },
    {
      title: 'Actor',
      dataIndex: 'actor',
      width: 120,
    },
    {
      title: 'Action',
      dataIndex: 'action',
      width: 200,
    },
    {
      title: 'Target',
      dataIndex: 'target',
      ellipsis: true,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 120,
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Warn', value: 'warn' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value, record) =>
        record.severity === (String(value) as LogRow['severity']),
      render: (_dom: ReactNode, record: LogRow) => (
        <Tag
          color={
            record.severity === 'critical'
              ? 'red'
              : record.severity === 'warn'
              ? 'orange'
              : 'blue'
          }
        >
          {record.severity}
        </Tag>
      ),
    },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<LogRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items ?? []}
        pagination={{ pageSize: 15 }}
        search={false}
      />
    </PageContainer>
  );
}
