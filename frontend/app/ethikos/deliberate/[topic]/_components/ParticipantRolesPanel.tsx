'use client'

import { useLanguage } from '@/context/LanguageContext';
import { Button, Card, Empty, List, Space, Spin, Typography } from 'antd'

import ParticipantRoleBadge from '@/modules/ethikos/components/ParticipantRoleBadge'
import type { DiscussionParticipantRoleApi } from '@/services/ethikos'

const { Text } = Typography

export default function ParticipantRolesPanel({
  roles,
  loading,
  onRefresh,
}: {
  roles: DiscussionParticipantRoleApi[]
  loading: boolean
  onRefresh: () => void
}): JSX.Element {
  const { t: i18nT } = useLanguage();
  return (
    <Card
      size="small"
      title={i18nT("ui.ethikos.deliberate.topic.participantrolespanel.participantRoles")}
      extra={
        <Button size="small" loading={loading} onClick={onRefresh}>
          {i18nT("ui.ethikos.deliberate.topic.participantrolespanel.refresh")}
        </Button>
      }
    >
      <Spin spinning={loading}>
        {roles.length > 0 ? (
          <List
            size="small"
            dataSource={roles}
            renderItem={(role) => (
              <List.Item key={role.id}>
                <Space direction="vertical" size={4}>
                  <ParticipantRoleBadge
                    participant={role}
                    showUser
                    showDescription
                    compact={false}
                  />
                  {role.assigned_by != null && (
                    <Text type="secondary">
                      {i18nT("ui.ethikos.deliberate.topic.participantrolespanel.assignedBy")} {String(role.assigned_by)}
                    </Text>
                  )}
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={i18nT("ui.ethikos.deliberate.topic.participantrolespanel.noParticipantRolesYet")}
          />
        )}
      </Spin>
    </Card>
  )
}
