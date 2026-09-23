'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Button, Card, Input, Segmented, Space } from 'antd'
import type { SegmentedValue } from 'antd/es/segmented'

import type { ArgumentTreeItem } from '@/modules/ethikos/components/ArgumentTree'
import type { ArgumentSide } from '@/services/ethikos'

const { TextArea } = Input

export default function ArgumentComposerCard({
  replyTarget,
  side,
  value,
  loading,
  onSideChange,
  onValueChange,
  onSubmit,
  onClearReply,
}: {
  replyTarget: ArgumentTreeItem | null
  side: ArgumentSide
  value: string
  loading: boolean
  onSideChange: (value: SegmentedValue) => void
  onValueChange: (value: string) => void
  onSubmit: () => void
  onClearReply: () => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <Card title={i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.addToTheArgumentThread")}>
      <Space direction="vertical" size={12} style={{ width: '100%' }}>
        {replyTarget && (
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.replyingTo", { value1: replyTarget.author ?? 'Anonymous' })}
            description={replyTarget.body}
            action={
              <Button size="small" onClick={onClearReply}>
                {i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.clear")}
              </Button>
            }
          />
        )}

        <Segmented
          value={side}
          onChange={onSideChange}
          options={[
            { label: i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.pro"), value: 'pro' },
            { label: i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.con"), value: 'con' },
          ]}
        />

        <TextArea
          rows={4}
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          placeholder={
            replyTarget ? i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.writeAConciseReply") : i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.writeAConciseArgument")
          }
        />

        <Space>
          <Button type="primary" loading={loading} onClick={onSubmit}>
            {replyTarget ? i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.postReply") : i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.postArgument")}
          </Button>
          {replyTarget && <Button onClick={onClearReply}>{i18nT("ui.ethikos.deliberate.topic.argumentcomposercard.cancelReply")}</Button>}
        </Space>
      </Space>
    </Card>
  )
}
