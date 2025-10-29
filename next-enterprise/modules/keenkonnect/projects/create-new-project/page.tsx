'use client'

// pages/keenkonnect/projects/create-new-project/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Steps, Button, Form, Input, Select, Upload, Result, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';

const { Step } = Steps;
const { Option } = Select;
const { TextArea } = Input;

const CreateNewProject: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form] = Form.useForm();

  // Stockage des données saisies durant le wizard
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    category: '',
    projectImage: null as any,
    teamMembers: [] as string[],
  });

  const steps = [
    { title: 'Project Info' },
    { title: 'Team Setup' },
    { title: 'Review' },
  ];

  // Passage à l'étape suivante après validation
  const next = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev) => ({ ...prev, ...values }));
      setCurrentStep(currentStep + 1);
      form.resetFields();
    } catch (error) {
      message.error('Please fill in the required fields.');
    }
  };

  // Retour à l'étape précédente
  const prev = () => {
    setCurrentStep(currentStep - 1);
  };

  // Soumission finale du formulaire
  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      setFormData((prev) => ({ ...prev, ...values }));
      // Simulation d'enregistrement du projet.
      console.log('Project created with values:', { ...formData, ...values });
      setSubmitted(true);
    } catch (error) {
      message.error('Please fill in the required fields.');
    }
  };

  // Rendu du contenu en fonction de l'étape
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Form.Item
              name="projectName"
              label="Project Name"
              rules={[{ required: true, message: 'Please enter project name' }]}
              initialValue={formData.projectName}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>
            <Form.Item
              name="projectDescription"
              label="Project Description"
              rules={[{ required: true, message: 'Please enter project description' }]}
              initialValue={formData.projectDescription}
            >
              <TextArea rows={4} placeholder="Enter project description" />
            </Form.Item>
            <Form.Item
              name="category"
              label="Category/Domain"
              rules={[{ required: true, message: 'Please select a category' }]}
              initialValue={formData.category}
            >
              <Select placeholder="Select category">
                <Option value="Innovation">Innovation</Option>
                <Option value="Research">Research</Option>
                <Option value="Development">Development</Option>
                <Option value="Marketing">Marketing</Option>
                <Option value="Design">Design</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="projectImage"
              label="Project Image/Icon"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e && e.fileList)}
            >
              <Upload beforeUpload={() => false} listType="picture">
                <Button icon={<UploadOutlined />}>Upload Image</Button>
              </Upload>
            </Form.Item>
          </>
        );
      case 1:
        return (
          <>
            <Form.Item
              name="teamMembers"
              label="Invite Team Members"
              initialValue={formData.teamMembers}
            >
              <Select mode="multiple" placeholder="Select team members">
                <Option value="Alice">Alice</Option>
                <Option value="Bob">Bob</Option>
                <Option value="Charlie">Charlie</Option>
                <Option value="Diana">Diana</Option>
              </Select>
            </Form.Item>
          </>
        );
      case 2:
        return (
          <div>
            <h3>Review Your Project Details:</h3>
            <p>
              <strong>Project Name:</strong> {formData.projectName || 'N/A'}
            </p>
            <p>
              <strong>Description:</strong> {formData.projectDescription || 'N/A'}
            </p>
            <p>
              <strong>Category:</strong> {formData.category || 'N/A'}
            </p>
            <p>
              <strong>Team Members:</strong>{' '}
              {formData.teamMembers.length > 0 ? formData.teamMembers.join(', ') : 'None'}
            </p>
            {formData.projectImage && (
              <p>
                <strong>Project Image:</strong> {JSON.stringify(formData.projectImage)}
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-5">
        <Result
          status="success"
          title="Project Created Successfully!"
          subTitle="Your new project has been created. You can now manage it or invite additional team members."
          extra={[
            <Button type="primary" key="dashboard" onClick={() => window.location.href = '/keenkonnect/dashboard'}>
              Go to Dashboard
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create New Project</title>
        <meta name="description" content="Create a new project using our guided project creation wizard." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Create New Project</h1>
        <Steps current={currentStep} className="mb-6">
          {steps.map((item, index) => (
            <Step key={index} title={item.title} />
          ))}
        </Steps>
        <Form form={form} layout="vertical" initialValues={formData} onFinish={onFinish}>
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
                Submit
              </Button>
            )}
          </div>
        </Form>
      </div>
    </>
  );
};

CreateNewProject.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default CreateNewProject;
