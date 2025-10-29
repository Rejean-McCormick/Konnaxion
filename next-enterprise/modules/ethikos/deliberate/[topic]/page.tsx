'use client'

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Comment, Timeline, Typography } from 'antd';
import { useRouter } from 'next/navigation';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchTopicDetail } from '@/services/deliberate';

export default function TopicDetail() {
  const { query } = useRouter();
  const topicId = query.topic as string;

  usePageTitle(`Deliberate · ${topicId}`);

  const { data, loading } = useRequest(() => fetchTopicDetail(topicId), {
    ready: !!topicId,
  });

  return (
    <PageContainer ghost loading={loading}>
      <Typography.Title level={3}>{data?.title}</Typography.Title>

      <ProCard title="Statements Thread" ghost>
        <Timeline>
          {data?.statements.map(s => (
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
