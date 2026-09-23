// FILE: frontend/app/keenkonnect/user-reputation/view-reputation-ekoh/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Avatar, Card, Col, Empty, List, Progress, Row, Space, Tag, Timeline, Typography } from 'antd';
import React from 'react';

import KeenPageShell from '@/app/keenkonnect/KeenPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { EkohExpertiseScore } from '@/services/trust';

const { Paragraph, Text, Title } = Typography;

function percent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function initial(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

export default function ViewReputationEkohPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useReputationEvents();
  const ekohProfile = data?.ekohProfile ?? null;
  const activityProfile = data?.profile;
  const timeline = data?.timeline ?? [];
  const badges = data?.badges ?? [];
  const expertise = ekohProfile?.expertise ?? [];
  const displayName =
    ekohProfile?.displayName ??
    activityProfile?.displayName ??
    activityProfile?.username ??
    'Anonymous';

  return (
    <KeenPageShell
      title={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.ekohExpertise")}
      description={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.domainSpecificExpertiseContextAvailableToKeenkonnect")}
      metaTitle={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.keenkonnectEkohExpertise")}
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.unableToLoadEkohProfile")}
          description={(error as Error | undefined)?.message ?? i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.pleaseTryAgain")}
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        showIcon
        message={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.contextualExpertiseNotAGlobalInfluenceScore")}
        description={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.keenkonnectCanUseEkohExpertiseToDiscover")}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card loading={isLoading}>
            <Space direction="vertical" align="center" style={{ width: '100%' }}>
              <Avatar size={80} src={activityProfile?.avatarUrl ?? undefined}>
                {initial(displayName)}
              </Avatar>
              <div style={{ textAlign: 'center' }}>
                <Title level={4} style={{ marginBottom: 4 }}>{displayName}</Title>
                <Text type="secondary">{i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.ekohDomainProfile")}</Text>
              </div>
              {ekohProfile ? (
                <Space wrap style={{ justifyContent: 'center' }}>
                  <Tag>{ekohProfile.confidentialityLevel}</Tag>
                  <Tag>{expertise.length} {i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.domains")}</Tag>
                  <Tag>
                    {i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.reliability")} {ekohProfile.ethicsScore == null
                      ? i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.restricted")
                      : i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.text", { value1: ekohProfile.ethicsScore.toFixed(2) })}
                  </Tag>
                </Space>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.noEkohProfile")} />
              )}
            </Space>
          </Card>

          <Card title={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.profileUse")} style={{ marginTop: 16 }}>
            <Paragraph style={{ marginBottom: 0 }}>
              {i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.expertiseScoresHelpIdentifyContributorsWhoseDemonstrated")}
            </Paragraph>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.expertiseByDomain")} loading={isLoading}>
            {expertise.length ? (
              <List<EkohExpertiseScore>
                dataSource={expertise}
                renderItem={(item) => {
                  const value = percent(item.weightedScore);
                  return (
                    <List.Item key={item.domainCode}>
                      <div style={{ width: '100%' }}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                          <Space wrap>
                            <Text strong>{item.domainName}</Text>
                            <Tag>{item.domainCode}</Tag>
                          </Space>
                          <Text type="secondary">{value}%</Text>
                        </Space>
                        <Progress percent={value} showInfo={false} />
                      </div>
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.noCanonicalEkohExpertiseScoresAvailable")} />
            )}
          </Card>

          <Card title={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.recentEvidenceAndActivityContext")} style={{ marginTop: 16 }}>
            {timeline.length ? (
              <Timeline
                items={timeline.map((item) => ({
                  key: item.id,
                  children: (
                    <div>
                      <Text strong>{item.title}</Text>
                      <div><Text type="secondary">{item.detail}</Text></div>
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.noRecentActivity")} />
            )}
          </Card>
        </Col>
      </Row>

      <Card title={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.badgesAndDiscoverySignals")} style={{ marginTop: 24 }}>
        {badges.length ? (
          <List
            size="small"
            dataSource={badges}
            renderItem={(badge) => (
              <List.Item key={badge.id}>
                <List.Item.Meta title={badge.label} description={badge.description} />
              </List.Item>
            )}
          />
        ) : (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.noBadgesEarnedYet")} />
        )}
        <Paragraph type="secondary" style={{ marginTop: 16, marginBottom: 0 }}>
          {i18nT("ui.keenkonnect.userReputation.viewReputationEkoh.badgesAndActivityMaySupportDiscoveryBut")}
        </Paragraph>
      </Card>
    </KeenPageShell>
  );
}
