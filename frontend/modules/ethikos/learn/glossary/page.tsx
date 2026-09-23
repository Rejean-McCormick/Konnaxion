// FILE: frontend/modules/ethikos/learn/glossary/page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { useRequest } from 'ahooks';
import { Input } from 'antd';
import { useState } from 'react';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchGlossary } from '@/services/learn';

type Term = { id: string; term: string; definition: string };

export default function Glossary() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.learn.glossary.learnGlossary"));

  const { data, loading } = useRequest(fetchGlossary);
  const [query, setQuery] = useState('');

  const columns = [
    { title: i18nT("ui.ethikos.learn.glossary.term"), dataIndex: 'term', width: 200 },
    { title: i18nT("ui.ethikos.learn.glossary.definition"), dataIndex: 'definition' },
  ];

  const filtered = data?.items.filter(
    (t: Term) => t.term.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <PageContainer ghost loading={loading}>
      <Input.Search
        placeholder={i18nT("ui.ethikos.learn.glossary.searchTerm")}
        allowClear
        style={{ marginBottom: 16, maxWidth: 320 }}
        onChange={e => setQuery(e.target.value)}
      />

      <ProTable<Term>
        rowKey="id"
        columns={columns}
        dataSource={filtered}
        pagination={{ pageSize: 20 }}
        search={false}
      />
    </PageContainer>
  );
}
