'use client';

import React from 'react';
import { Form, Input, Select, Button, message as antdMessage } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
// Note: MainLayout import removed because the /kreative layout handles the layout wrapper.

const { TextArea } = Input;
const { Option } = Select;

const CreateNewIdea: React.FC = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  // Handler for form submission.
  const onFinish = (values: any) => {
    console.log('Submitted Idea:', values);
    antdMessage.success('Votre idée a été soumise avec succès !');
    // Redirect to the "My Ideas" page after submitting.
    router.push('/kreative/idea-incubator/my-ideas');
  };

  return (
    <PageContainer title="Create New Idea">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        {/* Title Field */}
        <Form.Item
          label="Title of Idea"
          name="title"
          rules={[{ required: true, message: 'Veuillez saisir le titre de votre idée.' }]}
        >
          <Input placeholder="Enter title of your idea" />
        </Form.Item>

        {/* Detailed Description Field */}
        <Form.Item
          label="Detailed Description"
          name="description"
          rules={[{ required: true, message: 'Veuillez saisir une description détaillée de votre idée.' }]}
        >
          <TextArea
            rows={6}
            placeholder="Explain your idea, including the problem it solves or your vision"
          />
        </Form.Item>

        {/* Category / Field Selector */}
        <Form.Item
          label="Category / Field"
          name="category"
          rules={[{ required: true, message: 'Veuillez sélectionner une catégorie.' }]}
        >
          <Select placeholder="Select a category">
            <Option value="Technology">Technology</Option>
            <Option value="Art">Art</Option>
            <Option value="Education">Education</Option>
            <Option value="Health">Health</Option>
            <Option value="Environment">Environment</Option>
          </Select>
        </Form.Item>

        {/* (Optional) Resources Needed / Skills Required - omitted for now */}

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Idea
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
};

export default CreateNewIdea;
