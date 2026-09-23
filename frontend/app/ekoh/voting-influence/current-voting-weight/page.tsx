// FILE: frontend/app/ekoh/voting-influence/current-voting-weight/page.tsx
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

export default function CurrentVotingWeightPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useReputationEvents();
  const expertise = data?.ekohProfile?.expertise ?? [];

  return (
    <EkohPageShell
      title={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.contextualSmartVoteInfluence")}
      subtitle={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.smartVoteInfluenceExistsOnlyInsideA")}
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.unableToLoadEkohContext")}
          description={(error as Error | undefined)?.message ?? i18nT("ui.ekoh.votingInfluence.currentVotingWeight.pleaseTryAgain")}
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        showIcon
        message={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.thereIsNoGlobalSmartVoteWeight")}
        description={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.everyParticipantRemainsPartOfThePublic")}
        style={{ marginBottom: 16 }}
      />

      <Card title={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.ekohContextAvailableToQuestionSpecificLenses")} loading={isLoading}>
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
                      <Text type="secondary">{value}{i18nT("ui.ekoh.votingInfluence.currentVotingWeight.profileExpertise")}</Text>
                    </Space>
                    <Progress percent={value} showInfo={false} />
                  </div>
                </List.Item>
              );
            }}
          />
        ) : (
          <Empty description={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.noEkohExpertiseContextAvailable")} />
        )}
      </Card>

      <Card title={i18nT("ui.ekoh.votingInfluence.currentVotingWeight.howInfluenceIsDetermined")} style={{ marginTop: 16 }}>
        <Paragraph>
          {i18nT("ui.ekoh.votingInfluence.currentVotingWeight.aSmartVoteReadingCombinesTheQuestion")}
        </Paragraph>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {i18nT("ui.ekoh.votingInfluence.currentVotingWeight.aWeightSuchAs70AnAverage")}
        </Paragraph>
      </Card>
    </EkohPageShell>
  );
}
