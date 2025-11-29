// FILE: frontend/app/ethikos/trust/profile/page.tsx
'use client';

/**
 * Updated implementation for: frontend/app/ethikos/trust/profile/page.tsx
 *
 * Baseline references:
 * - Previous app page structure & imports.
 * - Modules variant of the Trust profile page (layout & summary patterns).
 * - Trust services: ReputationProfile types, fetchUserProfile, fetchUserBadges.
 * - Combined reputation timeline hook (profile + badges → timeline).
 *
 * Avatar behavior:
 * - Uses profile.avatarUrl when present (from backend /users/me/ avatar_url).
 * - Falls back to initial derived from displayName → username → level.
 */

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
  CrownOutlined,
  SafetyCertificateOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Radar } from '@ant-design/plots';
import dayjs from 'dayjs';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { ReputationProfile } from '@/services/trust';

const { Text, Title } = Typography;

export default function TrustProfilePage() {
  // Compose profile + badges + synthetic timeline using existing services
  const { data, isLoading, error, refetch } = useReputationEvents();
  const profile: ReputationProfile | undefined = data?.profile;
  const badges = data?.badges ?? [];
  const timeline = data?.timeline ?? [];

  // Fallbacks
  const level = profile?.level ?? 'Visitor';
  const score = profile?.score ?? 0;
  const dimensions = profile?.dimensions ?? [];
  const recent = profile?.recent ?? [];

  // Derive UI helpers (avatar + initial)
  const avatarSrc = profile?.avatarUrl ?? undefined;
  const nameSeed = profile?.displayName ?? profile?.username ?? level;
  const initial = nameSeed.charAt(0).toUpperCase();

  const netRecentDelta = useMemo(
    () => recent.reduce((sum, r) => sum + (r.change ?? 0), 0),
    [recent],
  );

  const topDimension = useMemo(() => {
    if (!dimensions.length) return undefined;
    return [...dimensions].sort((a, b) => b.score - a.score)[0];
  }, [dimensions]);

  const radarConfig = useMemo(() => {
    const dataPoints = dimensions.map((d) => ({
      metric: d.label,
      score: Math.max(0, Math.min(100, Math.round(d.score))),
    }));
    return {
      data: dataPoints,
      xField: 'metric',
      yField: 'score',
      meta: { score: { min: 0, max: 100 } },
      point: { size: 2 },
      area: {},
    } as const;
  }, [dimensions]);

  const primaryAction = (
    <Link href="/ethikos/insights">
      <Button type="primary">Open analytics</Button>
    </Link>
  );

  const secondaryActions = (
    <Space>
      <Link href="/ethikos/trust/credentials">
        <Button icon={<SafetyCertificateOutlined />}>Upload credential</Button>
      </Link>
      <Link href="/ethikos/trust/badges">
        <Button>View badges</Button>
      </Link>
    </Space>
  );

  // Error state wrapped in EthikosPageShell
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
              <Button onClick={() => refetch()} type="primary">
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
        {/* KPI strip */}
        <ProCard gutter={16} wrap>
          <StatisticCard
            key="overall-score"
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Overall reputation score',
              value: Math.round(score),
              suffix: '/100',
              description: (
                <Space size={4} wrap>
                  <Text type="secondary">Level:</Text>
                  <Tag
                    color={
                      level === 'Steward'
                        ? 'gold'
                        : level === 'Contributor'
                        ? 'blue'
                        : 'default'
                    }
                    style={{ marginInlineStart: 4 }}
                  >
                    {level}
                  </Tag>
                </Space>
              ),
            }}
            chart={
              <div style={{ paddingInline: 8 }}>
                <Progress percent={Math.round(score)} showInfo={false} />
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
                    ? 'Deliberation, Participation, Influence'
                    : 'No tracked signals yet'}
                </Text>
              ),
            }}
          />

          <StatisticCard
            key="recent-delta"
            colSpan={{ xs: 24, sm: 12, lg: 6 }}
            statistic={{
              title: 'Recent change (30 days)',
              value: Math.abs(netRecentDelta),
              suffix: netRecentDelta === 0 ? '' : ' pts',
              description:
                netRecentDelta > 0 ? (
                  <span style={{ color: '#3f8600' }}>
                    <ArrowUpOutlined /> Improved vs previous period
                  </span>
                ) : netRecentDelta < 0 ? (
                  <span style={{ color: '#cf1322' }}>
                    <ArrowDownOutlined /> Declined vs previous period
                  </span>
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
              value: topDimension?.score ?? 0,
              suffix: topDimension ? '/100' : undefined,
              description: topDimension ? (
                <Tag>{topDimension.label}</Tag>
              ) : (
                <Text type="secondary">N/A</Text>
              ),
            }}
          />
        </ProCard>

        {/* Main content: summary + breakdown + timeline */}
        <ProCard gutter={16} split="vertical" wrap>
          {/* Left summary panel */}
          <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
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
                    {!avatarSrc && initial}
                  </Avatar>
                </AntBadge.Ribbon>
                <div>
                  <Title level={4} style={{ marginBottom: 4 }}>
                    My trust profile
                  </Title>
                  <Text type="secondary">
                    Reputation, participation and influence across Ethikos debates.
                  </Text>
                </div>
              </Space>

              <div>
                <Text type="secondary">Overall score</Text>
                <div style={{ marginTop: 8 }}>
                  <Progress
                    type="circle"
                    percent={Math.round(score)}
                    size={96}
                  />
                </div>
              </div>

              <Descriptions
                size="small"
                column={1}
                labelStyle={{ width: 160 }}
                style={{ marginTop: 8 }}
              >
                <Descriptions.Item label="Level">
                  <Tag
                    color={
                      level === 'Steward'
                        ? 'gold'
                        : level === 'Contributor'
                        ? 'blue'
                        : 'default'
                    }
                  >
                    {level}
                  </Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Dimensions tracked">
                  {dimensions.length ? (
                    <Space size={[4, 4]} wrap>
                      {dimensions.map((dim) => (
                        <Tag key={dim.key}>{dim.label}</Tag>
                      ))}
                    </Space>
                  ) : (
                    <Text type="secondary">No reputation data yet.</Text>
                  )}
                </Descriptions.Item>

                <Descriptions.Item label="Net change (30d)">
                  <Space>
                    {netRecentDelta > 0 && (
                      <Text type="success">+{netRecentDelta}</Text>
                    )}
                    {netRecentDelta < 0 && (
                      <Text type="danger">{netRecentDelta}</Text>
                    )}
                    {netRecentDelta === 0 && (
                      <Text type="secondary">0</Text>
                    )}
                  </Space>
                </Descriptions.Item>
              </Descriptions>

              <Divider style={{ margin: '8px 0' }} />

              <Space wrap>
                <Link href="/ethikos/trust/credentials">
                  <Button icon={<SafetyCertificateOutlined />}>
                    Upload credential
                  </Button>
                </Link>
                <Link href="/ethikos/trust/badges">
                  <Button>View badges</Button>
                </Link>
              </Space>
            </Space>
          </ProCard>

          {/* Right: breakdown + timeline */}
          <ProCard colSpan={{ xs: 24, md: 16 }} split="horizontal">
            <ProCard title="Score by dimension">
              {dimensions.length ? (
                dimensions.map((dim) => (
                  <div key={dim.key} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: 6,
                      }}
                    >
                      <Text>{dim.label}</Text>
                      <Text type="secondary">
                        {Math.round(dim.score)}/100
                      </Text>
                    </div>
                    <Progress
                      percent={Math.round(dim.score)}
                      showInfo={false}
                    />
                  </div>
                ))
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
                  items={timeline.map((evt) => ({
                    key: evt.id,
                    dot: <ClockCircleOutlined />,
                    label: dayjs(evt.when).isValid()
                      ? dayjs(evt.when).format('YYYY-MM-DD')
                      : evt.when,
                    children: (
                      <Space direction="vertical" size={0}>
                        <Text strong>{evt.title}</Text>
                        <Text type="secondary">{evt.detail}</Text>
                      </Space>
                    ),
                  }))}
                />
              ) : (
                <Text type="secondary">
                  We haven’t detected any recent changes in your Ethikos activity.
                </Text>
              )}
            </ProCard>
          </ProCard>
        </ProCard>

        {/* Secondary row: radar + recent badges */}
        <ProCard gutter={16} wrap style={{ marginTop: 16 }}>
          <ProCard
            colSpan={{ xs: 24, lg: 14 }}
            title={
              <Space>
                <span>Trust signal radar</span>
                <Tooltip title="Normalised per-dimension scores (0–100)">
                  <AntBadge status="processing" />
                </Tooltip>
              </Space>
            }
          >
            {dimensions.length ? (
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
            extra={<Link href="/ethikos/trust/badges">All badges</Link>}
            split="horizontal"
          >
            <ProCard ghost>
              {badges.length ? (
                <List
                  size="small"
                  dataSource={badges.slice(0, 3)}
                  renderItem={(b) => (
                    <List.Item key={b.id}>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{b.label}</Text>
                            <Tag color="green">Verified</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">{b.description}</Text>
                            <Text type="secondary">
                              Earned {dayjs(b.earnedAt).format('MMM D, YYYY')}
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
                Badges are derived from your Ekoh activity (stances, arguments,
                votes) and are used as discovery signals in KeenKonnect.
              </Text>
            </ProCard>
          </ProCard>
        </ProCard>
      </PageContainer>
    </EthikosPageShell>
  );
}
