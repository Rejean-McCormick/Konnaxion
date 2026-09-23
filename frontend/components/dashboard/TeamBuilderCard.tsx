// FILE: frontend/components/dashboard/TeamBuilderCard.tsx
// C:\MyCode\Konnaxionv14\frontend\components\dashboard\TeamBuilderCard.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ArrowRightOutlined,
  TeamOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Button, Card, Space, Tag, Typography } from 'antd';
import Link from 'next/link';
import React from 'react';

const { Title, Paragraph, Text } = Typography;

export interface TeamBuilderCardProps {
  /**
   * Optional override for the title.
   * Defaults to "AI-powered Team Builder".
   */
  title?: string;
  /**
   * Optional compact mode (for tighter dashboard grids).
   */
  compact?: boolean;
}

/**
 * Dashboard card that promotes / deep-links into the Team Builder experience.
 * Intended to sit alongside other dashboard-components cards.
 */
const TeamBuilderCard: React.FC<TeamBuilderCardProps> = ({
  title: titleProp,
  compact = false,
}) => {
  const { t: i18nT } = useLanguage();
  const title = titleProp ?? i18nT("ui.dashboard.teambuildercard.aiPoweredTeamBuilder");
  return (
    <Card
      bordered={false}
      bodyStyle={{
        padding: compact ? 16 : 20,
      }}
    >
      <Space
        direction="vertical"
        size={compact ? 8 : 12}
        style={{ width: '100%' }}
      >
        <Space align="center">
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: '999px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background:
                'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(37, 99, 235, 0.06))',
            }}
          >
            <TeamOutlined style={{ fontSize: 20, color: '#4f46e5' }} />
          </div>

          <div>
            <Title level={5} style={{ margin: 0 }}>
              {title}
            </Title>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.dashboard.teambuildercard.letAiAssembleBalancedTeamsFromYour")}
            </Text>
          </div>
        </Space>

        <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 13 }}>
          {i18nT("ui.dashboard.teambuildercard.configureABuilderSessionPickCandidatesAnd")}
        </Paragraph>

        <Space size={6} wrap>
          <Tag icon={<ThunderboltOutlined />} color="purple">
            {i18nT("ui.dashboard.teambuildercard.aiAssistedMatching")}
          </Tag>
          <Tag color="blue">{i18nT("ui.dashboard.teambuildercard.crossModuleReady")}</Tag>
          <Tag color="default">{i18nT("ui.dashboard.teambuildercard.transparentCriteria")}</Tag>
        </Space>

        <div
          style={{
            display: 'flex',
            marginTop: 4,
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.dashboard.teambuildercard.startFromScratchOrContinueAnExisting")}
            </Text>
          </div>

          <Link href="/teambuilder" passHref legacyBehavior>
            <Button
              type="primary"
              icon={<ArrowRightOutlined />}
              size={compact ? 'small' : 'middle'}
            >
              {i18nT("ui.dashboard.teambuildercard.openTeamBuilder")}
            </Button>
          </Link>
        </div>
      </Space>
    </Card>
  );
};

export default TeamBuilderCard;
