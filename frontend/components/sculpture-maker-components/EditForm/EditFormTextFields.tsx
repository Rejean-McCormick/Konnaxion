// C:\MyCode\Konnaxionv14\frontend\components\sculpture-maker-components\EditForm\EditFormTextFields.tsx
'use client'

/**
 * Text details edit for Sculpture.
 * getCurrentMaker now always returns a Maker (no undefined).
 * editMaker accepts MakerEdit.Maker and normalizes to local Maker.
 */

import React, { useState } from 'react'
import { Input, Select, Divider, Button } from 'antd'
import Icon from '@/components/compat/Icon'
const { TextArea } = Input
import { FormCol, CustomFormItem } from '../style'
import { validateLatitude, validateLongitude } from '../../shared/utils'
import MakerEdit from './MakerEdit'
import type { Maker as MakerFromMakerEdit } from './MakerEdit'
import MakerCreate from '../CreateForm/MakerCreate'

const { Option } = Select

/* ----------------------------- Types ----------------------------- */

type Maker = {
  id: string | number
  firstName: string
  lastName: string
  nationality?: string | null
  birthYear?: number | null
  deathYear?: number | null
  wikiUrl?: string | null
}

type InitialData = {
  latitude?: number | null
  longitude?: number | null
  accessionId: string
  creditLine?: string
  locationNotes?: string
  material?: string
  name: string
  productionDate?: string
  primaryMakerId?: string | number
}

type GetFieldDecorator = (
  name: string,
  options?: any
) => (node: React.ReactElement) => React.ReactElement

type Props = {
  getFieldDecorator: GetFieldDecorator
  setFieldsValue: (values: Record<string, any>) => void
  getFieldValue: (name: string) => any
  initialData: InitialData
  makerList: Maker[]
  setMakerList: React.Dispatch<React.SetStateAction<Maker[]>>
}

/* ----------------------------- Component ----------------------------- */

export default function EditFormTextFields({
  getFieldDecorator,
  setFieldsValue,
  getFieldValue,
  initialData: {
    latitude,
    longitude,
    accessionId,
    creditLine,
    locationNotes,
    material,
    name,
    productionDate,
    primaryMakerId,
  },
  makerList,
  setMakerList,
}: Props): JSX.Element {
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false)
  const [showEditModal, setShowEditModal] = useState<boolean>(false)

  const openCreateModal = (): void => setShowCreateModal(true)
  const closeCreateModal = (): void => setShowCreateModal(false)

  const openEditModal = (): void => setShowEditModal(true)
  const closeEditModal = (): void => setShowEditModal(false)

  // Always return a Maker (no undefined) to satisfy MakerEdit prop type
  const getCurrentMaker = (): MakerFromMakerEdit => {
    const currentId = getFieldValue('primaryMakerId')
    const m = makerList.find((x) => x.id === currentId)
    return {
      id: m?.id ?? '',
      firstName: m?.firstName ?? '',
      lastName: m?.lastName ?? '',
      nationality: m?.nationality ?? null,
      birthYear: m?.birthYear ?? null,
      deathYear: m?.deathYear ?? null,
      wikiUrl: m?.wikiUrl ?? null,
    }
  }

  const addMaker = (maker: Maker): void => {
    setMakerList((c) => [...c, maker])
    setFieldsValue({ primaryMakerId: maker.id })
  }

  // Accept wider Maker from MakerEdit, normalize to local Maker
  const editMakerFromModal = (m: MakerFromMakerEdit): void => {
    const normalized: Maker = {
      id: m.id,
      firstName: m.firstName ?? '',
      lastName: m.lastName ?? '',
      nationality: m.nationality ?? null,
      birthYear: m.birthYear ?? null,
      deathYear: m.deathYear ?? null,
      wikiUrl: m.wikiUrl ?? null,
    }
    setMakerList((c) => c.map((x) => (x.id === normalized.id ? { ...x, ...normalized } : x)))
    setFieldsValue({ primaryMakerId: normalized.id })
  }

  return (
    <>
      <FormCol>
        <CustomFormItem label="Sculpture name" hasFeedback>
          {getFieldDecorator('name', {
            rules: [
              { required: true, whitespace: true, message: 'Please fill in the sculpture name!' },
            ],
            initialValue: name,
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
              { required: true, whitespace: true, message: 'Please fill in the unique accession ID!' },
            ],
            initialValue: accessionId,
          })(
            <Input
              prefix={<Icon type="number" style={{ color: 'rgba(0,0,0,.25)' }} />}
              type="text"
              placeholder="Accession ID"
              readOnly
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Primary maker" hasFeedback>
          {getFieldDecorator('primaryMakerId', {
            rules: [{ required: true, whitespace: true, message: 'Please fill in the primary maker!' }],
            initialValue: primaryMakerId,
          })(
            <div style={{ display: 'flex', gap: 8 }}>
              <Select
                style={{ flex: 1 }}
                placeholder="Primary maker"
                dropdownRender={(menu) => (
                  <div>
                    {menu}
                    <Divider style={{ margin: '4px 0' }} />
                    <div
                      style={{ padding: '8px', cursor: 'pointer' }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={openCreateModal}
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
              </Select>

              <Button onClick={openEditModal}>Edit</Button>
            </div>,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Production date" hasFeedback>
          {getFieldDecorator('productionDate', { initialValue: productionDate })(
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
          {getFieldDecorator('material', { initialValue: material })(
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
          {getFieldDecorator('creditLine', { initialValue: creditLine })(
            <TextArea
              placeholder="Credit line"
              autoSize={{ minRows: 3, maxRows: 5 }}
              style={{ marginTop: 5 }}
            />,
          )}
        </CustomFormItem>
      </FormCol>

      <FormCol>
        <CustomFormItem label="Location details" hasFeedback>
          {getFieldDecorator('locationNotes', { initialValue: locationNotes })(
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
            initialValue: latitude != null ? String(latitude) : undefined,
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
            initialValue: longitude != null ? String(longitude) : undefined,
          })(
            <Input
              prefix={<Icon type="compass" style={{ color: 'rgba(0,0,0,25)' }} />}
              type="text"
              placeholder="Longitude"
            />,
          )}
        </CustomFormItem>
      </FormCol>

      {/* Modals */}
      <MakerCreate visible={showCreateModal} handleCancel={closeCreateModal} addMaker={addMaker} />
      <MakerEdit
        visible={showEditModal}
        handleCancel={closeEditModal}
        getCurrentMaker={getCurrentMaker}
        editMaker={editMakerFromModal}
      />
    </>
  )
}
