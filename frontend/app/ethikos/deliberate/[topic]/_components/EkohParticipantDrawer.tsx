'use client'

import { useLanguage } from '@/context/LanguageContext';
import { useRequest } from 'ahooks'
import { Alert, Descriptions, List, Progress, Space, Tag, Typography } from 'antd'

import EkohRatingDrawer from '@/modules/ekoh/components/EkohRatingDrawer'
import type { EkohProfile } from '@/services/ekoh'
import { fetchEthikosTopicReading, primaryAdvisoryReading } from '@/services/readings'

import type { ParticipantContextTarget } from './ArgumentThreadCard'

const { Paragraph, Text } = Typography

function pct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100)))
}

export default function EkohParticipantDrawer({
  open,
  participant,
  topicId,
  onClose,
}: {
  open: boolean
  participant: ParticipantContextTarget | null
  topicId: string | number
  onClose: () => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  const userId = participant?.userId

  const { data: reading, loading: loadingReading } = useRequest(
    () => fetchEthikosTopicReading(topicId),
    {
      ready: open && Boolean(topicId),
      refreshDeps: [open, topicId],
    },
  )

  const advisory = primaryAdvisoryReading(reading)
  const domains = advisory?.results_payload.domains ?? []
  const participantReading = advisory?.results_payload.participants?.find(
    (item) => String(item.user_id) === String(userId),
  )

  const renderSmartVoteContext = (profile: EkohProfile) => {
    const scoresByDomain = new Map(
      (profile.expertise ?? []).map((item) => [item.domainCode, item]),
    )
    const relevantRows = domains.map((domain) => ({
      ...domain,
      expertise: scoresByDomain.get(domain.domain_code)?.weightedScore ?? 0,
    }))

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.expertiseIsContextualNotAUniversalRank")}
          description={i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.ekohOwnsTheRatingsAndTheirDisclosure")}
        />

        {loadingReading ? (
          <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.loadingQuestionSpecificReading")}</Text>
        ) : (
          <>
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.contextualAlignment")}>
                {participantReading ? i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.text", { value1: pct(participantReading.expertise_alignment) }) : i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.advisoryWeight")}>
                {participantReading
                  ? i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.text_94ea89", { value1: participantReading.advisory_weight.toFixed(2) })
                  : i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.notAvailable")}
              </Descriptions.Item>
              <Descriptions.Item label={i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.advisoryStatus")}>
                {participantReading?.included_in_advisory === false ? (
                  <Tag color="orange">{i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.recusedExcludedFromAdvisoryReading")}</Tag>
                ) : (
                  <Tag color="green">{i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.includedWhenThisLensIsUsed")}</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {participantReading?.exclusion_reason ? (
              <Alert
                type="warning"
                showIcon
                message={i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.declaredAdvisoryExclusion")}
                description={participantReading.exclusion_reason}
              />
            ) : null}

            <List
              header={<Text strong>{i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.relevantDomainsForThisQuestion")}</Text>}
              dataSource={relevantRows}
              locale={{ emptyText: i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.noDomainRelevanceVectorIsAttachedTo") }}
              renderItem={(item) => (
                <List.Item key={item.domain_code}>
                  <div style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                      <Space wrap>
                        <Text strong>{item.domain_name}</Text>
                        <Tag>{item.domain_code}</Tag>
                        <Tag>{i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.question")} {pct(item.weight)}%</Tag>
                      </Space>
                      <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.profile")} {pct(item.expertise)}%</Text>
                    </Space>
                    <Progress percent={pct(item.expertise)} showInfo={false} />
                  </div>
                </List.Item>
              )}
            />

            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {i18nT("ui.ethikos.deliberate.topic.ekohparticipantdrawer.thisInfluenceAppliesToThisQuestionIt")}
            </Paragraph>
          </>
        )}
      </Space>
    )
  }

  return (
    <EkohRatingDrawer
      open={open}
      userId={userId}
      fallbackDisplayName={participant?.displayName}
      onClose={onClose}
      testId="ekoh-context-drawer"
    >
      {renderSmartVoteContext}
    </EkohRatingDrawer>
  )
}
