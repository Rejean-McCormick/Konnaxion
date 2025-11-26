'use client';

import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import {
  Divider,
  Empty,
  Form,
  List,
  Rate,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';

import EthikosPageShell from '../../EthikosPageShell';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchFeedback, submitFeedback, type FeedbackItem } from '@/services/impact';

const { Paragraph, Text } = Typography;

type FeedbackResponse = {
  items: FeedbackItem[];
};

type FeedbackFormValues = {
  body: string;
  rating?: number;
};

export default function FeedbackLoops(): JSX.Element {
  usePageTitle('Impact · Feedback');

  const [form] = Form.useForm<FeedbackFormValues>();

  const { data, loading, refresh } = useRequest<FeedbackResponse, []>(fetchFeedback);

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

  const handleFinish = async (values: FeedbackFormValues): Promise<boolean> => {
    const trimmed = values.body?.trim();
    if (!trimmed) {
      message.warning('Please enter your feedback before submitting.');
      return false;
    }

    try {
      await submitFeedback({ body: trimmed, rating: values.rating || undefined });
      form.resetFields();
      await refresh();
      message.success('Thanks, your feedback has been recorded.');
      return true;
    } catch (err) {
      const rawMessage =
        err instanceof Error ? err.message : 'Unable to submit feedback. Please try again.';
      const friendly =
        typeof rawMessage === 'string' &&
        rawMessage.includes('NEXT_PUBLIC_ETHIKOS_FEEDBACK_TOPIC_ID')
          ? 'The feedback channel is not configured yet. Please contact an administrator.'
          : rawMessage;
      message.error(friendly);
      return false;
    }
  };

  return (
    <EthikosPageShell
      title="Feedback loop"
      sectionLabel="Impact"
      subtitle="Share how Ethikos works (or doesn’t) for you. Feedback is stored as anonymised arguments on a dedicated topic."
    >
      <PageContainer ghost loading={loading}>
        <ProCard title="Share your feedback" ghost>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              This channel closes the feedback loop for the Ethikos module. Tell us what worked,
              what felt confusing, or what is missing. Please avoid sharing personal or sensitive
              data.
            </Paragraph>

            <ProForm<FeedbackFormValues>
              form={form}
              layout="vertical"
              onFinish={handleFinish}
              submitter={{
                searchConfig: {
                  submitText: 'Submit feedback',
                },
                render: (_props, dom) => (
                  <Space
                    style={{
                      width: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text type="secondary">
                      Feedback becomes an anonymised argument in a dedicated Ethikos topic.
                    </Text>
                    <Space>{dom}</Space>
                  </Space>
                ),
              }}
            >
              <Form.Item label="Overall experience" name="rating" valuePropName="value">
                <Rate />
              </Form.Item>

              <ProFormTextArea
                name="body"
                label="Your feedback"
                placeholder="Share a concrete story, suggestion or pain point…"
                fieldProps={{ rows: 4 }}
                rules={[
                  {
                    required: true,
                    message: 'Please enter your feedback.',
                  },
                ]}
              />
            </ProForm>
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
                itemLayout="vertical"
                dataSource={items}
                renderItem={(f) => (
                  <List.Item key={f.id}>
                    <List.Item.Meta
                      title={
                        <Space direction="horizontal" size="small">
                          {f.author && <Text strong>{f.author}</Text>}
                          {f.createdAt && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {f.createdAt}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
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
                  </List.Item>
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
    </EthikosPageShell>
  );
}
