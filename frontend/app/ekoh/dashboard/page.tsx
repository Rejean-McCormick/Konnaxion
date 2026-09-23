// FILE: frontend/app/ekoh/dashboard/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Card, Col, Empty, List, Progress, Row, Space, Statistic, Tag, Typography } from 'antd';
import React from 'react';

import EkohPageShell from '@/app/ekoh/EkohPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { EkohExpertiseScore } from '@/services/trust';

const { Paragraph, Text } = Typography;

function percent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

export default function EkohDashboard(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useReputationEvents();
  const profile = data?.ekohProfile ?? null;
  const expertise = profile?.expertise ?? [];
  const topDomain = expertise[0];

  return (
    <EkohPageShell
      title={i18nT("ui.ekoh.dashboard.ekohDashboard")}
      subtitle={i18nT("ui.ekoh.dashboard.domainSpecificExpertiseAndTrustContextUsed")}
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.ekoh.dashboard.unableToLoadEkohProfile")}
          description={(error as Error | undefined)?.message ?? i18nT("ui.ekoh.dashboard.pleaseTryAgain")}
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        showIcon
        message={i18nT("ui.ekoh.dashboard.thereIsNoGlobalSmartVoteWeight")}
        description={i18nT("ui.ekoh.dashboard.influenceIsComputedOnlyForASpecific")}
        style={{ marginBottom: 16 }}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic title={i18nT("ui.ekoh.dashboard.expertiseDomains")} value={expertise.length} />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title={i18nT("ui.ekoh.dashboard.strongestDomain")}
              value={topDomain ? percent(topDomain.weightedScore) : 0}
              suffix={topDomain ? '%' : undefined}
            />
            {topDomain && <Tag style={{ marginTop: 8 }}>{topDomain.domainName}</Tag>}
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic
              title={i18nT("ui.ekoh.dashboard.ethicsReliabilityModifier")}
              value={profile?.ethicsScore ?? 1}
              precision={2}
              suffix="×"
            />
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card loading={isLoading}>
            <Statistic title={i18nT("ui.ekoh.dashboard.visibility")} value={profile?.confidentialityLevel ?? 'N/A'} />
          </Card>
        </Col>
      </Row>

      <Card title={i18nT("ui.ekoh.dashboard.domainExpertise")} loading={isLoading} style={{ marginTop: 16 }}>
        {expertise.length ? (
          <List<EkohExpertiseScore>
            dataSource={expertise}
            renderItem={(item) => {
              const value = percent(item.weightedScore);
              return (
                <List.Item key={item.domainCode}>
                  <div style={{ width: '100%' }}>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <Space wrap>
                        <Text strong>{item.domainName}</Text>
                        <Tag>{item.domainCode}</Tag>
                      </Space>
                      <Text type="secondary">{value}%</Text>
                    </Space>
                    <Progress percent={value} showInfo={false} />
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description={i18nT("ui.ekoh.dashboard.noCanonicalEkohExpertiseProfileAvailable")} />
        )}
      </Card>

      <Card title={i18nT("ui.ekoh.dashboard.howThisProfileIsUsed")} style={{ marginTop: 16 }}>
        <Paragraph>
          {i18nT("ui.ekoh.dashboard.eachConsultationDeclaresWhichKnowledgeDomainsMatter")}
        </Paragraph>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {i18nT("ui.ekoh.dashboard.expertiseOutsideTheRelevantDomainsDoesNot")}
        </Paragraph>
      </Card>
    </EkohPageShell>
  );
}
