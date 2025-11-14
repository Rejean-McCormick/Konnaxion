'use client'

import React, { Suspense, useState, useEffect, useMemo } from 'react'
import Head from 'next/head'
import { Row, Col, Card, DatePicker, Select, Spin } from 'antd'
import { PieChart, Pie, Cell, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts'
import api from '@/api'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

type ImpactItem = {
  category: string
  value: number
}

type Filters = {
  from: string
  to: string
  team?: string
}

export default function PageWrapper() {
  return (
    <Suspense fallback={<Spin style={{ marginTop: 40 }} />}>
      <Content />
    </Suspense>
  )
}

function Content(): JSX.Element {
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<Filters>({
    from: dayjs().subtract(7, 'days').format('YYYY-MM-DD'),
    to: dayjs().format('YYYY-MM-DD'),
    team: undefined,
  })

  const [impactData, setImpactData] = useState<ImpactItem[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<ImpactItem[]>('/impact/sustainability/track', {
          params: {
            fromDate: filters.from,
            toDate: filters.to,
            team: filters.team,
          },
        })
        setImpactData(res ?? [])
      } catch (err) {
        console.error('Track impact load error:', err)
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [filters])

  const COLORS = ['#3f87ff', '#34c759', '#ff9f0a', '#ff375f', '#af52de']

  const chartData = useMemo(
    () =>
      impactData.map((item) => ({
        name: item.category,
        value: item.value,
      })),
    [impactData],
  )

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
                // range: [Dayjs | null, Dayjs | null] | null
                if (!range || !range[0] || !range[1]) return
                const [start, end] = range
                setFilters((f) => ({
                  ...f,
                  from: start.format('YYYY-MM-DD'),
                  to: end.format('YYYY-MM-DD'),
                }))
              }}
            />
          </Col>

          <Col xs={24} md={12}>
            <Select
              placeholder="Filter by team"
              style={{ width: '100%' }}
              allowClear
              onChange={(v) =>
                setFilters((f) => ({
                  ...f,
                  team: v || undefined,
                }))
              }
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
              {chartData.map((_, i) => (
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
