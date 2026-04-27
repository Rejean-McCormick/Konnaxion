'use client'

import { Button, Space, Tag } from 'antd'
import { ProCard } from '@ant-design/pro-components'

import ArgumentTree from '@/modules/ethikos/components/ArgumentTree'
import type { ArgumentTreeItem } from '@/modules/ethikos/components/ArgumentTree'

import { sideColor, sideLabel } from '../_lib/topicThreadUtils'

export default function ArgumentThreadCard({
  items,
  loading,
  selectedArgument,
  onSelect,
  onReply,
  onRefresh,
}: {
  items: ArgumentTreeItem[]
  loading: boolean
  selectedArgument: ArgumentTreeItem | null
  onSelect: (argument: ArgumentTreeItem) => void
  onReply: (argument: ArgumentTreeItem) => void
  onRefresh: () => void
}): JSX.Element {
  return (
    <ProCard
      title="Argument thread"
      extra={
        <Space>
          <Tag>{items.length} statements</Tag>
          {selectedArgument && <Tag color="blue">Selected: {selectedArgument.id}</Tag>}
          <Button onClick={onRefresh}>Refresh</Button>
        </Space>
      }
    >
      <ArgumentTree
        items={items}
        loading={loading}
        selectedId={selectedArgument?.id ?? null}
        onSelect={onSelect}
        onReply={onReply}
        renderActions={(argument) => (
          <Button
            size="small"
            type="link"
            onClick={(event) => {
              event.stopPropagation()
              onSelect(argument)
            }}
          >
            Inspect Korum data
          </Button>
        )}
        renderMeta={(argument) => (
          <Tag color={sideColor(argument.side)}>{sideLabel(argument.side)}</Tag>
        )}
      />
    </ProCard>
  )
}
