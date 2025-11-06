'use client'

import { PageContainer, ProCard } from '@ant-design/pro-components';
import { Badge, Card, Progress, Tooltip } from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchUserBadges } from '@/services/trust';

export default function Badges() {
  usePageTitle('Trust · Badges');

  const { data, loading } = useRequest(fetchUserBadges);

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={16} wrap>
        {data?.earned?.map((b) => (
          <Badge.Ribbon text="Earned" color="green" key={b.id}>
            <Card title={b.name} style={{ width: 220, marginBottom: 16 }}>
              <p>{b.desc}</p>
            </Card>
          </Badge.Ribbon>
        ))}

        {data?.progress?.map((p) => (
          <Tooltip title={`${p.current}/${p.required}`} key={p.id}>
            <Card title={p.name} bordered={false} style={{ width: 220, marginBottom: 16 }}>
              <Progress percent={Math.round((p.current / p.required) * 100)} />
            </Card>
          </Tooltip>
        ))}
      </ProCard>
    </PageContainer>
  );
}
