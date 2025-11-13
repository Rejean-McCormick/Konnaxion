'use client'

import React, { Suspense } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import {
  Form,
  Input,
  Upload,
  Button,
  Select,
  DatePicker,
  Card,
  message,
} from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import api from '@/api'
import { UploadOutlined } from '@ant-design/icons'

export default function PageWrapper() {
  return (
    <Suspense fallback={null}>
      <MainLayout>
        <Content />
      </MainLayout>
    </Suspense>
  )
}

function Content() {
  const [form] = Form.useForm()

  const submitDoc = async (values: any) => {
    try {
      await api.post('/knowledge/documents/upload', values)
      message.success('Document uploaded!')
      form.resetFields()
    } catch (err) {
      console.error('Document upload error:', err)
      message.error('Failed to upload document.')
    }
  }

  return (
    <>
      <Head>
        <title>KeenKonnect – Upload New Document</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Upload New Document
      </h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={submitDoc}
          initialValues={{ visibility: 'public' }}
        >
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true }]}
          >
            <Input placeholder="Document title" />
          </Form.Item>

          <Form.Item label="Category" name="category">
            <Select
              placeholder="Select category"
              options={[
                { label: 'Reports', value: 'reports' },
                { label: 'Guides', value: 'guides' },
                { label: 'Research', value: 'research' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Effective Date" name="effectiveDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Visibility" name="visibility">
            <Select
              options={[
                { label: 'Public', value: 'public' },
                { label: 'Team Only', value: 'team' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Document File" name="file">
            <Upload beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginTop: 12 }}>
              Upload Document
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  )
}
