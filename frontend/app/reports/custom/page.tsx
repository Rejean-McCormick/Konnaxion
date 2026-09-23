'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  LineChartOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormCheckbox,
  ProFormDateRangePicker,
  type ProFormInstance,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
  ProFormText,
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
import type { Dayjs } from 'dayjs';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import ReportsPageShell from '../ReportsPageShell';

const { Text } = Typography;

type BackendMetric = 'smart-vote' | 'usage' | 'perf';
type GroupBy = 'day' | 'week';

type ReportConfig = {
  name?: string;
  primaryMetric?: BackendMetric;
  timeGrain?: GroupBy;
  dimensions?: string[];
  range?: [Dayjs, Dayjs];
  includeRawSamples?: boolean;
  autoRefreshSeconds?: number;
  isPublic?: boolean;
};

type StreamStatus = 'idle' | 'connecting' | 'open' | 'error' | 'closed';

type StreamMessage =
  | { kind: 'connected'; at?: string; path?: string }
  | { kind: 'keepalive'; at?: string; payload?: unknown }
  | {
      kind: 'summary';
      at?: string;
      summary?: {
        queryId?: string;
        sampleCount?: number;
        durationMs?: number;
        aggregates?: Record<string, number>;
        meta?: {
          metric?: BackendMetric;
          group_by?: GroupBy;
          range?: { from?: string | null; to?: string | null };
          preview?: boolean;
        };
      };
    }
  | {
      kind: 'sample';
      at?: string;
      sample?: {
        ts?: string;
        label?: string;
        metrics?: Record<string, number>;
        raw?: unknown;
      };
    }
  | {
      kind: 'error';
      at?: string;
      error?: {
        code?: string;
        message?: string;
      };
    };

type ChartPoint = {
  date: string;
  value: number;
};

const DIMENSION_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.reports.custom.moduleEkohEthikos"), value: 'module' },
  { label: i18nT("ui.reports.custom.countryRegion"), value: 'region' },
  { label: i18nT("ui.reports.custom.ekohDomain"), value: 'ekoh_domain' },
  { label: i18nT("ui.reports.custom.userSegmentRole"), value: 'segment' },
  { label: i18nT("ui.reports.custom.deviceType"), value: 'device' },
] as const);

function getMetricLabel(i18nT: TranslateFunction, metric?: BackendMetric): string {
  switch (metric) {
    case 'smart-vote':
      return i18nT("ui.reports.custom.smartVoteScore");
    case 'usage':
      return i18nT("ui.reports.custom.activeUsers");
    case 'perf':
      return i18nT("ui.reports.custom.latencyP95Ms");
    default:
      return i18nT("ui.reports.custom.metric");
  }
}

function metricValueKey(metric?: BackendMetric): string {
  switch (metric) {
    case 'smart-vote':
      return 'avg_score';
    case 'usage':
      return 'active_users';
    case 'perf':
      return 'p95_latency_ms';
    default:
      return 'value';
  }
}

function buildWsUrl(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
  const wsPath = '/ws/reports/custom';

  const baseFromEnv = process.env.NEXT_PUBLIC_REPORTS_WS_BASE;
  return baseFromEnv && baseFromEnv.length > 0
    ? `${baseFromEnv.replace(/\/$/, '')}${wsPath}`
    : `${protocol}//${host}${wsPath}`;
}

function toIsoRange(range?: [Dayjs, Dayjs]): { from?: string; to?: string } {
  if (!range || !range[0] || !range[1]) {
    return {};
  }

  return {
    from: range[0].toISOString(),
    to: range[1].toISOString(),
  };
}

function statusColor(status: StreamStatus): string {
  switch (status) {
    case 'open':
      return 'green';
    case 'connecting':
      return 'gold';
    case 'error':
      return 'red';
    case 'closed':
      return 'default';
    case 'idle':
    default:
      return 'blue';
  }
}

export default function CustomReportBuilderPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const formRef = useRef<ProFormInstance<ReportConfig>>();
  const wsRef = useRef<WebSocket | null>(null);
  const pendingPayloadRef = useRef<string | null>(null);

  const [config, setConfig] = useState<ReportConfig | null>(null);
  const [streamStatus, setStreamStatus] = useState<StreamStatus>('idle');
  const [streamError, setStreamError] = useState<string | undefined>(undefined);
  const [lastMessage, setLastMessage] = useState<StreamMessage | string | null>(
    null,
  );
  const [summary, setSummary] = useState<
    Extract<StreamMessage, { kind: 'summary' }>['summary'] | null
  >(null);
  const [samples, setSamples] = useState<
    Array<Extract<StreamMessage, { kind: 'sample' }>['sample']>
  >([]);

  const sendCurrentRequest = useCallback((values: ReportConfig) => {
    const payload = {
      metric: values.primaryMetric ?? 'smart-vote',
      group_by: values.timeGrain ?? 'day',
      include_raw_samples: !!values.includeRawSamples,
      range: toIsoRange(values.range),
    };

    const serialized = JSON.stringify(payload);

    setSummary(null);
    setSamples([]);
    setStreamError(undefined);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(serialized);
      return;
    }

    pendingPayloadRef.current = serialized;
  }, []);

  useEffect(() => {
    if (wsRef.current) return;
    if (typeof window === 'undefined') return;

    const url = buildWsUrl();
    if (!url) return;

    setStreamStatus('connecting');

    const socket = new WebSocket(url);
    wsRef.current = socket;

    socket.onopen = () => {
      setStreamStatus('open');
      setStreamError(undefined);

      try {
        socket.send('ping');
      } catch {
        // ignore ping failures
      }

      if (pendingPayloadRef.current) {
        socket.send(pendingPayloadRef.current);
        pendingPayloadRef.current = null;
      }
    };

    socket.onmessage = (event: MessageEvent) => {
      let payload: StreamMessage | string = event.data;

      if (typeof event.data === 'string') {
        try {
          payload = JSON.parse(event.data) as StreamMessage;
        } catch {
          payload = event.data;
        }
      }

      setLastMessage(payload);

      if (typeof payload === 'string') {
        return;
      }

      if (payload.kind === 'error') {
        setStreamStatus('error');
        setStreamError(payload.error?.message ?? 'WebSocket error');
        return;
      }

      if (payload.kind === 'summary') {
        setSummary(payload.summary ?? null);
        return;
      }

      if (payload.kind === 'sample' && payload.sample) {
        setSamples((prev) => [...prev, payload.sample]);
      }
    };

    socket.onerror = () => {
      setStreamStatus('error');
      setStreamError(i18nT("ui.reports.custom.websocketError"));
    };

    socket.onclose = () => {
      setStreamStatus('closed');
      wsRef.current = null;
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [i18nT]);

  useEffect(() => {
    if (!config?.autoRefreshSeconds) return;
    if (config.autoRefreshSeconds <= 0) return;

    const timer = window.setInterval(() => {
      sendCurrentRequest(config);
    }, config.autoRefreshSeconds * 1000);

    return () => window.clearInterval(timer);
  }, [config, sendCurrentRequest]);

  const chartData = useMemo<ChartPoint[]>(() => {
    const key = metricValueKey(config?.primaryMetric);
    return samples.map((sample) => ({
      date: sample?.label || sample?.ts || '',
      value:
        typeof sample?.metrics?.[key] === 'number' ? sample.metrics[key] : 0,
    }));
  }, [samples, config?.primaryMetric]);

  const latestValue = chartData[chartData.length - 1]?.value ?? 0;

  const aggregateEntries = useMemo(
    () => Object.entries(summary?.aggregates ?? {}),
    [summary],
  );

  const handleFinish = async (values: ReportConfig) => {
    setConfig(values);
    sendCurrentRequest(values);
    return true;
  };

  return (
    <ReportsPageShell
      title={i18nT("ui.reports.custom.customReportBuilder")}
      subtitle={i18nT("ui.reports.custom.composeYourOwnInsightsViewByPicking")}
      metaTitle={i18nT("ui.reports.custom.reportsCustomReportBuilder")}
      primaryAction={
        <Button
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={() => formRef.current?.submit?.()}
        >
          {i18nT("ui.reports.custom.runOnce")}
        </Button>
      }
      secondaryActions={
        <Space wrap>
          <Button icon={<SaveOutlined />}>{i18nT("ui.reports.custom.saveAsPreset")}</Button>
          <Button icon={<SettingOutlined />}>{i18nT("ui.reports.custom.managePresets")}</Button>
        </Space>
      }
    >
      <ProCard gutter={[16, 16]} split="vertical">
        <ProCard
          colSpan={{ xs: 24, lg: 11, xxl: 10 }}
          title={i18nT("ui.reports.custom.configureReport")}
          extra={
            <Text type="secondary">
              {i18nT("ui.reports.custom.chooseMetricsGroupingsAndFiltersThenStream")}
            </Text>
          }
        >
          <ProForm<ReportConfig>
            formRef={formRef}
            layout="vertical"
            initialValues={{
              primaryMetric: 'smart-vote',
              timeGrain: 'day',
              autoRefreshSeconds: 0,
              includeRawSamples: false,
              isPublic: false,
            }}
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
              label={i18nT("ui.reports.custom.reportName")}
              placeholder={i18nT("ui.reports.custom.eGSmartVoteVsAdoptionLast")}
              rules={[
                { required: true, message: i18nT("ui.reports.custom.pleaseProvideAReportName") },
              ]}
            />

            <ProFormSelect
              name="primaryMetric"
              label={i18nT("ui.reports.custom.primaryMetric")}
              placeholder={i18nT("ui.reports.custom.selectTheMainMetric")}
              rules={[
                { required: true, message: i18nT("ui.reports.custom.pleaseChooseAPrimaryMetric") },
              ]}
              options={[
                { label: i18nT("ui.reports.custom.smartVoteScore"), value: 'smart-vote' },
                { label: i18nT("ui.reports.custom.usageActiveUsers"), value: 'usage' },
                { label: i18nT("ui.reports.custom.apiLatencyP95"), value: 'perf' },
              ]}
            />

            <ProFormSelect
              name="timeGrain"
              label={i18nT("ui.reports.custom.timeGrain")}
              placeholder={i18nT("ui.reports.custom.selectTheAggregationGrain")}
              options={[
                { label: i18nT("ui.reports.custom.day"), value: 'day' },
                { label: i18nT("ui.reports.custom.week"), value: 'week' },
              ]}
            />

            <ProFormSelect
              name="dimensions"
              label={i18nT("ui.reports.custom.contextDimensions")}
              placeholder={i18nT("ui.reports.custom.selectDimensions")}
              mode="multiple"
              allowClear
              options={DIMENSION_OPTIONS(i18nT).map((item) => ({
                label: item.label,
                value: item.value,
              }))}
            />

            <ProFormDateRangePicker
              name="range"
              label={i18nT("ui.reports.custom.dateRange")}
              fieldProps={{
                allowClear: true,
              }}
            />

            <ProFormCheckbox.Group
              name="dimensions"
              label={i18nT("ui.reports.custom.highlightDimensions")}
              options={[
                { label: i18nT("ui.reports.custom.module"), value: 'module' },
                { label: i18nT("ui.reports.custom.region"), value: 'region' },
                { label: i18nT("ui.reports.custom.segment"), value: 'segment' },
              ]}
            />

            <ProFormSwitch
              name="includeRawSamples"
              label={i18nT("ui.reports.custom.includeRawSamples")}
              fieldProps={{
                checkedChildren: 'Raw on',
                unCheckedChildren: 'Raw off',
              }}
            />

            <ProFormSlider
              name="autoRefreshSeconds"
              label={i18nT("ui.reports.custom.autoRefreshIntervalSeconds")}
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
              label={i18nT("ui.reports.custom.shareableLink")}
              fieldProps={{
                checkedChildren: 'Public preset',
                unCheckedChildren: 'Private',
              }}
            />
          </ProForm>
        </ProCard>

        <ProCard
          colSpan="auto"
          title={i18nT("ui.reports.custom.livePreview")}
          extra={
            <Space>
              <Tag color={statusColor(streamStatus)}>
                {i18nT("ui.reports.custom.ws")} {streamStatus.toUpperCase()}
              </Tag>
              {config?.name ? (
                <Tag color="geekblue">{config.name}</Tag>
              ) : (
                <Text type="secondary">{i18nT("ui.reports.custom.noConfigurationYet")}</Text>
              )}
            </Space>
          }
        >
          {!config ? (
            <Empty description={i18nT("ui.reports.custom.configureYourReportOnTheLeftThen")} />
          ) : (
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                type={streamError ? 'error' : 'info'}
                showIcon
                message={streamError ? i18nT("ui.reports.custom.previewStreamError") : i18nT("ui.reports.custom.backendPreview")}
                description={
                  streamError ? (
                    <Text>{streamError}</Text>
                  ) : (
                    <Text>
                      {i18nT("ui.reports.custom.thisPanelIsNowWiredToThe")}{' '}
                      <code>/ws/reports/custom</code>{i18nT("ui.reports.custom.currentDataIsStillAPreviewStream")}
                    </Text>
                  )
                }
              />

              <Space
                size={16}
                wrap
                style={{ width: '100%', justifyContent: 'space-between' }}
              >
                <Statistic
                  title={getMetricLabel(i18nT, config.primaryMetric)}
                  value={latestValue}
                  suffix={config.primaryMetric === 'perf' ? ' ms' : ''}
                />
                <Statistic
                  title={i18nT("ui.reports.custom.samples")}
                  value={summary?.sampleCount ?? samples.length}
                />
                <Statistic
                  title={i18nT("ui.reports.custom.duration")}
                  value={summary?.durationMs ?? 0}
                  suffix="ms"
                />
              </Space>

              <Divider />

              <List
                size="small"
                header={<Text strong>{i18nT("ui.reports.custom.aggregates")}</Text>}
                locale={{ emptyText: i18nT("ui.reports.custom.noSummaryYet") }}
                dataSource={aggregateEntries}
                renderItem={([key, value]) => (
                  <List.Item>
                    <Space split={<Divider type="vertical" />} wrap>
                      <Text>{key}</Text>
                      <Text type="secondary">{String(value)}</Text>
                    </Space>
                  </List.Item>
                )}
              />

              <Divider />

              <ProCard
                ghost
                title={i18nT("ui.reports.custom.trendVisualization")}
                extra={<Tag icon={<LineChartOutlined />}>{i18nT("ui.reports.custom.wsStream")}</Tag>}
              >
                {chartData.length === 0 ? (
                  <Empty description={i18nT("ui.reports.custom.noSamplePointsReceivedYet")} />
                ) : (
                  <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name="Current preview"
                          stroke="#1890ff"
                          fill="#1890ff"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </ProCard>

              <Divider />

              <List
                size="small"
                header={<Text strong>{i18nT("ui.reports.custom.lastSamples")}</Text>}
                locale={{ emptyText: i18nT("ui.reports.custom.noStreamedSamplesYet") }}
                dataSource={samples.slice(-5).reverse()}
                renderItem={(item, index) => (
                  <List.Item key={`${item?.ts ?? 'sample'}-${index}`}>
                    <Space split={<Divider type="vertical" />} wrap>
                      <Text>{item?.label ?? item?.ts ?? i18nT("ui.reports.custom.sample")}</Text>
                      <Text type="secondary">
                        {String(
                          item?.metrics?.[metricValueKey(config.primaryMetric)] ??
                            0,
                        )}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />

              {lastMessage ? (
                <>
                  <Divider />
                  <Alert
                    type="success"
                    showIcon
                    message={i18nT("ui.reports.custom.lastBackendMessageReceived")}
                    description={
                      <pre
                        style={{
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                        }}
                      >
                        {JSON.stringify(lastMessage, null, 2)}
                      </pre>
                    }
                  />
                </>
              ) : null}
            </Space>
          )}
        </ProCard>
      </ProCard>
    </ReportsPageShell>
  );
}