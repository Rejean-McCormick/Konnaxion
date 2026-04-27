// FILE: frontend/app/ethikos/decide/results/page.tsx
// app/ethikos/decide/results/page.tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  DatePicker,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useRequest } from 'ahooks';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchDecisionResults,
  type DecisionResult,
  type DecisionScope,
} from '@/services/decide';

const { RangePicker } = DatePicker;
const { Text } = Typography;

type ScopeFilter = 'all' | DecisionScope;
type ResultFilter = 'all' | 'passed' | 'rejected';
type RangeValue = [Dayjs | null, Dayjs | null] | null;

type DecisionResultsData = Awaited<ReturnType<typeof fetchDecisionResults>>;
type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isDecisionScope(value: unknown): value is DecisionScope {
  return value === 'Elite' || value === 'Public';
}

function normalizeDecisionScope(value: unknown): DecisionScope {
  return isDecisionScope(value) ? value : 'Public';
}

function normalizeDecisionResult(value: unknown): DecisionResult | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value.id;
  const title = value.title;
  const passed = value.passed;
  const closesAt = value.closesAt ?? value.closes_at ?? value.closedAt;

  if (
    (typeof id !== 'string' && typeof id !== 'number') ||
    typeof title !== 'string' ||
    typeof passed !== 'boolean' ||
    typeof closesAt !== 'string'
  ) {
    return null;
  }

  const region = value.region;

  return {
    id: String(id),
    title,
    scope: normalizeDecisionScope(value.scope),
    passed,
    closesAt,
    region: typeof region === 'string' && region.trim() ? region : undefined,
  };
}

function extractDecisionItems(raw: unknown): DecisionResult[] {
  if (!raw) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.map(normalizeDecisionResult).filter(Boolean);
  }

  if (!isRecord(raw)) {
    return [];
  }

  const payload = isRecord(raw.data) ? raw.data : raw;

  if (Array.isArray(payload.items)) {
    return payload.items.map(normalizeDecisionResult).filter(Boolean);
  }

  if (Array.isArray(payload.results)) {
    return payload.results.map(normalizeDecisionResult).filter(Boolean);
  }

  if (Array.isArray(payload.data)) {
    return payload.data.map(normalizeDecisionResult).filter(Boolean);
  }

  return [];
}

function formatDate(value: string): string {
  const parsed = dayjs(value);

  if (!parsed.isValid()) {
    return value;
  }

  return parsed.format('YYYY-MM-DD HH:mm');
}

function toTimestamp(value: string): number {
  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.valueOf() : 0;
}

export default function ResultsArchive(): JSX.Element {
  const { data, loading, error, refresh } = useRequest<DecisionResultsData, []>(
    fetchDecisionResults,
  );

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');
  const [range, setRange] = useState<RangeValue>(null);

  const items = useMemo(() => extractDecisionItems(data), [data]);

  const allRegions = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.region)
            .filter((region): region is string => Boolean(region)),
        ),
      ).sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (scopeFilter !== 'all' && item.scope !== scopeFilter) {
          return false;
        }

        if (resultFilter === 'passed' && !item.passed) {
          return false;
        }

        if (resultFilter === 'rejected' && item.passed) {
          return false;
        }

        if (regionFilter !== 'all' && item.region !== regionFilter) {
          return false;
        }

        if (range?.[0] && range?.[1]) {
          const [start, end] = range;
          const closedTs = toTimestamp(item.closesAt);
          const startTs = start.startOf('day').valueOf();
          const endTs = end.endOf('day').valueOf();

          if (closedTs < startTs || closedTs > endTs) {
            return false;
          }
        }

        return true;
      }),
    [items, range, regionFilter, resultFilter, scopeFilter],
  );

  const totalDecisions = items.length;
  const filteredDecisionCount = filteredItems.length;
  const passedCount = items.filter((item) => item.passed).length;
  const rejectedCount = totalDecisions - passedCount;
  const passRate = totalDecisions
    ? Math.round((passedCount / totalDecisions) * 100)
    : 0;
  const coveredRegions = allRegions.length;

  const columns: ProColumns<DecisionResult>[] = [
    {
      title: 'Title',
      dataIndex: 'title',
      width: 320,
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Result',
      dataIndex: 'passed',
      width: 140,
      filters: [
        { text: 'Passed', value: 'passed' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) =>
        String(value) === 'passed' ? record.passed : !record.passed,
      render: (_dom, row) => (
        <Tag color={row.passed ? 'green' : 'red'}>
          {row.passed ? 'PASSED' : 'REJECTED'}
        </Tag>
      ),
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      width: 120,
      filters: [
        { text: 'Elite', value: 'Elite' },
        { text: 'Public', value: 'Public' },
      ],
      onFilter: (value, record) => record.scope === String(value),
      render: (_dom, row) => <Tag>{row.scope}</Tag>,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: 180,
      ellipsis: true,
      render: (_dom, row) => row.region ?? '—',
    },
    {
      title: 'Closed',
      dataIndex: 'closesAt',
      width: 200,
      sorter: (a, b) => toTimestamp(a.closesAt) - toTimestamp(b.closesAt),
      defaultSortOrder: 'descend',
      render: (_dom, row) => (
        <Text type="secondary">{formatDate(row.closesAt)}</Text>
      ),
    },
  ];

  return (
    <EthikosPageShell
      title="Decide · Results Archive"
      sectionLabel="Decide"
      subtitle={
        <span>
          Historical record of closed Ethikos decisions across elite and public
          scopes. Filter by outcome, region and closing period, or jump to open
          ballots.
        </span>
      }
      primaryAction={
        <Link href="/ethikos/decide/methodology" prefetch={false}>
          <Button type="primary" icon={<InfoCircleOutlined />}>
            Voting methodology
          </Button>
        </Link>
      }
      secondaryActions={
        <Space wrap>
          <Link href="/ethikos/decide/elite" prefetch={false}>
            <Button>Elite ballots</Button>
          </Link>
          <Link href="/ethikos/decide/public" prefetch={false}>
            <Button>Public ballots</Button>
          </Link>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refresh()}
            type="default"
            size="small"
            loading={loading}
          >
            Refresh
          </Button>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="How to read this archive"
            description={
              <span>
                Each row is a closed Ethikos decision with its final outcome and
                scope. Pass/fail is derived from the aggregated stance direction
                at the time the vote closed. For details, see the voting
                methodology.
              </span>
            }
          />

          {error && (
            <Alert
              type="error"
              showIcon
              message="Unable to load decision results."
              description="Check the Decide service or refresh this page."
            />
          )}

          <ProCard gutter={16} wrap>
            <StatisticCard
              colSpan={{ xs: 24, sm: 8 }}
              statistic={{
                title: 'Closed decisions',
                value: totalDecisions,
                description:
                  filteredDecisionCount === totalDecisions
                    ? 'All archived decisions'
                    : `${filteredDecisionCount} currently visible`,
              }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 8 }}
              statistic={{
                title: 'Pass rate',
                value: `${passRate}%`,
                description:
                  totalDecisions > 0
                    ? `${passedCount} passed · ${rejectedCount} rejected`
                    : 'No decisions yet',
              }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 8 }}
              statistic={{
                title: 'Regions covered',
                value: coveredRegions,
                description:
                  coveredRegions > 0
                    ? 'Distinct policy domains'
                    : 'No regional data',
              }}
            />
          </ProCard>

          <ProCard
            ghost
            title="Filters"
            extra={
              <Text type="secondary">
                Scope, outcome, region and closing period
              </Text>
            }
          >
            <Space wrap>
              <Segmented
                value={scopeFilter}
                onChange={(value) => setScopeFilter(value as ScopeFilter)}
                options={[
                  { label: 'All scopes', value: 'all' },
                  { label: 'Elite only', value: 'Elite' },
                  { label: 'Public only', value: 'Public' },
                ]}
              />

              <Segmented
                value={resultFilter}
                onChange={(value) => setResultFilter(value as ResultFilter)}
                options={[
                  { label: 'All outcomes', value: 'all' },
                  { label: 'Passed', value: 'passed' },
                  { label: 'Rejected', value: 'rejected' },
                ]}
              />

              <Select
                placeholder="Region (all)"
                style={{ minWidth: 200 }}
                allowClear
                value={regionFilter === 'all' ? undefined : regionFilter}
                onChange={(value) =>
                  setRegionFilter((value as string | undefined) ?? 'all')
                }
                options={allRegions.map((region) => ({
                  label: region,
                  value: region,
                }))}
                disabled={allRegions.length === 0}
              />

              <RangePicker
                value={range}
                onChange={(value) => setRange(value as RangeValue)}
                allowEmpty={[true, true]}
              />
            </Space>
          </ProCard>

          <ProTable<DecisionResult>
            rowKey="id"
            columns={columns}
            dataSource={filteredItems}
            pagination={{
              pageSize: 12,
              showSizeChanger: true,
              showTotal: (total) => `${total} decisions`,
            }}
            search={false}
            options={false}
            toolBarRender={false}
          />
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}