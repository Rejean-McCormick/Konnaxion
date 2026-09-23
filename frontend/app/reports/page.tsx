'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRightOutlined,
  BarChartOutlined,
  CalendarOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Button,
  Card,
  DatePicker,
  List,
  Segmented,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import React from 'react';

import ReportsPageShell from './ReportsPageShell';

const { RangePicker } = DatePicker;
const { Paragraph, Text } = Typography;

type QuickRange = '7d' | '30d' | '90d';

type Shortcut = {
  key: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  tags: string[];
};

const QUICK_RANGES = (i18nT: TranslateFunction): { label: string; value: QuickRange }[] => ([
  { label: i18nT("ui.reports.text7Days"), value: '7d' },
  { label: i18nT("ui.reports.text30Days"), value: '30d' },
  { label: i18nT("ui.reports.text90Days"), value: '90d' },
]);

const shortcuts = (i18nT: TranslateFunction): Shortcut[] => ([
  {
    key: 'smart-vote',
    title: i18nT("ui.reports.smartVoteImpactOverview"),
    description:
      i18nT("ui.reports.seeWeightedParticipationConsensusPatternsAndExpert"),
    href: '/reports/smart-vote',
    icon: <LineChartOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
    tags: ['Ekoh', 'Ethikos', 'Smart Vote'],
  },
  {
    key: 'usage',
    title: i18nT("ui.reports.usageAdoptionActivity"),
    description:
      i18nT("ui.reports.trackMonthlyActiveUsersActiveProjectsAnd"),
    href: '/reports/usage',
    icon: <BarChartOutlined style={{ fontSize: 24, color: '#52c41a' }} />,
    tags: ['Usage', 'MAU', 'Projects'],
  },
  {
    key: 'perf',
    title: i18nT("ui.reports.apiPerformanceReliability"),
    description:
      i18nT("ui.reports.monitorApiLatencyErrorRatesAndSlo"),
    href: '/reports/perf',
    icon: <ThunderboltOutlined style={{ fontSize: 24, color: '#faad14' }} />,
    tags: ['API', 'SLO', 'Reliability'],
  },
]);

const MiniChartSkeleton = ({ color = '#eee' }: { color?: string }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-end',
      height: '100%',
      gap: 4,
      paddingBottom: 8,
    }}
  >
    {[40, 60, 45, 70, 50, 80, 65, 85, 55, 75, 90, 60].map((h, i) => (
      <div
        key={i}
        style={{
          width: '6%',
          height: `${h}%`,
          background: color,
          borderRadius: '2px 2px 0 0',
          opacity: 0.6,
        }}
      />
    ))}
  </div>
);

export default function ReportsHomePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [quickRange, setQuickRange] = React.useState<QuickRange>('30d');
  const router = useRouter();

  return (
    <ReportsPageShell
      title={i18nT("ui.reports.insights")}
      subtitle={i18nT("ui.reports.crossModuleAnalyticsForSmartVoteUsage")}
      metaTitle={i18nT("ui.reports.insightsReports")}
    >
      <Space
        direction="vertical"
        size="large"
        style={{ width: '100%' }}
      >
        <Card>
          <Space
            direction="vertical"
            size="middle"
            style={{ width: '100%' }}
          >
            <Space
              align="start"
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 16,
              }}
            >
              <Space direction="vertical" size={4}>
                <Space>
                  <CalendarOutlined />
                  <Text strong>{i18nT("ui.reports.timeRange")}</Text>
                </Space>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.reports.chooseATimeWindowDetailedDashboardsCan")}
                </Paragraph>
              </Space>

              <Space direction="vertical" size={4}>
                <Text strong>{i18nT("ui.reports.quickRanges")}</Text>
                <Segmented
                  options={QUICK_RANGES(i18nT).map((r) => ({
                    label: r.label,
                    value: r.value,
                  }))}
                  value={quickRange}
                  onChange={(value) => setQuickRange(value as QuickRange)}
                />
              </Space>

              <Space direction="vertical" size={4}>
                <Text strong>{i18nT("ui.reports.customRange")}</Text>
                <RangePicker allowClear />
              </Space>
            </Space>

            <Space>
              <InfoCircleOutlined style={{ color: '#1890ff' }} />
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {i18nT("ui.reports.thisOverviewIsReadOnlyDetailedDashboards")}
              </Paragraph>
            </Space>
          </Space>
        </Card>

        <ProCard
          ghost
          gutter={[16, 16]}
          wrap
        >
          <StatisticCard
            colSpan={{ xs: 24, sm: 24, md: 8 }}
            statistic={{
              title: i18nT("ui.reports.smartVoteLabel"),
              value: 1245,
              suffix: 'votes',
              description: i18nT("ui.reports.weightedDecisionsInTheSelectedRange"),
            }}
            chart={
              <div style={{ height: 80, width: '100%' }}>
                <MiniChartSkeleton color="#1890ff" />
              </div>
            }
            footer={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text type="secondary">{i18nT("ui.reports.last")} {quickRange}</Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => router.push('/reports/smart-vote')}
                >
                  {i18nT("ui.reports.viewReport")} <ArrowRightOutlined />
                </Button>
              </Space>
            }
          />

          <StatisticCard
            colSpan={{ xs: 24, sm: 24, md: 8 }}
            statistic={{
              title: i18nT("ui.reports.usageLabel"),
              value: 567,
              suffix: 'MAU',
              description: i18nT("ui.reports.approximateMonthlyActiveUsers"),
            }}
            chart={
              <div style={{ height: 80, width: '100%' }}>
                <MiniChartSkeleton color="#52c41a" />
              </div>
            }
            footer={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text type="secondary">{i18nT("ui.reports.includesProjectsDocs")}</Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => router.push('/reports/usage')}
                >
                  {i18nT("ui.reports.viewUsage")} <ArrowRightOutlined />
                </Button>
              </Space>
            }
          />

          <StatisticCard
            colSpan={{ xs: 24, sm: 24, md: 8 }}
            statistic={{
              title: i18nT("ui.reports.apiPerformance"),
              value: 240,
              suffix: 'ms p95',
              description: i18nT("ui.reports.aggregatedLatencyForPublicEndpoints"),
            }}
            chart={
              <div style={{ height: 80, width: '100%' }}>
                <MiniChartSkeleton color="#faad14" />
              </div>
            }
            footer={
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Text type="secondary">{i18nT("ui.reports.targetP95300Ms")}</Text>
                <Button
                  type="link"
                  size="small"
                  onClick={() => router.push('/reports/perf')}
                >
                  {i18nT("ui.reports.checkReliability")} <ArrowRightOutlined />
                </Button>
              </Space>
            }
          />
        </ProCard>

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space direction="vertical" size={4}>
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                {i18nT("ui.reports.dashboards")}
              </Typography.Title>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {i18nT("ui.reports.jumpDirectlyToADedicatedInsightsDashboard")}
              </Paragraph>
            </Space>

            <List<Shortcut>
              itemLayout="horizontal"
              dataSource={shortcuts(i18nT)}
              renderItem={(item) => (
                <List.Item
                  actions={[
                    <Button
                      key="open"
                      type="default"
                      onClick={() => router.push(item.href)}
                    >
                      {i18nT("ui.reports.open")}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={item.icon}
                    title={
                      <a
                        onClick={() => router.push(item.href)}
                        style={{ cursor: 'pointer' }}
                      >
                        {item.title}
                      </a>
                    }
                    description={
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: '100%' }}
                      >
                        <Paragraph style={{ marginBottom: 0 }}>
                          {item.description}
                        </Paragraph>
                        <Space size={[4, 0]} wrap>
                          {item.tags.map((tag: string) => (
                            <Tag key={tag} color="blue">
                              {tag}
                            </Tag>
                          ))}
                        </Space>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </Space>
        </Card>

        <Card>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Space>
              <InfoCircleOutlined />
              <Text strong>{i18nT("ui.reports.howToUseInsights")}</Text>
            </Space>
            <Paragraph style={{ marginBottom: 0 }}>
              {i18nT("ui.reports.startFromThisOverviewToPickThe")}
            </Paragraph>
            <Tooltip title={i18nT("ui.reports.exportsAreLimitedToAggregatedDatasetsRaw")}>
              <Button type="default" icon={<InfoCircleOutlined />}>
                {i18nT("ui.reports.learnMoreAboutDataSafeguards")}
              </Button>
            </Tooltip>
          </Space>
        </Card>
      </Space>
    </ReportsPageShell>
  );
}