// FILE: frontend/app/ekoh/expertise-areas/view-current-expertise/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Card, Empty, List, Progress, Space, Tag, Typography } from 'antd';

import EkohPageShell from '@/app/ekoh/EkohPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { EkohExpertiseScore } from '@/services/trust';

const { Paragraph, Text } = Typography;

function percent(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

export default function ViewCurrentExpertise(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useReputationEvents();
  const profile = data?.ekohProfile ?? null;
  const expertise = profile?.expertise ?? [];

  return (
    <EkohPageShell
      title={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.currentExpertise")}
      subtitle={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.canonicalEkohExpertiseByDomainNoContribution")}
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.unableToLoadEkohExpertise")}
          description={(error as Error | undefined)?.message ?? i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.pleaseTryAgain")}
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        showIcon
        message={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.expertiseIsDomainSpecific")}
        description={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.theseScoresComeFromTheEkohProfile")}
        style={{ marginBottom: 16 }}
      />

      <Card loading={isLoading}>
        {expertise.length ? (
          <List<EkohExpertiseScore>
            dataSource={expertise}
            renderItem={(item) => {
              const value = percent(item.weightedScore);
              return (
                <List.Item key={item.domainCode}>
                  <div style={{ width: '100%' }}>
                    <Space
                      style={{ width: '100%', justifyContent: 'space-between' }}
                      wrap
                    >
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
          <Empty description={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.noCanonicalEkohExpertiseProfileAvailable")} />
        )}
      </Card>

      <Card title={i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.interpretation")} style={{ marginTop: 16 }}>
        <Paragraph style={{ marginBottom: 0 }}>
          {i18nT("ui.ekoh.expertiseAreas.viewCurrentExpertise.aDomainScoreIsProfileContextNot")}
        </Paragraph>
      </Card>
    </EkohPageShell>
  );
}
