/**
 * Description: Recent comments component
 * Author: Hieu Chu
 */

import moment from 'moment'
import { Tooltip, List, Card, Dropdown, message, Modal } from 'antd'
import { Comment } from '@ant-design/compatible'
import { ExclamationCircleOutlined, EllipsisOutlined } from '@ant-design/icons'

const { confirm } = Modal

import Link from 'next/link'
import api from '../../api'

const RecentComments = ({ comments, deleteComment }) => {
  const handleDelete = (e: { key: string }) => {
    console.log(e.key)
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
          deleteComment(e.key)
        } catch (error: any) {
          message.error(error?.response?.data?.message || 'Failed to delete')
        }
      }
    })
  }

  comments.sort(
    (a, b) =>
      new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime()
  )

  const formattedComments = comments.map(x => ({
    author: (
      <Link href={`/users/id/${x.user.userId}`}>
        <a
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'rgba(0, 0, 0, 0.65)'
          }}
        >
          {x.user.userId.includes('auth0') ? x.user.nickname : x.user.name}
        </a>
      </Link>
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
            trigger={['click']}
            menu={{
              items: [{ key: x.commentId, label: 'Delete comment' }],
              onClick: handleDelete
            }}
          >
            <EllipsisOutlined />
          </Dropdown>
        </div>
      </div>
    )
  }))

  return (
    <Card
      title="Recent Comments"
      bodyStyle={{ padding: '20px 24px 0px' }}
      bordered={false}
    >
      <List
        itemLayout="horizontal"
        dataSource={formattedComments}
        className="comment-list"
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
    </Card>
  )
}

export default RecentComments
