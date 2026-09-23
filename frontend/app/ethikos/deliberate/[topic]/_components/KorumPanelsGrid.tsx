'use client'

import { useLanguage } from '@/context/LanguageContext';
import { ProCard } from '@ant-design/pro-components'
import { Card, Col, Row, Space, Typography } from 'antd'

import ArgumentSourcesPanel from '@/modules/ethikos/components/ArgumentSourcesPanel'
import type { ArgumentTreeItem } from '@/modules/ethikos/components/ArgumentTree'
import DiscussionVisibilityPanel from '@/modules/ethikos/components/DiscussionVisibilityPanel'
import ImpactVoteControl from '@/modules/ethikos/components/ImpactVoteControl'
import SuggestionQueue from '@/modules/ethikos/components/SuggestionQueue'
import type {
  DiscussionParticipantRoleApi,
  EthikosId,
} from '@/services/ethikos'

import EmptySelectionCard from './EmptySelectionCard'
import ParticipantRolesPanel from './ParticipantRolesPanel'

import { toSuggestionSide } from '../_lib/topicThreadUtils'

const { Text } = Typography

export default function KorumPanelsGrid({
  topicId,
  selectedArgument,
  selectedArgumentId,
  participantRoles,
  loadingParticipantRoles,
  refreshKey,
  onMutation,
  onRefreshParticipantRoles,
}: {
  topicId: EthikosId
  selectedArgument: ArgumentTreeItem | null
  selectedArgumentId: string | null
  participantRoles: DiscussionParticipantRoleApi[]
  loadingParticipantRoles: boolean
  refreshKey: number
  onMutation: () => void
  onRefreshParticipantRoles: () => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <ProCard
      title={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.argumentDetailsAndFollowUp")}
      subTitle={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.selectArgumentFollowUpHint")}
      ghost
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12} xl={6}>
          {selectedArgumentId ? (
            <ArgumentSourcesPanel
              argumentId={selectedArgumentId}
              compact
              refreshKey={refreshKey}
              onCreated={onMutation}
            />
          ) : (
            <EmptySelectionCard
              title={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.sources")}
              description={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.selectAnArgumentToAddReferencesCitations")}
            />
          )}
        </Col>

        <Col xs={24} lg={12} xl={6}>
          {selectedArgumentId ? (
            <Card size="small" title={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.impactSignal")}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text type="secondary">
                  {i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.rateThePracticalImportanceOfTheSelected")}
                </Text>

                <ImpactVoteControl
                  argumentId={selectedArgumentId}
                  onChange={onMutation}
                />

                <Text type="secondary">
                  {i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.thisSignalAppliesToTheArgumentOnly")}
                </Text>
              </Space>
            </Card>
          ) : (
            <EmptySelectionCard
              title={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.impactSignal")}
              description={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.selectAnArgumentToRateItsPractical")}
            />
          )}
        </Col>

        <Col xs={24} lg={12} xl={6}>
          <SuggestionQueue
            topicId={topicId}
            parentId={selectedArgumentId}
            side={toSuggestionSide(selectedArgument?.side)}
            title={i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.suggestedImprovement")}
            description={
              selectedArgument
                ? i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.suggestAReplyRefinementOrMissingNuance")
                : i18nT("ui.ethikos.deliberate.topic.korumpanelsgrid.suggestANewTopLevelArgumentFor")
            }
            onSubmitted={onMutation}
          />
        </Col>

        <Col xs={24} lg={12} xl={6}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <DiscussionVisibilityPanel
              topicId={topicId}
              editable
              compact
              onChange={onMutation}
            />

            <ParticipantRolesPanel
              roles={participantRoles}
              loading={loadingParticipantRoles}
              onRefresh={onRefreshParticipantRoles}
            />
          </Space>
        </Col>
      </Row>
    </ProCard>
  )
}