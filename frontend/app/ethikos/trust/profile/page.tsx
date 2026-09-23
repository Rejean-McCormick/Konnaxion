// FILE: frontend/app/ethikos/trust/profile/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { ClockCircleOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PageContainer, ProCard, StatisticCard } from '@ant-design/pro-components';
import {
  Alert,
  Avatar,
  Button,
  Descriptions,
  Empty,
  List,
  Progress,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import React from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { Badge, EkohExpertiseScore } from '@/services/trust';

const { Paragraph, Text, Title } = Typography;

function percent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function formatDate(i18nT: TranslateFunction, value?: string): string {
  if (!value) return i18nT("ui.ethikos.trust.profile.unknownDate");
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format('MMM D, YYYY') : value;
}

function avatarInitial(value: string): string {
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : '?';
}

function ExpertiseList({ expertise }: { expertise: EkohExpertiseScore[] }): JSX.Element {
  const { t: i18nT } = useLanguage();
  if (!expertise.length) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18nT("ui.ethikos.trust.profile.noVerifiedEkohExpertiseScoresYet")} />;
  }

  return (
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
  );
}

export default function TrustProfilePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, error, refetch } = useReputationEvents();

  const activityProfile = data?.profile;
  const ekohProfile = data?.ekohProfile ?? null;
  const badges: Badge[] = data?.badges ?? [];
  const timeline = data?.timeline ?? [];

  const displayName =
    ekohProfile?.displayName ??
    activityProfile?.displayName ??
    activityProfile?.username ??
    'Anonymous';

  const expertise = ekohProfile?.expertise ?? [];
  const topExpertise = expertise[0];
  const ethicsScore = ekohProfile?.ethicsScore ?? null;
  const confidentiality = ekohProfile?.confidentialityLevel ?? 'not available';

  const primaryAction = (
    <Link href="/ethikos/insights" prefetch={false}>
      <Button type="primary">{i18nT("ui.ethikos.trust.profile.openAnalytics")}</Button>
    </Link>
  );

  const secondaryActions = (
    <Space wrap>
      <Link href="/ethikos/trust/credentials" prefetch={false}>
        <Button icon={<SafetyCertificateOutlined />}>{i18nT("ui.ethikos.trust.profile.uploadCredential")}</Button>
      </Link>
      <Link href="/ethikos/trust/badges" prefetch={false}>
        <Button>{i18nT("ui.ethikos.trust.profile.viewBadges")}</Button>
      </Link>
    </Space>
  );

  if (error) {
    return (
      <EthikosPageShell
        title={i18nT("ui.ethikos.trust.profile.myEkohProfile")}
        sectionLabel={i18nT("ui.ethikos.trust.profile.trust")}
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      >
        <PageContainer ghost>
          <Empty description={i18nT("ui.ethikos.trust.profile.unableToLoadTrustAndExpertiseProfile")}>
            <Button onClick={() => void refetch()} type="primary">{i18nT("ui.ethikos.trust.profile.retry")}</Button>
          </Empty>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.trust.profile.myEkohProfile")}
      sectionLabel={i18nT("ui.ethikos.trust.profile.trust")}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={isLoading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.trust.profile.expertiseIsContextualNotAUniversalRank")}
            description={i18nT("ui.ethikos.trust.profile.ekohRecordsDomainSpecificExpertiseSignalsSmart")}
          />

          <ProCard gutter={16} wrap>
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.trust.profile.expertiseDomains"),
                value: expertise.length,
                description: <Text type="secondary">{i18nT("ui.ethikos.trust.profile.domainBoundedEkohProfile")}</Text>,
              }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.trust.profile.strongestCurrentDomain"),
                value: topExpertise ? percent(topExpertise.weightedScore) : 0,
                suffix: topExpertise ? '%' : undefined,
                description: topExpertise ? <Tag>{topExpertise.domainName}</Tag> : <Text type="secondary">{i18nT("ui.ethikos.trust.profile.noScoreYet")}</Text>,
              }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.trust.profile.ethicsReliabilityModifier"),
                value: ethicsScore ?? 'Restricted',
                suffix: ethicsScore == null ? undefined : '×',
                precision: ethicsScore == null ? undefined : 2,
                description: <Text type="secondary">{i18nT("ui.ethikos.trust.profile.governedSignalNotAMoralRank")}</Text>,
              }}
            />
            <StatisticCard
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: i18nT("ui.ethikos.trust.profile.profileVisibility"),
                value: confidentiality,
                description: <Text type="secondary">{i18nT("ui.ethikos.trust.profile.appliedByEkohPrivacyRules")}</Text>,
              }}
            />
          </ProCard>

          <ProCard gutter={16} wrap>
            <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <Space align="center" size="middle">
                  <Avatar size={64} src={activityProfile?.avatarUrl ?? undefined}>
                    {avatarInitial(displayName)}
                  </Avatar>
                  <div>
                    <Title level={4} style={{ marginBottom: 4 }}>{displayName}</Title>
                    <Text type="secondary">{i18nT("ui.ethikos.trust.profile.ekohExpertiseContextForEthikos")}</Text>
                  </div>
                </Space>

                {ekohProfile ? (
                  <Descriptions size="small" column={1} labelStyle={{ width: 150 }}>
                    <Descriptions.Item label={i18nT("ui.ethikos.trust.profile.ekohUserId")}>{ekohProfile.userId}</Descriptions.Item>
                    <Descriptions.Item label={i18nT("ui.ethikos.trust.profile.visibility")}>
                      <Tag>{ekohProfile.confidentialityLevel}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label={i18nT("ui.ethikos.trust.profile.ethicsSignal")}>
                      {ekohProfile.ethicsScore == null
                        ? i18nT("ui.ethikos.trust.profile.restricted")
                        : i18nT("ui.ethikos.trust.profile.text", { value1: ekohProfile.ethicsScore.toFixed(2) })}
                    </Descriptions.Item>
                  </Descriptions>
                ) : (
                  <Alert
                    type="warning"
                    showIcon
                    message={i18nT("ui.ethikos.trust.profile.noEkohProfileAvailable")}
                    description={i18nT("ui.ethikos.trust.profile.ethikosActivityIsAvailableButNoCanonical")}
                  />
                )}

                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.trust.profile.aDomainScoreDoesNotGivePermanent")}
                </Paragraph>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 16 }} title={i18nT("ui.ethikos.trust.profile.domainExpertise")}>
              <ExpertiseList expertise={expertise} />
            </ProCard>
          </ProCard>

          <ProCard gutter={16} wrap>
            <ProCard colSpan={{ xs: 24, lg: 14 }} title={i18nT("ui.ethikos.trust.profile.recentActivityContext")}>
              {timeline.length ? (
                <Timeline
                  mode="left"
                  items={timeline.map((event) => ({
                    key: event.id,
                    dot: <ClockCircleOutlined />,
                    label: formatDate(i18nT, event.when),
                    children: (
                      <Space direction="vertical" size={0}>
                        <Text strong>{event.title}</Text>
                        <Text type="secondary">{event.detail}</Text>
                      </Space>
                    ),
                  }))}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18nT("ui.ethikos.trust.profile.noRecentEthikosActivity")} />
              )}
            </ProCard>

            <ProCard colSpan={{ xs: 24, lg: 10 }} title={i18nT("ui.ethikos.trust.profile.badges")}>
              {badges.length ? (
                <List<Badge>
                  size="small"
                  dataSource={badges.slice(0, 5)}
                  renderItem={(badge) => (
                    <List.Item key={badge.id}>
                      <List.Item.Meta
                        title={badge.label}
                        description={i18nT("ui.ethikos.trust.profile.text_27a79c", { description: badge.description, value1: formatDate(i18nT, badge.earnedAt) })}
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={i18nT("ui.ethikos.trust.profile.noBadgesEarnedYet")} />
              )}
            </ProCard>
          </ProCard>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}
