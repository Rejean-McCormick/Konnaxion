// FILE: frontend/app/ethikos/decide/public/page.tsx
'use client';

import React, { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
} from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import {
  Alert,
  App,
  Button,
  Empty,
  Input,
  Progress,
  Radio,
  Slider,
  Space,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { RadioChangeEvent } from 'antd';
import {
  BarChartOutlined,
  InfoCircleOutlined,
  SyncOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { useInterval, useRequest } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import {
  fetchPublicBallots,
  submitPublicVote,
  type PublicBallot,
  type PublicBallotResponse,
} from '@/services/decide';

const { Paragraph } = Typography;

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

function clampIndex(index: number, options: string[]): number {
  if (options.length <= 0) {
    return 0;
  }

  return Math.min(options.length - 1, Math.max(0, index));
}

function optionAt(options: string[], index: number | null | undefined): string {
  const fallbackIndex = Math.floor(options.length / 2);
  const safeIndex = clampIndex(
    typeof index === 'number' && Number.isFinite(index)
      ? Math.round(index)
      : fallbackIndex,
    options,
  );

  return options[safeIndex] ?? options[fallbackIndex] ?? DEFAULT_SCALE_OPTIONS[2];
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

function getCurrentIndex(
  selected: string | undefined,
  options: string[],
): number {
  const defaultIndex = Math.floor(options.length / 2);

  if (!selected) {
    return defaultIndex;
  }

  const index = options.findIndex(
    (option) => option.toLowerCase() === selected.toLowerCase(),
  );

  return index >= 0 ? index : defaultIndex;
}

function buildSliderMarks(options: string[]): Record<number, React.ReactNode> {
  return options.reduce<Record<number, React.ReactNode>>(
    (accumulator, label, index) => {
      accumulator[index] = <span style={{ fontSize: 11 }}>{label}</span>;
      return accumulator;
    },
    {},
  );
}

export default function PublicVotingPage(): JSX.Element {
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
              (sum, ballot) => sum + Math.round(ballot.turnout ?? 0),
              0,
            ) / total,
          )
        : 0;

    const closingSoon = ballots.filter((ballot) =>
      isClosingSoon(ballot.closesAt),
    ).length;

    return [
      { label: 'Active consultations', value: total },
      { label: 'Avg participation', value: avgTurnout, suffix: '%' },
      { label: 'Closing ≤ 48h', value: closingSoon },
    ];
  }, [ballots]);

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
        return (ballot.turnout ?? 0) >= HIGH_TURNOUT_THRESHOLD;
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

  const handleSliderChange = useCallback(
    (id: string, value: number | number[], options: string[]) => {
      if (options.length === 0) {
        return;
      }

      const rawIndex = Array.isArray(value) ? value[0] : value;
      const selectedOption = optionAt(options, rawIndex);

      setSelectedOptions((previous) => ({
        ...previous,
        [id]: selectedOption,
      }));
    },
    [],
  );

  const handleSubmitVote = useCallback(
    async (id: string) => {
      const option = selectedOptions[id];

      if (!option) {
        message.warning('Select a stance before casting your vote.');
        return;
      }

      try {
        setSubmittingId(id);

        await submitPublicVote(id, option);

        message.success('Your vote has been recorded.');
        refresh();
      } catch {
        message.error('Failed to submit your vote. Please try again.');
      } finally {
        setSubmittingId(null);
      }
    },
    [message, refresh, selectedOptions],
  );

  const columns = useMemo<ProColumns<BallotRow>[]>(
    () => [
      {
        title: 'Question',
        dataIndex: 'title',
        width: 320,
        ellipsis: true,
      },
      {
        title: 'Your stance',
        dataIndex: 'id',
        width: 440,
        render: (_dom, row) => {
          const id = String(row.id);
          const options = resolveOptions(row);

          if (options.length === 0) {
            return <Tag color="default">No voting options configured</Tag>;
          }

          const selected = selectedOptions[id];
          const currentIndex = getCurrentIndex(selected, options);
          const marks = buildSliderMarks(options);

          return (
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Slider
                min={0}
                max={options.length - 1}
                value={currentIndex}
                marks={marks}
                tooltip={{
                  formatter: (value) => optionAt(options, value),
                }}
                onChange={(value) => handleSliderChange(id, value, options)}
              />

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
                  {selected ? `Selected: ${selected}` : 'No vote yet'}
                </Tag>

                <Button
                  type="primary"
                  size="small"
                  icon={<ThunderboltOutlined />}
                  loading={submittingId === id}
                  disabled={!selected || submittingId === id}
                  onClick={() => handleSubmitVote(id)}
                >
                  Cast vote
                </Button>
              </Space>
            </Space>
          );
        },
      },
      {
        title: 'Closes',
        dataIndex: 'closesAt',
        width: 180,
        valueType: 'dateTime',
        render: (_dom, row) => {
          const closes = dayjs(row.closesAt);
          const closingSoon = isClosingSoon(row.closesAt);

          return (
            <Space direction="vertical" size={2}>
              <span>
                {closes.isValid()
                  ? closes.format('YYYY-MM-DD HH:mm')
                  : 'Date unavailable'}
              </span>
              {closingSoon ? <Tag color="volcano">Closing soon</Tag> : null}
            </Space>
          );
        },
      },
      {
        title: 'Turnout',
        dataIndex: 'turnout',
        width: 160,
        render: (_dom, row) => {
          const turnout = Math.round(row.turnout ?? 0);

          return (
            <Progress
              percent={turnout}
              size="small"
              status={turnout >= HIGH_TURNOUT_THRESHOLD ? 'success' : 'normal'}
            />
          );
        },
      },
    ],
    [
      handleRadioChange,
      handleSliderChange,
      handleSubmitVote,
      selectedOptions,
      submittingId,
    ],
  );

  return (
    <EthikosPageShell
      sectionLabel="Decide"
      title="Public consultations"
      subtitle={
        <span>
          Open consultations where any verified participant can express a nuanced
          stance on Korum debates. Votes use a −3…+3 stance scale and feed into
          the Ethikos opinion layer.
        </span>
      }
      primaryAction={
        <Link href="/ethikos/decide/results" prefetch={false}>
          <Button type="primary" icon={<BarChartOutlined />}>
            Open results archive
          </Button>
        </Link>
      }
      secondaryActions={
        <Space>
          <Link href="/ethikos/decide/elite" prefetch={false}>
            <Button>Switch to elite ballots</Button>
          </Link>
          <Link href="/ethikos/decide/methodology" prefetch={false}>
            <Button icon={<InfoCircleOutlined />}>Voting methodology</Button>
          </Link>
        </Space>
      }
    >
      <PageContainer ghost loading={loading}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Alert
            type="info"
            showIcon
            message={
              <Space>
                <InfoCircleOutlined />
                <span>
                  You can adjust your stance at any time while a consultation is
                  open. Results feed into the Decide · Results Archive and
                  Ethikos · Opinion Analytics.
                </span>
              </Space>
            }
          />

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

          <ProCard
            ghost
            style={{ marginBottom: 0 }}
            title="Find an open consultation"
            extra={
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Search by title, or focus on consultations that are closing soon
                or have high participation.
              </Paragraph>
            }
          >
            <Space wrap>
              <Input.Search
                placeholder="Search consultations…"
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
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="closing-soon">Closing soon</Radio.Button>
                <Radio.Button value="high-turnout">
                  High participation
                </Radio.Button>
              </Radio.Group>

              <Tooltip title="Refresh open consultations">
                <Button
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => refresh()}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Tooltip>
            </Space>
          </ProCard>

          {filteredBallots.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                ballots.length === 0
                  ? 'No open public consultations right now.'
                  : 'No consultations match your search or filters.'
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

          <ProCard ghost style={{ marginTop: 16 }} title="Where to go next">
            <Space wrap>
              <Link href="/ethikos/decide/elite" prefetch={false}>
                <Button>View elite ballots</Button>
              </Link>
              <Link href="/ethikos/decide/results" prefetch={false}>
                <Button icon={<BarChartOutlined />}>Results archive</Button>
              </Link>
              <Link href="/ethikos/insights" prefetch={false}>
                <Button>Opinion analytics</Button>
              </Link>
            </Space>
          </ProCard>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}