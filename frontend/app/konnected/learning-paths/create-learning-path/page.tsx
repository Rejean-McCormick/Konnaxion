// FILE: frontend/app/konnected/learning-paths/create-learning-path/page.tsx
"use client";

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  PageContainer,
  ProCard,
  ProDescriptions,
  ProFormDependency,
  ProFormInstance,
  ProFormList,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  StepsForm,
} from "@ant-design/pro-components";
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Input,
  message,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import React, { useCallback, useMemo, useRef, useState } from "react";
import type { Key } from "react";

import { apiFetch } from '@/api';
import KonnectedPageShell from "@/app/konnected/KonnectedPageShell";

const { Paragraph } = Typography;
const { Search } = Input;

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

type LearningPathStatus = "draft" | "published";

type LearningPathStepForm = {
  title: string;
  type: "lesson" | "quiz" | "assignment";
  objective?: string;
  resourceIds?: number[];
};

type LearningPathFormValues = {
  name: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  tags?: string[];
  steps?: LearningPathStepForm[];
};

type KnowledgeResource = {
  id: number;
  title: string;
  type: "article" | "video" | "lesson" | "quiz" | "dataset";
  author?: string | null;
  subject?: string | null;
  estimated_duration_minutes?: number | null;
};

type ResourceSearchParams = {
  q?: string;
  type?: KnowledgeResource["type"] | "all";
};

type ErrorResponse = {
  detail?: string;
};

type KnowledgeResourceListResponse =
  | KnowledgeResource[]
  | {
      results?: KnowledgeResource[];
    };

const buildUrl = (path: string) => {
  if (API_BASE) return `${API_BASE}${path}`;
  return path;
};

async function createLearningPath(
  values: LearningPathFormValues,
  status: LearningPathStatus
) {
  const response = await apiFetch(buildUrl("/api/konnected/learning-paths/"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: values.name,
      description: values.description,
      difficulty: values.difficulty,
      tags: values.tags ?? [],
      status,
      steps: (values.steps ?? []).map((step, index) => ({
        order: index + 1,
        title: step.title,
        type: step.type,
        objective: step.objective,
        resource_ids: step.resourceIds ?? [],
      })),
    }),
  });

  if (!response.ok) {
    let detail = "Failed to save learning path.";
    try {
      const data = (await response.json()) as ErrorResponse;
      if (typeof data.detail === "string") detail = data.detail;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(detail);
  }

  return response.json().catch(() => null);
}

async function fetchKnowledgeResources(
  params: ResourceSearchParams
): Promise<KnowledgeResource[]> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.type && params.type !== "all") search.set("type", params.type);

  const response = await apiFetch(
    buildUrl(`/api/knowledge/resources/${search.toString() ? `?${search}` : ""}`)
  );

  if (!response.ok) {
    throw new Error("Failed to load resources.");
  }

  const data = (await response.json()) as KnowledgeResourceListResponse;

  if (Array.isArray(data)) return data as KnowledgeResource[];
  if (Array.isArray(data.results)) return data.results as KnowledgeResource[];
  return [];
}

const CONTENT_TYPE_OPTIONS = (i18nT: TranslateFunction): {
  label: string;
  value: ResourceSearchParams["type"];
}[] => ([
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.allTypes"), value: "all" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.articles"), value: "article" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.videos"), value: "video" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.lessons"), value: "lesson" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.quizzes"), value: "quiz" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.datasets"), value: "dataset" },
]);

const difficultyOptions = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.beginner"), value: "Beginner" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.intermediate"), value: "Intermediate" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.advanced"), value: "Advanced" },
]);

const stepTypeOptions = (i18nT: TranslateFunction) => ([
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.lesson"), value: "lesson" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.quiz"), value: "quiz" },
  { label: i18nT("ui.konnected.learningPaths.createLearningPath.assignment"), value: "assignment" },
]);

const CreateLearningPathPage: React.FC = () => {
  const { t: i18nT } = useLanguage();
  const formRef = useRef<ProFormInstance<LearningPathFormValues>>();
  const [submitMode, setSubmitMode] = useState<LearningPathStatus>("draft");
  const [submitting, setSubmitting] = useState(false);

  const [resourceDrawerOpen, setResourceDrawerOpen] = useState(false);
  const [resourceDrawerStepIndex, setResourceDrawerStepIndex] = useState<number | null>(null);
  const [resourceSearchParams, setResourceSearchParams] =
    useState<ResourceSearchParams>({});
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resources, setResources] = useState<KnowledgeResource[]>([]);
  const [selectedResourceIds, setSelectedResourceIds] = useState<Key[]>([]);

  const openResourceDrawer = useCallback((stepIndex: number) => {
    setResourceDrawerStepIndex(stepIndex);

    const steps = formRef.current?.getFieldValue("steps") as
      | LearningPathStepForm[]
      | undefined;

    if (steps && steps[stepIndex]?.resourceIds?.length) {
      setSelectedResourceIds(steps[stepIndex].resourceIds as Key[]);
    } else {
      setSelectedResourceIds([]);
    }

    setResourcesLoading(true);
    fetchKnowledgeResources({})
      .then(setResources)
      .catch((err) => {
        message.error(err.message || i18nT("ui.konnected.learningPaths.createLearningPath.failedToLoadResources"));
        setResources([]);
      })
      .finally(() => setResourcesLoading(false));

    setResourceDrawerOpen(true);
  }, [i18nT]);

  const closeResourceDrawer = () => {
    setResourceDrawerOpen(false);
    setResourceDrawerStepIndex(null);
  };

  const handleResourceSearch = useCallback(
    (q?: string) => {
      const nextParams: ResourceSearchParams = {
        ...resourceSearchParams,
        q: q || undefined,
      };
      setResourceSearchParams(nextParams);

      setResourcesLoading(true);
      fetchKnowledgeResources(nextParams)
        .then(setResources)
        .catch((err) => {
          message.error(err.message || i18nT("ui.konnected.learningPaths.createLearningPath.failedToLoadResources"));
          setResources([]);
        })
        .finally(() => setResourcesLoading(false));
    },
    [resourceSearchParams, i18nT]
  );

  const handleResourceTypeChange = (type: ResourceSearchParams["type"]): void => {
    const nextParams: ResourceSearchParams = {
      ...resourceSearchParams,
      type,
    };
    setResourceSearchParams(nextParams);

    setResourcesLoading(true);
    fetchKnowledgeResources(nextParams)
      .then(setResources)
      .catch((err) => {
        message.error(err.message || i18nT("ui.konnected.learningPaths.createLearningPath.failedToLoadResources"));
        setResources([]);
      })
      .finally(() => setResourcesLoading(false));
  };

  const handleResourceDrawerOk = () => {
    if (resourceDrawerStepIndex == null) {
      closeResourceDrawer();
      return;
    }

    const currentSteps =
      (formRef.current?.getFieldValue("steps") as LearningPathStepForm[]) ?? [];

    const updatedSteps = currentSteps.map((step, index) =>
      index === resourceDrawerStepIndex
        ? { ...step, resourceIds: selectedResourceIds as number[] }
        : step
    );

    formRef.current?.setFieldsValue({ steps: updatedSteps });
    closeResourceDrawer();
  };

  const resourceColumns: ColumnsType<KnowledgeResource> = useMemo(
    () => [
      {
        title: i18nT("ui.konnected.learningPaths.createLearningPath.title"),
        dataIndex: "title",
        key: "title",
      },
      {
        title: i18nT("ui.konnected.learningPaths.createLearningPath.type"),
        dataIndex: "type",
        key: "type",
        render: (value) => <Tag>{value}</Tag>,
      },
      {
        title: i18nT("ui.konnected.learningPaths.createLearningPath.author"),
        dataIndex: "author",
        key: "author",
        render: (value) => value || "—",
      },
      {
        title: i18nT("ui.konnected.learningPaths.createLearningPath.subject"),
        dataIndex: "subject",
        key: "subject",
        render: (value) => value || "—",
      },
      {
        title: i18nT("ui.konnected.learningPaths.createLearningPath.estimatedTime"),
        dataIndex: "estimated_duration_minutes",
        key: "estimated_duration_minutes",
        render: (value) => (value ? `${value} min` : "—"),
      },
    ],
    [i18nT]
  );

  const handleFinish = async (values: LearningPathFormValues) => {
    if (submitMode === "published") {
      if (!values.steps || values.steps.length === 0) {
        message.error(i18nT("ui.konnected.learningPaths.createLearningPath.youMustAddAtLeastOneStep"));
        return false;
      }

      const missingResources = values.steps.some(
        (step) => !step.resourceIds || step.resourceIds.length === 0
      );
      if (missingResources) {
        message.error(
          i18nT("ui.konnected.learningPaths.createLearningPath.eachStepMustHaveAtLeastOne")
        );
        return false;
      }
    }

    setSubmitting(true);
    try {
      await createLearningPath(values, submitMode);
      message.success(
        submitMode === "published"
          ? i18nT("ui.konnected.learningPaths.createLearningPath.learningPathPublished")
          : i18nT("ui.konnected.learningPaths.createLearningPath.learningPathSavedAsDraft")
      );
      return true;
    } catch (error: unknown) {
      message.error(
        error instanceof Error ? error.message : i18nT("ui.konnected.learningPaths.createLearningPath.failedToSaveLearningPath"),
      );
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.learningPaths.createLearningPath.createLearningPath")}
      subtitle={i18nT("ui.konnected.learningPaths.createLearningPath.authorAStructuredSequenceOfResourcesThat")}
      primaryAction={null}
    >
      <PageContainer>
        <ProCard>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message={i18nT("ui.konnected.learningPaths.createLearningPath.useThisWizardToDefineMetadataSteps")}
          />

          <StepsForm<LearningPathFormValues>
            formRef={formRef}
            onFinish={handleFinish}
            submitter={{
              render: (props) => {
                const { onSubmit, onPre } = props;
                return [
                  <Button
                    key="pre"
                    onClick={() => {
                      onPre?.();
                    }}
                  >
                    {i18nT("ui.konnected.learningPaths.createLearningPath.previous")}
                  </Button>,
                  <Button
                    key="save-draft"
                    onClick={() => {
                      setSubmitMode("draft");
                      onSubmit?.();
                    }}
                    loading={submitting}
                  >
                    {i18nT("ui.konnected.learningPaths.createLearningPath.saveDraft")}
                  </Button>,
                  <Button
                    key="publish"
                    type="primary"
                    onClick={() => {
                      setSubmitMode("published");
                      onSubmit?.();
                    }}
                    loading={submitting}
                  >
                    {i18nT("ui.konnected.learningPaths.createLearningPath.publish")}
                  </Button>,
                ];
              },
            }}
          >
            <StepsForm.StepForm<LearningPathFormValues>
              name="basic"
              title={i18nT("ui.konnected.learningPaths.createLearningPath.basics")}
            >
              <ProFormText
                name="name"
                label={i18nT("ui.konnected.learningPaths.createLearningPath.pathName")}
                placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.eGWebFundamentalsForNewTeam")}
                rules={[
                  { required: true, message: i18nT("ui.konnected.learningPaths.createLearningPath.pleaseEnterAPathName") },
                  {
                    min: 4,
                    message: i18nT("ui.konnected.learningPaths.createLearningPath.nameShouldBeAtLeast4Characters"),
                  },
                ]}
              />
              <ProFormTextArea
                name="description"
                label={i18nT("ui.konnected.learningPaths.createLearningPath.description")}
                placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.describeWhoThisPathIsForAnd")}
                fieldProps={{ autoSize: { minRows: 3, maxRows: 6 } }}
                rules={[
                  {
                    required: true,
                    message: i18nT("ui.konnected.learningPaths.createLearningPath.pleaseEnterADescription"),
                  },
                  {
                    min: 20,
                    message: i18nT("ui.konnected.learningPaths.createLearningPath.descriptionShouldBeAtLeast20Characters"),
                  },
                ]}
              />
              <ProFormSelect
                name="difficulty"
                label={i18nT("ui.konnected.learningPaths.createLearningPath.difficulty")}
                options={difficultyOptions(i18nT)}
                placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.selectDifficultyLevel")}
                rules={[
                  { required: true, message: i18nT("ui.konnected.learningPaths.createLearningPath.pleaseSelectADifficulty") },
                ]}
              />
              <ProFormSelect
                name="tags"
                label={i18nT("ui.konnected.learningPaths.createLearningPath.tags")}
                mode="tags"
                placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.addTagsOptional")}
                fieldProps={{ tokenSeparators: [","] }}
              />
            </StepsForm.StepForm>

            <StepsForm.StepForm<LearningPathFormValues>
              name="steps"
              title={i18nT("ui.konnected.learningPaths.createLearningPath.steps")}
            >
              <ProFormList
                name="steps"
                label={i18nT("ui.konnected.learningPaths.createLearningPath.pathSteps")}
                creatorButtonProps={{
                  position: "bottom",
                  creatorButtonText: "Add step",
                }}
                rules={[
                  {
                    validator: async (_, value) => {
                      if (!value || value.length === 0) {
                        throw new Error(
                          "You must add at least one step to the path."
                        );
                      }
                    },
                  },
                ]}
              >
                {(field, index) => (
                  <ProCard
                    bordered
                    style={{ marginBottom: 8 }}
                    title={i18nT("ui.konnected.learningPaths.createLearningPath.step", { value1: index + 1 })}
                  >
                    <ProFormText
                      name={[field.name, "title"]}
                      label={i18nT("ui.konnected.learningPaths.createLearningPath.stepTitle")}
                      placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.eGIntroductionToHtmlCss")}
                      rules={[
                        {
                          required: true,
                          message: i18nT("ui.konnected.learningPaths.createLearningPath.pleaseEnterAStepTitle"),
                        },
                      ]}
                    />
                    <ProFormSelect
                      name={[field.name, "type"]}
                      label={i18nT("ui.konnected.learningPaths.createLearningPath.stepType")}
                      options={stepTypeOptions(i18nT)}
                      rules={[
                        {
                          required: true,
                          message: i18nT("ui.konnected.learningPaths.createLearningPath.pleaseSelectAStepType"),
                        },
                      ]}
                    />
                    <ProFormTextArea
                      name={[field.name, "objective"]}
                      label={i18nT("ui.konnected.learningPaths.createLearningPath.learningObjective")}
                      placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.whatShouldLearnersBeAbleToDo")}
                      fieldProps={{
                        autoSize: { minRows: 2, maxRows: 4 },
                      }}
                    />
                  </ProCard>
                )}
              </ProFormList>
            </StepsForm.StepForm>

            <StepsForm.StepForm<LearningPathFormValues>
              name="resources"
              title={i18nT("ui.konnected.learningPaths.createLearningPath.resources")}
            >
              <ProFormDependency name={["steps"]}>
                {({ steps }) => {
                  const stepList = (steps as LearningPathStepForm[]) ?? [];
                  if (!stepList.length) {
                    return (
                      <Alert
                        type="warning"
                        showIcon
                        message={i18nT("ui.konnected.learningPaths.createLearningPath.youNeedToCreateAtLeastOne")}
                      />
                    );
                  }

                  return (
                    <>
                      <Paragraph>
                        {i18nT("ui.konnected.learningPaths.createLearningPath.attachOneOrMoreLibraryResourcesTo")}
                      </Paragraph>

                      <Space direction="vertical" style={{ width: "100%" }}>
                        {stepList.map((step, index) => (
                          <ProCard
                            key={index}
                            bordered
                            title={i18nT("ui.konnected.learningPaths.createLearningPath.step_934d7a", { value1: index + 1, value2: step.title || "Untitled" })}
                            extra={
                              <Button
                                onClick={() => openResourceDrawer(index)}
                                size="small"
                              >
                                {i18nT("ui.konnected.learningPaths.createLearningPath.selectResources")}
                              </Button>
                            }
                          >
                            {step.resourceIds && step.resourceIds.length > 0 ? (
                              <Space wrap>
                                {step.resourceIds.map((id) => (
                                  <Tag key={id}>{i18nT("ui.konnected.learningPaths.createLearningPath.resource", { id: id })}</Tag>
                                ))}
                              </Space>
                            ) : (
                              <Paragraph type="secondary">
                                {i18nT("ui.konnected.learningPaths.createLearningPath.noResourcesAttachedYet")}
                              </Paragraph>
                            )}
                          </ProCard>
                        ))}
                      </Space>
                    </>
                  );
                }}
              </ProFormDependency>
            </StepsForm.StepForm>

            <StepsForm.StepForm<LearningPathFormValues>
              name="review"
              title={i18nT("ui.konnected.learningPaths.createLearningPath.reviewPublish")}
            >
              <ProFormDependency
                name={["name", "description", "difficulty", "tags", "steps"]}
              >
                {({ name, description, difficulty, tags, steps }) => {
                  const stepList = (steps as LearningPathStepForm[]) ?? [];

                  return (
                    <Space direction="vertical" style={{ width: "100%" }}>
                      <ProDescriptions
                        column={1}
                        title={i18nT("ui.konnected.learningPaths.createLearningPath.pathSummary")}
                        dataSource={{
                          name,
                          description,
                          difficulty,
                          tags,
                        }}
                      >
                        <ProDescriptions.Item label={i18nT("ui.konnected.learningPaths.createLearningPath.name")} dataIndex="name" />
                        <ProDescriptions.Item
                          label={i18nT("ui.konnected.learningPaths.createLearningPath.description")}
                          dataIndex="description"
                        />
                        <ProDescriptions.Item
                          label={i18nT("ui.konnected.learningPaths.createLearningPath.difficulty")}
                          dataIndex="difficulty"
                        />
                        <ProDescriptions.Item
                          label={i18nT("ui.konnected.learningPaths.createLearningPath.tags")}
                          dataIndex="tags"
                          render={(_, record) => {
                            const value = (record as {
                              tags?: string[];
                            }).tags;

                            return value && value.length ? (
                              <Space wrap>
                                {value.map((t) => (
                                  <Tag key={t}>{t}</Tag>
                                ))}
                              </Space>
                            ) : (
                              <span>—</span>
                            );
                          }}
                        />
                      </ProDescriptions>

                      <ProCard title={i18nT("ui.konnected.learningPaths.createLearningPath.steps")} bordered>
                        {stepList.length === 0 ? (
                          <Paragraph type="secondary">
                            {i18nT("ui.konnected.learningPaths.createLearningPath.noStepsDefinedYet")}
                          </Paragraph>
                        ) : (
                          <Space direction="vertical" style={{ width: "100%" }}>
                            {stepList.map((step, index) => (
                              <ProCard
                                key={index}
                                bordered
                                title={i18nT("ui.konnected.learningPaths.createLearningPath.step_934d7a", { value1: index + 1, value2: step.title || "Untitled" })}
                              >
                                <Paragraph>
                                  <strong>{i18nT("ui.konnected.learningPaths.createLearningPath.type_ee3fb1")}</strong> {step.type}
                                </Paragraph>
                                {step.objective && (
                                  <Paragraph>
                                    <strong>{i18nT("ui.konnected.learningPaths.createLearningPath.objective")}</strong> {step.objective}
                                  </Paragraph>
                                )}
                                <Paragraph>
                                  <strong>{i18nT("ui.konnected.learningPaths.createLearningPath.resources_90bdbc")}</strong>{" "}
                                  {step.resourceIds &&
                                  step.resourceIds.length > 0 ? (
                                    <Space wrap>
                                      {step.resourceIds.map((id) => (
                                        <Tag key={id}>{i18nT("ui.konnected.learningPaths.createLearningPath.resource", { id: id })}</Tag>
                                      ))}
                                    </Space>
                                  ) : (
                                    <span>{i18nT("ui.konnected.learningPaths.createLearningPath.none")}</span>
                                  )}
                                </Paragraph>
                              </ProCard>
                            ))}
                          </Space>
                        )}
                      </ProCard>

                      {submitMode === "published" && (
                        <Alert
                          type="warning"
                          showIcon
                          message={i18nT("ui.konnected.learningPaths.createLearningPath.publishingWillMakeThisPathVisibleTo")}
                        />
                      )}
                    </Space>
                  );
                }}
              </ProFormDependency>
            </StepsForm.StepForm>
          </StepsForm>
        </ProCard>
      </PageContainer>

      <Drawer
        title={i18nT("ui.konnected.learningPaths.createLearningPath.selectResources")}
        width={720}
        open={resourceDrawerOpen}
        onClose={closeResourceDrawer}
        destroyOnClose
        extra={
          <Space>
            <Button onClick={closeResourceDrawer}>{i18nT("ui.konnected.learningPaths.createLearningPath.cancel")}</Button>
            <Button type="primary" onClick={handleResourceDrawerOk}>
              {i18nT("ui.konnected.learningPaths.createLearningPath.attachSelected")}
            </Button>
          </Space>
        }
      >
        <Space style={{ marginBottom: 16 }} wrap>
          <Search
            placeholder={i18nT("ui.konnected.learningPaths.createLearningPath.searchResources")}
            allowClear
            onSearch={(value) => handleResourceSearch(value || undefined)}
            style={{ width: 260 }}
          />
          <Select
            style={{ width: 200 }}
            defaultValue="all"
            options={CONTENT_TYPE_OPTIONS(i18nT)}
            onChange={(value) =>
              handleResourceTypeChange(value as ResourceSearchParams["type"])
            }
          />
        </Space>

        {resourcesLoading ? (
          <Spin />
        ) : resources.length === 0 ? (
          <Empty description={i18nT("ui.konnected.learningPaths.createLearningPath.noResourcesFound")} />
        ) : (
          <Table<KnowledgeResource>
            rowKey="id"
            dataSource={resources}
            columns={resourceColumns}
            rowSelection={{
              selectedRowKeys: selectedResourceIds,
              onChange: (keys) => setSelectedResourceIds(keys),
            }}
            pagination={{ pageSize: 10 }}
          />
        )}
      </Drawer>
    </KonnectedPageShell>
  );
};

export default CreateLearningPathPage;