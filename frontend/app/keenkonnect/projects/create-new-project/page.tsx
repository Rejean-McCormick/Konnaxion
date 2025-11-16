'use client'

import React, { Suspense, useState } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { Row, Col, Card, Typography, message } from 'antd'
import {
  StepsForm,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProFormDatePicker,
  ProFormUploadButton,
} from '@ant-design/pro-components'
import type { UploadFile } from 'antd/es/upload/interface'
import api from '@/api'

const { Paragraph } = Typography

type CreateProjectFormValues = {
  name: string
  description?: string
  team: string
  startDate?: any
  endDate?: any
  attachments?: UploadFile[]
  notes?: string
}

export default function PageWrapper() {
  return (
    <Suspense fallback={null}>
      <Content />
    </Suspense>
  )
}

function Content() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)

  const handleFinish = async (values: CreateProjectFormValues) => {
    try {
      setSubmitting(true)

      // On sérialise légèrement les fichiers pour l’instant
      const payload = {
        ...values,
        attachments:
          values.attachments?.map((file) => ({
            uid: file.uid,
            name: file.name,
            size: file.size,
            type: file.type,
          })) ?? [],
      }

      await api.post('/projects/create', payload)

      message.success('Project created successfully!')
      router.push('/keenkonnect/projects/my-projects')
      return true
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Create project error:', err)
      message.error('Failed to create project.')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <Head>
        <title>Create New Project – KeenKonnect</title>
      </Head>

      <div className="container mx-auto p-5">
        <h1 className="text-2xl font-bold mb-2">Create New Project</h1>
        <Paragraph type="secondary" className="mb-4">
          Use this guided wizard to describe your project, configure the team and
          timeline, and attach any supporting files.
        </Paragraph>

        <Row justify="center">
          <Col xs={24} lg={18} xl={16}>
            <Card>
              <StepsForm<CreateProjectFormValues>
                onFinish={handleFinish}
                formProps={{
                  layout: 'vertical',
                }}
                submitter={{
                  // SearchConfig in this version only supports submitText / resetText
                  searchConfig: {
                    submitText: 'Create Project',
                  },
                  submitButtonProps: {
                    loading: submitting,
                  },
                }}
              >
                {/* Step 1 – Basic Info */}
                <StepsForm.StepForm name="basic" title="Basic Info">
                  <ProFormText
                    name="name"
                    label="Project Name"
                    placeholder="Enter project name"
                    rules={[
                      { required: true, message: 'Please enter a project name' },
                    ]}
                  />

                  <ProFormTextArea
                    name="description"
                    label="Description"
                    placeholder="Describe your project goals, context, and expected outcomes"
                    fieldProps={{ rows: 4 }}
                  />
                </StepsForm.StepForm>

                {/* Step 2 – Team & Timeline (Select + DatePicker) */}
                <StepsForm.StepForm name="team-settings" title="Team & Settings">
                  <ProFormSelect
                    name="team"
                    label="Team"
                    placeholder="Select team"
                    options={[
                      { label: 'Team Alpha', value: 'alpha' },
                      { label: 'Team Beta', value: 'beta' },
                    ]}
                    rules={[{ required: true, message: 'Please select a team' }]}
                  />

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <ProFormDatePicker
                        name="startDate"
                        label="Start Date"
                        fieldProps={{ style: { width: '100%' } }}
                      />
                    </Col>
                    <Col xs={24} md={12}>
                      <ProFormDatePicker
                        name="endDate"
                        label="End Date"
                        fieldProps={{ style: { width: '100%' } }}
                      />
                    </Col>
                  </Row>
                </StepsForm.StepForm>

                {/* Step 3 – Attachments & Notes (Upload + TextArea) */}
                <StepsForm.StepForm
                  name="attachments"
                  title="Attachments & Notes"
                >
                  <ProFormUploadButton
                    name="attachments"
                    label="Attachments"
                    max={5}
                    fieldProps={{
                      multiple: true,
                      beforeUpload: () => false, // pas d’upload auto, on garde dans le form state
                      listType: 'text',
                    }}
                    extra="Optional: upload briefs, specs, or reference documents."
                  />

                  <ProFormTextArea
                    name="notes"
                    label="Additional Notes"
                    placeholder="Anything else your collaborators should know?"
                    fieldProps={{ rows: 4 }}
                  />
                </StepsForm.StepForm>
              </StepsForm>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}
