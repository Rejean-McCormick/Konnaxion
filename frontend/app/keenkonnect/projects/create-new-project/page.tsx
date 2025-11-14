'use client'

import React, { Suspense, useState } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import { Form, Input, Steps, Button, message, Upload, Select } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import api from '@/api'

const { Step } = Steps

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
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { title: 'Basic Info' },
    { title: 'Team & Settings' },
    { title: 'Attachments' },
  ]

  const next = () => setCurrentStep((c) => c + 1)
  const prev = () => setCurrentStep((c) => c - 1)

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            <Form.Item
              label="Project Name"
              name="name"
              rules={[{ required: true }]}
            >
              <Input placeholder="Enter project name" />
            </Form.Item>

            <Form.Item label="Description" name="description">
              <Input.TextArea rows={4} />
            </Form.Item>
          </>
        )
      case 1:
        return (
          <>
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
          </>
        )
      case 2:
        return (
          <>
            <Form.Item label="Attachments" name="attachments">
              <Upload beforeUpload={() => false} multiple>
                <Button>Select Files</Button>
              </Upload>
            </Form.Item>
          </>
        )
    }
  }

  const onFinish = async (values: any) => {
    try {
      await api.post('/projects/create', values)
      message.success('Project created successfully!')
      form.resetFields()
      setCurrentStep(0)
    } catch (err) {
      console.error('Create project error:', err)
      message.error('Failed to create project.')
    }
  }

  return (
    <>
      <Head>
        <title>Create New Project – KeenKonnect</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Create New Project
      </h1>

      <Steps current={currentStep} style={{ marginBottom: 24 }}>
        {steps.map((step, i) => (
          <Step key={i} title={step.title} />
        ))}
      </Steps>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        {renderStepContent(currentStep)}

        <div style={{ marginTop: 24 }}>
          {currentStep > 0 && (
            <Button style={{ marginRight: 8 }} onClick={prev}>
              Back
            </Button>
          )}

          {currentStep < steps.length - 1 ? (
            <Button type="primary" onClick={next}>
              Next
            </Button>
          ) : (
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          )}
        </div>
      </Form>
    </>
  )
}
