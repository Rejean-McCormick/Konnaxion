// FILE: frontend/app/ethikos/decide/elite/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { InfoCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  type ProColumns,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import { useInterval, useRequest } from 'ahooks';
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
import dayjs from 'dayjs';
import Link from 'next/link';
import React from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  type EliteBallot,
  type EliteBallotResponse,
  fetchEliteBallots,
} from '@/services/decide';
import { fetchTopicPreview } from '@/services/deliberate';
import type { TopicPreviewResponse } from '@/services/ethikos';

type Row = EliteBallot & {
  id: string;
};

type ViewMode = 'all' | 'closingSoon' | 'highTurnout' | 'lowTurnout';
type Preview = TopicPreviewResponse;

const { Paragraph, Title, Text } = Typography;

const VIEW_OPTIONS = (i18nT: TranslateFunction): { label: string; value: ViewMode }[] => ([
  { label: i18nT("ui.ethikos.decide.elite.all"), value: 'all' },
  { label: i18nT("ui.ethikos.decide.elite.closing24h"), value: 'closingSoon' },
  { label: i18nT("ui.ethikos.decide.elite.highTurnout"), value: 'highTurnout' },
  { label: i18nT("ui.ethikos.decide.elite.lowTurnout"), value: 'lowTurnout' },
]);

function isClosingSoon(closesAt?: string): boolean {
  if (!closesAt) {
    return false;
  }

  const closes = dayjs(closesAt);

  if (!closes.isValid() || closes.isBefore(dayjs())) {
    return false;
  }

  return closes.diff(dayjs(), 'hour') <= 24;
}

function clampPercent(value?: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function formatDateTime(i18nT: TranslateFunction, value?: string): string {
  if (!value) {
    return i18nT("ui.ethikos.decide.elite.unknown");
  }

  const date = dayjs(value);

  if (!date.isValid()) {
    return value;
  }

  return date.format('YYYY-MM-DD HH:mm');
}

function getBallotStatus(i18nT: TranslateFunction, closesAt?: string): {
  label: string;
  color?: string;
} {
  if (!closesAt) {
    return { label: i18nT('ui.ethikos.decide.elite.unknown') };
  }

  const closes = dayjs(closesAt);

  if (!closes.isValid()) {
    return { label: i18nT('ui.ethikos.decide.elite.unknown') };
  }

  if (closes.isBefore(dayjs())) {
    return { label: i18nT('ui.ethikos.decide.elite.closed') };
  }

  if (isClosingSoon(closesAt)) {
    return { label: i18nT('ui.ethikos.decide.elite.closingSoon'), color: 'red' };
  }

  return { label: i18nT('ui.ethikos.decide.elite.open'), color: 'green' };
}

export default function EliteBallots(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [viewMode, setViewMode] = React.useState<ViewMode>('all');
  const [activeBallot, setActiveBallot] = React.useState<Row | null>(null);

  const {
    data,
    loading,
    error,
    refresh,
  } = useRequest<EliteBallotResponse, []>(fetchEliteBallots);

  useInterval(() => {
    refresh();
  }, 60_000);

  const ballots = React.useMemo<Row[]>(
    () =>
      (data?.ballots ?? []).map((ballot) => ({
        ...ballot,
        id: String(ballot.id),
        turnout: clampPercent(ballot.turnout),
      })),
    [data],
  );

  const {
    data: preview,
    loading: previewLoading,
    error: previewError,
    run: loadPreview,
    mutate: setPreview,
  } = useRequest<Preview, [string]>(fetchTopicPreview, {
    manual: true,
  });

  const filteredBallots = React.useMemo(() => {
    switch (viewMode) {
      case 'closingSoon':
        return ballots.filter((ballot) => isClosingSoon(ballot.closesAt));

      case 'highTurnout':
        return ballots.filter((ballot) => clampPercent(ballot.turnout) >= 60);

      case 'lowTurnout':
        return ballots.filter((ballot) => clampPercent(ballot.turnout) < 20);

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
            ballots.reduce(
              (sum, ballot) => sum + clampPercent(ballot.turnout),
              0,
            ) / total,
          )
        : 0;

    const closingSoon = ballots.filter((ballot) =>
      isClosingSoon(ballot.closesAt),
    ).length;

    return [
      { label: i18nT("ui.ethikos.decide.elite.activeEliteBallots"), value: total },
      { label: i18nT("ui.ethikos.decide.elite.avgTurnout"), value: avgTurnout, suffix: '%' },
      { label: i18nT("ui.ethikos.decide.elite.closing24h_d50fd4"), value: closingSoon },
    ];
  }, [ballots, i18nT]);

  const openPreview = React.useCallback(
    async (row: Row): Promise<void> => {
      setActiveBallot(row);
      setPreview(undefined);
      await loadPreview(row.id);
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
        title: i18nT("ui.ethikos.decide.elite.title"),
        dataIndex: 'title',
        width: 320,
        ellipsis: true,
        render: (_dom, row) => (
          <Button
            type="link"
            onClick={() => {
              void openPreview(row);
            }}
            style={{ padding: 0 }}
          >
            {row.title}
          </Button>
        ),
      },
      {
        title: i18nT("ui.ethikos.decide.elite.status"),
        dataIndex: 'closesAt',
        width: 140,
        render: (_dom, row) => {
          const status = getBallotStatus(i18nT, row.closesAt);

          return <Tag color={status.color}>{status.label}</Tag>;
        },
      },
      {
        title: i18nT("ui.ethikos.decide.elite.closesIn"),
        dataIndex: 'closesAt',
        width: 200,
        sorter: (a, b) =>
          dayjs(a.closesAt).valueOf() - dayjs(b.closesAt).valueOf(),
        render: (_dom, row) => {
          const closes = dayjs(row.closesAt);

          if (!closes.isValid() || closes.isBefore(dayjs())) {
            return <Text type="secondary">—</Text>;
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
        title: i18nT("ui.ethikos.decide.elite.turnout"),
        dataIndex: 'turnout',
        width: 220,
        sorter: (a, b) => clampPercent(a.turnout) - clampPercent(b.turnout),
        render: (_dom, row) => {
          const percent = clampPercent(row.turnout);

          return (
            <Space>
              <Progress type="circle" percent={percent} width={52} />
              <Text>{percent}%</Text>
            </Space>
          );
        },
      },
      {
        title: i18nT("ui.ethikos.decide.elite.scope"),
        dataIndex: 'scope',
        width: 120,
        render: (_dom, row) => <Tag color="purple">{row.scope}</Tag>,
      },
      {
        title: i18nT("ui.ethikos.decide.elite.actions"),
        key: 'actions',
        width: 240,
        render: (_dom, row) => (
          <Space>
            <Tooltip title={i18nT("ui.ethikos.decide.elite.seeTheStructuredDebateThatFeedsThis")}>
              <Link href={`/ethikos/deliberate/${row.id}`} prefetch={false}>
                <Button size="small">{i18nT("ui.ethikos.decide.elite.viewDebate")}</Button>
              </Link>
            </Tooltip>

            <Tooltip title={i18nT("ui.ethikos.decide.elite.viewHistoricalDecisions")}>
              <Link href="/ethikos/decide/results" prefetch={false}>
                <Button size="small">{i18nT("ui.ethikos.decide.elite.resultsArchive")}</Button>
              </Link>
            </Tooltip>
          </Space>
        ),
      },
    ],
    [openPreview, i18nT],
  );

  return (
    <EthikosPageShell
      title={i18nT("ui.ethikos.decide.elite.decideEliteBallots")}
      sectionLabel={i18nT("ui.ethikos.decide.elite.decide")}
      subtitle={i18nT("ui.ethikos.decide.elite.expertAdvisoryBallotsBuiltOnEthikosDebates")}
      primaryAction={
        <Link href="/ethikos/decide/methodology" prefetch={false}>
          <Button type="primary" icon={<InfoCircleOutlined />}>
            {i18nT("ui.ethikos.decide.elite.votingMethodology")}
          </Button>
        </Link>
      }
      secondaryActions={
        <Space>
          <Link href="/ethikos/decide/public" prefetch={false}>
            <Button>{i18nT("ui.ethikos.decide.elite.switchToPublicBallots")}</Button>
          </Link>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.decide.elite.howEliteBallotsWork")}
            description={i18nT("ui.ethikos.decide.elite.eachEliteBallotAggregatesExpertStancesFrom")}
          />

          {error && (
            <Alert
              type="error"
              showIcon
              message={i18nT("ui.ethikos.decide.elite.unableToLoadEliteBallots")}
              description={i18nT("ui.ethikos.decide.elite.checkTheDecideServiceAndTheCanonical")}
            />
          )}

          <ProCard gutter={16} wrap>
            {headerStats.map((stat) => (
              <StatisticCard
                key={stat.label}
                colSpan={{ xs: 24, sm: 8 }}
                statistic={{
                  title: stat.label,
                  value: stat.value,
                  suffix: stat.suffix,
                }}
              />
            ))}
          </ProCard>

          {filteredBallots.length === 0 && !loading ? (
            <Empty description={i18nT("ui.ethikos.decide.elite.noEliteBallotsAreOpenRightNow")} />
          ) : (
            <ProTable<Row>
              rowKey="id"
              columns={columns}
              dataSource={filteredBallots}
              pagination={{ pageSize: 8 }}
              search={false}
              options={false}
              toolBarRender={() => [
                <Segmented<ViewMode>
                  key="view"
                  size="small"
                  value={viewMode}
                  onChange={setViewMode}
                  options={VIEW_OPTIONS(i18nT)}
                />,
                <Button
                  key="refresh"
                  icon={<ReloadOutlined />}
                  onClick={() => refresh()}
                  loading={loading}
                >
                  {i18nT("ui.ethikos.decide.elite.refresh")}
                </Button>,
              ]}
            />
          )}

          <Drawer
            width={520}
            open={!!activeBallot}
            onClose={closePreview}
            destroyOnClose
            title={preview?.title || activeBallot?.title || i18nT("ui.ethikos.decide.elite.ballotDetails")}
          >
            {previewLoading ? (
              <Empty description={i18nT("ui.ethikos.decide.elite.loadingPreview")} />
            ) : previewError ? (
              <Empty description={i18nT("ui.ethikos.decide.elite.unableToLoadPreview")} />
            ) : preview ? (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {preview.category ? i18nT("ui.ethikos.decide.elite.text", { category: preview.category }) : ''}
                  {formatDateTime(i18nT, preview.createdAt)}
                </Paragraph>

                {preview.description && (
                  <Paragraph style={{ marginBottom: 0 }}>
                    {preview.description}
                  </Paragraph>
                )}

                <div>
                  <Title level={4} style={{ marginTop: 0 }}>
                    {i18nT("ui.ethikos.decide.elite.latestStatements")}
                  </Title>

                  {preview.latest.length > 0 ? (
                    <ul style={{ paddingLeft: 16, marginBottom: 0 }}>
                      {preview.latest.map((statement) => (
                        <li key={statement.id} style={{ marginBottom: 8 }}>
                          <Text strong>{statement.author}</Text> —{' '}
                          {statement.body}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description={i18nT("ui.ethikos.decide.elite.noStatementsYet")}
                    />
                  )}
                </div>

                <Link
                  href={`/ethikos/deliberate/${preview.id}`}
                  prefetch={false}
                >
                  <Button type="primary">{i18nT("ui.ethikos.decide.elite.goToFullThread")}</Button>
                </Link>
              </Space>
            ) : activeBallot ? (
              <Space
                direction="vertical"
                size="middle"
                style={{ width: '100%' }}
              >
                <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                  {i18nT("ui.ethikos.decide.elite.previewMetadataIsUnavailableButTheDebate")}
                </Paragraph>

                <Link
                  href={`/ethikos/deliberate/${activeBallot.id}`}
                  prefetch={false}
                >
                  <Button type="primary">{i18nT("ui.ethikos.decide.elite.goToFullThread")}</Button>
                </Link>
              </Space>
            ) : (
              <Empty description={i18nT("ui.ethikos.decide.elite.noPreviewAvailable")} />
            )}
          </Drawer>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}