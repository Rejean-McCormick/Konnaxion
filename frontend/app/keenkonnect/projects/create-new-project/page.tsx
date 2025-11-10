'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import {
  Button,
  Card,
  Form,
  Input,
  Select,
  Steps,
  Upload,
  message as antdMessage,
  Typography,
  Space,
  Divider,
} from 'antd';
import type { FormProps } from 'antd';
import type { UploadFile } from 'antd/es/upload/interface';
import {
  UploadOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

import { normalizeError } from '@/shared/errors';

// Load MainLayout on the client to avoid server/client boundary issues
const MainLayout = dynamic(
  () => import('@/components/layout-components/MainLayout'),
  { ssr: false }
);

const { Title, Text } = Typography;
const { TextArea } = Input;

type TeamMember = {
  name: string;
  role: string;
};

interface ProjectFormData {
  projectName: string;
  projectDescription: string;
  category?: string;
  projectImage?: UploadFile[]; // main image (controlled fileList)
  teamMembers: TeamMember[];
  documents?: UploadFile[]; // attachments
}

export default function CreateNewProjectPage(): JSX.Element {
  const router = useRouter();
  const [form] = Form.useForm<ProjectFormData>();

  // minimal global UI state
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // single source of truth for initial values
  const initialValues: ProjectFormData = useMemo(
    () => ({
      projectName: '',
      projectDescription: '',
      category: undefined,
      projectImage: [],
      teamMembers: [{ name: '', role: '' }],
      documents: [],
    }),
    []
  );

  const steps = useMemo(
    () => [
      { key: 'info', title: 'Project Info' },
      { key: 'team', title: 'Team & Roles' },
      { key: 'docs', title: 'Documents & Media' },
      { key: 'summary', title: 'Summary' },
    ],
    []
  );

  // Normalize Upload value to fileList
  const normFile = (
    e: { fileList?: UploadFile[] } | UploadFile[] | undefined
  ): UploadFile[] => {
    if (!e) return [];
    return Array.isArray(e) ? e : e.fileList ?? [];
  };

  const goNext = async () => {
    try {
      // validate all current fields before moving on
      await form.validateFields();
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    } catch {
      // errors already displayed by antd
    }
  };

  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit: FormProps<ProjectFormData>['onFinish'] = async (values) => {
    setSubmitting(true);
    try {
      // TODO: call your API/mutation here with `values`
      // await api.createProject(values)

      setSubmitted(true);
      antdMessage.success('Project created successfully');
    } catch (err) {
      const { message } = normalizeError(err);
      antdMessage.error(message ?? 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepFields = (stepIndex: number) => {
    switch (stepIndex) {
      case 0:
        return (
          <>
            <Form.Item
              label="Project Name"
              name="projectName"
              rules={[{ required: true, message: 'Please enter project name' }]}
            >
              <Input placeholder="e.g., Open Carbon Capture Initiative" />
            </Form.Item>

            <Form.Item
              label="Project Description"
              name="projectDescription"
              rules={[
                { required: true, message: 'Please enter a description' },
                { min: 10, message: 'Please write at least 10 characters' },
              ]}
            >
              <TextArea rows={5} placeholder="What is this project about?" />
            </Form.Item>

            <Form.Item label="Category" name="category">
              <Select
                placeholder="Select a category"
                options={[
                  { value: 'sustainability', label: 'Sustainability' },
                  { value: 'education', label: 'Education' },
                  { value: 'health', label: 'Health' },
                  { value: 'civic-tech', label: 'Civic Tech' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="Project Image"
              name="projectImage"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              extra="Upload a representative image for your project"
            >
              <Upload listType="picture" multiple={false} beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>Select Image</Button>
              </Upload>
            </Form.Item>
          </>
        );

      case 1:
        return (
          <>
            <Text type="secondary">
              Add core team members and define their roles.
            </Text>
            <Divider />
            <Form.List name="teamMembers">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space
                      key={key}
                      align="baseline"
                      style={{ display: 'flex', marginBottom: 8 }}
                    >
                      <Form.Item
                        {...restField}
                        name={[name, 'name']}
                        rules={[{ required: true, message: 'Name is required' }]}
                      >
                        <Input placeholder="Full name" />
                      </Form.Item>
                      <Form.Item
                        {...restField}
                        name={[name, 'role']}
                        rules={[{ required: true, message: 'Role is required' }]}
                      >
                        <Input placeholder="Role (e.g., Lead Researcher)" />
                      </Form.Item>
                      <Button type="link" danger onClick={() => remove(name)}>
                        Remove
                      </Button>
                    </Space>
                  ))}
                  <Button onClick={() => add()} type="dashed">
                    Add member
                  </Button>
                </>
              )}
            </Form.List>
          </>
        );

      case 2:
        return (
          <>
            <Form.Item
              label="Documents & Media"
              name="documents"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              extra="Attach any relevant documents, briefs, or media files"
            >
              <Upload multiple beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>Add files</Button>
              </Upload>
            </Form.Item>
          </>
        );

      case 3: {
        const v = form.getFieldsValue(true) as ProjectFormData;
        return (
          <div>
            <Title level={4}>Summary</Title>
            <Space direction="vertical" size="small">
              <div>
                <Text strong>Name:</Text> <Text>{v.projectName || '—'}</Text>
              </div>
              <div>
                <Text strong>Description:</Text>{' '}
                <Text>{v.projectDescription || '—'}</Text>
              </div>
              <div>
                <Text strong>Category:</Text> <Text>{v.category || '—'}</Text>
              </div>
              <div>
                <Text strong>Team members:</Text>{' '}
                <Text>
                  {Array.isArray(v.teamMembers) && v.teamMembers.length
                    ? v.teamMembers
                        .map((m) => [m?.name, m?.role].filter(Boolean).join(' – ')) // en dash
                        .join(', ')
                    : '—'}
                </Text>
              </div>
              <div>
                <Text strong>Documents:</Text>{' '}
                <Text>
                  {Array.isArray(v.documents) && v.documents.length
                    ? `${v.documents.length} file(s)`
                    : '—'}
                </Text>
              </div>
            </Space>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Card>
        <Title level={3} style={{ marginBottom: 16 }}>
          Create New Project
        </Title>

        <Steps
          current={currentStep}
          items={steps.map((s) => ({ key: s.key, title: s.title }))}
          style={{ marginBottom: 24 }}
        />

        {/* Single form across all steps */}
        <Form<ProjectFormData>
          form={form}
          layout="vertical"
          initialValues={initialValues}
          onFinish={handleSubmit}
          autoComplete="off"
        >
          {renderStepFields(currentStep)}

          <Divider />

          {!submitted ? (
            <Space>
              <Button
                onClick={goPrev}
                disabled={currentStep === 0}
                icon={<ArrowLeftOutlined />}
              >
                Previous
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button type="primary" onClick={goNext} icon={<ArrowRightOutlined />}>
                  Next
                </Button>
              ) : (
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  icon={<CheckCircleOutlined />}
                >
                  Create Project
                </Button>
              )}
            </Space>
          ) : (
            <Space direction="vertical" size="middle">
              <Text type="success">Project created successfully.</Text>
              <Space>
                <Button
                  type="primary"
                  onClick={() => router.push('/keenkonnect/projects/my-projects')}
                >
                  Go to My Projects
                </Button>
                <Link href="/keenkonnect/projects/create-new-project">
                  <Button>Create another</Button>
                </Link>
              </Space>
            </Space>
          )}
        </Form>
      </Card>
    </MainLayout>
  );
}
