// FILE: frontend/app/ethikos/impact/outcomes/page.tsx
// app/ethikos/impact/outcomes/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { scopeLabel } from '@/i18n/uiModelLabels';
import { impactChartTitle, impactKpiLabel } from '@/i18n/uiModelLabels';
import { BarChartOutlined } from '@ant-design/icons';
import { Bar, Line } from '@ant-design/plots';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Divider, Empty, Space, Tabs, Tag, Typography } from 'antd';
import dayjs from 'dayjs';

import styles from './outcomes.module.css';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  type DecisionResult,
  fetchDecisionResults,
} from '@/services/decide';
import { fetchImpactOutcomes } from '@/services/impact';

const { Text } = Typography;

type OutcomesData = Awaited<ReturnType<typeof fetchImpactOutcomes>>;
type DecisionResultsData = Awaited<ReturnType<typeof fetchDecisionResults>>;

type DecisionRow = DecisionResult & { key: string };

export default function Outcomes(): JSX.Element {
  const { t: i18nT, language } = useLanguage();
  const { data: outcomesData, loading: loadingOutcomes } =
    useRequest<OutcomesData, []>(fetchImpactOutcomes);

  const { data: decisionResults, loading: loadingDecisions } =
    useRequest<DecisionResultsData, []>(fetchDecisionResults);

  const loading = loadingOutcomes || loadingDecisions;

  const kpis = outcomesData?.kpis ?? [];
  const charts = (outcomesData?.charts ?? []).map((chart) => {
    if (chart.key !== 'participation-timeline') return chart;

    return {
      ...chart,
      config: {
        ...chart.config,
        data: chart.config.data.map((point) => ({
          ...point,
          date: point.date ? dayjs(point.date).locale(language).format('D MMM') : point.date,
        })),
      },
    };
  });

  const decisionsItems = decisionResults?.items ?? [];

  const decisionRows: DecisionRow[] = decisionsItems.map((d) => ({
    ...d,
    key: d.id,
  }));

  const decisionRegionMap = new Map<
    string,
    { region: string; passed: number; rejected: number }
  >();

  for (const d of decisionRows) {
    const region = d.region ?? 'Unspecified';
    const bucket = decisionRegionMap.get(region) ?? {
      region,
      passed: 0,
      rejected: 0,
    };

    if (d.passed) {
      bucket.passed += 1;
    } else {
      bucket.rejected += 1;
    }

    decisionRegionMap.set(region, bucket);
  }

  const decisionOutcomeData = [
    ...Array.from(decisionRegionMap.values()).map((r) => ({
      region: r.region,
      outcome: 'Passed',
      value: r.passed,
    })),
    ...Array.from(decisionRegionMap.values()).map((r) => ({
      region: r.region,
      outcome: 'Rejected',
      value: r.rejected,
    })),
  ];

  const decisionOutcomeConfig = {
    data: decisionOutcomeData,
    isGroup: true,
    xField: 'region',
    yField: 'value',
    seriesField: 'outcome',
  };

  const decisionsColumns: ProColumns<DecisionRow>[] = [
    {
      title: i18nT("ui.ethikos.impact.outcomes.decision"),
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      width: 260,
    },
    {
      title: i18nT("ui.ethikos.impact.outcomes.result"),
      dataIndex: 'passed',
      key: 'passed',
      width: 120,
      render: (_, row) => (
        <Tag color={row.passed ? 'green' : 'red'}>
          {row.passed ? i18nT("ui.ethikos.impact.outcomes.passed") : i18nT("ui.ethikos.impact.outcomes.rejected")}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.ethikos.impact.outcomes.scope"),
      dataIndex: 'scope',
      key: 'scope',
      width: 120,
      render: (_, row) => (
        <Tag color={row.scope === 'Elite' ? 'geekblue' : 'default'}>
          {scopeLabel(i18nT, row.scope)}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.ethikos.impact.outcomes.region"),
      dataIndex: 'region',
      key: 'region',
      ellipsis: true,
      render: (_, row) =>
        row.region ?? <Text type="secondary">{i18nT("ui.ethikos.impact.outcomes.unspecified")}</Text>,
    },
    {
      title: i18nT("ui.ethikos.impact.outcomes.closedAt"),
      dataIndex: 'closesAt',
      key: 'closesAt',
      width: 180,
      valueType: 'date',
      render: (_, row) => dayjs(row.closesAt).format('YYYY-MM-DD'),
    },
  ];

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.impact.outcomes.impactOutcomes")}
      sectionLabel={i18nT("ui.ethikos.impact.outcomes.impact")}
      subtitle={i18nT("ui.ethikos.impact.outcomes.aggregatedDecisionOutcomesAgreementLevelsAndRegional")}
    >
      <PageContainer ghost loading={loading} className={styles.outcomes}>
        <div className={styles.summaryGrid}>
          <ProCard
            title={
              <Space>
                <BarChartOutlined />
                <span>{i18nT("ui.ethikos.impact.outcomes.impactOutcomes")}</span>
              </Space>
            }
          >
            {kpis.length ? (
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="large"
              >
                <Space size="large" wrap>
                  {kpis.map((kpi) => (
                    <StatisticCard
                      key={kpi.key}
                      statistic={{
                        title: impactKpiLabel(i18nT, kpi.key, kpi.label),
                        value: kpi.value,
                        suffix: kpi.key === 'agreement' ? '%' : undefined,
                        description:
                          typeof kpi.delta === 'number' ? (
                            <span
                              style={{
                                color:
                                  kpi.delta >= 0 ? '#3f8600' : '#cf1322',
                              }}
                            >
                              {kpi.delta >= 0 ? '▲' : '▼'}{' '}
                              {Math.abs(kpi.delta)}%
                            </span>
                          ) : null,
                      }}
                    />
                  ))}
                </Space>

                <Divider />

                <Space direction="vertical" size={8}>
                  <Text type="secondary">{i18nT("ui.ethikos.impact.outcomes.highlights")}</Text>
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    <li>
                      <Text>
                        <Text strong>
                          {kpis.find((k) => k.key === 'resolved')?.value ?? 0}
                        </Text>{' '}
                        {i18nT("ui.ethikos.impact.outcomes.decisionsResolvedOverall")}
                      </Text>
                    </li>
                    <li>
                      <Text>
                        {i18nT("ui.ethikos.impact.outcomes.averageAgreementIs")}{' '}
                        <Text strong>
                          {kpis.find((k) => k.key === 'agreement')?.value ?? 0}
                          %
                        </Text>
                        {i18nT("ui.ethikos.impact.outcomes.combiningStanceDirectionAndTurnout")}
                      </Text>
                    </li>
                    <li>
                      <Text>
                        {i18nT("ui.ethikos.impact.outcomes.participationVolumeIs")}{' '}
                        <Text strong>
                          {kpis.find((k) => k.key === 'participation')?.value ??
                            0}
                        </Text>{' '}
                        {i18nT("ui.ethikos.impact.outcomes.totalStancesAcrossAllDebates")}
                      </Text>
                    </li>
                  </ul>
                </Space>
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={i18nT("ui.ethikos.impact.outcomes.noOutcomeMetricsAvailableYet")}
              />
            )}
          </ProCard>

          <ProCard
            title={
              <Space>
                <BarChartOutlined />
                <span>{i18nT("ui.ethikos.impact.outcomes.outcomeDistribution")}</span>
              </Space>
            }
          >
            {charts.length ? (
              <Tabs
                items={charts.map((c) => ({
                  key: c.key,
                  label: impactChartTitle(i18nT, c.key, c.title),
                  children: (
                    <div className={styles.plot}>
                      {c.type === 'line' && <Line {...c.config} autoFit />}
                      {c.type === 'bar' && <Bar {...c.config} autoFit />}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={i18nT("ui.ethikos.impact.outcomes.noOutcomeChartsAvailableYet")}
              />
            )}
          </ProCard>
        </div>

        <ProCard title={i18nT("ui.ethikos.impact.outcomes.closedDecisionsOutcomesVsEngagement")}>
          <div className={styles.detailGrid}>
            <ProCard title={i18nT("ui.ethikos.impact.outcomes.outcomesByRegion")}>
              {decisionOutcomeData.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={i18nT("ui.ethikos.impact.outcomes.noRegionalOutcomeDataAvailable")}
                />
              ) : (
                <div className={styles.plot}>
                    <Bar {...decisionOutcomeConfig} autoFit />
                  </div>
              )}
            </ProCard>

            <ProCard title={i18nT("ui.ethikos.impact.outcomes.closedDecisions_f7bb51")}>
              {decisionRows.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={i18nT("ui.ethikos.impact.outcomes.noClosedDecisionsYet")}
                />
              ) : (
                <ProTable<DecisionRow>
                  rowKey="key"
                  size="small"
                  columns={decisionsColumns}
                  dataSource={decisionRows}
                  scroll={{ x: 720 }}
                  pagination={{ pageSize: 8 }}
                  search={false}
                  options={false}
                  toolBarRender={false}
                />
              )}
            </ProCard>
          </div>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}
