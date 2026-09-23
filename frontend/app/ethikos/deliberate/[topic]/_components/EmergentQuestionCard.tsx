'use client'

import { useLanguage } from '@/context/LanguageContext';
import { ArrowRightOutlined, BulbOutlined } from '@ant-design/icons'
import { ProCard } from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { Alert, Button, Space, Tag, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import { useMemo } from 'react'

import { fetchEliteTopics } from '@/services/deliberate'

const { Text } = Typography

function isEconomicAutonomyDemo(title: string): boolean {
  const value = title.toLowerCase()
  return (
    value.includes('[demo]') &&
    (
      value.includes('dépendance') ||
      value.includes('dependance') ||
      value.includes('dependence')
    ) &&
    (
      value.includes('états-unis') ||
      value.includes('etats-unis') ||
      value.includes('united states')
    )
  )
}

function isTrumpQuestion(title: string): boolean {
  return title.toLowerCase().includes('donald trump')
}

export default function EmergentQuestionCard({
  currentTitle,
}: {
  currentTitle: string
}): JSX.Element | null {
  const { t: i18nT } = useLanguage();
  const router = useRouter()
  const enabled = isEconomicAutonomyDemo(currentTitle)
  const { data, loading } = useRequest(fetchEliteTopics, { ready: enabled })

  const target = useMemo(
    () => data?.list.find((topic) => isTrumpQuestion(topic.title)),
    [data],
  )

  if (!enabled) return null

  return (
    <ProCard
      title={
        <Space>
          <BulbOutlined />
          <span>{i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.questionEmergedFromThisDeliberation")}</span>
        </Space>
      }
      data-testid="emergent-question-card"
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.theInfrastructureProposalCreatesANewGovernance")}
          description={i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.ethikosCanPreserveTheOriginalDiscussionWhile")}
        />

        {target ? (
          <Space direction="vertical" size={8} style={{ width: '100%' }}>
            <Space wrap>
              <Tag color="purple">{i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.demoFiction")}</Tag>
              <Tag>{i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.newQuestion")}</Tag>
            </Space>

            <Text strong>{target.title}</Text>

            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              data-testid="open-emergent-question"
              onClick={() => router.push(`/ethikos/deliberate/${target.id}`)}
            >
              {i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.openQuestion")}
            </Button>
          </Space>
        ) : (
          <Button loading={loading} disabled>
            {i18nT("ui.ethikos.deliberate.topic.emergentquestioncard.findingLinkedQuestion")}
          </Button>
        )}
      </Space>
    </ProCard>
  )
}