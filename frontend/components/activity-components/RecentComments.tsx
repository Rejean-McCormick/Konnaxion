'use client';

import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import {
  Card,
  List,
  Avatar,
  Typography,
  Dropdown,
  Modal,
  Tooltip,
  Space,
  Button,
  message as antdMessage,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  ExclamationCircleOutlined,
  EllipsisOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import api from '@/services/_request';
import { normalizeError } from '../../shared/errors';

dayjs.extend(relativeTime);

const { Text } = Typography;

export interface RecentCommentUser {
  userId: string;
  nickname?: string | null;
  name?: string | null;
  picture?: string | null;
}

export interface RecentCommentSculpture {
  accessionId: string | number;
  name: string;
}

export interface RecentCommentItem {
  commentId: string;
  content: string;
  createdTime: string; // ISO 8601
  user: RecentCommentUser;
  sculpture: RecentCommentSculpture;
}

export interface RecentCommentsProps {
  comments: RecentCommentItem[];
  deleteComment: (commentId: string) => void;
}

const RecentComments: React.FC<RecentCommentsProps> = ({
  comments,
  deleteComment,
}) => {
  // Avoid mutating props. Sort newest first.
  const items = useMemo<RecentCommentItem[]>(
    () =>
      [...comments].sort(
        (a, b) => Date.parse(b.createdTime) - Date.parse(a.createdTime),
      ),
    [comments],
  );

  const onMenuClick: MenuProps['onClick'] = ({ key }) => {
    Modal.confirm({
      title: 'Delete this comment permanently?',
      icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
      style: { top: 110 },
      maskClosable: true,
      okText: 'Confirm',
      okButtonProps: {
        style: { background: '#ff4d4f', borderColor: '#ff4d4f' },
      },
      onOk: async () => {
        try {
          await api.delete(`/comment/${String(key)}`);
          antdMessage.success('Deleted comment successfully!', 2);
          deleteComment(String(key));
        } catch (error) {
          const norm = normalizeError(error as unknown) as { message?: string };
          antdMessage.error(norm?.message || 'Failed to delete');
        }
      },
    });
  };

  return (
    <Card
      title="Recent Comments"
      bodyStyle={{ padding: '20px 24px 0px' }}
      bordered={false}
    >
      <List<RecentCommentItem>
        itemLayout="horizontal"
        dataSource={items}
        className="comment-list"
        pagination={{ pageSize: 15, hideOnSinglePage: true }}
        renderItem={(x) => {
          const name = x.user.userId.includes('auth0')
            ? x.user.nickname ?? x.user.name ?? 'User'
            : x.user.name ?? x.user.nickname ?? 'User';

          return (
            <List.Item
              key={x.commentId}
              actions={[
                <Dropdown
                  key="more"
                  trigger={['click']}
                  menu={{
                    items: [
                      {
                        key: x.commentId,
                        label: 'Delete comment',
                        icon: <DeleteOutlined />,
                      },
                    ],
                    onClick: onMenuClick,
                  }}
                >
                  <Button type="text" aria-label="More actions" icon={<EllipsisOutlined />} />
                </Dropdown>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar src={x.user.picture ?? undefined} alt={name}>
                    {!x.user.picture && name.charAt(0).toUpperCase()}
                  </Avatar>
                }
                title={
                  <Space size={8} wrap>
                    <Link href={`/users/id/${x.user.userId}`}>
                      <Text strong>{name}</Text>
                    </Link>
                    <Tooltip
                      title={dayjs(x.createdTime).format(
                        'D MMMM YYYY, h:mm:ss a',
                      )}
                    >
                      <Text type="secondary">{dayjs(x.createdTime).fromNow()} in</Text>
                    </Tooltip>
                    <Link href={`/sculptures/id/${x.sculpture.accessionId}`}>
                      <Text>{x.sculpture.name}</Text>
                    </Link>
                  </Space>
                }
                description={
                  <div style={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>
                    {x.content?.trim() ?? ''}
                  </div>
                }
              />
            </List.Item>
          );
        }}
      />
    </Card>
  );
};

export default RecentComments;
