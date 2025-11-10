// C:\MyCode\Konnaxionv14\frontend\app\keenkonnect\knowledge\search-filter-documents\page.tsx

'use client'

import React, { useMemo, useState } from 'react'
import { Form, Input, Select, DatePicker, Button, Table, Row, Col, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { RangePicker } = DatePicker

interface DocumentResource {
  key: string
  title: string
  snippet: string
  author: string
  tags: string[]
  language: string
  version: string
  lastUpdated: string // ISO date
  relevanceScore: number
}

type DateRange = [dayjs.Dayjs | null, dayjs.Dayjs | null] | null

// Demo data
const sampleDocuments: DocumentResource[] = [
  {
    key: '1',
    title: 'Robotics Blueprint',
    snippet: 'Detailed blueprint for advanced robotics design...',
    author: 'Alice',
    tags: ['Robotics', 'Engineering'],
    language: 'English',
    version: '1.0',
    lastUpdated: '2023-09-01',
    relevanceScore: 85,
  },
  {
    key: '2',
    title: 'Healthcare Protocols',
    snippet: 'Updated protocols for modern healthcare systems...',
    author: 'Bob',
    tags: ['Healthcare', 'Medicine'],
    language: 'French',
    version: '2.1',
    lastUpdated: '2023-08-28',
    relevanceScore: 78,
  },
  {
    key: '3',
    title: 'AI Research Paper',
    snippet: 'A research paper discussing the latest trends in AI...',
    author: 'Charlie',
    tags: ['Technology', 'AI'],
    language: 'English',
    version: '1.2',
    lastUpdated: '2023-09-03',
    relevanceScore: 90,
  },
  {
    key: '4',
    title: 'Sustainable Energy Report',
    snippet: 'Comprehensive report on sustainable energy solutions...',
    author: 'Diana',
    tags: ['Energy', 'Environment'],
    language: 'English',
    version: '3.0',
    lastUpdated: '2023-08-20',
    relevanceScore: 80,
  },
]

export default function SearchFilterDocuments() {
  const [form] = Form.useForm()

  const [keyword, setKeyword] = useState<string>('')
  const [authorFilter, setAuthorFilter] = useState<string[]>([])
  const [tagFilter, setTagFilter] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<DateRange>(null)
  const [sortCriteria, setSortCriteria] = useState<'relevance' | 'date' | 'popularity'>('relevance')

  const filteredDocuments = useMemo(() => {
    return sampleDocuments.filter((doc) => {
      const matchesKeyword =
        !keyword ||
        doc.title.toLowerCase().includes(keyword.toLowerCase()) ||
        doc.snippet.toLowerCase().includes(keyword.toLowerCase())

      const matchesAuthor = authorFilter.length === 0 || authorFilter.includes(doc.author)

      const matchesTags = tagFilter.length === 0 || tagFilter.every((t) => doc.tags.includes(t))

      let matchesDate = true
      if (dateRange && dateRange[0] && dateRange[1]) {
        const docDate = dayjs(doc.lastUpdated)
        matchesDate = docDate.isAfter(dateRange[0]) && docDate.isBefore(dateRange[1])
      }

      return matchesKeyword && matchesAuthor && matchesTags && matchesDate
    })
  }, [keyword, authorFilter, tagFilter, dateRange])

  const sortedDocuments = useMemo(() => {
    const docs = [...filteredDocuments]
    if (sortCriteria === 'relevance') {
      docs.sort((a, b) => b.relevanceScore - a.relevanceScore)
    } else if (sortCriteria === 'date') {
      docs.sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    } else if (sortCriteria === 'popularity') {
      // placeholder: implement when a popularity metric exists
    }
    return docs
  }, [filteredDocuments, sortCriteria])

  const columns: ColumnsType<DocumentResource> = [
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Snippet', dataIndex: 'snippet', key: 'snippet' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Language', dataIndex: 'language', key: 'language' },
    { title: 'Version', dataIndex: 'version', key: 'version' },
    { title: 'Last Updated', dataIndex: 'lastUpdated', key: 'lastUpdated' },
    { title: 'Relevance', dataIndex: 'relevanceScore', key: 'relevanceScore' },
  ]

  return (
    <div className="container mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Search &amp; Filter Documents</h1>

      <Card className="mb-6">
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item label="Keywords">
                <Input.Search
                  placeholder="Enter keywords"
                  allowClear
                  onSearch={(v) => setKeyword(v)}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Authors">
                <Select
                  mode="multiple"
                  placeholder="Select authors"
                  value={authorFilter}
                  onChange={setAuthorFilter}
                  options={['Alice', 'Bob', 'Charlie', 'Diana'].map((a) => ({
                    value: a,
                    label: a,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Tags">
                <Select
                  mode="multiple"
                  placeholder="Select tags"
                  value={tagFilter}
                  onChange={setTagFilter}
                  options={['Robotics', 'Healthcare', 'Technology', 'Energy', 'Environment'].map(
                    (t) => ({ value: t, label: t }),
                  )}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Date Range">
                <RangePicker onChange={(dates) => setDateRange(dates)} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item label="Sort By">
                <Select
                  value={sortCriteria}
                  onChange={(v) => setSortCriteria(v)}
                  options={[
                    { value: 'relevance', label: 'Relevance' },
                    { value: 'date', label: 'Date' },
                    { value: 'popularity', label: 'Popularity' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12}>
              <Form.Item>
                <Button type="primary" onClick={() => form.submit()}>
                  Apply Filters
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card>
        <Table<DocumentResource>
          rowKey="key"
          columns={columns}
          dataSource={sortedDocuments}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  )
}
