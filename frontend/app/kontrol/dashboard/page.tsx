'use client';

import React, { useState } from 'react';
import {
  // Standard Antd components used in the layout and logic
  Card, // Kept for the final section which is simpler
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Button,
  List,
  Progress,
  Table,
  notification,
  Divider,
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
// FIX: Import all ProComponents from the unified entry point
import {
  ProCard,
  ProTable,
  ProDescriptions,
  StatisticCard,
  type ProColumns,
  PageContainer,
} from '@ant-design/pro-components';
import { useRouter } from 'next/navigation';

const { Text, Paragraph, Title } = Typography;

const MODERATION_MOCK_DATA = [
  { id: 101, type: 'Comment', status: 'Pending', target: 'EthiKos Debate: Topic #15', flags: 4, severity: 'High' },
  { id: 102, type: 'User Report', status: 'Pending', target: 'User: @jdoe', flags: 8, severity: 'Critical' },
  { id: 103, type: 'Document', status: 'Under Review', target: 'KonnectED Resource: Doc 21', flags: 2, severity: 'Medium' },
  { id: 104, type: 'Image', status: 'Pending', target: 'Kreative Gallery: Album 3', flags: 1, severity: 'Low' },
];

const USER_ACTIVITY_MOCK_DATA = [
  { key: '1', date: '2025-11-28', user: 'Admin Jane', action: 'Banned User @spam_bot', module: 'Auth' },
  { key: '2', date: '2025-11-28', user: 'System', action: 'Archived 120-day old content', module: 'KonnectED' },
  { key: '3', date: '2025-11-27', user: 'Moderator Tom', action: 'Approved Comment #103', module: 'EthiKos' },
  { key: '4', 'date': '2025-11-26', user: 'Admin Jane', action: 'Updated Site Configuration', module: 'Kontrol' },
];

// Uses ProColumns for typing
const PRO_TABLE_COLUMNS: ProColumns<(typeof MODERATION_MOCK_DATA)[0]>[] = [
  { title: 'ID', dataIndex: 'id', key: 'id', valueType: 'digit' },
  { title: 'Type', dataIndex: 'type', key: 'type', valueType: 'select', valueEnum: { Comment: { text: 'Comment' }, 'User Report': { text: 'User Report' }, Document: { text: 'Document' }, Image: { text: 'Image' } } },
  { title: 'Target', dataIndex: 'target', key: 'target', ellipsis: true },
  { title: 'Flags', dataIndex: 'flags', key: 'flags', valueType: 'statistic', sorter: (a, b) => a.flags - b.flags },
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
    render: (text, record, _, action) => [
      <a key="view" onClick={() => notification.info({ message: `Viewing ${record.type} ${record.id}` })}>View</a>,
      <a key="process" onClick={() => notification.success({ message: `Processing ${record.id}` })}>Process</a>,
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

const ANTD_DESCRIPTION_ITEMS = [
  { key: '1', label: 'Version', children: SYSTEM_CONFIG_DATA.version },
  { key: '2', label: 'Deployment', children: SYSTEM_CONFIG_DATA.deployment },
  { key: '3', label: 'Last Update', children: SYSTEM_CONFIG_DATA.lastUpdate },
  { key: '4', label: 'Mode', children: SYSTEM_CONFIG_DATA.mode },
  { key: '5', label: 'CDN Status', children: SYSTEM_CONFIG_DATA.cdn },
  { key: '6', label: 'Metrics Service', children: SYSTEM_CONFIG_DATA.metrics },
];

export default function KontrolDashboard() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRunSystemCheck = () => {
    setLoading(true);
    notification.info({ message: 'Running system health checks...' });
    setTimeout(() => {
      setLoading(false);
      notification.success({ message: 'System check complete. All services nominal.' });
    }, 2000);
  };

  return (
    <PageContainer ghost>
    <div style={{ padding: 20 }}>
      {/* 1. HIGH-LEVEL KPI & SYSTEM HEALTH - Uses StatisticCard */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{ title: "Active Users (24h)", value: 4520, prefix: <UserOutlined /> }}
            loading={loading}
            extra={<Tag color="green">+12% vs. yesterday</Tag>}
            hoverable
            onClick={() => router.push('/kontrol/users/all')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{ title: "Pending Moderation", value: 15, prefix: <WarningOutlined /> }}
            loading={loading}
            extra={<Tag color="red">1 Critical</Tag>}
            hoverable
            onClick={() => router.push('/kontrol/moderation/queue')}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{ title: "New Content (7d)", value: 892, prefix: <LineChartOutlined /> }}
            loading={loading}
            extra={<Tag color="blue">KonnectED +500</Tag>}
            hoverable
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatisticCard
            statistic={{ title: "API Latency (P95)", value: 145, suffix: "ms" }}
            loading={loading}
            extra={<Tag color="green">Good</Tag>}
            hoverable
            onClick={() => router.push('/reports/perf')}
          />
        </Col>
      </Row>

      {/* 2. MODERATION QUEUE & SYSTEM ACTIVITY - Uses ProCard and ProTable */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={16}>
          <ProCard
            title={<Space><AuditOutlined /> Critical Moderation Queue</Space>}
            headerBordered
            extra={<Button type="link" onClick={() => router.push('/kontrol/moderation/queue')}>View All</Button>}
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
            title={<Space><ClockCircleOutlined /> Recent Admin Activity</Space>}
            headerBordered
            loading={loading}
            style={{ minHeight: 400 }}
            extra={<Button type="link" onClick={() => router.push('/kontrol/audit-log')}>View Log</Button>}
          >
            {/* Simple List for a quick feed */}
            <List
              itemLayout="horizontal"
              dataSource={USER_ACTIVITY_MOCK_DATA}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={<a href={`#`}>{item.action}</a>}
                    description={`by ${item.user} in ${item.module} (${item.date})`}
                  />
                </List.Item>
              )}
            />
          </ProCard>
        </Col>
      </Row>

      {/* 3. PLATFORM HEALTH & CONFIGURATION - Uses ProCard and ProDescriptions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} lg={12}>
          <ProCard
            title={<Space><GlobalOutlined /> Platform Health Overview</Space>}
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
                Run Diagnostics
              </Button>,
              <Button key="logs" icon={<SettingOutlined />} onClick={() => router.push('/kontrol/audit-log')}>View Logs</Button>
            ]}
          >
            <Space direction="vertical" style={{ width: '100%', padding: '10px 0' }}>
              <Row gutter={16} align="middle">
                <Col span={10}>**Database Connections:**</Col>
                <Col span={14}><Progress percent={85} status="exception" format={percent => `${percent}% (High)`} /></Col>
              </Row>
              <Row gutter={16} align="middle">
                <Col span={10}>**Cache Hit Rate:**</Col>
                <Col span={14}><Progress percent={98} status="success" /></Col>
              </Row>
              <Row gutter={16} align="middle">
                <Col span={10}>**Disk Usage (Analytics DB):**</Col>
                <Col span={14}><Progress percent={65} status="normal" /></Col>
              </Row>
              <Row gutter={16} align="middle">
                <Col span={10}>**Queue Depth (ETL):**</Col>
                <Col span={14}><Progress percent={20} status="normal" /></Col>
              </Row>
            </Space>
          </ProCard>
        </Col>
        <Col xs={24} lg={12}>
          <ProCard
            title={<Space><DeploymentUnitOutlined /> System Configuration</Space>}
            headerBordered
            loading={loading}
            extra={<Button type="link" icon={<SettingOutlined />} onClick={() => router.push('/kontrol/konsensus')}>Edit</Button>}
          >
            <ProDescriptions
              column={2}
              dataSource={SYSTEM_CONFIG_DATA}
              columns={[
                { title: 'Version', dataIndex: 'version', span: 1 },
                { title: 'Deployment', dataIndex: 'deployment', span: 1 },
                { title: 'Last Update', dataIndex: 'lastUpdate', span: 2 },
                { title: 'Mode', dataIndex: 'mode', span: 1 },
                { title: 'CDN Status', dataIndex: 'cdn', span: 1 },
                { title: 'Metrics Service', dataIndex: 'metrics', span: 2 },
              ]}
            />
          </ProCard>
        </Col>
      </Row>

      {/* 4. USER/ROLE MANAGEMENT SUMMARY - Uses standard Antd Card here */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card
            title={<Space><UserOutlined /> User Management Summary</Space>}
            extra={<Button type="link" icon={<RocketOutlined />} onClick={() => router.push('/kontrol/users/all')}>Go to User List</Button>}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8}>
                <Statistic title="Total Registered Users" value={10567} />
                <Progress percent={100} showInfo={false} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic title="New Signups (Last 7d)" value={45} valueStyle={{ color: '#3f8600' }} />
                <Progress percent={45 / 100 * 100} status="active" showInfo={false} />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Statistic title="Admins & Moderators" value={22} valueStyle={{ color: '#faad14' }} />
                <Progress percent={22 / 10000 * 100} showInfo={false} />
              </Col>
            </Row>
            <div style={{ marginTop: 20 }}>
              <Tag color="magenta">Roles: 5</Tag>
              <Tag color="volcano">Pending Approvals: 3</Tag>
              <Tag color="cyan">Permissions Checked: 95%</Tag>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
    </PageContainer>
  );
}