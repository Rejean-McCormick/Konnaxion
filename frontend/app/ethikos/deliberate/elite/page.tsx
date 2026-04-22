// FILE: frontend/app/ethikos/deliberate/elite/page.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import {
  Alert,
  Button,
  Drawer,
  Empty,
  Space,
  Tag,
  Tooltip,
  Typography,
  message as antdMessage,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  FireOutlined,
  ReadOutlined,
} from '@ant-design/icons';
import { useRequest, useInterval } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import EthikosPageShell from '@/app/ethikos/EthikosPageShell';
import { get } from '@/services/_request';
import {
  fetchEliteTopics,
  createEliteTopic,
  fetchTopicPreview,
} from '@/services/deliberate';

dayjs.extend(relativeTime);

const { Paragraph, Text } = Typography;

type TopicStatus = 'open' | 'closed' | 'archived';

type CategoryLike =
  | string
  | {
      id?: number;
      name?: string;
      description?: string;
    }
  | null
  | undefined;

type RawEliteTopic = {
  id: string | number;
  title: string;
  category?: CategoryLike;
  createdAt?: string;
  created_at?: string;
  lastActivity?: string;
  last_activity?: string;
  hot?: boolean;
  stanceCount?: number;
  total_votes?: number | null;
  status?: TopicStatus;
};

interface TopicRow {
  id: string;
  title: string;
  categoryId?: number;
  categoryLabel?: string;
  createdAt: string;
  lastActivity: string;
  hot: boolean;
  stanceCount: number;
  status: TopicStatus;
}

type TopicPreview = {
  id: string | number;
  title: string;
  category?: string | null;
  createdAt?: string;
  created_at?: string;
  lastActivity?: string;
  last_activity?: string;
  description?: string;
  latest?: Array<{ id: string; author: string; body: string }>;
  total_votes?: number | null;
  status?: TopicStatus;
};

type EthikosCategoryOption = {
  id: number;
  name: string;
  description?: string;
};

function getCategoryLabel(category: CategoryLike): string | undefined {
  if (!category) return undefined;
  if (typeof category === 'string') return category;
  return category.name || undefined;
}

function getCategoryId(category: CategoryLike): number | undefined {
  if (!category || typeof category === 'string') return undefined;
  return typeof category.id === 'number' ? category.id : undefined;
}

function normalizeTopic(raw: RawEliteTopic): TopicRow {
  const createdAt =
    raw.createdAt ??
    raw.created_at ??
    raw.lastActivity ??
    raw.last_activity ??
    new Date().toISOString();

  const lastActivity =
    raw.lastActivity ??
    raw.last_activity ??
    raw.createdAt ??
    raw.created_at ??
    createdAt;

  const stanceCount =
    typeof raw.stanceCount === 'number'
      ? raw.stanceCount
      : typeof raw.total_votes === 'number'
      ? raw.total_votes
      : 0;

  const hot =
    typeof raw.hot === 'boolean'
      ? raw.hot
      : dayjs(lastActivity).isAfter(dayjs().subtract(24, 'hour')) &&
        stanceCount >= 3;

  return {
    id: String(raw.id),
    title: raw.title,
    categoryId: getCategoryId(raw.category),
    categoryLabel: getCategoryLabel(raw.category),
    createdAt,
    lastActivity,
    hot,
    stanceCount,
    status: raw.status ?? 'open',
  };
}

async function fetchCategoryOptions(): Promise<EthikosCategoryOption[]> {
  return get<EthikosCategoryOption[]>('ethikos/categories/');
}

const useEliteService = () =>
  React.useCallback(async (): Promise<{ list: TopicRow[] }> => {
    const res = await fetchEliteTopics();
    const list = (res?.list ?? []).map((topic) =>
      normalizeTopic(topic as unknown as RawEliteTopic),
    );
    return { list };
  }, []);

export default function EliteAgora(): JSX.Element {
  const router = useRouter();

  const eliteService = useEliteService();
  const { data, loading, refresh } = useRequest<{ list: TopicRow[] }, []>(
    eliteService,
  );

  useInterval(refresh, 60_000);

  const [previewId, setPreviewId] = React.useState<string | null>(null);

  const {
    data: preview,
    loading: previewLoading,
    run: loadPreview,
  } = useRequest<TopicPreview, [string]>(fetchTopicPreview, {
    manual: true,
  });

  const openPreview = React.useCallback(
    (row: TopicRow) => {
      setPreviewId(row.id);
      loadPreview(row.id);
    },
    [loadPreview],
  );

  const rows = data?.list ?? [];

  const headerStats = React.useMemo(
    () => [
      { label: 'Open topics', value: rows.length },
      {
        label: 'Avg stances / topic',
        value: rows.length
          ? Math.round(
              rows.reduce((sum, topic) => sum + topic.stanceCount, 0) /
                rows.length,
            )
          : 0,
      },
      {
        label: 'Hot topics',
        value: rows.filter((topic) => topic.hot).length,
      },
    ],
    [rows],
  );

  const categoryFilters = React.useMemo(
    () =>
      Array.from(
        new Set(rows.map((topic) => topic.categoryLabel).filter(Boolean)),
      ).map((label) => ({
        text: String(label),
        value: String(label),
      })),
    [rows],
  );

  const columns: ProColumns<TopicRow>[] = React.useMemo(
    () => [
      {
        title: 'Title',
        dataIndex: 'title',
        render: (_, row) => (
          <Button
            type="link"
            onClick={() => openPreview(row)}
            style={{ padding: 0 }}
          >
            {row.title}
          </Button>
        ),
      },
      {
        title: 'Category',
        dataIndex: 'categoryLabel',
        filters: categoryFilters,
        onFilter: (value, record) =>
          String(record.categoryLabel ?? '') === String(value),
        render: (_, row) =>
          row.categoryLabel ? (
            <Tag color="geekblue">{row.categoryLabel}</Tag>
          ) : (
            <Text type="secondary">Uncategorised</Text>
          ),
      },
      {
        title: 'Stances',
        dataIndex: 'stanceCount',
        sorter: (a, b) => a.stanceCount - b.stanceCount,
        align: 'right',
      },
      {
        title: 'Last activity',
        dataIndex: 'lastActivity',
        sorter: (a, b) =>
          dayjs(a.lastActivity).valueOf() - dayjs(b.lastActivity).valueOf(),
        render: (_, row) => dayjs(row.lastActivity).fromNow(),
      },
      {
        title: '',
        dataIndex: 'hot',
        width: 60,
        render: (_, row) =>
          row.hot ? (
            <Tooltip title="Trending">
              <FireOutlined style={{ color: '#fa541c' }} />
            </Tooltip>
          ) : null,
      },
    ],
    [categoryFilters, openPreview],
  );

  const previewOpenedAt =
    preview?.createdAt ??
    preview?.created_at ??
    preview?.lastActivity ??
    preview?.last_activity;

  return (
    <EthikosPageShell
      title="Deliberate · Elite Agora"
      metaTitle="Deliberate · Elite Agora"
      subtitle={
        <span>
          Expert-only structured debates in Korum using the −3…+3 stance scale
          and Ekoh quorum rules before surfacing aggregated results.
        </span>
      }
      primaryAction={
        <Link href="/ethikos/deliberate/guidelines" prefetch={false}>
          <Button icon={<ReadOutlined />}>Participation guidelines</Button>
        </Link>
      }
    >
      <PageContainer
        ghost
        loading={loading}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => refresh()}
              type="text"
              title="Refresh list"
            />
            <NewTopicButton onCreated={refresh} />
          </Space>
        }
      >
        <ProCard ghost style={{ marginBottom: 16 }}>
          <Alert
            type="info"
            showIcon
            message="Elite agora – expert-only debates"
            description={
              <>
                <div>
                  Stances use the seven-level nuance scale from −3 (“strongly
                  against”) to +3 (“strongly for”), with 0 = neutral.
                </div>
                <div>
                  Aggregated results are only surfaced once at least 12 distinct
                  experts have contributed on a topic.
                </div>
              </>
            }
          />
        </ProCard>

        <ProCard gutter={16} wrap style={{ marginBottom: 16 }}>
          {headerStats.map((stat) => (
            <StatisticCard
              key={stat.label}
              colSpan={{ xs: 24, sm: 8 }}
              statistic={{ title: stat.label, value: stat.value }}
            />
          ))}
        </ProCard>

        <ProTable<TopicRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          search={{ labelWidth: 90, filterType: 'light' }}
          pagination={{ pageSize: 10 }}
        />

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
                <strong>Category:</strong> {preview.category ?? 'Uncategorised'}
              </p>

              {previewOpenedAt ? (
                <p>
                  <strong>Opened:</strong>{' '}
                  {dayjs(previewOpenedAt).format('YYYY-MM-DD HH:mm')}
                </p>
              ) : null}

              {preview.description ? (
                <Paragraph>
                  <strong>Summary:</strong> {preview.description}
                </Paragraph>
              ) : null}

              {Array.isArray(preview.latest) && preview.latest.length > 0 ? (
                <>
                  <h4>Latest statements</h4>
                  <ul>
                    {preview.latest.map((statement) => (
                      <li key={statement.id}>
                        <em>{statement.author}</em> — {statement.body}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No preview statements available yet."
                />
              )}

              <Button
                type="primary"
                onClick={() => router.push(`/ethikos/deliberate/${preview.id}`)}
              >
                Go to thread →
              </Button>
            </>
          ) : (
            <Empty />
          )}
        </Drawer>
      </PageContainer>
    </EthikosPageShell>
  );
}

function NewTopicButton({ onCreated }: { onCreated: () => void }) {
  const [visible, setVisible] = React.useState(false);

  const { data: categories, loading: loadingCategories } = useRequest<
    EthikosCategoryOption[],
    []
  >(fetchCategoryOptions);

  const { runAsync, loading } = useRequest<
    unknown,
    [{ title: string; category: string }]
  >(createEliteTopic, {
    manual: true,
    onSuccess: () => {
      antdMessage.success('Topic created');
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
        New topic
      </Button>

      <ModalForm<{ title: string; categoryId: number }>
        title="Create new topic"
        open={visible}
        onOpenChange={setVisible}
        onFinish={async (values) => {
          await runAsync({
            title: values.title,
            category: String(values.categoryId),
          });
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
          name="categoryId"
          label="Category"
          fieldProps={{
            loading: loadingCategories,
            placeholder: 'Select a category',
          }}
          options={(categories ?? []).map((category) => ({
            label: category.name,
            value: category.id,
          }))}
          rules={[{ required: true, message: 'Please select a category' }]}
        />
      </ModalForm>
    </>
  );
}