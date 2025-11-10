'use client';

/**
 * Page: /kreative/community-showcases/submit-to-showcase
 * Corrections:
 * - App Router: suppression de NextPage et du pattern getLayout/MainLayout.
 * - AntD Select: usage de `options` (compatible v4/v5) plutôt que Select.Option.
 * - Nettoyage des imports et du JSX, suppression des accolades orphelines.
 */

import React, { useState } from 'react';
import { Form, Input, Select, Button, Modal, message } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { TextArea } = Input;

type FormValues = {
  title: string;
  category: string;
  description: string;
  link?: string;
  tags?: string[];
};

export default function SubmitToShowcasePage() {
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
      // TODO: branchement API si/when disponible (ex: POST /api/showcases)
      // await fetch('/api/showcases', { method: 'POST', body: JSON.stringify(values) });

      message.success('Submission received');
      setModalVisible(true);
    } catch (e) {
      message.error("Une erreur est survenue lors de l'envoi.");
    } finally {
      setSubmitting(false);
    }
  };

  const onCancel = () => router.back();

  return (
    <PageContainer title="Submit to Showcase">
      <Form
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
              (option?.label as string).toLowerCase().includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: 'Please add a short description' }]}
        >
          <TextArea rows={5} placeholder="What is this project about?" allowClear />
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
          Your project has been submitted for review. Moderators will evaluate your
          submission shortly.
        </p>
      </Modal>
    </PageContainer>
  );
}
