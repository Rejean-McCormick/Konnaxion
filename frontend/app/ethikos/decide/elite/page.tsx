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

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchEliteBallots,
  type EliteBallot,
  type EliteBallotResponse,
} from '@/services/decide';
import {
  fetchTopicPreview,
  type TopicPreviewResponse,
} from '@/services/deliberate';

type Row = EliteBallot;
type ViewMode = 'all' | 'closingSoon' | 'highTurnout' | 'lowTurnout';
type Preview = TopicPreviewResponse;

const { Paragraph, Title, Text } = Typography;

function isClosingSoon(closesAt?: string): boolean {
  if (!closesAt) return false;
  const closes = dayjs(closesAt);
  if (!closes.isValid() || closes.isBefore(dayjs())) return false;
  return closes.diff(dayjs(), 'hour') <= 24;
}

function clampPercent(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export default function EliteBallots(): JSX.Element {
  const { data, loading, refresh } = useRequest<EliteBallotResponse, []>(
    fetchEliteBallots,
  );

  useInterval(refresh, 60_000);

  const ballots = React.useMemo<Row[]>(
    () =>
      (data?.ballots ?? []).map((ballot) => ({
        ...ballot,
        turnout: clampPercent(ballot.turnout),
      })),
    [data],
  );

  const [viewMode, setViewMode] = React.useState<ViewMode>('all');
  const [activeBallot, setActiveBallot] = React.useState<Row | null>(null);

  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
    mutate: setPreview,
  } = useRequest<Preview, [string]>(fetchTopicPreview, {
    manual: true,
  });

  const filteredBallots = React.useMemo(() => {
    switch (viewMode) {
      case 'closingSoon':
        return ballots.filter((b) => isClosingSoon(b.closesAt));
      case 'highTurnout':
        return ballots.filter((b) => clampPercent(b.turnout) >= 60);
      case 'lowTurnout':
        return ballots.filter((b) => clampPercent(b.turnout) < 20);
      case 'all':
      default:
        return ballots;
    }
  }, [ballots, viewMode]);

  const headerStats = React.useMemo(() => {
    const total = ballots.length;
    const avgTurnout =
      total > 0
        ? Math.round(
            ballots.reduce((sum, b) => sum + clampPercent(b.turnout), 0) / total,
          )
        : 0;

    const closingSoon = ballots.filter((b) => isClosingSoon(b.closesAt)).length;

    return [
      { label: 'Active elite ballots', value: total },
      { label: 'Avg turnout', value: avgTurnout, suffix: '%' },
      { label: 'Closing ≤ 24h', value: closingSoon },
    ];
  }, [ballots]);

  const openPreview = React.useCallback(
    async (row: Row) => {
      setActiveBallot(row);
      setPreview(undefined);
      await loadPreview(String(row.id));
    },
    [loadPreview, setPreview],
  );

  const closePreview = React.useCallback(() => {
    setActiveBallot(null);
    setPreview(undefined);
  }, [setPreview]);

  const columns: ProColumns<Row>[] = React.useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        width: 320,
        ellipsis: true,
        render: (_dom, row) => (
          <Button type="link" onClick={() => void openPreview(row)} style={{ padding: 0 }}>
            {row.title}
          </Button>
        ),
      },
      {
        title: 'Status',
        dataIndex: 'closesAt',
        width: 140,
        render: (_dom, row) => {
          const closes = dayjs(row.closesAt);
          if (!closes.isValid()) return <Tag>Unknown</Tag>;
          if (closes.isBefore(dayjs())) return <Tag>Closed</Tag>;
          if (isClosingSoon(row.closesAt)) return <Tag color="red">Closing soon</Tag>;
          return <Tag color="green">Open</Tag>;
        },
      },
      {
        title: 'Closes In',
        dataIndex: 'closesAt',
        width: 200,
        render: (_dom, row) => {
          const closes = dayjs(row.closesAt);
          if (!closes.isValid() || closes.isBefore(dayjs())) {
            return <span>—</span>;
          }

          return (
            <Statistic.Countdown
              value={closes.valueOf()}
              format="D[d] HH:mm:ss"
            />
          );
        },
      },
      {
        title: 'Turnout',
        dataIndex: 'turnout',
        width: 220,
        sorter: (a, b) => clampPercent(a.turnout) - clampPercent(b.turnout),
        render: (_dom, row) => {
          const percent = clampPercent(row.turnout);
          return (
            <Space>
              <Progress type="circle" percent={percent} width={52} />
              <span>{percent}%</span>
            </Space>
          );
        },
      },
      {
        title: 'Scope',
        dataIndex: 'scope',
        width: 120,
        render: (_dom, row) => <Tag color="purple">{row.scope ?? 'Elite'}</Tag>,
      },
      {
        title: 'Actions',
        key: 'actions',
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
                <Button size="small">Results archive</Button>
              </Link>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [openPreview],
  );

  return (
    <EthikosPageShell
      title="Decide · Elite Ballots"
      subtitle={
        <span>
          Expert-only advisory ballots built on Ethikos debates, using a −3…+3
          stance scale and EkoH-weighted aggregation.
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
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="How elite ballots work"
          description={
            <span>
              Each elite ballot aggregates expert stances from its debate thread,
              maps them onto the −3…+3 scale, and applies reputation weighting
              before surfacing a decision signal.
            </span>
          }
        />

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
              <Button
                key="refresh"
                icon={<ReloadOutlined />}
                onClick={() => void refresh()}
              >
                Refresh
              </Button>,
            ]}
          />
        )}

        <Drawer
          width={520}
          open={!!activeBallot}
          onClose={closePreview}
          destroyOnClose
          title={preview?.title || activeBallot?.title || 'Ballot details'}
        >
          {previewLoading ? (
            <Empty description="Loading preview…" />
          ) : preview ? (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {preview.category ? `${preview.category} · ` : ''}
                {preview.createdAt
                  ? dayjs(preview.createdAt).format('YYYY-MM-DD HH:mm')
                  : ''}
              </Paragraph>

              <div>
                <Title level={4} style={{ marginTop: 0 }}>
                  Latest statements
                </Title>

                {preview.latest.length > 0 ? (
                  <ul style={{ paddingLeft: 16, marginBottom: 0 }}>
                    {preview.latest.map((s) => (
                      <li key={s.id} style={{ marginBottom: 8 }}>
                        <Text strong>{s.author}</Text> — {s.body}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="No statements yet."
                  />
                )}
              </div>

              <Link href={`/ethikos/deliberate/${preview.id}`} prefetch={false}>
                <Button type="primary">Go to full thread</Button>
              </Link>
            </Space>
          ) : (
            <Empty description="No preview available." />
          )}
        </Drawer>
      </PageContainer>
    </EthikosPageShell>
  );
}