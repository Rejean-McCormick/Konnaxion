'use client';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Timeline, Typography } from 'antd';
import { Comment } from '@ant-design/compatible';
import { useParams } from 'next/navigation';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchTopicDetail } from '@/services/deliberate';

type Statement = {
  id: string;
  author: string;
  body: string;
  createdAt: string;

type TopicDetail = {
  id: string;
  title: string;
  statements: Statement[];

export default function TopicDetail() {
  const { topic } = useParams() as { topic: string };

  usePageTitle(`Deliberate · ${topic}`);

  const { data, loading } = useRequest<TopicDetail>(
    () => fetchTopicDetail(topic),
    { ready: !!topic }
  );

  return (
    <PageContainer ghost loading={loading}>
      <Typography.Title level={3}>{data?.title}</Typography.Title>

      <ProCard title="Statements Thread" ghost>
        <Timeline>
          {data?.statements?.map((s) => (
            <Timeline.Item key={s.id}>
              <Comment
                author={s.author}
                datetime={s.createdAt}
                content={<Typography.Paragraph>{s.body}</Typography.Paragraph>}
              />
            </Timeline.Item>
          ))}
        </Timeline>
      </ProCard>
    </PageContainer>
  );
}
