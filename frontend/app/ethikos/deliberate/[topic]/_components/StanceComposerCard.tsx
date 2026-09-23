'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Button, Card, Slider, Space, Tag, Typography } from 'antd'

import type { TopicStanceValue } from '@/services/deliberate'

import {
  clampStance,
  stanceColor,
  stanceLabel,
} from '../_lib/topicThreadUtils'

const { Text, Paragraph } = Typography

export default function StanceComposerCard({
  value,
  loading,
  onChange,
  onSave,
}: {
  value: TopicStanceValue
  loading: boolean
  onChange: (value: TopicStanceValue) => void
  onSave: () => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  const currentLabel = stanceLabel(value)
  const currentColor = stanceColor(value)

  return (
    <Card
      title={i18nT("ui.ethikos.deliberate.topic.stancecomposercard.setYourPosition")}
      extra={<Tag color={currentColor}>{currentLabel}</Tag>}
    >
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <div>
          <Text strong>{i18nT("ui.ethikos.deliberate.topic.stancecomposercard.whereDoYouStandOnThisTopic")}</Text>
          <Paragraph type="secondary" style={{ marginBottom: 0, marginTop: 4 }}>
            {i18nT("ui.ethikos.deliberate.topic.stancecomposercard.chooseATopicLevelStanceBeforeAdding")}
          </Paragraph>
        </div>

        <Slider
          min={-3}
          max={3}
          step={1}
          dots
          value={value}
          style={{ margin: '8px 6px 0' }}
          tooltip={{
            formatter: (nextValue) =>
              typeof nextValue === 'number'
                ? stanceLabel(clampStance(nextValue))
                : currentLabel,
          }}
          onChange={(nextValue) => {
            if (typeof nextValue === 'number') {
              onChange(clampStance(nextValue))
            }
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.stancecomposercard.oppose")}</Text>
          <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.stancecomposercard.neutral")}</Text>
          <Text type="secondary">{i18nT("ui.ethikos.deliberate.topic.stancecomposercard.support")}</Text>
        </div>

        <Button
          type="primary"
          loading={loading}
          onClick={onSave}
          block
        >
          {i18nT("ui.ethikos.deliberate.topic.stancecomposercard.saveTopicStance")}
        </Button>

        <Text type="secondary">
          {i18nT("ui.ethikos.deliberate.topic.stancecomposercard.thisIsYourPositionOnTheTopic")}
        </Text>
      </Space>
    </Card>
  )
}