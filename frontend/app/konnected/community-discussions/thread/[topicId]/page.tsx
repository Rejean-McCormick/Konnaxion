// FILE: frontend/app/konnected/community-discussions/thread/[topicId]/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeftOutlined,
  MessageOutlined,
  ReloadOutlined,
  SendOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Empty,
  Input,
  List,
  Space,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd';
import { useParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import api from '@/services/_request';

const { Paragraph, Text } = Typography;
const { TextArea } = Input;

type ForumTopicApi = {
  id: number | string;
  title: string;
  category?: string | null;
  creator?: string | null;
  replies_count?: number;
  created_at: string;
  updated_at: string;
};

type ForumPostApi = {
  id: number | string;
  topic: number | string;
  author?: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function KonnectedThreadDetailPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const params = useParams<{ topicId: string }>();
  const router = useRouter();
  const topicId = String(params.topicId ?? '');

  const [topic, setTopic] = useState<ForumTopicApi | null>(null);
  const [posts, setPosts] = useState<ForumPostApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadThread = useCallback(async () => {
    if (!topicId) return;

    setLoading(true);
    setError(null);
    try {
      const [topicRow, postRows] = await Promise.all([
        api.get<ForumTopicApi>(`konnected/forum-topics/${topicId}/`),
        api.get<ForumPostApi[]>('konnected/forum-posts/', {
          params: { topic: topicId },
        }),
      ]);

      setTopic(topicRow);
      setPosts(postRows);
    } catch (loadError) {
      console.error('Failed to load KonnectED discussion thread', loadError);
      setError(i18nT("ui.konnected.communityDiscussions.thread.topicid.unableToLoadThisDiscussionThread"));
    } finally {
      setLoading(false);
    }
  }, [topicId, i18nT]);

  useEffect(() => {
    void loadThread();
  }, [loadThread]);

  const orderedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      ),
    [posts],
  );

  const submitReply = async () => {
    const content = reply.trim();
    if (!content) {
      message.warning(i18nT("ui.konnected.communityDiscussions.thread.topicid.writeAReplyBeforePosting"));
      return;
    }

    setSubmitting(true);
    try {
      const created = await api.post<ForumPostApi>('konnected/forum-posts/', {
        topic: Number(topicId),
        content,
      });
      setPosts((current) => [...current, created]);
      setReply('');
      message.success(i18nT("ui.konnected.communityDiscussions.thread.topicid.replyPosted"));
    } catch (postError) {
      console.error('Failed to post KonnectED reply', postError);
      message.error(i18nT("ui.konnected.communityDiscussions.thread.topicid.unableToPostTheReply"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KonnectedPageShell
      title={topic?.title ?? i18nT("ui.konnected.communityDiscussions.thread.topicid.discussionThread")}
      subtitle={i18nT("ui.konnected.communityDiscussions.thread.topicid.communityDiscussionBackedByTheKonnectedForum")}
      primaryAction={
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() =>
            router.push('/konnected/community-discussions/active-threads')
          }
        >
          {i18nT("ui.konnected.communityDiscussions.thread.topicid.activeThreads")}
        </Button>
      }
      secondaryActions={
        <Button
          icon={<ReloadOutlined />}
          onClick={() => void loadThread()}
          loading={loading}
        >
          {i18nT("ui.konnected.communityDiscussions.thread.topicid.reload")}
        </Button>
      }
    >
      {loading && !topic ? (
        <Card>
          <Space style={{ width: '100%', justifyContent: 'center' }}>
            <Spin />
            <Text>{i18nT("ui.konnected.communityDiscussions.thread.topicid.loadingDiscussion")}</Text>
          </Space>
        </Card>
      ) : error ? (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.konnected.communityDiscussions.thread.topicid.discussionUnavailable")}
          description={error}
          action={
            <Button size="small" onClick={() => void loadThread()}>
              {i18nT("ui.konnected.communityDiscussions.thread.topicid.retry")}
            </Button>
          }
        />
      ) : topic ? (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Card>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <Space wrap>
                {topic.category && <Tag color="blue">{topic.category}</Tag>}
                <Tag icon={<MessageOutlined />}>
                  {orderedPosts.length} {i18nT("ui.konnected.communityDiscussions.thread.topicid.post")}{orderedPosts.length === 1 ? '' : 's'}
                </Tag>
              </Space>
              <Text type="secondary">
                {i18nT("ui.konnected.communityDiscussions.thread.topicid.startedBy")} {topic.creator || i18nT("ui.konnected.communityDiscussions.thread.topicid.unknown")} ·{' '}
                {new Date(topic.created_at).toLocaleString()}
              </Text>
            </Space>
          </Card>

          <Card title={i18nT("ui.konnected.communityDiscussions.thread.topicid.posts")}>
            {orderedPosts.length === 0 ? (
              <Empty description={i18nT("ui.konnected.communityDiscussions.thread.topicid.noPostsYet")} />
            ) : (
              <List
                dataSource={orderedPosts}
                rowKey={(item) => String(item.id)}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{item.author?.charAt(0) ?? '?'}</Avatar>}
                      title={
                        <Space>
                          <Text strong>{item.author || i18nT("ui.konnected.communityDiscussions.thread.topicid.unknown")}</Text>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {new Date(item.created_at).toLocaleString()}
                          </Text>
                        </Space>
                      }
                      description={
                        <Paragraph style={{ whiteSpace: 'pre-wrap', marginBottom: 0 }}>
                          {item.content}
                        </Paragraph>
                      }
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>

          <Card title={i18nT("ui.konnected.communityDiscussions.thread.topicid.reply")}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <TextArea
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                rows={4}
                maxLength={5000}
                placeholder={i18nT("ui.konnected.communityDiscussions.thread.topicid.addAConstructiveReply")}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                loading={submitting}
                onClick={() => void submitReply()}
              >
                {i18nT("ui.konnected.communityDiscussions.thread.topicid.postReply")}
              </Button>
            </Space>
          </Card>
        </Space>
      ) : null}
    </KonnectedPageShell>
  );
}
