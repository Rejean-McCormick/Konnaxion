'use client'

/**
 * Description: Component for Sculpture create page (migrated to AntD v5 form API)
 * Changes:
 *  - Drop Form.create/getFieldDecorator at the page level
 *  - Use Form.useForm() + onFinish
 *  - Provide a minimal getFieldDecorator-compat shim for TextFields
 *  - Remove FlyToInterpolator dependency
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Row, Button, Form, message as antdMessage } from 'antd'
import { ColStyled, CardStyled, FormCol, CustomFormItem } from '../style'
import Map from '../../map-components'
import TextFields from './CreateFormTextFields'
import { api } from '../../../shared/api'
import Loading from '../../Loading'
import Error from 'next/error'
import { normalizeError } from '../../../shared/errors'

type ErrState = { message: string; statusCode?: number } | null

type ViewShape = {
  latitude: number
  longitude: number
  zoom: number
  pitch?: number
  bearing?: number
  padding?: { top: number; bottom: number; left: number; right: number }
}

type MarkerState = { markerLat: number; markerLng: number }

export default function SculptureCreate({
  setStep,
  setSculpture,
}: {
  setStep: React.Dispatch<React.SetStateAction<number>>
  setSculpture: React.Dispatch<React.SetStateAction<Record<string, any>>>
}) {
  const [form] = Form.useForm()

  // map state
  const [view, setView] = useState<ViewShape>({
    latitude: -34.40581053569814,
    longitude: 150.87842788963476,
    zoom: 15,
    pitch: 50,
    bearing: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  })

  const initialData = useMemo<MarkerState>(() => ({
    markerLat: -34.40581053569814,
    markerLng: 150.87842788963476,
  }), [])

  const [marker, setMarker] = useState<MarkerState>(initialData)
  const [makerList, setMakerList] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ErrState>(null)

  const addMaker = (maker: any) => {
    setMakerList(prev => [...prev, maker])
    form.setFieldsValue({ primaryMakerId: maker.id })
  }

  useEffect(() => {
    let mounted = true
    const fetchMakerList = async () => {
      try {
        // axios helper in your codebase typically returns raw data (no `.data`)
        const res: any = await api.get('/maker/')
        if (mounted) setMakerList(Array.isArray(res) ? res : (res?.data ?? []))
      } catch (e: unknown) {
        const { message, statusCode } = normalizeError(e)
        if (mounted) setError({ statusCode, message })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchMakerList()
    return () => { mounted = false }
  }, [])

  // remove FlyToInterpolator usage; simple state update is enough
  const flyTo = (latitude: number, longitude: number) => {
    setView(prev => ({
      ...prev,
      latitude,
      longitude,
      zoom: 15,
    }))
    setMarker({ markerLat: latitude, markerLng: longitude })
  }

  const showLocationOnMap = async () => {
    try {
      const { latitude, longitude } = await form.validateFields(['latitude', 'longitude']) as any
      flyTo(Number(latitude), Number(longitude))
    } catch {
      // validation errors are shown by antd
    }
  }

  const onFinish = async (raw: Record<string, any>) => {
    // prune empties and convert coordinates
    const values: Record<string, any> = {}
    Object.keys(raw).forEach(k => {
      const v = raw[k]
      if (v !== undefined && v !== null && String(v).trim() !== '') values[k] = v
    })
    if (values.latitude) values.latitude = Number(values.latitude)
    if (values.longitude) values.longitude = Number(values.longitude)

    setSubmitting(true)
    try {
      await api.post('/sculpture', values)
      setSculpture({ ...values })
      setStep(s => s + 1)
    } catch (e: unknown) {
      const { message } = normalizeError(e)
      antdMessage.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  // Map component expects: setView: (v: ViewInput) => void
  const applyViewFromMap = useCallback((v: ViewShape) => {
    setView(prev => ({ ...prev, ...v }))
  }, [])

  // getFieldDecorator compatibility shim for TextFields:
  // wraps child control in a noStyle Form.Item to register it without nesting layout
  const getFieldDecorator = useCallback(
    (name: string, options?: { rules?: any[]; initialValue?: any; valuePropName?: string }) =>
      (node: React.ReactNode) => (
        <Form.Item
          noStyle
          name={name}
          rules={options?.rules}
          initialValue={options?.initialValue}
          valuePropName={options?.valuePropName}
        >
          {node}
        </Form.Item>
      ),
    [],
  )

  if (loading) return <Loading />
  if (error) return <Error statusCode={error.statusCode ?? 500} title={error.message} />

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <CardStyled title="Create new sculpture">
          <Form form={form} autoComplete="off" onFinish={onFinish}>
            <ColStyled xs={24} md={12}>
              <TextFields
                getFieldDecorator={getFieldDecorator}
                initialData={initialData}
                makerList={makerList}
                addMaker={addMaker}
              />
              <FormCol xs={24}>
                <Button onClick={showLocationOnMap}>Show on map</Button>
              </FormCol>
            </ColStyled>

            <ColStyled xs={24} md={12} style={{ height: 500, marginTop: 10 }}>
              <Map
                view={view}
                marker={marker}
                setView={applyViewFromMap}
                setMarker={({ markerLat, markerLng }) => {
                  setMarker({ markerLat, markerLng })
                  form.setFieldsValue({
                    latitude: String(markerLat),
                    longitude: String(markerLng),
                  })
                }}
              />
            </ColStyled>

            <ColStyled xs={24}>
              <FormCol xs={24}>
                <CustomFormItem style={{ marginBottom: 0, marginTop: 8 }}>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    Submit
                  </Button>
                </CustomFormItem>
              </FormCol>
            </ColStyled>
          </Form>
        </CardStyled>
      </ColStyled>
    </Row>
  )
}
