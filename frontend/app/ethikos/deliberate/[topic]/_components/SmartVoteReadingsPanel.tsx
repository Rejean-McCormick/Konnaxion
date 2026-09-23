'use client'

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  BarChartOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { ProCard } from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import {
  Alert,
  Button,
  Card,
  Col,
  Empty,
  List,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'

import {
  fetchEthikosTopicReading,
  primaryAdvisoryReading,
} from '@/services/readings'
import type { SmartVoteReadingParticipant } from '@/services/readings'

import type { ParticipantContextTarget } from './ArgumentThreadCard'

const { Paragraph, Text } = Typography

function pct(value?: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.max(0, Math.min(100, Math.round(value * 100)))
}

function stanceLabel(i18nT: TranslateFunction, score: number): string {
  if (score >= 2.25) return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.strongSupport")
  if (score >= 0.75) return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.support")
  if (score > 0.15) return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.leanSupport")
  if (score <= -2.25) return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.strongOppose")
  if (score <= -0.75) return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.oppose")
  if (score < -0.15) return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.leanOppose")
  return i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.nearNeutral")
}

function ReadingDistribution({
  support,
  neutral,
  oppose,
}: {
  support?: number
  neutral?: number
  oppose?: number
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <Space direction="vertical" size={6} style={{ width: '100%' }}>
      <div>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.support")}</Text><Text>{pct(support)}%</Text>
        </Space>
        <Progress percent={pct(support)} showInfo={false} />
      </div>
      <div>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.neutral")}</Text><Text>{pct(neutral)}%</Text>
        </Space>
        <Progress percent={pct(neutral)} showInfo={false} />
      </div>
      <div>
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Text>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.oppose")}</Text><Text>{pct(oppose)}%</Text>
        </Space>
        <Progress percent={pct(oppose)} showInfo={false} />
      </div>
    </Space>
  )
}

function participantTarget(row: SmartVoteReadingParticipant): ParticipantContextTarget {
  return {
    userId: String(row.user_id),
    displayName: row.display_name,
  }
}

export default function SmartVoteReadingsPanel({
  topicId,
  onOpenParticipant,
}: {
  topicId: string | number
  onOpenParticipant: (target: ParticipantContextTarget) => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [expanded, setExpanded] = useState(false)

  const { data, loading, refresh } = useRequest(
    () => fetchEthikosTopicReading(topicId),
    {
      ready: expanded && Boolean(topicId),
      refreshDeps: [expanded, topicId],
    },
  )

  const advisory = primaryAdvisoryReading(data)
  const baseline = data?.baseline.results_payload
  const reading = advisory?.results_payload

  const participants = useMemo(
    () =>
      [...(reading?.participants ?? [])].sort((left, right) => {
        if (left.included_in_advisory !== right.included_in_advisory) {
          return left.included_in_advisory ? -1 : 1
        }
        return right.expertise_alignment - left.expertise_alignment
      }),
    [reading?.participants],
  )

  const divergence =
    baseline && reading ? Math.abs(reading.score - baseline.score) : 0

  return (
    <ProCard
      title={
        <Space>
          <BarChartOutlined />
          <span>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.decisionSupportReadings")}</span>
        </Space>
      }
      subTitle={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.singleSourceMultipleReadings")}
      data-testid="smart-vote-readings-panel"
      extra={
        <Space wrap>
          <Tag>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.baselineAlwaysPreserved")}</Tag>
          <Button
            type={expanded ? 'default' : 'primary'}
            data-testid="view-readings-button"
            onClick={() => setExpanded((value) => !value)}
          >
            {expanded ? i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.hideReadings") : i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.viewReadings")}
          </Button>
        </Space>
      }
    >
      {!expanded ? (
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.compareThePublicBaselineWithADeclared")}
          description={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.openingThePanelDoesNotChangeAny")}
        />
      ) : loading ? (
        <Card loading />
      ) : !data || !baseline || !reading ? (
        <Empty description={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.noSmartVoteReadingIsBoundTo")}>
          <Button onClick={() => refresh()}>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.retry")}</Button>
        </Empty>
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="warning"
            showIcon
            message={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.advisoryReadingNotATransferOfSovereignty")}
            description={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.expertiseInformsJudgmentItDoesNotSilently")}
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={12}>
              <Card title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.publicBaseline")} data-testid="baseline-reading-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Statistic
                    title={stanceLabel(i18nT, baseline.score)}
                    value={baseline.score}
                    precision={2}
                    suffix="/ 3"
                  />
                  <Text type="secondary">{baseline.participant_count} {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.sourceStancesNoWeighting")}</Text>
                  <ReadingDistribution
                    support={baseline.support_share}
                    neutral={baseline.neutral_share}
                    oppose={baseline.oppose_share}
                  />
                </Space>
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.relevantExpertiseReading")} data-testid="expertise-reading-card">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Statistic
                    title={stanceLabel(i18nT, reading.score)}
                    value={reading.score}
                    precision={2}
                    suffix="/ 3"
                  />
                  <Space wrap>
                    <Tag>{reading.advisory_participant_count ?? reading.participant_count} {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.advisoryParticipants")}</Tag>
                    {(reading.excluded_participant_count ?? 0) > 0 && (
                      <Tag color="orange">{reading.excluded_participant_count} {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.declaredRecusal")}</Tag>
                    )}
                  </Space>
                  <ReadingDistribution
                    support={reading.support_share}
                    neutral={reading.neutral_share}
                    oppose={reading.oppose_share}
                  />
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.divergence")} value={divergence} precision={2} suffix=" stance pts" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.expertiseCoverage")} value={pct(reading.expertise_coverage)} suffix="%" />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card size="small">
                <Statistic title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.averageContextualAlignment")} value={pct(reading.average_expertise_alignment)} suffix="%" />
              </Card>
            </Col>
          </Row>

          <ProCard title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.relevantDomains")} bordered>
            <Space wrap>
              {(reading.domains ?? []).map((domain) => (
                <Tag key={domain.domain_code}>
                  {domain.domain_name} · {pct(domain.weight)}%
                </Tag>
              ))}
            </Space>
          </ProCard>

          <ProCard
            title={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.participantRelevanceInThisLens")}
            subTitle={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.expertiseFollowsQuestion")}
            bordered
          >
            {(reading.participant_detail_visible_count ?? participants.length) < reading.participant_count ? (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.someParticipantLevelEkohDetailsAreRestricted")}
                description={i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.ofParticipantDetailRecordsAreVisibleIn", { length: reading.participant_detail_visible_count ?? participants.length, participant_count: reading.participant_count })}
              />
            ) : null}
            <List<SmartVoteReadingParticipant>
              dataSource={participants}
              renderItem={(participant) => (
                <List.Item
                  key={participant.user_id}
                  actions={[
                    <Button
                      key="ekoh"
                      type="link"
                      icon={<SafetyCertificateOutlined />}
                      onClick={() => onOpenParticipant(participantTarget(participant))}
                    >
                      {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.ekohContext")}
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    title={
                      <Space wrap>
                        <Text strong>{participant.display_name}</Text>
                        <Tag>{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.stance")} {participant.stance_value > 0 ? '+' : ''}{participant.stance_value}</Tag>
                        {participant.included_in_advisory ? (
                          <Tag color="green">{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.included")}</Tag>
                        ) : (
                          <Tag color="orange">{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.recused")}</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size={2}>
                        <Text type="secondary">
                          {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.contextualAlignment")} {pct(participant.expertise_alignment)}{i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.advisoryWeight")} {participant.advisory_weight.toFixed(2)}×
                        </Text>
                        {participant.exclusion_reason && (
                          <Text type="secondary">{participant.exclusion_reason}</Text>
                        )}
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          </ProCard>

          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.lensHash")} {advisory?.lens_hash ?? i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.nA")} {i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.snapshot")} {advisory?.snapshot_ref ?? i18nT("ui.ethikos.deliberate.topic.smartvotereadingspanel.nA")}
          </Paragraph>
        </Space>
      )}
    </ProCard>
  )
}
