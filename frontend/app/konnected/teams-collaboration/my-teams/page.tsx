// FILE: frontend/app/konnected/teams-collaboration/my-teams/page.tsx
﻿// app/konnected/teams-collaboration/my-teams/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  CalendarOutlined,
  DownOutlined,
  PlusOutlined,
  ProjectOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import {
  Alert,
  App,
  Avatar,
  Button,
  Col,
  Dropdown,
  Empty,
  Input,
  List,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
} from 'antd';
import type { MenuProps, TableProps } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import { apiFetch } from '@/api';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';

const { Text, Paragraph } = Typography;
const { Search } = Input;
const { Option } = Select;

type TeamRole = 'owner' | 'admin' | 'member' | 'observer';
type MembershipStatus = 'active' | 'invited' | 'request_pending';

interface TeamMember {
  id: string;
  name: string;
  role: string;
}

// Aligned with backend MyTeams API contract (v14 spec)
interface MyTeamsApiTeam {
  id: string;
  name: string;
  project_title?: string | null;
  membership_role: TeamRole;
  membership_status?: MembershipStatus;
  members_count?: number;
  is_restricted?: boolean;
  recent_activity?: string[];
  members_preview?: TeamMember[];
}

interface TeamRow {
  key: string;
  teamId: string;
  teamName: string;
  projectName: string;
  userRole: TeamRole;
  membershipStatus: MembershipStatus;
  membersCount: number;
  isRestricted: boolean;
  roster: TeamMember[];
  recentActivity: string[];
}

// Backend endpoints as per v14 spec
const MY_TEAMS_ENDPOINT = '/api/keenkonnect/teams/my-teams/';
const LEAVE_TEAM_ENDPOINT = (teamId: string) =>
  `/api/keenkonnect/teams/${encodeURIComponent(teamId)}/leave/`;

/**
 * Normalizes API payload (array or { items }) into table rows.
 */
function mapToRows(payload: unknown): TeamRow[] {
  const rawItems: MyTeamsApiTeam[] = Array.isArray(payload)
    ? (payload as MyTeamsApiTeam[])
    : (payload as { items?: MyTeamsApiTeam[] })?.items ?? [];

  return rawItems.map((t) => {
    const roster = t.members_preview ?? ([] as TeamMember[]);

    return {
      key: t.id,
      teamId: t.id,
      teamName: t.name,
      projectName: t.project_title ?? '—',
      userRole: t.membership_role,
      membershipStatus: t.membership_status ?? 'active',
      membersCount: t.members_count ?? roster.length,
      isRestricted: Boolean(t.is_restricted),
      roster,
      recentActivity: t.recent_activity ?? [],
    };
  });
}

export default function MyTeamsPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const router = useRouter();
  const { message } = App.useApp();

  const [loading, setLoading] = useState<boolean>(true);
  const [reloadFlag, setReloadFlag] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const [selectedTeamKeys, setSelectedTeamKeys] = useState<React.Key[]>([]);
  const [data, setData] = useState<TeamRow[]>([]);

  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | TeamRole>('all');
  const [statusFilter, setStatusFilter] =
    useState<'all' | MembershipStatus>('all');
  const [restrictedOnly, setRestrictedOnly] = useState(false);

  const [leavingTeamId, setLeavingTeamId] = useState<string | null>(null);

  // --- Load teams from backend ------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      setLoading(true);
      setError(null);

      try {
        const res = await apiFetch(MY_TEAMS_ENDPOINT, {
          credentials: 'include',
          cache: 'no-store',
        });

        // Treat a 404 as "endpoint not wired yet / no teams" and degrade gracefully
        if (res.status === 404) {
          if (!cancelled) {
            setData([]);
          }
          return;
        }

        if (!res.ok) {
          throw new Error(`HTTP ${res.status} ${res.statusText}`);
        }

        const json = await res.json();
        if (!cancelled) {
          const rows = mapToRows(json);
          setData(rows);
        }
      } catch (err) {
        if (!cancelled) {
           
          console.error('Failed to load teams', err);
          setError(i18nT("ui.konnected.teamsCollaboration.myTeams.unableToLoadYourTeamsRightNow"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadTeams();

    return () => {
      cancelled = true;
    };
  }, [reloadFlag, i18nT]);

  // --- Actions ----------------------------------------------------------------

  const handleLeaveTeam = async (team: TeamRow) => {
    if (team.userRole === 'owner') {
      message.warning(
        i18nT("ui.konnected.teamsCollaboration.myTeams.youAreTheOwnerOfThisTeam"),
      );
      return;
    }

    setLeavingTeamId(team.teamId);
    try {
      const res = await apiFetch(LEAVE_TEAM_ENDPOINT(team.teamId), {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      message.success(i18nT("ui.konnected.teamsCollaboration.myTeams.youLeft", { teamName: team.teamName }));
      setData((prev) => prev.filter((row) => row.teamId !== team.teamId));
      setSelectedTeamKeys((prev) => prev.filter((key) => key !== team.key));
    } catch (err) {
       
      console.error('Failed to leave team', err);
      message.error(i18nT("ui.konnected.teamsCollaboration.myTeams.couldNotLeaveTheTeamPleaseTry"));
    } finally {
      setLeavingTeamId(null);
    }
  };

  const handleViewTeam = (team: TeamRow) => {
    router.push(
      `/konnected/teams-collaboration/my-teams/${encodeURIComponent(
        team.teamId,
      )}`,
    );
  };

  const handleInviteMembers = (team: TeamRow) => {
    router.push(
      `/konnected/teams-collaboration/team-builder?teamId=${encodeURIComponent(
        team.teamId,
      )}&mode=invite`,
    );
  };

  // --- Filters & derived data -------------------------------------------------

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      if (searchText) {
        const q = searchText.toLowerCase();
        const matchesName =
          row.teamName.toLowerCase().includes(q) ||
          row.projectName.toLowerCase().includes(q);
        if (!matchesName) return false;
      }

      if (roleFilter !== 'all' && row.userRole !== roleFilter) {
        return false;
      }

      if (statusFilter !== 'all' && row.membershipStatus !== statusFilter) {
        return false;
      }

      if (restrictedOnly && !row.isRestricted) {
        return false;
      }

      return true;
    });
  }, [data, searchText, roleFilter, statusFilter, restrictedOnly]);

  const sortedData = useMemo(
    () => [...filteredData].sort((a, b) => a.teamName.localeCompare(b.teamName)),
    [filteredData],
  );

  const totalTeams = data.length;
  const ownerAdminCount = data.filter(
    (t) => t.userRole === 'owner' || t.userRole === 'admin',
  ).length;
  const restrictedCount = data.filter((t) => t.isRestricted).length;

  const rowSelection: TableProps<TeamRow>['rowSelection'] = {
    selectedRowKeys: selectedTeamKeys,
    onChange: (keys) => setSelectedTeamKeys(keys as React.Key[]),
  };

  const columns: ColumnsType<TeamRow> = [
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.team"),
      dataIndex: 'teamName',
      key: 'teamName',
      render: (value: string, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{value}</Text>
          <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.id")} {record.teamId}</Text>
        </Space>
      ),
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.project"),
      dataIndex: 'projectName',
      key: 'projectName',
      ellipsis: true,
      render: (value: string) => <Text>{value}</Text>,
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.myRole"),
      dataIndex: 'userRole',
      key: 'userRole',
      width: 140,
      render: (role: TeamRole) => {
        let color: string | undefined;
        switch (role) {
          case 'owner':
            color = 'gold';
            break;
          case 'admin':
            color = 'blue';
            break;
          case 'member':
            color = 'green';
            break;
          case 'observer':
            color = 'default';
            break;
          default:
            color = 'default';
        }
        return <Tag color={color}>{role}</Tag>;
      },
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.members"),
      dataIndex: 'roster',
      key: 'roster',
      width: 260,
      render: (_: TeamMember[], record) => {
        const preview = record.roster.slice(0, 3);
        return preview.length ? (
          <List
            dataSource={preview}
            renderItem={(m: TeamMember) => (
              <List.Item style={{ paddingInline: 0 }} key={m.id}>
                <List.Item.Meta
                  avatar={<Avatar>{m.name.charAt(0)}</Avatar>}
                  title={<Text>{m.name}</Text>}
                  description={<Text type="secondary">{m.role}</Text>}
                />
              </List.Item>
            )}
          />
        ) : (
          <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.membersNotLoaded")}</Text>
        );
      },
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.recentActivity"),
      dataIndex: 'recentActivity',
      key: 'recentActivity',
      width: 260,
      render: (activities: string[]) =>
        activities.length ? (
          <List
            size="small"
            dataSource={activities.slice(0, 3)}
            renderItem={(msg) => (
              <List.Item style={{ paddingInline: 0 }}>{msg}</List.Item>
            )}
          />
        ) : (
          <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.noRecentActivity")}</Text>
        ),
      responsive: ['lg'],
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.status"),
      dataIndex: 'membershipStatus',
      key: 'membershipStatus',
      width: 140,
      render: (status: MembershipStatus) => {
        switch (status) {
          case 'active':
            return <Tag color="green">{i18nT("ui.konnected.teamsCollaboration.myTeams.active")}</Tag>;
          case 'invited':
            return <Tag color="blue">{i18nT("ui.konnected.teamsCollaboration.myTeams.invitation")}</Tag>;
          case 'request_pending':
            return <Tag color="orange">{i18nT("ui.konnected.teamsCollaboration.myTeams.requestPending")}</Tag>;
          default:
            return <Tag>{i18nT("ui.konnected.teamsCollaboration.myTeams.unknown")}</Tag>;
        }
      },
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.access"),
      dataIndex: 'isRestricted',
      key: 'isRestricted',
      width: 120,
      render: (isRestricted: boolean) =>
        isRestricted ? (
          <Tag color="volcano">{i18nT("ui.konnected.teamsCollaboration.myTeams.restricted")}</Tag>
        ) : (
          <Tag color="default">{i18nT("ui.konnected.teamsCollaboration.myTeams.open")}</Tag>
        ),
      responsive: ['md'],
    },
    {
      title: i18nT("ui.konnected.teamsCollaboration.myTeams.actions"),
      key: 'actions',
      fixed: 'right',
      width: 160,
      render: (_: unknown, record) => {
        const items: MenuProps['items'] = [
          { key: 'view', label: i18nT("ui.konnected.teamsCollaboration.myTeams.openTeam") },
          { key: 'invite', label: i18nT("ui.konnected.teamsCollaboration.myTeams.inviteMembers") },
          { type: 'divider' },
          {
            key: 'leave',
            danger: true,
            label: i18nT("ui.konnected.teamsCollaboration.myTeams.leaveTeam"),
          },
        ];

        const onMenuClick: MenuProps['onClick'] = ({ key }) => {
          switch (key) {
            case 'view':
              handleViewTeam(record);
              break;
            case 'invite':
              handleInviteMembers(record);
              break;
            case 'leave':
              void handleLeaveTeam(record);
              break;
            default:
              break;
          }
        };

        const isLeaving = leavingTeamId === record.teamId;

        return (
          <Dropdown
            menu={{ items, onClick: onMenuClick }}
            trigger={['click']}
            disabled={isLeaving}
          >
            <Button loading={isLeaving}>
              {i18nT("ui.konnected.teamsCollaboration.myTeams.actions")} <DownOutlined />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  const headerSecondaryActions = (
    <Space>
      <Button
        icon={<ProjectOutlined />}
        onClick={() =>
          router.push('/konnected/teams-collaboration/project-workspaces')
        }
      >
        {i18nT("ui.konnected.teamsCollaboration.myTeams.projectWorkspaces")}
      </Button>
      <Button
        icon={<CalendarOutlined />}
        onClick={() =>
          router.push('/konnected/teams-collaboration/activity-planner')
        }
      >
        {i18nT("ui.konnected.teamsCollaboration.myTeams.activityPlanner")}
      </Button>
    </Space>
  );

  const headerPrimaryAction = (
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={() =>
        router.push('/konnected/teams-collaboration/team-builder')
      }
    >
      {i18nT("ui.konnected.teamsCollaboration.myTeams.createOrJoinATeam")}
    </Button>
  );

  const hasRows = sortedData.length > 0;

  return (
    <KonnectedPageShell
      title={i18nT("ui.konnected.teamsCollaboration.myTeams.myTeams")}
      subtitle={
        <span>
          {i18nT("ui.konnected.teamsCollaboration.myTeams.manageTheCollaborationTeamsYouArePart")}
        </span>
      }
      primaryAction={headerPrimaryAction}
      secondaryActions={headerSecondaryActions}
    >
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Space direction="vertical" size={0}>
            <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.totalTeams")}</Text>
            <Text strong>
              <TeamOutlined style={{ marginRight: 4 }} />
              {totalTeams}
            </Text>
          </Space>
        </Col>
        <Col xs={24} sm={8}>
          <Space direction="vertical" size={0}>
            <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.teamsYouOwnAdmin")}</Text>
            <Text strong>{ownerAdminCount}</Text>
          </Space>
        </Col>
        <Col xs={24} sm={8}>
          <Space direction="vertical" size={0}>
            <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.restrictedTeams")}</Text>
            <Text strong>{restrictedCount}</Text>
          </Space>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={10}>
          <Search
            placeholder={i18nT("ui.konnected.teamsCollaboration.myTeams.searchByTeamOrProjectName")}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={(value) => setSearchText(value)}
          />
        </Col>
        <Col xs={12} md={6}>
          <Select<'all' | TeamRole>
            style={{ width: '100%' }}
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
          >
            <Option value="all">{i18nT("ui.konnected.teamsCollaboration.myTeams.allRoles")}</Option>
            <Option value="owner">{i18nT("ui.konnected.teamsCollaboration.myTeams.owner")}</Option>
            <Option value="admin">{i18nT("ui.konnected.teamsCollaboration.myTeams.admin")}</Option>
            <Option value="member">{i18nT("ui.konnected.teamsCollaboration.myTeams.member")}</Option>
            <Option value="observer">{i18nT("ui.konnected.teamsCollaboration.myTeams.observer")}</Option>
          </Select>
        </Col>
        <Col xs={12} md={6}>
          <Select<'all' | MembershipStatus>
            style={{ width: '100%' }}
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
          >
            <Option value="all">{i18nT("ui.konnected.teamsCollaboration.myTeams.allMembershipStates")}</Option>
            <Option value="active">{i18nT("ui.konnected.teamsCollaboration.myTeams.active")}</Option>
            <Option value="invited">{i18nT("ui.konnected.teamsCollaboration.myTeams.invitations")}</Option>
            <Option value="request_pending">{i18nT("ui.konnected.teamsCollaboration.myTeams.requestsPending")}</Option>
          </Select>
        </Col>
        <Col xs={24} md={2}>
          <Space>
            <Switch
              checked={restrictedOnly}
              onChange={(checked) => setRestrictedOnly(checked)}
            />
            <Text type="secondary">{i18nT("ui.konnected.teamsCollaboration.myTeams.restrictedOnly")}</Text>
          </Space>
        </Col>
      </Row>

      {error && (
        <Alert
          type="error"
          message={i18nT("ui.konnected.teamsCollaboration.myTeams.unableToLoadYourTeams")}
          description={
            <>
              <Paragraph style={{ marginBottom: 8 }}>{error}</Paragraph>
              <Button size="small" onClick={() => setReloadFlag((n) => n + 1)}>
                {i18nT("ui.konnected.teamsCollaboration.myTeams.retry")}
              </Button>
            </>
          }
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      {!loading && !error && !hasRows ? (
        <Empty
          description={i18nT("ui.konnected.teamsCollaboration.myTeams.youAreNotPartOfAnyTeam")}
          style={{ padding: '40px 0' }}
        >
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() =>
                router.push('/konnected/teams-collaboration/team-builder')
              }
            >
              {i18nT("ui.konnected.teamsCollaboration.myTeams.createOrJoinATeam")}
            </Button>
            <Button
              icon={<ProjectOutlined />}
              onClick={() =>
                router.push('/konnected/teams-collaboration/project-workspaces')
              }
            >
              {i18nT("ui.konnected.teamsCollaboration.myTeams.browseProjectWorkspaces")}
            </Button>
          </Space>
        </Empty>
      ) : (
        <Table<TeamRow>
          rowKey="key"
          size="middle"
          bordered
          loading={loading}
          columns={columns}
          dataSource={sortedData}
          rowSelection={rowSelection}
          pagination={{ pageSize: 8, showSizeChanger: false }}
          scroll={{ x: 1000 }}
        />
      )}
    </KonnectedPageShell>
  );
}
