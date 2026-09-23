// FILE: frontend/app/keenkonnect/workspaces/browse-available-workspaces/page.tsx
'use client';

import type { TranslateFunction } from '@/i18n/runtime';
import { useLanguage } from '@/context/LanguageContext';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Input,
  List,
  Pagination,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Typography,
} from 'antd';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import KeenPageShell from '@/app/keenkonnect/KeenPageShell';

const { Search } = Input;
const { Text } = Typography;

type WorkspaceCategory = 'focus' | 'collaboration' | 'creative' | 'innovation';

interface Workspace {
  id: string;
  name: string;
  owner: string;
  purpose: string;
  tools: string[];
  category: WorkspaceCategory;
  currentUsers: number;
  lastActive: string;
  isJoinable: boolean;
  participants: string[];
}

const PREVIEW_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'Data Science Hub',
    owner: 'Alice',
    purpose: 'Collaborative workspace for data analysis and machine learning projects.',
    tools: ['Data Science Notebook', 'Python'],
    category: 'focus',
    currentUsers: 10,
    lastActive: '2023-09-06 10:00',
    isJoinable: true,
    participants: ['Alice', 'Noah', 'Luc'],
  },
  {
    id: '2',
    name: 'VR Collaboration Space',
    owner: 'Bob',
    purpose: 'Virtual reality space for immersive teamwork.',
    tools: ['VR', '3D Modeling'],
    category: 'collaboration',
    currentUsers: 5,
    lastActive: '2023-09-06 09:30',
    isJoinable: false,
    participants: ['Bob', 'Ravi'],
  },
  {
    id: '3',
    name: 'Programming Lab',
    owner: 'Charlie',
    purpose: 'Workspace for coding projects and software development.',
    tools: ['Programming', 'Collaboration Tools'],
    category: 'focus',
    currentUsers: 8,
    lastActive: '2023-09-06 11:15',
    isJoinable: true,
    participants: ['Charlie', 'Mia', 'Jon'],
  },
  {
    id: '4',
    name: 'Design Studio',
    owner: 'Diana',
    purpose: 'Creative space for design brainstorming and UI/UX work.',
    tools: ['Design Tools', 'Whiteboard'],
    category: 'creative',
    currentUsers: 3,
    lastActive: '2023-09-06 08:45',
    isJoinable: true,
    participants: ['Diana', 'Lea'],
  },
  {
    id: '5',
    name: 'Innovators Room',
    owner: 'Edward',
    purpose: 'Workspace for innovative projects and ideation.',
    tools: ['Brainstorming', 'Prototyping'],
    category: 'innovation',
    currentUsers: 12,
    lastActive: '2023-09-06 10:30',
    isJoinable: false,
    participants: ['Edward', 'Sara', 'Tom', 'Yasmin'],
  },
];

const workspaceTabs = (i18nT: TranslateFunction) => ([
  { key: 'all', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.allWorkspaces") },
  { key: 'focus', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.focusPods") },
  { key: 'collaboration', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.collaborationSpaces") },
  { key: 'creative', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.creativeStudios") },
  { key: 'innovation', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.innovationLabs") },
]);

export default function BrowseAvailableWorkspaces(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter();

  const [searchText, setSearchText] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;

  const filteredWorkspaces = useMemo<Workspace[]>(() => {
    const lowerSearch = searchText.toLowerCase();

    return PREVIEW_WORKSPACES.filter((workspace) => {
      const matchesTab =
        activeTab === 'all' ||
        workspace.category === (activeTab as WorkspaceCategory);

      const matchesSearch =
        !lowerSearch ||
        workspace.name.toLowerCase().includes(lowerSearch) ||
        workspace.purpose.toLowerCase().includes(lowerSearch);

      const matchesTool =
        selectedTool === 'All' || workspace.tools.includes(selectedTool);

      return matchesTab && matchesSearch && matchesTool;
    });
  }, [searchText, selectedTool, activeTab]);

  const paginatedWorkspaces = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredWorkspaces.slice(startIndex, startIndex + pageSize);
  }, [filteredWorkspaces, currentPage, pageSize]);

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    setCurrentPage(1);
  };

  return (
    <KeenPageShell
      title={i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.browseAvailableWorkspaces")}
      description={i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.discoverActiveCollaborationSpacesYouCanJoin")}
      toolbar={
        <Button
          type="primary"
          onClick={() =>
            router.push('/keenkonnect/workspaces/launch-new-workspace')
          }
        >
          {i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.launchNewWorkspace")}
        </Button>
      }
    >
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.workspaceDiscoveryPreview")}
        description={i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.keenkonnectDoesNotExposeAWorkspacePersistence")}
        style={{ marginBottom: 16 }}
      />
      {/* Search & filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12}>
          <Search
            placeholder={i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.searchWorkspaces")}
            allowClear
            onSearch={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            value={selectedTool}
            style={{ width: '100%' }}
            onChange={(value: string) => {
              setSelectedTool(value);
              setCurrentPage(1);
            }}
            options={[
              { value: 'All', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.allTools") },
              { value: 'Data Science Notebook', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.dataScienceNotebook") },
              { value: 'VR', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.vr") },
              { value: 'Programming', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.programming") },
              { value: 'Design Tools', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.designTools") },
              { value: '3D Modeling', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.text3dModeling") },
              { value: 'Whiteboard', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.whiteboard") },
              { value: 'Brainstorming', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.brainstorming") },
              { value: 'Prototyping', label: i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.prototyping") },
            ]}
          />
        </Col>
      </Row>

      {/* Category tabs */}
      <Tabs
        items={workspaceTabs(i18nT)}
        activeKey={activeTab}
        onChange={handleTabChange}
        style={{ marginBottom: 16 }}
      />

      <Divider />

      {/* Workspaces list */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3 }}
        dataSource={paginatedWorkspaces}
        renderItem={(workspace: Workspace) => (
          <List.Item key={workspace.id}>
            <Card
              hoverable
              title={workspace.name}
              extra={
                <Space size="small">
                  <Text type="secondary">{i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.host")} {workspace.owner}</Text>
                  <Badge
                    status={workspace.isJoinable ? 'success' : 'warning'}
                    text={workspace.isJoinable ? i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.joinable") : i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.requestOnly")}
                  />
                </Space>
              }
              actions={[
                <Button
                  key="join"
                  type="primary"
                  disabled
                  title={i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.workspaceMembershipIsUnavailableUntilABackend")}
                >
                  {workspace.isJoinable ? i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.join") : i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.requestAccess")}
                </Button>,
              ]}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text>{workspace.purpose}</Text>

                <Space wrap>
                  <Tag color="blue">{workspace.category.toUpperCase()}</Tag>
                  {workspace.tools.map((tool) => (
                    <Tag key={tool}>{tool}</Tag>
                  ))}
                </Space>

                <Divider style={{ margin: '12px 0' }} />

                <Row justify="space-between" align="middle">
                  <Col>
                    <Space direction="vertical" size={0}>
                      <Text type="secondary">{i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.currentlyOnline")}</Text>
                      <Tag color="geekblue">
                        {workspace.currentUsers} {i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.users")}
                      </Tag>
                    </Space>
                  </Col>
                  <Col>
                    <Space
                      direction="vertical"
                      size={0}
                      style={{ textAlign: 'right' }}
                    >
                      <Text type="secondary">{i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.lastActive")}</Text>
                      <Text>{workspace.lastActive}</Text>
                    </Space>
                  </Col>
                </Row>

                <Divider style={{ margin: '12px 0' }} />

                {/* Avatar.Group showing preview participants */}
                <Space direction="vertical" size={4}>
                  <Text type="secondary">{i18nT("ui.keenkonnect.workspaces.browseAvailableWorkspaces.activeCollaborators")}</Text>
                  <Avatar.Group max={{ count: 3 }}>
                    {workspace.participants.map((name) => (
                      <Avatar key={name}>
                        {name.charAt(0).toUpperCase()}
                      </Avatar>
                    ))}
                  </Avatar.Group>
                </Space>
              </Space>
            </Card>
          </List.Item>
        )}
      />

      <Row justify="center" style={{ marginTop: 24 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredWorkspaces.length}
          onChange={(page) => setCurrentPage(page)}
        />
      </Row>
    </KeenPageShell>
  );
}
