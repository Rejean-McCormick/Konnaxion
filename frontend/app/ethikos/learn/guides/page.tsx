'use client'

import { useMemo, useState } from 'react'
import { PageContainer, ProCard } from '@ant-design/pro-components'
import { Anchor, Typography, Input, Empty } from 'antd'
import { useRequest } from 'ahooks'
import usePageTitle from '@/hooks/usePageTitle'
import { fetchGuides } from '@/services/learn'

type GuideSection = {
  id: string
  title: string
  content: string
}

export default function Guides() {
  usePageTitle('Learn · Guides')

  const { data, loading } = useRequest(fetchGuides)
  const [query, setQuery] = useState('')

  const sections: GuideSection[] = (data?.sections ?? []) as GuideSection[]

  const filteredSections = useMemo(() => {
    if (!query.trim()) return sections
    const q = query.toLowerCase()
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.content.toLowerCase().includes(q),
    )
  }, [sections, query])

  const anchorItems = filteredSections.map((s) => ({
    key: s.id,
    href: `#${s.id}`,
    title: s.title,
  }))

  return (
    <PageContainer ghost loading={loading}>
      <ProCard split="vertical" ghost>
        <ProCard
          colSpan={{ xs: 24, sm: 24, md: 7, lg: 6, xl: 5 }}
          title="Navigate guides"
        >
          <Typography.Paragraph type="secondary">
            Short, opinionated walkthroughs on how to use ethiKos: when to
            launch a debate, choose Elite vs Public, and how decisions flow
            into analytics and impact tracking.
          </Typography.Paragraph>

          <Input.Search
            placeholder="Filter guides…"
            allowClear
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: 16 }}
          />

          <Anchor
            affix={false}
            items={anchorItems}
            style={{ maxHeight: 360, overflow: 'auto' }}
          />

          <Typography.Paragraph
            type="secondary"
            style={{ marginTop: 16, marginBottom: 0 }}
          >
            {filteredSections.length} guide
            {filteredSections.length === 1 ? '' : 's'} available.
          </Typography.Paragraph>
        </ProCard>

        <ProCard
          colSpan={{ xs: 24, sm: 24, md: 17, lg: 18, xl: 19 }}
          title="Guided flows"
        >
          {filteredSections.length === 0 ? (
            <Empty description="No guides match your query." />
          ) : (
            filteredSections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                style={{ marginBottom: 32 }}
              >
                <Typography.Title level={3} style={{ marginTop: 0 }}>
                  {s.title}
                </Typography.Title>
                <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>
                  {s.content}
                </Typography.Paragraph>
              </section>
            ))
          )}
        </ProCard>
      </ProCard>
    </PageContainer>
  )
}
