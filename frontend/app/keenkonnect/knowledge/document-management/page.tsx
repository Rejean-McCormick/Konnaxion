'use client'

import React, { Suspense, useEffect, useState } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import { Card, Row, Col, List, Spin, Button } from 'antd'
import { EditOutlined } from '@ant-design/icons'
import api from '@/api'

export default function PageWrapper() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <MainLayout>
        <Content />
      </MainLayout>
    </Suspense>
  )
}

function Content() {
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/knowledge/documents')
        setDocs(res ?? [])
      } catch (err) {
        console.error('Document management load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>KeenKonnect – Document Management</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Document Management
      </h1>

      <Row gutter={[24, 24]}>
        {docs.map((doc) => (
          <Col xs={24} md={12} key={doc.id}>
            <Card
              title={doc.title}
              extra={<Button icon={<EditOutlined />}>Edit</Button>}
            >
              <p>{doc.description}</p>
              <p style={{ color: '#888' }}>
                Category: {doc.category || 'N/A'}
              </p>
              <p style={{ color: '#888' }}>
                Updated: {doc.updatedAt || 'N/A'}
              </p>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  )
}
