// C:\MyCode\Konnaxionv14\frontend\app\ethikos\deliberate\elite\page.tsx
'use client';

import React from 'react';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  ModalForm,
  ProFormText,
  ProFormSelect,
  type ProColumns,
} from '@ant-design/pro-components';
import { Button, Drawer, Empty, Space, Tag, Tooltip, message as antdMessage } from 'antd';
import { PlusOutlined, ReloadOutlined, FireOutlined } from '@ant-design/icons';
import { useRequest, useInterval } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchEliteTopics, createEliteTopic, fetchTopicPreview } from '@/services/deliberate';
import type { Topic } from '@/types';

dayjs.extend(relativeTime);

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TopicRow extends Topic {
  createdAt: string;
  lastActivity: string;
  hot: boolean;         // calculé côté serveur
  stanceCount: number;  // utilisé par KPI et la colonne
}

type TopicPreview = {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  latest: Array<{ id: string; author: string; body: string }>;
};

/* ------------------------------------------------------------------ */
/*  Service wrapper (type-safe)                                        */
/* ------------------------------------------------------------------ */

// Le service natif ne garantit pas `stanceCount`. On normalise ici pour
// faire correspondre exactement <{ list: TopicRow[] }, []>.
const useEliteService = () =>
  React.useCallback(async (): Promise<{ list: TopicRow[] }> => {
    const res = await fetchEliteTopics();
    const list = (res?.list ?? []).map((t: any) => ({
      ...t,
      stanceCount: typeof t.stanceCount === 'number' ? t.stanceCount : 0,
    })) as TopicRow[];
    return { list };
  }, []);

/* ------------------------------------------------------------------ */
/*  Composant principal                                                */
/* ------------------------------------------------------------------ */

export default function EliteAgora() {
  usePageTitle('Deliberate · Elite Agora');

  /* ---------- data ---------- */
  const eliteService = useEliteService();
  // useRequest attend 2 génériques <TData, TParams>. Le service n’a pas de params -> [].
  const { data, loading, refresh } = useRequest<{ list: TopicRow[] }, []>(eliteService);
  useInterval(refresh, 60_000); // polling 1 min

  /* ---------- drawer state ---------- */
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
  } = useRequest<TopicPreview, [string]>(fetchTopicPreview, { manual: true });

  /* ---------- open drawer ---------- */
  const openPreview = React.useCallback(
    (row: TopicRow) => {
      setPreviewId(row.id);
      loadPreview(row.id);
    },
    [loadPreview],
  );

  /* ---------- KPI header ---------- */
  const headerStats = React.useMemo(
    () => [
      { label: 'Open topics', value: data?.list.length ?? 0 },
      {
        label: 'Avg stances / topic',
        value: data?.list?.length
          ? Math.round(
              data!.list.reduce((sum: number, t: TopicRow) => sum + (t.stanceCount ?? 0), 0) /
                data!.list.length,
            )
          : 0,
      },
      { label: 'Hot topics', value: (data?.list ?? []).filter((t: TopicRow) => t.hot).length },
    ],
    [data],
  );

  /* ---------- filtres catégorie ---------- */
  const categoryFilters = React.useMemo(
    () =>
      Array.from(
        new Set((data?.list ?? []).map((t: TopicRow) => t.category).filter(Boolean)),
      ).map((c) => ({ text: String(c), value: String(c) })),
    [data?.list],
  );

  /* ---------- colonnes ---------- */
  const columns: ProColumns<TopicRow>[] = React.useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        render: (_: any, row: TopicRow) => (
          <a onClick={() => openPreview(row)} style={{ cursor: 'pointer' }}>
            {row.title}
          </a>
        ),
      },
      {
        title: 'Category',
        dataIndex: 'category',
        filters: categoryFilters,
        onFilter: (value: React.Key | boolean, record: TopicRow) =>
          String(record.category) === String(value),
        render: (_: any, row: TopicRow) => <Tag color="geekblue">{row.category}</Tag>,
      },
      {
        title: 'Stances',
        dataIndex: 'stanceCount',
        sorter: true,
        align: 'right',
      },
      {
        title: 'Last activity',
        dataIndex: 'lastActivity',
        // Pas de valueType non standard. On rend “fromNow” explicitement.
        render: (_: any, row: TopicRow) => dayjs(row.lastActivity).fromNow(),
      },
      {
        title: '',
        dataIndex: 'hot',
        width: 60,
        render: (_: any, row: TopicRow) =>
          row.hot ? (
            <Tooltip title="Trending">
              <FireOutlined style={{ color: '#fa541c' }} />
            </Tooltip>
          ) : null,
      },
    ],
    [categoryFilters, openPreview],
  );

  /* ---------- rendu ---------- */
  return (
    <PageContainer
      ghost
      loading={loading}
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={refresh} type="text" title="Refresh list" />
          <NewTopicButton onCreated={refresh} />
        </Space>
      }
    >
      {/* KPI summary */}
      <ProCard gutter={16} wrap style={{ marginBottom: 16 }}>
        {headerStats.map((k) => (
          <StatisticCard
            key={k.label}
            colSpan={{ xs: 24, sm: 8 }}
            statistic={{ title: k.label, value: k.value }}
          />
        ))}
      </ProCard>

      {/* liste */}
      <ProTable<TopicRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.list}
        search={{ labelWidth: 90, filterType: 'light' }}
        pagination={{ pageSize: 10 }}
      />

      {/* preview drawer */}
      <Drawer
        width={520}
        open={!!previewId}
        onClose={() => setPreviewId(null)}
        title={preview?.title || 'Preview'}
      >
        {previewLoading ? (
          <Empty description="Loading…" />
        ) : preview ? (
          <>
            <p>
              <strong>Category:</strong> {preview.category}
            </p>
            <p>
              <strong>Opened:</strong> {dayjs(preview.createdAt).format('YYYY-MM-DD HH:mm')}
            </p>
            <h4>Latest statements</h4>
            <ul>
              {preview.latest.map((s) => (
                <li key={s.id}>
                  <em>{s.author}</em> — {s.body}
                </li>
              ))}
            </ul>
            <Button
              type="primary"
              onClick={() => window.location.assign(`/ethikos/deliberate/${preview.id}`)}
            >
              Go to thread →
            </Button>
          </>
        ) : (
          <Empty />
        )}
      </Drawer>
    </PageContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  New Topic modal                                                    */
/* ------------------------------------------------------------------ */

function NewTopicButton({ onCreated }: { onCreated: () => void }) {
  const [visible, setVisible] = React.useState(false);

  const { runAsync, loading } = useRequest(createEliteTopic, {
    manual: true,
    onSuccess: () => {
      antdMessage.success('Topic created 🎉');
      setVisible(false);
      onCreated();
    },
  });

  return (
    <>
      <Button icon={<PlusOutlined />} type="primary" onClick={() => setVisible(true)}>
        New Topic
      </Button>
      <ModalForm
        title="Create new topic"
        open={visible}
        onOpenChange={setVisible}
        onFinish={async (values: { title: string; category: string }) => {
          await runAsync(values);
          return true;
        }}
        submitter={{ submitButtonProps: { loading } }}
      >
        <ProFormText name="title" label="Title" rules={[{ required: true, min: 10 }]} />
        <ProFormSelect
          name="category"
          label="Category"
          options={[
            { label: 'AI Policy', value: 'AI Policy' },
            { label: 'Biotech', value: 'Biotech' },
            { label: 'Ethics', value: 'Ethics' },
          ]}
          rules={[{ required: true }]}
        />
      </ModalForm>
    </>
  );
}
