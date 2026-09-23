'use client'

import { useLanguage } from '@/context/LanguageContext';
import 'dayjs/locale/en'
import {
  BranchesOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Alert, Col, Row, Space, Steps, Typography } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useState } from 'react'

import EthikosPageShell from '@/app/ethikos/EthikosPageShell'
import type { EthikosId } from '@/services/ethikos'

import ArgumentComposerCard from './_components/ArgumentComposerCard'
import ArgumentThreadCard from './_components/ArgumentThreadCard'
import type { ParticipantContextTarget } from './_components/ArgumentThreadCard'
import EkohParticipantDrawer from './_components/EkohParticipantDrawer'
import EmergentQuestionCard from './_components/EmergentQuestionCard'
import KorumPanelsGrid from './_components/KorumPanelsGrid'
import SmartVoteReadingsPanel from './_components/SmartVoteReadingsPanel'
import StanceComposerCard from './_components/StanceComposerCard'
import { TopicErrorState, TopicLoadingState } from './_components/TopicStates'
import TopicSummaryPanel from './_components/TopicSummaryPanel'
import { useTopicThreadController } from './_hooks/useTopicThreadController'
import { formatRelativeDate } from './_lib/topicThreadUtils'

dayjs.extend(relativeTime)

const { Text } = Typography

export default function TopicThreadPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const controller = useTopicThreadController()
  const [participantContext, setParticipantContext] =
    useState<ParticipantContextTarget | null>(null)

  if (!controller.topicId) {
    return (
      <EthikosPageShell title={i18nT("ui.ethikos.deliberate.topic.deliberateTopic")} sectionLabel={i18nT("ui.ethikos.deliberate.topic.deliberate")}>
        <TopicErrorState description={i18nT("ui.ethikos.deliberate.topic.missingTopicId")} />
      </EthikosPageShell>
    )
  }

  if (controller.loading && !controller.pageData) {
    return (
      <EthikosPageShell title={i18nT("ui.ethikos.deliberate.topic.deliberateTopic")} sectionLabel={i18nT("ui.ethikos.deliberate.topic.deliberate")}>
        <TopicLoadingState />
      </EthikosPageShell>
    )
  }

  if (!controller.loading && !controller.pageData) {
    return (
      <EthikosPageShell title={i18nT("ui.ethikos.deliberate.topic.deliberateTopic")} sectionLabel={i18nT("ui.ethikos.deliberate.topic.deliberate")}>
        <TopicErrorState
          description={controller.pageError?.message ?? i18nT("ui.ethikos.deliberate.topic.topicNotFound")}
        />
      </EthikosPageShell>
    )
  }

  const topic = controller.pageData

  if (!topic) {
    return (
      <EthikosPageShell title={i18nT("ui.ethikos.deliberate.topic.deliberateTopic")} sectionLabel={i18nT("ui.ethikos.deliberate.topic.deliberate")}>
        <TopicErrorState description={i18nT("ui.ethikos.deliberate.topic.topicDataUnavailable")} />
      </EthikosPageShell>
    )
  }

  return (
    <EthikosPageShell
      title={topic?.title ?? i18nT("ui.ethikos.deliberate.topic.deliberateTopic")}
      sectionLabel={i18nT("ui.ethikos.deliberate.topic.deliberate")}
      subtitle={
        topic?.category
          ? i18nT("ui.ethikos.deliberate.topic.text", { category: topic.category, value1: formatRelativeDate(topic.lastActivity) })
          : undefined
      }
    >
      <PageContainer ghost loading={controller.loading}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.deliberate.topic.structureTheReasonsBeforeDeciding")}
            description={i18nT("ui.ethikos.deliberate.topic.readTheTopicChooseYourStanceCompare")}
          />

          <ProCard>
            <Steps
              size="small"
              current={controller.selectedArgument ? 3 : 2}
              items={[
                {
                  title: i18nT("ui.ethikos.deliberate.topic.understand"),
                  description: i18nT("ui.ethikos.deliberate.topic.readTheTopic"),
                  icon: <ProfileOutlined />,
                },
                {
                  title: i18nT("ui.ethikos.deliberate.topic.takeStance"),
                  description: i18nT("ui.ethikos.deliberate.topic.positionYourself"),
                  icon: <CheckCircleOutlined />,
                },
                {
                  title: i18nT("ui.ethikos.deliberate.topic.deliberate"),
                  description: i18nT("ui.ethikos.deliberate.topic.addArgumentsOrReplies"),
                  icon: <BranchesOutlined />,
                },
                {
                  title: i18nT("ui.ethikos.deliberate.topic.reviewDetails"),
                  description: i18nT("ui.ethikos.deliberate.topic.inspectEvidenceAndSignals"),
                  icon: <MessageOutlined />,
                },
              ]}
            />
          </ProCard>

          <TopicSummaryPanel topic={topic} stats={controller.stats} />

          <Row gutter={[16, 16]} align="top">
            <Col xs={24} xl={8}>
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                <StanceComposerCard
                  value={controller.stanceValue}
                  loading={controller.savingStance}
                  onChange={controller.setStanceValue}
                  onSave={controller.handleSaveStance}
                />

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
              </Space>
            </Col>

            <Col xs={24} xl={16}>
              <ArgumentThreadCard
                items={controller.argumentItems}
                loading={controller.loadingPageData}
                selectedArgument={controller.selectedArgument}
                onSelect={controller.setSelectedArgument}
                onReply={controller.handleReply}
                onRefresh={controller.refreshPageData}
                onOpenParticipant={setParticipantContext}
              />
            </Col>
          </Row>

          <ProCard
            title={i18nT("ui.ethikos.deliberate.topic.selectedArgumentDetails")}
            subTitle={
              controller.selectedArgument ? (
                <Text type="secondary">
                  {i18nT("ui.ethikos.deliberate.topic.reviewTheSelectedStatementSEvidenceImpact")}
                </Text>
              ) : (
                <Text type="secondary">
                  {i18nT("ui.ethikos.deliberate.topic.selectAnArgumentAboveToInspectIts")}
                </Text>
              )
            }
          >
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
          </ProCard>

          <EmergentQuestionCard currentTitle={topic.title} />

          <SmartVoteReadingsPanel
            topicId={controller.topicId as EthikosId}
            onOpenParticipant={setParticipantContext}
          />

          <EkohParticipantDrawer
            open={Boolean(participantContext)}
            participant={participantContext}
            topicId={controller.topicId as EthikosId}
            onClose={() => setParticipantContext(null)}
          />
        </Space>
      </PageContainer>
    </EthikosPageShell>
  )
}