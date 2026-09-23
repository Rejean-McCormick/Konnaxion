// FILE: frontend/app/ethikos/admin/audit/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import {
  ClockCircleOutlined,
  EyeOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
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
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { ReactNode } from 'react';
import React from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  type AuditPayload,
  type AuditQueryParams,
  fetchAuditLogs,
  type LogRow,
} from '@/services/audit';

dayjs.extend(relativeTime);

const { Text, Paragraph } = Typography;

type Severity = NonNullable<LogRow['severity']>;
type SeverityFilter = 'all' | Severity;
type TimeWindow = '24h' | '7d' | '30d' | 'all';

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isUnauthorizedError(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  if (error.status === 403) {
    return true;
  }

  const response = error.response;

  return isRecord(response) && response.status === 403;
}

function formatDate(i18nT: TranslateFunction, value?: string): string {
  if (!value) {
    return i18nT("ui.ethikos.admin.audit.unknown_bc7819");
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm:ss') : value;
}

function isWithinWindow(log: LogRow, timeWindow: TimeWindow): boolean {
  if (timeWindow === 'all') {
    return true;
  }

  if (!log.ts) {
    return false;
  }

  const timestamp = dayjs(log.ts);

  if (!timestamp.isValid()) {
    return false;
  }

  const now = dayjs();

  const threshold =
    timeWindow === '24h'
      ? now.subtract(24, 'hour')
      : timeWindow === '7d'
        ? now.subtract(7, 'day')
        : now.subtract(30, 'day');

  return timestamp.isAfter(threshold);
}

function severityTag(severity?: LogRow['severity']): ReactNode {
  if (severity === 'critical') {
    return <Tag color="red"><TranslatedText id="ui.ethikos.admin.audit.critical" /></Tag>;
  }

  if (severity === 'warn') {
    return <Tag color="orange"><TranslatedText id="ui.ethikos.admin.audit.warn" /></Tag>;
  }

  if (severity === 'info') {
    return <Tag color="blue"><TranslatedText id="ui.ethikos.admin.audit.info" /></Tag>;
  }

  return <Tag><TranslatedText id="ui.ethikos.admin.audit.unknown" /></Tag>;
}

function statusTag(status?: LogRow['status']): ReactNode {
  if (status === 'ok') {
    return <Tag color="green"><TranslatedText id="ui.ethikos.admin.audit.ok" /></Tag>;
  }

  if (status === 'warn') {
    return <Tag color="orange"><TranslatedText id="ui.ethikos.admin.audit.warn" /></Tag>;
  }

  if (status === 'error') {
    return <Tag color="red"><TranslatedText id="ui.ethikos.admin.audit.error" /></Tag>;
  }

  return <Tag><TranslatedText id="ui.ethikos.admin.audit.unknown" /></Tag>;
}

function normalizeSearch(value: string): string {
  return value.trim();
}

function buildQuery(
  previous: AuditQueryParams,
  searchValue: string,
  severityFilter: SeverityFilter,
): AuditQueryParams {
  const next: AuditQueryParams = {
    ...previous,
    page: 1,
    q: normalizeSearch(searchValue) || undefined,
    severity: severityFilter === 'all' ? undefined : severityFilter,
  };

  return next;
}

export default function AuditLogs(): JSX.Element {
  const { t: i18nT } = useLanguage();
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

  const {
    data,
    loading,
    error,
    run,
  } = useRequest<AuditPayload, [AuditQueryParams | undefined]>(
    fetchAuditLogs,
    {
      manual: true,
      onSuccess: () => {
        setLastRefreshedAt(new Date().toISOString());
      },
    },
  );

  React.useEffect(() => {
    run(query);
  }, [query, run]);

  const unauthorized = isUnauthorizedError(error);

  const logs: LogRow[] = data?.items ?? [];

  const visibleLogs = React.useMemo(
    () => logs.filter((log) => isWithinWindow(log, timeWindow)),
    [logs, timeWindow],
  );

  const stats = React.useMemo(() => {
    let infoCount = 0;
    let warnCount = 0;
    let criticalCount = 0;
    let okStatus = 0;
    let warnStatus = 0;
    let errorStatus = 0;

    for (const log of visibleLogs) {
      if (log.severity === 'info') {
        infoCount += 1;
      }

      if (log.severity === 'warn') {
        warnCount += 1;
      }

      if (log.severity === 'critical') {
        criticalCount += 1;
      }

      if (log.status === 'ok') {
        okStatus += 1;
      }

      if (log.status === 'warn') {
        warnStatus += 1;
      }

      if (log.status === 'error') {
        errorStatus += 1;
      }
    }

    return {
      infoCount,
      warnCount,
      criticalCount,
      okStatus,
      warnStatus,
      errorStatus,
      totalCount: data?.total ?? logs.length,
      pageCount: visibleLogs.length,
    };
  }, [data?.total, logs.length, visibleLogs]);

  const applyFilters = React.useCallback(
    (nextSearchValue = searchValue, nextSeverityFilter = severityFilter) => {
      const nextQuery = buildQuery(
        query,
        nextSearchValue,
        nextSeverityFilter,
      );

      setQuery(nextQuery);
    },
    [query, searchValue, severityFilter],
  );

  const refreshLogs = React.useCallback(() => {
    run(query);
  }, [query, run]);

  const handleSearch = React.useCallback(
    (value: string) => {
      const nextSearchValue = normalizeSearch(value);

      setSearchValue(nextSearchValue);
      applyFilters(nextSearchValue, severityFilter);
    },
    [applyFilters, severityFilter],
  );

  const handleSeverityChange = React.useCallback(
    (value: SeverityFilter) => {
      setSeverityFilter(value);
      applyFilters(searchValue, value);
    },
    [applyFilters, searchValue],
  );

  const columns = React.useMemo<ProColumns<LogRow>[]>(
    () => [
      {
        title: i18nT("ui.ethikos.admin.audit.time"),
        dataIndex: 'ts',
        valueType: 'dateTime',
        width: 180,
        sorter: (left, right) =>
          dayjs(left.ts).valueOf() - dayjs(right.ts).valueOf(),
        render: (_dom, row) => (
          <Space direction="vertical" size={0}>
            <Text>{formatDate(i18nT, row.ts)}</Text>
            <Text type="secondary">{dayjs(row.ts).fromNow()}</Text>
          </Space>
        ),
      },
      {
        title: i18nT("ui.ethikos.admin.audit.actor"),
        dataIndex: 'actor',
        width: 180,
        ellipsis: true,
        render: (_dom, row) =>
          row.actor ? (
            <Text>{row.actor}</Text>
          ) : (
            <Text type="secondary">{i18nT("ui.ethikos.admin.audit.system")}</Text>
          ),
      },
      {
        title: i18nT("ui.ethikos.admin.audit.action"),
        dataIndex: 'action',
        width: 220,
        ellipsis: true,
        render: (_dom, row) => (
          <Space direction="vertical" size={0}>
            <Text strong>{row.action}</Text>
            {row.entity && (
              <Text type="secondary">
                {row.entity}
                {row.entityId ? i18nT("ui.ethikos.admin.audit.text", { entityId: row.entityId }) : ''}
              </Text>
            )}
          </Space>
        ),
      },
      {
        title: i18nT("ui.ethikos.admin.audit.target"),
        dataIndex: 'target',
        ellipsis: true,
        render: (_dom, row) =>
          row.target ? (
            <Text>{row.target}</Text>
          ) : (
            <Text type="secondary">{i18nT("ui.ethikos.admin.audit.noTarget")}</Text>
          ),
      },
      {
        title: i18nT("ui.ethikos.admin.audit.severity"),
        dataIndex: 'severity',
        width: 130,
        filters: [
          { text: i18nT("ui.ethikos.admin.audit.info_4b631f"), value: 'info' },
          { text: i18nT("ui.ethikos.admin.audit.warn_3009d5"), value: 'warn' },
          { text: i18nT("ui.ethikos.admin.audit.critical_04b7b2"), value: 'critical' },
        ],
        onFilter: (value, row) => row.severity === String(value),
        render: (_dom, row) => severityTag(row.severity),
      },
      {
        title: i18nT("ui.ethikos.admin.audit.outcome"),
        dataIndex: 'status',
        width: 120,
        filters: [
          { text: i18nT("ui.ethikos.admin.audit.ok_9ce3bd"), value: 'ok' },
          { text: i18nT("ui.ethikos.admin.audit.warn_3009d5"), value: 'warn' },
          { text: i18nT("ui.ethikos.admin.audit.error_7f2f6a"), value: 'error' },
        ],
        onFilter: (value, row) => row.status === String(value),
        render: (_dom, row) => statusTag(row.status),
      },
      {
        title: i18nT("ui.ethikos.admin.audit.details"),
        valueType: 'option',
        width: 110,
        render: (_dom, row) => [
          <Tooltip key="view" title={i18nT("ui.ethikos.admin.audit.viewAuditEventDetails")}>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => setDetailRow(row)}
            >
              {i18nT("ui.ethikos.admin.audit.view")}
            </Button>
          </Tooltip>,
        ],
      },
    ],
    [i18nT],
  );

  const primaryAction = (
    <Button
      icon={<ReloadOutlined />}
      type="primary"
      onClick={refreshLogs}
      loading={loading}
    >
      {i18nT("ui.ethikos.admin.audit.refresh")}
    </Button>
  );

  const secondaryActions = (
    <Space wrap>
      <Input.Search
        allowClear
        placeholder={i18nT("ui.ethikos.admin.audit.searchActorActionTarget")}
        value={searchValue}
        onChange={(event) => setSearchValue(event.target.value)}
        onSearch={handleSearch}
        style={{ width: 280 }}
      />

      <Segmented<SeverityFilter>
        value={severityFilter}
        onChange={handleSeverityChange}
        options={[
          { label: i18nT("ui.ethikos.admin.audit.allSeverity"), value: 'all' },
          { label: i18nT("ui.ethikos.admin.audit.info_4b631f"), value: 'info' },
          { label: i18nT("ui.ethikos.admin.audit.warn_3009d5"), value: 'warn' },
          { label: i18nT("ui.ethikos.admin.audit.critical_04b7b2"), value: 'critical' },
        ]}
      />

      <Segmented<TimeWindow>
        value={timeWindow}
        onChange={setTimeWindow}
        options={[
          { label: i18nT("ui.ethikos.admin.audit.text24h"), value: '24h' },
          { label: i18nT("ui.ethikos.admin.audit.text7d"), value: '7d' },
          { label: i18nT("ui.ethikos.admin.audit.text30d"), value: '30d' },
          { label: i18nT("ui.ethikos.admin.audit.all"), value: 'all' },
        ]}
      />
    </Space>
  );

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.admin.audit.auditLogs")}
      sectionLabel={i18nT("ui.ethikos.admin.audit.admin")}
      subtitle={i18nT("ui.ethikos.admin.audit.inspectGovernanceModerationAndSystemEventsAcross")}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {unauthorized && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.admin.audit.accessDeniedForAuditLogs")}
              description={i18nT("ui.ethikos.admin.audit.youNeedAnEthikosAdminRoleTo")}
            />
          )}

          {error && !unauthorized && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.admin.audit.unableToLoadAuditLogs")}
              description={i18nT("ui.ethikos.admin.audit.checkYourConnectionOrRetryTheAudit")}
              action={
                <Button size="small" onClick={refreshLogs}>
                  {i18nT("ui.ethikos.admin.audit.retry")}
                </Button>
              }
            />
          )}

          <ProCard gutter={16} wrap>
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.admin.audit.totalEvents"),
                value: stats.totalCount,
                description: (
                  <Text type="secondary">
                    {stats.pageCount} {i18nT("ui.ethikos.admin.audit.visibleInCurrentWindow")}
                  </Text>
                ),
              }}
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.admin.audit.warnings"),
                value: stats.warnCount,
                description: (
                  <Space size={4}>
                    <Badge status="warning" />
                    <Text type="secondary">{i18nT("ui.ethikos.admin.audit.requiresReview")}</Text>
                  </Space>
                ),
              }}
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.admin.audit.critical_04b7b2"),
                value: stats.criticalCount,
                description: (
                  <Space size={4}>
                    <Badge status="error" />
                    <Text type="secondary">{i18nT("ui.ethikos.admin.audit.highPriorityEvents")}</Text>
                  </Space>
                ),
              }}
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.admin.audit.errors"),
                value: stats.errorStatus,
                description: (
                  <Text type="secondary">
                    {stats.okStatus} {i18nT("ui.ethikos.admin.audit.ok_598a27")} {stats.warnStatus} {i18nT("ui.ethikos.admin.audit.warn_57b875")}{' '}
                    {stats.infoCount} {i18nT("ui.ethikos.admin.audit.info")}
                  </Text>
                ),
              }}
            />
          </ProCard>

          <Alert
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            message={i18nT("ui.ethikos.admin.audit.ethikosAuditStream")}
            description={
              <Space direction="vertical" size={4}>
                <Text type="secondary">
                  {i18nT("ui.ethikos.admin.audit.useThisPageToReviewModerationActions")}
                </Text>
                {lastRefreshedAt && (
                  <Text type="secondary">
                    {i18nT("ui.ethikos.admin.audit.lastRefreshed")} {formatDate(i18nT, lastRefreshedAt)}
                  </Text>
                )}
              </Space>
            }
          />

          <ProTable<LogRow>
            rowKey="id"
            columns={columns}
            dataSource={visibleLogs}
            loading={loading}
            search={false}
            options={false}
            scroll={{ x: 1100 }}
            pagination={{
              current: query.page ?? data?.page ?? 1,
              pageSize: query.pageSize ?? data?.pageSize ?? 20,
              total: data?.total ?? visibleLogs.length,
              showSizeChanger: true,
              showTotal: (total) => i18nT("ui.ethikos.admin.audit.auditEventsCount", { count: total }),
              onChange: (page, pageSize) => {
                setQuery((previous) => ({
                  ...previous,
                  page,
                  pageSize,
                }));
              },
            }}
            toolBarRender={() => [
              <Space key="filters" wrap>
                <Tag icon={<FilterOutlined />}>
                  {severityFilter === 'all'
                    ? i18nT("ui.ethikos.admin.audit.allSeverities")
                    : severityFilter}
                </Tag>
                <Tag icon={<ClockCircleOutlined />}>{timeWindow}</Tag>
              </Space>,
            ]}
            locale={{
              emptyText: unauthorized ? (
                <Empty description={i18nT("ui.ethikos.admin.audit.accessDeniedForAuditLogs")} />
              ) : (
                <Empty description={i18nT("ui.ethikos.admin.audit.noAuditEventsToDisplay")} />
              ),
            }}
          />

          <Drawer
            title={i18nT("ui.ethikos.admin.audit.auditEventDetails")}
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
                  <Descriptions.Item label={i18nT("ui.ethikos.admin.audit.time")}>
                    {formatDate(i18nT, detailRow.ts)}
                  </Descriptions.Item>

                  <Descriptions.Item label={i18nT("ui.ethikos.admin.audit.actor")}>
                    {detailRow.actor || <Text type="secondary">{i18nT("ui.ethikos.admin.audit.system")}</Text>}
                  </Descriptions.Item>

                  <Descriptions.Item label={i18nT("ui.ethikos.admin.audit.action")}>
                    {detailRow.action}
                  </Descriptions.Item>

                  {detailRow.target && (
                    <Descriptions.Item label={i18nT("ui.ethikos.admin.audit.target")}>
                      {detailRow.target}
                    </Descriptions.Item>
                  )}

                  {detailRow.ip && (
                    <Descriptions.Item label={i18nT("ui.ethikos.admin.audit.sourceIp")}>
                      {detailRow.ip}
                    </Descriptions.Item>
                  )}

                  {detailRow.status && (
                    <Descriptions.Item label={i18nT("ui.ethikos.admin.audit.outcome")}>
                      {statusTag(detailRow.status)}
                    </Descriptions.Item>
                  )}
                </Descriptions>

                {detailRow.meta &&
                  Object.keys(detailRow.meta).length > 0 && (
                    <div>
                      <Text strong>{i18nT("ui.ethikos.admin.audit.rawMetadata")}</Text>
                      <Paragraph type="secondary">
                        {i18nT("ui.ethikos.admin.audit.jsonPayloadSuppliedByTheBackendFor")}
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
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}