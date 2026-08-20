'use client'

import { useMemo } from 'react'
import { useRequest } from 'ahooks'
import {
  Alert,
  Descriptions,
  Drawer,
  Empty,
  List,
  Progress,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'

import { fetchEthikosTopicReading, primaryAdvisoryReading } from '@/services/readings'
import { fetchEkohProfile } from '@/services/trust'

import type { ParticipantContextTarget } from './ArgumentThreadCard'

const { Paragraph, Text, Title } = Typography

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
  const userId = participant?.userId

  const { data: profile, loading: loadingProfile } = useRequest(
    () => fetchEkohProfile(userId!),
    {
      ready: open && Boolean(userId),
      refreshDeps: [open, userId],
    },
  )

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

  const scoresByDomain = useMemo(
    () => new Map((profile?.expertise ?? []).map((item) => [item.domainCode, item])),
    [profile],
  )

  const relevantRows = useMemo(
    () =>
      domains.map((domain) => ({
        ...domain,
        expertise: scoresByDomain.get(domain.domain_code)?.weightedScore ?? 0,
      })),
    [domains, scoresByDomain],
  )

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={560}
      title={`EkoH context · ${participant?.displayName ?? 'Participant'}`}
      data-testid="ekoh-context-drawer"
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message="Expertise is contextual, not a universal rank"
          description="This view compares the participant’s domain-specific EkoH profile with the domains declared relevant to this question. It does not grant permanent influence."
        />

        {loadingProfile || loadingReading ? (
          <Skeleton active paragraph={{ rows: 8 }} />
        ) : !profile ? (
          <Empty description="No EkoH profile is available for this participant." />
        ) : (
          <>
            <div>
              <Title level={4} style={{ marginBottom: 4 }}>{profile.displayName}</Title>
              <Text type="secondary">Question-specific expertise context</Text>
            </div>

            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label="EkoH user ID">{profile.userId}</Descriptions.Item>
              <Descriptions.Item label="Visibility">
                <Tag>{profile.confidentialityLevel}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Ethics / reliability modifier">
                {profile.ethicsScore.toFixed(2)}×
              </Descriptions.Item>
              <Descriptions.Item label="Contextual alignment">
                {participantReading ? `${pct(participantReading.expertise_alignment)}%` : 'Not available'}
              </Descriptions.Item>
              <Descriptions.Item label="Advisory status">
                {participantReading?.included_in_advisory === false ? (
                  <Tag color="orange">Recused / excluded from advisory reading</Tag>
                ) : (
                  <Tag color="green">Included when this lens is used</Tag>
                )}
              </Descriptions.Item>
            </Descriptions>

            {participantReading?.exclusion_reason && (
              <Alert
                type="warning"
                showIcon
                message="Declared advisory exclusion"
                description={participantReading.exclusion_reason}
              />
            )}

            <List
              header={<Text strong>Relevant domains for this question</Text>}
              dataSource={relevantRows}
              locale={{ emptyText: 'No domain relevance vector is attached to this question.' }}
              renderItem={(item) => (
                <List.Item key={item.domain_code}>
                  <div style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                      <Space wrap>
                        <Text strong>{item.domain_name}</Text>
                        <Tag>{item.domain_code}</Tag>
                        <Tag>Question {pct(item.weight)}%</Tag>
                      </Space>
                      <Text type="secondary">Profile {pct(item.expertise)}%</Text>
                    </Space>
                    <Progress percent={pct(item.expertise)} showInfo={false} />
                  </div>
                </List.Item>
              )}
            />

            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              This influence applies to this question. It is not a general rank. The public baseline remains separate from every EkoH-adjusted Smart Vote reading.
            </Paragraph>
          </>
        )}
      </Space>
    </Drawer>
  )
}
