'use client'

/**
 * Description: Primary maker edit page component (migrated to AntD v4/v5)
 * Notes:
 *  - Replaces Form.create/getFieldDecorator with Form.useForm + Form.Item
 *  - Replaces validateFields(cb) with await form.validateFields()
 *  - Keeps props API: visible, handleCancel, getCurrentMaker, editMaker
 */

import { useEffect, useState } from 'react'
import { Form, Input, Button, Modal, message as antdMessage } from 'antd'
import { CustomFormItem } from '../style'
import api from '../../../api'
import { normalizeError } from '../../../shared/errors'

type Maker = {
  id: string | number
  firstName: string
  lastName: string
  nationality?: string | null
  birthYear?: number | null
  deathYear?: number | null
  wikiUrl?: string | null
}

type MakerEditProps = {
  /** Modal state controlled by parent */
  visible: boolean
  /** Close handler (parent hides the modal) */
  handleCancel: () => void
  /** Returns the currently selected maker from the parent list */
  getCurrentMaker: () => Maker
  /** Parent updater after a successful save */
  editMaker: (m: Maker) => void
}

export default function MakerEdit({
  visible,
  handleCancel,
  getCurrentMaker,
  editMaker,
}: MakerEditProps) {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  // Pre-fill form when modal opens or selection changes
  useEffect(() => {
    if (!visible) {
      form.resetFields()
      return
    }
    const m = getCurrentMaker?.()
    if (m) {
      form.setFieldsValue({
        firstName: m.firstName ?? '',
        lastName: m.lastName ?? '',
        nationality: m.nationality ?? '',
        birthYear: m.birthYear != null ? String(m.birthYear) : '',
        deathYear: m.deathYear != null ? String(m.deathYear) : '',
        wikiUrl: m.wikiUrl ?? '',
      })
    }
  }, [visible, getCurrentMaker, form])

  const handleOk = async () => {
    try {
      const raw = await form.validateFields()

      // prune + convert
      const values: Record<string, any> = {}
      Object.keys(raw).forEach((k) => {
        const v = raw[k]
        if (v !== undefined && v !== null && String(v).trim() !== '') values[k] = v
        else values[k] = null
      })
      if (values.birthYear) values.birthYear = Number(values.birthYear)
      if (values.deathYear) values.deathYear = Number(values.deathYear)

      const current = getCurrentMaker?.()
      if (!current?.id) {
        antdMessage.error('Maker introuvable pour la mise à jour.')
        return
      }
      values.id = current.id

      setSubmitting(true)
      // NB: dans le code récent de MakerCreate vous consommez directement la data (pas .data)
      await api.patch('/maker', values)

      // Sync liste côté parent
      editMaker({ ...current, ...values })
      antdMessage.success('Updated maker details successfully!', 2)

      form.resetFields()
      handleCancel()
    } catch (e: any) {
      // validateFields peut lever une exception de validation -> ne pas traiter comme erreur API
      if (e?.errorFields) return
      const { message: msg } = normalizeError(e)
      antdMessage.error(msg || 'Update failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={visible}                // AntD v5: prop "open" (remplace "visible")
      title="Edit maker details"
      onOk={handleOk}
      onCancel={handleCancel}
      maskClosable={false}
      footer={[
        <Button key="back" onClick={() => form.resetFields()}>
          Reset
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
          <Input type="text" placeholder="Born" />
        </CustomFormItem>

        <CustomFormItem
          label="Passed away"
          name="deathYear"
          hasFeedback
          rules={[{ pattern: /^\d{4}$/, message: 'Please fill in a valid year!' }]}
        >
          <Input type="text" placeholder="Passed away" />
        </CustomFormItem>

        <CustomFormItem
          label="Website"
          name="wikiUrl"
          hasFeedback
          rules={[{ type: 'url' as const, message: 'Please fill in a valid URL!' }]}
        >
          <Input type="text" placeholder="Website" />
        </CustomFormItem>
      </Form>
    </Modal>
  )
}
