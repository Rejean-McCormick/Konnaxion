// FILE: frontend/app/reports/page.tsx
'use client';

import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Card,
  DatePicker,
  List,
  Space,
  Typography,
  Segmented,
  Tag,
  Button,
  Tooltip,
} from 'antd';
import {
  LineChartOutlined,
  BarChartOutlined,
  ThunderboltOutlined,
  InfoCircleOutlined,
  CalendarOutlined,
} from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Paragraph, Text, Title } = Typography;

type QuickRange = '7d' | '30d' | '90d';

const QUICK_RANGES: { label: string; value: QuickRange }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

const shortcuts = [
  {
    key: 'smart-vote',
    title: 'Smart Vote · Impact overview',
    description:
      'See weighted participation, consensus patterns, and expert vs public deltas.',
    href: '/reports/smart-vote',
    icon: <LineChartOutlined />,
    tags: ['Ekoh', 'Ethikos', 'Smart Vote'],
  },
  {
    key: 'usage',
    title: 'Usage · Adoption & activity',
    description:
      'Track monthly active users, active projects, and document growth across the platform.',
    href: '/reports/usage',
    icon: <BarChartOutlined />,
    tags: ['Usage', 'MAU', 'Projects'],
  },
  {
    key: 'perf',
    title: 'API performance · Reliability',
    description:
      'Monitor API latency, error rates, and SLO compliance for the core services.',
    href: '/reports/perf',
    icon: <ThunderboltOutlined />,
    tags: ['API', 'SLO', 'Reliability'],
  },
];

export default function ReportsHomePage(): JSX.Element {
  const [quickRange, setQuickRange] = React.useState<QuickRange>('30d');

  return (
    <>
      <Head>
        <title>Insights · Reports overview</title>
      </Head>

      <PageContainer
        header={{
          title: 'Insights',
          subTitle: 'Cross-module analytics for Smart Vote, usage, and performance.',
          breadcrumb: undefined,
        }}
      >
        <Space
          direction="vertical"
          size="large"
          style={{ width: '100%' }}
        >
          {/* Filters / context */}
          <Card>
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space align="start" style={{ width: '100%', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <Space direction="vertical" size={4}>
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Time range</Text>
                  </Space>
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    Choose a time window. Detailed dashboards can override this
                    range if needed.
                  </Paragraph>
                </Space>

                <Space direction="vertical" size={4}>
                  <Text strong>Quick ranges</Text>
                  <Segmented
                    options={QUICK_RANGES.map((r) => ({
                      label: r.label,
                      value: r.value,
                    }))}
                    value={quickRange}
                    onChange={(value) =>
                      setQuickRange(value as QuickRange)
                    }
                  />
                </Space>

                <Space direction="vertical" size={4}>
                  <Text strong>Custom range</Text>
                  <RangePicker allowClear />
                </Space>
              </Space>

              <Space>
                <InfoCircleOutlined />
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  This overview is read-only. Detailed charts on each dashboard
                  will use the same time range where possible.
                </Paragraph>
              </Space>
            </Space>
          </Card>

          {/* High-level tiles */}
          <ProCard
            ghost
            gutter={[16, 16]}
            wrap
          >
            <StatisticCard
              colSpan={{ xs: 24, sm: 24, md: 8 }}
              statistic={{
                title: 'Smart Vote',
                value: 1245,
                suffix: 'votes',
                description:
                  'Weighted decisions in the selected range across Ekoh and Ethikos.',
              }}
              chart={
                <div
                  style={{
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  Mini-chart placeholder (Smart Vote)
                </div>
              }
              footer={
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Text type="secondary">Last {quickRange}</Text>
                  <Link href="/reports/smart-vote">
                    <Button type="link" size="small">
                      Open Smart Vote report
                    </Button>
                  </Link>
                </Space>
              }
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 24, md: 8 }}
              statistic={{
                title: 'Usage',
                value: 567,
                suffix: 'MAU',
                description:
                  'Approximate monthly active users across all modules.',
              }}
              chart={
                <div
                  style={{
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  Mini-chart placeholder (Usage)
                </div>
              }
              footer={
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Text type="secondary">Projects & docs growth included</Text>
                  <Link href="/reports/usage">
                    <Button type="link" size="small">
                      Open Usage report
                    </Button>
                  </Link>
                </Space>
              }
            />

            <StatisticCard
              colSpan={{ xs: 24, sm: 24, md: 8 }}
              statistic={{
                title: 'API performance',
                value: 240,
                suffix: 'ms p95',
                description:
                  'Aggregated latency for public API endpoints over the window.',
              }}
              chart={
                <div
                  style={{
                    height: 80,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                  }}
                >
                  Mini-chart placeholder (Perf)
                </div>
              }
              footer={
                <Space
                  style={{ width: '100%', justifyContent: 'space-between' }}
                >
                  <Text type="secondary">Target p95 &lt; 300 ms</Text>
                  <Link href="/reports/perf">
                    <Button type="link" size="small">
                      Open API performance
                    </Button>
                  </Link>
                </Space>
              }
            />
          </ProCard>

          {/* Shortcuts / entry points */}
          <Card>
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Space direction="vertical" size={4}>
                <Title level={4} style={{ marginBottom: 0 }}>
                  Dashboards
                </Title>
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  Jump directly to a dedicated Insights dashboard. These pages
                  provide charts, tables, and export options.
                </Paragraph>
              </Space>

              <List
                itemLayout="horizontal"
                dataSource={shortcuts}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Link key="open" href={item.href}>
                        <Button type="link" size="small">
                          Open
                        </Button>
                      </Link>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={item.icon}
                      title={
                        <Link href={item.href}>
                          {item.title}
                        </Link>
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
                            {item.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
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

          {/* Helper / explanation */}
          <Card>
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space>
                <InfoCircleOutlined />
                <Text strong>How to use Insights</Text>
              </Space>
              <Paragraph>
                Start from this overview to pick the dashboard that matches your
                question: Smart Vote for collective decisions, Usage for
                adoption, and API performance for reliability. Each dashboard
                lets you refine the time range, inspect detailed metrics, and
                export data where permitted.
              </Paragraph>
              <Tooltip title="Exports are limited to aggregated datasets; raw personal data never leaves the analytics service.">
                <Button type="default" icon={<InfoCircleOutlined />}>
                  Learn more about data safeguards
                </Button>
              </Tooltip>
            </Space>
          </Card>
        </Space>
      </PageContainer>
    </>
  );
}
