// FILE: frontend/app/teambuilder/humans/conflicts/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ExportOutlined,
  ImportOutlined,
  InfoCircleOutlined,
  LinkOutlined,
  PlusOutlined,
  StopOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useMemo, useState } from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';

const { Text, Paragraph } = Typography;
const { TextArea } = Input;

type Severity = 'SOFT' | 'MEDIUM' | 'HARD';

type ConflictRule = {
  id: string;
  userA: string;
  userB: string;
  severity: Severity;
  weight: number;
  reason?: string;
  active: boolean;
};

type PreferredPairRule = {
  id: string;
  userA: string;
  userB: string;
  weight: number;
  reason?: string;
  active: boolean;
};

type UserFlag = {
  id: string;
  user: string;
  type: 'RISK' | 'ANCHOR' | 'MENTOR';
  severity: Severity;
  notes?: string;
  active: boolean;
};

const SEVERITY_OPTIONS = (i18nT: TranslateFunction): { label: string; value: Severity }[] => ([
  { label: i18nT("ui.teambuilder.humans.conflicts.soft"), value: 'SOFT' },
  { label: i18nT("ui.teambuilder.humans.conflicts.medium"), value: 'MEDIUM' },
  { label: i18nT("ui.teambuilder.humans.conflicts.hard"), value: 'HARD' },
]);

const SEVERITY_COLORS: Record<Severity, string> = {
  SOFT: 'gold',
  MEDIUM: 'orange',
  HARD: 'red',
};

const SEVERITY_LABEL: Record<Severity, string> = {
  SOFT: 'Soft',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

const MOCK_USERS = [
  'Alice Martin',
  'Bob Dupont',
  'Carlos Silva',
  'Daria Novak',
  'Elliot Chen',
  'Fatima Khan',
];

export default function HumansConflictsPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [activeTab, setActiveTab] = useState<'conflicts' | 'preferred' | 'flags'>(
    'conflicts',
  );

  const [conflictRules, setConflictRules] = useState<ConflictRule[]>([
    {
      id: 'c-1',
      userA: 'Alice Martin',
      userB: 'Bob Dupont',
      severity: 'HARD',
      weight: 100,
      reason:
        'Repeated unresolved conflict in last project; mutual request not to be paired.',
      active: true,
    },
    {
      id: 'c-2',
      userA: 'Carlos Silva',
      userB: 'Daria Novak',
      severity: 'MEDIUM',
      weight: 70,
      reason: 'Tension on deadlines; still functional with strong leader present.',
      active: true,
    },
    {
      id: 'c-3',
      userA: 'Elliot Chen',
      userB: 'Fatima Khan',
      severity: 'SOFT',
      weight: 40,
      reason: 'Different working rhythms; treat as “avoid if possible”.',
      active: false,
    },
  ]);

  const [preferredPairs, setPreferredPairs] = useState<PreferredPairRule[]>([
    {
      id: 'p-1',
      userA: 'Alice Martin',
      userB: 'Carlos Silva',
      weight: 80,
      reason: 'High trust and very complementary skills in previous hackathon.',
      active: true,
    },
    {
      id: 'p-2',
      userA: 'Daria Novak',
      userB: 'Fatima Khan',
      weight: 55,
      reason: 'Requested to collaborate again on exploration-oriented projects.',
      active: true,
    },
  ]);

  const [userFlags, setUserFlags] = useState<UserFlag[]>([
    {
      id: 'f-1',
      user: 'Bob Dupont',
      type: 'RISK',
      severity: 'MEDIUM',
      notes:
        'Needs strong structure and clear expectations; avoid multiple other “risk” profiles on same team.',
      active: true,
    },
    {
      id: 'f-2',
      user: 'Carlos Silva',
      type: 'ANCHOR',
      severity: 'SOFT',
      notes: 'Good stabilizer in teams with at most one “risk” profile.',
      active: true,
    },
    {
      id: 'f-3',
      user: 'Daria Novak',
      type: 'MENTOR',
      severity: 'SOFT',
      notes: 'Willing to mentor juniors in learning-heavy configurations.',
      active: true,
    },
  ]);

  const [conflictForm] = Form.useForm();
  const [preferredForm] = Form.useForm();
  const [flagForm] = Form.useForm();

  const hardRulesCount = useMemo(
    () => conflictRules.filter(r => r.active && r.severity === 'HARD').length,
    [conflictRules],
  );
  const softRulesCount = useMemo(
    () => conflictRules.filter(r => r.active && r.severity !== 'HARD').length,
    [conflictRules],
  );
  const inactiveRulesCount = useMemo(
    () => conflictRules.filter(r => !r.active).length,
    [conflictRules],
  );

  const overConstrained = useMemo(
    () =>
      hardRulesCount > 0 &&
      conflictRules.length > 0 &&
      hardRulesCount / conflictRules.length > 0.6,
    [hardRulesCount, conflictRules.length],
  );

  const handleAddConflict = (values: {
    userA: string;
    userB: string;
    severity: Severity;
    weight?: number;
    reason?: string;
    active?: boolean;
  }) => {
    const next: ConflictRule = {
      id: `c-${Date.now()}`,
      userA: values.userA,
      userB: values.userB,
      severity: values.severity,
      weight: values.weight ?? 80,
      reason: values.reason,
      active: values.active ?? true,
    };
    setConflictRules(prev => [next, ...prev]);
    conflictForm.resetFields();
  };

  const handleToggleConflictActive = (id: string, active: boolean) => {
    setConflictRules(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, active } : rule)),
    );
  };

  const handleAddPreferredPair = (values: {
    userA: string;
    userB: string;
    weight?: number;
    reason?: string;
    active?: boolean;
  }) => {
    const next: PreferredPairRule = {
      id: `p-${Date.now()}`,
      userA: values.userA,
      userB: values.userB,
      weight: values.weight ?? 60,
      reason: values.reason,
      active: values.active ?? true,
    };
    setPreferredPairs(prev => [next, ...prev]);
    preferredForm.resetFields();
  };

  const handleTogglePreferredActive = (id: string, active: boolean) => {
    setPreferredPairs(prev =>
      prev.map(rule => (rule.id === id ? { ...rule, active } : rule)),
    );
  };

  const handleAddFlag = (values: {
    user: string;
    type: 'RISK' | 'ANCHOR' | 'MENTOR';
    severity: Severity;
    notes?: string;
    active?: boolean;
  }) => {
    const next: UserFlag = {
      id: `f-${Date.now()}`,
      user: values.user,
      type: values.type,
      severity: values.severity,
      notes: values.notes,
      active: values.active ?? true,
    };
    setUserFlags(prev => [next, ...prev]);
    flagForm.resetFields();
  };

  const handleToggleFlagActive = (id: string, active: boolean) => {
    setUserFlags(prev =>
      prev.map(flag => (flag.id === id ? { ...flag, active } : flag)),
    );
  };

  const conflictColumns = [
    {
      title: i18nT("ui.teambuilder.humans.conflicts.pair"),
      dataIndex: 'pair',
      key: 'pair',
      render: (_: unknown, record: ConflictRule) => (
        <Space>
          <Tag>{record.userA}</Tag>
          <span>×</span>
          <Tag>{record.userB}</Tag>
        </Space>
      ),
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.severity"),
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: Severity) => (
        <Tag color={SEVERITY_COLORS[severity]} icon={<StopOutlined />}>
          {SEVERITY_LABEL[severity]}
        </Tag>
      ),
    },
    {
      title: (
        <Space size={4}>
          {i18nT("ui.teambuilder.humans.conflicts.weight")}
          <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.relativeStrengthOfThisConstraintInThe")}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'weight',
      key: 'weight',
      width: 140,
      render: (weight: number) => (
        <Badge
          status={weight >= 80 ? 'error' : weight >= 60 ? 'warning' : 'default'}
          text={i18nT("ui.teambuilder.humans.conflicts.text", { weight: weight })}
        />
      ),
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.reasonNotes"),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason?: string) =>
        reason ? <Text type="secondary">{reason}</Text> : <Text type="secondary">–</Text>,
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.active"),
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active: boolean, record: ConflictRule) => (
        <Space>
          <Switch
            size="small"
            checked={active}
            onChange={checked => handleToggleConflictActive(record.id, checked)}
          />
          <Badge
            status={active ? 'processing' : 'default'}
            text={active ? i18nT("ui.teambuilder.humans.conflicts.inUse") : i18nT("ui.teambuilder.humans.conflicts.disabled")}
          />
        </Space>
      ),
    },
  ];

  const preferredColumns = [
    {
      title: i18nT("ui.teambuilder.humans.conflicts.pair"),
      dataIndex: 'pair',
      key: 'pair',
      render: (_: unknown, record: PreferredPairRule) => (
        <Space>
          <Tag icon={<LinkOutlined />}>{record.userA}</Tag>
          <span>+</span>
          <Tag icon={<LinkOutlined />}>{record.userB}</Tag>
        </Space>
      ),
    },
    {
      title: (
        <Space size={4}>
          {i18nT("ui.teambuilder.humans.conflicts.weight")}
          <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.higherWeightStrongerPreferenceToPutThem")}>
            <InfoCircleOutlined />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'weight',
      key: 'weight',
      width: 150,
      render: (weight: number) => (
        <Badge
          status={weight >= 80 ? 'success' : weight >= 60 ? 'processing' : 'default'}
          text={i18nT("ui.teambuilder.humans.conflicts.text", { weight: weight })}
        />
      ),
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.reason"),
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason?: string) =>
        reason ? <Text type="secondary">{reason}</Text> : <Text type="secondary">–</Text>,
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.active"),
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active: boolean, record: PreferredPairRule) => (
        <Space>
          <Switch
            size="small"
            checked={active}
            onChange={checked => handleTogglePreferredActive(record.id, checked)}
          />
          <Badge
            status={active ? 'processing' : 'default'}
            text={active ? i18nT("ui.teambuilder.humans.conflicts.inUse") : i18nT("ui.teambuilder.humans.conflicts.disabled")}
          />
        </Space>
      ),
    },
  ];

  const flagColumns = [
    {
      title: i18nT("ui.teambuilder.humans.conflicts.user"),
      dataIndex: 'user',
      key: 'user',
      render: (user: string) => <Tag>{user}</Tag>,
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.flagType"),
      dataIndex: 'type',
      key: 'type',
      render: (type: UserFlag['type']) => {
        switch (type) {
          case 'RISK':
            return (
              <Tag color="red" icon={<ExclamationCircleOutlined />}>
                {i18nT("ui.teambuilder.humans.conflicts.riskProfile")}
              </Tag>
            );
          case 'ANCHOR':
            return (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                {i18nT("ui.teambuilder.humans.conflicts.anchor")}
              </Tag>
            );
          case 'MENTOR':
            return (
              <Tag color="blue" icon={<UserSwitchOutlined />}>
                {i18nT("ui.teambuilder.humans.conflicts.mentor")}
              </Tag>
            );
          default:
            return <Tag>{type}</Tag>;
        }
      },
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.severity"),
      dataIndex: 'severity',
      key: 'severity',
      render: (severity: Severity) => (
        <Tag color={SEVERITY_COLORS[severity]}>{SEVERITY_LABEL[severity]}</Tag>
      ),
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.notes"),
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
      render: (notes?: string) =>
        notes ? <Text type="secondary">{notes}</Text> : <Text type="secondary">–</Text>,
    },
    {
      title: i18nT("ui.teambuilder.humans.conflicts.active"),
      dataIndex: 'active',
      key: 'active',
      width: 120,
      render: (active: boolean, record: UserFlag) => (
        <Space>
          <Switch
            size="small"
            checked={active}
            onChange={checked => handleToggleFlagActive(record.id, checked)}
          />
          <Badge
            status={active ? 'processing' : 'default'}
            text={active ? i18nT("ui.teambuilder.humans.conflicts.inUse") : i18nT("ui.teambuilder.humans.conflicts.disabled")}
          />
        </Space>
      ),
    },
  ];

  const conflictsTabContent = (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <Text strong>{i18nT("ui.teambuilder.humans.conflicts.conflictPairs")}</Text>
                <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.pairsThatShouldBeAvoidedWhenBuilding")}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<ImportOutlined />}>{i18nT("ui.teambuilder.humans.conflicts.import")}</Button>
                <Button icon={<ExportOutlined />}>{i18nT("ui.teambuilder.humans.conflicts.export")}</Button>
              </Space>
            }
          >
            <Table
              size="small"
              rowKey="id"
              columns={conflictColumns}
              dataSource={conflictRules}
              pagination={{ pageSize: 5, size: 'small' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card
            title={
              <Space>
                <Text strong>{i18nT("ui.teambuilder.humans.conflicts.addEditConflict")}</Text>
              </Space>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Form
                layout="vertical"
                form={conflictForm}
                onFinish={handleAddConflict}
                initialValues={{
                  severity: 'HARD' as Severity,
                  weight: 90,
                  active: true,
                }}
              >
                <Form.Item
                  label={i18nT("ui.teambuilder.humans.conflicts.userA")}
                  name="userA"
                  rules={[{ required: true, message: i18nT("ui.teambuilder.humans.conflicts.pleaseSelectTheFirstPerson") }]}
                >
                  <Select
                    showSearch
                    placeholder={i18nT("ui.teambuilder.humans.conflicts.pickFirstPerson")}
                    options={MOCK_USERS.map(u => ({ label: u, value: u }))}
                  />
                </Form.Item>

                <Form.Item
                  label={i18nT("ui.teambuilder.humans.conflicts.userB")}
                  name="userB"
                  rules={[{ required: true, message: i18nT("ui.teambuilder.humans.conflicts.pleaseSelectTheSecondPerson") }]}
                >
                  <Select
                    showSearch
                    placeholder={i18nT("ui.teambuilder.humans.conflicts.pickSecondPerson")}
                    options={MOCK_USERS.map(u => ({ label: u, value: u }))}
                  />
                </Form.Item>

                <Row gutter={12}>
                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space size={4}>
                          {i18nT("ui.teambuilder.humans.conflicts.severity")}
                          <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.hardNeverPairSoftMediumAvoidWhen")}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      name="severity"
                      rules={[{ required: true }]}
                    >
                      <Select
                        options={SEVERITY_OPTIONS(i18nT).map(opt => ({
                          label: opt.label,
                          value: opt.value,
                        }))}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={12}>
                    <Form.Item
                      label={
                        <Space size={4}>
                          {i18nT("ui.teambuilder.humans.conflicts.weight")}
                          <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.howStronglyTheSolverShouldRespectThis")}>
                            <InfoCircleOutlined />
                          </Tooltip>
                        </Space>
                      }
                      name="weight"
                    >
                      <Slider min={10} max={100} step={5} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item label={i18nT("ui.teambuilder.humans.conflicts.reasonOptional")} name="reason">
                  <TextArea
                    rows={3}
                    placeholder={i18nT("ui.teambuilder.humans.conflicts.shortExplanationForFutureReference")}
                  />
                </Form.Item>

                <Form.Item
                  label={i18nT("ui.teambuilder.humans.conflicts.ruleActive")}
                  name="active"
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>

                <Form.Item>
                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button onClick={() => conflictForm.resetFields()}>{i18nT("ui.teambuilder.humans.conflicts.reset")}</Button>
                    <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                      {i18nT("ui.teambuilder.humans.conflicts.addConflictPair")}
                    </Button>
                  </Space>
                </Form.Item>
              </Form>

              <Divider />

              <Popover
                placement="bottomLeft"
                content={
                  <div style={{ maxWidth: 320 }}>
                    <Paragraph strong style={{ marginBottom: 8 }}>
                      {i18nT("ui.teambuilder.humans.conflicts.howConflictsAreUsed")}
                    </Paragraph>
                    <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                      {i18nT("ui.teambuilder.humans.conflicts.hardConflictsBehaveLikeDoNotPair")}
                    </Paragraph>
                    <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                      {i18nT("ui.teambuilder.humans.conflicts.youCanTuneTheGlobalStrategyIn")}
                    </Paragraph>
                  </div>
                }
              >
                <Space>
                  <InfoCircleOutlined />
                  <Text type="secondary">{i18nT("ui.teambuilder.humans.conflicts.learnHowConflictRulesAffectTeams")}</Text>
                </Space>
              </Popover>
            </Space>
          </Card>
        </Col>
      </Row>

      {overConstrained && (
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          message={i18nT("ui.teambuilder.humans.conflicts.yourConflictsMayBeOverConstrainingThe")}
          description={
            <Space direction="vertical">
              <Text>
                {i18nT("ui.teambuilder.humans.conflicts.moreThan60OfYourActiveRules")}{' '}
                <Text strong>{i18nT("ui.teambuilder.humans.conflicts.hard")}</Text>{i18nT("ui.teambuilder.humans.conflicts.theSolverMightStruggleToFindFeasible")}
              </Text>
              <Text type="secondary">
                {i18nT("ui.teambuilder.humans.conflicts.considerDowngradingSomeRulesTo")} <strong>{i18nT("ui.teambuilder.humans.conflicts.soft")}</strong> {i18nT("ui.teambuilder.humans.conflicts.or")}{' '}
                <strong>{i18nT("ui.teambuilder.humans.conflicts.medium")}</strong>{i18nT("ui.teambuilder.humans.conflicts.orSwitchingToALearningOrientedContext")}
              </Text>
            </Space>
          }
        />
      )}
    </Space>
  );

  const preferredPairsTabContent = (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <Text strong>{i18nT("ui.teambuilder.humans.conflicts.preferredPairs")}</Text>
                <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.pairsThatAreRewardedWhenTheyAppear")}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
            extra={
              <Space>
                <Button icon={<ImportOutlined />}>{i18nT("ui.teambuilder.humans.conflicts.import")}</Button>
                <Button icon={<ExportOutlined />}>{i18nT("ui.teambuilder.humans.conflicts.export")}</Button>
              </Space>
            }
          >
            <Table
              size="small"
              rowKey="id"
              columns={preferredColumns}
              dataSource={preferredPairs}
              pagination={{ pageSize: 5, size: 'small' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card title={i18nT("ui.teambuilder.humans.conflicts.addPreferredPair")}>
            <Form
              layout="vertical"
              form={preferredForm}
              onFinish={handleAddPreferredPair}
              initialValues={{
                weight: 70,
                active: true,
              }}
            >
              <Form.Item
                label={i18nT("ui.teambuilder.humans.conflicts.userA")}
                name="userA"
                rules={[{ required: true, message: i18nT("ui.teambuilder.humans.conflicts.pleaseSelectTheFirstPerson") }]}
              >
                <Select
                  showSearch
                  placeholder={i18nT("ui.teambuilder.humans.conflicts.pickFirstPerson")}
                  options={MOCK_USERS.map(u => ({ label: u, value: u }))}
                />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.teambuilder.humans.conflicts.userB")}
                name="userB"
                rules={[{ required: true, message: i18nT("ui.teambuilder.humans.conflicts.pleaseSelectTheSecondPerson") }]}
              >
                <Select
                  showSearch
                  placeholder={i18nT("ui.teambuilder.humans.conflicts.pickSecondPerson")}
                  options={MOCK_USERS.map(u => ({ label: u, value: u }))}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space size={4}>
                    {i18nT("ui.teambuilder.humans.conflicts.weight")}
                    <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.higherWeightStrongerIncentiveToKeepThem")}>
                      <InfoCircleOutlined />
                    </Tooltip>
                  </Space>
                }
                name="weight"
              >
                <Slider min={10} max={100} step={5} />
              </Form.Item>

              <Form.Item label={i18nT("ui.teambuilder.humans.conflicts.reasonOptional")} name="reason">
                <TextArea
                  rows={3}
                  placeholder={i18nT("ui.teambuilder.humans.conflicts.whyShouldThisPairBeEncouraged")}
                />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.teambuilder.humans.conflicts.ruleActive")}
                name="active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Button onClick={() => preferredForm.resetFields()}>{i18nT("ui.teambuilder.humans.conflicts.reset")}</Button>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    {i18nT("ui.teambuilder.humans.conflicts.addPreferredPair")}
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            <Divider />

            <Text type="secondary">
              {i18nT("ui.teambuilder.humans.conflicts.preferredPairsAreParticularlyUsefulIn")}{' '}
              <strong>{i18nT("ui.teambuilder.humans.conflicts.learning")}</strong> {i18nT("ui.teambuilder.humans.conflicts.or")} <strong>{i18nT("ui.teambuilder.humans.conflicts.balanced")}</strong> {i18nT("ui.teambuilder.humans.conflicts.contextsWhereYouWantToProtectMentoring")}
            </Text>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const flagsTabContent = (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card
            title={
              <Space>
                <Text strong>{i18nT("ui.teambuilder.humans.conflicts.userFlags")}</Text>
                <Tooltip title={i18nT("ui.teambuilder.humans.conflicts.profilesThatRequireSpecialAttentionWhenComposing")}>
                  <InfoCircleOutlined />
                </Tooltip>
              </Space>
            }
          >
            <Table
              size="small"
              rowKey="id"
              columns={flagColumns}
              dataSource={userFlags}
              pagination={{ pageSize: 5, size: 'small' }}
            />
          </Card>
        </Col>

        <Col xs={24} md={10}>
          <Card title={i18nT("ui.teambuilder.humans.conflicts.addUserFlag")}>
            <Form
              layout="vertical"
              form={flagForm}
              onFinish={handleAddFlag}
              initialValues={{
                type: 'RISK',
                severity: 'MEDIUM' as Severity,
                active: true,
              }}
            >
              <Form.Item
                label={i18nT("ui.teambuilder.humans.conflicts.user")}
                name="user"
                rules={[{ required: true, message: i18nT("ui.teambuilder.humans.conflicts.pleaseSelectAPerson") }]}
              >
                <Select
                  showSearch
                  placeholder={i18nT("ui.teambuilder.humans.conflicts.pickUser")}
                  options={MOCK_USERS.map(u => ({ label: u, value: u }))}
                />
              </Form.Item>

              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.humans.conflicts.flagType")}
                    name="type"
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={[
                        { label: i18nT("ui.teambuilder.humans.conflicts.riskProfile"), value: 'RISK' },
                        { label: i18nT("ui.teambuilder.humans.conflicts.anchor"), value: 'ANCHOR' },
                        { label: i18nT("ui.teambuilder.humans.conflicts.mentor"), value: 'MENTOR' },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col span={12}>
                  <Form.Item
                    label={i18nT("ui.teambuilder.humans.conflicts.severity")}
                    name="severity"
                    rules={[{ required: true }]}
                  >
                    <Select
                      options={SEVERITY_OPTIONS(i18nT).map(opt => ({
                        label: opt.label,
                        value: opt.value,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label={i18nT("ui.teambuilder.humans.conflicts.notesOptional")} name="notes">
                <TextArea
                  rows={3}
                  placeholder={i18nT("ui.teambuilder.humans.conflicts.contextOnHowToUseThisFlag")}
                />
              </Form.Item>

              <Form.Item
                label={i18nT("ui.teambuilder.humans.conflicts.flagActive")}
                name="active"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Button onClick={() => flagForm.resetFields()}>{i18nT("ui.teambuilder.humans.conflicts.reset")}</Button>
                  <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                    {i18nT("ui.teambuilder.humans.conflicts.addFlag")}
                  </Button>
                </Space>
              </Form.Item>
            </Form>

            <Divider />

            <Text type="secondary">
              {i18nT("ui.teambuilder.humans.conflicts.flagsAreNotConflictsByThemselvesThey")}
            </Text>
          </Card>
        </Col>
      </Row>
    </Space>
  );

  const tabItems = [
    {
      key: 'conflicts',
      label: i18nT("ui.teambuilder.humans.conflicts.conflicts"),
      children: conflictsTabContent,
    },
    {
      key: 'preferred',
      label: i18nT("ui.teambuilder.humans.conflicts.preferredPairs"),
      children: preferredPairsTabContent,
    },
    {
      key: 'flags',
      label: i18nT("ui.teambuilder.humans.conflicts.flags"),
      children: flagsTabContent,
    },
  ];

  const headerSummary = (
    <Space size="large" wrap>
      <Space direction="vertical" size={4}>
        <Text type="secondary">{i18nT("ui.teambuilder.humans.conflicts.hardConflictRules")}</Text>
        <Space>
          <Badge status="error" />
          <Text strong>{hardRulesCount}</Text>
        </Space>
      </Space>

      <Space direction="vertical" size={4}>
        <Text type="secondary">{i18nT("ui.teambuilder.humans.conflicts.softMediumRules")}</Text>
        <Space>
          <Badge status="warning" />
          <Text strong>{softRulesCount}</Text>
        </Space>
      </Space>

      <Space direction="vertical" size={4}>
        <Text type="secondary">{i18nT("ui.teambuilder.humans.conflicts.inactiveRules")}</Text>
        <Space>
          <Badge status="default" />
          <Text strong>{inactiveRulesCount}</Text>
        </Space>
      </Space>
    </Space>
  );

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.humans.conflicts.conflictsPairingRules")}
      subtitle={
        <Space direction="vertical" size={8}>
          <Text type="secondary">
            {i18nT("ui.teambuilder.humans.conflicts.manageWhoShouldOrShouldNotBe")}
          </Text>
          {headerSummary}
        </Space>
      }
      sectionLabel={i18nT("ui.teambuilder.humans.conflicts.humans")}
      maxWidth={1200}
      secondaryActions={
        <Space>
          <Button>{i18nT("ui.teambuilder.humans.conflicts.resetAllRules")}</Button>
          <Button type="primary" icon={<ExportOutlined />}>
            {i18nT("ui.teambuilder.humans.conflicts.exportConfiguration")}
          </Button>
        </Space>
      }
    >
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={key => setActiveTab(key as typeof activeTab)}
          items={tabItems}
        />
      </Card>

      <Divider />

      <Alert
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        message={i18nT("ui.teambuilder.humans.conflicts.howThisInteractsWithContexts")}
        description={
          <Space direction="vertical">
            <Text>
              {i18nT("ui.teambuilder.humans.conflicts.in")} <strong>{i18nT("ui.teambuilder.humans.conflicts.eliteCritical")}</strong> {i18nT("ui.teambuilder.humans.conflicts.modeHardConflictsAreTreatedAsStrict")} <strong>{i18nT("ui.teambuilder.humans.conflicts.learning")}</strong> {i18nT("ui.teambuilder.humans.conflicts.or")}{' '}
              <strong>{i18nT("ui.teambuilder.humans.conflicts.rehab")}</strong> {i18nT("ui.teambuilder.humans.conflicts.modesTheEngineMayAllowSomeSofter")}
            </Text>
            <Text type="secondary">
              {i18nT("ui.teambuilder.humans.conflicts.youCanTuneTheseBehavioursInThe")}
            </Text>
          </Space>
        }
      />
    </TeamBuilderPageShell>
  );
}
