'use client'

import { useLanguage } from '@/context/LanguageContext';
import {
  AuditOutlined,
  CheckCircleOutlined,
  ReloadOutlined,
  TeamOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { ProCard, type ProColumns, ProTable, StatisticCard } from '@ant-design/pro-components'
import {
  Alert,
  Button,
  Col,
  Empty,
  List,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from 'antd'
import { useRouter } from 'next/navigation'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import KontrolPageShell from '@/app/kontrol/KontrolPageShell'

const { Text, Paragraph } = Typography

type ApiList<T> = T[] | { results?: T[]; count?: number }

type ModerationRecord = {
  id: number
  target_type?: string
  target_id?: string
  report_reason?: string
  report_count?: number
  severity?: string
  status?: string
  content_snippet?: string
}

type AuditRecord = {
  id: number
  actor_name?: string
  actor_username?: string
  action?: string
  module?: string
  target?: string
  created?: string
}

type UserRecord = {
  id: number
  username: string
  is_active?: boolean
  is_staff?: boolean
  is_superuser?: boolean
  joined_at?: string
  last_login?: string | null
}

function rows<T>(payload: ApiList<T>): T[] {
  return Array.isArray(payload) ? payload : payload.results ?? []
}

function count<T>(payload: ApiList<T>): number {
  return Array.isArray(payload) ? payload.length : payload.count ?? rows(payload).length
}

async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) {
    throw new Error(`${url} returned HTTP ${response.status}`)
  }
  return response.json() as Promise<T>
}

export default function KontrolDashboard(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [moderationPayload, setModerationPayload] = useState<ApiList<ModerationRecord>>([])
  const [auditPayload, setAuditPayload] = useState<ApiList<AuditRecord>>([])
  const [usersPayload, setUsersPayload] = useState<ApiList<UserRecord>>([])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [moderation, audit, users] = await Promise.all([
        getJson<ApiList<ModerationRecord>>('/api/admin/moderation/'),
        getJson<ApiList<AuditRecord>>('/api/admin/audit-log/'),
        getJson<ApiList<UserRecord>>('/api/admin/users/'),
      ])
      setModerationPayload(moderation)
      setAuditPayload(audit)
      setUsersPayload(users)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load Kontrol data.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const moderationRows = rows(moderationPayload)
  const auditRows = rows(auditPayload)
  const userRows = rows(usersPayload)
  const pending = moderationRows.filter((item) => item.status !== 'resolved')
  const critical = pending.filter((item) => item.severity === 'critical').length
  const staff = userRows.filter((user) => user.is_staff || user.is_superuser).length
  const active = userRows.filter((user) => user.is_active !== false).length

  const moderationColumns = useMemo<ProColumns<ModerationRecord>[]>(() => [
    { title: i18nT("ui.kontrol.dashboard.id"), dataIndex: 'id', width: 70 },
    { title: i18nT("ui.kontrol.dashboard.type"), dataIndex: 'target_type', width: 120 },
    {
      title: i18nT("ui.kontrol.dashboard.reason"),
      dataIndex: 'report_reason',
      ellipsis: true,
    },
    {
      title: i18nT("ui.kontrol.dashboard.reports"),
      dataIndex: 'report_count',
      width: 90,
      valueType: 'digit',
    },
    {
      title: i18nT("ui.kontrol.dashboard.severity"),
      dataIndex: 'severity',
      width: 100,
      render: (_, row) => (
        <Tag color={row.severity === 'critical' ? 'red' : row.severity === 'high' ? 'orange' : 'blue'}>
          {(row.severity ?? 'unknown').toUpperCase()}
        </Tag>
      ),
    },
  ], [i18nT])

  const runHealthCheck = async () => {
    const hide = message.loading(i18nT("ui.kontrol.dashboard.checkingGovernanceApis"), 0)
    try {
      await Promise.all([
        getJson('/api/admin/audit-log/'),
        getJson('/api/admin/moderation/'),
        getJson('/api/admin/users/'),
      ])
      message.success(i18nT("ui.kontrol.dashboard.governanceApisRespondedSuccessfully"))
    } catch (healthError) {
      message.error(
        healthError instanceof Error ? healthError.message : i18nT("ui.kontrol.dashboard.governanceApiCheckFailed"),
      )
    } finally {
      hide()
    }
  }

  return (
    <KontrolPageShell
      title={i18nT("ui.kontrol.dashboard.platformGovernanceDashboard")}
      subtitle={i18nT("ui.kontrol.dashboard.liveGovernanceOverviewBackedByKontrolAdministration")}
      scope="platform"
      metaTitle={i18nT("ui.kontrol.dashboard.kontrolPlatformDashboard")}
      primaryAction={
        <Button icon={<ReloadOutlined />} onClick={() => void load()}>
          {i18nT("ui.kontrol.dashboard.refresh")}
        </Button>
      }
    >
      {error && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.kontrol.dashboard.kontrolDataCouldNotBeLoaded")}
          description={error}
          style={{ marginBottom: 16 }}
        />
      )}

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {i18nT("ui.kontrol.dashboard.valuesBelowAreDerivedFromTheCurrent")}
        </Paragraph>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              loading={loading}
              statistic={{ title: i18nT("ui.kontrol.dashboard.registeredUsers"), value: count(usersPayload), prefix: <UserOutlined /> }}
              onClick={() => router.push('/kontrol/users/all')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              loading={loading}
              statistic={{ title: i18nT("ui.kontrol.dashboard.activeUsers"), value: active, prefix: <CheckCircleOutlined /> }}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              loading={loading}
              statistic={{ title: i18nT("ui.kontrol.dashboard.pendingModeration"), value: pending.length, prefix: <WarningOutlined /> }}
              extra={critical ? <Tag color="red">{critical} {i18nT("ui.kontrol.dashboard.critical")}</Tag> : <Tag color="green">{i18nT("ui.kontrol.dashboard.noCritical")}</Tag>}
              onClick={() => router.push('/kontrol/moderation/queue')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              loading={loading}
              statistic={{ title: i18nT("ui.kontrol.dashboard.staffAdmins"), value: staff, prefix: <TeamOutlined /> }}
              onClick={() => router.push('/kontrol/users/all')}
            />
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <ProCard
              title={<Space><AuditOutlined /> {i18nT("ui.kontrol.dashboard.moderationQueue")}</Space>}
              headerBordered
              extra={<Button type="link" onClick={() => router.push('/kontrol/moderation/queue')}>{i18nT("ui.kontrol.dashboard.viewAll")}</Button>}
            >
              <ProTable<ModerationRecord>
                columns={moderationColumns}
                dataSource={pending.slice(0, 6)}
                rowKey="id"
                search={false}
                options={false}
                pagination={false}
                loading={loading}
                locale={{ emptyText: <Empty description={i18nT("ui.kontrol.dashboard.noPendingModerationTickets")} /> }}
                toolBarRender={false}
              />
            </ProCard>
          </Col>

          <Col xs={24} lg={8}>
            <ProCard
              title={i18nT("ui.kontrol.dashboard.recentAdminActivity")}
              headerBordered
              extra={<Button type="link" onClick={() => router.push('/kontrol/audit-log')}>{i18nT("ui.kontrol.dashboard.viewLog")}</Button>}
            >
              <List
                loading={loading}
                dataSource={auditRows.slice(0, 6)}
                locale={{ emptyText: i18nT("ui.kontrol.dashboard.noAuditActivityRecorded") }}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={item.action || i18nT("ui.kontrol.dashboard.administrativeAction")}
                      description={
                        <Space size={4} wrap>
                          <Text type="secondary">
                            {i18nT("ui.kontrol.dashboard.by")} {item.actor_name || item.actor_username || i18nT("ui.kontrol.dashboard.system")}
                          </Text>
                          {item.module && <Tag>{item.module}</Tag>}
                          {item.created && <Text type="secondary">{new Date(item.created).toLocaleString()}</Text>}
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </ProCard>
          </Col>
        </Row>

        <ProCard
          title={i18nT("ui.kontrol.dashboard.governanceApiHealth")}
          headerBordered
          extra={
            <Button type="primary" onClick={() => void runHealthCheck()}>
              {i18nT("ui.kontrol.dashboard.runLiveCheck")}
            </Button>
          }
        >
          <Alert
            type={error ? 'error' : 'success'}
            showIcon
            message={error ? i18nT("ui.kontrol.dashboard.oneOrMoreGovernanceApisFailed") : i18nT("ui.kontrol.dashboard.governanceApiSurfacesAreReachable")}
            description={i18nT("ui.kontrol.dashboard.thisCheckCoversTheEndpointsUsedBy")}
          />
        </ProCard>
      </Space>
    </KontrolPageShell>
  )
}
