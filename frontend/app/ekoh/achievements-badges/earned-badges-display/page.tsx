// FILE: frontend/app/ekoh/achievements-badges/earned-badges-display/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Card, Empty, List, Space, Tag, Typography } from 'antd';

import EkohPageShell from '@/app/ekoh/EkohPageShell';
import useReputationEvents from '@/hooks/useReputationEvents';
import type { Badge } from '@/services/trust';

const { Paragraph, Text } = Typography;

function earnedDate(value?: string): string {
  if (!value) return 'Date not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
}

export default function EarnedBadgesDisplay(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { data, isLoading, isError, error } = useReputationEvents();
  const badges = data?.badges ?? [];

  return (
    <EkohPageShell
      title={i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.achievementsBadges")}
      subtitle={i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.activityBackedAchievementsDerivedFromYourCurrent")}
    >
      {isError && (
        <Alert
          type="error"
          showIcon
          message={i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.unableToLoadAchievements")}
          description={(error as Error | undefined)?.message ?? i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.pleaseTryAgain")}
          style={{ marginBottom: 16 }}
        />
      )}

      <Alert
        type="info"
        showIcon
        message={i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.badgesAreEvidenceBacked")}
        description={i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.thisPageOnlyShowsAchievementsDerivedFrom")}
        style={{ marginBottom: 16 }}
      />

      <Card loading={isLoading}>
        {badges.length ? (
          <List<Badge>
            dataSource={badges}
            renderItem={(badge) => (
              <List.Item key={badge.id}>
                <List.Item.Meta
                  title={
                    <Space wrap>
                      <Text strong>{badge.label}</Text>
                      <Tag color="green">{i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.earned")}</Tag>
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size={2}>
                      <Paragraph style={{ marginBottom: 0 }}>
                        {badge.description}
                      </Paragraph>
                      <Text type="secondary">
                        {i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.earned_cc706a")} {earnedDate(badge.earnedAt ?? badge.createdAt)}
                      </Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Empty description={i18nT("ui.ekoh.achievementsBadges.earnedBadgesDisplay.noEarnedActivityBackedBadgesYet")} />
        )}
      </Card>
    </EkohPageShell>
  );
}
