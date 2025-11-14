'use client'

import React, { Suspense, useEffect, useState } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import { Row, Col, Card, Spin } from 'antd'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  ResponsiveContainer,
} from 'recharts'
import api from '@/api'

export default function PageWrapper() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <>
        <Content />
      </>
    </Suspense>
  )
}

function Content() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/impact/sustainability/dashboard')
        setStats(res ?? {})
      } catch (err) {
        console.error('Sustainability dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  const COLORS = ['#4e91ff', '#34c759', '#ff9f0a', '#ff375f', '#af52de']

  return (
    <>
      <Head>
        <title>KeenKonnect – Sustainability Dashboard</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Sustainability Dashboard
      </h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Total Impact Reports">
            <div style={{ fontSize: 32, fontWeight: 700 }}>
              {stats?.total_reports ?? 0}
            </div>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Impact Category Distribution">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={stats?.distribution ?? []}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                >
                  {(stats?.distribution ?? []).map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </>
  )
}
