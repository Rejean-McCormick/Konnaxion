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
  Empty,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
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
const { Text, Paragraph } = Typography;

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

function route(path: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}sidebar=ethikos`;
}

function ResultTag({ passed }: { passed: boolean }): JSX.Element {
  return (
    <Tag
      color={passed ? 'green' : 'red'}
      icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
    >
      {passed ? 'PASSED' : 'REJECTED'}
    </Tag>
  );
}

function ScopeTag({ scope }: { scope: DecisionScope }): JSX.Element {
  return (
    <Tag color={scope === 'Elite' ? 'geekblue' : 'default'}>
      {scope === 'Elite' ? 'Expert' : 'Public'}
    </Tag>
  );
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
  const publicCount = items.filter((item) => item.scope === 'Public').length;
  const eliteCount = items.filter((item) => item.scope === 'Elite').length;
  const passRate = totalDecisions
    ? Math.round((passedCount / totalDecisions) * 100)
    : 0;
  const coveredRegions = allRegions.length;

  const columns: ProColumns<DecisionResult>[] = [
    {
      title: 'Decision',
      dataIndex: 'title',
      width: 360,
      ellipsis: true,
      sorter: (a, b) => a.title.localeCompare(b.title),
      render: (_dom, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.title}</Text>
          <Text type="secondary">
            {row.region ? row.region : 'No region specified'}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Baseline result',
      dataIndex: 'passed',
      width: 160,
      filters: [
        { text: 'Passed', value: 'passed' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) =>
        String(value) === 'passed' ? record.passed : !record.passed,
      render: (_dom, row) => <ResultTag passed={row.passed} />,
    },
    {
      title: 'Scope',
      dataIndex: 'scope',
      width: 140,
      filters: [
        { text: 'Expert', value: 'Elite' },
        { text: 'Public', value: 'Public' },
      ],
      onFilter: (value, record) => record.scope === String(value),
      render: (_dom, row) => <ScopeTag scope={row.scope} />,
    },
    {
      title: 'Closed',
      dataIndex: 'closesAt',
      width: 190,
      sorter: (a, b) => toTimestamp(a.closesAt) - toTimestamp(b.closesAt),
      defaultSortOrder: 'descend',
      render: (_dom, row) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">{formatDate(row.closesAt)}</Text>
        </Space>
      ),
    },
    {
      title: 'Next step',
      key: 'nextStep',
      width: 170,
      render: () => (
        <Link href={route('/ethikos/impact/tracker')} prefetch={false}>
          <Button size="small" icon={<ArrowRightOutlined />}>
            Track impact
          </Button>
        </Link>
      ),
    },
  ];

  const hasFilters =
    scopeFilter !== 'all' ||
    resultFilter !== 'all' ||
    regionFilter !== 'all' ||
    Boolean(range?.[0] && range?.[1]);

  return (
    <EthikosPageShell
      title="Decision results"
      sectionLabel="Decide"
      subtitle={
        <span>
          Read closed Ethikos decisions clearly: baseline outcome first, method
          context second, and impact tracking next.
        </span>
      }
      primaryAction={
        <Link href={route('/ethikos/decide/methodology')} prefetch={false}>
          <Button type="primary" icon={<InfoCircleOutlined />}>
            Voting methodology
          </Button>
        </Link>
      }
      secondaryActions={
        <Space wrap>
          <Link href={route('/ethikos/decide/public')} prefetch={false}>
            <Button>Public consultations</Button>
          </Link>
          <Link href={route('/ethikos/decide/elite')} prefetch={false}>
            <Button>Expert decisions</Button>
          </Link>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => refresh()}
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
            message="How to read these results"
            description={
              <span>
                The baseline result is the archived pass/fail outcome. If Smart
                Vote or EkoH readings are shown elsewhere, treat them as
                interpretation layers beside the baseline result, not as a
                replacement for it.
              </span>
            }
          />

          {error && (
            <Alert
              type="error"
              showIcon
              message="Unable to load decision results"
              description="Check the Decide service or refresh this page."
            />
          )}

          <ProCard gutter={16} wrap>
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
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
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Baseline pass rate',
                value: passRate,
                suffix: '%',
                description:
                  totalDecisions > 0
                    ? `${passedCount} passed · ${rejectedCount} rejected`
                    : 'No decisions yet',
              }}
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Decision scopes',
                value: totalDecisions,
                description: `${publicCount} public · ${eliteCount} expert`,
              }}
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Regions covered',
                value: coveredRegions,
                description:
                  coveredRegions > 0
                    ? 'Distinct regions or domains'
                    : 'No regional data',
              }}
            />
          </ProCard>

          <ProCard gutter={16} wrap>
            <ProCard
              colSpan={{ xs: 24, lg: 8 }}
              bordered
              title={
                <Space>
                  <CheckCircleOutlined />
                  <span>1. Baseline outcome</span>
                </Space>
              }
            >
              <Paragraph type="secondary">
                Start with the archived pass/fail result. This is the stable
                decision record.
              </Paragraph>
            </ProCard>

            <ProCard
              colSpan={{ xs: 24, lg: 8 }}
              bordered
              title={
                <Space>
                  <SafetyCertificateOutlined />
                  <span>2. Method context</span>
                </Space>
              }
            >
              <Paragraph type="secondary">
                Use the methodology page to understand how public and expert
                decision scopes are interpreted.
              </Paragraph>
            </ProCard>

            <ProCard
              colSpan={{ xs: 24, lg: 8 }}
              bordered
              title={
                <Space>
                  <ArrowRightOutlined />
                  <span>3. Impact follow-up</span>
                </Space>
              }
            >
              <Paragraph type="secondary">
                After reading a result, track whether it led to action,
                evidence, feedback, or revision.
              </Paragraph>
            </ProCard>
          </ProCard>

          <ProCard
            title="Filter the archive"
            extra={
              <Text type="secondary">
                {hasFilters
                  ? `${filteredDecisionCount} matching decisions`
                  : 'All decisions visible'}
              </Text>
            }
          >
            <Space wrap>
              <Segmented
                value={scopeFilter}
                onChange={(value) => setScopeFilter(value as ScopeFilter)}
                options={[
                  { label: 'All scopes', value: 'all' },
                  { label: 'Expert', value: 'Elite' },
                  { label: 'Public', value: 'Public' },
                ]}
              />

              <Segmented
                value={resultFilter}
                onChange={(value) => setResultFilter(value as ResultFilter)}
                options={[
                  { label: 'All results', value: 'all' },
                  { label: 'Passed', value: 'passed' },
                  { label: 'Rejected', value: 'rejected' },
                ]}
              />

              <Select
                placeholder="Region"
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

              {hasFilters && (
                <Button
                  onClick={() => {
                    setScopeFilter('all');
                    setResultFilter('all');
                    setRegionFilter('all');
                    setRange(null);
                  }}
                >
                  Clear filters
                </Button>
              )}
            </Space>
          </ProCard>

          {filteredItems.length === 0 && !loading ? (
            <ProCard>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  hasFilters
                    ? 'No decisions match the current filters.'
                    : 'No archived decisions are available yet.'
                }
              />
            </ProCard>
          ) : (
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
              headerTitle="Archived decisions"
            />
          )}
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}