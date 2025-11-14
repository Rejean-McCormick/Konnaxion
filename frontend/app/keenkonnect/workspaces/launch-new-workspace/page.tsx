'use client'

import React, { Suspense } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import {
  Form,
  Input,
  Button,
  Select,
  DatePicker,
  Card,
  message,
} from 'antd'
import api from '@/api'
import dayjs from 'dayjs'

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

  const launchWorkspace = async (values: any) => {
    try {
      await api.post('/workspaces/launch', {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
      })
      message.success('Workspace launched successfully!')
      form.resetFields()
    } catch (err) {
      console.error('Launch workspace error:', err)
      message.error('Failed to launch workspace.')
    }
  }

  return (
    <>
      <Head>
        <title>KeenKonnect – Launch New Workspace</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Launch New Workspace
      </h1>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={launchWorkspace}
          initialValues={{ startDate: dayjs() }}
        >
          <Form.Item
            label="Workspace Name"
            name="name"
            rules={[{ required: true }]}
          >
            <Input placeholder="Enter workspace name" />
          </Form.Item>

          <Form.Item
            label="Team"
            name="team"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select team"
              options={[
                { label: 'Team Alpha', value: 'alpha' },
                { label: 'Team Beta', value: 'beta' },
              ]}
            />
          </Form.Item>

          <Form.Item label="Start Date" name="startDate">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ marginTop: 12 }}>
              Launch Workspace
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  )
}
