// FILE: frontend/app/ethikos/decide/results/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
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
  Button,
  DatePicker,
  Empty,
  Segmented,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import Link from 'next/link';
import { useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  type DecisionResult,
  type DecisionScope,
  fetchDecisionResults,
} from '@/services/decide';

const { RangePicker } = DatePicker;
const { Text, Paragraph } = Typography;

type ScopeFilter = 'all' | DecisionScope;
type ResultFilter = 'all' | 'passed' | 'rejected';
type RangeValue = [Dayjs | null, Dayjs | null] | null;

function formatDate(value: string): string {
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD HH:mm') : value;
}

function route(path: string): string {
  return `${path}${path.includes('?') ? '&' : '?'}sidebar=ethikos`;
}

function ResultTag({ passed }: { passed: boolean }): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <Tag
      color={passed ? 'green' : 'red'}
      icon={passed ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
    >
      {passed ? i18nT("ui.ethikos.decide.results.positive") : i18nT("ui.ethikos.decide.results.negative")}
    </Tag>
  );
}

function ScopeTag({ scope }: { scope: DecisionScope }): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <Tag color={scope === 'Elite' ? 'geekblue' : 'default'}>
      {scope === 'Elite' ? i18nT("ui.ethikos.decide.results.expertContext") : i18nT("ui.ethikos.decide.results.public")}
    </Tag>
  );
}

function formatStanceScore(value: number): string {
  const normalized = Math.max(-3, Math.min(3, value));
  return `${normalized >= 0 ? '+' : ''}${normalized.toFixed(2)} / 3`;
}

export default function ResultsArchive(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, loading, error, refresh } = useRequest(fetchDecisionResults);
  const items = data?.items ?? [];

  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all');
  const [resultFilter, setResultFilter] = useState<ResultFilter>('all');
  const [regionFilter, setRegionFilter] = useState<string | 'all'>('all');
  const [range, setRange] = useState<RangeValue>(null);

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
        if (scopeFilter !== 'all' && item.scope !== scopeFilter) return false;
        if (resultFilter === 'passed' && !item.passed) return false;
        if (resultFilter === 'rejected' && item.passed) return false;
        if (regionFilter !== 'all' && item.region !== regionFilter) return false;

        if (range?.[0] && range?.[1]) {
          const closed = dayjs(item.closesAt);
          if (
            !closed.isValid() ||
            closed.isBefore(range[0].startOf('day')) ||
            closed.isAfter(range[1].endOf('day'))
          ) {
            return false;
          }
        }
        return true;
      }),
    [items, range, regionFilter, resultFilter, scopeFilter],
  );

  const availableReadings = items.filter(
    (item) => typeof item.readingScore === 'number',
  ).length;
  const passedCount = items.filter((item) => item.passed).length;

  const columns: ProColumns<DecisionResult>[] = [
    {
      title: i18nT("ui.ethikos.decide.results.decision"),
      dataIndex: 'title',
      width: 330,
      render: (_dom, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{row.title}</Text>
          <Text type="secondary">
            {row.region ?? i18nT("ui.ethikos.decide.results.noCategory")} · {row.participationCount} {i18nT("ui.ethikos.decide.results.stances")}
          </Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.decide.results.publicBaseline"),
      key: 'baseline',
      width: 190,
      render: (_dom, row) => (
        <Space direction="vertical" size={0}>
          <ResultTag passed={row.passed} />
          <Text type="secondary">{formatStanceScore(row.baselineScore)}</Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.decide.results.ekohAdvisoryReading"),
      key: 'reading',
      width: 210,
      render: (_dom, row) =>
        typeof row.readingScore === 'number' ? (
          <Space direction="vertical" size={0}>
            <Tag color="blue">{i18nT("ui.ethikos.decide.results.advisory")}</Tag>
            <Text>{formatStanceScore(row.readingScore)}</Text>
            {row.readingKey && <Text type="secondary">{row.readingKey}</Text>}
          </Space>
        ) : (
          <Text type="secondary">{i18nT("ui.ethikos.decide.results.noDeclaredReading")}</Text>
        ),
    },
    {
      title: i18nT("ui.ethikos.decide.results.context"),
      dataIndex: 'scope',
      width: 170,
      render: (_dom, row) => <ScopeTag scope={row.scope} />,
    },
    {
      title: i18nT("ui.ethikos.decide.results.closed"),
      dataIndex: 'closesAt',
      width: 180,
      render: (_dom, row) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">{formatDate(row.closesAt)}</Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.ethikos.decide.results.next"),
      key: 'next',
      width: 150,
      render: () => (
        <Link href={route('/ethikos/impact/tracker')} prefetch={false}>
          <Button size="small" icon={<ArrowRightOutlined />}>
            {i18nT("ui.ethikos.decide.results.followImpact")}
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
      title={i18nT("ui.ethikos.decide.results.decisionResults")}
      sectionLabel={i18nT("ui.ethikos.decide.results.decide")}
      subtitle={i18nT("ui.ethikos.decide.results.compareThePublicBaselineWithDeclaredAdvisory")}
      primaryAction={
        <Link href={route('/ethikos/decide/methodology')} prefetch={false}>
          <Button type="primary" icon={<InfoCircleOutlined />}>
            {i18nT("ui.ethikos.decide.results.votingMethodology")}
          </Button>
        </Link>
      }
      secondaryActions={
        <Space wrap>
          <Link href={route('/ethikos/decide/public')} prefetch={false}>
            <Button>{i18nT("ui.ethikos.decide.results.publicConsultations")}</Button>
          </Link>
          <Link href={route('/ethikos/decide/elite')} prefetch={false}>
            <Button>{i18nT("ui.ethikos.decide.results.expertContext_ee5748")}</Button>
          </Link>
          <Button icon={<ReloadOutlined />} onClick={() => refresh()} loading={loading}>
            {i18nT("ui.ethikos.decide.results.refresh")}
          </Button>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.decide.results.singleSourceFactsMultipleReadings")}
            description={i18nT("ui.ethikos.decide.results.thePublicBaselineRemainsVisibleEkohSupplies")}
          />

          {error && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.decide.results.unableToLoadDecisionResults")}
              description={i18nT("ui.ethikos.decide.results.checkTheDecideServiceOrRefreshThis")}
            />
          )}

          <ProCard gutter={16} wrap>
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{ title: i18nT("ui.ethikos.decide.results.closedDecisions"), value: items.length }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{ title: i18nT("ui.ethikos.decide.results.positiveBaseline"), value: passedCount }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{ title: i18nT("ui.ethikos.decide.results.availableAdvisoryReadings"), value: availableReadings }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{ title: i18nT("ui.ethikos.decide.results.categoriesRepresented"), value: allRegions.length }}
            />
          </ProCard>

          <ProCard gutter={16} wrap>
            <ProCard
              colSpan={{ xs: 24, lg: 8 }}
              bordered
              title={<Space><CheckCircleOutlined /><span>{i18nT("ui.ethikos.decide.results.text1PublicBaseline")}</span></Space>}
            >
              <Paragraph type="secondary">
                {i18nT("ui.ethikos.decide.results.oneSourceResultFromTheCanonicalEthikos")}
              </Paragraph>
            </ProCard>
            <ProCard
              colSpan={{ xs: 24, lg: 8 }}
              bordered
              title={<Space><SafetyCertificateOutlined /><span>{i18nT("ui.ethikos.decide.results.text2AdvisoryLens")}</span></Space>}
            >
              <Paragraph type="secondary">
                {i18nT("ui.ethikos.decide.results.relevantExpertiseMayProduceASeparateSmart")}
              </Paragraph>
            </ProCard>
            <ProCard
              colSpan={{ xs: 24, lg: 8 }}
              bordered
              title={<Space><ArrowRightOutlined /><span>{i18nT("ui.ethikos.decide.results.text3DecisionContext")}</span></Space>}
            >
              <Paragraph type="secondary">
                {i18nT("ui.ethikos.decide.results.divergenceIsInformationForJudgmentNotAn")}
              </Paragraph>
            </ProCard>
          </ProCard>

          <ProCard title={i18nT("ui.ethikos.decide.results.filterResults")}>
            <Space wrap>
              <Segmented
                value={scopeFilter}
                onChange={(value) => setScopeFilter(value as ScopeFilter)}
                options={[
                  { label: i18nT("ui.ethikos.decide.results.all"), value: 'all' },
                  { label: i18nT("ui.ethikos.decide.results.public_dc5eb7"), value: 'Public' },
                  { label: i18nT("ui.ethikos.decide.results.expertContext_ee5748"), value: 'Elite' },
                ]}
              />
              <Segmented
                value={resultFilter}
                onChange={(value) => setResultFilter(value as ResultFilter)}
                options={[
                  { label: i18nT("ui.ethikos.decide.results.allResults"), value: 'all' },
                  { label: i18nT("ui.ethikos.decide.results.positive_06fe9a"), value: 'passed' },
                  { label: i18nT("ui.ethikos.decide.results.negative_c70827"), value: 'rejected' },
                ]}
              />
              <Select
                placeholder={i18nT("ui.ethikos.decide.results.category")}
                style={{ minWidth: 200 }}
                allowClear
                value={regionFilter === 'all' ? undefined : regionFilter}
                onChange={(value) => setRegionFilter(value ?? 'all')}
                options={allRegions.map((region) => ({ label: region, value: region }))}
              />
              <RangePicker value={range} onChange={(value) => setRange(value as RangeValue)} />
              {hasFilters && (
                <Button
                  onClick={() => {
                    setScopeFilter('all');
                    setResultFilter('all');
                    setRegionFilter('all');
                    setRange(null);
                  }}
                >
                  {i18nT("ui.ethikos.decide.results.clear")}
                </Button>
              )}
            </Space>
          </ProCard>

          {filteredItems.length === 0 && !loading ? (
            <ProCard>
              <Empty description={i18nT("ui.ethikos.decide.results.noArchivedDecisionsMatchTheCurrentFilters")} />
            </ProCard>
          ) : (
            <ProTable<DecisionResult>
              rowKey="id"
              columns={columns}
              dataSource={filteredItems}
              pagination={{ pageSize: 12, showSizeChanger: true }}
              search={false}
              options={false}
              toolBarRender={false}
              headerTitle={i18nT("ui.ethikos.decide.results.archivedDecisions")}
            />
          )}
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}
