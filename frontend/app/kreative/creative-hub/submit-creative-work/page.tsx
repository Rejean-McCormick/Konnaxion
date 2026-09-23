'use client'

import { useLanguage } from '@/context/LanguageContext';
import { UploadOutlined } from '@ant-design/icons'
import {
  Alert,
  Button,
  Form,
  Input,
  Select,
  Upload,
  message as antdMessage,
} from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import KreativePageShell from '@/app/kreative/kreativePageShell'
import { createKreativeArtwork } from '@/services/kreative'

type CreativeWorkFormValues = {
  title: string
  description: string
  category: string
  credits?: string
  creativeFile: UploadFile[]
}

type UploadChangeParamLite = {
  fileList: UploadFile[]
}

function mediaTypeFromFile(file: File): 'image' | 'video' | 'audio' | 'other' {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  return 'other'
}

export default function SubmitCreativeWorkPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<CreativeWorkFormValues>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [messageApi, messageContextHolder] = antdMessage.useMessage()
  const router = useRouter()

  const handleUploadChange = (info: UploadChangeParamLite) => {
    setFileList(info.fileList.slice(-1))
  }

  const normFile = (e: UploadChangeParamLite | UploadFile[]) => {
    if (Array.isArray(e)) return e.slice(-1)
    return e?.fileList?.slice(-1) ?? []
  }

  const onFinish = async (values: CreativeWorkFormValues) => {
    const upload = fileList[0]?.originFileObj
    if (!(upload instanceof File)) {
      messageApi.error(i18nT("ui.kreative.creativeHub.submitCreativeWork.pleaseAttachOneFile"))
      return
    }

    const description = values.credits?.trim()
      ? `${values.description}\n\nCredits: ${values.credits.trim()}`
      : values.description

    const payload = new FormData()
    payload.append('title', values.title)
    payload.append('description', description)
    payload.append('media_file', upload)
    payload.append('media_type', mediaTypeFromFile(upload))
    payload.append('medium', values.category)
    payload.append('year', String(new Date().getFullYear()))

    setSubmitting(true)
    try {
      await createKreativeArtwork(payload)
      messageApi.success(i18nT("ui.kreative.creativeHub.submitCreativeWork.creativeWorkSaved"))
      form.resetFields()
      setFileList([])
      router.push('/kreative/dashboard')
    } catch (error) {
      messageApi.error(
        error instanceof Error
          ? error.message
          : 'Unable to save the creative work.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.creativeHub.submitCreativeWork.submitCreativeWork")}
      subtitle={i18nT("ui.kreative.creativeHub.submitCreativeWork.shareYourCreativeWorkWithTheCommunity")}
    >
      {messageContextHolder}
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={i18nT("ui.kreative.creativeHub.submitCreativeWork.submissionsOnThisPageArePersistedThrough")}
      />

      <Form<CreativeWorkFormValues> layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label={i18nT("ui.kreative.creativeHub.submitCreativeWork.title")}
          name="title"
          rules={[{ required: true, message: i18nT("ui.kreative.creativeHub.submitCreativeWork.pleaseEnterATitle") }]}
        >
          <Input placeholder={i18nT("ui.kreative.creativeHub.submitCreativeWork.eGGenerativeSculptureSeries")} />
        </Form.Item>

        <Form.Item
          label={i18nT("ui.kreative.creativeHub.submitCreativeWork.description")}
          name="description"
          rules={[{ required: true, message: i18nT("ui.kreative.creativeHub.submitCreativeWork.pleaseAddADescription") }]}
        >
          <Input.TextArea rows={4} placeholder={i18nT("ui.kreative.creativeHub.submitCreativeWork.whatDidYouMakeHowWhy")} />
        </Form.Item>

        <Form.Item
          label={i18nT("ui.kreative.creativeHub.submitCreativeWork.mediumCategory")}
          name="category"
          rules={[{ required: true, message: i18nT("ui.kreative.creativeHub.submitCreativeWork.pleasePickACategory") }]}
        >
          <Select
            placeholder={i18nT("ui.kreative.creativeHub.submitCreativeWork.chooseOne")}
            options={[
              { value: 'Art', label: i18nT("ui.kreative.creativeHub.submitCreativeWork.art") },
              { value: 'Design', label: i18nT("ui.kreative.creativeHub.submitCreativeWork.design") },
              { value: 'Music', label: i18nT("ui.kreative.creativeHub.submitCreativeWork.music") },
              { value: 'Other', label: i18nT("ui.kreative.creativeHub.submitCreativeWork.other") },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={i18nT("ui.kreative.creativeHub.submitCreativeWork.upload")}
          name="creativeFile"
          valuePropName="fileList"
          getValueFromEvent={normFile}
          rules={[
            {
              validator: (_, value: UploadFile[]) =>
                value && value.length
                  ? Promise.resolve()
                  : Promise.reject(new Error('Please attach one file')),
            },
          ]}
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            onChange={handleUploadChange}
            fileList={fileList}
          >
            <Button icon={<UploadOutlined />}>{i18nT("ui.kreative.creativeHub.submitCreativeWork.selectFile")}</Button>
          </Upload>
        </Form.Item>

        <Form.Item label={i18nT("ui.kreative.creativeHub.submitCreativeWork.credits")} name="credits">
          <Input placeholder={i18nT("ui.kreative.creativeHub.submitCreativeWork.collaboratorsReferencesTools")} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {i18nT("ui.kreative.creativeHub.submitCreativeWork.submit")}
          </Button>
        </Form.Item>
      </Form>
    </KreativePageShell>
  )
}
