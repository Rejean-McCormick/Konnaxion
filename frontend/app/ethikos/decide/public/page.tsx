// app/ethikos/decide/public/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Select, Space, Input, Progress, Radio, Slider, message } from 'antd';
import type { RadioChangeEvent } from 'antd/es/radio';
import usePageTitle from '@/hooks/usePageTitle';

type Format = 'SINGLE' | 'MULTIPLE' | 'SCALE';

export interface PublicTopic {
  id: string | number;
  question: string;
  category: string;
  responseformat_id: number; // 1 = binaire, 2 = multiple, 3 = échelle
  options?: string[];        // SINGLE/MULTIPLE
  labels?: string[];         // SCALE
  turnout?: number;          // 0..100
}

interface PagedResult<T> {
  results: T[];
  count: number;
}

export default function PublicVotePage() {
  usePageTitle('Décider — Public');

  // --- UI state ---
  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCat, setActiveCat] = useState<string | undefined>(undefined);

  // --- data ---
  const [categories, setCategories] = useState<string[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [topicsData, setTopicsData] = useState<PagedResult<PublicTopic> | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Filtres (catégories/formats)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [catsRes, fmtRes] = await Promise.all([
          axios.get<string[]>('/api/home/categories/'),
          axios.get<Format[]>('/api/home/responseformat/'),
        ]);
        if (!mounted) return;
        setCategories(catsRes.data ?? []);
        setFormats(fmtRes.data ?? []);
      } catch (e) {
        console.warn('Failed to load filters', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Sujets
  const fetchTopics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get<PagedResult<PublicTopic>>('/api/home/debatetopic/', {
        params: {
          page,
          q: searchTerm || undefined,
          cat: activeCat || undefined,
        },
      });
      setTopicsData(res.data);
    } catch (e) {
      message.error("Échec du chargement des sujets.");
    } finally {
      setLoading(false);
    }
  }, [activeCat, page, searchTerm]);

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Soumission d'un vote (adapter l'endpoint si besoin)
  const submitVote = useCallback(
    async (topic: PublicTopic, value: string | string[] | number) => {
      try {
        await axios.post(`/api/home/debatetopic/${topic.id}/vote`, { value });
        message.success('Vote enregistré');
        fetchTopics(); // refresh
      } catch {
        message.error("Impossible d'enregistrer le vote");
      }
    },
    [fetchTopics]
  );

  const renderVoteInput = useCallback(
    (topic: PublicTopic) => {
      // 3: échelle (Slider)
      if (topic.responseformat_id === 3) {
        const labels = topic.labels ?? topic.options ?? [];
        const marks = labels.reduce<Record<number, React.ReactNode>>((acc, label, i) => {
          acc[i] = label;
          return acc;
        }, {});
        const max = Math.max(0, labels.length - 1);
        const onAfterChange = (value: number | [number, number]) => {
          const v = Array.isArray(value) ? value[0] : value;
          submitVote(topic, v);
        };
        return (
          <Slider
            marks={marks}
            min={0}
            max={max}
            defaultValue={Math.round(max / 2)}
            onAfterChange={onAfterChange}
          />
        );
      }

      // 2: multiple (Select multiple)
      if (topic.responseformat_id === 2) {
        const opts = topic.options ?? topic.labels ?? [];
        const onChange = (value: string[]) => submitVote(topic, value);
        return (
          <Select
            mode="multiple"
            placeholder="Sélectionnez…"
            style={{ minWidth: 220 }}
            onChange={onChange}
            options={opts.map((o) => ({ label: o, value: o }))}
          />
        );
      }

      // 1 (default): binaire / single (Radio)
      const opts = topic.options ?? ['Oui', 'Non'];
      const onRadio: (e: RadioChangeEvent) => void = (e) =>
        submitVote(topic, e.target.value as string);
      return (
        <Radio.Group onChange={onRadio}>
          {opts.map((o) => (
            <Radio key={o} value={o}>
              {o}
            </Radio>
          ))}
        </Radio.Group>
      );
    },
    [submitVote]
  );

  // Colonnes
  const columns: ProColumns<PublicTopic>[] = useMemo(
    () => [
      {
        title: 'Question',
        dataIndex: 'question',
        ellipsis: true,
        width: 360,
      },
      {
        title: 'Vote',
        key: 'vote',
        search: false,
        width: 360,
        render: (_dom, row) => renderVoteInput(row),
      },
      {
        title: 'Participation',
        dataIndex: 'turnout',
        align: 'center',
        width: 160,
        // FIX (#8): nouvelle signature de ProTable — on lit depuis "row"
        render: (_dom, row) => <Progress percent={row.turnout ?? 0} size="small" />,
      },
    ],
    [renderVoteInput]
  );

  return (
    <PageContainer
      ghost
      header={{ title: 'Décider (public)' }}
      content={
        <Space wrap style={{ marginBottom: 16 }}>
          <Select
            allowClear
            placeholder="Catégorie"
            style={{ minWidth: 200 }}
            value={activeCat}
            onChange={(v) => setActiveCat(v || undefined)}
            options={categories.map((c) => ({ label: c, value: c }))}
          />
          <Input.Search
            allowClear
            placeholder="Recherche…"
            onSearch={(v) => {
              setPage(1);
              setSearchTerm(v);
            }}
            style={{ width: 260 }}
          />
        </Space>
      }
    >
      <ProTable<PublicTopic>
        rowKey="id"
        search={false}
        options={false}
        loading={loading}
        columns={columns}
        dataSource={topicsData?.results ?? []}
        pagination={{
          current: page,
          total: topicsData?.count ?? 0,
          showSizeChanger: false,
          onChange: (p) => setPage(p),
        }}
        toolBarRender={false}
      />
    </PageContainer>
  );
}
