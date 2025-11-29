// FILE: frontend/app/ethikos/learn/glossary/page.tsx
// app/ethikos/learn/glossary/page.tsx
// Sources: current implementation and related services in the dump
// :contentReference[oaicite:0]{index=0} :contentReference[oaicite:1]{index=1} :contentReference[oaicite:2]{index=2}

'use client';

import { useMemo, useState } from 'react';
import {
  PageContainer,
  ProTable,
} from '@ant-design/pro-components';
import type {
  ProColumns,
} from '@ant-design/pro-components';
import {
  Empty,
  Input,
  Tag,
  Typography,
  Segmented,
  Space,
  Button,
  Statistic,
  Tooltip,
} from 'antd';
import { SyncOutlined, DownloadOutlined } from '@ant-design/icons';
import { useRequest } from 'ahooks';
import { fetchGlossary } from '@/services/learn';
import type { GlossaryItem } from '@/services/learn';
import EthikosPageShell from '@/app/ethikos/EthikosPageShell';

export default function Glossary() {
  const { data, loading, error, refresh } = useRequest(fetchGlossary);
  const [query, setQuery] = useState('');
  const [letter, setLetter] = useState<string>('all');

  const items: GlossaryItem[] = data?.items ?? [];

  const letters = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) {
      const ch = (it.term?.[0] ?? '').toUpperCase();
      const isAZ = ch >= 'A' && ch <= 'Z';
      set.add(isAZ ? ch : '#');
    }
    // ensure predictable order (All, #, A..Z filtered to present ones)
    const result: { label: string; value: string }[] = [{ label: 'All', value: 'all' }];
    if (set.has('#')) result.push({ label: '#', value: '#' });
    for (let c = 65; c <= 90; c++) {
      const l = String.fromCharCode(c);
      if (set.has(l)) result.push({ label: l, value: l });
    }
    return result;
  }, [items]);

  const filteredByQuery = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((t) => {
      const def = t.definition ?? '';
      return t.term.toLowerCase().includes(q) || def.toLowerCase().includes(q);
    });
  }, [items, query]);

  const filtered = useMemo(() => {
    if (letter === 'all') return filteredByQuery;
    return filteredByQuery.filter((t) => {
      const ch = (t.term?.[0] ?? '').toUpperCase();
      const isAZ = ch >= 'A' && ch <= 'Z';
      return letter === '#' ? !isAZ : ch === letter;
    });
  }, [filteredByQuery, letter]);

  const columns: ProColumns<GlossaryItem>[] = [
    {
      title: 'Term',
      dataIndex: 'term',
      width: 280,
      sorter: (a, b) => a.term.localeCompare(b.term),
      render: (dom, record) => (
        <span>
          <Tag style={{ marginRight: 8 }}>
            {(record.term?.[0] ?? '#').toUpperCase()}
          </Tag>
          {dom}
        </span>
      ),
    },
    {
      title: 'Definition',
      dataIndex: 'definition',
      ellipsis: true,
    },
  ];

  function exportCsv(rows: GlossaryItem[]) {
    const header = ['Term', 'Definition', 'Initial'];
    const lines = rows.map((r) => {
      const term = (r.term ?? '').replace(/"/g, '""');
      const def = (r.definition ?? '').replace(/"/g, '""');
      const initial = (r.term?.[0] ?? '#').toUpperCase();
      return [`"${term}"`, `"${def}"`, `"${initial}"`].join(',');
    });
    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ethikos_glossary.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  const headerStats = (
    <Space size="large" wrap>
      <Statistic title="Total terms" value={items.length} />
      <Statistic title="Shown" value={filtered.length} />
      <Tooltip title="Reload from server">
        <Button icon={<SyncOutlined />} onClick={refresh} />
      </Tooltip>
    </Space>
  );

  return (
    <EthikosPageShell
      title="Glossary"
      sectionLabel="Learn"
      subtitle="Glossary terms are synced from your Ethikos categories."
      secondaryActions={headerStats}
    >
      <PageContainer ghost loading={loading}>
        <Space
          direction="vertical"
          size="middle"
          style={{ width: '100%', marginBottom: 8 }}
        >
          <Space wrap>
            <Input.Search
              placeholder="Search by term or definition…"
              allowClear
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ width: 360 }}
            />
            <Segmented
              options={letters}
              value={letter}
              onChange={(val) => setLetter(String(val))}
            />
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportCsv(filtered)}
            >
              Export CSV
            </Button>
          </Space>
        </Space>

        {error && (
          <Typography.Paragraph type="danger" style={{ marginBottom: 16 }}>
            Unable to load the glossary right now. Please try again later.
          </Typography.Paragraph>
        )}

        <ProTable<GlossaryItem>
          rowKey="id"
          size="small"
          columns={columns}
          dataSource={filtered}
          search={false}
          pagination={{ pageSize: 20, showSizeChanger: true, showQuickJumper: true }}
          options={{ fullScreen: true, density: true, setting: true }}
          toolBarRender={() => [
            <Typography.Text key="count" type="secondary">
              {filtered.length} of {items.length} terms
            </Typography.Text>,
          ]}
          locale={{
            emptyText: (
              <Empty
                description={
                  query || letter !== 'all'
                    ? 'No terms match your filters'
                    : 'No glossary terms available yet'
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            ),
          }}
        />
      </PageContainer>
    </EthikosPageShell>
  );
}
