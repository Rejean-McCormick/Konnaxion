'use client'

/**
 * Sculpture comments list and editor
 * Refactor: remove antd Comment, stop using .data on API calls
 */

import React, { useMemo, useState, useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import {
  Tooltip,
  List,
  Card,
  Dropdown,
  Modal,
  message as antdMessage,
  Button,
  Empty,
  Input,
  Avatar,
  Typography,
} from 'antd'
import type { MenuProps } from 'antd'
import { MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import Link from 'next/link'
import api from '../../../api'
import { normalizeError } from '../../../shared/errors'

const { confirm } = Modal
const { TextArea } = Input
const { Text } = Typography

type User = {
  userId: string
  name?: string
  nickname?: string
  picture?: string
}

export type SculptureCommentItem = {
  commentId: string
  user: User
  content: string
  createdTime: string | Date
}

type Props = {
  comments?: SculptureCommentItem[]
  deleteComment: (commentId: string) => void
  addComment: (comment: SculptureCommentItem) => void
  sculptureId: string
}

const displayName = (u: User) =>
  u.userId?.includes('auth0')
    ? u.nickname ?? u.name ?? 'Unknown user'
    : u.name ?? u.nickname ?? 'Unknown user'

const SculptureComment: React.FC<Props> = ({
  comments = [],
  deleteComment,
  addComment,
  sculptureId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [value, setValue] = useState('')

  const sortedComments = useMemo(
    () =>
      [...comments].sort(
        (a, b) =>
          new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime(),
      ),
    [comments],
  )

  const getMenuItems = useCallback(
    (commentId: string): MenuProps['items'] => [{ key: commentId, label: 'Delete comment' }],
    [],
  )

  const handleDelete: MenuProps['onClick'] = ({ key }) => {
    confirm({
      title: 'Delete this comment permanently?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: { style: { background: '#ff4d4f', borderColor: '#ff4d4f' } },
      async onOk() {
        try {
          await api.delete(`/comment/${String(key)}`)
          antdMessage.success('Deleted comment successfully!')
          deleteComment(String(key))
        } catch (error: unknown) {
          const { message } = normalizeError(error)
          antdMessage.error(message || 'Failed to delete the comment.')
        }
      },
    })
  }

  return (
    <Card title="Comments" bodyStyle={{ padding: '20px 24px 0px' }} bordered={false} style={{ marginTop: 12 }}>
      <List<SculptureCommentItem>
        itemLayout="horizontal"
        dataSource={sortedComments}
        className="comment-list"
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Comments" />,
        }}
        pagination={{ pageSize: 15, hideOnSinglePage: true }}
        renderItem={(x) => {
          const created = dayjs(x.createdTime)
          const name = displayName(x.user)
          return (
            <List.Item
              key={x.commentId}
              actions={[
                <Tooltip
                  key="time"
                  title={created.isValid() ? created.format('D MMMM YYYY, h:mm:ss a') : 'Invalid date'}
                >
                  <Text type="secondary">{created.isValid() ? created.fromNow() : '—'}</Text>
                </Tooltip>,
                <Dropdown
                  key="menu"
                  menu={{ items: getMenuItems(x.commentId), onClick: handleDelete }}
                  trigger={['click']}
                >
                  <Button type="text" size="small" aria-label="More actions" icon={<MoreOutlined />} />
                </Dropdown>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={42}
                    src={x.user.picture || '/static/avatar.png'}
                    alt={`${name} avatar`}
                  />
                }
                title={
                  <Link href={`/users/id/${x.user.userId}`} style={{ fontSize: 14, fontWeight: 500 }}>
                    {name}
                  </Link>
                }
                description={
                  <div style={{ fontSize: 14 }}>
                    {(x.content || '')
                      .trim()
                      .split('\n')
                      .map((line, idx) => (
                        <div key={`${x.commentId}-${idx}`}>{line}</div>
                      ))}
                  </div>
                }
              />
            </List.Item>
          )
        }}
      />

      {/* Editor */}
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Avatar size={42} src="/static/avatar.png" alt="Your avatar" />
        <div style={{ flex: 1 }}>
          <Editor
            value={value}
            setValue={setValue}
            submitting={submitting}
            setSubmitting={setSubmitting}
            sculptureId={sculptureId}
            addComment={addComment}
          />
        </div>
      </div>
    </Card>
  )
}

type EditorProps = {
  value: string
  setValue: React.Dispatch<React.SetStateAction<string>>
  setSubmitting: React.Dispatch<React.SetStateAction<boolean>>
  submitting: boolean
  sculptureId: string
  addComment: (comment: SculptureCommentItem) => void
}

const Editor: React.FC<EditorProps> = ({
  value,
  setValue,
  setSubmitting,
  submitting,
  sculptureId,
  addComment,
}) => {
  const post = async () => {
    if (value.trim() === '') return
    setSubmitting(true)
    try {
      const result = await api.post<SculptureCommentItem>('/comment', {
        sculptureId,
        content: value.trim(),
      })
      setValue('')
      addComment(result)
      antdMessage.success('Comment posted!')
    } catch (error: unknown) {
      const { message } = normalizeError(error)
      antdMessage.error(message || 'Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <TextArea
          autoSize={{ minRows: 2 }}
          onChange={(e) => setValue(e.target.value)}
          value={value}
          onPressEnter={(e) => {
            if (e.metaKey || e.ctrlKey) {
              e.preventDefault()
              void post()
            }
          }}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" htmlType="button" disabled={value.trim() === ''} loading={submitting} onClick={post}>
          Post
        </Button>
      </div>
    </>
  )
}

export default SculptureComment
