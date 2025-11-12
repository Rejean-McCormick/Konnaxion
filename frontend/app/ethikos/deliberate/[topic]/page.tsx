// C:\MyCode\Konnaxionv14\frontend\app\ethikos\deliberate\[topic]\page.tsx
'use client';

import React from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Card, Empty, List, Typography } from 'antd';
import { Comment } from '@ant-design/compatible';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import usePageTitle from '@/hooks/usePageTitle';
import { fetchTopicPreview } from '@/services/deliberate';

dayjs.extend(relativeTime);

type Statement = { id: string; author: string; body: string; createdAt?: string };
type Preview = {
  id: string;
  title: string;
  category?: string;
  createdAt?: string;
  latest: Statement[];
};

export default function TopicThreadPage({
  params,
}: {
  params: { topic: string };
}) {
  usePageTitle('Deliberate · Thread');

  // Pas de génériques → évite l’erreur "Expected 2 type arguments"
  const { data, loading } = useRequest(
    () => fetchTopicPreview(params.topic),
    { refreshDeps: [params.topic] },
  );

  const preview = data as unknown as Preview | undefined;

  return (
    <PageContainer ghost loading={loading}>
      {preview ? (
        <>
          <Typography.Title level={3} style={{ marginTop: 0 }}>
            {preview.title}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
            {preview.category ? `${preview.category} · ` : ''}
            {preview.createdAt ? dayjs(preview.createdAt).fromNow() : null}
          </Typography.Paragraph>

          <Card title="Latest statements" bordered={false} bodyStyle={{ padding: 0 }}>
            <List<Statement>
              itemLayout="horizontal"
              dataSource={preview.latest ?? []}
              locale={{ emptyText: <Empty description="No statements" /> }}
              renderItem={(s) => (
                <li key={s.id}>
                  <Comment
                    author={s.author}
                    content={<div style={{ whiteSpace: 'pre-wrap' }}>{s.body}</div>}
                  />
                </li>
              )}
              pagination={{ pageSize: 15, hideOnSinglePage: true }}
            />
          </Card>
        </>
      ) : (
        <Empty />
      )}
    </PageContainer>
  );
}
