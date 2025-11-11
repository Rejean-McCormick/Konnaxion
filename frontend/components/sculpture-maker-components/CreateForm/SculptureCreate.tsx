'use client'

/**
 * Description: Component for Sculpture create page
 * Author: Hieu Chu
 */

import React, { useState, useEffect } from 'react'
import { Row, Button, Form, message as antdMessage } from 'antd'
import { ColStyled, CardStyled, FormCol, CustomFormItem } from '../style'
import { FlyToInterpolator } from 'react-map-gl'
import Map from '../../map-components'
import TextFields from './CreateFormTextFields'
import { api } from '../../../shared/api'
import Loading from '../../Loading'
import Error from 'next/error'
import { normalizeError } from '../../../shared/errors'

type ErrState = { message: string; statusCode?: number } | null

// Typages minimaux pour l’API legacy d’antd v3 afin d’éviter 'any' non contrôlés.
type LegacyForm = {
  getFieldDecorator: (name: string, options?: any) => (node: React.ReactNode) => React.ReactNode
  setFieldsValue: (values: Record<string, any>) => void
  validateFields: (...args: any[]) => any
}

type Maker = {
  id: string | number
  firstName?: string
  lastName?: string
}

type ViewState = {
  latitude: number
  longitude: number
  zoom: number
  pitch: number
  transitionInterpolator?: any
  transitionDuration?: number
}

type MarkerState = {
  markerLat: number
  markerLng: number
}

type SculptureCreateProps = {
  form: LegacyForm
  setStep: React.Dispatch<React.SetStateAction<number>>
  setSculpture: React.Dispatch<React.SetStateAction<Record<string, any>>>
}

const SculptureCreate: React.FC<SculptureCreateProps> = ({
  form,
  form: { getFieldDecorator, setFieldsValue },
  setStep,
  setSculpture
}) => {
  const [view, setView] = useState<ViewState>({
    latitude: -34.40581053569814,
    longitude: 150.87842788963476,
    zoom: 15,
    pitch: 50
  })

  const initialData: MarkerState = {
    markerLat: -34.40581053569814,
    markerLng: 150.87842788963476
  }

  const [marker, setMarker] = useState<MarkerState>({ ...initialData })
  const [makerList, setMakerList] = useState<Maker[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<ErrState>(null)

  const addMaker = (maker: Maker) => {
    setMakerList((prev) => [...prev, maker])
    setFieldsValue({ primaryMakerId: maker.id })
  }

  useEffect(() => {
    let mounted = true
    const fetchMakerList = async () => {
      try {
        const res = await api.get('/maker/')
        if (mounted) setMakerList((res as any)?.data ?? [])
      } catch (e: unknown) {
        const { message, statusCode } = normalizeError(e)
        if (mounted) setError({ statusCode, message })
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchMakerList()
    return () => {
      mounted = false
    }
  }, [])

  const flyTo = (latitude: number, longitude: number) => {
    setView((prev) => ({
      ...prev,
      latitude,
      longitude,
      transitionInterpolator: new FlyToInterpolator(),
      transitionDuration: 1500,
      zoom: 15
    }))
    setMarker({ markerLat: latitude, markerLng: longitude })
  }

  const showLocationOnMap = () => {
    form.validateFields(['latitude', 'longitude'], (errors: any, values: any) => {
      if (!errors) {
        const { latitude, longitude } = values as { latitude: string | number; longitude: string | number }
        flyTo(+latitude, +longitude)
      }
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    form.validateFields(async (err: any, values: Record<string, any>) => {
      if (!err) {
        // nettoie les champs vides
        Object.keys(values).forEach((k) => {
          if (!values[k]) delete values[k]
        })
        if (values.latitude) values.latitude = Number(values.latitude)
        if (values.longitude) values.longitude = Number(values.longitude)

        setSubmitting(true)
        try {
          await api.post('/sculpture', values)
          setSculpture({ ...values })
          setStep((s) => s + 1)
        } catch (e: unknown) {
          const { message } = normalizeError(e)
          antdMessage.error(message)
        } finally {
          setSubmitting(false)
        }
      }
    })
  }

  if (loading) return <Loading />
  if (error) return <Error statusCode={error.statusCode ?? 500} title={error.message} />

  return (
    <Row gutter={16}>
      <ColStyled xs={24}>
        <CardStyled title="Create new sculpture">
          <Form onSubmit={handleSubmit} autoComplete="off">
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
                setView={setView}
                setMarker={({ markerLat, markerLng }: { markerLat: number; markerLng: number }) => {
                  setMarker({ markerLat, markerLng })
                  setFieldsValue({
                    latitude: String(markerLat),
                    longitude: String(markerLng)
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

export default Form.create({
  name: 'sculpture_create_form'
})(SculptureCreate)
