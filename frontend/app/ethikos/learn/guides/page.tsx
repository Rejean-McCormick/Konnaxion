// FILE: frontend/app/ethikos/learn/guides/page.tsx
'use client'

import TranslatedText from '@/components/i18n/TranslatedText';
import { useLanguage } from '@/context/LanguageContext';
import { LinkOutlined, ReadOutlined, SyncOutlined } from '@ant-design/icons'
import { Pie } from '@ant-design/plots'
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import {
  Anchor,
  Button,
  Empty,
  FloatButton,
  Input,
  message,
  Space,
  Tag,
  Typography,
} from 'antd'
import { useMemo, useState } from 'react'

import EthikosPageShell from '@/app/ethikos/EthikosPageShell'
import { fetchGuides, type GuideSection } from '@/services/learn'

type GuidesPayload = {
  sections: GuideSection[]
}

type EnrichedGuideSection = GuideSection & {
  wc: number
  minutes: number
}

type PieDatum = {
  type: string
  value: number
}

function wordsOf(text: string): number {
  if (!text) {
    return 0
  }

  const matches = text.trim().match(/\S+/g)

  return matches ? matches.length : 0
}

async function copySectionLink(id: string): Promise<void> {
  const hash = `#${id}`
  const absoluteUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}${hash}`
      : hash

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(absoluteUrl)
      message.success(<TranslatedText id="ui.ethikos.learn.guides.sectionLinkCopied" />)
      return
    }

    message.info(<TranslatedText id="ui.ethikos.learn.guides.clipboardIsNotAvailableInThisBrowser" />)
  } catch {
    message.error(<TranslatedText id="ui.ethikos.learn.guides.unableToCopyTheSectionLink" />)
  }
}

export default function Guides(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [query, setQuery] = useState('')

  const { data, loading, error, refresh } = useRequest<GuidesPayload, []>(
    fetchGuides,
  )

  const sections = data?.sections ?? []

  const computed = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const enriched: EnrichedGuideSection[] = sections.map((section) => {
      const wc = wordsOf(section.content)
      const minutes = Math.max(1, Math.round(wc / 220))

      return {
        ...section,
        wc,
        minutes,
      }
    })

    const filtered = normalizedQuery
      ? enriched.filter((section) => {
          const title = section.title.toLowerCase()
          const content = section.content.toLowerCase()

          return (
            title.includes(normalizedQuery) ||
            content.includes(normalizedQuery)
          )
        })
      : enriched

    const totals = filtered.reduce(
      (acc, section) => {
        acc.words += section.wc
        acc.minutes += section.minutes
        return acc
      },
      { words: 0, minutes: 0 },
    )

    const pieData: PieDatum[] = filtered.map((section) => ({
      type: section.title,
      value: section.wc || 1,
    }))

    const anchorItems = filtered.map((section) => ({
      key: section.id,
      href: `#${section.id}`,
      title: section.title,
    }))

    return {
      filtered,
      totals,
      pieData,
      anchorItems,
    }
  }, [sections, query])

  const pieConfig = useMemo(
    () => ({
      data: computed.pieData,
      angleField: 'value',
      colorField: 'type',
      radius: 0.8,
      label: {
        text: i18nT("ui.ethikos.learn.guides.type"),
        position: 'outside' as const,
      },
      legend: {
        color: {
          position: 'bottom' as const,
        },
      },
    }),
    [computed.pieData, i18nT],
  )

  const shellProps = {
    title: i18nT("ui.ethikos.learn.guides.guides"),
    sectionLabel: i18nT("ui.ethikos.learn.guides.learn"),
    subtitle:
      i18nT("ui.ethikos.learn.guides.practicalWalkthroughsForUsingEthikosWhenTo"),
  } as const

  if (error) {
    return (
      <EthikosPageShell {...shellProps}>
        <PageContainer ghost>
          <Empty
            description={i18nT("ui.ethikos.learn.guides.failedToLoadGuides")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button
              type="primary"
              icon={<SyncOutlined />}
              onClick={() => refresh()}
            >
              {i18nT("ui.ethikos.learn.guides.retry")}
            </Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    )
  }

  const headerStats = (
    <Space wrap>
      <Tag icon={<ReadOutlined />}>{sections.length} {i18nT("ui.ethikos.learn.guides.sections")}</Tag>
      <Tag>{computed.totals.words} {i18nT("ui.ethikos.learn.guides.words")}</Tag>
      <Tag>{computed.totals.minutes} {i18nT("ui.ethikos.learn.guides.minReading")}</Tag>
    </Space>
  )

  return (
    <EthikosPageShell {...shellProps} secondaryActions={headerStats}>
      <PageContainer ghost loading={loading}>
        <ProCard gutter={16} wrap>
          <ProCard
            colSpan={{ xs: 24, sm: 24, md: 7, lg: 6, xl: 6 }}
            title={i18nT("ui.ethikos.learn.guides.navigateGuides")}
          >
            <Input.Search
              placeholder={i18nT("ui.ethikos.learn.guides.filterGuides")}
              allowClear
              value={query}
              onChange={(event) => setQuery(event.target.value)}
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
              {computed.filtered.length} {i18nT("ui.ethikos.learn.guides.guide")}
              {computed.filtered.length === 1 ? '' : 's'} {i18nT("ui.ethikos.learn.guides.matchYourFilter")}
            </Typography.Paragraph>
          </ProCard>

          <ProCard
            colSpan={{ xs: 24, sm: 24, md: 17, lg: 18, xl: 18 }}
            title={i18nT("ui.ethikos.learn.guides.guidedFlows")}
          >
            <StatisticCard.Group style={{ marginBottom: 16 }}>
              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.learn.guides.sections_7ff5a6"),
                  value: computed.filtered.length,
                }}
              />
              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.learn.guides.words_d26d55"),
                  value: computed.totals.words,
                }}
              />
              <StatisticCard
                statistic={{
                  title: i18nT("ui.ethikos.learn.guides.estimatedReadingTime"),
                  value: computed.totals.minutes,
                  suffix: 'min',
                }}
              />
            </StatisticCard.Group>

            {sections.length === 0 && !loading ? (
              <Empty description={i18nT("ui.ethikos.learn.guides.noGuidesAvailableYet")} />
            ) : computed.filtered.length === 0 ? (
              <Empty description={i18nT("ui.ethikos.learn.guides.noGuidesMatchYourQuery")} />
            ) : (
              <>
                <ProCard
                  ghost
                  style={{ marginBottom: 16 }}
                  title={i18nT("ui.ethikos.learn.guides.guideSizeBreakdown")}
                >
                  <Pie {...pieConfig} />
                </ProCard>

                {computed.filtered.map((section) => (
                  <section
                    key={section.id}
                    id={section.id}
                    style={{ marginBottom: 32 }}
                  >
                    <Space align="baseline" size="middle" wrap>
                      <Typography.Title level={3} style={{ marginTop: 0 }}>
                        {section.title}
                      </Typography.Title>

                      <Tag>{section.minutes} {i18nT("ui.ethikos.learn.guides.min")}</Tag>

                      <Button
                        type="text"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={() => void copySectionLink(section.id)}
                      >
                        {i18nT("ui.ethikos.learn.guides.copyLink")}
                      </Button>
                    </Space>

                    <Typography.Paragraph style={{ whiteSpace: 'pre-line' }}>
                      {section.content}
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