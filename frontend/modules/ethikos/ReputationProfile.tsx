// FILE: frontend/modules/ethikos/ReputationProfile.tsx
// frontend/modules/ethikos/ReputationProfile.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  CrownOutlined,
  RiseOutlined,
  StarOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Alert,
  Avatar,
  Col,
  List,
  Progress,
  Row,
  Skeleton,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import React, { useMemo } from 'react';

import type { ReputationEvent } from '@/hooks/useReputationEvents';
import type { Badge, ReputationProfile } from '@/services/trust';

const { Text } = Typography;
const { Group: StatisticCardGroup } = StatisticCard;

export interface ReputationProfileModuleProps {
  profile?: ReputationProfile;
  badges?: Badge[];
  timeline?: ReputationEvent[];
  loading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
}

/**
 * Reusable reputation/trust profile view for Ethikos.
 * You can embed this inside EthikosPageShell or any layout:
 *
 *   const { data, isLoading, error, refetch } = useReputationEvents();
 *   <ReputationProfileModule
 *     profile={data?.profile}
 *     badges={data?.badges}
 *     timeline={data?.timeline}
 *     loading={isLoading}
 *     error={error}
 *     onRetry={refetch}
 *   />
 */
const ReputationProfileModule: React.FC<ReputationProfileModuleProps> = ({
  profile,
  badges = [],
  timeline = [],
  loading,
  error,
  onRetry,
}) => {
  const { t: i18nT } = useLanguage();
  const level = profile?.level ?? 'Visitor';
  const score = profile?.score ?? 0;
  const dimensions = profile?.dimensions ?? [];
  const recent = profile?.recent ?? [];
  const displayName = profile?.displayName ?? profile?.username ?? 'Anonymous';
  const avatarUrl = profile?.avatarUrl ?? null;

  const avatarInitial = useMemo(
    () => (displayName ? displayName.charAt(0).toUpperCase() : '?'),
    [displayName],
  );

  const levelTagColor = level === 'Steward' ? 'gold' : level === 'Contributor' ? 'blue' : 'default';

  const timelineItems = (timeline ?? []).map((event) => ({
    key: event.id,
    label: event.when,
    children: (
      <Space direction="vertical" size={0}>
        <Text strong>{event.title}</Text>
        {event.detail && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            {event.detail}
          </Text>
        )}
      </Space>
    ),
  }));

  return (
    <PageContainer
      header={{
        title: i18nT("ui.ethikos.reputationprofile.reputationTrustProfile"),
        subTitle: i18nT("ui.ethikos.reputationprofile.yourStandingAndContributionsInEthikos"),
      }}
    >
      {error && (
        <Alert
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
          message={i18nT("ui.ethikos.reputationprofile.unableToLoadYourTrustProfile")}
          description={
            <Space direction="vertical">
              <Text type="secondary">
                {i18nT("ui.ethikos.reputationprofile.thereWasAProblemLoadingYourProfile")}
              </Text>
              {onRetry && (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    onRetry();
                  }}
                >
                  {i18nT("ui.ethikos.reputationprofile.retryNow")}
                </a>
              )}
            </Space>
          }
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <ProCard
            bordered
            title={
              <Space>
                {avatarUrl ? (
                  <Avatar src={avatarUrl} size="large" />
                ) : (
                  <Avatar icon={<UserOutlined />} size="large">
                    {avatarInitial}
                  </Avatar>
                )}
                <span>{displayName}</span>
                <Tag color={levelTagColor}>{level}</Tag>
              </Space>
            }
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.ethikos.reputationprofile.reputationDerivedFromRealArgumentsStancesAnd")}
              </Text>
            }
          >
            {loading && !profile ? (
              <Skeleton active paragraph={{ rows: 3 }} />
            ) : (
              <StatisticCardGroup>
                <StatisticCard
                  statistic={{
                    title: i18nT("ui.ethikos.reputationprofile.reputationScore"),
                    value: score,
                    suffix: 'pts',
                    prefix: <StarOutlined />,
                  }}
                />
                <StatisticCard
                  statistic={{
                    title: i18nT("ui.ethikos.reputationprofile.dimensionsTracked"),
                    value: dimensions.length,
                    prefix: <CrownOutlined />,
                  }}
                />
                <StatisticCard
                  statistic={{
                    title: i18nT("ui.ethikos.reputationprofile.recentSignals"),
                    value: recent.length,
                    prefix: <RiseOutlined />,
                  }}
                />
              </StatisticCardGroup>
            )}
          </ProCard>

          <ProCard
            bordered
            style={{ marginTop: 16 }}
            title={i18nT("ui.ethikos.reputationprofile.reputationDimensions")}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.ethikos.reputationprofile.eachDimensionContributesToYourOverallScore")}
              </Text>
            }
          >
            {loading && !dimensions.length ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : dimensions.length === 0 ? (
              <Text type="secondary">
                {i18nT("ui.ethikos.reputationprofile.noDimensionsAvailableYetOnceYouStart")}
              </Text>
            ) : (
              <List
                dataSource={dimensions}
                renderItem={(dim) => (
                  <List.Item key={dim.key}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Space>
                        <Text strong>{dim.label}</Text>
                        <Tag>{dim.weight}{i18nT("ui.ethikos.reputationprofile.weight")}</Tag>
                      </Space>
                      <Progress
                        percent={Math.round(dim.score)}
                        status="active"
                        strokeLinecap="round"
                      />
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </ProCard>
        </Col>

        <Col xs={24} lg={8}>
          <ProCard
            bordered
            title={i18nT("ui.ethikos.reputationprofile.badges")}
            extra={
              <Text type="secondary" style={{ fontSize: 12 }}>
                {i18nT("ui.ethikos.reputationprofile.recognitionEarnedInEthikos")}
              </Text>
            }
          >
            {loading && !badges.length ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : badges.length === 0 ? (
              <Text type="secondary">
                {i18nT("ui.ethikos.reputationprofile.youHaveNotEarnedAnyBadgesYet")}
              </Text>
            ) : (
              <List
                size="small"
                dataSource={badges}
                renderItem={(badge) => (
                  <List.Item key={badge.id}>
                    <Space direction="vertical" size={0}>
                      <Text strong>{badge.label}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {badge.description}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {i18nT("ui.ethikos.reputationprofile.earnedOn")} {badge.earnedAt}
                      </Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </ProCard>
        </Col>
      </Row>

      <ProCard
        bordered
        style={{ marginTop: 16 }}
        title={i18nT("ui.ethikos.reputationprofile.reputationTimeline")}
        extra={
          <Text type="secondary" style={{ fontSize: 12 }}>
            {i18nT("ui.ethikos.reputationprofile.recentSignalsFromArgumentsStancesVotesAnd")}
          </Text>
        }
      >
        {loading && !timeline.length ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : timelineItems.length === 0 ? (
          <Text type="secondary">
            {i18nT("ui.ethikos.reputationprofile.noEventsYetAsYouParticipateIn")}
          </Text>
        ) : (
          <Timeline
            mode="left"
            items={timelineItems.map((item) => ({
              ...item,
              // Use a neutral color; you can refine this based on event type later.
              color: 'blue',
            }))}
          />
        )}
      </ProCard>
    </PageContainer>
  );
};

export default ReputationProfileModule;
