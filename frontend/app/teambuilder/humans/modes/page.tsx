// frontend/app/teambuilder/humans/modes/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ExperimentOutlined,
  SafetyCertificateOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Divider,
  Form,
  InputNumber,
  message,
  Progress,
  Row,
  Slider,
  Space,
  Statistic,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import React, { useState } from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

type ModeKey = 'elite' | 'balanced' | 'learning' | 'average_only' | 'rehab';

type RiskLevel = 'Low risk' | 'Medium risk' | 'High risk';

type ModeWeights = {
  skillFit: number;
  performance: number;
  learning: number;
  collaboration: number;
  difficultTolerance: number;
};

type ModeConstraints = {
  maxDifficultMembers: number;
  minSeniorsPerTeam: number;
};

type ModeConfig = {
  key: ModeKey;
  label: string;
  shortLabel: string;
  description: string;
  riskLevel: RiskLevel;
  riskColor: 'green' | 'blue' | 'gold' | 'red';
  weights: ModeWeights;
  constraints: ModeConstraints;
};

type ModeConfigs = Record<ModeKey, ModeConfig>;

function createDefaultModes(): ModeConfigs {
  return {
    elite: {
      key: 'elite',
      label: 'Elite / critical delivery',
      shortLabel: 'Elite',
      description:
        'Maximise performance and reliability for urgent, high-stakes delivery. Very strict on difficult members.',
      riskLevel: 'High risk',
      riskColor: 'red',
      weights: {
        skillFit: 90,
        performance: 90,
        learning: 20,
        collaboration: 70,
        difficultTolerance: 10,
      },
      constraints: {
        maxDifficultMembers: 0,
        minSeniorsPerTeam: 2,
      },
    },
    balanced: {
      key: 'balanced',
      label: 'Balanced performance & learning',
      shortLabel: 'Balanced',
      description:
        'Blend solid performance with some learning opportunity. Good default for important but non-critical work.',
      riskLevel: 'Medium risk',
      riskColor: 'blue',
      weights: {
        skillFit: 75,
        performance: 75,
        learning: 50,
        collaboration: 75,
        difficultTolerance: 30,
      },
      constraints: {
        maxDifficultMembers: 1,
        minSeniorsPerTeam: 1,
      },
    },
    learning: {
      key: 'learning',
      label: 'Learning-heavy / developmental',
      shortLabel: 'Learning',
      description:
        'Optimise for growth and experimentation. Favors juniors and mentoring, with softer constraints.',
      riskLevel: 'Low risk',
      riskColor: 'green',
      weights: {
        skillFit: 55,
        performance: 50,
        learning: 90,
        collaboration: 80,
        difficultTolerance: 40,
      },
      constraints: {
        maxDifficultMembers: 2,
        minSeniorsPerTeam: 1,
      },
    },
    average_only: {
      key: 'average_only',
      label: 'Average-only / stability test',
      shortLabel: 'Average-only',
      description:
        'Filter out extremes and test whether a “normal” group can perform reliably. Strong emphasis on structure.',
      riskLevel: 'Low risk',
      riskColor: 'gold',
      weights: {
        skillFit: 65,
        performance: 60,
        learning: 40,
        collaboration: 70,
        difficultTolerance: 20,
      },
      constraints: {
        maxDifficultMembers: 0,
        minSeniorsPerTeam: 0,
      },
    },
    rehab: {
      key: 'rehab',
      label: 'High-risk / rehabilitation teams',
      shortLabel: 'Rehab',
      description:
        'Deliberately include some difficult members around a strong leader and stabilisers. Use carefully.',
      riskLevel: 'High risk',
      riskColor: 'red',
      weights: {
        skillFit: 60,
        performance: 55,
        learning: 70,
        collaboration: 65,
        difficultTolerance: 70,
      },
      constraints: {
        maxDifficultMembers: 2,
        minSeniorsPerTeam: 1,
      },
    },
  };
}

function computeStrictnessScore(mode: ModeConfig): number {
  const { skillFit, performance, difficultTolerance } = mode.weights;
  const invertedTolerance = 100 - difficultTolerance;
  const avg = (skillFit + performance + invertedTolerance) / 3;
  return Math.round(avg);
}

export default function TeamModesPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [modes, setModes] = useState<ModeConfigs>(() => createDefaultModes());
  const [activeMode, setActiveMode] = useState<ModeKey>('elite');
  const [saving, setSaving] = useState(false);

  const handleWeightChange =
    (modeKey: ModeKey, field: keyof ModeWeights) =>
    (value: number | [number, number]) => {
      const numericValue = Array.isArray(value) ? value[0] ?? 0 : value ?? 0;
      setModes(prev => ({
        ...prev,
        [modeKey]: {
          ...prev[modeKey],
          weights: {
            ...prev[modeKey].weights,
            [field]: numericValue,
          },
        },
      }));
    };

  const handleConstraintChange =
    (modeKey: ModeKey, field: keyof ModeConstraints) =>
    (value: number | null) => {
      setModes(prev => ({
        ...prev,
        [modeKey]: {
          ...prev[modeKey],
          constraints: {
            ...prev[modeKey].constraints,
            [field]: value ?? 0,
          },
        },
      }));
    };

  const handleResetDefaults = () => {
    setModes(createDefaultModes());
    message.success(i18nT("ui.teambuilder.humans.modes.teamModesResetToDefaults"));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // TODO: wire to backend service when available
       
      console.log('Saving team modes (stub):', modes);
      message.success(i18nT("ui.teambuilder.humans.modes.teamModesSavedLocalStub"));
    } catch (err) {
       
      console.error(err);
      message.error(i18nT("ui.teambuilder.humans.modes.failedToSaveModesPleaseTryAgain"));
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicateMode = () => {
    const current = modes[activeMode];
    message.info(
      i18nT("ui.teambuilder.humans.modes.duplicateIsNotImplementedYetStubButton", { shortLabel: current.shortLabel }),
    );
  };

  const renderModeTab = (modeKey: ModeKey) => {
    const mode = modes[modeKey];
    const strictness = computeStrictnessScore(mode);

    return (
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type={mode.riskLevel === 'High risk' ? 'warning' : 'info'}
          showIcon
          message={
            <Space align="center">
              <SafetyCertificateOutlined />
              <span>{mode.label}</span>
              <Tag color={mode.riskColor}>{mode.riskLevel}</Tag>
            </Space>
          }
          description={
            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              {mode.description}
            </Paragraph>
          }
        />

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card
              size="small"
              title={i18nT("ui.teambuilder.humans.modes.scoringWeights")}
              extra={
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {i18nT("ui.teambuilder.humans.modes.text0Ignored100Dominant")}
                </Text>
              }
            >
              <Form layout="vertical">
                <Form.Item label={i18nT("ui.teambuilder.humans.modes.skillFit")}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: 80, marginRight: 16 }}
                    value={mode.weights.skillFit}
                    onChange={v =>
                      handleWeightChange(modeKey, 'skillFit')(v ?? 0)
                    }
                  />
                  <span style={{ paddingRight: 16 }} />
                  <Row>
                    <Col span={24}>
                      <Slider
                        min={0}
                        max={100}
                        value={mode.weights.skillFit}
                        onChange={handleWeightChange(modeKey, 'skillFit')}
                      />
                    </Col>
                  </Row>
                </Form.Item>

                <Form.Item label={i18nT("ui.teambuilder.humans.modes.pastPerformanceReliability")}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: 80, marginRight: 16 }}
                    value={mode.weights.performance}
                    onChange={v =>
                      handleWeightChange(modeKey, 'performance')(v ?? 0)
                    }
                  />
                  <span style={{ paddingRight: 16 }} />
                  <Row>
                    <Col span={24}>
                      <Slider
                        min={0}
                        max={100}
                        value={mode.weights.performance}
                        onChange={handleWeightChange(modeKey, 'performance')}
                      />
                    </Col>
                  </Row>
                </Form.Item>

                <Form.Item label={i18nT("ui.teambuilder.humans.modes.learningOpportunity")}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: 80, marginRight: 16 }}
                    value={mode.weights.learning}
                    onChange={v =>
                      handleWeightChange(modeKey, 'learning')(v ?? 0)
                    }
                  />
                  <span style={{ paddingRight: 16 }} />
                  <Row>
                    <Col span={24}>
                      <Slider
                        min={0}
                        max={100}
                        value={mode.weights.learning}
                        onChange={handleWeightChange(modeKey, 'learning')}
                      />
                    </Col>
                  </Row>
                </Form.Item>

                <Form.Item label={i18nT("ui.teambuilder.humans.modes.pastCollaborationHistory")}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: 80, marginRight: 16 }}
                    value={mode.weights.collaboration}
                    onChange={v =>
                      handleWeightChange(modeKey, 'collaboration')(v ?? 0)
                    }
                  />
                  <span style={{ paddingRight: 16 }} />
                  <Row>
                    <Col span={24}>
                      <Slider
                        min={0}
                        max={100}
                        value={mode.weights.collaboration}
                        onChange={handleWeightChange(
                          modeKey,
                          'collaboration',
                        )}
                      />
                    </Col>
                  </Row>
                </Form.Item>

                <Form.Item label={i18nT("ui.teambuilder.humans.modes.toleranceForDifficultMembers")}>
                  <InputNumber
                    min={0}
                    max={100}
                    style={{ width: 80, marginRight: 16 }}
                    value={mode.weights.difficultTolerance}
                    onChange={v =>
                      handleWeightChange(modeKey, 'difficultTolerance')(
                        v ?? 0,
                      )
                    }
                  />
                  <span style={{ paddingRight: 16 }} />
                  <Row>
                    <Col span={24}>
                      <Slider
                        min={0}
                        max={100}
                        value={mode.weights.difficultTolerance}
                        onChange={handleWeightChange(
                          modeKey,
                          'difficultTolerance',
                        )}
                      />
                    </Col>
                  </Row>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {i18nT("ui.teambuilder.humans.modes.higherValuesAllowMoreDifficultMembersIn")}
                  </Text>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Card size="small">
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Space align="center">
                    <ThunderboltOutlined style={{ color: '#faad14' }} />
                    <Text strong>{i18nT("ui.teambuilder.humans.modes.strictnessOverview")}</Text>
                    <Tag color={mode.riskColor}>{mode.riskLevel}</Tag>
                  </Space>

                  <Divider style={{ margin: '8px 0' }} />

                  <Row gutter={16} align="middle">
                    <Col span={12}>
                      <Progress type="circle" percent={strictness} width={88} />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={i18nT("ui.teambuilder.humans.modes.strictnessScore")}
                        value={strictness}
                        suffix="/ 100"
                      />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {i18nT("ui.teambuilder.humans.modes.basedOnSkillFitPerformanceAndTolerance")}
                      </Text>
                    </Col>
                  </Row>
                </Space>
              </Card>

              <Card size="small" title={i18nT("ui.teambuilder.humans.modes.summary")}>
                <Space
                  direction="vertical"
                  size="small"
                  style={{ width: '100%' }}
                >
                  <Row>
                    <Col span={12}>
                      <Text type="secondary">{i18nT("ui.teambuilder.humans.modes.skillFitWeight")}</Text>
                      <div>{mode.weights.skillFit}/100</div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">{i18nT("ui.teambuilder.humans.modes.performanceWeight")}</Text>
                      <div>{mode.weights.performance}/100</div>
                    </Col>
                  </Row>
                  <Row style={{ marginTop: 8 }}>
                    <Col span={12}>
                      <Text type="secondary">{i18nT("ui.teambuilder.humans.modes.learningEmphasis")}</Text>
                      <div>{mode.weights.learning}/100</div>
                    </Col>
                    <Col span={12}>
                      <Text type="secondary">{i18nT("ui.teambuilder.humans.modes.collaborationEmphasis")}</Text>
                      <div>{mode.weights.collaboration}/100</div>
                    </Col>
                  </Row>
                </Space>
              </Card>

              <Collapse ghost>
                <Panel header={i18nT("ui.teambuilder.humans.modes.advancedConstraints")} key="advanced">
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: '100%' }}
                  >
                    <Form layout="vertical">
                      <Form.Item label={i18nT("ui.teambuilder.humans.modes.maxDifficultMembersPerTeam")}>
                        <InputNumber
                          min={0}
                          max={10}
                          style={{ width: '100%' }}
                          value={mode.constraints.maxDifficultMembers}
                          onChange={handleConstraintChange(
                            modeKey,
                            'maxDifficultMembers',
                          )}
                        />
                      </Form.Item>

                      <Form.Item label={i18nT("ui.teambuilder.humans.modes.minimumSeniorsPerTeam")}>
                        <InputNumber
                          min={0}
                          max={10}
                          style={{ width: '100%' }}
                          value={mode.constraints.minSeniorsPerTeam}
                          onChange={handleConstraintChange(
                            modeKey,
                            'minSeniorsPerTeam',
                          )}
                        />
                      </Form.Item>
                    </Form>

                    <Alert
                      type="info"
                      showIcon
                      message={i18nT("ui.teambuilder.humans.modes.guidance")}
                      description={
                        <Text type="secondary">
                          {i18nT("ui.teambuilder.humans.modes.useTheseConstraintsToBoundExtremeProposals")}
                        </Text>
                      }
                    />
                  </Space>
                </Panel>
              </Collapse>
            </Space>
          </Col>
        </Row>
      </Space>
    );
  };

  const tabItems = (Object.keys(modes) as ModeKey[]).map(modeKey => ({
    key: modeKey,
    label: modes[modeKey].shortLabel,
    children: renderModeTab(modeKey),
  }));

  const primaryAction = (
    <Space>
      <Button onClick={handleDuplicateMode} icon={<ExperimentOutlined />}>
        {i18nT("ui.teambuilder.humans.modes.duplicateMode")}
      </Button>
      <Button onClick={handleResetDefaults}>{i18nT("ui.teambuilder.humans.modes.resetDefaults")}</Button>
      <Button
        type="primary"
        onClick={handleSaveAll}
        loading={saving}
        icon={<SafetyCertificateOutlined />}
      >
        {i18nT("ui.teambuilder.humans.modes.saveAllModes")}
      </Button>
    </Space>
  );

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.humans.modes.teamModesPresets")}
      subtitle={i18nT("ui.teambuilder.humans.modes.configureHowTheMatchingEngineBalancesPerformance")}
      sectionLabel={i18nT("ui.teambuilder.humans.modes.humans")}
      maxWidth={1200}
      primaryAction={primaryAction}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.teambuilder.humans.modes.teamModesControlHowTheEngineWeighs")}
          description={
            <Text type="secondary">
              {i18nT("ui.teambuilder.humans.modes.eachModeCorrespondsToADifferentOperating")}
            </Text>
          }
        />

        <Card>
          <Tabs
            activeKey={activeMode}
            items={tabItems}
            onChange={key => setActiveMode(key as ModeKey)}
          />
        </Card>
      </Space>
    </TeamBuilderPageShell>
  );
}
