// FILE: frontend/app/ethikos/trust/profile/page.tsx
'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  PageContainer,
  ProCard,
  StatisticCard,
} from '@ant-design/pro-components';
import {
  Avatar,
  Badge as AntBadge,
  Button,
  Descriptions,
  Divider,
  Empty,
  List,
  Progress,
  Space,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  ClockCircleOutlined,
  CrownOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { Radar } from '@ant-design/plots';
import dayjs from 'dayjs';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import useReputationEvents, {
  type ReputationEvent,
} from '@/hooks/useReputationEvents';
import type {
  Badge,
  ReputationDimension,
  ReputationProfile,
} from '@/services/trust';

const { Text, Title } = Typography;

type TrustLevel = ReputationProfile['level'];

type RadarPoint = {
  metric: string;
  score: number;
};

function clampScore(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatTimelineDate(value: string): string {
  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : value;
}

function formatBadgeDate(value?: string): string {
  if (!value) {
    return 'Unknown date';
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.format('MMM D, YYYY') : value;
}

function getLevelColor(level: TrustLevel): string {
  if (level === 'Steward') {
    return 'gold';
  }

  if (level === 'Contributor') {
    return 'blue';
  }

  return 'default';
}

function getAvatarInitial(seed: string): string {
  const trimmed = seed.trim();

  return trimmed.length > 0 ? trimmed.charAt(0).toUpperCase() : '?';
}

export default function TrustProfilePage(): JSX.Element {
  const { data, isLoading, error, refetch } = useReputationEvents();

  const profile: ReputationProfile | undefined = data?.profile;
  const badges: Badge[] = data?.badges ?? [];
  const timeline: ReputationEvent[] = data?.timeline ?? [];

  const level: TrustLevel = profile?.level ?? 'Visitor';
  const score = clampScore(profile?.score);
  const dimensions: ReputationDimension[] = profile?.dimensions ?? [];
  const recent: ReputationProfile['recent'] = profile?.recent ?? [];

  const displayName = profile?.displayName ?? profile?.username ?? 'Anonymous';
  const avatarSrc = profile?.avatarUrl ?? undefined;
  const avatarInitial = getAvatarInitial(displayName || level);
  const levelColor = getLevelColor(level);

  const netRecentDelta = useMemo(
    () => recent.reduce((sum, item) => sum + item.change, 0),
    [recent],
  );

  const topDimension = useMemo<ReputationDimension | undefined>(() => {
    if (!dimensions.length) {
      return undefined;
    }

    return [...dimensions].sort((left, right) => right.score - left.score)[0];
  }, [dimensions]);

  const radarData = useMemo<RadarPoint[]>(
    () =>
      dimensions.map((dimension) => ({
        metric: dimension.label,
        score: clampScore(dimension.score),
      })),
    [dimensions],
  );

  const radarConfig = useMemo(
    () => ({
      data: radarData,
      xField: 'metric',
      yField: 'score',
      meta: {
        score: {
          min: 0,
          max: 100,
        },
      },
      point: {
        size: 2,
      },
      area: {},
    }),
    [radarData],
  );

  const primaryAction = (
    <Link href="/ethikos/insights" prefetch={false}>
      <Button type="primary">Open analytics</Button>
    </Link>
  );

  const secondaryActions = (
    <Space wrap>
      <Link href="/ethikos/trust/credentials" prefetch={false}>
        <Button icon={<SafetyCertificateOutlined />}>Upload credential</Button>
      </Link>
      <Link href="/ethikos/trust/badges" prefetch={false}>
        <Button>View badges</Button>
      </Link>
    </Space>
  );

  if (error) {
    return (
      <EthikosPageShell
        title="My trust profile"
        sectionLabel="Trust"
        primaryAction={primaryAction}
        secondaryActions={secondaryActions}
      >
        <PageContainer ghost>
          <ProCard ghost>
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%', textAlign: 'center' }}
            >
              <Empty description="Unable to load trust profile" />
              <Button onClick={() => void refetch()} type="primary">
                Retry
              </Button>
            </Space>
          </ProCard>
        </PageContainer>
      </EthikosPageShell>
    );
  }

  return (
    <EthikosPageShell
      title="My trust profile"
      sectionLabel="Trust"
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
    >
      <PageContainer ghost loading={isLoading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <ProCard gutter={16} wrap>
            <StatisticCard
              key="overall-score"
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Overall reputation score',
                value: score,
                suffix: '/100',
                description: (
                  <Space size={4} wrap>
                    <Text type="secondary">Level:</Text>
                    <Tag color={levelColor}>{level}</Tag>
                  </Space>
                ),
              }}
              chart={
                <div style={{ paddingInline: 8 }}>
                  <Progress percent={score} showInfo={false} />
                </div>
              }
            />

            <StatisticCard
              key="active-dimensions"
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Active dimensions',
                value: dimensions.length,
                description: (
                  <Text type="secondary">
                    {dimensions.length > 0
                      ? dimensions
                          .map((dimension) => dimension.label)
                          .join(', ')
                      : 'No tracked signals yet'}
                  </Text>
                ),
              }}
            />

            <StatisticCard
              key="recent-delta"
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Recent change',
                value: Math.abs(netRecentDelta),
                suffix: netRecentDelta === 0 ? '' : ' pts',
                description:
                  netRecentDelta > 0 ? (
                    <Text type="success">
                      <ArrowUpOutlined /> Improved vs previous period
                    </Text>
                  ) : netRecentDelta < 0 ? (
                    <Text type="danger">
                      <ArrowDownOutlined /> Declined vs previous period
                    </Text>
                  ) : (
                    <Text type="secondary">No significant change</Text>
                  ),
              }}
            />

            <StatisticCard
              key="top-dimension"
              colSpan={{ xs: 24, sm: 12, lg: 6 }}
              statistic={{
                title: 'Top dimension',
                value: topDimension ? clampScore(topDimension.score) : 0,
                suffix: topDimension ? '/100' : undefined,
                description: topDimension ? (
                  <Tag>{topDimension.label}</Tag>
                ) : (
                  <Text type="secondary">N/A</Text>
                ),
              }}
            />
          </ProCard>

          <ProCard gutter={16} split="vertical" wrap>
            <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
              <Space
                direction="vertical"
                size="large"
                style={{ width: '100%' }}
              >
                <Space align="center" size="middle">
                  <AntBadge.Ribbon text="Profile" color="purple">
                    <Avatar
                      size={64}
                      src={avatarSrc}
                      style={
                        avatarSrc
                          ? undefined
                          : { background: 'var(--ant-color-warning-bg)' }
                      }
                      icon={!avatarSrc ? <CrownOutlined /> : undefined}
                    >
                      {!avatarSrc && avatarInitial}
                    </Avatar>
                  </AntBadge.Ribbon>

                  <div>
                    <Title level={4} style={{ marginBottom: 4 }}>
                      {displayName}
                    </Title>
                    <Text type="secondary">
                      Reputation, participation and influence across Ethikos
                      debates.
                    </Text>
                  </div>
                </Space>

                <div>
                  <Text type="secondary">Overall score</Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress type="circle" percent={score} size={96} />
                  </div>
                </div>

                <Descriptions
                  size="small"
                  column={1}
                  labelStyle={{ width: 160 }}
                  style={{ marginTop: 8 }}
                >
                  <Descriptions.Item label="Level">
                    <Tag color={levelColor}>{level}</Tag>
                  </Descriptions.Item>

                  <Descriptions.Item label="Dimensions tracked">
                    {dimensions.length ? (
                      <Space size={[4, 4]} wrap>
                        {dimensions.map((dimension) => (
                          <Tag key={dimension.key}>{dimension.label}</Tag>
                        ))}
                      </Space>
                    ) : (
                      <Text type="secondary">No reputation data yet.</Text>
                    )}
                  </Descriptions.Item>

                  <Descriptions.Item label="Net change">
                    {netRecentDelta > 0 && (
                      <Text type="success">+{netRecentDelta}</Text>
                    )}
                    {netRecentDelta < 0 && (
                      <Text type="danger">{netRecentDelta}</Text>
                    )}
                    {netRecentDelta === 0 && <Text type="secondary">0</Text>}
                  </Descriptions.Item>
                </Descriptions>

                <Divider style={{ margin: '8px 0' }} />

                <Space wrap>
                  <Link href="/ethikos/trust/credentials" prefetch={false}>
                    <Button icon={<SafetyCertificateOutlined />}>
                      Upload credential
                    </Button>
                  </Link>
                  <Link href="/ethikos/trust/badges" prefetch={false}>
                    <Button>View badges</Button>
                  </Link>
                </Space>
              </Space>
            </ProCard>

            <ProCard colSpan={{ xs: 24, md: 16 }} split="horizontal">
              <ProCard title="Score by dimension">
                {dimensions.length ? (
                  dimensions.map((dimension) => {
                    const percent = clampScore(dimension.score);

                    return (
                      <div key={dimension.key} style={{ marginBottom: 16 }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                          }}
                        >
                          <Text>{dimension.label}</Text>
                          <Text type="secondary">{percent}/100</Text>
                        </div>
                        <Progress percent={percent} showInfo={false} />
                      </div>
                    );
                  })
                ) : (
                  <Text type="secondary">
                    As you participate in debates, we will break down how your
                    score is composed.
                  </Text>
                )}
              </ProCard>

              <ProCard title="Reputation timeline">
                {timeline.length ? (
                  <Timeline
                    mode="left"
                    items={timeline.map((event) => ({
                      key: event.id,
                      dot: <ClockCircleOutlined />,
                      label: formatTimelineDate(event.when),
                      children: (
                        <Space direction="vertical" size={0}>
                          <Text strong>{event.title}</Text>
                          <Text type="secondary">{event.detail}</Text>
                        </Space>
                      ),
                    }))}
                  />
                ) : (
                  <Text type="secondary">
                    We haven’t detected any recent changes in your Ethikos
                    activity.
                  </Text>
                )}
              </ProCard>
            </ProCard>
          </ProCard>

          <ProCard gutter={16} wrap>
            <ProCard
              colSpan={{ xs: 24, lg: 14 }}
              title={
                <Space>
                  <span>Trust signal radar</span>
                  <Tooltip title="Normalised per-dimension scores from 0 to 100">
                    <AntBadge status="processing" />
                  </Tooltip>
                </Space>
              }
            >
              {radarData.length ? (
                <Radar {...radarConfig} />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No dimension data yet"
                />
              )}
            </ProCard>

            <ProCard
              colSpan={{ xs: 24, lg: 10 }}
              title="Recent badges"
              extra={
                <Link href="/ethikos/trust/badges" prefetch={false}>
                  All badges
                </Link>
              }
              split="horizontal"
            >
              <ProCard ghost>
                {badges.length ? (
                  <List<Badge>
                    size="small"
                    dataSource={badges.slice(0, 3)}
                    renderItem={(badge) => (
                      <List.Item key={badge.id}>
                        <List.Item.Meta
                          title={
                            <Space>
                              <Text strong>{badge.label}</Text>
                              <Tag color="green">Verified</Tag>
                            </Space>
                          }
                          description={
                            <Space direction="vertical" size={0}>
                              <Text type="secondary">{badge.description}</Text>
                              <Text type="secondary">
                                Earned {formatBadgeDate(badge.earnedAt)}
                              </Text>
                            </Space>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Empty description="No badges earned yet" />
                )}
              </ProCard>

              <ProCard ghost>
                <Text type="secondary">
                  Badges are derived from your EkoH activity, stances,
                  arguments, and votes. They are used as discovery signals in
                  KeenKonnect.
                </Text>
              </ProCard>
            </ProCard>
          </ProCard>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}