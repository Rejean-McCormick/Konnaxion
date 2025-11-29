// FILE: frontend/app/ethikos/learn/guides/page.tsx
'use client'

/**
 * Ethikos · Learn · Guides
 *
 * References:
 * - Baseline page implementation from the app dump.
 * - Data service: services/learn.ts (fetchGuides).
 */

import { useMemo, useState } from 'react'
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components'
import { Pie } from '@ant-design/plots'
import {
  Anchor,
  Typography,
  Input,
  Empty,
  Button,
  Space,
  Tag,
  FloatButton,
} from 'antd'
import { LinkOutlined, SyncOutlined, ReadOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import EthikosPageShell from '../../EthikosPageShell'
import { fetchGuides } from '@/services/learn'

type GuideSection = {
  id: string
  title: string
  content: string
}

function wordsOf(text: string) {
  if (!text) return 0
  const m = text.trim().match(/\S+/g)
  return m ? m.length : 0
}

export default function Guides() {
  const { data, loading, error, refresh } = useRequest(fetchGuides)
  const [query, setQuery] = useState('')

  const sections: GuideSection[] = (data?.sections ?? []) as GuideSection[]

  const computed = useMemo(() => {
    const q = query.trim().toLowerCase()

    const enriched = sections.map((s) => {
      const wc = wordsOf(s.content)
      const minutes = Math.max(1, Math.round(wc / 220)) // ~220 wpm
      return { ...s, wc, minutes }
    })

    const filtered = q
      ? enriched.filter(
          (s) =>
            s.title.toLowerCase().includes(q) ||
            s.content.toLowerCase().includes(q),
        )
      : enriched

    const totals = filtered.reduce(
      (acc, s) => {
        acc.words += s.wc
        acc.minutes += s.minutes
        return acc
      },
      { words: 0, minutes: 0 },
    )

    const pieData = filtered.map((s) => ({
      type: s.title,
      value: s.wc || 1,
    }))

    const anchorItems = filtered.map((s) => ({
      key: s.id,
      href: `#${s.id}`,
      title: s.title,
    }))

    return { filtered, totals, pieData, anchorItems }
  }, [sections, query])

  const shellProps = {
    title: 'Guides',
    sectionLabel: 'Learn',
  } as const

  /* ---------- error state ---------- */
  if (error) {
    return (
      <EthikosPageShell {...shellProps}>
        <PageContainer ghost>
          <Empty
            description="Failed to load guides"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button icon={<SyncOutlined />} onClick={refresh} type="primary">
              Retry
            </Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    )
  }

  const pieConfig = {
    data: computed.pieData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    legend: false as const,
    label: { type: 'inner', offset: '-30%', content: '' },
    interactions: [{ type: 'element-active' }],
  }

  return (
    <EthikosPageShell {...shellProps}>
      <PageContainer
        ghost
        loading={loading}
        extra={
          <Space size="large">
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Guides</Typography.Text>
              <Typography.Text strong>{sections.length}</Typography.Text>
            </Space>
            <Space direction="vertical" size={0}>
              <Typography.Text type="secondary">Est. reading</Typography.Text>
              <Typography.Text strong>
                {computed.totals.minutes} min
              </Typography.Text>
            </Space>
          </Space>
        }
      >
        {/* Overview stats */}
        <ProCard gutter={16} wrap style={{ marginBottom: 16 }}>
          <StatisticCard
            statistic={{
              title: 'Total guides',
              value: sections.length,
              icon: <ReadOutlined />,
            }}
          />
          <StatisticCard
            statistic={{
              title: 'Words (filtered)',
              value: computed.totals.words,
            }}
          />
          <StatisticCard
            statistic={{
              title: 'Est. read time',
              value: computed.totals.minutes,
              suffix: 'min',
            }}
          />
          <ProCard colSpan="100%" ghost />
        </ProCard>

        <ProCard split="vertical" ghost>
          {/* Left: Navigation & search */}
          <ProCard
            colSpan={{ xs: 24, sm: 24, md: 7, lg: 6, xl: 6 }}
            title="Navigate guides"
          >
            <Typography.Paragraph type="secondary">
              Practical walkthroughs for using ethiKos: when to launch a debate,
              choosing Elite vs Public, and how outcomes flow into impact.
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
              items={computed.anchorItems}
              style={{ maxHeight: 360, overflow: 'auto' }}
            />

            <Typography.Paragraph
              type="secondary"
              style={{ marginTop: 16, marginBottom: 0 }}
            >
              {computed.filtered.length} guide
              {computed.filtered.length === 1 ? '' : 's'} match your filter.
            </Typography.Paragraph>
          </ProCard>

          {/* Right: Content + mini chart */}
          <ProCard
            colSpan={{ xs: 24, sm: 24, md: 17, lg: 18, xl: 18 }}
            title="Guided flows"
          >
            {computed.filtered.length === 0 ? (
              <Empty description="No guides match your query." />
            ) : (
              <>
                {/* Mini chart to visualize section sizes */}
                <ProCard
                  ghost
                  style={{ marginBottom: 16 }}
                  title="Guide size breakdown"
                >
                  <Pie {...pieConfig} />
                </ProCard>

                {computed.filtered.map((s) => (
                  <section key={s.id} id={s.id} style={{ marginBottom: 32 }}>
                    <Space align="baseline" size="middle">
                      <Typography.Title level={3} style={{ marginTop: 0 }}>
                        {s.title}
                      </Typography.Title>
                      <Tag>{s.minutes} min</Tag>
                      <Button
                        type="text"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() => {
                          const url = `${location.pathname}#${s.id}`
                          navigator.clipboard?.writeText(url)
                        }}
                      >
                        Copy link
                      </Button>
                    </Space>
                    <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>
                      {s.content}
                    </Typography.Paragraph>
                  </section>
                ))}
              </>
            )}
          </ProCard>
        </ProCard>

        <FloatButton.BackTop visibilityHeight={240} />
      </PageContainer>
    </EthikosPageShell>
  )
}
