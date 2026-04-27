'use client'

import 'dayjs/locale/en'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Alert, Col, Row, Space } from 'antd'
import { PageContainer } from '@ant-design/pro-components'

import EthikosPageShell from '@/app/ethikos/EthikosPageShell'
import type { EthikosId } from '@/services/ethikos'

import ArgumentComposerCard from './_components/ArgumentComposerCard'
import ArgumentThreadCard from './_components/ArgumentThreadCard'
import KorumPanelsGrid from './_components/KorumPanelsGrid'
import StanceComposerCard from './_components/StanceComposerCard'
import { TopicErrorState, TopicLoadingState } from './_components/TopicStates'
import TopicSummaryPanel from './_components/TopicSummaryPanel'
import { useTopicThreadController } from './_hooks/useTopicThreadController'
import { formatRelativeDate } from './_lib/topicThreadUtils'

dayjs.extend(relativeTime)

export default function TopicThreadPage(): JSX.Element {
  const controller = useTopicThreadController()

  if (!controller.topicId) {
    return (
      <EthikosPageShell title="Deliberate · Topic" sectionLabel="Deliberate">
        <TopicErrorState description="Missing topic id" />
      </EthikosPageShell>
    )
  }

  if (controller.loading && !controller.pageData) {
    return (
      <EthikosPageShell title="Deliberate · Topic" sectionLabel="Deliberate">
        <TopicLoadingState />
      </EthikosPageShell>
    )
  }

  if (!controller.loading && !controller.pageData) {
    return (
      <EthikosPageShell title="Deliberate · Topic" sectionLabel="Deliberate">
        <TopicErrorState
          description={controller.pageError?.message ?? 'Topic not found'}
        />
      </EthikosPageShell>
    )
  }

  return (
    <EthikosPageShell
      title={controller.pageData?.title ?? 'Deliberate · Topic'}
      sectionLabel="Deliberate"
      subtitle={
        controller.pageData?.category
          ? `${controller.pageData.category} · ${formatRelativeDate(
              controller.pageData.lastActivity,
            )}`
          : undefined
      }
    >
      <PageContainer ghost loading={controller.loading}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message="Korum structured deliberation"
            description="This page uses the canonical ethiKos service layer for topic detail, stances, arguments, sources, impact votes, suggestions, roles, and visibility. Topic stances remain separate from argument impact votes and Smart Vote readings."
          />

          <TopicSummaryPanel
            topic={controller.pageData}
            stats={controller.stats}
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <StanceComposerCard
                value={controller.stanceValue}
                loading={controller.savingStance}
                onChange={controller.setStanceValue}
                onSave={controller.handleSaveStance}
              />
            </Col>

            <Col xs={24} lg={16}>
              <ArgumentComposerCard
                replyTarget={controller.replyTarget}
                side={controller.newArgumentSide}
                value={controller.newArgument}
                loading={controller.savingArgument}
                onSideChange={controller.handleSideChange}
                onValueChange={controller.setNewArgument}
                onSubmit={controller.handlePostArgument}
                onClearReply={() => controller.setReplyTarget(null)}
              />
            </Col>
          </Row>

          <ArgumentThreadCard
            items={controller.argumentItems}
            loading={controller.loadingPageData}
            selectedArgument={controller.selectedArgument}
            onSelect={controller.setSelectedArgument}
            onReply={controller.handleReply}
            onRefresh={controller.refreshPageData}
          />

          <KorumPanelsGrid
            topicId={controller.topicId as EthikosId}
            selectedArgument={controller.selectedArgument}
            selectedArgumentId={controller.selectedArgumentId}
            participantRoles={controller.participantRoles}
            loadingParticipantRoles={controller.loadingParticipantRoles}
            refreshKey={controller.korumRefreshKey}
            onMutation={controller.handleKorumMutation}
            onRefreshParticipantRoles={controller.refreshParticipantRoles}
          />
        </Space>
      </PageContainer>
    </EthikosPageShell>
  )
}
