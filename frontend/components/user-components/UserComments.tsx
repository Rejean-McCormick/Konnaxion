/**
 * Description: User comments list component
 * Author: Hieu Chu
 */

import moment from 'moment'
import {
  Tooltip,
  List,
  Comment,
  Card,
  Dropdown,
  message,
  Modal,
  Empty,
  Input
} from 'antd'
import type { MenuProps } from 'antd'
import { MoreOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

const { confirm } = Modal
const { TextArea } = Input

import Link from 'next/link'
import api from '@/services/_request'

const UserComments = ({ comments, deleteComment }) => {
  const handleDelete: MenuProps['onClick'] = e => {
    confirm({
      title: 'Delete this comment permanently?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: {
        style: {
          background: '#ff4d4f',
          borderColor: '#ff4d4f'
        }
      },
      onOk: async () => {
        try {
          await api.delete(`/comment/${e.key}`)
          message.success('Deleted comment successfully!', 2)
          deleteComment(e.key as string)
        } catch (error: any) {
          message.error(error.response?.data?.message || 'Error')
        }
      }
    })
  }

  const getMenuItems = (commentId: string): MenuProps['items'] => [
    { key: commentId, label: 'Delete comment' }
  ]

  comments.sort(
    (a, b) =>
      new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
  )

  const formattedComments = comments.map(x => ({
    author: (
      <span
        style={{
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(0, 0, 0, 0.65)'
        }}
      >
        {x.user.userId.includes('auth0') ? x.user.nickname : x.user.name}
      </span>
    ),
    avatar: (
      <img
        src={x.user.picture}
        style={{
          width: 42,
          height: 42,
          borderRadius: '50%',
          objectFit: 'cover'
        }}
      />
    ),
    content: (
      <div style={{ fontSize: 14 }}>
        {x.content
          .trim()
          .split('\n')
          .map((line, idx) => (
            <div key={idx}>{line}</div>
          ))}
      </div>
    ),
    datetime: (
      <div style={{ display: 'flex' }}>
        <div>
          <Tooltip title={moment(x.createdTime).format('D MMMM YYYY, h:mm:ss a')}>
            <span style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.35)' }}>
              {moment(x.createdTime).fromNow()} in{' '}
            </span>
          </Tooltip>
          <Link href={`/sculptures/id/${x.sculpture.accessionId}`}>
            <a style={{ fontSize: 14 }}>{x.sculpture.name}</a>
          </Link>
        </div>

        <div
          style={{
            fontSize: 14,
            color: 'rgba(0, 0, 0, 0.45)',
            marginLeft: 'auto'
          }}
        >
          <Dropdown
            menu={{ items: getMenuItems(x.commentId), onClick: handleDelete }}
            trigger={['click']}
          >
            <MoreOutlined />
          </Dropdown>
        </div>
      </div>
    )
  }))

  return (
    <Card
      title="Comments"
      bodyStyle={{ padding: '20px 24px 0px' }}
      bordered={false}
    >
      <List
        itemLayout="horizontal"
        dataSource={formattedComments}
        className="comment-list"
        locale={{
          emptyText: (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Comments" />
          )
        }}
        renderItem={item => (
          <li>
            <Comment
              author={item.author}
              avatar={item.avatar}
              content={item.content}
              datetime={item.datetime}
              className="comment"
            />
          </li>
        )}
        pagination={{ pageSize: 15, hideOnSinglePage: true }}
      />

      {/* quick reply editor */}
      <div style={{ padding: '16px 24px' }}>
        <TextArea disabled placeholder="Use admin screen to reply" />
      </div>
    </Card>
  )
}

export default UserComments
