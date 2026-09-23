'use client'

import { useLanguage } from '@/context/LanguageContext';
import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Empty, List, Space, Spin, Tag, Typography } from 'antd'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import KreativePageShell from '@/app/kreative/kreativePageShell'
import { listCollabSessions, type KreativeCollabSession } from '@/services/kreative'
import { fetchCurrentUser, type CurrentUser } from '@/services/user'

const { Text } = Typography

export default function MySpacesPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [sessions, setSessions] = useState<KreativeCollabSession[]>([])
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [currentUser, allSessions] = await Promise.all([
        fetchCurrentUser(),
        listCollabSessions(),
      ])
      setUser(currentUser)
      setSessions(allSessions)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to load hosted collaboration sessions.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const mine = useMemo(() => {
    if (!user) return []
    return sessions.filter(
      (session) => session.host === user.username || session.host === user.name,
    )
  }, [sessions, user])

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.collaborativeSpaces.mySpaces.myCollaborativeSpaces")}
      subtitle={i18nT("ui.kreative.collaborativeSpaces.mySpaces.sessionsHostedByTheAuthenticatedUserDerived")}
      primaryAction={<Button icon={<ReloadOutlined />} onClick={() => void load()}>{i18nT("ui.kreative.collaborativeSpaces.mySpaces.refresh")}</Button>}
    >
      {error ? <Alert type="error" showIcon message={i18nT("ui.kreative.collaborativeSpaces.mySpaces.mySpacesCouldNotBeLoaded")} description={error} style={{ marginBottom: 16 }} /> : null}
      <Spin spinning={loading}>
        <Card>
          <List
            dataSource={mine}
            locale={{ emptyText: <Empty description={i18nT("ui.kreative.collaborativeSpaces.mySpaces.youDoNotCurrentlyHostACollaboration")} /> }}
            renderItem={(session) => (
              <List.Item>
                <List.Item.Meta
                  title={session.name}
                  description={
                    <Space wrap>
                      <Tag>{session.session_type}</Tag>
                      <Text type="secondary">{i18nT("ui.kreative.collaborativeSpaces.mySpaces.started")} {new Date(session.started_at).toLocaleString()}</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Spin>
    </KreativePageShell>
  )
}
