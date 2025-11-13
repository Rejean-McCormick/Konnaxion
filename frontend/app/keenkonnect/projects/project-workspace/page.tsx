'use client'

import React, { Suspense, useEffect, useState } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import { Card, Row, Col, Spin, List } from 'antd'
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
  const [workspace, setWorkspace] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/projects/workspace')
        setWorkspace(res)
      } catch (err) {
        console.error('Workspace load error:', err)
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
        <title>KeenKonnect – Project Workspace</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Project Workspace
      </h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={16}>
          <Card title="Tasks">
            <List
              dataSource={workspace?.tasks ?? []}
              renderItem={(item: any) => (
                <List.Item>
                  <div>{item.title}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card title="Team Members">
            <List
              dataSource={workspace?.members ?? []}
              renderItem={(item: any) => (
                <List.Item>
                  <div>{item.name}</div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  )
}
