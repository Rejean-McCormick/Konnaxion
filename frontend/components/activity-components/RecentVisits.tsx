/**
 * Description: Recent visits component
 * Author: Hieu Chu
 */

import dayjs from 'dayjs'
import { Tooltip, List, Card } from 'antd'
import { Comment } from '@ant-design/compatible'
import Link from 'next/link'

type VisitItem = {
  visitTime: string | Date
  user: {
    userId: string
    nickname?: string
    name?: string
    picture: string
  }
  sculpture: {
    accessionId: string
    name: string
  }
}

type RecentVisitsProps = {
  visits: VisitItem[]
}

const RecentVisits = ({ visits }: RecentVisitsProps) => {
  const sorted = [...visits].sort(
    (a, b) => new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime()
  )

  const formattedComments = sorted.map(x => ({
    key: `${x.user.userId}-${x.visitTime}-${x.sculpture.accessionId}`,
    author: (
      <Link
        href={`/users/id/${x.user.userId}`}
        style={{ fontSize: 14, fontWeight: 500, color: 'rgba(0, 0, 0, 0.65)' }}
      >
        {x.user.userId.includes('auth0') ? x.user.nickname : x.user.name}
      </Link>
    ),
    avatar: (
      <img
        src={x.user.picture}
        alt=""
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
        <Tooltip title={dayjs(x.visitTime).format('D MMMM YYYY, h:mm:ss a')}>
          <span style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.35)' }}>
            {dayjs(x.visitTime).fromNow()}
          </span>
        </Tooltip>
      </div>
    ),
    datetime: (
      <div>
        <span style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.35)' }}>
          visited{' '}
        </span>
        <Link
          href={`/sculptures/id/${x.sculpture.accessionId}`}
          style={{ fontSize: 14 }}
        >
          {x.sculpture.name}
        </Link>
      </div>
    )
  }))

  return (
    <Card
      title="Recent Visits"
      bodyStyle={{ padding: '20px 24px 0px' }}
      variant="borderless"
      style={{ marginTop: 12 }}
    >
      <List
        itemLayout="horizontal"
        dataSource={formattedComments}
        className="comment-list"
        renderItem={item => (
          <li key={item.key}>
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

export default RecentVisits
