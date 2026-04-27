'use client'

import { Card, Col, Row, Space, Typography } from 'antd'
import { ProCard } from '@ant-design/pro-components'

import ArgumentSourcesPanel from '@/modules/ethikos/components/ArgumentSourcesPanel'
import type { ArgumentTreeItem } from '@/modules/ethikos/components/ArgumentTree'
import DiscussionVisibilityPanel from '@/modules/ethikos/components/DiscussionVisibilityPanel'
import ImpactVoteControl from '@/modules/ethikos/components/ImpactVoteControl'
import SuggestionQueue from '@/modules/ethikos/components/SuggestionQueue'
import type {
  DiscussionParticipantRoleApi,
  EthikosId,
} from '@/services/ethikos'

import { toSuggestionSide } from '../_lib/topicThreadUtils'
import EmptySelectionCard from './EmptySelectionCard'
import ParticipantRolesPanel from './ParticipantRolesPanel'

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
  return (
    <ProCard title="Korum Wave 1 panels" ghost>
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
              title="Sources"
              description="Select an argument to manage sources"
            />
          )}
        </Col>

        <Col xs={24} lg={12} xl={6}>
          {selectedArgumentId ? (
            <Card size="small" title="Impact votes">
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Text type="secondary">
                  Claim-level impact signal for the selected argument.
                </Text>
                <ImpactVoteControl
                  argumentId={selectedArgumentId}
                  onChange={onMutation}
                />
                <Text type="secondary">
                  Impact votes are argument-level signals, not topic stances.
                </Text>
              </Space>
            </Card>
          ) : (
            <EmptySelectionCard
              title="Impact votes"
              description="Select an argument to vote on impact"
            />
          )}
        </Col>

        <Col xs={24} lg={12} xl={6}>
          <SuggestionQueue
            topicId={topicId}
            parentId={selectedArgumentId}
            side={toSuggestionSide(selectedArgument?.side)}
            title="Suggestions"
            description={
              selectedArgument
                ? 'Suggest a reply or refinement for the selected argument.'
                : 'Suggest a new top-level argument for review.'
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
