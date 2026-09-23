'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer } from '@ant-design/pro-components'
import { Card, Empty, Space, Spin, Typography } from 'antd'

const { Text } = Typography

export function TopicLoadingState(): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <PageContainer ghost>
      <Card>
        <Space>
          <Spin />
          <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.topicstates.loadingDeliberationThread")}</Text>
        </Space>
      </Card>
    </PageContainer>
  )
}

export function TopicErrorState({
  description,
}: {
  description: string
}): JSX.Element {
  return (
    <PageContainer ghost>
      <Empty description={description} />
    </PageContainer>
  )
}
