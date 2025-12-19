// C:\MyCode\Konnaxionv14\frontend\app\kontrol\dashboard\page.tsx
'use client';

import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Button,
  List,
  Progress,
  notification,
  Typography,
} from 'antd';
import {
  UserOutlined,
  GlobalOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  LineChartOutlined,
  SettingOutlined,
  DeploymentUnitOutlined,
  ClockCircleOutlined,
  AuditOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import {
  ProCard,
  ProTable,
  ProDescriptions,
  StatisticCard,
  type ProColumns,
} from '@ant-design/pro-components';
import { useRouter } from 'next/navigation';
import KontrolPageShell from '@/app/kontrol/KontrolPageShell';

const { Text, Paragraph } = Typography;

const MODERATION_MOCK_DATA = [
  {
    id: 101,
    type: 'Comment',
    status: 'Pending',
    target: 'EthiKos Debate: Topic #15',
    flags: 4,
    severity: 'High',
  },
  {
    id: 102,
    type: 'User Report',
    status: 'Pending',
    target: 'User: @jdoe',
    flags: 8,
    severity: 'Critical',
  },
  {
    id: 103,
    type: 'Document',
    status: 'Under Review',
    target: 'KonnectED Resource: Doc 21',
    flags: 2,
    severity: 'Medium',
  },
  {
    id: 104,
    type: 'Image',
    status: 'Pending',
    target: 'Kreative Gallery: Album 3',
    flags: 1,
    severity: 'Low',
  },
];

const USER_ACTIVITY_MOCK_DATA = [
  {
    key: '1',
    date: '2025-11-28',
    user: 'Admin Jane',
    action: 'Banned User @spam_bot',
    module: 'EkoH',
  },
  {
    key: '2',
    date: '2025-11-28',
    user: 'System',
    action: 'Archived 120-day old content',
    module: 'KonnectED',
  },
  {
    key: '3',
    date: '2025-11-27',
    user: 'Moderator Tom',
    action: 'Approved Comment #103',
    module: 'EthiKos',
  },
  {
    key: '4',
    date: '2025-11-26',
    user: 'Admin Jane',
    action: 'Updated Site Configuration',
    module: 'Kontrol',
  },
];

// Uses ProColumns for typing
const PRO_TABLE_COLUMNS: ProColumns<(typeof MODERATION_MOCK_DATA)[0]>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', valueType: 'digit' },
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    valueType: 'select',
    valueEnum: {
      Comment: { text: 'Comment' },
      'User Report': { text: 'User Report' },
      Document: { text: 'Document' },
      Image: { text: 'Image' },
    },
  },
  { title: 'Target', dataIndex: 'target', key: 'target', ellipsis: true },
  {
    title: 'Flags',
    dataIndex: 'flags',
    key: 'flags',
    valueType: 'digit',
    sorter: (a, b) => a.flags - b.flags,
  },
  {
    title: 'Severity',
    dataIndex: 'severity',
    key: 'severity',
    valueType: 'select',
    valueEnum: {
      Critical: { text: 'Critical', status: 'Error' },
      High: { text: 'High', status: 'Warning' },
      Medium: { text: 'Medium', status: 'Processing' },
      Low: { text: 'Low', status: 'Success' },
    },
  },
  {
    title: 'Action',
    valueType: 'option',
    key: 'option',
    render: (_, record) => [
      <a
        key="view"
        onClick={() =>
          notification.info({
            message: `Viewing ${record.type} ${record.id}`,
          })
        }
      >
        View
      </a>,
      <a
        key="process"
        onClick={() =>
          notification.success({
            message: `Processing ${record.id}`,
          })
        }
      >
        Process
      </a>,
    ],
  },
];

const SYSTEM_CONFIG_DATA = {
  version: 'v14.0.1 (Kontrol Patch)',
  deployment: 'Production Cluster B',
  lastUpdate: '2025-11-25 14:30:00',
  mode: 'Standard',
  cdn: 'Enabled',
  metrics: 'Reporting to Prometheus',
};

export default function KontrolDashboard(): JSX.Element {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRunSystemCheck = () => {
    setLoading(true);
    notification.info({ message: 'Running system health checks...' });
    setTimeout(() => {
      setLoading(false);
      notification.success({
        message: 'System check complete. All services nominal.',
      });
    }, 2000);
  };

  const title = 'Platform governance dashboard';
  const subtitle = (
    <>
      Cross-module overview of activity, moderation load and platform health.
    </>
  );

  return (
    <KontrolPageShell
      title={title}
      subtitle={subtitle}
      scope="platform"
      metaTitle="Kontrol · Platform · Dashboard"
    >
      <div style={{ padding: 20 }}>
        {/* Context / scope bar (under shell header) */}
        <Space
          direction="vertical"
          size="small"
          style={{ marginBottom: 16, width: '100%' }}
        >
          <Space align="center" wrap>
            <Tag color="blue">Scope: Platform overview</Tag>
            <Tag>
              Modules: EkoH, EthiKos, KonnectED, Kreative, TeamBuilder
            </Tag>
          </Space>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            This dashboard aggregates cross-module signals: user activity,
            moderation load, and system health. Use the module-level views in
            Kontrol to inspect governance for a specific module.
          </Paragraph>
        </Space>

        {/* 1. HIGH-LEVEL KPI & SYSTEM HEALTH - Uses StatisticCard */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: 'Active users (24h)',
                value: 4520,
                prefix: <UserOutlined />,
              }}
              loading={loading}
              extra={<Tag color="green">+12% vs yesterday</Tag>}
              hoverable
              onClick={() => router.push('/kontrol/users/all')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: 'Pending moderation',
                value: 15,
                prefix: <WarningOutlined />,
              }}
              loading={loading}
              extra={<Tag color="red">1 critical</Tag>}
              hoverable
              onClick={() => router.push('/kontrol/moderation/queue')}
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: 'New content (7d)',
                value: 892,
                prefix: <LineChartOutlined />,
              }}
              loading={loading}
              extra={<Tag color="blue">KonnectED +500</Tag>}
              hoverable
            />
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <StatisticCard
              statistic={{
                title: 'API latency (P95)',
                value: 145,
                suffix: 'ms',
              }}
              loading={loading}
              extra={<Tag color="green">Good</Tag>}
              hoverable
              onClick={() => router.push('/reports/perf')}
            />
          </Col>
        </Row>

        {/* 2. MODERATION QUEUE & SYSTEM ACTIVITY */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={16}>
            <ProCard
              title={
                <Space>
                  <AuditOutlined /> Critical moderation queue
                  <Tag>Multi-module</Tag>
                </Space>
              }
              headerBordered
              extra={
                <Button
                  type="link"
                  onClick={() => router.push('/kontrol/moderation/queue')}
                >
                  View all
                </Button>
              }
            >
              <ProTable
                columns={PRO_TABLE_COLUMNS}
                dataSource={MODERATION_MOCK_DATA}
                rowKey="id"
                search={false}
                options={false}
                pagination={{ pageSize: 4, hideOnSinglePage: true }}
                dateFormatter="string"
                toolBarRender={false}
              />
            </ProCard>
          </Col>
          <Col xs={24} lg={8}>
            <ProCard
              title={
                <Space>
                  <ClockCircleOutlined /> Recent admin activity
                  <Tag>Cross-module</Tag>
                </Space>
              }
              headerBordered
              loading={loading}
              style={{ minHeight: 400 }}
              extra={
                <Button
                  type="link"
                  onClick={() => router.push('/kontrol/audit-log')}
                >
                  View log
                </Button>
              }
            >
              <List
                itemLayout="horizontal"
                dataSource={USER_ACTIVITY_MOCK_DATA}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<span>{item.action}</span>}
                      description={
                        <Space size={4} wrap>
                          <Text type="secondary">by {item.user}</Text>
                          <Tag color="blue">{item.module}</Tag>
                          <Text type="secondary">({item.date})</Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </ProCard>
          </Col>
        </Row>

        {/* 3. PLATFORM HEALTH & CONFIGURATION */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} lg={12}>
            <ProCard
              title={
                <Space>
                  <GlobalOutlined /> Platform health overview
                  <Tag color="blue">Scope: Platform</Tag>
                </Space>
              }
              headerBordered
              loading={loading}
              actions={[
                <Button
                  key="run"
                  type="primary"
                  onClick={handleRunSystemCheck}
                  loading={loading}
                  icon={<CheckCircleOutlined />}
                >
                  Run diagnostics
                </Button>,
                <Button
                  key="logs"
                  icon={<SettingOutlined />}
                  onClick={() => router.push('/kontrol/audit-log')}
                >
                  View logs
                </Button>,
              ]}
            >
              <Space
                direction="vertical"
                style={{ width: '100%', padding: '10px 0' }}
              >
                <Row gutter={16} align="middle">
                  <Col span={10}>
                    <Text strong>Database connections</Text>
                  </Col>
                  <Col span={14}>
                    <Progress
                      percent={85}
                      status="exception"
                      format={(percent) => `${percent}% (High)`}
                    />
                  </Col>
                </Row>
                <Row gutter={16} align="middle">
                  <Col span={10}>
                    <Text strong>Cache hit rate</Text>
                  </Col>
                  <Col span={14}>
                    <Progress percent={98} status="success" />
                  </Col>
                </Row>
                <Row gutter={16} align="middle">
                  <Col span={10}>
                    <Text strong>Disk usage (analytics DB)</Text>
                  </Col>
                  <Col span={14}>
                    <Progress percent={65} status="normal" />
                  </Col>
                </Row>
                <Row gutter={16} align="middle">
                  <Col span={10}>
                    <Text strong>Queue depth (ETL)</Text>
                  </Col>
                  <Col span={14}>
                    <Progress percent={20} status="normal" />
                  </Col>
                </Row>
              </Space>
            </ProCard>
          </Col>
          <Col xs={24} lg={12}>
            <ProCard
              title={
                <Space>
                  <DeploymentUnitOutlined /> System configuration
                  <Tag color="blue">Scope: Platform</Tag>
                </Space>
              }
              headerBordered
              loading={loading}
              extra={
                <Button
                  type="link"
                  icon={<SettingOutlined />}
                  onClick={() => router.push('/kontrol/konsensus')}
                >
                  Edit
                </Button>
              }
            >
              <ProDescriptions
                column={2}
                dataSource={SYSTEM_CONFIG_DATA}
                columns={[
                  { title: 'Version', dataIndex: 'version', span: 1 },
                  { title: 'Deployment', dataIndex: 'deployment', span: 1 },
                  { title: 'Last update', dataIndex: 'lastUpdate', span: 2 },
                  { title: 'Mode', dataIndex: 'mode', span: 1 },
                  { title: 'CDN status', dataIndex: 'cdn', span: 1 },
                  { title: 'Metrics service', dataIndex: 'metrics', span: 2 },
                ]}
              />
            </ProCard>
          </Col>
        </Row>

        {/* 4. USER/ROLE MANAGEMENT SUMMARY */}
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card
              title={
                <Space>
                  <UserOutlined /> User management summary
                  <Tag color="blue">Scope: Platform</Tag>
                </Space>
              }
              extra={
                <Button
                  type="link"
                  icon={<RocketOutlined />}
                  onClick={() => router.push('/kontrol/users/all')}
                >
                  Go to user list
                </Button>
              }
            >
              <Row gutter={16}>
                <Col xs={24} sm={12} md={8}>
                  <Statistic title="Total registered users" value={10567} />
                  <Progress percent={100} showInfo={false} />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Statistic
                    title="New signups (last 7d)"
                    value={45}
                    valueStyle={{ color: '#3f8600' }}
                  />
                  <Progress
                    percent={(45 / 100) * 100}
                    status="active"
                    showInfo={false}
                  />
                </Col>
                <Col xs={24} sm={12} md={8}>
                  <Statistic
                    title="Admins & moderators"
                    value={22}
                    valueStyle={{ color: '#faad14' }}
                  />
                  <Progress
                    percent={(22 / 10000) * 100}
                    showInfo={false}
                  />
                </Col>
              </Row>
              <div style={{ marginTop: 20 }}>
                <Tag color="magenta">Roles: 5</Tag>
                <Tag color="volcano">Pending approvals: 3</Tag>
                <Tag color="cyan">Permissions checked: 95%</Tag>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </KontrolPageShell>
  );
}
