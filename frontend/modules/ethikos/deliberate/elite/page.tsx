'use client'

import React from 'react';
import {
  PageContainer,
  ProCard,
  ProTable,
  StatisticCard,
  ModalForm,
  ProFormText,
  ProFormSelect,
} from '@ant-design/pro-components';
import { Badge,
  Button,
  Drawer,
  Empty,
  Space,
  Tag,
  Tooltip,
  message as antdMessage,
 } from 'antd';
import { useRequest, useInterval } from 'ahooks';
import {
  PlusOutlined,
  ReloadOutlined,
  FireOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

import usePageTitle from '@/hooks/usePageTitle';
import {
  fetchEliteTopics,
  createEliteTopic,
  fetchTopicPreview,
} from '@/services/deliberate';
import type { Topic } from '@/types';

/* ------------------------------------------------------------------ */
/*  Derived types                                                      */
/* ------------------------------------------------------------------ */

interface TopicRow extends Topic {
  createdAt: string;
  lastActivity: string;
  hot: boolean; // computed server-side: stanceCount increased >= 20% in 24 h
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function EliteAgora() {
  usePageTitle('Deliberate · Elite Agora');

  /* ---------- data ---------- */
  const { data, loading, refresh } = useRequest(fetchEliteTopics);
  useInterval(refresh, 60_000); // poll every minute

  /* ---------- drawer state ---------- */
  const [previewId, setPreviewId] = React.useState<string | null>(null);
  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
  } = useRequest((id: string) => fetchTopicPreview(id), { manual: true });

  /* ---------- open drawer ---------- */
  const openPreview = (row: TopicRow) => {
    setPreviewId(row.id);
    loadPreview(row.id);
  };

  /* ---------- KPI header ---------- */
  const headerStats = [
    {
      label: 'Open topics',
      value: data?.list.length ?? 0,
    },
    {
      label: 'Avg stances / topic',
      value:
        data && data.list.length
          ? Math.round(
              data.list.reduce((sum, t) => sum + t.stanceCount, 0) /
                data.list.length,
            )
          : 0,
    },
    {
      label: 'Hot topics',
      value: data?.list.filter((t) => t.hot).length ?? 0,
    },
  ];

  /* ---------- columns ---------- */
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      render: (_: any, row: TopicRow) => (
        <a onClick={() => openPreview(row)}>{row.title}</a>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      filters: true,
      render: (v, row) => <Tag color="geekblue">{v}</Tag>,
    },
    {
      title: 'Stances',
      dataIndex: 'stanceCount',
      sorter: true,
      align: 'right' as const,
    },
    {
      title: 'Last activity',
      dataIndex: 'lastActivity',
      valueType: 'fromNow',
    },
    {
      title: '',
      dataIndex: 'hot',
      width: 60,
      render: (v, row) =>
        v ? (
          <Tooltip title="Trending">
            <FireOutlined style={{ color: '#fa541c' }} />
          </Tooltip>
        ) : null,
    },
  ];

  /* ---------- render ---------- */
  return (
    <PageContainer
      ghost
      loading={loading}
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={refresh}
            type="text"
            title="Refresh list"
          />
          {/* role check goes here */}
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

      {/* list */}
      <ProTable<TopicRow>
        rowKey="id"
        columns={columns}
        dataSource={data?.list}
        search={{
          labelWidth: 90,
          filterType: 'light',
        }}
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
              <strong>Opened:</strong>{' '}
              {dayjs(preview.createdAt).format('YYYY-MM-DD HH:mm')}
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
              onClick={() =>
                window.location.assign(`/ethikos/deliberate/${preview.id}`)
              }
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
      <Button
        icon={<PlusOutlined />}
        type="primary"
        onClick={() => setVisible(true)}
      >
        New Topic
      </Button>
      <ModalForm
        title="Create new topic"
        open={visible}
        onOpenChange={setVisible}
        onFinish={async (values) => {
          await runAsync(values);
          return true;
        }}
        submitter={{ submitButtonProps: { loading } }}
      >
        <ProFormText
          name="title"
          label="Title"
          rules={[{ required: true, min: 10 }]}
        />
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
