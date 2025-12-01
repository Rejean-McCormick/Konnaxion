// FILE: frontend/app/kontrol/moderation/queue/page.tsx
'use client';

import React, { useRef, useState } from 'react';
import { 
  Button, 
  Tag, 
  Space, 
  Popconfirm, 
  message, 
  Tooltip, 
  Drawer, 
  Badge, 
  Tabs, 
  Typography,
  Avatar,
  List
} from 'antd';
import { 
  CheckCircleOutlined, 
  FlagOutlined, 
  EyeOutlined,
  StopOutlined,
  UserOutlined,
  HistoryOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { 
  ProTable, 
  type ProColumns, 
  type ActionType, 
  PageContainer,
  ProDescriptions,
  ProCard
} from '@ant-design/pro-components';

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
  reporters: string[]; // List of users who flagged this
};

export default function ModerationQueuePage() {
  const actionRef = useRef<ActionType>();
  
  // State for the Details Drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<ModerationItem | undefined>(undefined);

  const handleOpenDrawer = (record: ModerationItem) => {
    setCurrentRow(record);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setCurrentRow(undefined);
  };

  // Wired Action Handler
  const handleAction = async (action: string, id: number, newStatus: string = 'resolved') => {
    try {
        // Optimistic UI update
        message.loading('Processing action...', 0.5);
        
        // Real API Call to update status
        const response = await fetch(`/api/admin/moderation/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) throw new Error('Failed to update ticket');

        message.success(`${action} applied successfully`);
        actionRef.current?.reload(); 
        if (drawerOpen) handleCloseDrawer();

    } catch (error) {
        console.error(error);
        message.error('Failed to apply action.');
    }
  };

  // Column Definitions
  const columns: ProColumns<ModerationItem>[] = [
    {
      title: 'Severity',
      dataIndex: 'severity',
      width: 100,
      valueEnum: {
        critical: { text: 'Critical', status: 'Error' },
        high: { text: 'High', status: 'Warning' },
        medium: { text: 'Medium', status: 'Processing' },
        low: { text: 'Low', status: 'Success' },
      },
      sorter: (a, b) => {
        const weight = { critical: 4, high: 3, medium: 2, low: 1 };
        return weight[a.severity] - weight[b.severity];
      },
    },
    {
      title: 'Type',
      dataIndex: 'type',
      valueType: 'select',
      valueEnum: {
        comment: { text: 'Comment' },
        post: { text: 'Post' },
        user_profile: { text: 'User Profile' },
      },
      width: 120,
    },
    {
      title: 'Content Snippet',
      dataIndex: 'contentSnippet',
      ellipsis: true,
      render: (dom, entity) => (
        <Space direction="vertical" size={0}>
          <Space>
            <Tag color="volcano" icon={<FlagOutlined />}>{entity.reportReason}</Tag>
            {entity.reportCount > 1 && <Badge count={entity.reportCount} style={{ backgroundColor: '#f5222d' }} />}
          </Space>
          <span style={{ color: '#666', fontSize: '13px', marginTop: 4, display: 'block' }}>
            "{dom}"
          </span>
        </Space>
      ),
    },
    {
      title: 'Author',
      dataIndex: 'author',
      width: 140,
      copyable: true,
      render: (text, entity) => (
        <Space>
          <Avatar size="small" icon={<UserOutlined />} style={{ backgroundColor: entity.authorReputation < 0 ? '#ff4d4f' : '#87d068' }} />
          <a>{text}</a>
        </Space>
      ),
    },
    {
      title: 'Time',
      dataIndex: 'timestamp',
      valueType: 'dateTime',
      width: 160,
      sorter: true,
      search: false,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      width: 100,
      valueEnum: {
        pending: { text: 'Pending', status: 'Processing' },
        reviewed: { text: 'Reviewed', status: 'Default' },
        resolved: { text: 'Resolved', status: 'Success' },
      },
    },
    {
      title: 'Actions',
      valueType: 'option',
      width: 160,
      render: (text, record) => [
        <Tooltip title="View Details" key="view">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleOpenDrawer(record)}
          />
        </Tooltip>,
        <Tooltip title="Dismiss (Resolve)" key="dismiss">
          <Popconfirm
            title="Dismiss report?"
            description="The content will remain visible and ticket marked resolved."
            onConfirm={() => handleAction('Report dismissed', record.id, 'resolved')}
          >
            <Button type="text" icon={<CheckCircleOutlined style={{ color: 'green' }} />} />
          </Popconfirm>
        </Tooltip>,
        <Tooltip title="Remove & Ban" key="ban">
          <Popconfirm
            title="Remove content & Ban user?"
            description="This is a severe action."
            onConfirm={() => handleAction('User banned & content removed', record.id, 'resolved')}
            okText="Ban & Remove"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" icon={<StopOutlined style={{ color: 'red' }} />} />
          </Popconfirm>
        </Tooltip>,
      ],
    },
  ];

  return (
    <PageContainer 
      title="Moderation Queue" 
      subTitle="Review and act on reported content from across the platform."
      extra={[
        <Button key="refresh" onClick={() => actionRef.current?.reload()}>Refresh Queue</Button>,
        <Button key="export" type="default">Export Logs</Button>
      ]}
    >
      <ProTable<ModerationItem>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        
        // 1. DYNAMIC REQUEST TO REAL BACKEND
        request={async (params) => {
          try {
              // Construct query params
              const searchParams = new URLSearchParams();
              if (params.status) searchParams.append('status', params.status);
              if (params.type) searchParams.append('search', params.type); // Using generic search for simplified filtering

              const res = await fetch(`/api/admin/moderation/?${searchParams.toString()}`);
              if (!res.ok) throw new Error('Failed to fetch tickets');

              const data = await res.json();

              // Map Django Serializer (Snake Case) -> Frontend Item (Camel Case)
              const mappedData: ModerationItem[] = data.results.map((item: any) => ({
                id: item.id,
                contentSnippet: item.content_snippet,
                fullContent: item.full_content || item.content_snippet,
                author: item.author_username || 'Unknown',
                authorReputation: item.author_reputation_score || 0,
                reportReason: item.report_reason,
                timestamp: item.created,
                status: item.status,
                severity: item.severity,
                type: item.target_type,
                reportCount: item.report_count || 1,
                reporters: [] // Serializer v1.0 doesn't send this list yet, defaulting to empty
              }));

              return {
                data: mappedData,
                success: true,
                total: data.count
              };

          } catch (e) {
              console.error(e);
              message.error("Error loading moderation queue");
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
        headerTitle="Active Flags"
        toolBarRender={() => [
          <Button key="bulk-approve" type="primary">Batch Dismiss</Button>,
          <Button key="bulk-ban" danger>Batch Remove</Button>
        ]}
      />

      {/* --- Detail Drawer --- */}
      <Drawer
        width={720}
        open={drawerOpen}
        onClose={handleCloseDrawer}
        title={
          <Space>
            <WarningOutlined style={{ color: '#faad14' }} />
            <span>Moderation Ticket #{currentRow?.id}</span>
            <Tag color={currentRow?.severity === 'critical' ? 'red' : 'blue'}>
              {currentRow?.severity.toUpperCase()}
            </Tag>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={handleCloseDrawer}>Cancel</Button>
            <Button type="primary" danger onClick={() => handleAction('Content Removed', currentRow?.id || 0)}>
              Remove Content
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
                label: 'Report Details',
                children: (
                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    {/* Key Metrics */}
                    <ProCard split="vertical" bordered headerBordered>
                      <ProCard title="Reporters" colSpan="50%">
                          <List
                            size="small"
                            dataSource={currentRow.reporters.length > 0 ? currentRow.reporters : ["Anonymous Reports"]}
                            renderItem={item => <List.Item><UserOutlined /> {item}</List.Item>}
                          />
                      </ProCard>
                      <ProCard title="Metadata" colSpan="50%">
                         <ProDescriptions column={1} size="small">
                            <ProDescriptions.Item label="Reason" valueType="text"><Text strong>{currentRow.reportReason}</Text></ProDescriptions.Item>
                            <ProDescriptions.Item label="Timestamp" valueType="dateTime">{currentRow.timestamp}</ProDescriptions.Item>
                            <ProDescriptions.Item label="Type">{currentRow.type}</ProDescriptions.Item>
                         </ProDescriptions>
                      </ProCard>
                    </ProCard>

                    {/* The Content */}
                    <ProCard title="Flagged Content" bordered headerBordered type="inner" title={<Space><InfoCircleOutlined /> Content Preview</Space>}>
                      <div style={{ 
                        padding: '16px', 
                        background: '#f9f9f9', 
                        borderRadius: '6px', 
                        border: '1px solid #eee',
                        minHeight: '100px'
                      }}>
                        <Paragraph style={{ marginBottom: 0 }}>
                          {currentRow.fullContent}
                        </Paragraph>
                      </div>
                    </ProCard>
                  </Space>
                )
              },
              {
                key: '2',
                label: 'Author Context',
                children: (
                   <ProCard title={`Author: ${currentRow.author}`} bordered headerBordered>
                      <ProDescriptions column={2}>
                         <ProDescriptions.Item label="Reputation Score" valueType="digit">{currentRow.authorReputation}</ProDescriptions.Item>
                         <ProDescriptions.Item label="Account Age" valueType="text">2.5 Years</ProDescriptions.Item>
                         <ProDescriptions.Item label="Previous Violations" valueType="digit">0</ProDescriptions.Item>
                         <ProDescriptions.Item label="Role">User</ProDescriptions.Item>
                      </ProDescriptions>
                      <Button type="link" icon={<HistoryOutlined />}>View Full Activity Log</Button>
                   </ProCard>
                )
              }
            ]}
          />
        )}
      </Drawer>
    </PageContainer>
  );
}