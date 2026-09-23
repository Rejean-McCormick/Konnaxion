'use client';

// FILE: frontend/modules/konsultations/components/ConsultationVotePanel.tsx
﻿// frontend/modules/konsultations/components/ConsultationVotePanel.tsx

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import { useRequest } from 'ahooks';
import {
  Alert,
  Card,
  Divider,
  Empty,
  message,
  Progress,
  Slider,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React, { useEffect, useMemo, useState } from 'react';

import { get, post } from '@/services/_request';

const { Paragraph, Text, Title } = Typography;

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface ConsultationVotePanelProps {
  /** Ethikos topic id backing this consultation (numeric or string) */
  topicId?: string | number;
  /** Optional title override; defaults to "Your stance" */
  title?: React.ReactNode;
  /** When true, hides the collective summary section */
  hideSummary?: boolean;
  /** Optional CSS class for the outer Card */
  className?: string;
}

interface EthikosStancePoint {
  id: number;
  topic: number;
  value: number; // -3 … +3
  timestamp: string;
  user?: string;
}

interface UserMeApi {
  username: string;
  name?: string | null;
  email?: string;
  url?: string;
}

interface StanceStats {
  total: number;
  average: number;
  positive: number;
  neutral: number;
  negative: number;
  counts: Record<number, number>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */

function computeStanceStats(stances: EthikosStancePoint[]): StanceStats {
  const counts: Record<number, number> = {
    [-3]: 0,
    [-2]: 0,
    [-1]: 0,
    0: 0,
    1: 0,
    2: 0,
    3: 0,
  };

  let total = 0;
  let sum = 0;
  let positive = 0;
  let neutral = 0;
  let negative = 0;

  for (const s of stances) {
    const v = Math.max(-3, Math.min(3, s.value));
    counts[v] = (counts[v] ?? 0) + 1;
    total += 1;
    sum += v;

    if (v > 0) positive += 1;
    else if (v < 0) negative += 1;
    else neutral += 1;
  }

  const average = total > 0 ? sum / total : 0;

  return {
    total,
    average,
    positive,
    neutral,
    negative,
    counts,
  };
}

function stanceLabel(i18nT: TranslateFunction, value: number): string {
  switch (value) {
    case -3:
      return i18nT("ui.konsultations.consultationvotepanel.stronglyAgainst");
    case -2:
      return i18nT("ui.konsultations.consultationvotepanel.moderatelyAgainst");
    case -1:
      return i18nT("ui.konsultations.consultationvotepanel.somewhatAgainst");
    case 0:
      return i18nT("ui.konsultations.consultationvotepanel.neutralUndecided");
    case 1:
      return i18nT("ui.konsultations.consultationvotepanel.somewhatFor");
    case 2:
      return i18nT("ui.konsultations.consultationvotepanel.moderatelyFor");
    case 3:
      return i18nT("ui.konsultations.consultationvotepanel.stronglyFor");
    default:
      return i18nT("ui.konsultations.consultationvotepanel.neutralUndecided");
  }
}

async function fetchTopicStances(topicId: string): Promise<EthikosStancePoint[]> {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) return [];
  return get<EthikosStancePoint[]>('ethikos/stances/', {
    params: { topic: numericId },
  });
}

async function submitTopicStance(topicId: string, value: number): Promise<void> {
  const numericId = Number(topicId);
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid topic id: ${topicId}`);
  }
  await post('ethikos/stances/', {
    topic: numericId,
    value,
  });
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const sliderMarks: Record<number, React.ReactNode> = {
  [-3]: '−3',
  [-2]: '',
  [-1]: '−1',
  0: '0',
  1: '+1',
  2: '',
  3: '+3',
};

export default function ConsultationVotePanel(
  props: ConsultationVotePanelProps,
): JSX.Element {
  const { t: i18nT } = useLanguage();
  const { topicId, title, hideSummary, className } = props;

  const topicKey = useMemo(
    () => (topicId != null ? String(topicId) : undefined),
    [topicId],
  );

  const {
    data: stances,
    loading: loadingStances,
    refresh: refreshStances,
  } = useRequest<EthikosStancePoint[], []>(
    () => fetchTopicStances(topicKey!),
    {
      ready: !!topicKey,
      refreshDeps: [topicKey],
    },
  );

  const { data: me } = useRequest<UserMeApi, []>(() =>
    get<UserMeApi>('users/me/'),
  );

  const [stanceValue, setStanceValue] = useState<number>(0);
  const [stanceHydrated, setStanceHydrated] = useState(false);
  const [savingStance, setSavingStance] = useState(false);

  // Initialize slider from existing stance once user & stances are loaded
  useEffect(() => {
    if (stanceHydrated) return;
    if (!me || !stances) return;

    const mine = stances.find((s) => s.user === me.username);
    if (mine) {
      setStanceValue(Math.max(-3, Math.min(3, mine.value)));
    }
    setStanceHydrated(true);
  }, [me, stances, stanceHydrated]);

  const stanceStats = useMemo(
    () => computeStanceStats(stances ?? []),
    [stances],
  );

  const handleSaveStance = async () => {
    if (!topicKey) return;
    setSavingStance(true);
    try {
      await submitTopicStance(topicKey, stanceValue);
      message.success(i18nT("ui.konsultations.consultationvotepanel.stanceSaved"));
      await refreshStances();
    } catch {
      message.error(i18nT("ui.konsultations.consultationvotepanel.couldNotSaveYourStancePleaseTry"));
    } finally {
      setSavingStance(false);
    }
  };

  if (!topicKey) {
    return (
      <Card className={className}>
        <Empty description={i18nT("ui.konsultations.consultationvotepanel.noConsultationSelected")} />
      </Card>
    );
  }

  return (
    <Card
      className={className}
      title={title ?? i18nT("ui.konsultations.consultationvotepanel.yourStance")}
      bordered
      bodyStyle={{ paddingBottom: hideSummary ? 16 : 24 }}
    >
      <Paragraph type="secondary">
        {i18nT("ui.konsultations.consultationvotepanel.useTheScaleBelowToRegisterHow")}
      </Paragraph>

      <div style={{ marginTop: 16 }}>
        <Slider
          min={-3}
          max={3}
          step={1}
          dots
          marks={sliderMarks}
          value={stanceValue}
          tooltip={{
            formatter: (v) =>
              typeof v === 'number' ? stanceLabel(i18nT, v) : undefined,
          }}
          onChange={(v) => setStanceValue(v as number)}
        />

        <Space
          style={{
            marginTop: 8,
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <Text type="secondary">{i18nT("ui.konsultations.consultationvotepanel.stronglyAgainst")}</Text>
          <Text type="secondary">{i18nT("ui.konsultations.consultationvotepanel.neutral")}</Text>
          <Text type="secondary">{i18nT("ui.konsultations.consultationvotepanel.stronglyFor")}</Text>
        </Space>

        <Paragraph style={{ marginTop: 8 }}>
          {i18nT("ui.konsultations.consultationvotepanel.currentSelection")} <Text strong>{stanceLabel(i18nT, stanceValue)}</Text>
        </Paragraph>

        <Space style={{ marginTop: 8 }}>
          <Statistic
            title={i18nT("ui.konsultations.consultationvotepanel.rawStance")}
            value={stanceValue}
            precision={0}
            style={{ marginRight: 16 }}
          />
          <Tag color="geekblue">{i18nT("ui.konsultations.consultationvotepanel.text33Scale")}</Tag>
        </Space>

        <Space style={{ marginTop: 12 }}>
          <button
            type="button"
            className="ant-btn ant-btn-primary"
            onClick={handleSaveStance}
            disabled={savingStance}
          >
            {savingStance ? i18nT("ui.konsultations.consultationvotepanel.saving") : i18nT("ui.konsultations.consultationvotepanel.saveStance")}
          </button>
          <button
            type="button"
            className="ant-btn"
            onClick={() => setStanceValue(0)}
            disabled={savingStance}
          >
            {i18nT("ui.konsultations.consultationvotepanel.resetToNeutral")}
          </button>
        </Space>

        <Alert
          style={{ marginTop: 16 }}
          type="info"
          showIcon
          message={i18nT("ui.konsultations.consultationvotepanel.oneStancePerTopic")}
          description={i18nT("ui.konsultations.consultationvotepanel.youCanAdjustYourPositionAtAny")}
        />
      </div>

      {!hideSummary && (
        <>
          <Divider />
          <Title level={5} style={{ marginTop: 0 }}>
            {i18nT("ui.konsultations.consultationvotepanel.collectiveStance")}
          </Title>
          <Paragraph type="secondary">
            {i18nT("ui.konsultations.consultationvotepanel.snapshotOfAllRecordedStancesForThis")}
          </Paragraph>

          <Space
            size="large"
            style={{ marginTop: 12, flexWrap: 'wrap' }}
          >
            <Statistic
              title={i18nT("ui.konsultations.consultationvotepanel.participants")}
              value={stanceStats.total}
              loading={loadingStances}
            />
            <Statistic
              title={i18nT("ui.konsultations.consultationvotepanel.averageStance")}
              value={stanceStats.average}
              precision={2}
              loading={loadingStances}
            />
            <Statistic
              title={i18nT("ui.konsultations.consultationvotepanel.forAgainstBalance")}
              value={
                stanceStats.total > 0
                  ? Math.round(
                      (1 -
                        Math.abs(
                          stanceStats.positive - stanceStats.negative,
                        ) /
                          stanceStats.total) *
                        100,
                    )
                  : 100
              }
              suffix="%"
              loading={loadingStances}
            />
          </Space>

          {stanceStats.total > 0 ? (
            <div style={{ marginTop: 16 }}>
              <Space
                direction="vertical"
                size="small"
                style={{ width: '100%' }}
              >
                <div>
                  <Text>{i18nT("ui.konsultations.consultationvotepanel.for")}</Text>
                  <Progress
                    percent={Math.round(
                      (stanceStats.positive / stanceStats.total) * 100,
                    )}
                    showInfo
                  />
                </div>
                <div>
                  <Text>{i18nT("ui.konsultations.consultationvotepanel.neutral")}</Text>
                  <Progress
                    percent={Math.round(
                      (stanceStats.neutral / stanceStats.total) * 100,
                    )}
                    showInfo
                  />
                </div>
                <div>
                  <Text>{i18nT("ui.konsultations.consultationvotepanel.against")}</Text>
                  <Progress
                    percent={Math.round(
                      (stanceStats.negative / stanceStats.total) * 100,
                    )}
                    showInfo
                  />
                </div>

                <Paragraph style={{ marginTop: 4 }}>
                  <Tag color="geekblue">{i18nT("ui.konsultations.consultationvotepanel.text33Scale")}</Tag>{' '}
                  <Text type="secondary">
                    {i18nT("ui.konsultations.consultationvotepanel.text0NeutralNegativeValuesAgainstPositiveValues")}
                  </Text>
                </Paragraph>
              </Space>
            </div>
          ) : (
            <Empty
              description={i18nT("ui.konsultations.consultationvotepanel.noStancesRecordedYet")}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              style={{ marginTop: 16 }}
            />
          )}
        </>
      )}
    </Card>
  );
}
