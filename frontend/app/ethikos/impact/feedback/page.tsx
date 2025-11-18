'use client';

import { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Comment } from '@ant-design/compatible';
import {
  Button,
  Divider,
  Empty,
  Input,
  List,
  Rate,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchFeedback, submitFeedback, type FeedbackItem } from '@/services/impact';

const { Paragraph, Text } = Typography;

type FeedbackResponse = {
  items: FeedbackItem[];
};

export default function FeedbackLoops(): JSX.Element {
  usePageTitle('Impact · Feedback');

  const { data, loading, refresh } = useRequest<FeedbackResponse, []>(fetchFeedback);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState<number>(0);
  const [sending, setSending] = useState(false);

  const items = data?.items ?? [];

  const averageRating = useMemo(() => {
    const withRatings = items.filter(
      (f): f is FeedbackItem & { rating: number } =>
        typeof f.rating === 'number' && !Number.isNaN(f.rating),
    );
    if (!withRatings.length) return undefined;
    const total = withRatings.reduce((acc, f) => acc + f.rating, 0);
    return Number((total / withRatings.length).toFixed(1));
  }, [items]);

  const handleSubmit = async () => {
    const trimmed = feedback.trim();
    if (!trimmed) return;

    setSending(true);
    try {
      await submitFeedback({ body: trimmed, rating: stars || undefined });
      setFeedback('');
      setStars(0);
      await refresh();
      message.success('Thanks, your feedback has been recorded.');
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : 'Unable to submit feedback. Please try again.';
      const friendly =
        typeof rawMessage === 'string' &&
        rawMessage.includes('NEXT_PUBLIC_ETHIKOS_FEEDBACK_TOPIC_ID')
          ? 'The feedback channel is not configured yet. Please contact an administrator.'
          : rawMessage;
      message.error(friendly);
    } finally {
      setSending(false);
    }
  };

  return (
    <PageContainer ghost loading={loading}>
      <ProCard title="Share your feedback" ghost>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            This channel closes the feedback loop for the Ethikos module. Tell us what worked,
            what felt confusing, or what is missing. Please avoid sharing personal or sensitive
            data.
          </Paragraph>

          <div>
            <Text strong>Overall experience</Text>
            <div>
              <Rate onChange={setStars} value={stars} />
            </div>
          </div>

          <Input.TextArea
            rows={4}
            placeholder="Share a concrete story, suggestion or pain point…"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />

          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Text type="secondary">
              Feedback becomes an anonymised argument in a dedicated Ethikos topic.
            </Text>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={sending}
              disabled={!feedback.trim()}
            >
              Submit feedback
            </Button>
          </Space>
        </Space>
      </ProCard>

      <ProCard
        title="Community feedback"
        ghost
        style={{ marginTop: 24 }}
        extra={
          items.length ? (
            <Space size="middle">
              <Tag>{items.length} entries</Tag>
              {typeof averageRating === 'number' && (
                <Space size={4}>
                  <Text type="secondary">Avg. rating</Text>
                  <Rate disabled allowHalf value={averageRating} />
                  <Text type="secondary">{averageRating.toFixed(1)}/5</Text>
                </Space>
              )}
            </Space>
          ) : null
        }
      >
        {items.length ? (
          <>
            <List
              itemLayout="horizontal"
              dataSource={items}
              renderItem={(f) => (
                <li key={f.id}>
                  <Comment
                    author={f.author}
                    datetime={f.createdAt}
                    content={
                      <>
                        {typeof f.rating === 'number' && (
                          <div style={{ marginBottom: 4 }}>
                            <Rate disabled value={f.rating} />
                          </div>
                        )}
                        <Paragraph style={{ marginBottom: 0 }}>{f.body}</Paragraph>
                      </>
                    }
                  />
                </li>
              )}
            />
            <Divider style={{ marginTop: 16, marginBottom: 0 }} />
            <Text type="secondary">
              Older feedback is kept as part of the impact audit trail.
            </Text>
          </>
        ) : (
          <Empty description="No feedback yet. Be the first to share how Ethikos works for you." />
        )}
      </ProCard>
    </PageContainer>
  );
}
