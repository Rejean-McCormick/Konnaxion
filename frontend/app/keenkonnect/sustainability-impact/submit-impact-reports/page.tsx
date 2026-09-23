// FILE: frontend/app/keenkonnect/sustainability-impact/submit-impact-reports/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { InboxOutlined } from '@ant-design/icons';
import { ProFormDigit, StepsForm } from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Result,
  Select,
  Spin,
  Upload,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import Link from 'next/link';
import React, { Suspense, useState } from 'react';

import KeenPage from '@/app/keenkonnect/KeenPageShell';

const { Option } = Select;
const { TextArea } = Input;
const { Dragger } = Upload;

type SustainabilityReportFormValues = {
  project: string;
  date: Dayjs;
  category: string;
  co2Reduction?: number;
  energySaved?: number;
  peopleImpacted?: number;
  budgetUsed?: number;
  description: string;
  attachments?: UploadFile[];
};

export default function SubmitImpactReportsPage() {
  const { t: i18nT } = useLanguage();
  return (
    <KeenPage
      title={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.submitImpactReport")}
      description={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.reportSustainabilityImpactForYourKeenkonnectProjects")}
      metaTitle={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.keenkonnectSustainabilitySubmitImpactReport")}
    >
      <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
        <Content />
      </Suspense>
    </KeenPage>
  );
}

function Content(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [completed, setCompleted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | undefined>();

  const handleFinish = async (): Promise<boolean> => {
    // Declared read-only: no sustainability-impact report write contract exists.
    return false;
  };

  // Typed helper to normalize Upload value
  const normFile = (event: unknown): UploadFile[] => {
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
  };

  if (completed) {
    return (
      <Result
        status="success"
        title={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.impactReportSubmitted")}
        subTitle={
          referenceId
            ? `Reference: ${referenceId}. You can now track this impact in your dashboard.`
            : 'Your report has been saved. You can now track this impact in your dashboard.'
        }
        extra={[
          <Link
            key="track"
            href="/keenkonnect/sustainability-impact/track-project-impact"
          >
            <Button type="primary">{i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.goToTrackProjectImpact")}</Button>
          </Link>,
          <Button key="again" onClick={() => setCompleted(false)}>
            {i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.submitAnotherReport")}
          </Button>,
        ]}
      />
    );
  }

  return (
    <>
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.impactReportSubmissionUnavailable")}
        description={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.trackingViewsCanRemainVisibleButThis")}
        style={{ marginBottom: 16 }}
      />
      <Card>
      <StepsForm<SustainabilityReportFormValues>
        onFinish={handleFinish}
        submitter={{
          // SearchConfig in ProComponents v2 only supports resetText / submitText
          searchConfig: {
            submitText: 'Submit report',
          },
          submitButtonProps: {
            disabled: true,
            title: i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.unavailableUntilASustainabilityImpactReportContract"),
          },
          render: (props, dom) => (
            <div style={{ marginTop: 24, textAlign: 'right' }}>{dom}</div>
          ),
        }}
      >
        {/* Step 1 – Project & timeframe */}
        <StepsForm.StepForm
          name="basic"
          title={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.projectTimeframe")}
          layout="vertical"
          initialValues={{
            date: dayjs(),
          }}
        >
          <Form.Item
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.project")}
            name="project"
            rules={[{ required: true, message: i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.pleaseSelectAProject") }]}
          >
            <Select placeholder={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.selectTheProject")}>
              {/* Declared preview project options until an impact-report contract exists. */}
              <Option value="project-a">{i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.projectA")}</Option>
              <Option value="project-b">{i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.projectB")}</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.date")}
            name="date"
            rules={[{ required: true, message: i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.pleaseSelectADate") }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.impactCategory")}
            name="category"
            rules={[{ required: true, message: i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.pleaseChooseACategory") }]}
          >
            <Select placeholder={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.selectImpactCategory")}>
              <Option value="environment">{i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.environment")}</Option>
              <Option value="social">{i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.social")}</Option>
              <Option value="governance">{i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.governance")}</Option>
            </Select>
          </Form.Item>
        </StepsForm.StepForm>

        {/* Step 2 – Quantitative metrics */}
        <StepsForm.StepForm
          name="metrics"
          title={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.impactMetrics")}
          layout="vertical"
        >
          <ProFormDigit
            name="co2Reduction"
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.co2ReductionTons")}
            min={0}
            fieldProps={{ precision: 2 }}
            tooltip={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.estimatedCo2EquivalentReducedByThisInitiative")}
          />

          <ProFormDigit
            name="energySaved"
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.energySavedKwh")}
            min={0}
            fieldProps={{ precision: 0 }}
          />

          <ProFormDigit
            name="peopleImpacted"
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.peoplePositivelyImpacted")}
            min={0}
            fieldProps={{ precision: 0 }}
          />

          <ProFormDigit
            name="budgetUsed"
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.budgetUsedUsd")}
            min={0}
            fieldProps={{ precision: 2 }}
          />
        </StepsForm.StepForm>

        {/* Step 3 – Evidence & narrative */}
        <StepsForm.StepForm
          name="evidence"
          title={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.evidenceNarrative")}
          layout="vertical"
        >
          <Form.Item
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.impactNarrative")}
            name="description"
            rules={[
              {
                required: true,
                message: i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.pleaseDescribeTheImpactYouObserved"),
              },
            ]}
          >
            <TextArea
              rows={4}
              placeholder={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.describeTheImpactContextAndKeyOutcomes")}
            />
          </Form.Item>

          <Form.Item
            label={i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.supportingFiles")}
            name="attachments"
            valuePropName="fileList"
            getValueFromEvent={normFile}
          >
            <Dragger
              name="files"
              multiple
              beforeUpload={() => false}
              accept=".pdf,.doc,.docx,.xlsx,.csv,image/*"
            >
              <p className="ant-upload-drag-icon">
                <InboxOutlined />
              </p>
              <p className="ant-upload-text">
                {i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.clickOrDragFilesToThisArea")}
              </p>
              <p className="ant-upload-hint">
                {i18nT("ui.keenkonnect.sustainabilityImpact.submitImpactReports.attachReportsSpreadsheetsDashboardsOrPhotosThat")}
              </p>
            </Dragger>
          </Form.Item>
        </StepsForm.StepForm>
      </StepsForm>
      </Card>
    </>
  );
}
