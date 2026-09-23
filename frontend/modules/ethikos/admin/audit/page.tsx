// FILE: frontend/modules/ethikos/admin/audit/page.tsx
// C:\MyCode\Konnaxionv14\frontend\modules\ethikos\admin\audit\page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, type ProColumns, ProTable } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Tag } from 'antd';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchAuditLogs, type LogRow } from '@/services/audit';

export default function AuditLogs() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.admin.audit.adminAuditLogs"));

  const { data, loading } = useRequest(fetchAuditLogs);

  const columns: ProColumns<LogRow>[] = [
    {
      title: i18nT("ui.ethikos.admin.audit.time"),
      dataIndex: 'ts',
      valueType: 'dateTime',
      width: 180,
      sorter: true,
    },
    {
      title: i18nT("ui.ethikos.admin.audit.actor"),
      dataIndex: 'actor',
      width: 120,
    },
    {
      title: i18nT("ui.ethikos.admin.audit.action"),
      dataIndex: 'action',
      width: 200,
    },
    {
      title: i18nT("ui.ethikos.admin.audit.target"),
      dataIndex: 'target',
      ellipsis: true,
    },
    {
      title: i18nT("ui.ethikos.admin.audit.severity"),
      dataIndex: 'severity',
      width: 120,
      render: (_, row) => (
        <Tag
          color={
            row.severity === 'critical'
              ? 'red'
              : row.severity === 'warn'
              ? 'orange'
              : 'blue'
          }
        >
          {row.severity}
        </Tag>
      ),
      filters: [
        { text: i18nT("ui.ethikos.admin.audit.info_4b631f"), value: 'info' },
        { text: i18nT("ui.ethikos.admin.audit.warn_3009d5"), value: 'warn' },
        { text: i18nT("ui.ethikos.admin.audit.critical_04b7b2"), value: 'critical' },
      ],
      onFilter: (value, record) => record.severity === value,
    },
  ];

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<LogRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.items}
        pagination={{ pageSize: 15 }}
        search={false}
      />
    </PageContainer>
  );
}
