'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Button, Form, Input, Select } from 'antd'
import { useRouter } from 'next/navigation'
import React from 'react'

import KreativePageShell from '@/app/kreative/kreativePageShell'

const { TextArea } = Input

type FormValues = {
  title: string
  category: string
  description: string
  link?: string
  tags?: string[]
}

export default function SubmitToShowcasePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<FormValues>()
  const router = useRouter()

  const categories = [
    { label: i18nT("ui.kreative.communityShowcases.submitToShowcase.art"), value: 'art' },
    { label: i18nT("ui.kreative.communityShowcases.submitToShowcase.design"), value: 'design' },
    { label: i18nT("ui.kreative.communityShowcases.submitToShowcase.photography"), value: 'photography' },
    { label: i18nT("ui.kreative.communityShowcases.submitToShowcase.music"), value: 'music' },
  ]

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.communityShowcases.submitToShowcase.submitToShowcase")}
      subtitle={i18nT("ui.kreative.communityShowcases.submitToShowcase.prepareAShowcaseSubmissionWithoutImplyingPersistence")}
    >
      <Alert
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
        message={i18nT("ui.kreative.communityShowcases.submitToShowcase.showcaseReviewSubmissionsAreNotPersistedIn")}
        description={i18nT("ui.kreative.communityShowcases.submitToShowcase.useSubmitCreativeWorkForAReal")}
      />

      <Form<FormValues>
        form={form}
        layout="vertical"
        name="submitToShowcaseForm"
        disabled
      >
        <Form.Item label={i18nT("ui.kreative.communityShowcases.submitToShowcase.projectTitle")} name="title">
          <Input placeholder={i18nT("ui.kreative.communityShowcases.submitToShowcase.eGKonnaxionVisualizer")} allowClear />
        </Form.Item>

        <Form.Item label={i18nT("ui.kreative.communityShowcases.submitToShowcase.category")} name="category">
          <Select
            placeholder={i18nT("ui.kreative.communityShowcases.submitToShowcase.selectACategory")}
            options={categories}
            showSearch
            filterOption={(input, option) =>
              (option?.label as string)
                .toLowerCase()
                .includes(input.toLowerCase())
            }
          />
        </Form.Item>

        <Form.Item label={i18nT("ui.kreative.communityShowcases.submitToShowcase.description")} name="description">
          <TextArea
            rows={5}
            placeholder={i18nT("ui.kreative.communityShowcases.submitToShowcase.whatIsThisProjectAbout")}
            allowClear
          />
        </Form.Item>

        <Form.Item label={i18nT("ui.kreative.communityShowcases.submitToShowcase.referenceLink")} name="link">
          <Input placeholder="https://…" allowClear type="url" />
        </Form.Item>

        <Form.Item label={i18nT("ui.kreative.communityShowcases.submitToShowcase.tags")} name="tags">
          <Select
            mode="tags"
            placeholder={i18nT("ui.kreative.communityShowcases.submitToShowcase.addTags")}
            tokenSeparators={[',']}
            options={[]}
          />
        </Form.Item>
      </Form>

      <Button onClick={() => router.back()}>{i18nT("ui.kreative.communityShowcases.submitToShowcase.back")}</Button>
      <Button
        type="primary"
        style={{ marginLeft: 8 }}
        onClick={() => router.push('/kreative/creative-hub/submit-creative-work')}
      >
        {i18nT("ui.kreative.communityShowcases.submitToShowcase.submitPersistedCreativeWork")}
      </Button>
    </KreativePageShell>
  )
}
