'use client';

import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Avatar,
  Descriptions,
  Progress,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useRequest } from 'ahooks';
import usePageTitle from '@/hooks/usePageTitle';
import { fetchUserProfile, type ReputationProfile } from '@/services/trust';

const { Text, Title } = Typography;

export default function MyProfile() {
  usePageTitle('Trust · My Profile');

  // ahooks generics: <Data, Params>
  const { data, loading } = useRequest<ReputationProfile, []>(fetchUserProfile);

  const level = data?.level ?? 'Visitor';
  const score = data?.score ?? 0;
  const dimensions = data?.dimensions ?? [];
  const recent = data?.recent ?? [];

  const initial = level.charAt(0).toUpperCase();

  return (
    <PageContainer ghost loading={loading}>
      <ProCard gutter={[16, 16]} wrap>
        {/* Left column: high-level summary */}
        <ProCard colSpan={{ xs: 24, md: 8 }} bordered>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Space align="center" size="middle">
              <Avatar size={64}>{initial}</Avatar>
              <div>
                <Title level={4} style={{ marginBottom: 4 }}>
                  My trust profile
                </Title>
                <Text type="secondary">
                  Reputation, participation and influence across Ethikos debates.
                </Text>
              </div>
            </Space>

            <div>
              <Text type="secondary">Current level</Text>
              <br />
              <Tag
                color={
                  level === 'Steward'
                    ? 'gold'
                    : level === 'Contributor'
                    ? 'blue'
                    : 'default'
                }
              >
                {level}
              </Tag>
            </div>

            <div>
              <Text type="secondary">Overall score</Text>
              <Progress
                percent={Math.round(score)}
                style={{ marginTop: 8 }}
              />
            </div>

            <Descriptions
              size="small"
              column={1}
              labelStyle={{ width: 160 }}
              style={{ marginTop: 8 }}
            >
              <Descriptions.Item label="Dimensions tracked">
                {dimensions.length ? (
                  <Space size={[4, 4]} wrap>
                    {dimensions.map((dim) => (
                      <Tag key={dim.key}>{dim.label}</Tag>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">No reputation data yet.</Text>
                )}
              </Descriptions.Item>
            </Descriptions>
          </Space>
        </ProCard>

        {/* Right column: breakdown + recent changes */}
        <ProCard colSpan={{ xs: 24, md: 16 }} split="horizontal">
          <ProCard title="Score by dimension" bordered>
            {dimensions.length ? (
              dimensions.map((dim) => (
                <div key={dim.key} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: 4,
                    }}
                  >
                    <Text>{dim.label}</Text>
                    <Text type="secondary">
                      {Math.round(dim.score)}/100
                    </Text>
                  </div>
                  <Progress
                    percent={Math.round(dim.score)}
                    showInfo={false}
                  />
                </div>
              ))
            ) : (
              <Text type="secondary">
                As you participate in debates, we will break down how your score
                is composed.
              </Text>
            )}
          </ProCard>

          <ProCard title="Recent changes" bordered>
            {recent.length ? (
              <Timeline>
                {recent.map((item, idx) => {
                  const positive = item.change > 0;
                  const negative = item.change < 0;

                  return (
                    <Timeline.Item
                      key={idx}
                      color={positive ? 'green' : negative ? 'red' : 'gray'}
                    >
                      <Text strong>{item.label}</Text>
                      {item.change !== 0 && (
                        <>
                          {' · '}
                          <Text type={positive ? 'success' : 'danger'}>
                            {positive ? '+' : ''}
                            {item.change}
                          </Text>
                        </>
                      )}
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            ) : (
              <Text type="secondary">
                We haven’t detected any recent changes in your Ethikos activity.
              </Text>
            )}
          </ProCard>
        </ProCard>
      </ProCard>
    </PageContainer>
  );
}
