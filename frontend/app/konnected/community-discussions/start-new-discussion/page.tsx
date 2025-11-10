'use client';

import React from 'react';
import { Form, Input, Select, Switch, Button, message as antdMessage } from 'antd';
import type { FormProps } from 'antd';
import { useRouter } from 'next/navigation';
import PageContainer from '@/components/PageContainer';

const { TextArea } = Input;

type FormValues = {
  title: string;
  content?: string;
  category?: 'general' | 'announcements' | string;
  isQuestion?: boolean;
};

export default function StartNewDiscussionPage() {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();

  const onFinish: FormProps<FormValues>['onFinish'] = (values) => {
    // TODO: remplacez par l'appel API réel (+ gestion d’erreurs)
    antdMessage.success('Discussion posted');
    router.push('/konnected/community-discussions/active-threads');
  };

  const onFinishFailed: FormProps<FormValues>['onFinishFailed'] = (_errorInfo) => {
    antdMessage.error('Please fix the errors and try again.');
  };

  return (
    <PageContainer
      title="Start a New Discussion"
      subtitle="Share a topic with the community"
    >
      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        initialValues={{ isQuestion: false }}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="e.g. How do we measure impact across teams?" />
        </Form.Item>

        <Form.Item label="Content" name="content">
          <TextArea rows={6} placeholder="Add more details, links, or context…" />
        </Form.Item>

        <Form.Item label="Category" name="category">
          <Select
            placeholder="Select a category"
            options={[
              { label: 'General', value: 'general' },
              { label: 'Announcements', value: 'announcements' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="Is this a question?"
          name="isQuestion"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Post Discussion
          </Button>
        </Form.Item>
      </Form>
    </PageContainer>
  );
}
