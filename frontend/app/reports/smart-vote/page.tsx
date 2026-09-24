'use client'

import { apiFetch } from '@/api';
import { useLanguage } from '@/context/LanguageContext';
import { ReloadOutlined } from '@ant-design/icons'
import { ProCard, StatisticCard } from '@ant-design/pro-components'
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Row,
  Segmented,
  Skeleton,
  Space,
  Table,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs, { type Dayjs } from 'dayjs'
import React, { useEffect, useState } from 'react'

import ReportsPageShell from '../ReportsPageShell'

const { RangePicker } = DatePicker
const { Title, Paragraph, Text } = Typography

type RangeKey = '7d' | '30d' | '90d'

type ApiSmartVoteSummary = {
  linkedTopics: number
  openTopics: number
  currentStances: number
  domainsCovered: number
}

type ApiSmartVoteDomain = {
  key: string
  domainCode: string
  domain: string
  topics: number
  currentStances: number
  topicsWithStancesPct: number
  avgRelevancePct: number
}

type ApiSmartVoteResponse = {
  generatedAt: string
  range: {
    key: RangeKey
    days: number
    from: string
    to: string
    semantics: string
  }
  summary: ApiSmartVoteSummary
  history: {
    available: boolean
    reason: string
  }
  domains: ApiSmartVoteDomain[]
}

function computePresetRange(rangeKey: RangeKey): [Dayjs, Dayjs] {
  const end = dayjs()
  const days = rangeKey === '7d' ? 7 : rangeKey === '30d' ? 30 : 90
  return [end.subtract(days - 1, 'day'), end]
}

export default function SmartVoteReportPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [rangeKey, setRangeKey] = useState<RangeKey>('30d')
  const [[start, end], setRange] = useState<[Dayjs, Dayjs]>(() =>
    computePresetRange('30d'),
  )
  const [data, setData] = useState<ApiSmartVoteResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchData = async (key: RangeKey): Promise<void> => {
    setLoading(true)
    setError(false)

    try {
      const res = await apiFetch(`/api/reports/smart-vote/?range=${key}`)
      if (!res.ok) throw new Error('Failed to fetch Smart Vote report')
      setData((await res.json()) as ApiSmartVoteResponse)
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchData(rangeKey)
  }, [rangeKey])

  const handleRangePresetChange = (value: RangeKey | string): void => {
    const key = value as RangeKey
    setRangeKey(key)
    setRange(computePresetRange(key))
  }

  const domainColumns: ColumnsType<ApiSmartVoteDomain> = [
    {
      title: i18nT("ui.reports.smartVote.domain"),
      dataIndex: 'domain',
      key: 'domain',
      render: (value: string, row) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">{row.domainCode}</Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.reports.smartVote.topicsInRange"),
      dataIndex: 'topics',
      key: 'topics',
      width: 140,
    },
    {
      title: i18nT("ui.reports.smartVote.currentStances"),
      dataIndex: 'currentStances',
      key: 'currentStances',
      width: 150,
    },
    {
      title: i18nT("ui.reports.smartVote.topicsWithStances"),
      dataIndex: 'topicsWithStancesPct',
      key: 'topicsWithStancesPct',
      width: 170,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
    {
      title: i18nT("ui.reports.smartVote.avgRelevance"),
      dataIndex: 'avgRelevancePct',
      key: 'avgRelevancePct',
      width: 140,
      render: (value: number) => `${value.toFixed(1)}%`,
    },
  ]

  if (loading && !data) {
    return (
      <ReportsPageShell
        title={i18nT("ui.reports.smartVote.smartVote")}
        subtitle={i18nT("ui.reports.smartVote.currentSmartVoteCoverageOverCanonicalEthikos")}
        metaTitle={i18nT("ui.reports.smartVote.reportsSmartVote")}
      >
        <Skeleton active paragraph={{ rows: 10 }} />
      </ReportsPageShell>
    )
  }

  if (error || !data) {
    return (
      <ReportsPageShell
        title={i18nT("ui.reports.smartVote.smartVote")}
        subtitle={i18nT("ui.reports.smartVote.currentSmartVoteCoverageOverCanonicalEthikos")}
        metaTitle={i18nT("ui.reports.smartVote.reportsSmartVote")}
      >
        <Empty description={i18nT("ui.reports.smartVote.failedToLoadSmartVoteAnalytics")}>
          <Button icon={<ReloadOutlined />} onClick={() => void fetchData(rangeKey)}>
            {i18nT("ui.reports.smartVote.retry")}
          </Button>
        </Empty>
      </ReportsPageShell>
    )
  }

  const { summary, history, domains, generatedAt } = data

  return (
    <ReportsPageShell
      title={i18nT("ui.reports.smartVote.smartVote")}
      subtitle={i18nT("ui.reports.smartVote.realCrossSectionalReportingOverEthikosTopics")}
      metaTitle={i18nT("ui.reports.smartVote.reportsSmartVote")}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <ProCard ghost>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={12}>
              <Space direction="vertical" size={4}>
                <Text strong>{i18nT("ui.reports.smartVote.topicCreationRange")}</Text>
                <Segmented
                  value={rangeKey}
                  options={[
                    { label: i18nT("ui.reports.smartVote.last7Days"), value: '7d' },
                    { label: i18nT("ui.reports.smartVote.last30Days"), value: '30d' },
                    { label: i18nT("ui.reports.smartVote.last90Days"), value: '90d' },
                  ]}
                  onChange={(value) => handleRangePresetChange(value as RangeKey)}
                />
              </Space>
            </Col>

            <Col xs={24} md={12} style={{ textAlign: 'right' }}>
              <Space direction="vertical" size={4} style={{ alignItems: 'flex-end' }}>
                <Space>
                  <Text type="secondary">{i18nT("ui.reports.smartVote.customDatesDisabled")}</Text>
                  <RangePicker value={[start, end]} disabled />
                </Space>
                <Text type="secondary">
                  {i18nT("ui.reports.smartVote.generated")} {dayjs(generatedAt).format('MMM D, YYYY · HH:mm')}
                </Text>
              </Space>
            </Col>
          </Row>
        </ProCard>

        <Alert
          type="info"
          showIcon
          message={i18nT("ui.reports.smartVote.snapshotSemantics")}
          description={i18nT("ui.reports.smartVote.theSelectedRangeFiltersEthikosTopicsBy")}
        />

        <ProCard gutter={16} wrap>
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{ title: i18nT("ui.reports.smartVote.smartVoteLinkedTopics"), value: summary.linkedTopics }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{ title: i18nT("ui.reports.smartVote.currentlyOpenTopics"), value: summary.openTopics }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{ title: i18nT("ui.reports.smartVote.currentCanonicalStances"), value: summary.currentStances }}
          />
          <StatisticCard
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{ title: i18nT("ui.reports.smartVote.relevantDomainsCovered"), value: summary.domainsCovered }}
          />
        </ProCard>

        <Card>
          <Title level={4}>{i18nT("ui.reports.smartVote.historicalTrends")}</Title>
          <Alert
            type="warning"
            showIcon
            message={i18nT("ui.reports.smartVote.historicalTrendUnavailable")}
            description={history.reason}
          />
          <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
            {i18nT("ui.reports.smartVote.aRealTimeSeriesReportRequiresAn")}
          </Paragraph>
        </Card>

        <Card>
          <Title id="smart-vote-domain-heading" level={4} style={{ marginBottom: 8 }}>
            {i18nT("ui.reports.smartVote.domainCoverageEkohRelevance")}
          </Title>
          <Paragraph type="secondary">
            {i18nT("ui.reports.smartVote.eachRowIsDerivedFromTheReal")}
          </Paragraph>
          <Table<ApiSmartVoteDomain>
            size="small"
            rowKey="key"
            columns={domainColumns}
            dataSource={domains}
            pagination={false}
            locale={{ emptyText: i18nT("ui.reports.smartVote.noSmartVoteLinkedTopicsWereCreated") }}
            aria-labelledby="smart-vote-domain-heading"
          />
        </Card>
      </Space>
    </ReportsPageShell>
  )
}
