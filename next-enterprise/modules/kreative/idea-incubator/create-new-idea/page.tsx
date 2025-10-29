'use client'

// File: /pages/kreative/idea-incubator/create-new-idea.tsx
import React from 'react';
import { NextPage } from 'next';
import { Form, Input, Select, Button, message } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';

const { TextArea } = Input;
const { Option } = Select;

const CreateNewIdea: NextPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();

  // Handler for form submission.
  const onFinish = (values: any) => {
    // Log form values; in a real app, you would send this data via an API call.
    console.log('Submitted Idea:', values);
    message.success('Votre idée a été soumise avec succès !');
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

        {/*
        // Optionally, add a multi-select for "Resources Needed" or "Skills Required" 
        <Form.Item label="Resources Needed / Skills Required" name="resources">
          <Select mode="multiple" placeholder="Select resources or skills">
            <Option value="Design">Design</Option>
            <Option value="Development">Development</Option>
            <Option value="Marketing">Marketing</Option>
            <Option value="Research">Research</Option>
          </Select>
        </Form.Item>
        */}

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

// Integrate with a global layout if required.
CreateNewIdea.getLayout = function getLayout(page: React.ReactElement) {
  return <MainLayout>{page}</MainLayout>;
};

export default CreateNewIdea;
