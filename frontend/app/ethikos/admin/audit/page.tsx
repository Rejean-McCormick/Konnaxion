// app/ethikos/admin/audit/page.tsx
'use client';

// Enhanced Ethikos admin audit logs view using Ant Design ProComponents
// and the canonical audit services.

import React from 'react';
import type { ReactNode } from 'react';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Alert,
  Badge,
  Button,
  Descriptions,
  Drawer,
  Empty,
  Input,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchAuditLogs,
  type AuditPayload,
  type AuditQueryParams,
  type LogRow,
} from '@/services/audit';

const { Text, Paragraph } = Typography;

type SeverityFilter = 'all' | NonNullable<LogRow['severity']>;
type TimeWindow = '24h' | '7d' | '30d' | 'all';

export default function AuditLogs(): JSX.Element {
  const [query, setQuery] = React.useState<AuditQueryParams>({
    page: 1,
    pageSize: 20,
    sort: '-ts',
  });
  const [searchValue, setSearchValue] = React.useState('');
  const [severityFilter, setSeverityFilter] =
    React.useState<SeverityFilter>('all');
  const [timeWindow, setTimeWindow] = React.useState<TimeWindow>('7d');
  const [detailRow, setDetailRow] = React.useState<LogRow | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = React.useState<string | null>(
    null,
  );

  // ahooks v3: useRequest<Data, ParamsTuple>
  const {
    data,
    loading,
    error,
    run,
    refresh,
  } = useRequest<AuditPayload, [AuditQueryParams | undefined]>(fetchAuditLogs, {
    manual: true,
    onSuccess: () => {
      setLastRefreshedAt(new Date().toISOString());
    },
  });

  // Initial load
  React.useEffect(() => {
    run(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unauthorized =
    (error as any)?.response?.status === 403 ||
    (error as any)?.status === 403;

  const logs: LogRow[] = data?.items ?? [];

  // Time-window filter applied client-side on top of server pagination
  let visibleLogs: LogRow[] = logs;
  if (timeWindow !== 'all') {
    const now = dayjs();
    const threshold =
      timeWindow === '24h'
        ? now.subtract(24, 'hour')
        : timeWindow === '7d'
        ? now.subtract(7, 'day')
        : now.subtract(30, 'day');

    visibleLogs = logs.filter((log) => {
      if (!log.ts) return false;
      const ts = dayjs(log.ts);
      return ts.isAfter(threshold);
    });
  }

  // Local stats for the KPI band
  let infoCount = 0;
  let warnCount = 0;
  let criticalCount = 0;
  let okStatus = 0;
  let warnStatus = 0;
  let errorStatus = 0;

  for (const log of visibleLogs) {
    if (log.severity === 'info') infoCount += 1;
    if (log.severity === 'warn') warnCount += 1;
    if (log.severity === 'critical') criticalCount += 1;

    if (log.status === 'ok') okStatus += 1;
    if (log.status === 'warn') warnStatus += 1;
    if (log.status === 'error') errorStatus += 1;
  }

  const totalCount = data?.total ?? logs.length;
  const pageCount = visibleLogs.length;

  const severityTag = (severity?: LogRow['severity']): ReactNode => {
    switch (severity) {
      case 'critical':
        return <Tag color="red">critical</Tag>;
      case 'warn':
        return <Tag color="orange">warn</Tag>;
      case 'info':
        return <Tag color="blue">info</Tag>;
      default:
        return <Tag>unknown</Tag>;
    }
  };

  const statusTag = (status?: LogRow['status']): ReactNode => {
    switch (status) {
      case 'ok':
        return <Tag color="green">ok</Tag>;
      case 'warn':
        return (
          <Tag color="gold">
            <InfoCircleOutlined /> warn
          </Tag>
        );
      case 'error':
        return <Tag color="red">error</Tag>;
      default:
        return null;
    }
  };

  const columns: ProColumns<LogRow>[] = [
    {
      title: 'Time',
      dataIndex: 'ts',
      valueType: 'dateTime' as const,
      width: 190,
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: 'Actor & context',
      dataIndex: 'actor',
      width: 260,
      ellipsis: true,
      render: (_: ReactNode, record) => (
        <Space direction="vertical" size={2}>
          <Text>{record.actor || 'System'}</Text>
          <Space size={4} wrap>
            {record.entity && <Tag>{record.entity}</Tag>}
            {record.entityId && (
              <Tag color="purple">#{String(record.entityId)}</Tag>
            )}
            {record.ip && (
              <Tooltip title="Source IP address">
                <Tag icon={<InfoCircleOutlined />}>{record.ip}</Tag>
              </Tooltip>
            )}
          </Space>
        </Space>
      ),
    },
    {
      title: 'Event',
      dataIndex: 'action',
      width: 320,
      ellipsis: true,
      render: (_: ReactNode, record) => (
        <Space direction="vertical" size={2} style={{ width: '100%' }}>
          <Text strong>{record.action}</Text>
          {record.target && (
            <Text
              type="secondary"
              ellipsis={{ tooltip: record.target }}
              style={{ maxWidth: 280 }}
            >
              {record.target}
            </Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 140,
      filters: [
        { text: 'Info', value: 'info' },
        { text: 'Warn', value: 'warn' },
        { text: 'Critical', value: 'critical' },
      ],
      onFilter: (value, record) =>
        record.severity === (String(value) as LogRow['severity']),
      render: (_dom: ReactNode, record: LogRow) => severityTag(record.severity),
    },
    {
      title: 'Outcome',
      dataIndex: 'status',
      width: 140,
      filters: [
        { text: 'OK', value: 'ok' },
        { text: 'Warn', value: 'warn' },
        { text: 'Error', value: 'error' },
      ],
      onFilter: (value, record) =>
        record.status === (String(value) as LogRow['status']),
      render: (_dom: ReactNode, record: LogRow) => statusTag(record.status),
    },
    {
      title: 'Details',
      key: 'details',
      width: 140,
      fixed: 'right',
      render: (_: ReactNode, record) => (
        <Button
          size="small"
          icon={<EyeOutlined />}
          onClick={() => setDetailRow(record)}
        >
          Inspect
        </Button>
      ),
    },
  ];

  const handleTableChange = (
    pagination: any,
    _filters: any,
    sorter: any,
  ): void => {
    setQuery((prev) => {
      const next: AuditQueryParams = {
        ...prev,
        page: pagination?.current ?? 1,
        pageSize: pagination?.pageSize ?? prev.pageSize ?? 20,
      };

      const sortItem = Array.isArray(sorter) ? sorter[0] : sorter;
      const sortField = sortItem?.field as string | undefined;
      const sortOrder = sortItem?.order as
        | 'ascend'
        | 'descend'
        | undefined;

      if (sortField && sortOrder) {
        next.sort = `${sortOrder === 'descend' ? '-' : ''}${sortField}`;
      }

      run(next);
      return next;
    });
  };

  const handleSeverityChange = (value: string | number): void => {
    const val = value as SeverityFilter;
    setSeverityFilter(val);
    setQuery((prev) => {
      const next: AuditQueryParams = {
        ...prev,
        page: 1,
        severity: val === 'all' ? undefined : (val as LogRow['severity']),
      };
      run(next);
      return next;
    });
  };

  const handleSearch = (value: string): void => {
    const trimmed = value.trim();
    setSearchValue(trimmed);
    setQuery((prev) => {
      const next: AuditQueryParams = {
        ...prev,
        page: 1,
        q: trimmed || undefined,
      };
      run(next);
      return next;
    });
  };

  const lastRefreshedLabel = lastRefreshedAt
    ? dayjs(lastRefreshedAt).format('HH:mm:ss')
    : null;

  const hasAnyData = totalCount > 0;

  const secondaryActions = (
    <Space>
      {lastRefreshedLabel && (
        <Tooltip title={`Last refreshed at ${lastRefreshedLabel}`}>
          <Badge
            count={<ClockCircleOutlined style={{ color: '#52c41a' }} />}
          />
        </Tooltip>
      )}
      <Button
        icon={<ReloadOutlined />}
        size="small"
        onClick={() => refresh()}
      />
    </Space>
  );

  return (
    <EthikosPageShell
      title="Audit logs"
      sectionLabel="Admin"
      subtitle="Immutable trail of sensitive actions across Ethikos for governance, debugging, and incident response."
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={loading}>
        {!hasAnyData && !loading && !error && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No audit events have been recorded yet."
            style={{ marginBottom: 16 }}
          />
        )}

        {unauthorized && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="You do not have permission to view audit logs."
            description="Ask an administrator to grant you the ADMIN role in Ethikos to access the audit trail."
          />
        )}

        {error && !unauthorized && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message="Unable to load audit logs."
            description="Check your connection or try again. If the problem persists, the Ethikos audit service may be temporarily unavailable."
          />
        )}

        {/* KPI band */}
        <ProCard gutter={16} wrap style={{ marginBottom: 16 }} ghost>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 6 }}
            statistic={{
              title: 'Events (all)',
              value: totalCount,
              description: 'Total events matching current server filters',
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 6 }}
            statistic={{
              title: 'Events in view',
              value: pageCount,
              description: 'After local time window filter',
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 6 }}
            statistic={{
              title: 'Critical / Warn',
              value: criticalCount,
              suffix:
                warnCount > 0 ? ` critical · ${warnCount} warn` : ' critical',
              description: 'On the current page',
            }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, md: 6 }}
            statistic={{
              title: 'Outcome (ok / warn / error)',
              value: okStatus,
              suffix: ` / ${warnStatus} / ${errorStatus}`,
              description: 'Status of operations on this page',
            }}
          />
        </ProCard>

        {/* Filters */}
        <ProCard ghost style={{ marginBottom: 16 }}>
          <Space wrap align="center" size={[16, 12]}>
            <Space>
              <FilterOutlined />
              <Text strong>Filters</Text>
            </Space>

            <Segmented
              options={[
                { label: 'All severities', value: 'all' },
                { label: 'Info', value: 'info' },
                { label: 'Warn', value: 'warn' },
                { label: 'Critical', value: 'critical' },
              ]}
              value={severityFilter}
              onChange={handleSeverityChange}
            />

            <Segmented
              options={[
                { label: 'Last 24h', value: '24h' },
                { label: '7 days', value: '7d' },
                { label: '30 days', value: '30d' },
                { label: 'All time', value: 'all' },
              ]}
              value={timeWindow}
              onChange={(value) =>
                setTimeWindow(value as TimeWindow)
              }
            />

            <Input.Search
              allowClear
              placeholder="Search actor, action, or target"
              style={{ width: 280 }}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onSearch={handleSearch}
            />
          </Space>
        </ProCard>

        {/* Main table */}
        <ProTable<LogRow>
          rowKey="id"
          search={false}
          options={false}
          loading={loading}
          columns={columns}
          dataSource={visibleLogs}
          pagination={{
            current: data?.page ?? query.page ?? 1,
            pageSize: data?.pageSize ?? query.pageSize ?? 20,
            total: data?.total,
            showSizeChanger: true,
            showTotal: (total) => `${total} events`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1100 }}
          locale={{
            emptyText: unauthorized
              ? 'Access denied for audit logs.'
              : 'No audit events to display.',
          }}
        />

        {/* Detail drawer */}
        <Drawer
          title="Audit event details"
          width={520}
          open={!!detailRow}
          onClose={() => setDetailRow(null)}
          destroyOnClose
        >
          {detailRow && (
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space wrap>
                {severityTag(detailRow.severity)}
                {statusTag(detailRow.status)}
                {detailRow.entity && <Tag>{detailRow.entity}</Tag>}
                {detailRow.entityId && (
                  <Tag color="purple">#{String(detailRow.entityId)}</Tag>
                )}
              </Space>

              <Descriptions column={1} size="small" bordered>
                <Descriptions.Item label="Time">
                  {dayjs(detailRow.ts).format('YYYY-MM-DD HH:mm:ss')}
                </Descriptions.Item>
                <Descriptions.Item label="Actor">
                  {detailRow.actor || (
                    <Text type="secondary">System</Text>
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Action">
                  {detailRow.action}
                </Descriptions.Item>
                {detailRow.target && (
                  <Descriptions.Item label="Target">
                    {detailRow.target}
                  </Descriptions.Item>
                )}
                {detailRow.ip && (
                  <Descriptions.Item label="Source IP">
                    {detailRow.ip}
                  </Descriptions.Item>
                )}
                {detailRow.status && (
                  <Descriptions.Item label="Outcome">
                    {statusTag(detailRow.status)}
                  </Descriptions.Item>
                )}
              </Descriptions>

              {detailRow.meta &&
                Object.keys(detailRow.meta).length > 0 && (
                  <div>
                    <Text strong>Raw metadata</Text>
                    <Paragraph type="secondary">
                      JSON payload supplied by the backend for this
                      event.
                    </Paragraph>
                    <pre
                      style={{
                        maxHeight: 260,
                        overflow: 'auto',
                        background: '#f5f5f5',
                        padding: 12,
                        borderRadius: 4,
                        fontSize: 12,
                      }}
                    >
                      {JSON.stringify(detailRow.meta, null, 2)}
                    </pre>
                  </div>
                )}
            </Space>
          )}
        </Drawer>
      </PageContainer>
    </EthikosPageShell>
  );
}
