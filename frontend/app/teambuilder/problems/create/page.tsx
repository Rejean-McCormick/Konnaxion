// frontend/app/teambuilder/problems/create/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowLeftOutlined,
  CheckOutlined,
  DeploymentUnitOutlined,
  ExclamationCircleOutlined,
  ProfileOutlined,
  SaveOutlined,
  ScheduleOutlined,
  TagsOutlined,
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
  Steps,
  Switch,
  Tag,
  TreeSelect,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';
import { teambuilderService } from '@/services/teambuilder';
import type { ICreateProblemRequest } from '@/services/teambuilder/types';

const { TextArea } = Input;
const { Paragraph, Text } = Typography;

type ProblemFormValues = {
  title: string;
  statement: string;
  context?: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  typicalModes: string[];
  taxonomyCodes: string[];
  requiredSkills: string[];
  minTeamSize?: number;
  maxTeamSize?: number;
  expectedDurationDays?: number;
  allowRehabMode: boolean;
  allowLearningMode: boolean;
};

const UNESCO_TREE_DATA = [
  {
    title: 'Natural sciences',
    value: 'ns',
    key: 'ns',
    children: [
      {
        title: 'Physics',
        value: 'ns.physics',
        key: 'ns.physics',
      },
      {
        title: 'Chemistry',
        value: 'ns.chemistry',
        key: 'ns.chemistry',
      },
      {
        title: 'Biology',
        value: 'ns.biology',
        key: 'ns.biology',
      },
    ],
  },
  {
    title: 'Engineering & technology',
    value: 'eng',
    key: 'eng',
    children: [
      {
        title: 'Computer science',
        value: 'eng.cs',
        key: 'eng.cs',
      },
      {
        title: 'Electrical engineering',
        value: 'eng.ee',
        key: 'eng.ee',
      },
    ],
  },
  {
    title: 'Medical & health sciences',
    value: 'med',
    key: 'med',
  },
  {
    title: 'Social sciences',
    value: 'soc',
    key: 'soc',
  },
];

const MODE_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.teambuilder.problems.create.eliteCritical"), value: 'ELITE_CRITICAL' },
  { label: i18nT("ui.teambuilder.problems.create.balanced"), value: 'BALANCED' },
  { label: i18nT("ui.teambuilder.problems.create.learningHeavy"), value: 'LEARNING' },
  { label: i18nT("ui.teambuilder.problems.create.averageOnly"), value: 'AVERAGE_ONLY' },
  { label: i18nT("ui.teambuilder.problems.create.rehabHighRisk"), value: 'REHAB_HIGH_RISK' },
]);

const RISK_OPTIONS = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.teambuilder.problems.create.low"), value: 'low' },
  { label: i18nT("ui.teambuilder.problems.create.medium"), value: 'medium' },
  { label: i18nT("ui.teambuilder.problems.create.high"), value: 'high' },
  { label: i18nT("ui.teambuilder.problems.create.critical"), value: 'critical' },
]);

export default function CreateProblemPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<ProblemFormValues>();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState<'draft' | 'publish' | null>(
    null,
  );

  const persistProblem = async (
    values: ProblemFormValues,
    submitMode: 'draft' | 'publish',
  ) => {
    const notes: string[] = [];

    if (values.context?.trim()) {
      notes.push(values.context.trim());
    }
    if (values.expectedDurationDays != null) {
      notes.push(`Expected duration: ${values.expectedDurationDays} day(s).`);
    }
    if (values.allowRehabMode) {
      notes.push('Rehab mode explicitly allowed.');
    }
    if (values.allowLearningMode) {
      notes.push('Learning mode explicitly allowed.');
    }

    const payload: ICreateProblemRequest = {
      name: values.title.trim(),
      description: values.statement.trim(),
      status: submitMode === 'publish' ? 'ACTIVE' : 'DRAFT',
      risk_level:
        values.riskLevel.toUpperCase() as ICreateProblemRequest['risk_level'],
      min_team_size: values.minTeamSize ?? null,
      max_team_size: values.maxTeamSize ?? null,
      unesco_codes: values.taxonomyCodes ?? [],
      categories: values.requiredSkills ?? [],
      recommended_modes: values.typicalModes ?? [],
      facilitator_notes: notes.join('\n'),
    };

    const created = await teambuilderService.createProblem(payload);
    const modeLabel = submitMode === 'publish' ? 'published' : i18nT("ui.teambuilder.problems.create.savedAsDraft");

    message.success(i18nT("ui.teambuilder.problems.create.problem", { modeLabel: modeLabel }));
    router.push(`/teambuilder/problems/${created.id}`);
  };

  const goNext = async () => {
    try {
      // Validate current step fields only
      let fieldsToValidate: (keyof ProblemFormValues)[] = [];
      if (currentStep === 0) {
        fieldsToValidate = ['title', 'statement', 'riskLevel', 'typicalModes'];
      } else if (currentStep === 1) {
        fieldsToValidate = ['taxonomyCodes', 'requiredSkills'];
      } else if (currentStep === 2) {
        fieldsToValidate = [
          'minTeamSize',
          'maxTeamSize',
          'expectedDurationDays',
        ];
      }

      if (fieldsToValidate.length > 0) {
        await form.validateFields(fieldsToValidate as string[]);
      }

      setCurrentStep((prev) => Math.min(prev + 1, 2));
    } catch {
      // validation error – do nothing
    }
  };

  const goPrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmitDraft = async () => {
    setSubmitting('draft');
    try {
      const values = await form.validateFields();
      await persistProblem(values, 'draft');
    } catch (error) {
      console.error('Failed to save TeamBuilder problem draft', error);
      message.error(i18nT("ui.teambuilder.problems.create.unableToSaveTheProblem"));
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitPublish = async () => {
    setSubmitting('publish');
    try {
      const values = await form.validateFields();
      await persistProblem(values, 'publish');
    } catch (error) {
      console.error('Failed to publish TeamBuilder problem', error);
      message.error(i18nT("ui.teambuilder.problems.create.unableToPublishTheProblem"));
    } finally {
      setSubmitting(null);
    }
  };

  const selectedTaxonomyCodes: string[] =
    Form.useWatch('taxonomyCodes', form) || [];

  const requiredSkills: string[] =
    Form.useWatch('requiredSkills', form) || [];

  const shellSubtitle = (
    <Paragraph type="secondary">
      {i18nT("ui.teambuilder.problems.create.defineAReusableProblemTemplateClearStatement")}
    </Paragraph>
  );

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.problems.create.createProblem")}
      subtitle={shellSubtitle}
      metaTitle={i18nT("ui.teambuilder.problems.create.teamBuilderProblemsCreate")}
      sectionLabel={i18nT("ui.teambuilder.problems.create.problems")}
      secondaryActions={
        <Button href="/teambuilder/problems" icon={<ArrowLeftOutlined />}>
          {i18nT("ui.teambuilder.problems.create.backToProblemLibrary")}
        </Button>
      }
      maxWidth={960}
    >
      <Card>
        <Steps
          current={currentStep}
          style={{ marginBottom: 24 }}
          items={[
            {
              title: i18nT("ui.teambuilder.problems.create.basics"),
              icon: <ProfileOutlined />,
            },
            {
              title: i18nT("ui.teambuilder.problems.create.taxonomySkills"),
              icon: <TagsOutlined />,
            },
            {
              title: i18nT("ui.teambuilder.problems.create.constraints"),
              icon: <DeploymentUnitOutlined />,
            },
          ]}
        />

        <Form<ProblemFormValues>
          layout="vertical"
          form={form}
          onFinish={(values) => void persistProblem(values, 'draft')}
          initialValues={{
            riskLevel: 'medium',
            typicalModes: ['BALANCED', 'LEARNING'],
            taxonomyCodes: [],
            requiredSkills: [],
            minTeamSize: 3,
            maxTeamSize: 7,
            expectedDurationDays: 10,
            allowRehabMode: false,
            allowLearningMode: true,
          }}
        >
          {/* Step content */}
          {currentStep === 0 && (
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Alert
                type="info"
                showIcon
                message={i18nT("ui.teambuilder.problems.create.tipMakeTheProblemClearAndTestable")}
                description={
                  <span>
                    {i18nT("ui.teambuilder.problems.create.stateTheOutcomeYouWantTheConstraints")}
                  </span>
                }
              />

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.problemTitle")}
                    name="title"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.teambuilder.problems.create.pleaseEnterATitle"),
                      },
                    ]}
                  >
                    <Input placeholder={i18nT("ui.teambuilder.problems.create.eGCrossFunctionalTeamForClimate")} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.problemStatement")}
                    name="statement"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.teambuilder.problems.create.pleaseDescribeTheProblem"),
                      },
                    ]}
                  >
                    <TextArea
                      rows={4}
                      placeholder={i18nT("ui.teambuilder.problems.create.describeTheCoreChallengeKeyConstraintsAnd")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.contextBackgroundOptional")}
                    name="context"
                  >
                    <TextArea
                      rows={3}
                      placeholder={i18nT("ui.teambuilder.problems.create.addAnyBackgroundInformationStakeholdersOrPrevious")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.riskUrgencyLevel")}
                    name="riskLevel"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.teambuilder.problems.create.pleaseSelectARiskUrgencyLevel"),
                      },
                    ]}
                  >
                    <Select
                      options={RISK_OPTIONS(i18nT)}
                      placeholder={i18nT("ui.teambuilder.problems.create.chooseRiskLevel")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.typicalTeamModesForThisProblem")}
                    name="typicalModes"
                    rules={[
                      {
                        required: true,
                        message: i18nT("ui.teambuilder.problems.create.pleaseSelectAtLeastOneMode"),
                      },
                    ]}
                  >
                    <Select
                      mode="multiple"
                      options={MODE_OPTIONS(i18nT)}
                      placeholder={i18nT("ui.teambuilder.problems.create.eGEliteLearningHeavy")}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          )}

          {currentStep === 1 && (
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Alert
                type="info"
                showIcon
                message={i18nT("ui.teambuilder.problems.create.unescoTaxonomySkills")}
                description={
                  <span>
                    {i18nT("ui.teambuilder.problems.create.useTheUnescoTaxonomyToAnchorThis")}
                  </span>
                }
              />

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.unescoTaxonomyClassification")}
                    name="taxonomyCodes"
                  >
                    <TreeSelect
                      treeData={UNESCO_TREE_DATA}
                      treeCheckable
                      showCheckedStrategy={TreeSelect.SHOW_PARENT}
                      placeholder={i18nT("ui.teambuilder.problems.create.selectOneOrMoreTaxonomyCodes")}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </Form.Item>
                </Col>
              </Row>

              {selectedTaxonomyCodes.length > 0 && (
                <Row>
                  <Col span={24}>
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: '100%' }}
                    >
                      <Text type="secondary">
                        {i18nT("ui.teambuilder.problems.create.selectedTaxonomyCodes")}
                      </Text>
                      <Space wrap>
                        {selectedTaxonomyCodes.map((code) => (
                          <Tag key={code}>{code}</Tag>
                        ))}
                      </Space>
                    </Space>
                  </Col>
                </Row>
              )}

              <Divider />

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.requiredSkillsRoles")}
                    name="requiredSkills"
                    tooltip={i18nT("ui.teambuilder.problems.create.youCanTypeFreeTextTagsE")}
                    rules={[
                      {
                        required: true,
                        message:
                          i18nT("ui.teambuilder.problems.create.pleaseSpecifyAtLeastOneSkillOr"),
                      },
                    ]}
                  >
                    <Select
                      mode="tags"
                      placeholder={i18nT("ui.teambuilder.problems.create.typeAndPressEnterToAddTags")}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {requiredSkills.length > 0 && (
                <Row>
                  <Col span={24}>
                    <Space
                      direction="vertical"
                      size={4}
                      style={{ width: '100%' }}
                    >
                      <Text type="secondary">
                        {i18nT("ui.teambuilder.problems.create.skillsRolesYouEntered")}
                      </Text>
                      <Space wrap>
                        {requiredSkills.map((skill) => (
                          <Tag color="blue" key={skill}>
                            {skill}
                          </Tag>
                        ))}
                      </Space>
                    </Space>
                  </Col>
                </Row>
              )}
            </Space>
          )}

          {currentStep === 2 && (
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              <Alert
                type="warning"
                showIcon
                message={i18nT("ui.teambuilder.problems.create.constraintsSafety")}
                description={
                  <span>
                    {i18nT("ui.teambuilder.problems.create.theseConstraintsKeepTeamsRealisticAndSafe")}
                  </span>
                }
                icon={<ExclamationCircleOutlined />}
              />

              <Row gutter={16}>
                <Col xs={24} md={8}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.minimumTeamSize")}
                    name="minTeamSize"
                    rules={[
                      {
                        type: 'number',
                        min: 1,
                        message: i18nT("ui.teambuilder.problems.create.minimumTeamSizeMustBeAtLeast"),
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder={i18nT("ui.teambuilder.problems.create.eG3")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.maximumTeamSize")}
                    name="maxTeamSize"
                    rules={[
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          const min = getFieldValue('minTeamSize');
                          if (
                            value == null ||
                            min == null ||
                            value >= min
                          ) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error(
                              'Max team size must be greater than or equal to min team size',
                            ),
                          );
                        },
                      }),
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder={i18nT("ui.teambuilder.problems.create.eG7")}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={8}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.expectedDurationDays")}
                    name="expectedDurationDays"
                    tooltip={i18nT("ui.teambuilder.problems.create.approximateDurationOfTheProjectOrSprint")}
                    rules={[
                      {
                        type: 'number',
                        min: 1,
                        message:
                          i18nT("ui.teambuilder.problems.create.durationShouldBeAtLeast1Day"),
                      },
                    ]}
                  >
                    <InputNumber
                      min={1}
                      style={{ width: '100%' }}
                      placeholder={i18nT("ui.teambuilder.problems.create.eG10")}
                      addonAfter={<ScheduleOutlined />}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Row gutter={16}>
                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.allowRehabHighRiskTeamsForThis")}
                    name="allowRehabMode"
                    valuePropName="checked"
                    tooltip={i18nT("ui.teambuilder.problems.create.ifEnabledTheEngineMayCreateRehab")}
                  >
                    <Switch />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.problems.create.allowLearningHeavyTeamsForThisProblem")}
                    name="allowLearningMode"
                    valuePropName="checked"
                    tooltip={i18nT("ui.teambuilder.problems.create.ifEnabledTheEngineCanFavorLearning")}
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Space>
          )}

          <Divider />

          {/* Step navigation + submit actions */}
          <Space
            style={{ width: '100%', justifyContent: 'space-between' }}
            wrap
          >
            <Space>
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={goPrev}
                disabled={currentStep === 0}
              >
                {i18nT("ui.teambuilder.problems.create.previous")}
              </Button>
              <Button
                type="primary"
                onClick={goNext}
                disabled={currentStep === 2}
              >
                {i18nT("ui.teambuilder.problems.create.next")}
              </Button>
            </Space>

            <Space wrap>
              <Button
                onClick={handleSubmitDraft}
                icon={<SaveOutlined />}
                loading={submitting === 'draft'}
              >
                {i18nT("ui.teambuilder.problems.create.saveDraft")}
              </Button>
              <Button
                type="primary"
                onClick={handleSubmitPublish}
                icon={<CheckOutlined />}
                loading={submitting === 'publish'}
              >
                {i18nT("ui.teambuilder.problems.create.publishProblem")}
              </Button>
            </Space>
          </Space>

          {/* Hidden submit button for form API completeness */}
          <Form.Item style={{ display: 'none' }}>
            <Button htmlType="submit" />
          </Form.Item>
        </Form>
      </Card>
    </TeamBuilderPageShell>
  );
}
