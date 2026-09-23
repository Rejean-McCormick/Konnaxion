'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Button, Card, Form, Input, Space, Spin, Tabs, Typography } from 'antd'
import type { TabsProps } from 'antd'
import React, { useEffect, useState } from 'react'

import KeenPage from '@/app/keenkonnect/KeenPageShell'
import {
  fetchCurrentUser,
  resolveAvatarUrl,
  type CurrentUser,
  updateCurrentUserName,
} from '@/services/user'

const { Text, Paragraph } = Typography

type ProfileValues = { name: string }

export default function AccountPreferencesPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [form] = Form.useForm<ProfileValues>()
  const [user, setUser] = useState<CurrentUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let active = true
    void fetchCurrentUser()
      .then((current) => {
        if (!active) return
        setUser(current)
        form.setFieldsValue({ name: current.name ?? current.username })
      })
      .catch((cause: unknown) => {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'Unable to load account profile.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [form])

  const saveProfile = async ({ name }: ProfileValues): Promise<void> => {
    if (!user) return
    setSaving(true)
    setSaved(false)
    setError(null)
    try {
      const updated = await updateCurrentUserName(user.username, name.trim())
      setUser(updated)
      setSaved(true)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update profile name.')
    } finally {
      setSaving(false)
    }
  }

  const readOnlyPanel = (title: string, detail: string) => (
    <Alert
      type="info"
      showIcon
      message={i18nT("ui.keenkonnect.userReputation.accountPreferences.isReadOnlyInThisBuild", { title: title })}
      description={detail}
    />
  )

  const items: TabsProps['items'] = [
    {
      key: 'profile',
      label: i18nT("ui.keenkonnect.userReputation.accountPreferences.profileInfo"),
      children: (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.keenkonnect.userReputation.accountPreferences.onlyTheCanonicalDisplayNameIsWritable")}
            description={i18nT("ui.keenkonnect.userReputation.accountPreferences.theCurrentUserSerializerSupportsAReal")}
          />
          {error ? <Alert type="error" showIcon message={i18nT("ui.keenkonnect.userReputation.accountPreferences.profileOperationFailed")} description={error} /> : null}
          {saved ? <Alert type="success" showIcon message={i18nT("ui.keenkonnect.userReputation.accountPreferences.displayNameSaved")} /> : null}
          <Spin spinning={loading}>
            <Card>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                {user ? (
                  <img
                    src={resolveAvatarUrl(user)}
                    alt={i18nT("ui.keenkonnect.userReputation.accountPreferences.currentProfile")}
                    style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : null}
                <Text type="secondary">{i18nT("ui.keenkonnect.userReputation.accountPreferences.username")} {user?.username ?? '—'}</Text>
                <Form<ProfileValues> form={form} layout="vertical" onFinish={saveProfile}>
                  <Form.Item
                    name="name"
                    label={i18nT("ui.keenkonnect.userReputation.accountPreferences.displayName")}
                    rules={[{ required: true, whitespace: true, message: i18nT("ui.keenkonnect.userReputation.accountPreferences.pleaseEnterADisplayName") }]}
                  >
                    <Input disabled={!user || loading} />
                  </Form.Item>
                  <Button type="primary" htmlType="submit" loading={saving} disabled={!user || loading}>
                    {i18nT("ui.keenkonnect.userReputation.accountPreferences.saveDisplayName")}
                  </Button>
                </Form>
              </Space>
            </Card>
          </Spin>
        </Space>
      ),
    },
    {
      key: 'security',
      label: i18nT("ui.keenkonnect.userReputation.accountPreferences.security"),
      children: readOnlyPanel(
        'Security preferences',
        'Password change, two-factor authentication and login-alert mutation contracts are not exposed by the current Konnaxion user API.',
      ),
    },
    {
      key: 'notifications',
      label: i18nT("ui.keenkonnect.userReputation.accountPreferences.notifications"),
      children: readOnlyPanel(
        'Notification preferences',
        'Notification preference persistence is a declared deferred surface until a dedicated user-preferences contract exists.',
      ),
    },
    {
      key: 'privacy',
      label: i18nT("ui.keenkonnect.userReputation.accountPreferences.privacy"),
      children: readOnlyPanel(
        'Privacy preferences',
        'KeenKonnect-specific discoverability and sharing preferences are not persisted by the current user API.',
      ),
    },
    {
      key: 'danger',
      label: i18nT("ui.keenkonnect.userReputation.accountPreferences.dangerZone"),
      children: (
        <Card>
          <Paragraph>
            {i18nT("ui.keenkonnect.userReputation.accountPreferences.accountDeletionIsIntentionallyUnavailableFromThis")}
          </Paragraph>
          <Button danger disabled>{i18nT("ui.keenkonnect.userReputation.accountPreferences.deleteAccountUnavailable")}</Button>
        </Card>
      ),
    },
  ]

  return (
    <KeenPage
      title={i18nT("ui.keenkonnect.userReputation.accountPreferences.accountPreferences")}
      description={i18nT("ui.keenkonnect.userReputation.accountPreferences.manageThePartsOfYourAccountThat")}
    >
      <Tabs defaultActiveKey="profile" items={items} />
    </KeenPage>
  )
}
