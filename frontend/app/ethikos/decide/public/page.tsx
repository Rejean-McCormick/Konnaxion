// FILE: frontend/app/ethikos/decide/public/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  BarChartOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { useInterval, useRequest } from 'ahooks';
import {
  Alert,
  App,
  Button,
  Empty,
  Input,
  Progress,
  Radio,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { RadioChangeEvent } from 'antd';
import dayjs from 'dayjs';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchPublicBallots,
  type PublicBallot,
  type PublicBallotResponse,
  submitPublicVote,
} from '@/services/decide';

const { Paragraph, Text } = Typography;

type BallotRow = PublicBallot;
type QuickFilter = 'all' | 'closing-soon' | 'high-turnout';
type SelectionMap = Record<string, string | undefined>;

const DEFAULT_SCALE_OPTIONS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
] as const;

const PAGE_SIZE = 8;
const CLOSING_SOON_HOURS = 48;
const HIGH_TURNOUT_THRESHOLD = 50;

function resolveOptions(ballot: BallotRow): string[] {
  if (Array.isArray(ballot.options) && ballot.options.length > 0) {
    const cleaned = ballot.options
      .map((option) => option.trim())
      .filter((option) => option.length > 0);

    if (cleaned.length > 0) {
      return cleaned;
    }
  }

  return [...DEFAULT_SCALE_OPTIONS];
}

function isClosingSoon(closesAt?: string | null): boolean {
  if (!closesAt) {
    return false;
  }

  const closes = dayjs(closesAt);

  if (!closes.isValid() || closes.isBefore(dayjs())) {
    return false;
  }

  return closes.diff(dayjs(), 'hour') <= CLOSING_SOON_HOURS;
}

function formatCloseDate(i18nT: TranslateFunction, closesAt?: string | null): string {
  if (!closesAt) {
    return i18nT("ui.ethikos.decide.public.dateUnavailable");
  }

  const closes = dayjs(closesAt);

  return closes.isValid() ? closes.format('YYYY-MM-DD HH:mm') : i18nT('ui.ethikos.decide.public.dateUnavailable');
}

function turnoutPercent(turnout?: number | null): number {
  if (typeof turnout !== 'number' || Number.isNaN(turnout)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(turnout)));
}

function ballotStatus(i18nT: TranslateFunction, ballot: BallotRow): {
  label: string;
  color?: string;
  icon?: React.ReactNode;
} {
  if (isClosingSoon(ballot.closesAt)) {
    return {
      label: i18nT('ui.ethikos.decide.public.closingSoon'),
      color: 'volcano',
      icon: <ClockCircleOutlined />,
    };
  }

  return {
    label: i18nT('ui.ethikos.decide.public.open'),
    color: 'green',
    icon: <CheckCircleOutlined />,
  };
}

export default function PublicVotingPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { message } = App.useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [selectedOptions, setSelectedOptions] = useState<SelectionMap>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data, loading, refresh } = useRequest<PublicBallotResponse, []>(
    fetchPublicBallots,
  );

  useInterval(refresh, 60_000);

  const ballots = useMemo<BallotRow[]>(() => data?.ballots ?? [], [data]);

  const headerStats = useMemo(() => {
    const total = ballots.length;

    const avgTurnout =
      total > 0
        ? Math.round(
            ballots.reduce(
              (sum, ballot) => sum + turnoutPercent(ballot.turnout),
              0,
            ) / total,
          )
        : 0;

    const closingSoon = ballots.filter((ballot) =>
      isClosingSoon(ballot.closesAt),
    ).length;

    const highParticipation = ballots.filter(
      (ballot) => turnoutPercent(ballot.turnout) >= HIGH_TURNOUT_THRESHOLD,
    ).length;

    return [
      { label: i18nT("ui.ethikos.decide.public.openConsultations"), value: total },
      { label: i18nT("ui.ethikos.decide.public.averageParticipation"), value: avgTurnout, suffix: '%' },
      { label: i18nT("ui.ethikos.decide.public.closingSoon"), value: closingSoon },
      { label: i18nT("ui.ethikos.decide.public.highParticipation"), value: highParticipation },
    ];
  }, [ballots, i18nT]);

  const filteredBallots = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return ballots.filter((ballot) => {
      const title = ballot.title ?? '';

      if (
        normalizedSearch &&
        !title.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (quickFilter === 'closing-soon') {
        return isClosingSoon(ballot.closesAt);
      }

      if (quickFilter === 'high-turnout') {
        return turnoutPercent(ballot.turnout) >= HIGH_TURNOUT_THRESHOLD;
      }

      return true;
    });
  }, [ballots, quickFilter, searchTerm]);

  const handleRadioChange = useCallback((id: string, event: RadioChangeEvent) => {
    const value = String(event.target.value);

    setSelectedOptions((previous) => ({
      ...previous,
      [id]: value,
    }));
  }, []);

  const handleSubmitVote = useCallback(
    async (id: string) => {
      const option = selectedOptions[id];

      if (!option) {
        message.warning(i18nT("ui.ethikos.decide.public.chooseYourStanceBeforeCastingYourVote"));
        return;
      }

      try {
        setSubmittingId(id);

        await submitPublicVote(id, option);

        message.success(i18nT("ui.ethikos.decide.public.yourVoteHasBeenRecorded"));
        refresh();
      } catch {
        message.error(i18nT("ui.ethikos.decide.public.failedToSubmitYourVotePleaseTry"));
      } finally {
        setSubmittingId(null);
      }
    },
    [message, refresh, selectedOptions, i18nT],
  );

  const columns = useMemo<ProColumns<BallotRow>[]>(
    () => [
      {
        title: i18nT("ui.ethikos.decide.public.consultation"),
        dataIndex: 'title',
        width: 340,
        ellipsis: true,
        render: (_dom, row) => {
          const status = ballotStatus(i18nT, row);

          return (
            <Space direction="vertical" size={4}>
              <Text strong>{row.title}</Text>
              <Space size="small" wrap>
                <Tag color={status.color} icon={status.icon}>
                  {status.label}
                </Tag>
                <Tag icon={<ClockCircleOutlined />}>
                  {i18nT("ui.ethikos.decide.public.closes")} {formatCloseDate(i18nT, row.closesAt)}
                </Tag>
              </Space>
            </Space>
          );
        },
      },
      {
        title: i18nT("ui.ethikos.decide.public.yourVote"),
        dataIndex: 'id',
        width: 480,
        render: (_dom, row) => {
          const id = String(row.id);
          const options = resolveOptions(row);
          const selected = selectedOptions[id];

          if (options.length === 0) {
            return <Tag color="default">{i18nT("ui.ethikos.decide.public.noVotingOptionsConfigured")}</Tag>;
          }

          return (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Radio.Group
                size="small"
                value={selected}
                onChange={(event) => handleRadioChange(id, event)}
              >
                {options.map((option) => (
                  <Radio.Button key={option} value={option}>
                    {option}
                  </Radio.Button>
                ))}
              </Radio.Group>

              <Space size="small" wrap>
                <Tag color={selected ? 'geekblue' : 'default'}>
                  {selected ? i18nT("ui.ethikos.decide.public.selected", { selected: selected }) : i18nT("ui.ethikos.decide.public.noVoteYet")}
                </Tag>

                <Button
                  type="primary"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  loading={submittingId === id}
                  disabled={!selected || submittingId === id}
                  onClick={() => handleSubmitVote(id)}
                >
                  {i18nT("ui.ethikos.decide.public.castVote")}
                </Button>
              </Space>
            </Space>
          );
        },
      },
      {
        title: i18nT("ui.ethikos.decide.public.participation"),
        dataIndex: 'turnout',
        width: 180,
        render: (_dom, row) => {
          const percent = turnoutPercent(row.turnout);

          return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Progress
                percent={percent}
                size="small"
                status={
                  percent >= HIGH_TURNOUT_THRESHOLD ? 'success' : 'normal'
                }
              />
              <Text type="secondary">{percent}{i18nT("ui.ethikos.decide.public.turnout")}</Text>
            </Space>
          );
        },
      },
      {
        title: i18nT("ui.ethikos.decide.public.next"),
        key: 'actions',
        width: 180,
        render: (_dom, row) => (
          <Space direction="vertical" size={4}>
            <Link href={`/ethikos/deliberate/${row.id}?sidebar=ethikos`} prefetch={false}>
              <Button size="small" icon={<FileTextOutlined />}>
                {i18nT("ui.ethikos.decide.public.viewDebate")}
              </Button>
            </Link>

            <Link href="/ethikos/decide/results?sidebar=ethikos" prefetch={false}>
              <Button size="small" type="link">
                {i18nT("ui.ethikos.decide.public.results")}
              </Button>
            </Link>
          </Space>
        ),
      },
    ],
    [
      handleRadioChange,
      handleSubmitVote,
      selectedOptions,
      submittingId,, i18nT
    ],
  );

  return (
    <EthikosPageShell
      sectionLabel={i18nT("ui.ethikos.decide.public.decide")}
      title={i18nT("ui.ethikos.decide.public.publicConsultations")}
      subtitle={
        <span>
          {i18nT("ui.ethikos.decide.public.reviewActivePublicDecisionsChooseYourStance")}
        </span>
      }
      primaryAction={
        <Link href="/ethikos/decide/results?sidebar=ethikos" prefetch={false}>
          <Button type="primary" icon={<BarChartOutlined />}>
            {i18nT("ui.ethikos.decide.public.openResults")}
          </Button>
        </Link>
      }
      secondaryActions={
        <Space>
          <Link href="/ethikos/decide/methodology?sidebar=ethikos" prefetch={false}>
            <Button icon={<InfoCircleOutlined />}>{i18nT("ui.ethikos.decide.public.methodology")}</Button>
          </Link>
          <Link href="/ethikos/decide/elite?sidebar=ethikos" prefetch={false}>
            <Button>{i18nT("ui.ethikos.decide.public.expertDecisions")}</Button>
          </Link>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={i18nT("ui.ethikos.decide.public.voteFirstInterpretLater")}
            description={
              <span>
                {i18nT("ui.ethikos.decide.public.thisPageRecordsYourVoteOnOpen")}
              </span>
            }
          />

          <ProCard gutter={[16, 16]} wrap>
            {headerStats.map((stat) => (
              <StatisticCard
                key={stat.label}
                colSpan={{ xs: 24, sm: 12, lg: 6 }}
                statistic={{
                  title: stat.label,
                  value: stat.value,
                  suffix: stat.suffix,
                }}
              />
            ))}
          </ProCard>

          <ProCard
            title={i18nT("ui.ethikos.decide.public.chooseAConsultation")}
            extra={
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {i18nT("ui.ethikos.decide.public.findAnOpenConsultationReviewTheQuestion")}
              </Paragraph>
            }
          >
            <Space wrap>
              <Input.Search
                placeholder={i18nT("ui.ethikos.decide.public.searchConsultations")}
                allowClear
                style={{ width: 280 }}
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <Radio.Group
                size="small"
                value={quickFilter}
                onChange={(event) =>
                  setQuickFilter(event.target.value as QuickFilter)
                }
              >
                <Radio.Button value="all">{i18nT("ui.ethikos.decide.public.all")}</Radio.Button>
                <Radio.Button value="closing-soon">{i18nT("ui.ethikos.decide.public.closingSoon")}</Radio.Button>
                <Radio.Button value="high-turnout">
                  {i18nT("ui.ethikos.decide.public.highParticipation")}
                </Radio.Button>
              </Radio.Group>

              <Tooltip title={i18nT("ui.ethikos.decide.public.refreshOpenConsultations")}>
                <Button
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => refresh()}
                  loading={loading}
                >
                  {i18nT("ui.ethikos.decide.public.refresh")}
                </Button>
              </Tooltip>
            </Space>
          </ProCard>

          {filteredBallots.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                ballots.length === 0
                  ? i18nT("ui.ethikos.decide.public.noOpenPublicConsultationsRightNow")
                  : i18nT("ui.ethikos.decide.public.noConsultationsMatchYourSearchOrFilters")
              }
            />
          ) : (
            <ProTable<BallotRow>
              rowKey="id"
              columns={columns}
              dataSource={filteredBallots}
              pagination={{ pageSize: PAGE_SIZE }}
              search={false}
              options={false}
              toolBarRender={false}
            />
          )}

          <ProCard title={i18nT("ui.ethikos.decide.public.afterVoting")}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {i18nT("ui.ethikos.decide.public.afterAConsultationClosesTheResultShould")}
              </Paragraph>

              <Space wrap>
                <Link href="/ethikos/decide/results?sidebar=ethikos" prefetch={false}>
                  <Button icon={<BarChartOutlined />}>{i18nT("ui.ethikos.decide.public.readResults")}</Button>
                </Link>
                <Link href="/ethikos/impact/tracker?sidebar=ethikos" prefetch={false}>
                  <Button>{i18nT("ui.ethikos.decide.public.trackImpact")}</Button>
                </Link>
                <Link href="/ethikos/learn/guides?sidebar=ethikos" prefetch={false}>
                  <Button>{i18nT("ui.ethikos.decide.public.howDecisionsWork")}</Button>
                </Link>
              </Space>
            </Space>
          </ProCard>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}