// FILE: frontend/app/reports/custom/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDateRangePicker,
  ProFormCheckbox,
  ProFormSwitch,
  ProFormSlider,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Divider,
  Empty,
  List,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  PlayCircleOutlined,
  SaveOutlined,
  SettingOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const { Text } = Typography;

type ReportConfig = {
  name?: string;
  primaryMetric?: string;
  dimensions?: string[];
  range?: [string, string];
  breakdowns?: string[];
  autoRefreshSeconds?: number;
  isPublic?: boolean;
};

// Mock data generator for the preview chart
const generatePreviewData = (metric: string | undefined) => {
  const data = [];
  const baseValue = metric === 'api_error_rate' ? 2 : 1200;
  
  for (let i = 1; i <= 14; i++) {
    const val = baseValue + (Math.random() * baseValue * 0.2);
    data.push({
      date: `Nov ${i}`,
      value: Math.round(val),
      prevValue: Math.round(val * 0.9) // Simulated previous period
    });
  }
  return data;
};

export default function CustomReportBuilderPage(): JSX.Element {
  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [hasPreview, setHasPreview] = useState(false);

  // Generate preview data when config changes
  const previewData = useMemo(() => {
    if (!hasPreview) return [];
    return generatePreviewData(config?.primaryMetric);
  }, [config, hasPreview]);

  const handleFinish = async (values: ReportConfig) => {
    setConfig(values);
    setHasPreview(true);
    return true;
  };

  const getMetricLabel = (key?: string) => {
    const map: Record<string, string> = {
      smart_vote: 'Smart Vote Score',
      mau: 'Active Users',
      session_duration: 'Avg Session (min)',
      api_latency_p95: 'Latency P95 (ms)',
      api_error_rate: 'Error Rate (%)'
    };
    return map[key || ''] || 'Metric';
  };

  return (
    <PageContainer
      header={{
        title: 'Custom report builder',
        subTitle:
          'Compose your own Insights view by picking metrics, dimensions, filters, and layout.',
        extra: [
          <Button key="run" type="primary" icon={<PlayCircleOutlined />}>
            Run once
          </Button>,
          <Button key="save" icon={<SaveOutlined />}>
            Save as preset
          </Button>,
          <Button key="settings" icon={<SettingOutlined />}>
            Manage presets
          </Button>,
        ],
      }}
      ghost
    >
      <ProCard gutter={[16, 16]} split="vertical">
        {/* Left: configuration form */}
        <ProCard
          colSpan={{ xs: 24, lg: 11, xxl: 10 }}
          title="Configure report"
          extra={
            <Text type="secondary">
              Choose metrics, groupings, and filters. Then update the preview.
            </Text>
          }
        >
          <ProForm<ReportConfig>
            layout="vertical"
            submitter={{
              searchConfig: {
                submitText: 'Update preview',
              },
              resetButtonProps: {
                style: { display: 'none' },
              },
            }}
            onFinish={handleFinish}
          >
            <ProFormText
              name="name"
              label="Report name"
              placeholder="e.g. Smart Vote vs adoption (last 30 days)"
              rules={[
                { required: true, message: 'Please provide a report name' },
              ]}
            />

            <ProFormSelect
              name="primaryMetric"
              label="Primary metric"
              placeholder="Select the main metric"
              rules={[
                { required: true, message: 'Please choose a primary metric' },
              ]}
              options={[
                { label: 'Smart Vote score (global)', value: 'smart_vote' },
                { label: 'Monthly active users (MAU)', value: 'mau' },
                {
                  label: 'Average session duration',
                  value: 'session_duration',
                },
                { label: 'API latency (P95)', value: 'api_latency_p95' },
                { label: 'API error rate', value: 'api_error_rate' },
              ]}
            />

            <ProFormSelect
              name="dimensions"
              label="Group by"
              placeholder="Select dimensions"
              mode="multiple"
              allowClear
              options={[
                { label: 'Module (Ekoh / Ethikos / …)', value: 'module' },
                { label: 'Country / region', value: 'region' },
                { label: 'Ekoh domain', value: 'ekoh_domain' },
                { label: 'User segment (role)', value: 'segment' },
                { label: 'Device type', value: 'device' },
              ]}
            />

            <ProFormDateRangePicker
              name="range"
              label="Date range"
              fieldProps={{
                allowClear: true,
              }}
            />

            <ProFormCheckbox.Group
              name="breakdowns"
              label="Breakdowns"
              options={[
                { label: 'Show daily trend', value: 'daily_trend' },
                { label: 'Compare vs previous period', value: 'compare_prev' },
                { label: 'Show top 5 segments', value: 'top_segments' },
                { label: 'Show bottom 5 segments', value: 'bottom_segments' },
              ]}
            />

            <ProFormSlider
              name="autoRefreshSeconds"
              label="Auto-refresh interval (seconds)"
              min={0}
              max={120}
              tooltip={{ open: true }}
              fieldProps={{
                marks: {
                  0: 'Off',
                  30: '30',
                  60: '60',
                  120: '120',
                },
              }}
            />

            <ProFormSwitch
              name="isPublic"
              label="Shareable link"
              fieldProps={{
                checkedChildren: 'Public preset',
                unCheckedChildren: 'Private',
              }}
            />
          </ProForm>
        </ProCard>

        {/* Right: live preview */}
        <ProCard
          colSpan="auto"
          title="Live preview"
          extra={
            config?.name ? (
              <Tag color="geekblue">{config.name}</Tag>
            ) : (
              <Text type="secondary">No configuration yet</Text>
            )
          }
        >
          {!hasPreview ? (
            <Empty description="Configure your report on the left, then click “Update preview” to see a mock preview." />
          ) : (
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Alert
                type="info"
                showIcon
                message="Preview only"
                description={
                  <Text>
                    This is a mocked preview to validate layout and filters.
                    Wire this panel to <code>/reports/custom</code> once the
                    Insights API is connected.
                  </Text>
                }
              />

              {/* High level numbers */}
              <Space
                size={16}
                wrap
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <Statistic
                  title={getMetricLabel(config?.primaryMetric)}
                  value={previewData[previewData.length - 1]?.value || 0}
                  suffix={
                    config?.primaryMetric === 'api_latency_p95'
                      ? ' ms'
                      : config?.primaryMetric === 'api_error_rate'
                      ? ' %'
                      : ''
                  }
                />
                <Statistic
                  title="Compared to previous period"
                  value={4.3}
                  precision={1}
                  valueStyle={{ color: '#3f8600' }}
                  prefix="+"
                  suffix="%"
                />
                <Statistic title="Segments" value={config?.dimensions?.length || 0} />
              </Space>

              <Divider />

              {/* Mocked breakdown list */}
              <List
                size="small"
                header={
                  <Text strong>
                    Example breakdown by {config?.dimensions?.[0] || 'Segment'} (placeholder)
                  </Text>
                }
                dataSource={[
                  { label: 'Top Segment A', value: '↑ +8.2 %' },
                  { label: 'Top Segment B', value: '↑ +3.5 %' },
                  { label: 'Top Segment C', value: '↓ −1.2 %' },
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <Space split={<Divider type="vertical" />} wrap>
                      <Text>{item.label}</Text>
                      <Text type="secondary">{item.value}</Text>
                    </Space>
                  </List.Item>
                )}
              />

              <Divider />

              {/* Functional Chart Preview */}
              <ProCard
                ghost
                title="Trend Visualization"
                extra={<Tag icon={<LineChartOutlined />}>Mock Data</Tag>}
              >
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <AreaChart data={previewData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="value" 
                        name="Current Period" 
                        stroke="#1890ff" 
                        fill="#1890ff" 
                        fillOpacity={0.1} 
                      />
                      {config?.breakdowns?.includes('compare_prev') && (
                        <Area 
                          type="monotone" 
                          dataKey="prevValue" 
                          name="Previous Period" 
                          stroke="#faad14" 
                          fill="#faad14" 
                          fillOpacity={0.1} 
                          strokeDasharray="5 5"
                        />
                      )}
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </ProCard>
            </Space>
          )}
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}