'use client';

import React from 'react';
import { Form, Checkbox, Select, Button, Alert, Divider } from 'antd';
import PageContainer from '@/components/PageContainer';

type FormValues = {
  currentExpertise: string[];
  newExpertise?: string[];
  newFields?: string[];
  visibility: 'public' | 'team-only' | 'private';
};

const expertiseOptions: string[] = [
  'Frontend Development',
  'UI/UX Design',
  'Data Science',
  'DevOps',
  'Mobile Development',
  'QA',
  'Project Management',
];

const currentExpertiseInitial: string[] = ['Frontend Development', 'UI/UX Design'];

const selectableFields: string[] = ['React', 'TypeScript', 'Figma', 'GraphQL', 'Node.js'];

const visibilityLevels = [
  { label: 'Public', value: 'public' as const },
  { label: 'Team only', value: 'team-only' as const },
  { label: 'Private', value: 'private' as const },
];

export default function Page(): JSX.Element {
  const [form] = Form.useForm<FormValues>();

  const onFinish = (values: FormValues) => {
    console.log('Manage Expertise Areas - submit:', values);
  };

  return (
    <PageContainer title="Manage Expertise Areas">
      <Divider orientation="left">Your current expertise</Divider>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          currentExpertise: currentExpertiseInitial,
          visibility: 'team-only',
          newFields: [],
        }}
        onFinish={onFinish}
      >
        <Form.Item
          name="currentExpertise"
          label="Current expertise"
          rules={[{ required: true, message: 'Please select at least one expertise.' }]}
        >
          <Checkbox.Group options={expertiseOptions} />
        </Form.Item>

        <Form.Item name="newFields" label="Select new fields (optional)">
          <Select
            mode="multiple"
            allowClear
            placeholder="Select fields…"
            options={selectableFields.map((f) => ({ label: f, value: f }))}
          />
        </Form.Item>

        <Form.Item
          name="visibility"
          label="Visibility"
          rules={[{ required: true, message: 'Please choose a visibility level.' }]}
        >
          <Select placeholder="Choose visibility…" options={visibilityLevels} />
        </Form.Item>

        <Alert
          message="Note: Adding an expertise may require validation through contributions."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
}
