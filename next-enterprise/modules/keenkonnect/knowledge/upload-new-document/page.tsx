'use client'

// pages/keenkonnect/knowledge/upload-new-document/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Form, Input, Select, Upload, Switch, Button, message, Progress, Result } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Option } = Select;
const { TextArea } = Input;

const UploadNewDocument: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const [form] = Form.useForm();
  const router = useRouter();
  
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleUploadChange = ({ fileList }: any) => {
    // Ce callback se contente de conserver le fileList dans le formulaire via antd.
    return fileList;
  };

  const simulateUpload = () => {
    setUploading(true);
    setUploadProgress(0);
    
    // Simuler une progression d'upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          message.success('Document uploaded successfully');
          setSubmitted(true);
          return 100;
        }
        return prev + 20;
      });
    }, 500);
  };

  const onFinish = async (values: any) => {
    console.log('Form values:', values);
    simulateUpload();
  };

  if (submitted) {
    return (
      <div className="container mx-auto p-5">
        <Result
          status="success"
          title="Document Uploaded Successfully!"
          subTitle="Your document has been successfully submitted."
          extra={[
            <Button type="primary" key="manage" onClick={() => router.push('/keenkonnect/knowledge/document-management')}>
              Go to Document Management
            </Button>,
          ]}
        />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Upload New Document</title>
        <meta name="description" content="Submit a new document to the knowledge repository." />
      </Head>
      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-4">Upload New Document</h1>
        <Form form={form} layout="vertical" onFinish={onFinish}>
          {/* Title */}
          <Form.Item
            name="title"
            label="Document Title"
            rules={[{ required: true, message: 'Please enter a document title' }]}
          >
            <Input placeholder="Enter document title" />
          </Form.Item>

          {/* Description */}
          <Form.Item
            name="description"
            label="Description/Abstract"
            rules={[{ required: true, message: 'Please provide a description' }]}
          >
            <TextArea rows={4} placeholder="Enter document description" />
          </Form.Item>

          {/* Category/Topic */}
          <Form.Item
            name="category"
            label="Category/Topic"
            rules={[{ required: true, message: 'Please select a category' }]}
          >
            <Select placeholder="Select category">
              <Option value="Robotics">Robotics</Option>
              <Option value="Healthcare">Healthcare</Option>
              <Option value="Technology">Technology</Option>
              <Option value="Energy">Energy</Option>
              <Option value="Education">Education</Option>
            </Select>
          </Form.Item>

          {/* Version */}
          <Form.Item
            name="version"
            label="Version"
            rules={[{ required: true, message: 'Please enter the document version' }]}
          >
            <Input placeholder="e.g. 1.0" />
          </Form.Item>

          {/* Language */}
          <Form.Item
            name="language"
            label="Language"
            rules={[{ required: true, message: 'Please select a language' }]}
          >
            <Select placeholder="Select language">
              <Option value="English">English</Option>
              <Option value="French">French</Option>
            </Select>
          </Form.Item>

          {/* File Upload */}
          <Form.Item
            name="documentFile"
            label="Document File"
            rules={[{ required: true, message: 'Please upload the document file' }]}
            valuePropName="fileList"
            getValueFromEvent={handleUploadChange}
          >
            <Upload beforeUpload={() => false} listType="picture">
              <Button icon={<UploadOutlined />}>Upload File</Button>
            </Upload>
          </Form.Item>

          {/* Publish Toggle */}
          <Form.Item name="publishNow" label="Publish Status" initialValue={true} valuePropName="checked">
            <Switch checkedChildren="Publish Now" unCheckedChildren="Save as Draft" />
          </Form.Item>

          {/* Bouton de soumission */}
          <Form.Item>
            <Button type="primary" htmlType="submit" disabled={uploading}>
              Submit
            </Button>
          </Form.Item>
        </Form>

        {/* Indicateur de progression lors de l'upload */}
        {uploading && (
          <div className="mt-4">
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}
      </div>
    </>
  );
};

UploadNewDocument.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default UploadNewDocument;
