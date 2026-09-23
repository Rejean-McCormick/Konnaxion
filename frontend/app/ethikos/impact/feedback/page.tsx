'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  PageContainer,
  ProCard,
  ProForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import {
  App,
  Divider,
  Empty,
  Form,
  List,
  Rate,
  Space,
  Tag,
  Typography,
} from 'antd';
import React, { useCallback, useMemo } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import usePageTitle from '@/hooks/usePageTitle';
import {
  type FeedbackItem,
  fetchFeedback,
  submitFeedback,
} from '@/services/impact';

const { Paragraph, Text } = Typography;

type FeedbackResponse = {
  items: FeedbackItem[];
};

type FeedbackFormValues = {
  body: string;
  rating?: number;
};

function toFriendlyErrorMessage(i18nT: TranslateFunction, error: unknown): string {
  const rawMessage =
    error instanceof Error
      ? error.message
      : i18nT("ui.ethikos.impact.feedback.unableToSubmitFeedback");

  if (
    typeof rawMessage === 'string' &&
    rawMessage.includes('NEXT_PUBLIC_ETHIKOS_FEEDBACK_TOPIC_ID')
  ) {
    return i18nT("ui.ethikos.impact.feedback.feedbackChannelNotConfigured");
  }

  return rawMessage;
}

export default function FeedbackLoops(): JSX.Element {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.impact.feedback.impactFeedback"));

  const { message } = App.useApp();
  const [form] = Form.useForm<FeedbackFormValues>();

  const {
    data,
    loading,
    refresh,
  } = useRequest<FeedbackResponse, []>(fetchFeedback);

  const items = data?.items ?? [];

  const averageRating = useMemo(() => {
    const ratings = items
      .map((item) => item.rating)
      .filter(
        (rating): rating is number =>
          typeof rating === 'number' && !Number.isNaN(rating),
      );

    if (!ratings.length) return undefined;

    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return Number((total / ratings.length).toFixed(1));
  }, [items]);

  const feedbackExtra = useMemo(() => {
    if (!items.length) return null;

    return (
      <Space size="middle">
        <Tag>{items.length} {i18nT("ui.ethikos.impact.feedback.entries")}</Tag>

        {typeof averageRating === 'number' && (
          <Space size={4}>
            <Text type="secondary">{i18nT("ui.ethikos.impact.feedback.avgRating")}</Text>
            <Rate disabled allowHalf value={averageRating} />
            <Text type="secondary">{averageRating.toFixed(1)}/5</Text>
          </Space>
        )}
      </Space>
    );
  }, [averageRating, items.length, i18nT]);

  const handleFinish = useCallback(
    async (values: FeedbackFormValues): Promise<boolean> => {
      const trimmed = values.body?.trim();

      if (!trimmed) {
        message.warning(i18nT("ui.ethikos.impact.feedback.pleaseEnterYourFeedbackBeforeSubmitting"));
        return false;
      }

      try {
        await submitFeedback({
          body: trimmed,
          rating: values.rating || undefined,
        });

        form.resetFields();
        await refresh();
        message.success(i18nT("ui.ethikos.impact.feedback.thanksYourFeedbackHasBeenRecorded"));
        return true;
      } catch (error) {
        message.error(toFriendlyErrorMessage(i18nT, error));
        return false;
      }
    },
    [form, message, refresh, i18nT],
  );

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.impact.feedback.feedbackLoop")}
      sectionLabel={i18nT("ui.ethikos.impact.feedback.impact")}
      subtitle={i18nT("ui.ethikos.impact.feedback.shareHowEthikosWorksOrDoesnT")}
    >
      <PageContainer ghost loading={loading}>
        <ProCard title={i18nT("ui.ethikos.impact.feedback.shareYourFeedback")} ghost>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {i18nT("ui.ethikos.impact.feedback.thisChannelClosesTheFeedbackLoopFor")}
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
                      {i18nT("ui.ethikos.impact.feedback.feedbackBecomesAnAnonymisedArgumentInA")}
                    </Text>
                    <Space>{dom}</Space>
                  </Space>
                ),
              }}
            >
              <Form.Item
                label={i18nT("ui.ethikos.impact.feedback.overallExperience")}
                name="rating"
                valuePropName="value"
              >
                <Rate />
              </Form.Item>

              <ProFormTextArea
                name="body"
                label={i18nT("ui.ethikos.impact.feedback.yourFeedback")}
                placeholder={i18nT("ui.ethikos.impact.feedback.shareAConcreteStorySuggestionOrPain")}
                fieldProps={{ rows: 4, maxLength: 2000, showCount: true }}
                rules={[
                  {
                    required: true,
                    message: i18nT("ui.ethikos.impact.feedback.pleaseEnterYourFeedback"),
                  },
                  {
                    validator: async (_: unknown, value: string | undefined) => {
                      if (!value || value.trim().length > 0) return;
                      throw new Error(
                        'Please enter your feedback.',
                      );
                    },
                  },
                ]}
              />
            </ProForm>
          </Space>
        </ProCard>

        <ProCard
          title={i18nT("ui.ethikos.impact.feedback.communityFeedback")}
          ghost
          style={{ marginTop: 24 }}
          extra={feedbackExtra}
        >
          {items.length ? (
            <>
              <List
                itemLayout="vertical"
                dataSource={items}
                renderItem={(item) => (
                  <List.Item key={item.id}>
                    <List.Item.Meta
                      title={
                        <Space direction="horizontal" size="small">
                          {item.author && <Text strong>{item.author}</Text>}
                          {item.createdAt && (
                            <Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {item.createdAt}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <>
                          {typeof item.rating === 'number' && (
                            <div style={{ marginBottom: 4 }}>
                              <Rate disabled value={item.rating} />
                            </div>
                          )}
                          <Paragraph style={{ marginBottom: 0 }}>
                            {item.body}
                          </Paragraph>
                        </>
                      }
                    />
                  </List.Item>
                )}
              />

              <Divider style={{ marginTop: 16, marginBottom: 0 }} />

              <Text type="secondary">
                {i18nT("ui.ethikos.impact.feedback.olderFeedbackIsKeptAsPartOf")}
              </Text>
            </>
          ) : (
            <Empty description={i18nT("ui.ethikos.impact.feedback.noFeedbackYetBeTheFirstTo")} />
          )}
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}