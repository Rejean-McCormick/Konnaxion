'use client'

import { Button, Card, Slider, Space, Tag, Typography } from 'antd'

import type { TopicStanceValue } from '@/services/deliberate'

import {
  clampStance,
  stanceColor,
  stanceLabel,
  STANCE_MARKS,
} from '../_lib/topicThreadUtils'

const { Text } = Typography

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
  return (
    <Card title="Your stance">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        <Text>
          Current value: <Tag color={stanceColor(value)}>{stanceLabel(value)}</Tag>
        </Text>

        <Slider
          min={-3}
          max={3}
          step={1}
          marks={STANCE_MARKS}
          value={value}
          onChange={(nextValue) => {
            if (typeof nextValue === 'number') {
              onChange(clampStance(nextValue))
            }
          }}
        />

        <Button type="primary" loading={loading} onClick={onSave} block>
          Save stance
        </Button>

        <Text type="secondary">
          Stances are topic-level signals, not claim impact votes.
        </Text>
      </Space>
    </Card>
  )
}
