'use client'

import { useLanguage } from '@/context/LanguageContext';
import { ProCard } from '@ant-design/pro-components'
import { Progress, Space, Statistic, Tag, Typography } from 'antd'

import type { TopicDetailResponse } from '@/services/deliberate'

import { formatRelativeDate } from '../_lib/topicThreadUtils'
import type { StanceStats } from '../_lib/topicThreadUtils'

const { Title, Paragraph, Text } = Typography

export default function TopicSummaryPanel({
  topic,
  stats,
}: {
  topic?: TopicDetailResponse
  stats: StanceStats
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <ProCard split="vertical" gutter={16}>
      <ProCard colSpan="70%">
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <div>
            <Title level={3} style={{ marginBottom: 4 }}>
              {topic?.title}
            </Title>
            <Space wrap>
              {topic?.category && <Tag>{topic.category}</Tag>}
              <Tag color="blue">{i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.deliberate")}</Tag>
              <Text type="secondary">
                {i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.created")} {formatRelativeDate(topic?.createdAt)}
              </Text>
            </Space>
          </div>

          {topic?.description ? (
            <Paragraph style={{ marginBottom: 0 }}>{topic.description}</Paragraph>
          ) : (
            <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.noTopicDescriptionProvided")}</Text>
          )}
        </Space>
      </ProCard>

      <ProCard colSpan="30%" title={i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.topicStance")}>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Statistic
            title={i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.averageStance")}
            value={stats.average}
            precision={2}
            suffix="/ 3"
          />

          <Progress
            percent={
              stats.total > 0 ? Math.round((stats.support / stats.total) * 100) : 0
            }
            size="small"
            status="active"
          />

          <Space wrap>
            <Tag color="green">{i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.support")} {stats.support}</Tag>
            <Tag>{i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.neutral")} {stats.neutral}</Tag>
            <Tag color="red">{i18nT("ui.ethikos.deliberate.topic.topicsummarypanel.oppose")} {stats.oppose}</Tag>
          </Space>
        </Space>
      </ProCard>
    </ProCard>
  )
}
