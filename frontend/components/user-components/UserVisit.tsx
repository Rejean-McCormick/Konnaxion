/**
 * Description: User visit list component
 * Author: Hieu Chu
 */

import type React from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Tooltip, List, Card, Empty } from 'antd';
import { Comment } from '@ant-design/compatible';
import Link from 'next/link';

dayjs.extend(relativeTime);

/** Types minimaux utilisés par ce composant */
type ImageItem = { url: string; created: string | Date };

export interface Visit {
  visitTime: string | Date;
  sculptureId: string | number;
  sculpture: {
    name: string;
    images: ImageItem[];
  };
}

type FormattedComment = {
  author: React.ReactNode;
  avatar: React.ReactNode;
  content: React.ReactNode;
};

const UserVisit: React.FC<{ visits: Visit[] }> = ({ visits }) => {
  // Ne pas muter la prop: on clone avant de trier
  const sorted: Visit[] = [...visits].sort(
    (a: Visit, b: Visit) =>
      new Date(b.visitTime).getTime() - new Date(a.visitTime).getTime()
  );

  // Trie les images de chaque sculpture par date de création ascendante
  sorted.forEach((x: Visit) => {
    x.sculpture.images.sort(
      (a: ImageItem, b: ImageItem) =>
        new Date(a.created).getTime() - new Date(b.created).getTime()
    );
  });

  const formattedComments: FormattedComment[] = sorted.map((x: Visit) => ({
    author: (
      <span>
        <Link href={`/sculptures/id/${x.sculptureId}`}>
          <a
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'rgba(0, 0, 0, 0.65)',
            }}
          >
            {x.sculpture.name}
          </a>
        </Link>
      </span>
    ),
    avatar: (
      <div>
        <img
          src={
            x.sculpture.images.length
              ? x.sculpture.images[0].url
              : '../../static/no-image.png'
          }
          style={{
            width: 42,
            height: 42,
            objectFit: 'cover',
            borderRadius: 4,
          }}
        />
      </div>
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
  }));

  return (
    <Card
      title="Visits"
      bodyStyle={{ padding: '20px 24px 0px' }}
      variant="borderless"
      style={{ marginTop: 12 }}
    >
      <List<FormattedComment>
        itemLayout="horizontal"
        dataSource={formattedComments ?? []}
        className="comment-list"
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No Visits"
            />
          ),
        }}
        renderItem={(item: FormattedComment) => (
          <li>
            <Comment
              author={item.author}
              avatar={item.avatar}
              content={item.content}
              className="comment"
            />
          </li>
        )}
        pagination={{ pageSize: 15, hideOnSinglePage: true }}
      />
    </Card>
  );
};

export default UserVisit;
