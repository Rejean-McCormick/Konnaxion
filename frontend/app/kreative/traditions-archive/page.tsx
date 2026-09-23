'use client'

import { useLanguage } from '@/context/LanguageContext';
import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Empty, Row, Space, Spin, Tag, Typography } from 'antd'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useState } from 'react'

import KreativePageShell from '@/app/kreative/kreativePageShell'
import { listTraditionEntries, type TraditionEntry } from '@/services/kreative'

const { Paragraph, Text } = Typography

export default function TraditionsArchivePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter()
  const [entries, setEntries] = useState<TraditionEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setEntries(await listTraditionEntries())
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load traditions archive.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.traditionsArchive.traditionsArchive")}
      subtitle={i18nT("ui.kreative.traditionsArchive.culturalHeritageEntriesPersistedThroughTheKreative")}
      primaryAction={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={() => void load()}>{i18nT("ui.kreative.traditionsArchive.refresh")}</Button>
          <Button type="primary" onClick={() => router.push('/kreative/mentorship')}>
            {i18nT("ui.kreative.traditionsArchive.contributeArchiveEntry")}
          </Button>
        </Space>
      }
    >
      {error ? <Alert type="error" showIcon message={i18nT("ui.kreative.traditionsArchive.archiveLoadFailed")} description={error} style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        {entries.length === 0 ? (
          <Empty description={i18nT("ui.kreative.traditionsArchive.noTraditionEntriesAreAvailableYet")} />
        ) : (
          <Row gutter={[16, 16]}>
            {entries.map((entry) => (
              <Col key={entry.id} xs={24} md={12} lg={8}>
                <Card title={entry.title} extra={<Tag color={entry.approved ? 'green' : 'gold'}>{entry.approved ? i18nT("ui.kreative.traditionsArchive.approved") : i18nT("ui.kreative.traditionsArchive.pending")}</Tag>}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <Text type="secondary">{i18nT("ui.kreative.traditionsArchive.region")} {entry.region || i18nT("ui.kreative.traditionsArchive.notSpecified")}</Text>
                    <Paragraph ellipsis={{ rows: 4 }}>{entry.description}</Paragraph>
                    <Text type="secondary">
                      {i18nT("ui.kreative.traditionsArchive.submitted")} {new Date(entry.submitted_at).toLocaleString()}
                    </Text>
                  </Space>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </KreativePageShell>
  )
}
