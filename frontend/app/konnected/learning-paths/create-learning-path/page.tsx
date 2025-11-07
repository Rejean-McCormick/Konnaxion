'use client'

import React, { useState } from 'react';
import {
  Button,
  Card,
  Form,
  Input,
  List,
  Modal,
  Select,
  Steps,
  Table,
  Typography,
} from 'antd';
import PageContainer from '@/components/PageContainer';

const { Title, Paragraph } = Typography;
const { Option } = Select;

type Step = {
  id: string;
  title: string;
  type: 'lesson' | 'quiz' | 'assignment';
  content: string;
  resourceIds: string[];
};

type LearningPath = {
  id: string;
  name: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: Step[];
  tags: string[];
};

const initialSteps: Step[] = [
  {
    id: 'step-1',
    title: 'Introduction to the Subject',
    type: 'lesson',
    content: 'Overview of the key concepts that will be covered in this learning path.',
    resourceIds: ['res-1', 'res-2'],
  },
  {
    id: 'step-2',
    title: 'Knowledge Check Quiz',
    type: 'quiz',
    content: 'A brief quiz to evaluate understanding of the introduction.',
    resourceIds: [],
  },
];

const availableResources = [
  { id: 'res-1', name: 'Intro Article', type: 'Article' },
  { id: 'res-2', name: 'Intro Video', type: 'Video' },
  { id: 'res-3', name: 'Cheat Sheet', type: 'Document' },
  { id: 'res-4', name: 'Practice Repo', type: 'Code' },
];

const CreateLearningPath = () => {
  const [form] = Form.useForm();
  const [resourceForm] = Form.useForm();
  const [stepForm] = Form.useForm();

  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<Step[]>(initialSteps);
  const [selectedStep, setSelectedStep] = useState<Step | null>(null);

  const [isStepModalVisible, setStepModalVisible] = useState(false);
  const [isResourceModalVisible, setResourceModalVisible] = useState(false);

  const stepItems = [
    { title: 'Basics' },
    { title: 'Steps' },
    { title: 'Resources' },
    { title: 'Review & Create' },
  ];

  const onNext = () => setCurrentStep((s) => Math.min(s + 1, stepItems.length - 1));
  const onPrev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleAddStep = () => {
    setSelectedStep(null);
    stepForm.resetFields();
    setStepModalVisible(true);
  };

  const handleEditStep = (step: Step) => {
    setSelectedStep(step);
    stepForm.setFieldsValue(step);
    setStepModalVisible(true);
  };

  const handleDeleteStep = (id: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const submitStep = () => {
    stepForm.validateFields().then((values: Omit<Step, 'id'>) => {
      if (selectedStep) {
        setSteps((prev) =>
          prev.map((s) => (s.id === selectedStep.id ? { ...selectedStep, ...values } : s)),
        );
      } else {
        const newStep: Step = {
          id: `step-${Date.now()}`,
          ...values,
        };
        setSteps((prev) => [...prev, newStep]);
      }
      setStepModalVisible(false);
    });
  };

  const openResourceModal = (step: Step) => {
    setSelectedStep(step);
    resourceForm.setFieldsValue({ resourceIds: step.resourceIds });
    setResourceModalVisible(true);
  };

  const submitResources = () => {
    resourceForm.validateFields().then(({ resourceIds }: { resourceIds: string[] }) => {
      if (selectedStep) {
        setSteps((prev) =>
          prev.map((s) => (s.id === selectedStep.id ? { ...s, resourceIds } : s)),
        );
      }
      setResourceModalVisible(false);
    });
  };

  const onFinishBasics = (_values: any) => {
    // Basics are read from `form` during final submit
  };

  const onSubmitPath = async () => {
    const basics = await form.validateFields();
    const path: LearningPath = {
      id: `path-${Date.now()}`,
      name: basics.name,
      description: basics.description,
      difficulty: basics.difficulty,
      steps,
      tags: basics.tags || [],
    };
    // TODO: Send `path` to your backend
    console.log('New Learning Path:', path);
  };

  const columns = [
    { title: 'Title', dataIndex: 'title' as const },
    {
      title: 'Type',
      dataIndex: 'type' as const,
      render: (t: Step['type']) => t.charAt(0).toUpperCase() + t.slice(1),
    },
    { title: 'Content', dataIndex: 'content' as const, ellipsis: true },
    {
      title: 'Resources',
      dataIndex: 'resourceIds' as const,
      render: (ids: string[]) =>
        ids.length ? (
          <List
            size="small"
            dataSource={ids}
            renderItem={(id) => {
              const res = availableResources.find((r) => r.id === id);
              return <List.Item>{res ? `${res.name} (${res.type})` : id}</List.Item>;
            }}
          />
        ) : (
          <em>None</em>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Step) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => handleEditStep(record)}>Edit</Button>
          <Button onClick={() => openResourceModal(record)}>Resources</Button>
          <Button danger onClick={() => handleDeleteStep(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const StepBasics = (
    <Card>
      <Title level={4}>Learning Path Basics</Title>
      <Paragraph>Provide the basic information for your learning path.</Paragraph>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinishBasics}
        initialValues={{ difficulty: 'Beginner', tags: ['Onboarding'] }}
      >
        <Form.Item
          label="Path Name"
          name="name"
          rules={[{ required: true, message: 'Please enter a name for the learning path.' }]}
        >
          <Input placeholder="e.g., Web Fundamentals for New Team Members" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please enter a brief description.' }]}
        >
          <Input.TextArea rows={4} placeholder="Describe the goals and audience for this path..." />
        </Form.Item>

        <Form.Item label="Difficulty" name="difficulty" rules={[{ required: true }]}>
          <Select>
            <Option value="Beginner">Beginner</Option>
            <Option value="Intermediate">Intermediate</Option>
            <Option value="Advanced">Advanced</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Tags" name="tags">
          <Select mode="tags" placeholder="Add tags (optional)" />
        </Form.Item>
      </Form>
    </Card>
  );

  const StepSteps = (
    <Card>
      <Title level={4}>Define Steps</Title>
      <Paragraph>Create and organize the steps that make up this learning path.</Paragraph>

      <div style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleAddStep}>
          Add Step
        </Button>
      </div>

      <Table rowKey="id" dataSource={steps} columns={columns} pagination={false} />
    </Card>
  );

  const StepResources = (
    <Card>
      <Title level={4}>Manage Resources</Title>
      <Paragraph>
        Resources are supporting materials linked to steps (articles, videos, documents, code, etc.).
        Use the “Resources” action on each step to attach relevant items.
      </Paragraph>
      <List
        header="Available Resources"
        dataSource={availableResources}
        renderItem={(item) => (
          <List.Item>
            <List.Item.Meta title={`${item.name} (${item.type})`} description={`ID: ${item.id}`} />
          </List.Item>
        )}
      />
    </Card>
  );

  const StepReview = (
    <Card>
      <Title level={4}>Review & Create</Title>
      <Paragraph>Review all details, then click “Create Path”.</Paragraph>

      <Title level={5} style={{ marginTop: 8 }}>Basics</Title>
      <List
        size="small"
        dataSource={[
          { label: 'Name', value: form.getFieldValue('name') },
          { label: 'Description', value: form.getFieldValue('description') },
          { label: 'Difficulty', value: form.getFieldValue('difficulty') },
          { label: 'Tags', value: (form.getFieldValue('tags') || []).join(', ') || '—' },
        ]}
        renderItem={(i) => (
          <List.Item>
            <strong style={{ width: 120, display: 'inline-block' }}>{i.label}:</strong>{' '}
            {i.value || '—'}
          </List.Item>
        )}
      />

      <Title level={5} style={{ marginTop: 16 }}>Steps</Title>
      <Table
        rowKey="id"
        dataSource={steps}
        columns={[
          { title: '#', render: (_: any, __: Step, idx: number) => idx + 1, width: 60 },
          { title: 'Title', dataIndex: 'title' as const },
          { title: 'Type', dataIndex: 'type' as const },
          {
            title: 'Resources',
            dataIndex: 'resourceIds' as const,
            render: (ids: string[]) => (ids?.length ?? 0),
          },
        ]}
        pagination={false}
      />

      <div style={{ marginTop: 16 }}>
        <Button type="primary" onClick={onSubmitPath}>
          Create Path
        </Button>
      </div>
    </Card>
  );

  return (
    <>
      <PageContainer title="Create Learning Path">
        <Steps current={currentStep} items={stepItems} style={{ marginBottom: 24 }} />

        <div>
          {currentStep === 0 && StepBasics}
          {currentStep === 1 && StepSteps}
          {currentStep === 2 && StepResources}
          {currentStep === 3 && StepReview}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          <Button onClick={onPrev} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button type="primary" onClick={onNext} disabled={currentStep === stepItems.length - 1}>
            Next
          </Button>
        </div>
      </PageContainer>

      {/* Step Create/Edit Modal */}
      <Modal
        title={selectedStep ? 'Edit Step' : 'Add Step'}
        open={isStepModalVisible}
        onOk={submitStep}
        onCancel={() => setStepModalVisible(false)}
      >
        <Form form={stepForm} layout="vertical" initialValues={{ type: 'lesson' }}>
          <Form.Item
            name="title"
            label="Step Title"
            rules={[{ required: true, message: 'Please enter a step title.' }]}
          >
            <Input placeholder="e.g., Understanding HTML & CSS" />
          </Form.Item>

          <Form.Item name="type" label="Step Type">
            <Select>
              <Option value="lesson">Lesson</Option>
              <Option value="quiz">Quiz</Option>
              <Option value="assignment">Assignment</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="content"
            label="Content / Instructions"
            rules={[{ required: true, message: 'Please provide content or instructions.' }]}
          >
            <Input.TextArea
              rows={4}
              placeholder="Write the lesson content, quiz outline, or assignment brief..."
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Resource Selector Modal */}
      <Modal
        title="Attach Resources"
        open={isResourceModalVisible}
        onOk={submitResources}
        onCancel={() => setResourceModalVisible(false)}
      >
        <Form form={resourceForm} layout="vertical">
          <Form.Item
            name="resourceIds"
            label="Resources"
            rules={[{ required: true, message: 'Please select a resource.' }]}
          >
            <Select placeholder="Select resources" mode="multiple" allowClear>
              {availableResources.map((resource) => (
                <Option key={resource.id} value={resource.id}>
                  {resource.name} ({resource.type})
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="note" label="Add a Note (optional)">
            <Input placeholder="Enter any instructions or additional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default CreateLearningPath;
