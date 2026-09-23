'use client'

import type { TranslateFunction } from '@/i18n/runtime';
import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import {
  BranchesOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { ProCard } from '@ant-design/pro-components'
import { Alert, Button, Space, Tag, Tooltip, Typography } from 'antd'

import ArgumentTree from '@/modules/ethikos/components/ArgumentTree'
import type { ArgumentTreeItem, ArgumentTreeNode } from '@/modules/ethikos/components/ArgumentTree'
import type { TopicDetailStatement } from '@/services/deliberate'

import { sideColor, sideLabel } from '../_lib/topicThreadUtils'

const { Text } = Typography

export interface ParticipantContextTarget {
  userId: string
  displayName: string
}

type NarrativeKind = 'announcement' | 'moderation' | 'conflict' | 'recusal' | null

function rawStatement(argument: ArgumentTreeNode): TopicDetailStatement | null {
  if (!argument.raw || typeof argument.raw !== 'object') return null
  return argument.raw as TopicDetailStatement
}

function participantTarget(argument: ArgumentTreeNode): ParticipantContextTarget | null {
  const raw = rawStatement(argument)
  if (!raw?.userId) return null
  return {
    userId: raw.userId,
    displayName: String(argument.author || raw.author || `User ${raw.userId}`),
  }
}

function narrativeKind(argument: ArgumentTreeNode): NarrativeKind {
  const author = String(argument.author ?? '').toLowerCase()
  const body = String(argument.body ?? '').trim()
  const upper = body.toUpperCase()

  if (author.includes('inquisiteur') || upper.startsWith('MODÉRATION') || upper.startsWith('MODERATION')) {
    return 'moderation'
  }
  if (upper.startsWith('RÉCUSATION') || upper.startsWith('RECUSATION')) {
    return 'recusal'
  }
  if (body.toLowerCase().startsWith('contexte déclaré:')) {
    return 'conflict'
  }
  if (
    author.includes('king klown') &&
    (upper.includes('PUISSANCE DÉDIÉE') || upper.includes('PUISSANCE DEDIEE'))
  ) {
    return 'announcement'
  }
  return null
}

function selectedArgumentLabel(i18nT: TranslateFunction, argument: ArgumentTreeItem | null): string {
  if (!argument) return i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.noArgumentSelected")
  const side = sideLabel(argument.side)
  const preview = argument.body?.trim()
  if (!preview) return `${side} argument selected`
  return `${side}: ${preview.slice(0, 48)}${preview.length > 48 ? '…' : ''}`
}

function narrativeMeta(argument: ArgumentTreeNode): JSX.Element | null {
  const kind = narrativeKind(argument)
  if (!kind) return null

  if (kind === 'announcement') {
    return (
      <Space size={4} wrap>
        <Tag color="purple"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.demoFiction" /></Tag>
        <Tag color="blue"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.publicAnnouncement" /></Tag>
      </Space>
    )
  }
  if (kind === 'moderation') {
    return (
      <Space size={4} wrap>
        <Tag color="purple"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.demoFiction" /></Tag>
        <Tag color="orange"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.moderationEvent" /></Tag>
      </Space>
    )
  }
  if (kind === 'conflict') {
    return (
      <Space size={4} wrap>
        <Tag color="purple"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.demoFiction" /></Tag>
        <Tag color="gold"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.declaredConflict" /></Tag>
      </Space>
    )
  }
  return (
    <Space size={4} wrap>
      <Tag color="purple"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.demoFiction" /></Tag>
      <Tag color="cyan"><TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.advisoryRecusal" /></Tag>
    </Space>
  )
}

function narrativeBody(argument: ArgumentTreeNode): JSX.Element {
  const kind = narrativeKind(argument)

  if (kind === 'announcement') {
    return (
      <Alert
        type="info"
        showIcon
        message={<TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.publicAnnouncementFictionalDemoScenario" />}
        description={<strong style={{ whiteSpace: 'pre-wrap' }}>{argument.body}</strong>}
        style={{ marginBottom: 8 }}
      />
    )
  }
  if (kind === 'moderation') {
    return (
      <Alert
        type="warning"
        showIcon
        message={<TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.moderationEvent" />}
        description={argument.body}
        style={{ marginBottom: 8 }}
      />
    )
  }
  if (kind === 'conflict') {
    return (
      <Alert
        type="warning"
        showIcon
        message={<TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.declaredParticipantContext" />}
        description={argument.body}
        style={{ marginBottom: 8 }}
      />
    )
  }
  if (kind === 'recusal') {
    return (
      <Alert
        type="success"
        showIcon
        message={<TranslatedText id="ui.ethikos.deliberate.topic.argumentthreadcard.voluntaryAdvisoryRecusal" />}
        description={argument.body}
        style={{ marginBottom: 8 }}
      />
    )
  }

  return (
    <p style={{ marginTop: 0, marginBottom: 8, whiteSpace: 'pre-wrap' }}>
      {argument.body}
    </p>
  )
}

export default function ArgumentThreadCard({
  items,
  loading,
  selectedArgument,
  onSelect,
  onReply,
  onRefresh,
  onOpenParticipant,
}: {
  items: ArgumentTreeItem[]
  loading: boolean
  selectedArgument: ArgumentTreeItem | null
  onSelect: (argument: ArgumentTreeItem) => void
  onReply: (argument: ArgumentTreeItem) => void
  onRefresh: () => void
  onOpenParticipant: (target: ParticipantContextTarget) => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <ProCard
      title={
        <Space>
          <BranchesOutlined />
          <span>{i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.argumentsAndReplies")}</span>
        </Space>
      }
      extra={
        <Space wrap>
          <Tag>{items.length} {i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.statements")}</Tag>
          {selectedArgument ? (
            <Tooltip title={selectedArgumentLabel(i18nT, selectedArgument)}>
              <Tag color="blue">{i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.argumentSelected")}</Tag>
            </Tooltip>
          ) : (
            <Tag>{i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.chooseAnArgument")}</Tag>
          )}
          <Tooltip title={i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.refreshTheArgumentThread")}>
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>{i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.refresh")}</Button>
          </Tooltip>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text type="secondary">
          {i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.readTheArgumentThreadInspectEvidenceAnd")}
        </Text>

        <ArgumentTree
          items={items}
          loading={loading}
          selectedId={selectedArgument?.id ?? null}
          onSelect={onSelect}
          onReply={onReply}
          renderAuthor={(argument) => {
            const participant = participantTarget(argument)
            if (!participant) return <strong>{argument.author}</strong>
            return (
              <Button
                type="link"
                size="small"
                data-testid={`ekoh-participant-${participant.userId}`}
                style={{ padding: 0, height: 'auto', fontWeight: 600 }}
                onClick={(event) => {
                  event.stopPropagation()
                  onOpenParticipant(participant)
                }}
              >
                {argument.author}
              </Button>
            )
          }}
          renderBody={narrativeBody}
          renderActions={(argument) => {
            const isSelected = selectedArgument?.id === argument.id
            const participant = participantTarget(argument)
            return (
              <Space size={4} wrap>
                {participant && (
                  <Button
                    size="small"
                    type="link"
                    icon={<SafetyCertificateOutlined />}
                    onClick={(event) => {
                      event.stopPropagation()
                      onOpenParticipant(participant)
                    }}
                  >
                    {i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.ekohContext")}
                  </Button>
                )}
                <Button
                  size="small"
                  type={isSelected ? 'primary' : 'link'}
                  icon={<InfoCircleOutlined />}
                  onClick={(event) => {
                    event.stopPropagation()
                    onSelect(argument)
                  }}
                >
                  {isSelected ? i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.viewingDetails") : i18nT("ui.ethikos.deliberate.topic.argumentthreadcard.viewDetails")}
                </Button>
              </Space>
            )
          }}
          renderMeta={(argument) => (
            <Space size={4} wrap>
              <Tag color={sideColor(argument.side)}>{sideLabel(argument.side)}</Tag>
              {narrativeMeta(argument)}
            </Space>
          )}
        />
      </Space>
    </ProCard>
  )
}
