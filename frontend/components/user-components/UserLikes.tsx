'use client';

/**
 * Description: User likes list component
 * Author: Hieu Chu
 */

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Card, List, Tooltip, Empty, Avatar, Typography } from 'antd';
import Link from 'next/link';

dayjs.extend(relativeTime);

type LikeImage = { url: string; created?: string | Date };
type Sculpture = {
  name: string;
  images?: LikeImage[];
  accessionId?: string | number;
};

type UserLikeItem = {
  likedTime: string | Date;
  sculptureId?: string | number;
  sculpture: Sculpture;
};

interface UserLikesProps {
  likes: UserLikeItem[];
}

const UserLikes: React.FC<UserLikesProps> = ({ likes }) => {
  // ne pas muter les props; tri sur des copies
  const items = useMemo<UserLikeItem[]>(
    () =>
      [...(likes ?? [])]
        .sort(
          (a, b) =>
            new Date(b.likedTime).getTime() -
            new Date(a.likedTime).getTime(),
        )
        .map((x) => {
          const sortedImages = [...(x.sculpture.images ?? [])].sort(
            (a, b) =>
              new Date(a.created ?? 0).getTime() -
              new Date(b.created ?? 0).getTime(),
          );
          return {
            ...x,
            sculpture: { ...x.sculpture, images: sortedImages },
          };
        }),
    [likes],
  );

  return (
    <Card
      title="Likes"
      bodyStyle={{ padding: '20px 24px 0px' }}
      variant="borderless"
      style={{ marginTop: 12 }}
    >
      <List<UserLikeItem>
        itemLayout="horizontal"
        dataSource={items}
        className="comment-list"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No Likes"
            />
          ),
        }}
        renderItem={(x) => {
          const firstImageUrl =
            x.sculpture.images && x.sculpture.images.length > 0
              ? x.sculpture.images[0].url
              : '/static/no-image.png';
          const targetId = x.sculptureId ?? x.sculpture.accessionId;
          const when = dayjs(x.likedTime);

          return (
            <List.Item key={`${String(targetId)}-${String(x.likedTime)}`}>
              <List.Item.Meta
                avatar={
                  <Avatar
                    shape="square"
                    size={42}
                    src={firstImageUrl}
                    alt={x.sculpture.name}
                    style={{ objectFit: 'cover', borderRadius: 4 }}
                  />
                }
                title={
                  <Link href={`/sculptures/id/${String(targetId)}`}>
                    <Typography.Text
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: 'rgba(0, 0, 0, 0.65)',
                      }}
                    >
                      {x.sculpture.name}
                    </Typography.Text>
                  </Link>
                }
                description={
                  <Tooltip
                    title={when.format('D MMMM YYYY, h:mm:ss a')}
                  >
                    <Typography.Text
                      style={{
                        fontSize: 14,
                        color: 'rgba(0, 0, 0, 0.35)',
                      }}
                    >
                      {when.fromNow()}
                    </Typography.Text>
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

export default UserLikes;
