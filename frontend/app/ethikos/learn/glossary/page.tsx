'use client';

import { useMemo, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Empty, Input, Tag, Typography } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchGlossary } from '@/services/learn';
import type { GlossaryItem } from '@/services/learn';

export default function Glossary() {
  usePageTitle('Learn · Glossary');

  const { data, loading, error } = useRequest(fetchGlossary);
  const [query, setQuery] = useState('');

  const items = data?.items ?? [];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;

    return items.filter((t) => {
      const def = t.definition ?? '';
      return (
        t.term.toLowerCase().includes(q) ||
        def.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  const columns: ProColumns<GlossaryItem>[] = [
    {
      title: 'Term',
      dataIndex: 'term',
      width: 260,
      sorter: (a, b) => a.term.localeCompare(b.term),
      render: (dom, record) => (
        <span>
          <Tag style={{ marginRight: 8 }}>
            {record.term.charAt(0).toUpperCase()}
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

  return (
    <PageContainer
      ghost
      loading={loading}
      extra={
        <Typography.Text type="secondary">
          Glossary terms are synced from your Ethikos categories.
        </Typography.Text>
      }
    >
      <div style={{ maxWidth: 420, marginBottom: 16 }}>
        <Input.Search
          placeholder="Search by term or definition…"
          allowClear
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

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
        pagination={{ pageSize: 20, showSizeChanger: true }}
        options={false}
        locale={{
          emptyText: (
            <Empty
              description={
                query
                  ? 'No terms match your search'
                  : 'No glossary terms available yet'
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ),
        }}
      />
    </PageContainer>
  );
}
