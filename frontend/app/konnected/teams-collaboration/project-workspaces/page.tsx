// app/konnected/teams-collaboration/project-workspaces/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Input,
  message as antdMessage,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { MenuProps } from 'antd';
import {
  ArrowRightOutlined,
  DownOutlined,
  ProjectOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { Table } from 'antd';
import KonnectedPageShell from '@/app/konnected/KonnectedPageShell';
import api from '@/api';

const { Text } = Typography;
const { Search } = Input;
const { Option } = Select;

type WorkspaceVisibility = 'open' | 'team-only' | 'restricted';

/**
 * Shape aligned with the KonnectED · Teams Collaboration spec:
 * - bridges a KeenKonnect Project + Collaboration Workspace
 * - scoped by team membership and role
 */
export interface ProjectWorkspaceRow {
  id: string;
  projectId: string;
  teamId: string;

  projectTitle: string;
  teamName: string;

  /** e.g. "Active", "Planning", "Completed", "Archived" */
  status: string;

  /** e.g. "Owner", "Facilitator", "Contributor", "Viewer" */
  userRole: string;

  /** true = workspace already launched in KeenKonnect */
  isWorkspaceLaunched: boolean;

  /** last activity timestamp (ISO) */
  lastActivityAt?: string | null;

  /** membership / presence */
  totalMembers?: number | null;
  onlineMembers?: number | null;

  /** linked KonnectED resources */
  linkedKnowledgeCount?: number | null;
  linkedCertificationsCount?: number | null;

  /** access rules as resolved for current user */
  visibility?: WorkspaceVisibility;
  canEnter?: boolean;
  canManage?: boolean;
  canArchive?: boolean;
}

/**
 * API response is expected to follow the common list pattern:
 * {
 *   items: ProjectWorkspaceRow[];
 *   total: number;
 * }
 */
interface WorkspaceListResponse {
  items: ProjectWorkspaceRow[];
  total: number;
}

type StatusFilterValue = 'all' | 'active' | 'planning' | 'completed' | 'archived';
type OwnershipFilterValue = 'all' | 'owner' | 'member';

function getStatusTagColor(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes('active')) return 'green';
  if (normalized.includes('plan')) return 'blue';
  if (normalized.includes('complete')) return 'geekblue';
  if (normalized.includes('hold')) return 'orange';
  if (normalized.includes('archiv')) return 'default';
  return 'default';
}

function formatLastActivity(iso?: string | null): string {
  if (!iso) return 'N/A';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleString();
}

export default function KonnectedProjectWorkspacesPage(): JSX.Element {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [rows, setRows] = useState<ProjectWorkspaceRow[]>([]);
  const [total, setTotal] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>('all');
  const [ownershipFilter, setOwnershipFilter] =
    useState<OwnershipFilterValue>('all');
  const [teamFilter, setTeamFilter] = useState<string | 'all'>('all');

  // --- Fetch data from backend ------------------------------------------------

  useEffect(() => {
    let isMounted = true;

    async function fetchWorkspaces() {
      try {
        setLoading(true);

        // Endpoint naming aligned to KonnectED Teams Collaboration aggregation:
        // backend should expose /konnected/teams/project-workspaces for the
        // current user, returning { items, total }.
        const response = await api.get<WorkspaceListResponse>(
          '/konnected/teams/project-workspaces',
        );

        if (!isMounted) return;
        setRows(response.items ?? []);
        setTotal(response.total ?? response.items?.length ?? 0);
      } catch (error) {
        if (!isMounted) return;
        // eslint-disable-next-line no-console
        console.error('Failed to load project workspaces', error);
        antdMessage.error(
          'Unable to load project workspaces. Please try again later.',
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchWorkspaces();

    return () => {
      isMounted = false;
    };
  }, []);

  // --- Derived filters & stats ------------------------------------------------

  const teamOptions = useMemo(() => {
    const uniqueTeams = Array.from(
      new Set(rows.map((r) => r.teamName).filter(Boolean)),
    );
    return uniqueTeams.sort();
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // text search on project + team
      if (searchText.trim()) {
        const needle = searchText.toLowerCase();
        const haystack = `${row.projectTitle} ${row.teamName}`.toLowerCase();
        if (!haystack.includes(needle)) {
          return false;
        }
      }

      // status filter – approximate mapping based on label
      if (statusFilter !== 'all') {
        const normalized = row.status.toLowerCase();
        switch (statusFilter) {
          case 'active':
            if (!normalized.includes('active')) return false;
            break;
          case 'planning':
            if (!normalized.includes('plan')) return false;
            break;
          case 'completed':
            if (!normalized.includes('complete')) return false;
            break;
          case 'archived':
            if (!normalized.includes('archiv')) return false;
            break;
          default:
            break;
        }
      }

      // ownership filter – relies on semantic role label
      if (ownershipFilter !== 'all') {
        const role = (row.userRole || '').toLowerCase();
        if (ownershipFilter === 'owner') {
          if (!role.includes('owner') && !role.includes('lead')) return false;
        }
        if (ownershipFilter === 'member') {
          if (role.includes('owner') || role.includes('lead')) return false;
        }
      }

      // team filter
      if (teamFilter !== 'all' && row.teamName !== teamFilter) {
        return false;
      }

      return true;
    });
  }, [rows, searchText, statusFilter, ownershipFilter, teamFilter]);

  const totalActive = useMemo(
    () =>
      rows.filter((r) => r.status.toLowerCase().includes('active')).length,
    [rows],
  );

  const totalOwned = useMemo(
    () =>
      rows.filter((r) => {
        const role = (r.userRole || '').toLowerCase();
        return role.includes('owner') || role.includes('lead');
      }).length,
    [rows],
  );

  const totalLinkedKnowledge = useMemo(
    () =>
      rows.reduce(
        (acc, r) => acc + (r.linkedKnowledgeCount ?? 0),
        0,
      ),
    [rows],
  );

  // --- Navigation helpers -----------------------------------------------------

  const goToWorkspace = (row: ProjectWorkspaceRow) => {
    if (row.canEnter === false) {
      antdMessage.warning(
        'You do not have permission to enter this workspace.',
      );
      return;
    }

    // All “deep work” still occurs inside keenKonnect project workspace.
    // We simply route to the existing workspace surface and let it resolve context.
    router.push(`/keenkonnect/projects/project-workspace?projectId=${row.projectId}`);
  };

  const goToTeam = (row: ProjectWorkspaceRow) => {
    // For now, route back to KonnectED “My Teams” with a pre-selected context
    // once that page is aware of query params. For now, just generally go there.
    router.push('/konnected/teams-collaboration/my-teams');
  };

  const handleArchiveWorkspace = (row: ProjectWorkspaceRow) => {
    if (!row.canArchive) {
      antdMessage.warning('You do not have permission to archive this workspace.');
      return;
    }
    // TODO: plug to API when archive endpoint is wired (e.g. PATCH /projects/{id}/archive/)
    antdMessage.info(
      `Archive action would be sent for workspace "${row.projectTitle}".`,
    );
  };

  // --- Table columns ----------------------------------------------------------

  const columns: ColumnsType<ProjectWorkspaceRow> = [
    {
      title: 'Project Workspace',
      dataIndex: 'projectTitle',
      key: 'projectTitle',
      width: 280,
      render: (value: string, row) => (
        <Space direction="vertical" size={0}>
          <Space>
            <ProjectOutlined />
            <Text strong>{value}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Project ID: {row.projectId}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Team',
      dataIndex: 'teamName',
      key: 'teamName',
      width: 200,
      render: (teamName: string, row) => (
        <Space direction="vertical" size={0}>
          <Space>
            <TeamOutlined />
            <Text>{teamName}</Text>
          </Space>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Team ID: {row.teamId}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <Tag color={getStatusTagColor(status)}>{status}</Tag>
      ),
    },
    {
      title: 'Your role',
      dataIndex: 'userRole',
      key: 'userRole',
      width: 140,
      render: (role: string) => <Tag>{role || 'Member'}</Tag>,
    },
    {
      title: 'Members',
      key: 'members',
      width: 130,
      render: (_: unknown, row) => {
        const total = row.totalMembers ?? 0;
        const online = row.onlineMembers ?? 0;
        return (
          <Tooltip title="Online / total members in this workspace">
            <Text>
              {online}/{total} online
            </Text>
          </Tooltip>
        );
      },
    },
    {
      title: 'Linked learning',
      key: 'linked',
      width: 180,
      render: (_: unknown, row) => (
        <Space direction="vertical" size={2}>
          <Text style={{ fontSize: 12 }}>
            Knowledge items:{' '}
            <Text strong>{row.linkedKnowledgeCount ?? 0}</Text>
          </Text>
          <Text style={{ fontSize: 12 }}>
            Certifications:{' '}
            <Text strong>{row.linkedCertificationsCount ?? 0}</Text>
          </Text>
        </Space>
      ),
    },
    {
      title: 'Last activity',
      dataIndex: 'lastActivityAt',
      key: 'lastActivityAt',
      width: 160,
      render: (value?: string | null) => (
        <Text style={{ fontSize: 12 }}>{formatLastActivity(value)}</Text>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 210,
      render: (_: unknown, row) => {
        const primaryDisabled = row.canEnter === false;
        const primaryLabel =
          row.isWorkspaceLaunched && !primaryDisabled
            ? 'Open workspace'
            : row.isWorkspaceLaunched && primaryDisabled
              ? 'View only'
              : 'Launch workspace';

        const items: MenuProps['items'] = [
          {
            key: 'view-team',
            label: 'View team',
            onClick: () => goToTeam(row),
          },
          {
            key: 'archive',
            disabled: !row.canArchive,
            label: row.canArchive ? (
              <span>Archive workspace</span>
            ) : (
              <span style={{ opacity: 0.65 }}>Archive (no permission)</span>
            ),
            onClick: () => handleArchiveWorkspace(row),
          },
        ];

        return (
          <Space>
            <Button
              type="primary"
              size="small"
              disabled={primaryDisabled}
              icon={<ArrowRightOutlined />}
              onClick={() => goToWorkspace(row)}
            >
              {primaryLabel}
            </Button>

            <Dropdown
              menu={{ items }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button size="small" icon={<DownOutlined />}>
                More
              </Button>
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  // --- Render -----------------------------------------------------------------

  const hasData = filteredRows.length > 0;

  return (
    <KonnectedPageShell
      title="Project Workspaces"
      subtitle={
        <span>
          Bridge your KeenKonnect project workspaces with KonnectED learning
          activities for each team.
        </span>
      }
      primaryAction={
        <Button
          type="primary"
          onClick={() =>
            router.push('/keenkonnect/projects/create-new-project')
          }
        >
          Start a new project
        </Button>
      }
      secondaryActions={
        <Button
          onClick={() =>
            router.push('/konnected/teams-collaboration/my-teams')
          }
        >
          Manage teams
        </Button>
      }
    >
      {/* Top KPIs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Total project workspaces"
              value={total}
              suffix="linked"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Active workspaces"
              value={totalActive}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Workspaces you own"
              value={totalOwned}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={10}>
            <Search
              placeholder="Search by project or team"
              allowClear
              onSearch={(value) => setSearchText(value)}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              Status
            </Text>
            <Select<StatusFilterValue>
              value={statusFilter}
              onChange={(value) => setStatusFilter(value)}
              style={{ width: '100%' }}
            >
              <Option value="all">All statuses</Option>
              <Option value="active">Active</Option>
              <Option value="planning">Planning</Option>
              <Option value="completed">Completed</Option>
              <Option value="archived">Archived</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={4}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              Ownership
            </Text>
            <Select<OwnershipFilterValue>
              value={ownershipFilter}
              onChange={(value) => setOwnershipFilter(value)}
              style={{ width: '100%' }}
            >
              <Option value="all">All memberships</Option>
              <Option value="owner">Owned by me</Option>
              <Option value="member">Where I collaborate</Option>
            </Select>
          </Col>

          <Col xs={24} sm={8} md={6}>
            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
              Team
            </Text>
            <Select<string | 'all'>
              value={teamFilter}
              onChange={(value) => setTeamFilter(value)}
              style={{ width: '100%' }}
              allowClear={false}
            >
              <Option value="all">All teams</Option>
              {teamOptions.map((team) => (
                <Option key={team} value={team}>
                  {team}
                </Option>
              ))}
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center' }}>
            <Spin />
          </div>
        ) : (
          <Table<ProjectWorkspaceRow>
            rowKey={(row) => row.id}
            columns={columns}
            dataSource={filteredRows}
            size="middle"
            bordered
            scroll={{ x: 1000 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: false,
            }}
            locale={{
              emptyText: hasData ? (
                <Empty description="No workspaces match the current filters." />
              ) : (
                <Empty description="No project workspaces linked to your teams yet." />
              ),
            }}
          />
        )}
      </Card>
    </KonnectedPageShell>
  );
}
