// frontend/modules/kontact/pages/ConnectCenter.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Alert,
  Empty,
  Input,
  Segmented,
  Space,
  Tag,
  Typography,
} from 'antd';
import { LinkOutlined, TeamOutlined } from '@ant-design/icons';

import { useOpportunities, useProfiles } from '@/kontact/hooks';
import {
  OpportunityList as RawOpportunityList,
  ProfileCard as RawProfileCard,
} from '@/kontact/components';
import usePageTitle from '@/hooks/usePageTitle';

const { Title, Paragraph } = Typography;

/* ------------------------------------------------------------------ */
/*  Domain types                                                       */
/* ------------------------------------------------------------------ */

export interface KontactOpportunity {
  id: string;
  title: string;
  summary?: string;
  type?: string;
  sourceModule?: string; // e.g. "KeenKonnect", "Ethikos", "Kreative"
  url?: string;
  tags?: string[];
  matchScore?: number; // 0–100
}

export interface KontactProfile {
  id: string;
  name: string;
  headline?: string;
  location?: string;
  roles?: string[];
  skills?: string[];
  url?: string;
  avatarUrl?: string;
  matchScore?: number; // 0–100
}

/**
 * Expected shape for the kontact hooks.
 * The current stub implementations can safely return `undefined` or partials;
 * this page defensively normalises everything.
 */
interface UseOpportunitiesResult {
  items?: KontactOpportunity[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
}

interface UseProfilesResult {
  items?: KontactProfile[];
  isLoading?: boolean;
  isError?: boolean;
  error?: Error | null;
}

/**
 * Props used by the kontact presentational components.
 * We cast the current stubs to these shapes so this page can compile
 * before their implementations are written.
 */
interface OpportunityListProps {
  items: KontactOpportunity[];
  loading?: boolean;
  emptyMessage?: string;
}

interface ProfileCardProps {
  profile: KontactProfile;
}

/* Cast stub components to the props we intend to support. */
const OpportunityList =
  RawOpportunityList as unknown as React.ComponentType<OpportunityListProps>;
const ProfileCard =
  RawProfileCard as unknown as React.ComponentType<ProfileCardProps>;

type ViewMode = 'all' | 'opportunities' | 'people';

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ConnectCenter() {
  usePageTitle('Kontact · Connect Center');

  const [query, setQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('all');

  // Normalise hook return values so current stubs don't crash the page
  const oppRaw =
    ((useOpportunities as unknown as () => UseOpportunitiesResult | undefined)() ??
      {}) as UseOpportunitiesResult;
  const profRaw =
    ((useProfiles as unknown as () => UseProfilesResult | undefined)() ??
      {}) as UseProfilesResult;

  const opportunities = oppRaw.items ?? [];
  const profiles = profRaw.items ?? [];

  const loading = Boolean(oppRaw.isLoading || profRaw.isLoading);
  const oppError = oppRaw.isError ? oppRaw.error : null;
  const profError = profRaw.isError ? profRaw.error : null;
  const hasError = Boolean(oppError || profError);

  const totalOpps = opportunities.length;
  const totalProfiles = profiles.length;

  const trimmedQuery = query.trim().toLowerCase();

  const filteredOpps = useMemo(() => {
    if (!trimmedQuery) return opportunities;
    return opportunities.filter((item) => {
      const haystack = [
        item.title,
        item.summary,
        item.type,
        item.sourceModule,
        ...(item.tags ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [opportunities, trimmedQuery]);

  const filteredProfiles = useMemo(() => {
    if (!trimmedQuery) return profiles;
    return profiles.filter((p) => {
      const haystack = [
        p.name,
        p.headline,
        p.location,
        ...(p.roles ?? []),
        ...(p.skills ?? []),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(trimmedQuery);
    });
  }, [profiles, trimmedQuery]);

  const showOpps = viewMode === 'all' || viewMode === 'opportunities';
  const showProfiles = viewMode === 'all' || viewMode === 'people';

  return (
    <PageContainer ghost loading={loading}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Header copy */}
        <div>
          <Title level={3} style={{ marginBottom: 8 }}>
            Connect Center
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Discover collaboration opportunities and people across Konnaxion.
            This view aggregates leads from teams, debates, workspaces and
            consultations into a single stream you can act on.
          </Paragraph>
        </div>

        {/* Search + mode toggle + status */}
        <ProCard ghost>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Space
              style={{
                width: '100%',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
              }}
            >
              <Input.Search
                placeholder="Search by keyword, skill, topic, or organisation…"
                allowClear
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ maxWidth: 420 }}
              />

              <Space size="middle" wrap>
                <Segmented
                  value={viewMode}
                  onChange={(val) => setViewMode(val as ViewMode)}
                  options={[
                    { label: 'All', value: 'all' },
                    { label: 'Opportunities', value: 'opportunities' },
                    { label: 'People', value: 'people' },
                  ]}
                />
                <Tag icon={<LinkOutlined />} color="blue">
                  {totalOpps} opportunities · {totalProfiles} people
                </Tag>
              </Space>
            </Space>

            {hasError && (
              <Alert
                type="error"
                showIcon
                message="Some recommendations could not be loaded"
                description={
                  <>
                    {oppError && (
                      <>
                        Opportunities: {oppError.message}
                        <br />
                      </>
                    )}
                    {profError && <>People: {profError.message}</>}
                  </>
                }
              />
            )}
          </Space>
        </ProCard>

        {/* Two-column layout: opportunities + people */}
        <ProCard gutter={16} wrap>
          {showOpps && (
            <ProCard
              colSpan={{ xs: 24, lg: 14 }}
              ghost
              title={
                <Space>
                  <LinkOutlined />
                  <span>Opportunities for you</span>
                </Space>
              }
            >
              {filteredOpps.length ? (
                <OpportunityList
                  items={filteredOpps}
                  loading={loading && !opportunities.length}
                  emptyMessage="No opportunities match your filters."
                />
              ) : trimmedQuery || totalOpps > 0 ? (
                <Empty description="No opportunities match your filters." />
              ) : (
                <Empty description="No opportunities yet. Once teams, workspaces and consultations start publishing openings, they will appear here." />
              )}
            </ProCard>
          )}

          {showProfiles && (
            <ProCard
              colSpan={{ xs: 24, lg: 10 }}
              ghost
              title={
                <Space>
                  <TeamOutlined />
                  <span>People to connect with</span>
                </Space>
              }
            >
              {filteredProfiles.length ? (
                <Space
                  direction="vertical"
                  size="middle"
                  style={{ width: '100%' }}
                >
                  {filteredProfiles.map((profile) => (
                    <ProfileCard key={profile.id} profile={profile} />
                  ))}
                </Space>
              ) : trimmedQuery || totalProfiles > 0 ? (
                <Empty description="No people match your filters." />
              ) : (
                <Empty description="No recommendations yet. As you participate across the platform, suggested profiles will appear here." />
              )}
            </ProCard>
          )}
        </ProCard>
      </Space>
    </PageContainer>
  );
}
