// FILE: frontend/modules/ethikos/decide/results/page.tsx
// C:\MyCode\Konnaxionv14\frontend\modules\ethikos\decide\results\page.tsx
'use client'

import { useLanguage } from '@/context/LanguageContext';
import { PageContainer, type ProColumns, ProTable } from '@ant-design/pro-components'
import { useRequest } from 'ahooks'
import { Tag } from 'antd'
import React from 'react'

import usePageTitle from '@/hooks/usePageTitle'
import { fetchDecisionResults } from '@/services/decide'

type ResultRow = {
  id: string
  title: string
  scope: 'Elite' | 'Public'
  passed: boolean
  closesAt: string
  region: string
}

export default function ResultsArchive() {
  const { t: i18nT } = useLanguage();
  usePageTitle(i18nT("ui.ethikos.decide.results.decideResultsArchive"))

  const { data, loading } = useRequest(fetchDecisionResults)

  // Build dynamic region filters from payload
  const regionFilters = React.useMemo(
    () =>
      Array.from(
        new Set(((data?.items as ResultRow[] | undefined) ?? []).map((r) => r.region).filter(Boolean)),
      ).map((r) => ({ text: String(r), value: String(r) })),
    [data?.items],
  )

  const scopeFilters = React.useMemo(
    () => [
      { text: i18nT("ui.ethikos.decide.results.elite"), value: 'Elite' },
      { text: i18nT("ui.ethikos.decide.results.public_dc5eb7"), value: 'Public' },
    ],
    [i18nT],
  )

  const columns: ProColumns<ResultRow>[] = [
    { title: i18nT("ui.ethikos.decide.results.title"), dataIndex: 'title', width: 260 },
    {
      title: i18nT("ui.ethikos.decide.results.result"),
      dataIndex: 'passed',
      width: 120,
      render: (_, row) => (
        <Tag color={row.passed ? 'green' : 'red'}>{row.passed ? i18nT("ui.ethikos.decide.results.passed") : i18nT("ui.ethikos.decide.results.rejected")}</Tag>
      ),
      // replace invalid `filters: true` with proper options
      filters: [
        { text: i18nT("ui.ethikos.decide.results.passed_271d60"), value: true },
        { text: i18nT("ui.ethikos.decide.results.rejected_27eeb7"), value: false },
      ],
      // onFilter receives React.Key | boolean; compare strictly to row.passed
      onFilter: (value, row) => row.passed === (value === true || value === 'true'),
    },
    {
      title: i18nT("ui.ethikos.decide.results.scope"),
      dataIndex: 'scope',
      width: 120,
      filters: scopeFilters,
      onFilter: (value, row) => row.scope === String(value),
      valueEnum: {
        Elite: { text: i18nT("ui.ethikos.decide.results.elite") },
        Public: { text: i18nT("ui.ethikos.decide.results.public_dc5eb7") },
      },
    },
    {
      title: i18nT("ui.ethikos.decide.results.region"),
      dataIndex: 'region',
      width: 140,
      filters: regionFilters,
      onFilter: (value, row) => row.region === String(value),
    },
    // use a valid ProComponents valueType
    { title: i18nT("ui.ethikos.decide.results.closed"), dataIndex: 'closesAt', valueType: 'dateTime' },
  ]

  return (
    <PageContainer ghost loading={loading}>
      <ProTable<ResultRow>
        rowKey="id"
        columns={columns}
        dataSource={(data?.items as ResultRow[] | undefined) ?? []}
        pagination={{ pageSize: 10 }}
        search={false}
      />
    </PageContainer>
  )
}
