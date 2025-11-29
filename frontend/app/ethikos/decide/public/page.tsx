// FILE: frontend/app/ethikos/decide/public/page.tsx
// app/ethikos/decide/public/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
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
  message,
} from 'antd';
import type { RadioChangeEvent } from 'antd';
import {
  BarChartOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { useRequest, useInterval } from 'ahooks';
import dayjs from 'dayjs';

import EthikosPageShell from '../../EthikosPageShell';
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
];

const PAGE_SIZE = 8;

function resolveOptions(ballot: BallotRow): string[] {
  if (Array.isArray(ballot.options) && ballot.options.length > 0) {
    return ballot.options;
  }
  return DEFAULT_SCALE_OPTIONS;
}

export default function PublicVotingPage(): JSX.Element {
  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [selectedOptions, setSelectedOptions] = useState<SelectionMap>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data, loading, refresh } = useRequest<PublicBallotResponse, []>(
    fetchPublicBallots,
  );

  useInterval(refresh, 60_000);

  const ballots = data?.ballots ?? [];

  const headerStats = useMemo(
    () => {
      const total = ballots.length;
      const avgTurnout = total
        ? Math.round(
            ballots.reduce((sum, b) => sum + (b.turnout ?? 0), 0) / total,
          )
        : 0;

      const closingSoon = ballots.filter((ballot) => {
        const closes = dayjs(ballot.closesAt);
        if (!closes.isValid()) return false;
        return closes.diff(dayjs(), 'hour') <= 48;
      }).length;

      return [
        { label: 'Active consultations', value: total },
        { label: 'Avg participation', value: avgTurnout, suffix: '%' },
        { label: 'Closing ≤ 48h', value: closingSoon },
      ];
    },
    [ballots],
  );

  const filteredBallots = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const now = dayjs();

    return ballots.filter((ballot) => {
      if (
        normalizedSearch &&
        !ballot.title.toLowerCase().includes(normalizedSearch)
      ) {
        return false;
      }

      if (quickFilter === 'closing-soon') {
        const closes = dayjs(ballot.closesAt);
        if (!closes.isValid()) return false;
        return closes.diff(now, 'hour') <= 48;
      }

      if (quickFilter === 'high-turnout') {
        return (ballot.turnout ?? 0) >= 50;
      }

      return true;
    });
  }, [ballots, quickFilter, searchTerm]);

  const handleRadioChange = (id: string, e: RadioChangeEvent) => {
    const value = e.target.value as string;
    setSelectedOptions((prev) => ({ ...prev, [id]: value }));
  };

  const handleSliderChange = (
    id: string,
    value: number | [number, number],
    options: string[],
  ) => {
    const rawIndex = Array.isArray(value) ? value[0] : value;
    if (!options.length) return;

    const safeIndex = Math.min(options.length - 1, Math.max(0, rawIndex));
    const option = options[safeIndex];

    setSelectedOptions((prev) => ({ ...prev, [id]: option }));
  };

  const handleSubmitVote = async (id: string) => {
    const option = selectedOptions[id];
    if (!option) {
      message.warning('Select a stance before casting your vote.');
      return;
    }

    try {
      setSubmittingId(id);
      await submitPublicVote(id, option);
      message.success('Your vote has been recorded.');
      await refresh();
    } catch {
      message.error('Failed to submit your vote. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  const columns: ProColumns<BallotRow>[] = [
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
      render: (_, row) => {
        const id = String(row.id);
        const options = resolveOptions(row);

        if (!options.length) {
          return <Tag color="default">No voting options configured</Tag>;
        }

        const selected = selectedOptions[id];
        const defaultIndex = Math.floor(options.length / 2);
        const currentIndex = (() => {
          if (!selected) return defaultIndex;
          const idx = options.findIndex(
            (opt) => opt.toLowerCase() === selected.toLowerCase(),
          );
          return idx >= 0 ? idx : defaultIndex;
        })();

        const marks = options.reduce<Record<number, React.ReactNode>>(
          (acc, label, idx) => {
            acc[idx] = <span style={{ fontSize: 11 }}>{label}</span>;
            return acc;
          },
          {},
        );

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Slider
              min={0}
              max={options.length - 1}
              value={currentIndex}
              marks={marks}
              tooltip={{ formatter: (val) => options[val ?? defaultIndex] }}
              onChange={(val) => handleSliderChange(id, val, options)}
            />

            <Radio.Group
              size="small"
              value={selected}
              onChange={(e) => handleRadioChange(id, e)}
            >
              {options.map((opt) => (
                <Radio.Button key={opt} value={opt}>
                  {opt}
                </Radio.Button>
              ))}
            </Radio.Group>

            <Space size="small">
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
      render: (_, row) => {
        const closes = dayjs(row.closesAt);
        const now = dayjs();
        const diffHours = closes.diff(now, 'hour');
        const closingSoon = diffHours <= 48;

        return (
          <Space direction="vertical" size={2}>
            <span>{closes.format('YYYY-MM-DD HH:mm')}</span>
            {closingSoon && <Tag color="volcano">Closing soon</Tag>}
          </Space>
        );
      },
    },
    {
      title: 'Turnout',
      dataIndex: 'turnout',
      width: 160,
      render: (_, row) => {
        const turnout = Math.round(row.turnout ?? 0);
        const status = turnout >= 50 ? 'active' : 'normal';
        return (
          <Progress
            percent={turnout}
            size="small"
            status={status as any}
          />
        );
      },
    },
  ];

  return (
    <EthikosPageShell
      sectionLabel="Decide"
      title="Public consultations"
      subtitle={
        <span>
          Open consultations where any verified participant can express a nuanced stance on
          Korum debates. Votes use a −3…+3 stance scale and feed into the Ethikos opinion layer.
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
                  You can adjust your stance at any time while a consultation is open.
                  Results feed into the Decide · Results Archive and Ethikos · Opinion
                  Analytics.
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
                Search by title, or focus on consultations that are closing soon or have
                high participation.
              </Paragraph>
            }
          >
            <Space wrap>
              <Input.Search
                placeholder="Search consultations…"
                allowClear
                style={{ width: 280 }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <Radio.Group
                size="small"
                value={quickFilter}
                onChange={(e) =>
                  setQuickFilter(e.target.value as QuickFilter)
                }
              >
                <Radio.Button value="all">All</Radio.Button>
                <Radio.Button value="closing-soon">Closing soon</Radio.Button>
                <Radio.Button value="high-turnout">High participation</Radio.Button>
              </Radio.Group>

              <Tooltip title="Refresh open consultations">
                <Button
                  size="small"
                  icon={<SyncOutlined />}
                  onClick={() => refresh()}
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

          <ProCard
            ghost
            style={{ marginTop: 16 }}
            title="Where to go next"
          >
            <Space wrap>
              <Button href="/ethikos/decide/elite">
                View elite ballots
              </Button>
              <Button href="/ethikos/decide/results" icon={<BarChartOutlined />}>
                Results archive
              </Button>
              <Button href="/ethikos/insights">
                Opinion analytics
              </Button>
            </Space>
          </ProCard>
        </Space>
      </PageContainer>
    </EthikosPageShell>
  );
}
