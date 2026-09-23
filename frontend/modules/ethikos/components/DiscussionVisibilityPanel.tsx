// FILE: frontend/modules/ethikos/components/DiscussionVisibilityPanel.tsx
'use client'

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  ReloadOutlined,
  SaveOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { ProCard } from '@ant-design/pro-components'
import {
  Alert,
  App,
  Button,
  Empty,
  Form,
  Select,
  Skeleton,
  Space,
  Tag,
  Typography,
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  fetchDiscussionVisibilitySettings,
  setDiscussionVisibilitySetting,
  updateDiscussionVisibilitySetting,
} from '@/services/ethikos'
import type {
  AuthorVisibility,
  DiscussionParticipationType,
  DiscussionVisibilitySettingApi,
  EthikosId,
  SetDiscussionVisibilitySettingPayload,
  UpdateDiscussionVisibilitySettingPayload,
  VoteVisibility,
} from '@/services/ethikos'

const { Text, Paragraph } = Typography

type VisibilityFormValues = {
  participation_type: DiscussionParticipationType
  author_visibility: AuthorVisibility
  vote_visibility: VoteVisibility
}

export type DiscussionVisibilityPanelProps = {
  topicId: EthikosId
  editable?: boolean
  compact?: boolean
  title?: string
  onChange?: (setting: DiscussionVisibilitySettingApi) => void
}

const DEFAULT_VALUES: VisibilityFormValues = {
  participation_type: 'standard',
  author_visibility: 'all',
  vote_visibility: 'all',
}

const PARTICIPATION_OPTIONS = (i18nT: TranslateFunction): Array<{
  value: DiscussionParticipationType
  label: string
  description: string
}> => ([
  {
    value: 'standard',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.standardParticipation"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.authorsAndRolesAreHandledWithNormal"),
  },
  {
    value: 'anonymous',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.anonymousParticipation"),
    description:
      i18nT("ui.ethikos.discussionvisibilitypanel.participantsMayContributeWithReducedPublicIdentity"),
  },
])

const AUTHOR_VISIBILITY_OPTIONS = (i18nT: TranslateFunction): Array<{
  value: AuthorVisibility
  label: string
  description: string
}> => ([
  {
    value: 'all',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.visibleToAll"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.authorIdentityMayBeShownToAll"),
  },
  {
    value: 'admins_only',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.adminsOnly"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.authorIdentityIsLimitedToAdministratorsModerators"),
  },
  {
    value: 'never',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.neverVisible"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.authorIdentityShouldNotBeExposedIn"),
  },
])

const VOTE_VISIBILITY_OPTIONS = (i18nT: TranslateFunction): Array<{
  value: VoteVisibility
  label: string
  description: string
}> => ([
  {
    value: 'all',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.visibleToAll"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.voteImpactSignalsMayBeVisibleTo"),
  },
  {
    value: 'admins_only',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.adminsOnly"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.voteImpactSignalsAreLimitedToAdministrators"),
  },
  {
    value: 'self_only',
    label: i18nT("ui.ethikos.discussionvisibilitypanel.selfOnly"),
    description: i18nT("ui.ethikos.discussionvisibilitypanel.participantsOnlySeeTheirOwnVoteImpact"),
  },
])

function optionLabel<TValue extends string>(
  options: Array<{ value: TValue; label: string }>,
  value: TValue,
): string {
  return options.find((option) => option.value === value)?.label ?? value
}

function participationColor(value: DiscussionParticipationType): string {
  return value === 'anonymous' ? 'purple' : 'blue'
}

function authorVisibilityColor(value: AuthorVisibility): string {
  if (value === 'all') return 'green'
  if (value === 'admins_only') return 'orange'
  return 'red'
}

function voteVisibilityColor(value: VoteVisibility): string {
  if (value === 'all') return 'green'
  if (value === 'admins_only') return 'orange'
  return 'default'
}

function toFormValues(
  setting: DiscussionVisibilitySettingApi | null,
): VisibilityFormValues {
  return {
    participation_type:
      setting?.participation_type ?? DEFAULT_VALUES.participation_type,
    author_visibility:
      setting?.author_visibility ?? DEFAULT_VALUES.author_visibility,
    vote_visibility: setting?.vote_visibility ?? DEFAULT_VALUES.vote_visibility,
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback
}

function hasValidTopicId(topicId: EthikosId): boolean {
  return String(topicId).trim().length > 0
}

function buildCreatePayload(
  topicId: EthikosId,
  values: VisibilityFormValues,
): SetDiscussionVisibilitySettingPayload {
  return {
    topic: topicId,
    participation_type: values.participation_type,
    author_visibility: values.author_visibility,
    vote_visibility: values.vote_visibility,
  }
}

function buildUpdatePayload(
  values: VisibilityFormValues,
): UpdateDiscussionVisibilitySettingPayload {
  return {
    participation_type: values.participation_type,
    author_visibility: values.author_visibility,
    vote_visibility: values.vote_visibility,
  }
}

export default function DiscussionVisibilityPanel({
  topicId,
  editable = false,
  compact = false,
  title: titleProp,
  onChange,
}: DiscussionVisibilityPanelProps): JSX.Element {
  const { t: i18nT } = useLanguage();
  const title = titleProp ?? i18nT("ui.ethikos.discussionvisibilitypanel.discussionVisibility");
  const { message } = App.useApp()
  const [form] = Form.useForm<VisibilityFormValues>()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [setting, setSetting] = useState<DiscussionVisibilitySettingApi | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)

  const participationValue =
    Form.useWatch('participation_type', form) ??
    DEFAULT_VALUES.participation_type
  const authorVisibilityValue =
    Form.useWatch('author_visibility', form) ??
    DEFAULT_VALUES.author_visibility
  const voteVisibilityValue =
    Form.useWatch('vote_visibility', form) ?? DEFAULT_VALUES.vote_visibility

  const participationDescription = useMemo(
    () =>
      PARTICIPATION_OPTIONS(i18nT).find(
        (option) => option.value === participationValue,
      )?.description,
    [participationValue, i18nT],
  )

  const authorVisibilityDescription = useMemo(
    () =>
      AUTHOR_VISIBILITY_OPTIONS(i18nT).find(
        (option) => option.value === authorVisibilityValue,
      )?.description,
    [authorVisibilityValue, i18nT],
  )

  const voteVisibilityDescription = useMemo(
    () =>
      VOTE_VISIBILITY_OPTIONS(i18nT).find(
        (option) => option.value === voteVisibilityValue,
      )?.description,
    [voteVisibilityValue, i18nT],
  )

  const loadSetting = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)

    if (!hasValidTopicId(topicId)) {
      setSetting(null)
      form.setFieldsValue(DEFAULT_VALUES)
      setError(i18nT("ui.ethikos.discussionvisibilitypanel.missingTopicIdForDiscussionVisibilitySettings"))
      setLoading(false)
      return
    }

    try {
      const rows = await fetchDiscussionVisibilitySettings(topicId)
      const nextSetting = rows[0] ?? null

      setSetting(nextSetting)
      form.setFieldsValue(toFormValues(nextSetting))
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          'Unable to load discussion visibility settings.',
        ),
      )
      setSetting(null)
      form.setFieldsValue(DEFAULT_VALUES)
    } finally {
      setLoading(false)
    }
  }, [form, topicId, i18nT])

  useEffect(() => {
    form.setFieldsValue(DEFAULT_VALUES)
    void loadSetting()
  }, [form, loadSetting])

  async function handleSave(): Promise<void> {
    if (!editable) {
      return
    }

    if (!hasValidTopicId(topicId)) {
      message.error(i18nT("ui.ethikos.discussionvisibilitypanel.missingTopicIdForDiscussionVisibilitySettings"))
      return
    }

    const formValues = await form.validateFields()

    setSaving(true)

    try {
      const settingId = setting?.id
      const saved = settingId
        ? await updateDiscussionVisibilitySetting(
            settingId,
            buildUpdatePayload(formValues),
          )
        : await setDiscussionVisibilitySetting(
            buildCreatePayload(topicId, formValues),
          )

      setError(null)
      setSetting(saved)
      form.setFieldsValue(toFormValues(saved))
      onChange?.(saved)

      message.success(
        settingId
          ? i18nT("ui.ethikos.discussionvisibilitypanel.discussionVisibilityUpdated")
          : i18nT("ui.ethikos.discussionvisibilitypanel.discussionVisibilityCreated"),
      )
    } catch (err) {
      message.error(
        getErrorMessage(
          err,
          'Unable to save discussion visibility settings.',
        ),
      )
    } finally {
      setSaving(false)
    }
  }

  const showEmpty = !loading && !setting && !editable
  const hasTopicId = hasValidTopicId(topicId)

  return (
    <ProCard
      title={title}
      size={compact ? 'small' : 'default'}
      extra={
        <Space>
          {setting ? (
            <Tag color="green">{i18nT("ui.ethikos.discussionvisibilitypanel.configured")}</Tag>
          ) : (
            <Tag color="default">{i18nT("ui.ethikos.discussionvisibilitypanel.default")}</Tag>
          )}

          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={() => void loadSetting()}
            disabled={loading || saving || !hasTopicId}
          >
            {i18nT("ui.ethikos.discussionvisibilitypanel.refresh")}
          </Button>

          {editable ? (
            <Button
              size="small"
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              disabled={loading || !hasTopicId}
              onClick={() => void handleSave()}
            >
              {setting?.id ? i18nT("ui.ethikos.discussionvisibilitypanel.save") : i18nT("ui.ethikos.discussionvisibilitypanel.create")}
            </Button>
          ) : null}
        </Space>
      }
    >
      {loading ? (
        <Skeleton active paragraph={{ rows: compact ? 2 : 4 }} />
      ) : (
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {error ? (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.discussionvisibilitypanel.visibilitySettingsUnavailable")}
              description={error}
            />
          ) : null}

          {showEmpty ? (
            <Empty description={i18nT("ui.ethikos.discussionvisibilitypanel.noVisibilitySettingConfiguredYet")} />
          ) : null}

          {!setting && editable ? (
            <Alert
              type="info"
              showIcon
              message={i18nT("ui.ethikos.discussionvisibilitypanel.noSavedVisibilitySettingExistsYet")}
              description={i18nT("ui.ethikos.discussionvisibilitypanel.savingWillCreateTheTopicVisibilitySetting")}
            />
          ) : null}

          <Form<VisibilityFormValues>
            form={form}
            layout="vertical"
            initialValues={DEFAULT_VALUES}
            disabled={!editable || saving}
          >
            <Form.Item
              name="participation_type"
              label={
                <Space size={6}>
                  <UserSwitchOutlined />
                  <span>{i18nT("ui.ethikos.discussionvisibilitypanel.participationType")}</span>
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: i18nT("ui.ethikos.discussionvisibilitypanel.chooseAParticipationType"),
                },
              ]}
            >
              <Select
                options={PARTICIPATION_OPTIONS(i18nT).map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="author_visibility"
              label={
                <Space size={6}>
                  <EyeOutlined />
                  <span>{i18nT("ui.ethikos.discussionvisibilitypanel.authorVisibility")}</span>
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: i18nT("ui.ethikos.discussionvisibilitypanel.chooseAuthorVisibility"),
                },
              ]}
            >
              <Select
                options={AUTHOR_VISIBILITY_OPTIONS(i18nT).map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="vote_visibility"
              label={
                <Space size={6}>
                  <LockOutlined />
                  <span>{i18nT("ui.ethikos.discussionvisibilitypanel.voteVisibility")}</span>
                </Space>
              }
              rules={[
                {
                  required: true,
                  message: i18nT("ui.ethikos.discussionvisibilitypanel.chooseVoteVisibility"),
                },
              ]}
            >
              <Select
                options={VOTE_VISIBILITY_OPTIONS(i18nT).map((option) => ({
                  label: option.label,
                  value: option.value,
                }))}
              />
            </Form.Item>
          </Form>

          <Space wrap>
            <Tag
              icon={<UserSwitchOutlined />}
              color={participationColor(participationValue)}
            >
              {optionLabel(PARTICIPATION_OPTIONS(i18nT), participationValue)}
            </Tag>

            <Tag
              icon={
                authorVisibilityValue === 'never' ? (
                  <EyeInvisibleOutlined />
                ) : (
                  <EyeOutlined />
                )
              }
              color={authorVisibilityColor(authorVisibilityValue)}
            >
              {optionLabel(AUTHOR_VISIBILITY_OPTIONS(i18nT), authorVisibilityValue)}
            </Tag>

            <Tag
              icon={<LockOutlined />}
              color={voteVisibilityColor(voteVisibilityValue)}
            >
              {optionLabel(VOTE_VISIBILITY_OPTIONS(i18nT), voteVisibilityValue)}
            </Tag>
          </Space>

          {!compact ? (
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {participationDescription ? (
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text strong>{i18nT("ui.ethikos.discussionvisibilitypanel.participation")}</Text>{' '}
                  {participationDescription}
                </Paragraph>
              ) : null}

              {authorVisibilityDescription ? (
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text strong>{i18nT("ui.ethikos.discussionvisibilitypanel.authors")}</Text>{' '}
                  {authorVisibilityDescription}
                </Paragraph>
              ) : null}

              {voteVisibilityDescription ? (
                <Paragraph style={{ marginBottom: 0 }}>
                  <Text strong>{i18nT("ui.ethikos.discussionvisibilitypanel.votes")}</Text> {voteVisibilityDescription}
                </Paragraph>
              ) : null}
            </Space>
          ) : null}
        </Space>
      )}
    </ProCard>
  )
}