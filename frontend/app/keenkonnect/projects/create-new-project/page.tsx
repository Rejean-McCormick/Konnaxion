// FILE: frontend/app/keenkonnect/projects/create-new-project/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ProFormDatePicker,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
  StepsForm,
} from '@ant-design/pro-components';
import { Card, Col, message, Row, Typography } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import { useRouter } from 'next/navigation';
import React, { Suspense, useState } from 'react';

import { apiPost } from '@/api';
import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

const { Paragraph } = Typography;

// Backend route: /api/keenkonnect/projects/
const PROJECTS_ENDPOINT = 'keenkonnect/projects/';

type CreateProjectFormValues = {
  name: string;
  description?: string;
  category?: string;
  team?: string;
  startDate?: unknown;
  endDate?: unknown;
  attachments?: UploadFile[];
  notes?: string;
};

export default function CreateNewProjectPage() {
  const { t: i18nT } = useLanguage();
  return (
    <KeenPageShell
      title={i18nT("ui.keenkonnect.projects.createNewProject.createNewProject")}
      description={i18nT("ui.keenkonnect.projects.createNewProject.useThisGuidedWizardToDescribeYour")}
    >
      <Suspense fallback={null}>
        <Content />
      </Suspense>
    </KeenPageShell>
  );
}

function Content() {
  const { t: i18nT } = useLanguage();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleFinish = async (values: CreateProjectFormValues) => {
    try {
      setSubmitting(true);

      // Minimal payload aligned with Django ProjectSerializer
      const payload = {
        title: values.name,
        description: values.description ?? '',
        category: values.category ?? 'Uncategorized',
        status: 'idea' as const,
      };

      await apiPost(PROJECTS_ENDPOINT, payload);

      message.success(i18nT("ui.keenkonnect.projects.createNewProject.projectCreatedSuccessfully"));
      router.push('/keenkonnect/projects/my-projects');
      return true;
    } catch (err) {
       
      console.error('Create project error:', err);
      message.error(i18nT("ui.keenkonnect.projects.createNewProject.failedToCreateProject"));
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Paragraph type="secondary" className="mb-4">
        {i18nT("ui.keenkonnect.projects.createNewProject.theCoreProjectRecordIsCreatedIn")}
      </Paragraph>

      <Row justify="center">
        <Col xs={24} lg={18} xl={16}>
          <Card>
            <StepsForm<CreateProjectFormValues>
              onFinish={handleFinish}
              formProps={{
                layout: 'vertical',
              }}
              submitter={{
                searchConfig: {
                  submitText: 'Create Project',
                },
                submitButtonProps: {
                  loading: submitting,
                },
              }}
            >
              {/* Step 1 – Basic Info */}
              <StepsForm.StepForm name="basic" title={i18nT("ui.keenkonnect.projects.createNewProject.basicInfo")}>
                <ProFormText
                  name="name"
                  label={i18nT("ui.keenkonnect.projects.createNewProject.projectName")}
                  placeholder={i18nT("ui.keenkonnect.projects.createNewProject.enterProjectName")}
                  rules={[
                    { required: true, message: i18nT("ui.keenkonnect.projects.createNewProject.pleaseEnterAProjectName") },
                  ]}
                />

                <ProFormTextArea
                  name="description"
                  label={i18nT("ui.keenkonnect.projects.createNewProject.description")}
                  placeholder={i18nT("ui.keenkonnect.projects.createNewProject.describeYourProjectGoalsContextAndExpected")}
                  fieldProps={{ rows: 4 }}
                />

                <ProFormSelect
                  name="category"
                  label={i18nT("ui.keenkonnect.projects.createNewProject.category")}
                  placeholder={i18nT("ui.keenkonnect.projects.createNewProject.chooseADomainOrFocusArea")}
                  options={[
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.civic"), value: 'Civic' },
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.arts"), value: 'Arts' },
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.education"), value: 'Education' },
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.environment"), value: 'Environment' },
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.other"), value: 'Other' },
                  ]}
                />
              </StepsForm.StepForm>

              {/* Step 2 – Team & Timeline */}
              <StepsForm.StepForm
                name="team-settings"
                title={i18nT("ui.keenkonnect.projects.createNewProject.teamTimeline")}
              >
                <ProFormSelect
                  name="team"
                  label={i18nT("ui.keenkonnect.projects.createNewProject.team")}
                  placeholder={i18nT("ui.keenkonnect.projects.createNewProject.selectTeamOptionalForNow")}
                  options={[
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.teamAlpha"), value: 'alpha' },
                    { label: i18nT("ui.keenkonnect.projects.createNewProject.teamBeta"), value: 'beta' },
                  ]}
                />

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <ProFormDatePicker
                      name="startDate"
                      label={i18nT("ui.keenkonnect.projects.createNewProject.startDate")}
                      fieldProps={{ style: { width: '100%' } }}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <ProFormDatePicker
                      name="endDate"
                      label={i18nT("ui.keenkonnect.projects.createNewProject.endDate")}
                      fieldProps={{ style: { width: '100%' } }}
                    />
                  </Col>
                </Row>
              </StepsForm.StepForm>

              {/* Step 3 – Attachments & Notes */}
              <StepsForm.StepForm
                name="attachments"
                title={i18nT("ui.keenkonnect.projects.createNewProject.attachmentsNotes")}
              >
                <ProFormUploadButton
                  name="attachments"
                  label={i18nT("ui.keenkonnect.projects.createNewProject.attachments")}
                  max={5}
                  fieldProps={{
                    multiple: true,
                    // No automatic upload; files are kept in form state
                    beforeUpload: () => false,
                    listType: 'text',
                  }}
                  extra={i18nT("ui.keenkonnect.projects.createNewProject.attachmentsHint")}
                />

                <ProFormTextArea
                  name="notes"
                  label={i18nT("ui.keenkonnect.projects.createNewProject.additionalNotes")}
                  placeholder={i18nT("ui.keenkonnect.projects.createNewProject.anythingElseYourCollaboratorsShouldKnow")}
                  fieldProps={{ rows: 4 }}
                />
              </StepsForm.StepForm>
            </StepsForm>
          </Card>
        </Col>
      </Row>
    </>
  );
}
