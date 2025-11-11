'use client';

import React, { useState } from 'react';
import {
  Form,
  Input,
  Select,
  Upload,
  Switch,
  Button,
  message as antdMessage,
  Progress,
  Result,
} from 'antd';
import type { UploadFile, UploadProps, FormProps } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { TextArea } = Input;

type FormValues = {
  title: string;
  description?: string;
  category?: string;
  version?: string;
  language?: string;
  documentFile?: UploadFile[];
  publishNow?: boolean;
};

export default function UploadNewDocumentPage(): JSX.Element {
  const [form] = Form.useForm<FormValues>();
  const router = useRouter();

  const [uploadedFileList, setUploadedFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  type UploadChangeParam = Parameters<NonNullable<UploadProps['onChange']>>[0];

  const normFile = (e: UploadChangeParam | UploadFile[]): UploadFile[] => {
    if (Array.isArray(e)) return e;
    return e?.fileList ?? [];
  };

  const handleUploadChange: UploadProps['onChange'] = ({ fileList }) => {
    setUploadedFileList(fileList as UploadFile[]);
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        const next = prev + 10;
        if (next >= 100) {
          clearInterval(interval);
          setUploading(false);
          setSubmitted(true);
          antdMessage.success('Document uploaded successfully');
          return 100;
        }
        return next;
      });
    }, 300);
  };

  const onFinish: FormProps<FormValues>['onFinish'] = async () => {
    try {
      simulateUpload();
    } catch {
      setUploading(false);
      antdMessage.error('Upload failed');
    }
  };

  const onFinishFailed: FormProps<FormValues>['onFinishFailed'] = ({ errorFields }) => {
    antdMessage.error('Please fix the errors before submitting.');
    if (errorFields?.[0]?.name) {
      form.scrollToField(errorFields[0].name);
    }
  };

  if (submitted) {
    return (
      <Result
        status="success"
        title="Your document has been uploaded"
        extra={[
          <Button
            key="back"
            type="primary"
            onClick={() => router.push('/keenkonnect/knowledge/browse-repository')}
          >
            Go to repository
          </Button>,
        ]}
      />
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1 style={{ marginBottom: 16 }}>Upload a new document</h1>

      {uploading && (
        <div style={{ marginBottom: 16 }}>
          <Progress percent={uploadProgress} status="active" />
        </div>
      )}

      <Form<FormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Please enter a title' }]}
        >
          <Input placeholder="e.g. Sustainable AI Guidelines" />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <TextArea rows={4} placeholder="Short description of the document" />
        </Form.Item>

        <Form.Item name="category" label="Category/Topic">
          <Select
            placeholder="Select a category"
            showSearch
            optionFilterProp="label"
            options={[
              { value: 'Robotics', label: 'Robotics' },
              { value: 'AI & ML', label: 'AI & ML' },
              { value: 'Environment', label: 'Environment' },
              { value: 'Finance', label: 'Finance' },
            ]}
          />
        </Form.Item>

        <Form.Item name="version" label="Version">
          <Input placeholder="v1.0.0" />
        </Form.Item>

        <Form.Item name="language" label="Language">
          <Select
            placeholder="Select language"
            showSearch
            optionFilterProp="label"
            options={[
              { value: 'en', label: 'English' },
              { value: 'fr', label: 'French' },
              { value: 'es', label: 'Spanish' },
              { value: 'de', label: 'German' },
            ]}
          />
        </Form.Item>

        <Form.Item
          name="documentFile"
          label="Document file"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[{ required: true, message: 'Please select a file to upload' }]}
        >
          <Upload
            accept=".pdf,.doc,.docx,.txt,.md"
            beforeUpload={() => false}
            onChange={handleUploadChange}
            fileList={uploadedFileList}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select file</Button>
          </Upload>
        </Form.Item>

        <Form.Item name="publishNow" label="Publish now" valuePropName="checked" initialValue>
          <Switch />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={uploading} disabled={uploading}>
            Upload
          </Button>
          <Button
            style={{ marginLeft: 8 }}
            onClick={() => router.push('/keenkonnect/knowledge/browse-repository')}
            disabled={uploading}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
