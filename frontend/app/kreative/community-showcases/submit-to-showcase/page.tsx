// FILE: frontend/app/kreative/community-showcases/submit-to-showcase/page.tsx
// File: app/kreative/community-showcases/submit-to-showcase/page.tsx
'use client';

import React, { useState } from 'react';
import { Form, Input, Select, Button, Modal, message as antdMessage } from 'antd';
import { useRouter } from 'next/navigation';
import KreativePageShell from '@/app/kreative/kreativePageShell';

const { TextArea } = Input;

type FormValues = {
  title: string;
  category: string;
  description: string;
  link?: string;
  tags?: string[];
};

export default function SubmitToShowcasePage(): JSX.Element {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const categories = [
    { label: 'Art', value: 'art' },
    { label: 'Design', value: 'design' },
    { label: 'Photography', value: 'photography' },
    { label: 'Music', value: 'music' },
  ];

  const onFinish = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // TODO: plug into backend API when available (e.g. POST /api/showcases)
      // await fetch('/api/showcases', { method: 'POST', body: JSON.stringify(values) });

      antdMessage.success('Submission received');
      setModalVisible(true);
    } catch (e) {
      antdMessage.error("Une erreur est survenue lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => router.back();

  return (
    <KreativePageShell
      title="Submit to Showcase"
      subtitle="Share a project you’re proud of with the Kreative community showcase."
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        name="submitToShowcaseForm"
      >
        <Form.Item
          label="Project title"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="e.g. Konnaxion Visualizer" allowClear />
        </Form.Item>

        <Form.Item
          label="Category"
          name="category"
          rules={[{ required: true, message: 'Please choose a category' }]}
        >
          <Select
            placeholder="Select a category"
            options={categories}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please add a short description' }]}
        >
          <TextArea
            rows={5}
            placeholder="What is this project about?"
            allowClear
          />
        </Form.Item>

        <Form.Item label="Reference link (optional)" name="link">
          <Input placeholder="https://…" allowClear type="url" />
        </Form.Item>

        <Form.Item label="Tags (optional)" name="tags">
          <Select
            mode="tags"
            placeholder="Add tags"
            tokenSeparators={[',']}
            options={[]}
          />
        </Form.Item>

        <Form.Item style={{ marginTop: 16 }}>
          <Button onClick={onCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={submitting}>
            Submit
          </Button>
        </Form.Item>
      </Form>

      <Modal
        open={modalVisible}
        onOk={() => {
          setModalVisible(false);
          router.push('/kreative/community-showcases');
        }}
        onCancel={() => setModalVisible(false)}
        okText="Ok"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>
          Your project has been submitted for review. Moderators will evaluate
          your submission shortly.
        </p>
      </Modal>
    </KreativePageShell>
  );
}
