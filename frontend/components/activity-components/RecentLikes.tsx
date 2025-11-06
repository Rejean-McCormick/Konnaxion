// components/activity-components/RecentLikes.tsx
'use client';

import React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card, List, Tooltip, Avatar, Typography, Space } from 'antd';
import Link from 'next/link';

dayjs.extend(relativeTime);

const { Text } = Typography;

export interface RecentLike {
  likedTime: string | Date;
  user: {
    userId: string;          // used with .includes('auth0')
    nickname?: string;
    name?: string;
    picture?: string;
  };
  sculpture: {
    accessionId: string | number;
    name: string;
  };
}

export interface RecentLikesProps {
  likes: RecentLike[];
}

const RecentLikes: React.FC<RecentLikesProps> = ({ likes }) => {
  const sortedLikes: RecentLike[] = [...likes].sort(
    (a, b) =>
      new Date(b.likedTime).getTime() - new Date(a.likedTime).getTime()
  );

  return (
    <Card title="Recent Likes" bodyStyle={{ padding: '20px 24px 0px' }} bordered={false}>
      <List
        itemLayout="horizontal"
        dataSource={sortedLikes}
        renderItem={(x: RecentLike) => {
          const displayName =
            x.user.userId.includes('auth0')
              ? x.user.nickname ?? x.user.name ?? 'User'
              : x.user.name ?? x.user.nickname ?? 'User';

          return (
            <List.Item
              key={`${x.user.userId}-${x.sculpture.accessionId}-${String(x.likedTime)}`}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={x.user.picture}
                    size={42}
                    style={{ objectFit: 'cover' }}
                  >
                    {!x.user.picture && (displayName[0]?.toUpperCase() ?? '?')}
                  </Avatar>
                }
                title={
                  <Space size={4} wrap>
                    <Link href={`/users/id/${x.user.userId}`}>
                      <Text strong style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.65)' }}>
                        {displayName}
                      </Text>
                    </Link>
                    <Text style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.65)' }}>
                      liked
                    </Text>
                    <Link href={`/sculptures/id/${x.sculpture.accessionId}`}>
                      <Text style={{ fontSize: 14 }}>{x.sculpture.name}</Text>
                    </Link>
                  </Space>
                }
                description={
                  <Tooltip title={dayjs(x.likedTime).format('D MMMM YYYY, h:mm:ss a')}>
                    <Text style={{ fontSize: 14, color: 'rgba(0, 0, 0, 0.35)' }}>
                      {dayjs(x.likedTime).fromNow()}
                    </Text>
                  </Tooltip>
                }
              />
            </List.Item>
          );
        }}
        pagination={{ pageSize: 15, hideOnSinglePage: true }}
      />
    </Card>
  );
};

export default RecentLikes;
