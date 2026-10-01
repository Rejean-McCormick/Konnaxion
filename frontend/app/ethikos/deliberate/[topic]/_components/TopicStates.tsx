'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer } from '@ant-design/pro-components'
import { Button, Card, Empty, Space, Spin, Typography } from 'antd'
import Link from 'next/link'

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
  actionHref,
  actionLabel,
}: {
  description: string
  actionHref?: string
  actionLabel?: string
}): JSX.Element {
  return (
    <PageContainer ghost>
      <Empty description={description}>
        {actionHref && actionLabel ? (
          <Link href={actionHref} prefetch={false}>
            <Button type="primary">{actionLabel}</Button>
          </Link>
        ) : null}
      </Empty>
    </PageContainer>
  )
}
