'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import MainLayout from '@/components/layout-components/MainLayout'
import Head from 'next/head'
import { Row, Col, Card, DatePicker, Select, Spin } from 'antd'
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts'
import api from '@/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

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
  const [filters, setFilters] = useState({
    from: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
    team: undefined as string | undefined,
  })

  const [impactData, setImpactData] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/impact/sustainability/track', {
          params: {
            fromDate: filters.from,
            toDate: filters.to,
            team: filters.team,
          },
        })
        setImpactData(res || [])
      } catch (err) {
        console.error('Track impact load error:', err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [filters])

  const COLORS = ['#3f87ff', '#34c759', '#ff9f0a', '#ff375f', '#af52de']

  const chartData = useMemo(() => {
    if (!impactData || !impactData.length) return []
    return impactData.map((item: any) => ({
      name: item.category,
      value: item.value,
    }))
  }, [impactData])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 40 }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>KeenKonnect – Track Project Impact</title>
      </Head>

      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24 }}>
        Track Project Impact
      </h1>

      <Card style={{ marginBottom: 24 }}>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <RangePicker
              defaultValue={[dayjs(filters.from), dayjs(filters.to)]}
              style={{ width: '100%' }}
              onChange={(range) => {
                if (!range) return
                setFilters((f) => ({
                  ...f,
                  from: range[0].format('YYYY-MM-DD'),
                  to: range[1].format('YYYY-MM-DD'),
                }))
              }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Select
              placeholder="Filter by team"
              style={{ width: '100%' }}
              allowClear
              onChange={(v) => setFilters((f) => ({ ...f, team: v || undefined }))}
              options={[
                { label: 'Team A', value: 'team-a' },
                { label: 'Team B', value: 'team-b' },
                { label: 'Team C', value: 'team-c' },
              ]}
            />
          </Col>
        </Row>
      </Card>

      <Card>
        <ResponsiveContainer width="100%" height={340}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
            >
              {chartData.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <ReTooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </>
  )
}
