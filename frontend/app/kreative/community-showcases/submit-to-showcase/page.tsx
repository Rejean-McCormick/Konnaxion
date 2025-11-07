'use client'

// File: /pages/kreative/community-showcases/submit-to-showcase.tsx
import React, { useState } from 'react';
import { NextPage } from 'next';
import { Form, Input, Select, Button, Modal, message as antdMessage  } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';
import MainLayout from '@/components/layout-components/MainLayout';


const { TextArea } = Input;
const { Option } = Select;

const SubmitToShowcase: NextPage = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);

  // Dummy data representing the user's existing projects.
  const projectOptions = [
    { id: 'p1', name: 'Project Sunrise' },
    { id: 'p2', name: 'Digital Dreamscape' },
    { id: 'p3', name: 'Urban Poetry' },
  ];

  // Handle form submission.
  const onFinish = (values: any) => {
    console.log('Submitted values:', values);
    // Here you would typically submit values to your API.
    setModalVisible(true);

  // Handle modal confirmation.
  const handleModalOk = () => {
    antdMessage.success('Your project has been submitted for review.');
    setModalVisible(false);
    // Redirect to the featured projects page or the user's submissions.
    router.push('/kreative/community-showcases/featured-projects');

  return (
    <PageContainer title="Submit to Showcase">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          showcaseCategory: 'General',
        }}
      >
        {/* Project Selection */}
        <Form.Item
          label="Select Project"
          name="projectId"
          rules={[{ required: true, message: 'Please select a project to submit.' }]}
        >
          <Select placeholder="Choose a project">
            {projectOptions.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Showcase Category (Optional) */}
        <Form.Item
          label="Showcase Category"
          name="showcaseCategory"
          rules={[{ required: true, message: 'Please select a showcase category.' }]}
        >
          <Select placeholder="Select a category">
            <Option value="General">General</Option>
            <Option value="Art">Art</Option>
            <Option value="Music">Music</Option>
            <Option value="Digital">Digital</Option>
          </Select>
        </Form.Item>

        {/* Justification Field */}
        <Form.Item
          label="Justification / Description"
          name="justification"
          rules={[{ required: true, message: 'Please provide a justification for your submission.' }]}
        >
          <TextArea
            rows={5}
            placeholder="Explain why your project is showcase-worthy and provide context for our curators."
          />
        </Form.Item>

        {/* Submit Button */}
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit Nomination
          </Button>
        </Form.Item>
      </Form>
      {/* Confirmation Modal */}
      <Modal
        title="Submission Received"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
        okText="Ok"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>Your project has been submitted for review. Moderators will evaluate your submission shortly.</p>
      </Modal>
    </PageContainer>
  );


  return <MainLayout>{page}</MainLayout>;

export default SubmitToShowcase;
}}}
