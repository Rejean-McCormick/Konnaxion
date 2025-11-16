'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Row,
  Col,
  Select,
  Divider,
  Typography,
  Tag,
  Dropdown,
  Popconfirm,
  message,
  Button,
} from 'antd';
import type { MenuProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { ProTable, type ProColumns } from '@ant-design/pro-components';

const { Title, Text } = Typography;

interface Workspace {
  id: string;
  name: string;
  project: string;
  status: 'active' | 'inactive';
  description: string;
  environment: string; // e.g. "Python environment", "Design whiteboard"
}

const sampleWorkspaces: Workspace[] = [
  {
    id: '1',
    name: 'Workspace Alpha',
    project: 'Project Alpha',
    status: 'active',
    description: 'Interactive Python coding environment for data analysis.',
    environment: 'Python environment',
  },
  {
    id: '2',
    name: 'Workspace Beta',
    project: 'Project Beta',
    status: 'inactive',
    description: 'Digital whiteboard for design brainstorming.',
    environment: 'Design whiteboard',
  },
  {
    id: '3',
    name: 'Workspace Gamma',
    project: 'Project Alpha',
    status: 'active',
    description: 'Collaborative space for real-time coding and testing.',
    environment: 'Development environment',
  },
  {
    id: '4',
    name: 'Workspace Delta',
    project: 'Project Delta',
    status: 'inactive',
    description: 'Project planning and management space.',
    environment: 'Planning Board',
  },
];

export default function MyWorkspaces() {
  const router = useRouter();

  // Filter by project
  const [selectedProject, setSelectedProject] = useState<string>('All');
  // Local list so we can "remove" a workspace from the view (Popconfirm action)
  const [visibleWorkspaces, setVisibleWorkspaces] =
    useState<Workspace[]>(sampleWorkspaces);

  const filteredWorkspaces = useMemo(() => {
    const base = visibleWorkspaces;
    if (selectedProject === 'All') return base;
    return base.filter((ws) => ws.project === selectedProject);
  }, [selectedProject, visibleWorkspaces]);

  const activeCount = useMemo(
    () => visibleWorkspaces.filter((ws) => ws.status === 'active').length,
    [visibleWorkspaces],
  );

  const projectOptions = useMemo(() => {
    const projects = Array.from(
      new Set(visibleWorkspaces.map((ws) => ws.project)),
    );
    return ['All', ...projects];
  }, [visibleWorkspaces]);

  const handleWorkspacePrimaryAction = (ws: Workspace) => {
    router.push(`/keenkonnect/workspaces/launch-new-workspace?id=${ws.id}`);
  };

  const handleManageSettings = (ws: Workspace) => {
    // corrigé : "launch-new-workspace" (sans "s")
    router.push(
      `/keenkonnect/workspaces/launch-new-workspace?id=${ws.id}&manage=1`,
    );
  };

  const handleRemoveFromMyWorkspaces = (ws: Workspace) => {
    setVisibleWorkspaces((prev) => prev.filter((item) => item.id !== ws.id));
    message.success(`Workspace "${ws.name}" removed from your list.`);
  };

  const columns: ProColumns<Workspace>[] = [
    {
      title: 'Workspace',
      dataIndex: 'name',
      key: 'name',
      render: (_dom, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.name}</div>
          <Text type="secondary">{record.description}</Text>
        </div>
      ),
    },
    {
      title: 'Project',
      dataIndex: 'project',
      key: 'project',
    },
    {
      title: 'Environment',
      dataIndex: 'environment',
      key: 'environment',
      // IMPORTANT : on respecte la signature (dom, entity, index, action, schema)
      render: (_dom, record) => <Tag>{record.environment}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (_dom, record) =>
        record.status === 'active' ? (
          <Tag color="green">Active</Tag>
        ) : (
          <Tag color="default">Inactive</Tag>
        ),
    },
    {
      title: 'Actions',
      key: 'actions',
      valueType: 'option',
      render: (_dom, record) => {
        const isActive = record.status === 'active';
        const primaryLabel = isActive ? 'Join Now' : 'Launch';

        const menuItems: MenuProps['items'] = [
          {
            key: 'manage',
            label: 'Manage Settings',
          },
          {
            key: 'remove',
            label: (
              <Popconfirm
                title="Remove from My Workspaces?"
                description="This will remove the workspace from your list (the workspace itself is not deleted)."
                okText="Yes, remove"
                cancelText="Cancel"
                onConfirm={() => handleRemoveFromMyWorkspaces(record)}
              >
                <span>Remove from list</span>
              </Popconfirm>
            ),
          },
        ];

        const onMenuClick: MenuProps['onClick'] = ({ key }) => {
          if (key === 'manage') {
            handleManageSettings(record);
          }
        };

        return (
          <Dropdown.Button
            type="primary"
            size="small"
            menu={{ items: menuItems, onClick: onMenuClick }}
            onClick={() => handleWorkspacePrimaryAction(record)}
            icon={<DownOutlined />}
          >
            {primaryLabel}
          </Dropdown.Button>
        );
      },
    },
  ];

  return (
    <div className="container mx-auto p-5">
      <Title level={2}>My Workspaces</Title>
      <Divider />

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12}>
          <Text strong>Total Active Workspaces: {activeCount}</Text>
        </Col>
        <Col
          xs={24}
          sm={12}
          style={{ textAlign: 'right', marginTop: 8, marginBottom: 8 }}
        >
          <Button
            type="default"
            style={{ marginRight: 8 }}
            onClick={() =>
              router.push('/keenkonnect/workspaces/browse-available-workspaces')
            }
          >
            Browse Available Workspaces
          </Button>
          <Button
            type="primary"
            onClick={() =>
              router.push('/keenkonnect/workspaces/launch-new-workspace')
            }
          >
            Launch New Workspace
          </Button>
        </Col>
      </Row>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12}>
          <Text>Filter by Project:</Text>
          <Select
            value={selectedProject}
            onChange={(value) => setSelectedProject(value)}
            style={{ width: '100%', marginTop: 4 }}
            options={projectOptions.map((p) => ({ label: p, value: p }))}
          />
        </Col>
      </Row>

      <Divider />

      <ProTable<Workspace>
        rowKey="id"
        columns={columns}
        dataSource={filteredWorkspaces}
        search={false}
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
        }}
        options={false}
      />
    </div>
  );
}
