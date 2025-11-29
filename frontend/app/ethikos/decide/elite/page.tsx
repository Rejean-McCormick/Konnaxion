// FILE: frontend/app/ethikos/decide/elite/page.tsx
// app/ethikos/decide/elite/page.tsx
// Updated implementation for the Elite ballots page.
// Source (original dump): app/ethikos/decide/elite/page.tsx 
// Services: fetchEliteBallots (services/decide.ts) 
// Services: fetchTopicPreview / types (services/deliberate.ts)

'use client';

import React from 'react';
import Link from 'next/link';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  type ProColumns,
} from '@ant-design/pro-components';
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Progress,
  Segmented,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRequest, useInterval } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '../../EthikosPageShell';
import { fetchEliteBallots } from '@/services/decide';
import { fetchTopicPreview, type TopicPreviewResponse } from '@/services/deliberate';
import type { Ballot } from '@/types';

type Row = Ballot & { turnout: number };
type ViewMode = 'all' | 'closingSoon' | 'highTurnout' | 'lowTurnout';
type Preview = TopicPreviewResponse;

const { Paragraph, Title } = Typography;

export default function EliteBallots(): JSX.Element {
  // Data: open elite ballots
  const { data, loading, refresh } = useRequest<{ ballots: Row[] }, []>(fetchEliteBallots);
  useInterval(refresh, 60_000); // auto-refresh every 60s

  const ballots = data?.ballots ?? [];

  /* ---------- local view filters ---------- */

  const [viewMode, setViewMode] = React.useState<ViewMode>('all');

  const filteredBallots = React.useMemo(() => {
    if (!ballots.length) return ballots;

    const now = dayjs();

    switch (viewMode) {
      case 'closingSoon':
        return ballots.filter((b) => dayjs(b.closesAt).diff(now, 'hour') <= 24);
      case 'highTurnout':
        return ballots.filter((b) => (b.turnout ?? 0) >= 60);
      case 'lowTurnout':
        return ballots.filter((b) => (b.turnout ?? 0) < 20);
      case 'all':
      default:
        return ballots;
    }
  }, [ballots, viewMode]);

  /* ---------- KPI header ---------- */

  const headerStats = React.useMemo(() => {
    const total = ballots.length;
    const avgTurnout =
      total > 0
        ? Math.round(ballots.reduce((sum, b) => sum + (b.turnout ?? 0), 0) / total)
        : 0;
    const closingSoon = ballots.filter((b) => dayjs(b.closesAt).diff(dayjs(), 'hour') <= 24).length;

    return [
      { label: 'Active elite ballots', value: total },
      { label: 'Avg turnout', value: avgTurnout, suffix: '%' },
      { label: 'Closing ≤ 24h', value: closingSoon },
    ];
  }, [ballots]);

  /* ---------- debate preview drawer ---------- */

  const [activeBallot, setActiveBallot] = React.useState<Row | null>(null);
  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
  } = useRequest<Preview, [string]>(fetchTopicPreview, { manual: true });

  const openPreview = React.useCallback(
    (row: Row) => {
      setActiveBallot(row);
      loadPreview(row.id);
    },
    [loadPreview],
  );

  /* ---------- table columns ---------- */

  const columns: ProColumns<Row>[] = React.useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        width: 320,
        ellipsis: true,
        render: (_dom, row) => (
          <Button type="link" onClick={() => openPreview(row)} style={{ padding: 0 }}>
            {row.title}
          </Button>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'closesAt',
        width: 140,
        render: (_dom, row) => {
          const now = dayjs();
          const closes = dayjs(row.closesAt);
          const hoursLeft = closes.diff(now, 'hour');
          const isClosed = closes.isBefore(now);

          if (isClosed) return <Tag>Closed</Tag>;
          if (hoursLeft <= 24) return <Tag color="red">Closing soon</Tag>;
          return <Tag color="green">Open</Tag>;
        },
      },
      {
        title: 'Closes In',
        dataIndex: 'closesAt',
        width: 200,
        render: (_dom, row) =>
          dayjs(row.closesAt).isBefore(dayjs()) ? (
            <span>—</span>
          ) : (
            <Statistic.Countdown value={dayjs(row.closesAt).valueOf()} format="D[d] HH:mm:ss" />
          ),
      },
      {
        title: 'Turnout',
        dataIndex: 'turnout',
        width: 220,
        sorter: (a, b) => (a.turnout ?? 0) - (b.turnout ?? 0),
        render: (_dom, row) => (
          <Space>
            <Progress type="circle" percent={row.turnout} width={52} />
            <span>{row.turnout}%</span>
          </Space>
        ),
      },
      {
        title: 'Scope',
        dataIndex: 'scope',
        width: 120,
        render: (_dom, row) => <Tag color="purple">{row.scope ?? 'Elite'}</Tag>,
      },
      {
        title: 'Actions',
        dataIndex: 'actions',
        width: 240,
        render: (_dom, row) => (
          <Space>
            <Tooltip title="See the structured debate that feeds this vote">
              <Link href={`/ethikos/deliberate/${row.id}`} prefetch={false}>
                <Button size="small">View debate</Button>
              </Link>
            </Tooltip>
            <Tooltip title="View historical decisions">
              <Link href="/ethikos/decide/results" prefetch={false}>
                <Button size="small" type="default">
                  Results archive
                </Button>
              </Link>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [openPreview],
  );

  /* ---------- render ---------- */

  return (
    <EthikosPageShell
      title="Decide · Elite Ballots"
      subtitle={
        <span>
          Expert-only advisory ballots built on Korum debates, using a −3…+3 stance scale and
          EkoH-weighted SmartVote aggregation.
        </span>
      }
      primaryAction={
        <Link href="/ethikos/decide/methodology" prefetch={false}>
          <Button type="primary" icon={<InfoCircleOutlined />}>
            Voting methodology
          </Button>
        </Link>
      }
      secondaryActions={
        <Space>
          <Link href="/ethikos/decide/public" prefetch={false}>
            <Button>Switch to public ballots</Button>
          </Link>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        {/* Context banner */}
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="How elite ballots work"
          description={
            <span>
              Each elite ballot aggregates expert stances from its Korum thread, maps them onto the
              −3…+3 scale, and applies EkoH reputation weights before determining whether the
              proposal passes.
            </span>
          }
        />

        {/* KPI summary */}
        <ProCard gutter={16} wrap style={{ marginBottom: 16 }}>
          {headerStats.map((s) => (
            <StatisticCard
              key={s.label}
              colSpan={{ xs: 24, sm: 8 }}
              statistic={{
                title: s.label,
                value: s.value,
                suffix: s.suffix,
              }}
            />
          ))}
        </ProCard>

        {/* Main table */}
        {filteredBallots.length === 0 && !loading ? (
          <Empty description="No elite ballots are open right now." />
        ) : (
          <ProTable<Row>
            rowKey="id"
            columns={columns}
            dataSource={filteredBallots}
            pagination={{ pageSize: 8 }}
            search={false}
            options={false}
            toolBarRender={() => [
              <Segmented
                key="view"
                size="small"
                value={viewMode}
                onChange={(val) => setViewMode(val as ViewMode)}
                options={[
                  { label: 'All', value: 'all' },
                  { label: 'Closing ≤24h', value: 'closingSoon' },
                  { label: 'High turnout', value: 'highTurnout' },
                  { label: 'Low turnout', value: 'lowTurnout' },
                ]}
              />,
              <Button key="refresh" icon={<ReloadOutlined />} onClick={() => refresh()}>
                Refresh
              </Button>,
            ]}
          />
        )}

        {/* Debate preview drawer */}
        <Drawer
          width={520}
          open={!!activeBallot}
          onClose={() => setActiveBallot(null)}
          title={preview?.title || activeBallot?.title || 'Ballot details'}
        >
          {previewLoading ? (
            <Empty description="Loading…" />
          ) : preview ? (
            <>
              <Paragraph type="secondary">
                {preview.category ? `${preview.category} · ` : ''}
                {preview.createdAt ? dayjs(preview.createdAt).format('YYYY-MM-DD HH:mm') : null}
              </Paragraph>
              <Title level={4} style={{ marginTop: 0 }}>
                Latest statements
              </Title>
              <ul style={{ paddingLeft: 16 }}>
                {preview.latest.map((s) => (
                  <li key={s.id} style={{ marginBottom: 8 }}>
                    <strong>{s.author}</strong> — {s.body}
                  </li>
                ))}
              </ul>
              <Button
                type="primary"
                onClick={() => window.location.assign(`/ethikos/deliberate/${preview.id}`)}
              >
                Go to full thread →
              </Button>
            </>
          ) : (
            <Empty />
          )}
        </Drawer>
      </PageContainer>
    </EthikosPageShell>
  );
}
