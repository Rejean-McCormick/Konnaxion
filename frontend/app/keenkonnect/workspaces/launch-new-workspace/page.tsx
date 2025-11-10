'use client';

// app/keenkonnect/workspaces/launch-new-workspace/page.tsx (rename to page.tsx if using App Router)
import React, { useState } from 'react';
// If you're in App Router, prefer Metadata API or head.tsx instead of next/head.
import Head from 'next/head';
import { Steps, Button, Form, Input, Select, Result, Divider, message as antdMessage } from 'antd';
import { useRouter } from 'next/navigation';
import { normalizeError } from '../../../../shared/errors';

const { TextArea } = Input;

type Accessibility = 'Private' | 'Team' | 'Public';

type WorkspaceFormValues = {
  workspaceName: string;
  workspaceDescription: string;
  linkedProject?: string;
  environmentTemplate: string;
  accessibility: Accessibility;
  resourceParams?: string;
};

const STEP_META = [
  { title: 'Basic Info' },
  { title: 'Environment Settings' },
  { title: 'Confirmation' },
];

// Fields to validate per step
const STEP_FIELDS: Record<number, (keyof WorkspaceFormValues)[]> = {
  0: ['workspaceName', 'workspaceDescription', 'linkedProject'],
  1: ['environmentTemplate', 'accessibility', 'resourceParams'],
  2: [], // review step
};

const LaunchNewWorkspace: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm<WorkspaceFormValues>();

  // Persist wizard data across steps
  const [workspaceData, setWorkspaceData] = useState<WorkspaceFormValues>({
    workspaceName: '',
    workspaceDescription: '',
    linkedProject: undefined,
    environmentTemplate: '',
    accessibility: 'Private',
    resourceParams: '',
  });

  const handleNext = async () => {
    try {
      await form.validateFields(STEP_FIELDS[currentStep] as any);
      setCurrentStep((s) => s + 1);
    } catch (err: unknown) {
      const { message } = normalizeError(err);
      antdMessage.error(message || 'Please complete the required fields.');
    }
  };

  const handlePrev = () => setCurrentStep((s) => s - 1);

  const onFinish = async () => {
    try {
      // Validate everything before submit
      const values = await form.validateFields();
      const payload = { ...workspaceData, ...values };

      // TODO: Replace with your API call to create the workspace
      // e.g. await api.workspaces.create(payload)
      // Simulate
      // console.log('Workspace created with data:', payload);
      setSubmitted(true);
      antdMessage.success('Workspace launched successfully!');
    } catch (err: unknown) {
      const { message } = normalizeError(err);
      antdMessage.error(message || 'Please ensure all fields are correctly filled.');
    }
  };

  // Values to show on confirmation (live merge of state + current form)
  const review = { ...workspaceData, ...form.getFieldsValue() };

  if (submitted) {
    return (
      <div className="container mx-auto p-5">
        <Result
          status="success"
          title="Workspace Launched Successfully!"
          subTitle="Your new workspace has been created. Click the button below to enter your workspace."
          extra={
            <Button
              type="primary"
              onClick={() =>
                router.push(`/keenkonnect/workspaces/launch-workspace?id=123`)
              }
            >
              Open Workspace
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <>
      {/* If using App Router, move this metadata to layout.tsx or head.tsx */}
      <Head>
        <title>Launch New Workspace</title>
        <meta
          name="description"
          content="Configure and launch a new workspace for collaboration."
        />
      </Head>

      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Launch New Workspace</h1>

        <Steps
          current={currentStep}
          className="mb-6"
          items={STEP_META.map((s) => ({ title: s.title }))}
        />

        <Form
          form={form}
          layout="vertical"
          initialValues={workspaceData}
          onValuesChange={(_, allValues) =>
            setWorkspaceData((prev) => ({ ...prev, ...allValues }))
          }
          onFinish={onFinish}
        >
          {currentStep === 0 && (
            <>
              <Form.Item
                name="workspaceName"
                label="Workspace Name"
                rules={[{ required: true, message: 'Please enter a workspace name' }]}
              >
                <Input placeholder="Enter workspace name" />
              </Form.Item>

              <Form.Item
                name="workspaceDescription"
                label="Workspace Description"
                rules={[
                  { required: true, message: 'Please enter a workspace description' },
                ]}
              >
                <TextArea rows={4} placeholder="Describe your workspace purpose" />
              </Form.Item>

              <Form.Item
                name="linkedProject"
                label="Link to Existing Project (optional)"
              >
                <Select
                  placeholder="Select a project or leave blank"
                  allowClear
                  options={[
                    { label: 'Project Alpha', value: 'Project Alpha' },
                    { label: 'Project Beta', value: 'Project Beta' },
                  ]}
                />
              </Form.Item>
            </>
          )}

          {currentStep === 1 && (
            <>
              <Form.Item
                name="environmentTemplate"
                label="Environment Template"
                rules={[
                  { required: true, message: 'Please select an environment template' },
                ]}
              >
                <Select
                  placeholder="Select template"
                  options={[
                    { label: 'Coding Notebook', value: 'Coding Notebook' },
                    { label: 'Design Canvas', value: 'Design Canvas' },
                    { label: 'AR/VR Room', value: 'AR/VR Room' },
                  ]}
                />
              </Form.Item>

              <Form.Item
                name="accessibility"
                label="Accessibility"
                rules={[
                  { required: true, message: 'Please choose the accessibility' },
                ]}
              >
                <Select
                  options={[
                    { label: 'Private', value: 'Private' },
                    { label: 'Team', value: 'Team' },
                    { label: 'Public', value: 'Public' },
                  ]}
                />
              </Form.Item>

              <Form.Item name="resourceParams" label="Resource Parameters">
                <Input placeholder="e.g. 4 vCPUs, 8GB RAM" />
              </Form.Item>
            </>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="font-semibold mb-2">Review Your Workspace Configuration</h3>
              <Divider className="my-3" />
              <p>
                <strong>Name:</strong> {review.workspaceName || 'N/A'}
              </p>
              <p>
                <strong>Description:</strong> {review.workspaceDescription || 'N/A'}
              </p>
              <p>
                <strong>Linked Project:</strong> {review.linkedProject || 'None'}
              </p>
              <p>
                <strong>Environment Template:</strong> {review.environmentTemplate || 'N/A'}
              </p>
              <p>
                <strong>Accessibility:</strong> {review.accessibility || 'N/A'}
              </p>
              <p>
                <strong>Resource Parameters:</strong> {review.resourceParams || 'N/A'}
              </p>
            </div>
          )}

          <div style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={handlePrev}>
                Back
              </Button>
            )}
            {currentStep < STEP_META.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Next
              </Button>
            )}
            {currentStep === STEP_META.length - 1 && (
              <Button type="primary" htmlType="submit">
                Launch Workspace
              </Button>
            )}
          </div>
        </Form>
      </div>
    </>
  );
};

export default LaunchNewWorkspace;
