// FILE: frontend/app/kontrol/moderation/queue/page.tsx
'use client';


import { useLanguage } from '@/context/LanguageContext';
import {
  CheckCircleOutlined,
  EyeOutlined,
  FlagOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  StopOutlined,
  UserOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  ProCard,
  type ProColumns,
  ProDescriptions,
  ProTable,
} from '@ant-design/pro-components';
import {
  Avatar,
  Badge,
  Button,
  Drawer,
  List,
  message,
  Popconfirm,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import React, { useRef, useState } from 'react';

import { apiFetch } from '@/api';
import KontrolPageShell from '@/app/kontrol/KontrolPageShell';

const { Paragraph, Text } = Typography;

// --- Types ---
type ModerationItem = {
  id: number;
  contentSnippet: string;
  fullContent: string;
  author: string;
  authorReputation: number;
  reportReason: string;
  timestamp: string;
  status: 'pending' | 'reviewed' | 'resolved';
  severity: 'critical' | 'high' | 'medium' | 'low';
  type: 'comment' | 'post' | 'user_profile';
  reportCount: number;
  reporters: string[];
};

type ModerationApiRecord = {
  id?: number;
  content_snippet?: string;
  full_content?: string;
  author_username?: string;
  author_reputation_score?: number;
  report_reason?: string;
  created?: string;
  status?: ModerationItem['status'];
  severity?: ModerationItem['severity'];
  target_type?: ModerationItem['type'];
  report_count?: number;
  reporters?: string[];
};

type ModerationApiResponse = {
  count?: number;
  results?: unknown[];
};

function isModerationApiResponse(data: unknown): data is ModerationApiResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    ('results' in data || 'count' in data)
  );
}

export default function ModerationQueuePage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [messageApi, messageContextHolder] = message.useMessage();
  const actionRef = useRef<ActionType>();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ModerationItem | undefined>(
    undefined,
  );

  const handleOpenDrawer = (record: ModerationItem) => {
    setCurrentRow(record);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setCurrentRow(undefined);
  };

  const handleAction = async (
    action: string,
    id: number,
    newStatus: string = 'resolved',
  ) => {
    try {
      messageApi.loading(i18nT("ui.kontrol.moderation.queue.processingAction"), 0.5);

      const response = await apiFetch(`/api/admin/moderation/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update ticket');

      messageApi.success(`${action} applied successfully`);
      actionRef.current?.reload();
      if (drawerOpen) handleCloseDrawer();
    } catch (error) {
       
      console.error(error);
      messageApi.error(i18nT("ui.kontrol.moderation.queue.failedToApplyAction"));
    }
  };

  const columns: ProColumns<ModerationItem>[] = [
    {
      title: i18nT("ui.kontrol.moderation.queue.severity"),
      dataIndex: 'severity',
      width: 100,
      valueEnum: {
        critical: { text: i18nT("ui.kontrol.moderation.queue.critical"), status: 'Error' },
        high: { text: i18nT("ui.kontrol.moderation.queue.high"), status: 'Warning' },
        medium: { text: i18nT("ui.kontrol.moderation.queue.medium"), status: 'Processing' },
        low: { text: i18nT("ui.kontrol.moderation.queue.low"), status: 'Success' },
      },
      sorter: (a, b) => {
        const weight = { critical: 4, high: 3, medium: 2, low: 1 };
        return weight[a.severity] - weight[b.severity];
      },
    },
    {
      title: i18nT("ui.kontrol.moderation.queue.type"),
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        comment: { text: i18nT("ui.kontrol.moderation.queue.comment") },
        post: { text: i18nT("ui.kontrol.moderation.queue.post") },
        user_profile: { text: i18nT("ui.kontrol.moderation.queue.userProfile") },
      },
      width: 120,
    },
    {
      title: i18nT("ui.kontrol.moderation.queue.contentSnippet"),
      dataIndex: 'contentSnippet',
      ellipsis: true,
      render: (dom, entity) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color="volcano" icon={<FlagOutlined />}>
              {entity.reportReason}
            </Tag>
            {entity.reportCount > 1 && (
              <Badge
                count={entity.reportCount}
                style={{ backgroundColor: '#f5222d' }}
              />
            )}
          </Space>
          <span
            style={{
              color: '#666',
              fontSize: '13px',
              marginTop: 4,
              display: 'block',
            }}
          >
            "{dom}"
          </span>
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.moderation.queue.author"),
      dataIndex: 'author',
      width: 140,
      copyable: true,
      render: (text, entity) => (
        <Space>
          <Avatar
            size="small"
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                entity.authorReputation < 0 ? '#ff4d4f' : '#87d068',
            }}
          />
          <a>{text}</a>
        </Space>
      ),
    },
    {
      title: i18nT("ui.kontrol.moderation.queue.time"),
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      search: false,
    },
    {
      title: i18nT("ui.kontrol.moderation.queue.status"),
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      valueEnum: {
        pending: { text: i18nT("ui.kontrol.moderation.queue.pending"), status: 'Processing' },
        reviewed: { text: i18nT("ui.kontrol.moderation.queue.reviewed"), status: 'Default' },
        resolved: { text: i18nT("ui.kontrol.moderation.queue.resolved"), status: 'Success' },
      },
    },
    {
      title: i18nT("ui.kontrol.moderation.queue.actions"),
      valueType: 'option',
      width: 160,
      render: (_, record) => [
        <Tooltip title={i18nT("ui.kontrol.moderation.queue.viewDetails")} key="view">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handleOpenDrawer(record)}
          />
        </Tooltip>,
        <Tooltip title={i18nT("ui.kontrol.moderation.queue.dismissResolve")} key="dismiss">
          <Popconfirm
            title={i18nT("ui.kontrol.moderation.queue.dismissReport")}
            description={i18nT("ui.kontrol.moderation.queue.theContentWillRemainVisibleAndTicket")}
            onConfirm={() =>
              handleAction(i18nT("ui.kontrol.moderation.queue.reportDismissed"), record.id, 'resolved')
            }
          >
            <Button
              type="text"
              icon={<CheckCircleOutlined style={{ color: 'green' }} />}
            />
          </Popconfirm>
        </Tooltip>,
        <Tooltip title={i18nT("ui.kontrol.moderation.queue.removeBan")} key="ban">
          <Popconfirm
            title={i18nT("ui.kontrol.moderation.queue.removeContentBanUser")}
            description={i18nT("ui.kontrol.moderation.queue.thisIsASevereAction")}
            onConfirm={() =>
              handleAction(
                i18nT("ui.kontrol.moderation.queue.userBannedContentRemoved"),
                record.id,
                'resolved',
              )
            }
            okText={i18nT("ui.kontrol.moderation.queue.banRemove")}
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<StopOutlined style={{ color: 'red' }} />}
            />
          </Popconfirm>
        </Tooltip>,
      ],
    },
  ];

  const title = i18nT("ui.kontrol.moderation.queue.moderationQueue");
  const subtitle = (
    <>
      {i18nT("ui.kontrol.moderation.queue.centralQueueForReportedContentAcrossAll")}
    </>
  );

  const primaryAction = (
    <Button
      key="refresh"
      onClick={() => actionRef.current?.reload()}
    >
      {i18nT("ui.kontrol.moderation.queue.refreshQueue")}
    </Button>
  );

  const secondaryActions = (
    <Space>
      <Tooltip
        title={i18nT("ui.kontrol.moderation.queue.thisViewAggregatesModerationTicketsFromEvery")}
      >
        <Button icon={<InfoCircleOutlined />} />
      </Tooltip>
      <Button type="default">{i18nT("ui.kontrol.moderation.queue.exportLogs")}</Button>
    </Space>
  );

  return (
    <KontrolPageShell
      title={title}
      subtitle={subtitle}
      scope="platform"
      metaTitle={i18nT("ui.kontrol.moderation.queue.kontrolPlatformModerationQueue")}
      primaryAction={primaryAction}
      secondaryActions={secondaryActions}
      maxWidth={1200}
    >
      {messageContextHolder}
      <ProTable<ModerationItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params) => {
          try {
            const searchParams = new URLSearchParams();
            if (params.status)
              searchParams.append('status', params.status as string);
            if (params.type)
              searchParams.append('search', params.type as string);

            const res = await apiFetch(
              `/api/admin/moderation/?${searchParams.toString()}`,
            );
            if (!res.ok) throw new Error('Failed to fetch tickets');

            const data: unknown = await res.json();

            let results: unknown[] = [];
            let total = 0;

            if (isModerationApiResponse(data)) {
              results = data.results ?? [];
              total = data.count ?? results.length;
            } else if (Array.isArray(data)) {
              results = data;
              total = data.length;
            }

            const mappedData: ModerationItem[] = results.map((item) => {
              const it = item as ModerationApiRecord;
              return {
                id: it.id ?? 0,
                contentSnippet: it.content_snippet ?? '',
                fullContent: it.full_content || it.content_snippet || '',
                author: it.author_username || 'Unknown',
                authorReputation: it.author_reputation_score || 0,
                reportReason: it.report_reason ?? '',
                timestamp: it.created ?? '',
                status: it.status ?? 'pending',
                severity: it.severity ?? 'low',
                type: it.target_type ?? 'comment',
                reportCount: it.report_count || 1,
                reporters: it.reporters || [],
              } as ModerationItem;
            });

            return {
              data: mappedData,
              success: true,
              total,
            };
          } catch (e) {
             
            console.error(e);
            messageApi.error(i18nT("ui.kontrol.moderation.queue.errorLoadingModerationQueue"));
            return { data: [], success: false };
          }
        }}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        headerTitle={i18nT("ui.kontrol.moderation.queue.activeFlags")}
        toolBarRender={() => [
          <Button key="bulk-approve" type="primary" disabled title={i18nT("ui.kontrol.moderation.queue.bulkModerationIsNotExposedByThe")}>
            {i18nT("ui.kontrol.moderation.queue.batchDismissUnavailable")}
          </Button>,
          <Button key="bulk-ban" danger disabled title={i18nT("ui.kontrol.moderation.queue.bulkModerationIsNotExposedByThe")}>
            {i18nT("ui.kontrol.moderation.queue.batchRemoveUnavailable")}
          </Button>,
        ]}
      />

      <Drawer
        width={720}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={
          <Space>
            <WarningOutlined style={{ color: '#faad14' }} />
            <span>{i18nT("ui.kontrol.moderation.queue.moderationTicket")}{currentRow?.id}</span>
            {currentRow?.severity && (
              <Tag
                color={
                  currentRow.severity === 'critical' ? 'red' : 'blue'
                }
              >
                {currentRow.severity.toUpperCase()}
              </Tag>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button onClick={handleCloseDrawer}>{i18nT("ui.kontrol.moderation.queue.cancel")}</Button>
            <Button
              type="primary"
              danger
              onClick={() =>
                currentRow &&
                handleAction(
                  'Content removed',
                  currentRow.id,
                  'resolved',
                )
              }
            >
              {i18nT("ui.kontrol.moderation.queue.removeContent")}
            </Button>
          </Space>
        }
      >
        {currentRow && (
          <Tabs
            defaultActiveKey="1"
            items={[
              {
                key: '1',
                label: i18nT("ui.kontrol.moderation.queue.reportDetails"),
                children: (
                  <Space
                    direction="vertical"
                    size="middle"
                    style={{ width: '100%' }}
                  >
                    <ProCard
                      split="vertical"
                      bordered
                      headerBordered
                    >
                      <ProCard title={i18nT("ui.kontrol.moderation.queue.reporters")} colSpan="50%">
                        <List
                          size="small"
                          dataSource={
                            currentRow.reporters &&
                            currentRow.reporters.length > 0
                              ? currentRow.reporters
                              : ['Anonymous reports']
                          }
                          renderItem={(item) => (
                            <List.Item>
                              <UserOutlined /> {item}
                            </List.Item>
                          )}
                        />
                      </ProCard>
                      <ProCard title={i18nT("ui.kontrol.moderation.queue.metadata")} colSpan="50%">
                        <ProDescriptions
                          column={1}
                          size="small"
                        >
                          <ProDescriptions.Item
                            label={i18nT("ui.kontrol.moderation.queue.reason")}
                            valueType="text"
                          >
                            <Text strong>
                              {currentRow.reportReason}
                            </Text>
                          </ProDescriptions.Item>
                          <ProDescriptions.Item
                            label={i18nT("ui.kontrol.moderation.queue.timestamp")}
                            valueType="dateTime"
                          >
                            {currentRow.timestamp}
                          </ProDescriptions.Item>
                          <ProDescriptions.Item label={i18nT("ui.kontrol.moderation.queue.type")}>
                            {currentRow.type}
                          </ProDescriptions.Item>
                        </ProDescriptions>
                      </ProCard>
                    </ProCard>

                    <ProCard
                      bordered
                      headerBordered
                      type="inner"
                      title={
                        <Space>
                          <InfoCircleOutlined /> {i18nT("ui.kontrol.moderation.queue.contentPreview")}
                        </Space>
                      }
                    >
                      <div
                        style={{
                          padding: '16px',
                          background: '#f9f9f9',
                          borderRadius: '6px',
                          border: '1px solid #eee',
                          minHeight: '100px',
                        }}
                      >
                        <Paragraph style={{ marginBottom: 0 }}>
                          {currentRow.fullContent}
                        </Paragraph>
                      </div>
                    </ProCard>
                  </Space>
                ),
              },
              {
                key: '2',
                label: i18nT("ui.kontrol.moderation.queue.authorContext"),
                children: (
                  <ProCard
                    title={i18nT("ui.kontrol.moderation.queue.author_e025f5", { author: currentRow.author })}
                    bordered
                    headerBordered
                  >
                    <ProDescriptions column={2}>
                      <ProDescriptions.Item
                        label={i18nT("ui.kontrol.moderation.queue.reputationScore")}
                        valueType="digit"
                      >
                        {currentRow.authorReputation}
                      </ProDescriptions.Item>
                      <ProDescriptions.Item
                        label={i18nT("ui.kontrol.moderation.queue.accountAge")}
                        valueType="text"
                      >
                        {i18nT("ui.kontrol.moderation.queue.text25Years")}
                      </ProDescriptions.Item>
                      <ProDescriptions.Item
                        label={i18nT("ui.kontrol.moderation.queue.previousViolations")}
                        valueType="digit"
                      >
                        0
                      </ProDescriptions.Item>
                      <ProDescriptions.Item label={i18nT("ui.kontrol.moderation.queue.role")}>
                        {i18nT("ui.kontrol.moderation.queue.user")}
                      </ProDescriptions.Item>
                    </ProDescriptions>
                    <Button
                      type="link"
                      icon={<HistoryOutlined />}
                    >
                      {i18nT("ui.kontrol.moderation.queue.viewFullActivityLog")}
                    </Button>
                  </ProCard>
                ),
              },
            ]}
          />
        )}
      </Drawer>
    </KontrolPageShell>
  );
}
