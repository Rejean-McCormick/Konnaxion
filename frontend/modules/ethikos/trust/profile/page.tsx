'use client'

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Avatar, Descriptions, Tag, Timeline } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchUserProfile } from '@/services/trust';

export default function MyProfile() {
  usePageTitle('Trust · My Profile');

  const { data, loading } = useRequest(fetchUserProfile);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard split="vertical">
        <ProCard colSpan="25%">
          <Avatar size={120} src={data?.avatar} />
          <Descriptions size="small" column={1} style={{ marginTop: 16 }}>
            <Descriptions.Item label="Name">{data?.name}</Descriptions.Item>
            <Descriptions.Item label="Joined">{data?.joined}</Descriptions.Item>
            <Descriptions.Item label="Reputation">
              <Tag color="blue">{data?.score}</Tag>
            </Descriptions.Item>
          </Descriptions>
        </ProCard>
        <ProCard title="Recent Activity" ghost>
          <Timeline>
            {data?.activity.map(a => (
              <Timeline.Item key={a.id}>
                {a.when} · {a.text}
              </Timeline.Item>
            ))}
          </Timeline>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
