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

import EthikosPageShell from '../../EthikosPageShell';
import {
  fetchDecisionResults,
  type DecisionResult,
  type DecisionResultsResponse,
  type DecisionScope,
} from '@/services/decide';

const { RangePicker } = DatePicker;
const { Text } = Typography;

type ScopeFilter = 'all' | DecisionScope;
type ResultFilter = 'all' | 'passed' | 'rejected';
type RangeValue = [Dayjs | null, Dayjs | null] | null;

export default function ResultsArchive(): JSX.Element {
  const { data, loading, refresh } = useRequest<DecisionResultsResponse, []>(
    fetchDecisionResults,
  );

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');
  const [range, setRange] = useState<RangeValue>(null);

  const items = data?.items ?? [];

  const allRegions = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((d) => d.region)
            .filter((r): r is string => !!r),
        ),
      ),
    [items],
  );

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (scopeFilter !== 'all' && item.scope !== scopeFilter) return false;
        if (resultFilter === 'passed' && !item.passed) return false;
        if (resultFilter === 'rejected' && item.passed) return false;
        if (regionFilter !== 'all' && item.region !== regionFilter) return false;

        if (range && range[0] && range[1]) {
          const [start, end] = range as [Dayjs, Dayjs];
          const closedTs = dayjs(item.closesAt).valueOf();
          const startTs = start.startOf('day').valueOf();
          const endTs = end.endOf('day').valueOf();
          if (closedTs < startTs || closedTs > endTs) return false;
        }

        return true;
      }),
    [items, range, regionFilter, resultFilter, scopeFilter],
  );

  const totalDecisions = items.length;
  const passedCount = items.filter((i) => i.passed).length;
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
    },
    {
      title: 'Result',
      dataIndex: 'passed',
      width: 140,
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
      render: (_dom, row) => <Tag>{row.scope}</Tag>,
    },
    {
      title: 'Region',
      dataIndex: 'region',
      width: 160,
      render: (_dom, row) => row.region ?? '—',
    },
    {
      title: 'Closed',
      dataIndex: 'closesAt',
      valueType: 'dateTime',
      width: 200,
      sorter: (a, b) =>
        dayjs(a.closesAt).valueOf() - dayjs(b.closesAt).valueOf(),
      defaultSortOrder: 'descend',
    },
  ];

  return (
    <EthikosPageShell
      title="Decide · Results Archive"
      subtitle={
        <span>
          Historical record of closed Ethikos decisions across elite and public scopes. Filter by
          outcome, region and closing period, or jump to open ballots.
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
        <Space>
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
          >
            Refresh
          </Button>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="How to read this archive"
          description={
            <span>
              Each row is a closed Ethikos decision with its final outcome and scope. Pass/fail is
              derived from the aggregated stance direction at the time the vote closed. For details,
              see the voting methodology.
            </span>
          }
        />

        {/* Summary / KPIs */}
        <ProCard gutter={16} wrap style={{ marginBottom: 16 }}>
          <StatisticCard
            colSpan={{ xs: 24, sm: 8 }}
            statistic={{
              title: 'Closed decisions',
              value: totalDecisions,
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

        {/* Filters */}
        <ProCard
          ghost
          style={{ marginBottom: 16 }}
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
              onChange={(val) => setScopeFilter(val as ScopeFilter)}
              options={[
                { label: 'All scopes', value: 'all' },
                { label: 'Elite only', value: 'Elite' },
                { label: 'Public only', value: 'Public' },
              ]}
            />
            <Segmented
              value={resultFilter}
              onChange={(val) => setResultFilter(val as ResultFilter)}
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
              onChange={(val) =>
                setRegionFilter((val as string | undefined) ?? 'all')
              }
              options={allRegions.map((r) => ({ label: r, value: r }))}
              disabled={allRegions.length === 0}
            />
            <RangePicker
              value={range}
              onChange={(value) => setRange(value as RangeValue)}
              allowEmpty={[true, true]}
            />
          </Space>
        </ProCard>

        {/* Archive table */}
        <ProTable<DecisionResult>
          rowKey="id"
          columns={columns}
          dataSource={filteredItems}
          pagination={{ pageSize: 12 }}
          search={false}
          options={false}
          toolBarRender={false}
        />
      </PageContainer>
    </EthikosPageShell>
  );
}
