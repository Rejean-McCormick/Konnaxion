'use client'

import React, { Suspense } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import { Form, Input, DatePicker, Select, Upload, Button, Card, message } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import api from '@/api'
import dayjs from 'dayjs'
import { UploadOutlined } from '@ant-design/icons'

export default function PageWrapper() {
  return (
    <Suspense fallback={null}>
      <>
        <Content />
      </>
    </Suspense>
  )
}

function Content() {
  const [form] = Form.useForm()

  const submitReport = async (values: any) => {
    try {
      await api.post('/impact/sustainability/report', {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
      })
      message.success('Impact report submitted successfully!')
      form.resetFields()
    } catch (err) {
      console.error('Submit impact report error:', err)
      message.error('Failed to submit report')
    }
  }

  return (
    <>
      <Head>
        <title>KeenKonnect – Submit Impact Report</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Submit Impact Report
      </h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={submitReport}
          initialValues={{
            date: dayjs(),
          }}
        >
          <Form.Item label="Project" name="project" rules={[{ required: true }]}>
            <Select
              placeholder="Select the project"
              options={[
                { label: 'Project A', value: 'project-a' },
                { label: 'Project B', value: 'project-b' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Date" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Category" name="category" rules={[{ required: true }]}>
            <Select
              placeholder="Impact category"
              options={[
                { label: 'Environment', value: 'environment' },
                { label: 'Social', value: 'social' },
                { label: 'Governance', value: 'governance' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true }]}
          >
            <Input.TextArea rows={4} placeholder="Describe the impact..." />
          </Form.Item>

          <Form.Item label="Attachments" name="attachments">
            <Upload multiple beforeUpload={() => false}>
              <Button icon={<UploadOutlined />}>Upload Files</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginTop: 12 }}>
              Submit Report
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  )
}
