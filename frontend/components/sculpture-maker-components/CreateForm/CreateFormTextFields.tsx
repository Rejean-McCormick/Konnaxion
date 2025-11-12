// C:\MyCode\Konnaxionv14\frontend\components\sculpture-maker-components\CreateForm\CreateFormTextFields.tsx

'use client'

/**
 * Description: Sculpture create text fields component
 * Author: Hieu Chu
 */

import type React from 'react'
import { useState } from 'react'
import { Input, Select, Divider } from 'antd'
import Icon from '@/components/compat/Icon'
const { TextArea } = Input
// fix import path (file is in ../style)
import { FormCol, CustomFormItem } from '../style'
// remove broken import of '././shared/utils' and define local validators
import MakerCreate from './MakerCreate'

const { Option } = Select

/* ----------------------------- Types ----------------------------- */

type Maker = {
  id: string | number
  firstName: string
  lastName: string
}

type GetFieldDecorator = (
  id: string,
  options?: {
    rules?: Array<
      | {
          required?: boolean
          whitespace?: boolean
          message?: string
        }
      | {
          validator: (
            rule: unknown,
            value: unknown,
            callback: (message?: string) => void
          ) => void
        }
    >
    initialValue?: unknown
  }
) => (node: React.ReactElement) => React.ReactNode

type Props = {
  getFieldDecorator: GetFieldDecorator
  initialData: { markerLat?: number | string | null; markerLng?: number | string | null }
  makerList: Maker[]
  addMaker: (maker: Maker) => void
}

/* ------------------------ Local validators ----------------------- */

const validateLatitude: (
  rule: unknown,
  value: unknown,
  callback: (message?: string) => void
) => void = (_rule, value, callback) => {
  if (value === undefined || value === null || value === '') return callback()
  const n = Number(value)
  if (!Number.isFinite(n) || n < -90 || n > 90) {
    callback('Latitude must be between -90 and 90')
  } else {
    callback()
  }
}

const validateLongitude: (
  rule: unknown,
  value: unknown,
  callback: (message?: string) => void
) => void = (_rule, value, callback) => {
  if (value === undefined || value === null || value === '') return callback()
  const n = Number(value)
  if (!Number.isFinite(n) || n < -180 || n > 180) {
    callback('Longitude must be between -180 and 180')
  } else {
    callback()
  }
}

/* ----------------------------- UI ------------------------------- */

export default function CreateFormTextFields({
  getFieldDecorator,
  initialData: { markerLat, markerLng },
  makerList,
  addMaker,
}: Props) {
  const [showModal, setShowModal] = useState<boolean>(false)

  const openModal = () => setShowModal(true)
  const handleCancel = () => setShowModal(false)

  return (
    <>
      <FormCol>
        <CustomFormItem label="Sculpture name" hasFeedback>
          {getFieldDecorator('name', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: 'Please fill in the sculpture name!',
              },
            ],
          })(
            <Input
              prefix={<Icon type="trophy" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="text"
              placeholder="Sculpture name"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Accession ID" hasFeedback>
          {getFieldDecorator('accessionId', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: 'Please fill in the unique accession ID!',
              },
            ],
          })(
            <Input
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="text"
              placeholder="Accession ID"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Primary maker" hasFeedback>
          {getFieldDecorator('primaryMakerId', {
            rules: [
              {
                required: true,
                whitespace: true,
                message: 'Please fill in the primary maker!',
              },
            ],
          })(
            <Select
              placeholder="Primary maker"
              dropdownRender={(menu) => (
                <div>
                  {menu}
                  <Divider style={{ margin: '4px 0' }} />
                  <div
                    style={{ padding: '8px', cursor: 'pointer' }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={openModal}
                  >
                    <Icon type="plus" /> Add new maker
                  </div>
                </div>
              )}
            >
              {makerList.map((maker) => (
                <Option key={maker.id} value={maker.id}>
                  {`${maker.firstName} ${maker.lastName}`}
                </Option>
              ))}
            </Select>,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Production date" hasFeedback>
          {getFieldDecorator('productionDate')(
            <Input
              prefix={<Icon type="calendar" style={{ color: 'rgba(0,0,0,25)' }} />}
              type="text"
              placeholder="Production date"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Material" hasFeedback>
          {getFieldDecorator('material')(
            <Input
              prefix={<Icon type="code-sandbox" style={{ color: 'rgba(0,0,0,25)' }} />}
              type="text"
              placeholder="Material"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Credit line" hasFeedback>
          {getFieldDecorator('creditLine')(
            <TextArea placeholder="Credit line" autoSize={{ minRows: 3, maxRows: 5 }} style={{ marginTop: 5 }} />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Location details" hasFeedback>
          {getFieldDecorator('locationNotes')(
            <TextArea
              placeholder="Location details"
              autoSize={{ minRows: 3, maxRows: 5 }}
              style={{ marginTop: 5 }}
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol xs={24} sm={12}>
        <CustomFormItem label="Latitude" hasFeedback className="latitude-input">
          {getFieldDecorator('latitude', {
            rules: [{ validator: validateLatitude }],
            initialValue: markerLat != null ? String(markerLat) : undefined,
          })(
            <Input
              prefix={<Icon type="compass" style={{ color: 'rgba(0,0,0,25)' }} />}
              type="text"
              placeholder="Latitude"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol xs={24} sm={12}>
        <CustomFormItem label="Longitude" hasFeedback className="longitude-input">
          {getFieldDecorator('longitude', {
            rules: [{ validator: validateLongitude }],
            initialValue: markerLng != null ? String(markerLng) : undefined,
          })(
            <Input
              prefix={<Icon type="compass" style={{ color: 'rgba(0,0,0,25)' }} />}
              type="text"
              placeholder="Longitude"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <MakerCreate visible={showModal} handleCancel={handleCancel} addMaker={addMaker} />
    </>
  )
}
