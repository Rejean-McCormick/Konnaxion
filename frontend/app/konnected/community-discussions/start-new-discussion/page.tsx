// FILE: frontend/app/konnected/community-discussions/start-new-discussion/page.tsx
﻿// C:\MyCode\Konnaxionv14\frontend\app\konnected\community-discussions\start-new-discussion\page.tsx
'use client';


import { useLanguage } from '@/context/LanguageContext';
import { InfoCircleOutlined, MessageOutlined, QuestionCircleOutlined, UploadOutlined } from '@ant-design/icons';
import {
  Alert,
  message as antdMessage,
  Button,
  Card,
  Col,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { FormProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { apiFetch } from '@/api';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

type ThreadType = 'question' | 'discussion';

type FormValues = {
  title: string;
  content?: string;
  category: string;
  threadType: ThreadType;
  tags?: string[];
  subscribeToReplies?: boolean;
  attachments?: UploadFile[];
};

type CreateBodies = {
  topic: {
    title: string;
    category: string;
  };
  initialPostContent?: string;
};

/**
 * Extracts a human-friendly error message from a DRF-style error response.
 */
async function extractBackendMessage(res: Response): Promise<string | undefined> {
  try {
    const data: unknown = await res.json();
    if (!data || typeof data !== 'object') return undefined;
    const payload = data as Record<string, unknown>;
    if (typeof payload.detail === 'string') return payload.detail;
    if (typeof payload.message === 'string') return payload.message;
    if (typeof payload.error === 'string') return payload.error;
  } catch {
    // ignore JSON parse errors
  }
  return undefined;
}

/**
 * Start New Discussion page for KonnectED → Community Discussions.
 * Creates a ForumTopic, then (optionally) an initial ForumPost
 * using the real backend endpoints /api/konnected/forum-topics/ and /api/konnected/forum-posts/.
 */
export default function StartNewDiscussionPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const buildBodies = (values: FormValues): CreateBodies => {
    const trimmedTitle = values.title.trim();
    const trimmedContent = values.content?.trim();

    return {
      topic: {
        title: trimmedTitle,
        category: values.category,
      },
      initialPostContent: trimmedContent || undefined,
    };
  };

  const onFinish: FormProps<FormValues>['onFinish'] = async (values) => {
    setSubmitting(true);
    try {
      const { topic, initialPostContent } = buildBodies(values);

      // 1) Create the forum topic (thread) itself.
      const topicRes = await apiFetch('/api/konnected/forum-topics/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(topic),
      });

      if (!topicRes.ok) {
        const backendMessage =
          (await extractBackendMessage(topicRes)) ?? i18nT("ui.konnected.communityDiscussions.startNewDiscussion.unableToCreateDiscussion");
        if (topicRes.status === 403) {
          antdMessage.error(
            backendMessage || i18nT("ui.konnected.communityDiscussions.startNewDiscussion.youDoNotHavePermissionToStart"),
          );
        } else if (topicRes.status === 429) {
          antdMessage.error(
            backendMessage ||
              i18nT("ui.konnected.communityDiscussions.startNewDiscussion.youHaveCreatedTooManyDiscussionsIn"),
          );
        } else {
          antdMessage.error(backendMessage);
        }
        return;
      }

      const createdTopic = (await topicRes.json()) as { id: number | string };

      // 2) Optionally create the initial post in the topic.
      if (initialPostContent) {
        const topicId = createdTopic?.id;
        if (topicId == null) {
          // Topic exists but we could not read its id – log and continue.
           
          console.warn('Created topic without id in response payload.', createdTopic);
        } else {
          const postBody = {
            topic: Number(topicId),
            content: initialPostContent,
          };

          const postRes = await apiFetch('/api/konnected/forum-posts/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(postBody),
          });

          if (!postRes.ok) {
            const backendMessage =
              (await extractBackendMessage(postRes)) ??
              i18nT("ui.konnected.communityDiscussions.startNewDiscussion.yourTopicWasCreatedButTheInitial");
            antdMessage.warning(backendMessage);
          }
        }
      }

      antdMessage.success(i18nT("ui.konnected.communityDiscussions.startNewDiscussion.discussionCreatedSuccessfully"));
      router.push('/konnected/community-discussions/active-threads');
    } catch (error) {
      // Network or unexpected error
       
      console.error('Error creating discussion', error);
      antdMessage.error(i18nT("ui.konnected.communityDiscussions.startNewDiscussion.somethingWentWrongWhileCreatingTheDiscussion"));
    } finally {
      setSubmitting(false);
    }
  };

  const onFinishFailed: FormProps<FormValues>['onFinishFailed'] = () => {
    antdMessage.error(i18nT("ui.konnected.communityDiscussions.startNewDiscussion.pleaseFixTheHighlightedFieldsAndTry"));
  };

  // Categories mapped to ForumTopic.category values. Adjust as needed.
  const CATEGORY_OPTIONS: { label: string; value: string }[] = [
    { label: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.math"), value: 'Math' },
    { label: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.science"), value: 'Science' },
    { label: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.general"), value: 'General' },
  ];

  const TAG_SUGGESTIONS = ['Exam prep', 'Project help', 'Tips & tricks', 'Resources', 'Mentoring'];

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.startANewDiscussion")}
      subtitle={
        <span>
          {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.shareAQuestionOrTopicWithThe")}
        </span>
      }
    >
      <Row gutter={[24, 24]}>
        {/* Main form column */}
        <Col xs={24} md={16}>
          <Card>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Alert
                type="info"
                showIcon
                icon={<InfoCircleOutlined />}
                message={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.reminderKeepItConstructiveAndOnTopic")}
                description={
                  <span>
                    {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.discussionsAreVisibleAcrossTeamsContentMay")}
                  </span>
                }
              />

              <Form<FormValues>
                form={form}
                layout="vertical"
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                initialValues={{
                  threadType: 'discussion',
                  subscribeToReplies: true,
                }}
              >
                {/* Title */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.title")}
                  name="title"
                  rules={[
                    { required: true, message: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.pleaseEnterATitle") },
                    { min: 10, message: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.theTitleShouldBeAtLeast10") },
                    { max: 150, message: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.theTitleShouldBeAtMost150") },
                    {
                      validator: (_, value) => {
                        if (typeof value === 'string' && !value.trim()) {
                          return Promise.reject(
                            new Error('The title cannot be empty or just spaces.'),
                          );
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input placeholder={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.eGHowDoWeMeasureImpact")} />
                </Form.Item>

                {/* Thread type */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.typeOfThread")}
                  name="threadType"
                  rules={[{ required: true, message: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.pleaseSelectTheTypeOfDiscussion") }]}
                >
                  <Radio.Group>
                    <Radio.Button value="question">
                      <Space>
                        <QuestionCircleOutlined />
                        <span>{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.questionQA")}</span>
                      </Space>
                    </Radio.Button>
                    <Radio.Button value="discussion">
                      <Space>
                        <MessageOutlined />
                        <span>{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.openDiscussion")}</span>
                      </Space>
                    </Radio.Button>
                  </Radio.Group>
                </Form.Item>

                {/* Category */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.categorySubjectArea")}
                  name="category"
                  rules={[{ required: true, message: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.pleaseSelectACategory") }]}
                >
                  <Select
                    placeholder={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.selectACategory")}
                    options={CATEGORY_OPTIONS}
                    allowClear
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>

                {/* Content */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.content")}
                  name="content"
                  rules={[
                    {
                      max: 5000,
                      message: i18nT("ui.konnected.communityDiscussions.startNewDiscussion.theContentIsTooLongMax5000"),
                    },
                  ]}
                  extra={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.contentHint")}
                >
                  <TextArea
                    rows={6}
                    placeholder={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.describeYourQuestionOrTopicYouCan")}
                    showCount
                    maxLength={5000}
                  />
                </Form.Item>

                {/* Tags */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.tags")}
                  name="tags"
                  tooltip={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.useTagsSoYourDiscussionCanBe")}
                >
                  <Select
                    mode="tags"
                    tokenSeparators={[',']}
                    placeholder={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.addTagsPressEnterToConfirm")}
                    options={TAG_SUGGESTIONS.map((t) => ({ label: t, value: t }))}
                  />
                </Form.Item>

                {/* Attachments */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.attachments")}
                  name="attachments"
                  valuePropName="fileList"
                  getValueFromEvent={(e: { fileList: UploadFile[] }) => e?.fileList}
                  extra={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.attachmentsHint")}
                >
                  <Upload.Dragger
                    multiple
                    beforeUpload={() => false} // prevent auto-upload; backend integration can be wired later
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
                  >
                    <p className="ant-upload-drag-icon">
                      <UploadOutlined />
                    </p>
                    <p className="ant-upload-text">{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.clickOrDragFilesToThisArea")}</p>
                    <p className="ant-upload-hint">
                      {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.filesWillBeIncludedWithYourInitial")}
                    </p>
                  </Upload.Dragger>
                </Form.Item>

                {/* Notification / subscription */}
                <Form.Item
                  label={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.notifyMeAboutReplies")}
                  name="subscribeToReplies"
                  valuePropName="checked"
                  tooltip={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.youWillReceiveNotificationsWhenSomeoneReplies")}
                >
                  <Switch />
                </Form.Item>

                {/* Submit button */}
                <Form.Item>
                  <Space>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                      {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.postDiscussion")}
                    </Button>
                    <Button
                      htmlType="button"
                      onClick={() =>
                        router.push('/konnected/community-discussions/active-threads')
                      }
                    >
                      {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.cancel")}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            </Space>
          </Card>
        </Col>

        {/* Right-hand guidance / meta column */}
        <Col xs={24} md={8}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card title={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.goodDiscussionPractices")}>
              <Space direction="vertical">
                <Text>
                  <Tag color="blue">{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.beSpecific")}</Tag> {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.clearlyDescribeTheContextCourseTeamProject")}
                </Text>
                <Text>
                  <Tag color="green">{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.showYourAttempt")}</Tag> {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.forQuestionsExplainWhatYouAlreadyTried")}
                </Text>
                <Text>
                  <Tag color="gold">{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.respectPrivacy")}</Tag> {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.avoidSharingSensitivePersonalOrInstitutionalData")}
                </Text>
                <Text>
                  <Tag color="purple">{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.useTags")}</Tag> {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.tagsHelpLinkTheDiscussionToKnowledge")}
                </Text>
              </Space>
            </Card>

            <Card title={i18nT("ui.konnected.communityDiscussions.startNewDiscussion.moderationAndVisibility")}>
              <Paragraph>
                {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.postsMayBeQueuedForModerationBased")}
              </Paragraph>
              <Paragraph>
                {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.ifModerationIsRequiredYouLlSee")}{' '}
                <Text strong>{i18nT("ui.konnected.communityDiscussions.startNewDiscussion.pendingReview")}</Text> {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.untilAModeratorApprovesIt")}
              </Paragraph>
              <Paragraph>
                {i18nT("ui.konnected.communityDiscussions.startNewDiscussion.youCanLaterEditYourPostClose")}
              </Paragraph>
            </Card>
          </Space>
        </Col>
      </Row>
    </KonnectedPageShell>
  );
}
