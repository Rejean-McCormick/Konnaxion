'use client'

/**
 * Description: Component for primary maker create page
 * Author: Hieu Chu
 */

import { useState } from 'react'
import { Form, Input, Button, Modal, message as antdMessage } from 'antd'
import { CustomFormItem } from '../style'
import api from '../../../api'
import { normalizeError } from '../../../shared/errors'

type Maker = {
  id: string | number
  firstName: string
  lastName: string
  nationality?: string
  birthYear?: number | null
  deathYear?: number | null
  wikiUrl?: string
}

type MakerCreateProps = {
  visible: boolean
  handleCancel: () => void
  addMaker: (m: Maker) => void
}

export default function MakerCreate({
  visible,
  handleCancel,
  addMaker,
}: MakerCreateProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleOk = async () => {
    try {
      const raw = await form.validateFields()

      // prune empty values
      const values: Record<string, any> = {}
      Object.keys(raw).forEach((k) => {
        const v = raw[k]
        if (v !== undefined && v !== null && String(v).trim() !== '') values[k] = v
      })
      if (values.birthYear) values.birthYear = Number(values.birthYear)
      if (values.deathYear) values.deathYear = Number(values.deathYear)

      setSubmitting(true)
      // axios instance already returns raw data (no `.data`)
      const result = await api.post<Maker>('/maker', values)
      addMaker(result)
      antdMessage.success('Created new maker successfully!', 2)
      form.resetFields()
      handleCancel()
    } catch (e) {
      const { message } = normalizeError(e)
      if (message) antdMessage.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={visible}
      title="Add new maker"
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={submitting} onClick={handleOk}>
          Submit
        </Button>,
      ]}
    >
      <Form form={form} autoComplete="off" layout="vertical">
        <CustomFormItem
          label="First name"
          name="firstName"
          hasFeedback
          rules={[{ required: true, whitespace: true, message: 'Please fill in the first name!' }]}
        >
          <Input type="text" placeholder="First name" />
        </CustomFormItem>

        <CustomFormItem
          label="Last name"
          name="lastName"
          hasFeedback
          rules={[{ required: true, whitespace: true, message: 'Please fill in the last name!' }]}
        >
          <Input type="text" placeholder="Last name" />
        </CustomFormItem>

        <CustomFormItem label="Nationality" name="nationality" hasFeedback>
          <Input type="text" placeholder="Nationality" />
        </CustomFormItem>

        <CustomFormItem
          label="Born"
          name="birthYear"
          hasFeedback
          rules={[{ pattern: /^\d{4}$/, message: 'Please fill in a valid year!' }]}
        >
          <Input type="text" placeholder="Born" inputMode="numeric" />
        </CustomFormItem>

        <CustomFormItem
          label="Passed away"
          name="deathYear"
          hasFeedback
          rules={[{ pattern: /^\d{4}$/, message: 'Please fill in a valid year!' }]}
        >
          <Input type="text" placeholder="Passed away" inputMode="numeric" />
        </CustomFormItem>

        <CustomFormItem
          label="Website"
          name="wikiUrl"
          hasFeedback
          rules={[{ type: 'url', message: 'Please fill in a valid URL!' }]}
        >
          <Input type="text" placeholder="Website" />
        </CustomFormItem>
      </Form>
    </Modal>
  )
}
