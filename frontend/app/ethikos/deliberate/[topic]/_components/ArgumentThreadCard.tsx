'use client'

import { Button, Space, Tag, Tooltip, Typography } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import {
  BranchesOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

import ArgumentTree from '@/modules/ethikos/components/ArgumentTree'
import type { ArgumentTreeItem } from '@/modules/ethikos/components/ArgumentTree'

import { sideColor, sideLabel } from '../_lib/topicThreadUtils'

const { Text } = Typography

function selectedArgumentLabel(argument: ArgumentTreeItem | null): string {
  if (!argument) {
    return 'No argument selected'
  }

  const side = sideLabel(argument.side)
  const preview = argument.body?.trim()

  if (!preview) {
    return `${side} argument selected`
  }

  return `${side}: ${preview.slice(0, 48)}${preview.length > 48 ? '…' : ''}`
}

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
      title={
        <Space>
          <BranchesOutlined />
          <span>Arguments and replies</span>
        </Space>
      }
      extra={
        <Space wrap>
          <Tag>{items.length} statements</Tag>

          {selectedArgument ? (
            <Tooltip title={selectedArgumentLabel(selectedArgument)}>
              <Tag color="blue">Argument selected</Tag>
            </Tooltip>
          ) : (
            <Tag>Choose an argument</Tag>
          )}

          <Tooltip title="Refresh the argument thread">
            <Button icon={<ReloadOutlined />} onClick={onRefresh}>
              Refresh
            </Button>
          </Tooltip>
        </Space>
      }
    >
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Text type="secondary">
          Read the argument thread, select a statement to review its evidence and
          signals, or reply to continue the deliberation.
        </Text>

        <ArgumentTree
          items={items}
          loading={loading}
          selectedId={selectedArgument?.id ?? null}
          onSelect={onSelect}
          onReply={onReply}
          renderActions={(argument) => {
            const isSelected = selectedArgument?.id === argument.id

            return (
              <Button
                size="small"
                type={isSelected ? 'primary' : 'link'}
                icon={<InfoCircleOutlined />}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelect(argument)
                }}
              >
                {isSelected ? 'Viewing details' : 'View details'}
              </Button>
            )
          }}
          renderMeta={(argument) => (
            <Tag color={sideColor(argument.side)}>
              {sideLabel(argument.side)}
            </Tag>
          )}
        />
      </Space>
    </ProCard>
  )
}