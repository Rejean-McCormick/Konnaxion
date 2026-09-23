'use client'

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { Alert, Space, Tag, Typography } from 'antd'

import type { EkohProfile } from '@/services/ekoh'

const { Text } = Typography

function reasonLabel(i18nT: TranslateFunction, reason: string): string {
  switch (reason) {
    case 'self': return i18nT("ui.ekoh.ekohaccessnotice.selfAccess")
    case 'staff': return i18nT("ui.ekoh.ekohaccessnotice.staffAccess")
    case 'public_policy': return i18nT("ui.ekoh.ekohaccessnotice.publicRatingPolicy")
    case 'scope_grant': return i18nT("ui.ekoh.ekohaccessnotice.scopedAccessGrant")
    case 'private_policy': return i18nT("ui.ekoh.ekohaccessnotice.privateRatingPolicy")
    case 'outside_authorized_scope': return i18nT("ui.ekoh.ekohaccessnotice.outsideAuthorizedScope")
    default: return reason || 'Access policy'
  }
}

export default function EkohAccessNotice({ profile }: { profile: EkohProfile }): JSX.Element {
  const { t: i18nT } = useLanguage();
  const access = profile.ratingAccess

  if (!access.allowed) {
    return (
      <Alert
        type="warning"
        showIcon
        message={i18nT("ui.ekoh.ekohaccessnotice.ekohRatingsAreNotVisibleInYour")}
        description={
          <Space direction="vertical" size={4}>
            <Text>{reasonLabel(i18nT, access.reason)}</Text>
            <Text type="secondary">
              {i18nT("ui.ekoh.ekohaccessnotice.identityVisibilityAndEkohRatingVisibilityAre")}
            </Text>
          </Space>
        }
      />
    )
  }

  return (
    <Alert
      type="info"
      showIcon
      message={
        <Space wrap>
          <span>{i18nT("ui.ekoh.ekohaccessnotice.ekohRatingAccess")}</span>
          <Tag>{profile.ratingVisibility}</Tag>
          <Tag>{access.level ?? i18nT("ui.ekoh.ekohaccessnotice.ratings")}</Tag>
          {access.scope?.name ? <Tag>{access.scope.name}</Tag> : null}
        </Space>
      }
      description={
        <Space direction="vertical" size={4}>
          <Text>{reasonLabel(i18nT, access.reason)}</Text>
          {profile.ratingPublicationBasis ? (
            <Text type="secondary">{profile.ratingPublicationBasis}</Text>
          ) : null}
        </Space>
      }
    />
  )
}
