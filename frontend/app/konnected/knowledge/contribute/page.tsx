// FILE: frontend/app/konnected/knowledge/contribute/page.tsx
// app/konnected/knowledge/contribute/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  InboxOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  Upload,
} from 'antd';
import type { UploadProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import React from 'react';

import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Paragraph, Title } = Typography;
const { TextArea } = Input;
const { Dragger } = Upload;

type KnowledgeLevel = 'beginner' | 'intermediate' | 'advanced';

interface ContributeFormValues {
  title: string;
  subject?: string;
  level?: KnowledgeLevel;
  language?: string;
  resourceType?: string;
  estimatedMinutes?: number;
  tags?: string[];
  description?: string;
  url?: string;
  isOfflineAvailable?: boolean;
  allowReuse?: boolean;
  audience?: string;
  notesForReviewers?: string;
  fileList?: UploadFile[];
}

const SUBJECT_OPTIONS = [
  'Sustainability',
  'Civic engagement',
  'STEM',
  'Arts & culture',
  'Ethics & philosophy',
  'Digital skills',
];

const LANGUAGE_OPTIONS = ['English', 'French', 'Spanish', 'Other'];

const RESOURCE_TYPES = [
  'Article',
  'Video',
  'Lesson plan',
  'Worksheet',
  'Quiz',
  'Dataset',
  'Other',
];

const TAG_SUGGESTIONS = [
  'youth',
  'teacher-ready',
  'intro',
  'advanced',
  'group-activity',
  'self-paced',
];

const uploadProps: UploadProps = {
  name: 'file',
  multiple: false,
  maxCount: 1,
  beforeUpload: () => false, // prevent auto-upload; handled by form submit
};

function normFile(event: unknown): UploadFile[] {
  if (Array.isArray(event)) {
    return event as UploadFile[];
  }

  if (
    typeof event === 'object' &&
    event !== null &&
    'fileList' in event &&
    Array.isArray((event as { fileList?: unknown }).fileList)
  ) {
    return (event as { fileList: UploadFile[] }).fileList;
  }

  return [];
}

export default function KonnectedKnowledgeContributePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<ContributeFormValues>();

  const handleSubmit = (values: ContributeFormValues) => {
    // Placeholder: will later call the KonnectED knowledge contribution API
    // For now we just log and show a success toast.
     
    console.log('KonnectED knowledge contribution (local only):', values);
    message.success(i18nT("ui.konnected.knowledge.contribute.yourContributionHasBeenSavedLocallyFor"));
  };

  const handleSaveDraft = () => {
    const values = form.getFieldsValue();
     
    console.log('Draft contribution (local only):', values);
    message.info(i18nT("ui.konnected.knowledge.contribute.draftSavedLocallyInThisSession"));
  };

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.knowledge.contribute.contributeKnowledge")}
      subtitle={i18nT("ui.konnected.knowledge.contribute.proposeNewLearningResourcesToEnrichThe")}
      primaryAction={
        <Button type="primary" onClick={() => form.submit()} icon={<PlusOutlined />}>
          {i18nT("ui.konnected.knowledge.contribute.submitForReview")}
        </Button>
      }
      secondaryActions={
        <Space>
          <Button onClick={handleSaveDraft}>{i18nT("ui.konnected.knowledge.contribute.saveDraft")}</Button>
          <Button onClick={() => form.resetFields()}>{i18nT("ui.konnected.knowledge.contribute.resetForm")}</Button>
        </Space>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <Form<ContributeFormValues>
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{
                language: 'English',
                level: 'beginner',
                isOfflineAvailable: false,
                allowReuse: true,
              }}
            >
              <Title level={4} style={{ marginBottom: 16 }}>
                {i18nT("ui.konnected.knowledge.contribute.resourceDetails")}
              </Title>

              <Form.Item
                label={i18nT("ui.konnected.knowledge.contribute.title")}
                name="title"
                rules={[
                  { required: true, message: i18nT("ui.konnected.knowledge.contribute.pleaseEnterATitleForTheResource") },
                ]}
                tooltip={{
                  title: i18nT("ui.konnected.knowledge.contribute.thisIsHowTheResourceWillAppear"),
                  icon: <InfoCircleOutlined />,
                }}
              >
                <Input placeholder={i18nT("ui.konnected.knowledge.contribute.exampleIntroductionToCommunityLedClimateAction")} />
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.subjectTheme")}
                    name="subject"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.konnected.knowledge.contribute.pleaseSelectTheMainSubject"),
                      },
                    ]}
                  >
                    <Select
                      placeholder={i18nT("ui.konnected.knowledge.contribute.chooseASubject")}
                      options={SUBJECT_OPTIONS.map((s) => ({ label: s, value: s }))}
                      allowClear
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.level")}
                    name="level"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.konnected.knowledge.contribute.pleaseChooseAnApproximateLevel"),
                      },
                    ]}
                  >
                    <Select<KnowledgeLevel>
                      placeholder={i18nT("ui.konnected.knowledge.contribute.selectLevel")}
                      options={[
                        { label: i18nT("ui.konnected.knowledge.contribute.beginner"), value: 'beginner' },
                        { label: i18nT("ui.konnected.knowledge.contribute.intermediate"), value: 'intermediate' },
                        { label: i18nT("ui.konnected.knowledge.contribute.advanced"), value: 'advanced' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item label={i18nT("ui.konnected.knowledge.contribute.language")} name="language">
                    <Select
                      placeholder={i18nT("ui.konnected.knowledge.contribute.selectLanguage")}
                      options={LANGUAGE_OPTIONS.map((l) => ({ label: l, value: l }))}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.resourceType")}
                    name="resourceType"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.konnected.knowledge.contribute.pleaseChooseAResourceType"),
                      },
                    ]}
                  >
                    <Select
                      placeholder={i18nT("ui.konnected.knowledge.contribute.articleVideoLesson")}
                      options={RESOURCE_TYPES.map((t) => ({ label: t, value: t }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.estimatedTimeMinutes")}
                    name="estimatedMinutes"
                    tooltip={i18nT("ui.konnected.knowledge.contribute.roughTimeALearnerNeedsToComplete")}
                  >
                    <InputNumber
                      min={5}
                      max={480}
                      style={{ width: '100%' }}
                      placeholder={i18nT("ui.konnected.knowledge.contribute.eG45")}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.audience")}
                    name="audience"
                    tooltip={i18nT("ui.konnected.knowledge.contribute.whoIsThisPrimarilyDesignedForE")}
                  >
                    <Input placeholder={i18nT("ui.konnected.knowledge.contribute.eGSecondaryStudentsYouthGroupsTeachers")} />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label={i18nT("ui.konnected.knowledge.contribute.shortDescription")}
                name="description"
                rules={[
                  {
                    required: true,
                    message: i18nT("ui.konnected.knowledge.contribute.pleaseProvideAShortDescription"),
                  },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder={i18nT("ui.konnected.knowledge.contribute.describeTheResourceWhatLearnersWillGain")}
                />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.konnected.knowledge.contribute.tags")}
                name="tags"
                tooltip={i18nT("ui.konnected.knowledge.contribute.addAFewTagsToHelpPeople")}
              >
                <Select
                  mode="tags"
                  placeholder={i18nT("ui.konnected.knowledge.contribute.addTagsPressEnterToConfirm")}
                  tokenSeparators={[',', ';']}
                >
                  {TAG_SUGGESTIONS.map((tag) => (
                    <Select.Option key={tag} value={tag}>
                      <Tag>{tag}</Tag>
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Divider />

              <Title level={4} style={{ marginBottom: 16 }}>
                {i18nT("ui.konnected.knowledge.contribute.accessFiles")}
              </Title>

              <Form.Item
                label={i18nT("ui.konnected.knowledge.contribute.onlineLinkOptional")}
                name="url"
                tooltip={i18nT("ui.konnected.knowledge.contribute.ifThisResourceLivesOnTheWeb")}
              >
                <Input placeholder="https://…" />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.konnected.knowledge.contribute.uploadFileOptional")}
                name="fileList"
                valuePropName="fileList"
                getValueFromEvent={normFile}
                tooltip={i18nT("ui.konnected.knowledge.contribute.uploadAPdfSlideDeckOrOther")}
              >
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">
                    {i18nT("ui.konnected.knowledge.contribute.clickOrDragFileToThisArea")}
                  </p>
                  <p className="ant-upload-hint">
                    {i18nT("ui.konnected.knowledge.contribute.singleFileOnlyForLargePackagesYou")}
                  </p>
                </Dragger>
              </Form.Item>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.availableOffline")}
                    name="isOfflineAvailable"
                    valuePropName="checked"
                    tooltip={i18nT("ui.konnected.knowledge.contribute.markThisIfTheResourceCanBe")}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.konnected.knowledge.contribute.allowReUseAndAdaptation")}
                    name="allowReuse"
                    valuePropName="checked"
                    tooltip={i18nT("ui.konnected.knowledge.contribute.ifEnabledEducatorsAreAllowedToAdapt")}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4} style={{ marginBottom: 16 }}>
                {i18nT("ui.konnected.knowledge.contribute.notesForReviewers")}
              </Title>

              <Form.Item
                label={i18nT("ui.konnected.knowledge.contribute.contextOrInstructionsOptional")}
                name="notesForReviewers"
                tooltip={i18nT("ui.konnected.knowledge.contribute.anythingReviewersShouldKnowAboutHowThis")}
              >
                <TextArea
                  rows={3}
                  placeholder={i18nT("ui.konnected.knowledge.contribute.addAnyContextCitationsOrInstructionsFor")}
                />
              </Form.Item>

              {/* Hidden submit button so shell primaryAction can trigger form.submit() */}
              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" htmlType="submit" style={{ display: 'none' }}>
                  {i18nT("ui.konnected.knowledge.contribute.submit")}
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Card title={i18nT("ui.konnected.knowledge.contribute.contributionGuidelines")}>
              <Alert
                type="info"
                showIcon
                message={i18nT("ui.konnected.knowledge.contribute.beforeYouSubmit")}
                description={
                  <div>
                    <Paragraph>
                      {i18nT("ui.konnected.knowledge.contribute.toKeepTheKonnectedLibraryHighQuality")}
                    </Paragraph>
                    <ul className="list-disc pl-5">
                      <li>{i18nT("ui.konnected.knowledge.contribute.useRespectfulInclusiveLanguageThroughout")}</li>
                      <li>
                        {i18nT("ui.konnected.knowledge.contribute.makeSureYouOwnTheRightsTo")}
                      </li>
                      <li>
                        {i18nT("ui.konnected.knowledge.contribute.citeYourSourcesClearlyInTheDescription")}
                      </li>
                      <li>
                        {i18nT("ui.konnected.knowledge.contribute.checkThatTheLevelSubjectAndEstimated")}
                      </li>
                    </ul>
                  </div>
                }
              />
            </Card>

            <Card title={i18nT("ui.konnected.knowledge.contribute.howReviewWorks")}>
              <Paragraph>
                {i18nT("ui.konnected.knowledge.contribute.onceYouSubmitYourResourceWillBe")}
              </Paragraph>
              <Paragraph>
                {i18nT("ui.konnected.knowledge.contribute.theyMay")}
              </Paragraph>
              <ul className="list-disc pl-5">
                <li>{i18nT("ui.konnected.knowledge.contribute.suggestEditsToTitleDescriptionOrTags")}</li>
                <li>{i18nT("ui.konnected.knowledge.contribute.groupItIntoAnExistingLearningPath")}</li>
                <li>{i18nT("ui.konnected.knowledge.contribute.flagIssuesAroundLicensingAccuracyOrInclusivity")}</li>
              </ul>
              <Paragraph type="secondary">
                {i18nT("ui.konnected.knowledge.contribute.youWillBeAbleToTrackThe")}
              </Paragraph>
            </Card>
          </Space>
        </Col>
      </Row>
    </KonnectedPageShell>
  );
}
