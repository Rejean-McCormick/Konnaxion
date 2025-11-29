// FILE: frontend/app/keenkonnect/sustainability-impact/submit-impact-reports/page.tsx
'use client';

import React, { Suspense, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { StepsForm, ProFormDigit } from '@ant-design/pro-components';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Select,
  Upload,
  Result,
  Spin,
  message,
} from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { InboxOutlined } from '@ant-design/icons';
import api from '@/api';
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

export default function PageWrapper() {
  return <KeenPage title="Page" description="">(
      <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
        <Content />
      </Suspense>
    )</KeenPage>;
}

function Content(): JSX.Element {
  const [completed, setCompleted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | undefined>();

  const handleFinish = async (
    values: SustainabilityReportFormValues,
  ): Promise<boolean> => {
    try {
      const payload = {
        ...values,
        date: values.date?.format('YYYY-MM-DD'),
        // No real upload here – we just serialize metadata:
        attachments: values.attachments?.map((file) => ({
          name: file.name,
          uid: file.uid,
        })),
      };

      const res = await api.post('/impact/sustainability/report', payload);

      if (res && typeof res === 'object' && 'reference' in (res as any)) {
        setReferenceId((res as any).reference as string);
      }

      message.success('Impact report submitted successfully!');
      setCompleted(true);
      return true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Submit impact report error:', error);
      message.error('Failed to submit impact report. Please try again.');
      return false;
    }
  };

  // Typed helper to normalize Upload value
  const normFile = (e: any): UploadFile[] => {
    if (Array.isArray(e)) {
      return e as UploadFile[];
    }
    return (e?.fileList ?? []) as UploadFile[];
  };

  if (completed) {
    return (
      <>
        <Head>
          <title>KeenKonnect – Submit Impact Report</title>
        </Head>

        <Result
          status="success"
          title="Impact report submitted"
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
              <Button type="primary">Go to Track Project Impact</Button>
            </Link>,
            <Button key="again" onClick={() => setCompleted(false)}>
              Submit another report
            </Button>,
          ]}
        />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>KeenKonnect – Submit Impact Report</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Submit Impact Report
      </h1>

      <Card>
        <StepsForm<SustainabilityReportFormValues>
          onFinish={handleFinish}
          submitter={{
            // SearchConfig in ProComponents v2 only supports resetText / submitText
            searchConfig: {
              submitText: 'Submit report',
            },
            render: (props, dom) => (
              <div style={{ marginTop: 24, textAlign: 'right' }}>{dom}</div>
            ),
          }}
        >
          {/* Step 1 – Project & timeframe */}
          <StepsForm.StepForm
            name="basic"
            title="Project & timeframe"
            layout="vertical"
            initialValues={{
              date: dayjs(),
            }}
          >
            <Form.Item
              label="Project"
              name="project"
              rules={[{ required: true, message: 'Please select a project' }]}
            >
              <Select placeholder="Select the project">
                {/* TODO: replace with dynamic project list */}
                <Option value="project-a">Project A</Option>
                <Option value="project-b">Project B</Option>
              </Select>
            </Form.Item>

            <Form.Item
              label="Date"
              name="date"
              rules={[{ required: true, message: 'Please select a date' }]}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label="Impact category"
              name="category"
              rules={[{ required: true, message: 'Please choose a category' }]}
            >
              <Select placeholder="Select impact category">
                <Option value="environment">Environment</Option>
                <Option value="social">Social</Option>
                <Option value="governance">Governance</Option>
              </Select>
            </Form.Item>
          </StepsForm.StepForm>

          {/* Step 2 – Quantitative metrics */}
          <StepsForm.StepForm
            name="metrics"
            title="Impact metrics"
            layout="vertical"
          >
            <ProFormDigit
              name="co2Reduction"
              label="CO₂ reduction (tons)"
              min={0}
              fieldProps={{ precision: 2 }}
              tooltip="Estimated CO₂ equivalent reduced by this initiative"
            />

            <ProFormDigit
              name="energySaved"
              label="Energy saved (kWh)"
              min={0}
              fieldProps={{ precision: 0 }}
            />

            <ProFormDigit
              name="peopleImpacted"
              label="People positively impacted"
              min={0}
              fieldProps={{ precision: 0 }}
            />

            <ProFormDigit
              name="budgetUsed"
              label="Budget used (USD)"
              min={0}
              fieldProps={{ precision: 2 }}
            />
          </StepsForm.StepForm>

          {/* Step 3 – Evidence & narrative */}
          <StepsForm.StepForm
            name="evidence"
            title="Evidence & narrative"
            layout="vertical"
          >
            <Form.Item
              label="Impact narrative"
              name="description"
              rules={[
                {
                  required: true,
                  message: 'Please describe the impact you observed',
                },
              ]}
            >
              <TextArea
                rows={4}
                placeholder="Describe the impact, context and key outcomes..."
              />
            </Form.Item>

            <Form.Item
              label="Supporting files"
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
                  Click or drag files to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Attach reports, spreadsheets, dashboards or photos that support
                  your impact.
                </p>
              </Dragger>
            </Form.Item>
          </StepsForm.StepForm>
        </StepsForm>
      </Card>
    </>
  );
}
