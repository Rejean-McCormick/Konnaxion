// FILE: frontend/app/teambuilder/problems/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  AppstoreOutlined,
  DownOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  TagsOutlined,
} from '@ant-design/icons';
import type { ProListMetas } from '@ant-design/pro-components';
import { ProList } from '@ant-design/pro-components';
import {
  Alert,
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
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';
import { teambuilderService } from '@/services/teambuilder';
import type {
  ITeambuilderProblem,
  ProblemRiskLevel,
  ProblemStatus,
} from '@/services/teambuilder/types';

const { Title, Paragraph, Text } = Typography;
const { Search } = Input;

type SortKey = 'updated' | 'usage' | 'title';

const riskTagColor: Record<ProblemRiskLevel, string> = {
  LOW: 'green',
  MEDIUM: 'blue',
  HIGH: 'orange',
  CRITICAL: 'red',
};

const statusBadgeStatus: Record<
  ProblemStatus,
  'default' | 'success' | 'processing' | 'error'
> = {
  ACTIVE: 'success',
  DRAFT: 'processing',
  DEPRECATED: 'error',
};

function displayEnum(value: string): string {
  return value
    .toLowerCase()
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ProblemsLibraryPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [problems, setProblems] = useState<ITeambuilderProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState('');
  const [domainFilter, setDomainFilter] = useState<string | undefined>();
  const [riskFilter, setRiskFilter] = useState<ProblemRiskLevel | undefined>();
  const [modeFilter, setModeFilter] = useState<string | undefined>();
  const [sortKey, setSortKey] = useState<SortKey>('updated');

  const loadProblems = useCallback(async () => {
    setLoading(true);
    setLoadError(null);

    try {
      setProblems(await teambuilderService.getProblems());
    } catch (error) {
      console.error('Failed to load TeamBuilder problems', error);
      setLoadError('Unable to load the problem library.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProblems();
  }, [loadProblems]);

  const domainOptions = useMemo(
    () =>
      Array.from(
        new Set(
          problems.flatMap((problem) => problem.categories ?? []).filter(Boolean),
        ),
      )
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: value, value })),
    [problems],
  );

  const modeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          problems
            .flatMap((problem) => problem.recommended_modes ?? [])
            .filter(Boolean),
        ),
      )
        .sort((a, b) => a.localeCompare(b))
        .map((value) => ({ label: displayEnum(value), value })),
    [problems],
  );

  const filteredProblems = useMemo(() => {
    let items = [...problems];

    if (searchText.trim()) {
      const query = searchText.trim().toLowerCase();
      items = items.filter(
        (problem) =>
          problem.name.toLowerCase().includes(query) ||
          problem.description.toLowerCase().includes(query),
      );
    }

    if (domainFilter) {
      items = items.filter((problem) =>
        (problem.categories ?? []).includes(domainFilter),
      );
    }

    if (riskFilter) {
      items = items.filter((problem) => problem.risk_level === riskFilter);
    }

    if (modeFilter) {
      items = items.filter((problem) =>
        (problem.recommended_modes ?? []).includes(modeFilter),
      );
    }

    items.sort((a, b) => {
      if (sortKey === 'usage') {
        return (b.usage_count ?? 0) - (a.usage_count ?? 0);
      }
      if (sortKey === 'title') {
        return a.name.localeCompare(b.name);
      }
      return (
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );
    });

    return items;
  }, [problems, searchText, domainFilter, riskFilter, modeFilter, sortKey]);

  const sortMenuItems: MenuProps['items'] = [
    { key: 'updated', label: i18nT("ui.teambuilder.problems.sortByLastUpdated") },
    { key: 'usage', label: i18nT("ui.teambuilder.problems.sortByUsage") },
    { key: 'title', label: i18nT("ui.teambuilder.problems.sortByTitle") },
  ];

  const handleSortMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'updated' || key === 'usage' || key === 'title') {
      setSortKey(key);
    }
  };

  const metas: ProListMetas<ITeambuilderProblem> = {
    title: {
      dataIndex: 'name',
      render: (dom, item) => (
        <Space direction="vertical" size={0}>
          <a href={`/teambuilder/problems/${item.id}`}>{dom}</a>
          <Space size="small" wrap>
            <Tag color={riskTagColor[item.risk_level]}>
              {displayEnum(item.risk_level)} {i18nT("ui.teambuilder.problems.risk")}
            </Tag>
            {(item.recommended_modes ?? []).map((mode) => (
              <Tag key={mode} icon={<TagsOutlined />}>
                {displayEnum(mode)}
              </Tag>
            ))}
          </Space>
        </Space>
      ),
    },
    description: {
      dataIndex: 'description',
      render: (dom) => (
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {dom}
        </Paragraph>
      ),
    },
    subTitle: {
      render: (_: unknown, item: ITeambuilderProblem) => (
        <Space wrap size={4}>
          {(item.categories ?? []).map((category) => (
            <Tag key={category} color="geekblue">
              {category}
            </Tag>
          ))}
          {(item.unesco_codes ?? []).map((code) => (
            <Tag key={code} color="cyan">
              {code}
            </Tag>
          ))}
        </Space>
      ),
    },
    extra: {
      render: (_: unknown, item: ITeambuilderProblem) => (
        <Space direction="vertical" size={4} style={{ textAlign: 'right' }}>
          <Badge
            status={statusBadgeStatus[item.status]}
            text={displayEnum(item.status)}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {i18nT("ui.teambuilder.problems.usedIn")} {item.usage_count ?? 0} {i18nT("ui.teambuilder.problems.session")}
            {(item.usage_count ?? 0) === 1 ? '' : 's'}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {i18nT("ui.teambuilder.problems.updated")} {new Date(item.updated_at).toLocaleDateString()}
          </Text>
        </Space>
      ),
    },
  };

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.problems.problemLibrary")}
      subtitle={i18nT("ui.teambuilder.problems.defineAndManageReusableProblemScenariosClassified")}
      sectionLabel={i18nT("ui.teambuilder.problems.problems")}
      primaryAction={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={() => void loadProblems()}
            loading={loading}
          >
            {i18nT("ui.teambuilder.problems.reload")}
          </Button>
          <Button
            type="primary"
            icon={<PlusCircleOutlined />}
            href="/teambuilder/problems/create"
          >
            {i18nT("ui.teambuilder.problems.newProblem")}
          </Button>
        </Space>
      }
      secondaryActions={
        <Button
          href="/teambuilder/problems/taxonomy"
          icon={<AppstoreOutlined />}
        >
          {i18nT("ui.teambuilder.problems.unescoTaxonomy")}
        </Button>
      }
      maxWidth={1200}
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {loadError && (
          <Alert
            type="error"
            showIcon
            message={loadError}
            action={
              <Button size="small" onClick={() => void loadProblems()}>
                {i18nT("ui.teambuilder.problems.retry")}
              </Button>
            }
          />
        )}

        <Card>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <Title level={4} style={{ marginBottom: 0 }}>
              {i18nT("ui.teambuilder.problems.reusableProblemTemplates")}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {i18nT("ui.teambuilder.problems.problemsArePersistedThroughTheTeambuilderApi")}
            </Paragraph>
          </Space>
        </Card>

        <Card>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Search
                placeholder={i18nT("ui.teambuilder.problems.searchProblemsByTitleOrDescription")}
                allowClear
                onSearch={setSearchText}
                onChange={(event) => setSearchText(event.target.value)}
              />
            </Col>
            <Col xs={24} md={10}>
              <Space wrap>
                <Select
                  allowClear
                  placeholder={i18nT("ui.teambuilder.problems.filterByCategory")}
                  style={{ minWidth: 180 }}
                  value={domainFilter}
                  onChange={setDomainFilter}
                  options={domainOptions}
                />
                <Select<ProblemRiskLevel>
                  allowClear
                  placeholder={i18nT("ui.teambuilder.problems.riskLevel")}
                  style={{ minWidth: 140 }}
                  value={riskFilter}
                  onChange={setRiskFilter}
                  options={[
                    { label: i18nT("ui.teambuilder.problems.low"), value: 'LOW' },
                    { label: i18nT("ui.teambuilder.problems.medium"), value: 'MEDIUM' },
                    { label: i18nT("ui.teambuilder.problems.high"), value: 'HIGH' },
                    { label: i18nT("ui.teambuilder.problems.critical"), value: 'CRITICAL' },
                  ]}
                />
                <Select
                  allowClear
                  placeholder={i18nT("ui.teambuilder.problems.modeSuitability")}
                  style={{ minWidth: 180 }}
                  value={modeFilter}
                  onChange={setModeFilter}
                  options={modeOptions}
                />
              </Space>
            </Col>
            <Col
              xs={24}
              md={6}
              style={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Dropdown
                menu={{
                  items: sortMenuItems,
                  onClick: handleSortMenuClick,
                }}
              >
                <Button>
                  <Space>
                    {i18nT("ui.teambuilder.problems.sort")}
                    <DownOutlined />
                  </Space>
                </Button>
              </Dropdown>
            </Col>
          </Row>
        </Card>

        <ProList<ITeambuilderProblem>
          rowKey="id"
          dataSource={filteredProblems}
          loading={loading}
          metas={metas}
          pagination={{ pageSize: 8 }}
          split
          showActions="hover"
          toolBarRender={false}
        />
      </Space>
    </TeamBuilderPageShell>
  );
}
