'use client'

// pages/keenkonnect/workspaces/launch-new-workspace/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Steps, Button, Form, Input, Select, Result, Divider, message as antdMessage  } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';
import { normalizeError } from "../../../../shared/errors";

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const LaunchNewWorkspace = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  // Stockage des données recueillies par le wizard
  const [workspaceData, setWorkspaceData] = useState({
    workspaceName: '',
    workspaceDescription: '',
    linkedProject: '', // optionnel
    environmentTemplate: '',
    accessibility: 'Private', // Private | Team | Public
    resourceParams: '', // Ex: "4 vCPUs, 8GB RAM"
  });

  const steps = [
    { title: 'Basic Info' },
    { title: 'Environment Settings' },
    { title: 'Confirmation' },
  ];

  // Passage à l'étape suivante, après validation des champs de l'étape courante
  const next = async () => {
    try {
      const values = await form.validateFields();
      setWorkspaceData(prev => ({ ...prev, ...values }));
      setCurrentStep(currentStep + 1);
      form.resetFields();
    } catch (err: unknown) {
      const { message, statusCode } = normalizeError(err);
      antdMessage.error('Please complete the required fields.');
    }

  const prev = () => {
    setCurrentStep(currentStep - 1);

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      setWorkspaceData(prev => ({ ...prev, ...values }));
      // Simuler la création du workspace (appel API à intégrer ici)
      console.log('Workspace created with data:', { ...workspaceData, ...values });
      setSubmitted(true);
    } catch (err: unknown) {
      const { message, statusCode } = normalizeError(err);
      antdMessage.error('Please ensure all fields are correctly filled.');
    }

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Form.Item
              name="workspaceName"
              label="Workspace Name"
              rules={[{ required: true, message: 'Please enter a workspace name' }]}
              initialValue={workspaceData.workspaceName}
            >
              <Input placeholder="Enter workspace name" />
            </Form.Item>
            <Form.Item
              name="workspaceDescription"
              label="Workspace Description"
              rules={[{ required: true, message: 'Please enter a workspace description' }]}
              initialValue={workspaceData.workspaceDescription}
            >
              <TextArea rows={4} placeholder="Describe your workspace purpose" />
            </Form.Item>
            <Form.Item name="linkedProject" label="Link to Existing Project (optional)" initialValue={workspaceData.linkedProject}>
              <Select placeholder="Select a project or leave blank">
                <Option value="">None</Option>
                <Option value="Project Alpha">Project Alpha</Option>
                <Option value="Project Beta">Project Beta</Option>
              </Select>
            </Form.Item>
          </>
        );
      case 1:
        return (
          <>
            <Form.Item
              name="environmentTemplate"
              label="Environment Template"
              rules={[{ required: true, message: 'Please select an environment template' }]}
              initialValue={workspaceData.environmentTemplate}
            >
              <Select placeholder="Select template">
                <Option value="Coding Notebook">Coding Notebook</Option>
                <Option value="Design Canvas">Design Canvas</Option>
                <Option value="AR/VR Room">AR/VR Room</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="accessibility"
              label="Accessibility"
              rules={[{ required: true, message: 'Please choose the accessibility' }]}
              initialValue={workspaceData.accessibility}
            >
              <Select>
                <Option value="Private">Private</Option>
                <Option value="Team">Team</Option>
                <Option value="Public">Public</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="resourceParams"
              label="Resource Parameters"
              initialValue={workspaceData.resourceParams}
            >
              <Input placeholder="e.g. 4 vCPUs, 8GB RAM" />
            </Form.Item>
          </>
        );
      case 2:
        return (
          <div>
            <h3>Review Your Workspace Configuration:</h3>
            <p>
              <strong>Name:</strong> {workspaceData.workspaceName || 'N/A'}
            </p>
            <p>
              <strong>Description:</strong> {workspaceData.workspaceDescription || 'N/A'}
            </p>
            <p>
              <strong>Linked Project:</strong> {workspaceData.linkedProject || 'None'}
            </p>
            <p>
              <strong>Environment Template:</strong> {workspaceData.environmentTemplate || 'N/A'}
            </p>
            <p>
              <strong>Accessibility:</strong> {workspaceData.accessibility || 'N/A'}
            </p>
            <p>
              <strong>Resource Parameters:</strong> {workspaceData.resourceParams || 'N/A'}
            </p>
          </div>
        );
      default:
        return null;
    }

  if (submitted) {
    return (
      <div className="container mx-auto p-5">
        <Result
          status="success"
          title="Workspace Launched Successfully!"
          subTitle="Your new workspace has been created. Click the button below to enter your workspace."
          extra={[
            <Button type="primary" key="launch" onClick={() => router.push(`/keenkonnect/workspaces/launch-workspace?id=123`)}>
              Open Workspace
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Launch New Workspace</title>
        <meta name="description" content="Configure and launch a new workspace for collaboration." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Launch New Workspace</h1>
        <Steps current={currentStep} className="mb-6">
          {steps.map((item, index) => (
            <Step key={index} title={item.title} />
          ))}
        </Steps>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {renderStepContent(currentStep)}
          <div style={{ marginTop: 24 }}>
            {currentStep > 0 && (
              <Button style={{ marginRight: 8 }} onClick={prev}>
                Back
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={next}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit">
                Launch Workspace
              </Button>
            )}
          </div>
        </Form>
      </div>
    </>
  );



export default LaunchNewWorkspace;
}}}}}
