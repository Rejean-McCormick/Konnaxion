// FILE: frontend/app/teambuilder/problems/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  Card,
  Col,
  Dropdown,
  Input,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  AppstoreOutlined,
  DownOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ProListMetas } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
type ProblemStatus = 'Active' | 'Draft' | 'Archived';

interface Problem {
  id: string;
  title: string;
  description: string;
  unescoDomains: string[]; // e.g. ['Education', 'Health']
  unescoCodes: string[]; // e.g. ['13.01', '05.03']
  riskLevel: RiskLevel;
  suitableModes: string[]; // e.g. ['Elite', 'Learning']
  usageCount: number;
  status: ProblemStatus;
  updatedAt: string; // ISO string
}

// -----------------------------------------------------------------------------
// Mock data (replace with API later)
// -----------------------------------------------------------------------------

const MOCK_PROBLEMS: Problem[] = [
  {
    id: 'p1',
    title: 'Community vaccination strategy',
    description:
      'Design and deploy a vaccination programme for a mid-sized city with diverse communities and limited resources.',
    unescoDomains: ['Health', 'Public policy'],
    unescoCodes: ['14.01', '05.03'],
    riskLevel: 'Critical',
    suitableModes: ['Elite', 'Balanced'],
    usageCount: 12,
    status: 'Active',
    updatedAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'p2',
    title: 'Hybrid learning redesign',
    description:
      'Redesign a university course for hybrid delivery, balancing in-person and remote students.',
    unescoDomains: ['Education', 'Digital learning'],
    unescoCodes: ['13.01'],
    riskLevel: 'Medium',
    suitableModes: ['Balanced', 'Learning'],
    usageCount: 8,
    status: 'Active',
    updatedAt: '2025-09-20T15:30:00Z',
  },
  {
    id: 'p3',
    title: 'Inclusive hiring pilot',
    description:
      'Prototype a more inclusive hiring process for a tech team, with focus on bias reduction and candidate experience.',
    unescoDomains: ['Work & employment', 'Ethics'],
    unescoCodes: ['05.10'],
    riskLevel: 'Low',
    suitableModes: ['Learning'],
    usageCount: 5,
    status: 'Draft',
    updatedAt: '2025-08-05T09:15:00Z',
  },
  {
    id: 'p4',
    title: 'Disaster response coordination',
    description:
      'Coordinate multi-agency response for simulated flood scenario across multiple regions.',
    unescoDomains: ['Disaster management', 'Public policy'],
    unescoCodes: ['14.04', '05.03'],
    riskLevel: 'High',
    suitableModes: ['Elite', 'Rehab'],
    usageCount: 3,
    status: 'Active',
    updatedAt: '2025-11-10T12:00:00Z',
  },
  {
    id: 'p5',
    title: 'Sustainable campus initiative',
    description:
      'Develop a roadmap to reduce campus environmental impact over the next five years.',
    unescoDomains: ['Environment', 'Governance'],
    unescoCodes: ['14.07'],
    riskLevel: 'Medium',
    suitableModes: ['Balanced'],
    usageCount: 4,
    status: 'Archived',
    updatedAt: '2025-05-17T11:00:00Z',
  },
  {
    id: 'p6',
    title: 'Cross-cultural virtual teams',
    description:
      'Improve collaboration in distributed, cross-cultural teams working entirely online.',
    unescoDomains: ['Education', 'Work & employment'],
    unescoCodes: ['13.05', '05.10'],
    riskLevel: 'Low',
    suitableModes: ['Learning', 'Average-only'],
    usageCount: 9,
    status: 'Active',
    updatedAt: '2025-10-25T18:45:00Z',
  },
];

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const riskTagColor: Record<RiskLevel, string> = {
  Low: 'green',
  Medium: 'blue',
  High: 'orange',
  Critical: 'red',
};

const statusBadgeStatus: Record<
  ProblemStatus,
  'default' | 'success' | 'processing' | 'error'
> = {
  Active: 'success',
  Draft: 'processing',
  Archived: 'default',
};

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

export default function ProblemsLibraryPage(): JSX.Element {
  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState<string | undefined>(
    undefined,
  );
  const [riskFilter, setRiskFilter] = useState<RiskLevel | undefined>(
    undefined,
  );
  const [modeFilter, setModeFilter] = useState<string | undefined>(undefined);
  const [sortKey, setSortKey] = useState<'updated' | 'usage' | 'title'>(
    'updated',
  );

  // ---------------------------------------------------------------------------
  // Filtering & sorting
  // ---------------------------------------------------------------------------

  const filteredProblems = useMemo(() => {
    let items = [...MOCK_PROBLEMS];

    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      items = items.filter(
        p =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      );
    }

    if (domainFilter) {
      items = items.filter(p =>
        p.unescoDomains.some(d => d === domainFilter),
      );
    }

    if (riskFilter) {
      items = items.filter(p => p.riskLevel === riskFilter);
    }

    if (modeFilter) {
      items = items.filter(p =>
        p.suitableModes.some(m =>
          m.toLowerCase().includes(modeFilter.toLowerCase()),
        ),
      );
    }

    items.sort((a, b) => {
      switch (sortKey) {
        case 'usage':
          return b.usageCount - a.usageCount;
        case 'title':
          return a.title.localeCompare(b.title);
        case 'updated':
        default:
          return (
            new Date(b.updatedAt).getTime() -
            new Date(a.updatedAt).getTime()
          );
      }
    });

    return items;
  }, [searchText, domainFilter, riskFilter, modeFilter, sortKey]);

  // ---------------------------------------------------------------------------
  // Dropdown actions
  // ---------------------------------------------------------------------------

  const handleSortMenuClick: MenuProps['onClick'] = e => {
    if (e.key === 'updated') setSortKey('updated');
    if (e.key === 'usage') setSortKey('usage');
    if (e.key === 'title') setSortKey('title');
  };

  const sortMenuItems: MenuProps['items'] = [
    {
      key: 'updated',
      label: 'Sort by last updated',
    },
    {
      key: 'usage',
      label: 'Sort by usage',
    },
    {
      key: 'title',
      label: 'Sort by title',
    },
  ];

  const bulkMenuItems: MenuProps['items'] = [
    { key: 'export', label: 'Export selected' },
    { key: 'archive', label: 'Archive selected' },
  ];

  const handleBulkMenuClick: MenuProps['onClick'] = e => {
    // Placeholder for bulk actions
    // eslint-disable-next-line no-console
    console.log('Bulk action:', e.key);
  };

  // ---------------------------------------------------------------------------
  // ProList metas
  // ---------------------------------------------------------------------------

  const metas: ProListMetas<Problem> = {
    title: {
      dataIndex: 'title',
      render: (dom: React.ReactNode, item: Problem) => (
        <Space direction="vertical" size={0}>
          <a href={`/teambuilder/problems/${item.id}`}>{dom}</a>
          <Space size="small">
            <Tag color={riskTagColor[item.riskLevel]}>
              {item.riskLevel} risk
            </Tag>
            {item.suitableModes.map(mode => (
              <Tag key={mode} icon={<TagsOutlined />} color="default">
                {mode}
              </Tag>
            ))}
          </Space>
        </Space>
      ),
    },
    description: {
      dataIndex: 'description',
      render: (dom: React.ReactNode) => (
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {dom}
        </Paragraph>
      ),
    },
    subTitle: {
      render: (_: React.ReactNode, item: Problem) => (
        <Space wrap size={4}>
          {item.unescoDomains.map(domain => (
            <Tag key={domain} color="geekblue">
              {domain}
            </Tag>
          ))}
          {item.unescoCodes.map(code => (
            <Tag key={code} color="cyan">
              {code}
            </Tag>
          ))}
        </Space>
      ),
    },
    extra: {
      render: (_: React.ReactNode, item: Problem) => (
        <Space
          direction="vertical"
          size={4}
          style={{ textAlign: 'right' }}
        >
          <Badge
            status={statusBadgeStatus[item.status]}
            text={item.status}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            Used in {item.usageCount} session
            {item.usageCount === 1 ? '' : 's'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Updated {new Date(item.updatedAt).toLocaleDateString()}
          </Text>
        </Space>
      ),
    },
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TeamBuilderPageShell
      title="Problem library"
      subtitle="Define and manage reusable problem scenarios, classified with UNESCO taxonomy, that Team Builder sessions can reference."
      sectionLabel="Problems"
      primaryAction={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              // Placeholder for real reload from API
              // eslint-disable-next-line no-console
              console.log('Reload problems (TODO: hook API)');
            }}
          >
            Reload
          </Button>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            href="/teambuilder/problems/create"
          >
            New problem
          </Button>
        </Space>
      }
      secondaryActions={
        <Button
          href="/teambuilder/problems/taxonomy"
          icon={<AppstoreOutlined />}
        >
          UNESCO taxonomy
        </Button>
      }
      maxWidth={1200}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Intro card */}
        <Card>
          <Space
            direction="vertical"
            size="small"
            style={{ width: '100%' }}
          >
            <Title level={4} style={{ marginBottom: 0 }}>
              Reusable problem templates
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              Problems define the context for teams: goal, constraints,
              UNESCO classification and risk. Sessions link to one problem,
              and the engine uses that information to tune team composition
              and mode (elite vs learning vs rehab).
            </Paragraph>
          </Space>
        </Card>

        {/* Filters and actions */}
        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder="Search problems by title or description"
                allowClear
                onSearch={value => setSearchText(value)}
                onChange={e => setSearchText(e.target.value)}
              />
            </Col>
            <Col xs={24} md={10}>
              <Space wrap>
                <Select
                  allowClear
                  placeholder="Filter by UNESCO domain"
                  style={{ minWidth: 180 }}
                  value={domainFilter}
                  onChange={value => setDomainFilter(value)}
                  options={[
                    { label: 'Education', value: 'Education' },
                    { label: 'Health', value: 'Health' },
                    { label: 'Public policy', value: 'Public policy' },
                    { label: 'Digital learning', value: 'Digital learning' },
                    { label: 'Work & employment', value: 'Work & employment' },
                    {
                      label: 'Disaster management',
                      value: 'Disaster management',
                    },
                    { label: 'Environment', value: 'Environment' },
                    { label: 'Governance', value: 'Governance' },
                  ]}
                />
                <Select<RiskLevel>
                  allowClear
                  placeholder="Risk level"
                  style={{ minWidth: 140 }}
                  value={riskFilter}
                  onChange={value => setRiskFilter(value)}
                  options={[
                    { label: 'Low', value: 'Low' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'High', value: 'High' },
                    { label: 'Critical', value: 'Critical' },
                  ]}
                />
                <Select
                  allowClear
                  placeholder="Mode suitability"
                  style={{ minWidth: 180 }}
                  value={modeFilter}
                  onChange={value => setModeFilter(value)}
                  options={[
                    { label: 'Elite', value: 'Elite' },
                    { label: 'Balanced', value: 'Balanced' },
                    { label: 'Learning', value: 'Learning' },
                    { label: 'Average-only', value: 'Average-only' },
                    { label: 'Rehab', value: 'Rehab' },
                  ]}
                />
              </Space>
            </Col>
            <Col
              xs={24}
              md={6}
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Space>
                <Dropdown
                  menu={{
                    items: sortMenuItems,
                    onClick: handleSortMenuClick,
                  }}
                >
                  <Button>
                    <Space>
                      Sort
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
                <Dropdown
                  menu={{
                    items: bulkMenuItems,
                    onClick: handleBulkMenuClick,
                  }}
                >
                  <Button>
                    <Space>
                      Bulk actions
                      <DownOutlined />
                    </Space>
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* Problems list */}
        <ProList<Problem>
          rowKey="id"
          dataSource={filteredProblems}
          metas={metas}
          pagination={{
            pageSize: 5,
          }}
          rowSelection={{}}
          split
          showActions="hover"
          toolBarRender={false}
        />
      </Space>
    </TeamBuilderPageShell>
  );
}
