// FILE: frontend/app/kontrol/moderation/community/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  ClockCircleOutlined,
  EllipsisOutlined,
  FireOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  TeamOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  ProCard,
  type ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import {
  Alert,
  Avatar,
  Button,
  Descriptions,
  Drawer,
  Dropdown,
  List,
  Progress,
  Space,
  Switch,
  Tag,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';

import KontrolPageShell from '@/app/kontrol/KontrolPageShell';

const { Text } = Typography;

// --- Types ---
type CommunityContext = {
  id: string;
  name: string;
  module: 'Ethikos' | 'Ekoh' | 'Konnected' | 'Kreative';
  type: 'Debate' | 'Group' | 'Course' | 'Project';
  activeUsers: number;
  openFlags: number;
  toxicityScore: number; // 0-100
  status: 'active' | 'locked' | 'archived';
  lastActivity: string;
  moderators: string[];
};

// --- Declared preview data: no cross-module community-moderation contract yet ---
const PREVIEW_COMMUNITIES: CommunityContext[] = [
  {
    id: 'ETH-404',
    name: 'Debate: AI Rights & Ethics',
    module: 'Ethikos',
    type: 'Debate',
    activeUsers: 142,
    openFlags: 15,
    toxicityScore: 85,
    status: 'active',
    lastActivity: '2 mins ago',
    moderators: ['@mod_tom'],
  },
  {
    id: 'KON-102',
    name: 'React Learners Group',
    module: 'Konnected',
    type: 'Group',
    activeUsers: 560,
    openFlags: 2,
    toxicityScore: 12,
    status: 'active',
    lastActivity: '1 hour ago',
    moderators: ['@teacher_ann', '@helper_bob'],
  },
  {
    id: 'EKO-991',
    name: 'Proposal #22: Carbon Tax',
    module: 'Ekoh',
    type: 'Debate',
    activeUsers: 89,
    openFlags: 8,
    toxicityScore: 65,
    status: 'locked',
    lastActivity: '1 day ago',
    moderators: [],
  },
  {
    id: 'KRE-005',
    name: 'NFT Showcase: Space Cats',
    module: 'Kreative',
    type: 'Project',
    activeUsers: 1200,
    openFlags: 45,
    toxicityScore: 40,
    status: 'active',
    lastActivity: '5 mins ago',
    moderators: ['@artist_zoe'],
  },
];

export default function CommunityModerationPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const actionRef = useRef<ActionType>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentContext, setCurrentContext] = useState<
    CommunityContext | undefined
  >(undefined);

  const handleOpenDrawer = (record: CommunityContext) => {
    setCurrentContext(record);
    setDrawerOpen(true);
  };

  const columns: ProColumns<CommunityContext>[] = [
    {
      title: i18nT("ui.kontrol.moderation.community.contextName"),
      dataIndex: 'name',
      copyable: true,
      render: (dom, entity) => (
        <Space>
          <Avatar
            shape="square"
            style={{
              backgroundColor:
                entity.module === 'Ethikos' ? '#722ed1' : '#1890ff',
            }}
          >
            {entity.module[0]}
          </Avatar>
          <Space direction="vertical" size={0}>
            <Text strong>{dom}</Text>
            <Tag
              style={{
                fontSize: 12,
                paddingInline: 8,
                lineHeight: '18px',
                height: 'auto',
              }}
            >
              {entity.type}
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.moderation.community.module"),
      dataIndex: 'module',
      valueType: 'select',
      valueEnum: {
        Ethikos: { text: i18nT("ui.kontrol.moderation.community.ethikos") },
        Ekoh: { text: i18nT("ui.kontrol.moderation.community.ekoh") },
        Konnected: { text: i18nT("ui.kontrol.moderation.community.konnected") },
        Kreative: { text: i18nT("ui.kontrol.moderation.community.kreative") },
      },
      width: 140,
    },
    {
      title: i18nT("ui.kontrol.moderation.community.healthToxicity"),
      dataIndex: 'toxicityScore',
      sorter: (a, b) => a.toxicityScore - b.toxicityScore,
      width: 200,
      render: (_, entity) => (
        <Space>
          <Progress
            type="circle"
            percent={entity.toxicityScore}
            width={32}
            strokeColor={
              entity.toxicityScore > 80
                ? '#ff4d4f'
                : entity.toxicityScore > 50
                ? '#faad14'
                : '#52c41a'
            }
            format={() => ''}
          />
          <Space direction="vertical" size={0}>
            <Text
              type={
                entity.toxicityScore > 80 ? 'danger' : 'secondary'
              }
            >
              {entity.toxicityScore > 80
                ? i18nT("ui.kontrol.moderation.community.critical")
                : entity.toxicityScore > 50
                ? i18nT("ui.kontrol.moderation.community.heated")
                : i18nT("ui.kontrol.moderation.community.healthy")}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {i18nT("ui.kontrol.moderation.community.higherScoreMoreReportedToxicity")}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.moderation.community.activeFlags"),
      dataIndex: 'openFlags',
      sorter: (a, b) => a.openFlags - b.openFlags,
      render: (val) => (
        <Tag
          color={Number(val) > 10 ? 'red' : 'default'}
          icon={<WarningOutlined />}
        >
          {val} {i18nT("ui.kontrol.moderation.community.open")}
        </Tag>
      ),
    },
    {
      title: i18nT("ui.kontrol.moderation.community.status"),
      dataIndex: 'status',
      valueEnum: {
        active: { text: i18nT("ui.kontrol.moderation.community.active"), status: 'Success' },
        locked: { text: i18nT("ui.kontrol.moderation.community.locked"), status: 'Error' },
        archived: { text: i18nT("ui.kontrol.moderation.community.archived"), status: 'Default' },
      },
    },
    {
      title: i18nT("ui.kontrol.moderation.community.actions"),
      valueType: 'option',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'manage',
                label: i18nT("ui.kontrol.moderation.community.manageContext"),
                icon: <SafetyCertificateOutlined />,
                onClick: () => handleOpenDrawer(record),
              },
              {
                key: 'history',
                label: i18nT("ui.kontrol.moderation.community.viewLogs"),
                icon: <ClockCircleOutlined />,
              },
              { type: 'divider' as const },
              {
                key: 'lock',
                label:
                  record.status === 'locked'
                    ? i18nT("ui.kontrol.moderation.community.unlock")
                    : i18nT("ui.kontrol.moderation.community.lockThread"),
                icon: <LockOutlined />,
                danger: record.status !== 'locked',
              },
            ],
            onClick: () => undefined,
          }}
        >
          <Button
            type="text"
            icon={<EllipsisOutlined style={{ fontSize: 18 }} />}
          />
        </Dropdown>
      ),
    },
  ];

  const title = i18nT("ui.kontrol.moderation.community.communityModeration");
  const subtitle = (
    <>
      {i18nT("ui.kontrol.moderation.community.crossModuleViewOfCommunitiesEthikosEkoh")}
    </>
  );

  const primaryAction = (
    <Button key="create" type="primary" disabled title={i18nT("ui.kontrol.moderation.community.noCommunityModerationWriteContractIsExposed")}>
      {i18nT("ui.kontrol.moderation.community.newReportUnavailable")}
    </Button>
  );

  const secondaryActions = (
    <Space wrap>
      <Tag key="scope-platform" color="blue">
        {i18nT("ui.kontrol.moderation.community.moderationCrossModule")}
      </Tag>
      <Tag key="scope-impact" color="geekblue">
        {i18nT("ui.kontrol.moderation.community.actionsApplyPerContext")}
      </Tag>
      <Button
        key="refresh"
        onClick={() => actionRef.current?.reload()}
      >
        {i18nT("ui.kontrol.moderation.community.refreshMetrics")}
      </Button>
    </Space>
  );

  return (
    <KontrolPageShell
      title={title}
      subtitle={subtitle}
      scope="platform"
      metaTitle={i18nT("ui.kontrol.moderation.community.kontrolPlatformCommunityModeration")}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      maxWidth={1200}
    >
      <>
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.kontrol.moderation.community.communityModerationPreview")}
          description={i18nT("ui.kontrol.moderation.community.thisCrossModuleModerationViewUsesDeclared")}
          style={{ marginBottom: 16 }}
        />
        <ProTable<CommunityContext>
          columns={columns}
          actionRef={actionRef}
          cardBordered
          request={async () => ({
            data: PREVIEW_COMMUNITIES,
            success: true,
          })}
          rowKey="id"
          search={{
            labelWidth: 'auto',
            span: {
              xs: 24,
              sm: 12,
              md: 8,
              lg: 6,
              xl: 6,
              xxl: 6, // added to satisfy SpanConfig
            },
          }}
          pagination={{ pageSize: 10 }}
          headerTitle={i18nT("ui.kontrol.moderation.community.contextHealthMonitor")}
          toolBarRender={() => [
            <Button key="filter" icon={<FireOutlined />}>
              {i18nT("ui.kontrol.moderation.community.highToxicityOnly")}
            </Button>,
          ]}
        />

        {/* --- Context Management Drawer --- */}
        <Drawer
          width={600}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setCurrentContext(undefined);
          }}
          title={
            currentContext
              ? i18nT("ui.kontrol.moderation.community.manage", { name: currentContext.name })
              : i18nT("ui.kontrol.moderation.community.contextManager")
          }
        >
          {currentContext && (
            <Space
              direction="vertical"
              size="large"
              style={{ width: '100%' }}
            >
              {/* Scope / module context */}
              <Space>
                <Tag color="blue">
                  {i18nT("ui.kontrol.moderation.community.module_d60cea")} {currentContext.module}
                </Tag>
                <Tag>{currentContext.type}</Tag>
                <Tag color="geekblue">
                  {i18nT("ui.kontrol.moderation.community.scopeThisCommunityOnly")}
                </Tag>
              </Space>

              {/* Health Banner */}
              {currentContext.toxicityScore > 70 && (
                <Alert
                  message={i18nT("ui.kontrol.moderation.community.highToxicityDetected")}
                  description={i18nT("ui.kontrol.moderation.community.thisContextHasAnUnusuallyHighRate")}
                  type="error"
                  showIcon
                />
              )}

              {/* Quick Controls */}
              <ProCard
                title={i18nT("ui.kontrol.moderation.community.governanceControls")}
                bordered
                headerBordered
              >
                <Space
                  direction="vertical"
                  style={{ width: '100%' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text>
                      <LockOutlined /> {i18nT("ui.kontrol.moderation.community.lockContextReadOnly")}
                    </Text>
                    <Switch
                      checked={currentContext.status === 'locked'}
                      disabled
                    />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text>
                      <ClockCircleOutlined /> {i18nT("ui.kontrol.moderation.community.slowMode1Post10m")}
                    </Text>
                    <Switch disabled />
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text>
                      <StopOutlined /> {i18nT("ui.kontrol.moderation.community.requireApprovalForNewUsers")}
                    </Text>
                    <Switch defaultChecked disabled />
                  </div>
                </Space>
              </ProCard>

              {/* Metrics */}
              <Descriptions
                title={i18nT("ui.kontrol.moderation.community.liveMetrics")}
                bordered
                size="small"
                column={2}
              >
                <Descriptions.Item label={i18nT("ui.kontrol.moderation.community.activeUsers")}>
                  {currentContext.activeUsers}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.kontrol.moderation.community.openFlags")}>
                  {currentContext.openFlags}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.kontrol.moderation.community.lastActivity")}>
                  {currentContext.lastActivity}
                </Descriptions.Item>
                <Descriptions.Item label={i18nT("ui.kontrol.moderation.community.totalComments")}>
                  8,921
                </Descriptions.Item>
              </Descriptions>

              {/* Moderators List */}
              <List
                header={<Text strong>{i18nT("ui.kontrol.moderation.community.assignedModerators")}</Text>}
                bordered
                dataSource={currentContext.moderators}
                renderItem={(item) => (
                  <List.Item
                    actions={[<Text key="remove" type="secondary">{i18nT("ui.kontrol.moderation.community.readOnly")}</Text>]}
                  >
                    <Space>
                      <Avatar
                        size="small"
                        icon={<TeamOutlined />}
                      />
                      {item}
                    </Space>
                  </List.Item>
                )}
                footer={
                  <Button
                    type="dashed"
                    block
                    icon={<TeamOutlined />}
                    disabled
                  >
                    {i18nT("ui.kontrol.moderation.community.assignModeratorUnavailable")}
                  </Button>
                }
              />

              <Button
                type="primary"
                danger
                block
                size="large"
                icon={<StopOutlined />}
                disabled
              >
                {i18nT("ui.kontrol.moderation.community.emergencyFreezeUnavailable")}
              </Button>
            </Space>
          )}
        </Drawer>
      </>
    </KontrolPageShell>
  );
}
