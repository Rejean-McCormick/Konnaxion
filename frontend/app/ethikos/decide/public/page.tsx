// app/ethikos/decide/public/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
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
import { InfoCircleOutlined, ThunderboltOutlined, SyncOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';

import usePageTitle from '@/hooks/usePageTitle';
import {
  fetchPublicBallots,
  submitPublicVote,
  type PublicBallot,
  type PublicBallotResponse,
} from '@/services/decide';

const { Title, Paragraph } = Typography;

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
  usePageTitle('Decide · Public Voting');

  const [searchTerm, setSearchTerm] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [selectedOptions, setSelectedOptions] = useState<SelectionMap>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const { data, loading, refresh } = useRequest<PublicBallotResponse, []>(
    fetchPublicBallots,
  );

  const ballots = data?.ballots ?? [];

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
    <PageContainer ghost loading={loading}>
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div>
          <Title level={2} style={{ marginBottom: 8 }}>
            Public consultations
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Express your stance with nuance. Each vote is stored as an Ethikos stance
            (from −3 to +3) and may be weighted by Ekoh for impact analysis.
          </Paragraph>
        </div>

        <Alert
          type="info"
          showIcon
          message={
            <Space>
              <InfoCircleOutlined />
              <span>
                You can adjust your stance at any time while a consultation is open.
                Results are visible in the Decide · Results Archive and Ethikos · Opinion
                Analytics.
              </span>
            </Space>
          }
        />

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
      </Space>
    </PageContainer>
  );
}
