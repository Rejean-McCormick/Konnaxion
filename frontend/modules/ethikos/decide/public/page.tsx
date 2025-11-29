// FILE: frontend/modules/ethikos/decide/public/page.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { PageContainer, ProTable } from '@ant-design/pro-components'
import type { ProColumns } from '@ant-design/pro-components'
import { Select, Space, Input, Popconfirm, Progress, Radio, Slider } from 'antd'
import axios from 'axios'
import usePageTitle from '@/hooks/usePageTitle'

interface Category { id: number; name: string }
interface Format   { id: number; name: string }
interface PublicTopic {
  id: number
  question: string
  description?: string
  debatecategory_id: number
  responseformat_id: number
  turnout?: number
  options?: string[]
  scaleLabels?: string[]
}

export default function PublicVotePage(): JSX.Element {
  usePageTitle('Decide · Public Voting')

  const [categories, setCategories] = useState<Category[]>([])
  const [formats, setFormats]       = useState<Format[]>([])
  const [topicsData, setTopicsData] = useState<{ results: PublicTopic[]; count: number } | null>(null)
  const [activeCat, setActiveCat]   = useState<number | 'all'>('all')
  const [activeFormats, setActiveFormats] = useState<number[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [page, setPage]             = useState<number>(1)
  const pageSize = 20

  // 1) Load categories & formats
  useEffect(() => {
    axios
      .get<Category[]>('/api/home/debatecategory/', { params: { is_deleted: false } })
      .then(r => setCategories(r.data))
    axios
      .get<Format[]>('/api/home/responseformat/', { params: { is_deleted: false } })
      .then(r => setFormats(r.data))
  }, [])

  // 2) Load topics with filters & pagination
  useEffect(() => {
    axios
      .get<{ results: PublicTopic[]; count: number }>('/api/home/debatetopic/', {
        params: {
          is_active: true,
          is_deleted: false,
          debatecategory_id: activeCat === 'all' ? undefined : activeCat,
          responseformat_id: activeFormats,
          search: searchTerm,
          page,
          page_size: pageSize,
          ordering: '-created_at',
        },
      })
      .then(r => setTopicsData(r.data))
  }, [activeCat, activeFormats, searchTerm, page])

  // 3) Submit a vote and refresh
  const vote = async (row: PublicTopic, value: any) => {
    await axios.post('/api/home/publicvote/', { topic_id: row.id, value })
    // refresh current page
    axios
      .get<{ results: PublicTopic[]; count: number }>('/api/home/debatetopic/', {
        params: {
          is_active: true,
          is_deleted: false,
          debatecategory_id: activeCat === 'all' ? undefined : activeCat,
          responseformat_id: activeFormats,
          search: searchTerm,
          page,
          page_size: pageSize,
          ordering: '-created_at',
        },
      })
      .then(r => setTopicsData(r.data))
  }

  // 4) Render vote input based on format
  const renderVoteInput = (row: PublicTopic): React.ReactNode => {
    const handleChange = (e: any) => {
      const val = e?.target?.value ?? e
      vote(row, val)
    }

    switch (row.responseformat_id) {
      case 1: // binary (Yes/No)
        return (
          <Radio.Group
            options={(row.options ?? ['Yes', 'No']).map(v => ({ label: v, value: v }))}
            onChange={handleChange}
          />
        )

      case 2: // multiple choice (single-pick UI here; adapt if you support multi-pick)
        return (
          <Radio.Group
            options={(row.options ?? []).map(v => ({ label: v, value: v }))}
            onChange={handleChange}
          />
        )

      case 3: { // scale
        const labels = row.scaleLabels ?? ['1', '2', '3', '4', '5']
        const formatter: (v?: number) => React.ReactNode = (v) => {
          const i = Math.max(0, Math.min(labels.length - 1, Number(v ?? 0)))
          return labels[i]
        }
        return (
          <Space direction="vertical" size={4}>
            <Slider
              min={0}
              max={labels.length - 1}
              step={1}
              tooltip={{ formatter }}
              onAfterChange={handleChange}
            />
          </Space>
        )
      }

      default:
        return null
    }
  }

  // 5) Columns (typed; ProTable render signature respected)
  const columns: ProColumns<PublicTopic>[] = [
    { title: 'Question', dataIndex: 'question', width: 360, ellipsis: true },
    {
      title: 'Vote',
      key: 'vote',
      width: 360,
      search: false,
      render: (_dom, row) => (
        <Popconfirm title="Confirm your vote?" onConfirm={() => {}}>
          {renderVoteInput(row)}
        </Popconfirm>
      ),
    },
    {
      title: 'Turnout',
      dataIndex: 'turnout',
      align: 'center',
      width: 160,
      render: (_dom, row) => <Progress percent={row.turnout ?? 0} size="small" />,
    },
  ]

  return (
    <PageContainer ghost>
      <Space wrap style={{ marginBottom: 16 }}>
        <Select
          placeholder="Catégorie"
          allowClear
          value={activeCat}
          onChange={(val) => { setActiveCat((val ?? 'all') as any); setPage(1) }}
          style={{ width: 200 }}
          options={[
            { label: 'All', value: 'all' as const },
            ...categories.map(c => ({ label: c.name, value: c.id })),
          ]}
        />
        <Select
          mode="multiple"
          placeholder="Formats"
          value={activeFormats}
          onChange={(val: number[]) => { setActiveFormats(val); setPage(1) }}
          style={{ width: 200 }}
          options={formats.map(f => ({ label: f.name, value: f.id }))}
        />
        <Input.Search
          placeholder="Rechercher…"
          onSearch={val => { setSearchTerm(val); setPage(1) }}
          style={{ width: 260 }}
          allowClear
        />
      </Space>

      <ProTable<PublicTopic>
        rowKey="id"
        columns={columns}
        dataSource={topicsData?.results ?? []}
        pagination={{
          total: topicsData?.count ?? 0,
          current: page,
          pageSize,
          onChange: setPage,
          showSizeChanger: false,
        }}
        search={false}
        options={false}
        toolBarRender={false}
      />
    </PageContainer>
  )
}
