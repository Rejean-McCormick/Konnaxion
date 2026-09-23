// FILE: frontend/app/kontrol/konsensus/page.tsx
'use client';


import { useLanguage } from '@/context/LanguageContext';
import {
  ExperimentOutlined,
  HistoryOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  ProForm,
  ProFormDigit,
  ProFormSelect,
  ProFormSlider,
  ProFormSwitch,
} from '@ant-design/pro-components';
import {
  Alert,
  Col,
  List,
  message,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';

import { apiFetch } from '@/api';
import KontrolPageShell from '@/app/kontrol/KontrolPageShell';

const { Text } = Typography;

// ---- Types for backend config so `data` is not `unknown` ----

type KonsensusConfigExtraSettings = {
  algorithm?: string;
  allow_delegation?: boolean;
  network?: string;
  auto_execute?: boolean;
  [key: string]: unknown;
};

interface KonsensusConfigRecord {
  quorum_percentage: number | string;
  passing_threshold: number | string;
  default_voting_duration_days: number;
  allow_anonymous_voting: boolean;
  auto_close_votes?: boolean;
  extra_settings?: KonsensusConfigExtraSettings;
  [key: string]: unknown;
}

/**
 * Normalise any backend response shape into "latest config or null".
 * Handles:
 *  - { results: [...] }
 *  - [...]
 *  - single object
 */
function extractLatestConfig(
  data: unknown,
): KonsensusConfigRecord | null {
  if (!data) return null;

  // Case 1: list response { results: [...] }
  if (
    typeof data === 'object' &&
    data !== null &&
    'results' in data &&
    Array.isArray((data as { results?: unknown }).results)
  ) {
    const arr = (data as { results: unknown[] }).results;
    if (arr.length > 0) return arr[0] as KonsensusConfigRecord;
  }

  // Case 2: bare list response [...]
  if (Array.isArray(data) && data.length > 0) {
    return data[0] as KonsensusConfigRecord;
  }

  // Case 3: single object
  if (typeof data === 'object' && data !== null) {
    return data as KonsensusConfigRecord;
  }

  return null;
}

export default function KonsensusSettingsPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  // State for live simulation feedback
  const [simulation, setSimulation] = useState({
    stiffness: 45,
    riskLabel: 'Balanced',
    riskColor: 'green',
    retroFailures: 2,
  });

  // Calculate simulation metrics based on form values
  const runSimulation = (quorum: number, threshold: number) => {
    // Higher quorum + higher threshold = harder to pass votes
    const score = Math.min(
      100,
      Math.round(quorum * 1.2 + threshold * 0.5),
    );

    let label = 'Fluid';
    let color = 'cyan';
    let fails = 0;

    if (score > 40) {
      label = 'Balanced';
      color = 'green';
      fails = 2;
    }
    if (score > 65) {
      label = 'Rigid';
      color = 'orange';
      fails = 5;
    }
    if (score > 85) {
      label = 'Gridlock Risk';
      color = 'red';
      fails = 12;
    }

    setSimulation({
      stiffness: score,
      riskLabel: label,
      riskColor: color,
      retroFailures: fails,
    });
  };

  const handleValuesChange = (_changedValues: unknown, values: unknown) => {
    const formValues =
      values && typeof values === 'object'
        ? (values as { quorum?: unknown; pass_threshold?: unknown })
        : {};

    if (
      formValues.quorum !== undefined ||
      formValues.pass_threshold !== undefined
    ) {
      const q = formValues.quorum ?? 15;
      const t = formValues.pass_threshold ?? 66;
      runSimulation(Number(q), Number(t));
    }
  };

  const title = i18nT("ui.kontrol.konsensus.konsensusConfiguration");
  const subtitle = (
    <>
      {i18nT("ui.kontrol.konsensus.manageGlobalConsensusAlgorithmsVotingThresholdsAnd")}
    </>
  );

  return (
    <KontrolPageShell
      title={title}
      subtitle={subtitle}
      scope="platform"
      metaTitle={i18nT("ui.kontrol.konsensus.kontrolPlatformKonsensusConfiguration")}
      maxWidth={1200}
    >
      <Row gutter={24}>
        {/* LEFT COLUMN: The Configuration Form */}
        <Col xs={24} lg={16}>
          {/* Informational Banner */}
          <Alert
            message={i18nT("ui.kontrol.konsensus.criticalConfiguration")}
            description={i18nT("ui.kontrol.konsensus.changesMadeHereAffectTheActiveVoting")}
            type="warning"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <ProForm
            onValuesChange={handleValuesChange}
            // 1. FETCH INITIAL CONFIGURATION (GET)
            request={async () => {
              try {
                const res = await apiFetch(
                  '/api/admin/konsensus-config/',
                );
                if (!res.ok) return {};

                const data: unknown = await res.json();
                const latest = extractLatestConfig(data);

                if (latest) {
                  const quorumNum = Number(
                    latest.quorum_percentage,
                  );
                  const thresholdNum = Number(
                    latest.passing_threshold,
                  );

                  if (
                    Number.isFinite(quorumNum) &&
                    Number.isFinite(thresholdNum)
                  ) {
                    runSimulation(quorumNum, thresholdNum);
                  }

                  // Map Backend Model -> Frontend Form
                  return {
                    quorum: Number.isFinite(quorumNum)
                      ? quorumNum
                      : 15,
                    pass_threshold: Number.isFinite(
                      thresholdNum,
                    )
                      ? thresholdNum
                      : 66,
                    min_duration_days:
                      latest.default_voting_duration_days ?? 3,
                    anonymous_voting:
                      latest.allow_anonymous_voting ?? false,
                    // Map generic fields from extra_settings JSON
                    algorithm:
                      latest.extra_settings?.algorithm ??
                      'weighted',
                    allow_delegation:
                      latest.extra_settings
                        ?.allow_delegation ?? true,
                    network:
                      latest.extra_settings?.network ??
                      'local_ganache',
                    auto_execute:
                      latest.extra_settings?.auto_execute ??
                      false,
                  };
                }

                // Defaults if no DB record exists yet
                return {
                  quorum: 15,
                  pass_threshold: 66,
                  min_duration_days: 3,
                  algorithm: 'weighted',
                };
              } catch (error) {
                 
                console.error(
                  'Failed to load config',
                  error,
                );
                message.error(
                  i18nT("ui.kontrol.konsensus.couldNotLoadCurrentConfiguration"),
                );
                return {};
              }
            }}
            // 2. SAVE CONFIGURATION (POST)
            onFinish={async (values) => {
              try {
                message.loading(
                  i18nT("ui.kontrol.konsensus.applyingConsensusParameters"),
                  0.5,
                );

                const payload = {
                  quorum_percentage: values.quorum,
                  passing_threshold: values.pass_threshold,
                  default_voting_duration_days:
                    values.min_duration_days,
                  allow_anonymous_voting:
                    values.anonymous_voting,
                  auto_close_votes: true,
                  extra_settings: {
                    algorithm: values.algorithm,
                    allow_delegation:
                      values.allow_delegation,
                    network: values.network,
                    auto_execute:
                      values.auto_execute,
                  },
                };

                const res = await apiFetch(
                  '/api/admin/konsensus-config/',
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type':
                        'application/json',
                    },
                    body: JSON.stringify(payload),
                  },
                );

                if (!res.ok)
                  throw new Error('Failed to save');

                message.success(
                  i18nT("ui.kontrol.konsensus.configurationUpdatedSuccessfully"),
                );
                return true;
              } catch (error) {
                 
                console.error(error);
                message.error(
                  i18nT("ui.kontrol.konsensus.failedToSaveConfiguration"),
                );
                return false;
              }
            }}
            submitter={{
              searchConfig: {
                submitText: 'Save configuration',
              },
              render: (_props, doms) => {
                return (
                  <ProCard
                    bordered
                    style={{ marginTop: 16 }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 16,
                      }}
                    >
                      {doms}
                    </div>
                  </ProCard>
                );
              },
            }}
          >
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              {/* Section 1: Voting Thresholds */}
              <ProCard
                title={i18nT("ui.kontrol.konsensus.globalThresholds")}
                headerBordered
                collapsible
                defaultCollapsed={false}
                extra={
                  <SafetyCertificateOutlined
                    style={{ color: '#52c41a' }}
                  />
                }
              >
                <ProFormSlider
                  name="quorum"
                  label={i18nT("ui.kontrol.konsensus.quorumRequirement")}
                  width="lg"
                  min={0}
                  max={100}
                  step={1}
                  initialValue={15}
                  marks={{
                    0: '0%',
                    15: '15%',
                    50: '50%',
                    100: '100%',
                  }}
                  help={i18nT("ui.kontrol.konsensus.minimumPercentageOfEligibleVotersRequiredFor")}
                />

                <ProFormSlider
                  name="pass_threshold"
                  label={i18nT("ui.kontrol.konsensus.passThreshold")}
                  width="lg"
                  min={50}
                  max={100}
                  step={1}
                  initialValue={66}
                  marks={{
                    50: 'Majority',
                    66: 'Super',
                    100: 'Unanimous',
                  }}
                  help={i18nT("ui.kontrol.konsensus.percentageOfForVotesRequiredToPass")}
                />

                <ProFormDigit
                  name="min_duration_days"
                  label={i18nT("ui.kontrol.konsensus.minimumVotingDurationDays")}
                  width="sm"
                  min={1}
                  max={30}
                  initialValue={3}
                  tooltip={i18nT("ui.kontrol.konsensus.proposalsCannotCloseBeforeThisDurationElapses")}
                />
              </ProCard>

              {/* Section 2: Algorithm & Logic */}
              <ProCard
                title={i18nT("ui.kontrol.konsensus.consensusAlgorithm")}
                headerBordered
                collapsible
                extra={
                  <ExperimentOutlined
                    style={{ color: '#1890ff' }}
                  />
                }
              >
                <ProFormSelect
                  name="algorithm"
                  label={i18nT("ui.kontrol.konsensus.activeCalculationMethod")}
                  width="md"
                  options={[
                    {
                      value: 'quadratic',
                      label:
                        i18nT("ui.kontrol.konsensus.quadraticVotingCostVotes2"),
                    },
                    {
                      value: 'linear',
                      label:
                        i18nT("ui.kontrol.konsensus.linear1Person1Vote"),
                    },
                    {
                      value: 'weighted',
                      label:
                        i18nT("ui.kontrol.konsensus.weightedReputationBased"),
                    },
                    {
                      value: 'hybrid',
                      label:
                        i18nT("ui.kontrol.konsensus.hybridLinearReputationBoost"),
                    },
                  ]}
                  initialValue="weighted"
                  tooltip={i18nT("ui.kontrol.konsensus.quadraticVotingHelpsProtectMinoritiesWeightedEmpowers")}
                />

                <ProCard split="vertical" bordered>
                  <ProCard>
                    <ProFormSwitch
                      name="allow_delegation"
                      label={i18nT("ui.kontrol.konsensus.allowVoteDelegation")}
                      initialValue
                      tooltip={i18nT("ui.kontrol.konsensus.usersCanDelegateTheirVotingPowerTo")}
                    />
                    <Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                    >
                      {i18nT("ui.kontrol.konsensus.liquidDemocracyFeaturesWillBeEnabledIf")}
                    </Text>
                  </ProCard>
                  <ProCard>
                    <ProFormSwitch
                      name="anonymous_voting"
                      label={i18nT("ui.kontrol.konsensus.forceAnonymousVoting")}
                      initialValue={false}
                      tooltip={i18nT("ui.kontrol.konsensus.anonymousVotingHint")}
                    />
                    <Text
                      type="secondary"
                      style={{ fontSize: 12 }}
                    >
                      {i18nT("ui.kontrol.konsensus.preventsSocialPressureButLimitsAccountability")}
                    </Text>
                  </ProCard>
                </ProCard>
              </ProCard>

              {/* Section 3: Smart Contract Sync */}
              <ProCard
                title={i18nT("ui.kontrol.konsensus.blockchainSynchronization")}
                headerBordered
                collapsible
                defaultCollapsed
              >
                <ProFormSelect
                  name="network"
                  label={i18nT("ui.kontrol.konsensus.targetNetwork")}
                  width="md"
                  options={[
                    {
                      value: 'eth_mainnet',
                      label: i18nT("ui.kontrol.konsensus.ethereumMainnet"),
                    },
                    {
                      value: 'polygon',
                      label: i18nT("ui.kontrol.konsensus.polygonMatic"),
                    },
                    {
                      value: 'local_ganache',
                      label: i18nT("ui.kontrol.konsensus.localGanacheDev"),
                    },
                  ]}
                  initialValue="local_ganache"
                />
                <ProFormSwitch
                  name="auto_execute"
                  label={i18nT("ui.kontrol.konsensus.autoExecutePassedProposals")}
                  initialValue={false}
                  tooltip={i18nT("ui.kontrol.konsensus.ifEnabledTheSystemWillAttemptTo")}
                />
              </ProCard>
            </Space>
          </ProForm>
        </Col>

        {/* RIGHT COLUMN: Live Simulation & Feedback */}
        <Col xs={24} lg={8}>
          <Space
            direction="vertical"
            size="large"
            style={{ width: '100%' }}
          >
            {/* Simulation Card */}
            <ProCard
              title={
                <Space>
                  <ThunderboltOutlined /> {i18nT("ui.kontrol.konsensus.liveImpactAnalysis")}
                </Space>
              }
              headerBordered
              style={{ background: '#fafafa' }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="middle"
              >
                <div>
                  <Text type="secondary">
                    {i18nT("ui.kontrol.konsensus.governanceStiffness")}
                  </Text>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'baseline',
                    }}
                  >
                    <Statistic
                      value={simulation.stiffness}
                      suffix="/ 100"
                      valueStyle={{ fontSize: 24 }}
                    />
                    <Tag color={simulation.riskColor}>
                      {simulation.riskLabel}
                    </Tag>
                  </div>
                  <Progress
                    percent={simulation.stiffness}
                    showInfo={false}
                    strokeColor={
                      simulation.riskColor === 'red'
                        ? '#ff4d4f'
                        : simulation.riskColor === 'orange'
                        ? '#faad14'
                        : '#52c41a'
                    }
                  />
                </div>

                <Alert
                  message={i18nT("ui.kontrol.konsensus.historicalReplay")}
                  description={i18nT("ui.kontrol.konsensus.underTheseRulesPassedProposalsFromLast", { retroFailures: simulation.retroFailures })}
                  type="info"
                  showIcon
                  icon={<HistoryOutlined />}
                />
              </Space>
            </ProCard>

            {/* Quick Tips */}
            <ProCard
              title={i18nT("ui.kontrol.konsensus.governanceTips")}
              headerBordered
              collapsible
            >
              <List size="small" split={false}>
                <List.Item>
                  <Text type="secondary">
                    <WarningOutlined />{' '}
                    <strong>{i18nT("ui.kontrol.konsensus.quorum")} {'>'} 30%</strong>{' '}
                    {i18nT("ui.kontrol.konsensus.highQuorumGridlockWarning")}
                  </Text>
                </List.Item>
                <List.Item>
                  <Text type="secondary">
                    <SafetyCertificateOutlined />{' '}
                    <strong>{i18nT("ui.kontrol.konsensus.quadraticVoting")}</strong> {i18nT("ui.kontrol.konsensus.isBestUsedForResourceAllocationNot")}
                  </Text>
                </List.Item>
              </List>
            </ProCard>
          </Space>
        </Col>
      </Row>
    </KontrolPageShell>
  );
}
