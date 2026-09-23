// FILE: frontend/app/teambuilder/problems/taxonomy/page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import {
  BookOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SaveOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Cascader,
  Col,
  Divider,
  Input,
  Popover,
  Row,
  Space,
  Tag,
  Tooltip,
  Tree,
  TreeSelect,
  Typography,
} from 'antd';
import type { DefaultOptionType } from 'antd/es/cascader';
import type { DataNode } from 'antd/es/tree';
import React, { useMemo, useState } from 'react';

import TeamBuilderPageShell from '@/components/teambuilder/TeamBuilderPageShell';

const { Text, Paragraph } = Typography;
const { Search } = Input;

/**
 * NOTE:
 * This uses a very small illustrative subset of a UNESCO-like taxonomy.
 * In a real implementation you would likely fetch this from an API or
 * import a static JSON file representing the full hierarchy.
 */

type TaxonomyNode = DataNode & {
  key: string;
  title: string;
  description?: string;
  children?: TaxonomyNode[];
};

const UNESCO_TREE: TaxonomyNode[] = [
  {
    key: '1',
    title: 'Natural Sciences',
    description:
      'Physics, chemistry, earth and space sciences, environmental sciences, mathematics, computer and information sciences.',
    children: [
      {
        key: '1.1',
        title: 'Mathematics',
        description: 'Pure and applied mathematics, statistics.',
        children: [
          {
            key: '1.1.1',
            title: 'Pure mathematics',
            description: 'Algebra, analysis, geometry, topology, etc.',
          },
          {
            key: '1.1.2',
            title: 'Applied mathematics',
            description: 'Operations research, mathematical modelling.',
          },
        ],
      },
      {
        key: '1.2',
        title: 'Computer and information sciences',
        description: 'Computer science, information systems, AI, data science.',
        children: [
          {
            key: '1.2.1',
            title: 'Artificial intelligence & machine learning',
            description: 'AI systems, ML, pattern recognition.',
          },
          {
            key: '1.2.2',
            title: 'Human–computer interaction',
            description: 'UX, interaction design, accessibility.',
          },
        ],
      },
    ],
  },
  {
    key: '2',
    title: 'Engineering & Technology',
    description:
      'Civil, electrical, electronic, mechanical, materials, medical engineering, environmental engineering, etc.',
    children: [
      {
        key: '2.1',
        title: 'Civil engineering',
        description:
          'Infrastructure, construction, transportation systems, urban planning (engineering aspects).',
      },
      {
        key: '2.2',
        title: 'Environmental engineering',
        description: 'Water, waste, air quality, sustainable systems.',
      },
      {
        key: '2.3',
        title: 'Medical engineering',
        description: 'Biomedical engineering, medical devices, health tech.',
      },
    ],
  },
  {
    key: '3',
    title: 'Social Sciences',
    description:
      'Psychology, economics, sociology, law, political science, educational sciences.',
    children: [
      {
        key: '3.1',
        title: 'Psychology',
        description: 'Cognitive, social, organisational psychology.',
      },
      {
        key: '3.2',
        title: 'Educational sciences',
        description: 'Pedagogy, learning science, didactics.',
      },
      {
        key: '3.3',
        title: 'Economics & business',
        description: 'Economics, management, entrepreneurship.',
      },
    ],
  },
];

type FlatTaxonomyNode = {
  key: string;
  title: string;
  path: string[];
  description?: string;
};

function flattenTree(
  nodes: TaxonomyNode[],
  parentPath: string[] = [],
): FlatTaxonomyNode[] {
  const result: FlatTaxonomyNode[] = [];
  nodes.forEach(node => {
    const currentPath = [...parentPath, node.title];
    result.push({
      key: node.key,
      title: node.title,
      path: currentPath,
      description: node.description,
    });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, currentPath));
    }
  });
  return result;
}

const FLAT_TAXONOMY: FlatTaxonomyNode[] = flattenTree(UNESCO_TREE);

/**
 * Map the tree to Cascader options.
 */
const toCascaderOptions = (nodes: TaxonomyNode[]): DefaultOptionType[] =>
  nodes.map(node => ({
    value: node.key,
    label: node.title,
    children: node.children ? toCascaderOptions(node.children) : undefined,
  }));

const CASCADER_OPTIONS = toCascaderOptions(UNESCO_TREE);

export default function TaxonomyExplorerPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [searchValue, setSearchValue] = useState('');
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>(['1', '2', '3']);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [favourites, setFavourites] = useState<string[]>([]);

  const [treeSelectValue, setTreeSelectValue] = useState<string[]>([]);
  const [cascaderValue, setCascaderValue] = useState<string[][]>([]);

  const searchMatches = useMemo(
    () =>
      searchValue.trim().length === 0
        ? []
        : FLAT_TAXONOMY.filter(item =>
            item.title.toLowerCase().includes(searchValue.toLowerCase()),
          ),
    [searchValue],
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (!value) {
      setExpandedKeys(['1', '2', '3']);
      setAutoExpandParent(false);
      return;
    }

    const matchedKeys = searchMatches.map(match => match.key);
    setExpandedKeys(matchedKeys);
    setAutoExpandParent(true);
  };

  const handleTreeSelect = (keys: React.Key[]) => {
    const strKeys = keys.map(String);
    setSelectedKeys(strKeys);
  };

  const handleAddToFavourites = () => {
    const merged = Array.from(new Set([...favourites, ...selectedKeys]));
    setFavourites(merged);
  };

  const handleClearFavourites = () => {
    setFavourites([]);
  };

  const handleResetAll = () => {
    setSearchValue('');
    setExpandedKeys(['1', '2', '3']);
    setAutoExpandParent(false);
    setSelectedKeys([]);
    setFavourites([]);
    setTreeSelectValue([]);
    setCascaderValue([]);
  };

  const favouriteNodes = useMemo(
    () => FLAT_TAXONOMY.filter(node => favourites.includes(node.key)),
    [favourites],
  );

  const tooltipForNode = (key: string): string | undefined => {
    const node = FLAT_TAXONOMY.find(n => n.key === key);
    return node?.description;
  };

  return (
    <TeamBuilderPageShell
      title={i18nT("ui.teambuilder.problems.taxonomy.unescoTaxonomyExplorer")}
      subtitle={
        <Space direction="vertical" size={8}>
          <Text type="secondary">
            {i18nT("ui.teambuilder.problems.taxonomy.browseAndCurateTheUnescoStyleTaxonomy")}
          </Text>
        </Space>
      }
      sectionLabel={i18nT("ui.teambuilder.problems.taxonomy.problems")}
      maxWidth={1200}
      primaryAction={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleResetAll}>
            {i18nT("ui.teambuilder.problems.taxonomy.resetAll")}
          </Button>
          <Button type="primary" icon={<SaveOutlined />}>
            {i18nT("ui.teambuilder.problems.taxonomy.saveFavourites")}
          </Button>
        </Space>
      }
    >
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Alert
          type="info"
          showIcon
          message={i18nT("ui.teambuilder.problems.taxonomy.whatIsThisTaxonomy")}
          description={
            <Space direction="vertical">
              <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                {i18nT("ui.teambuilder.problems.taxonomy.theUnescoTaxonomyOrganizesKnowledgeDomainsInto")}
              </Paragraph>
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                {i18nT("ui.teambuilder.problems.taxonomy.thisDoesNotRestrictWhatTeamsCan")}
              </Paragraph>
            </Space>
          }
        />

        {/* Main layout */}
        <Row gutter={[16, 16]}>
          {/* Left: tree + search */}
          <Col xs={24} md={14}>
            <Card
              title={
                <Space>
                  <BookOutlined />
                  <span>{i18nT("ui.teambuilder.problems.taxonomy.taxonomyTree")}</span>
                </Space>
              }
              extra={
                <Tooltip title={i18nT("ui.teambuilder.problems.taxonomy.useTheSearchBoxToQuicklyFind")}>
                  <InfoCircleOutlined />
                </Tooltip>
              }
            >
              <Space
                direction="vertical"
                style={{ width: '100%', marginBottom: 16 }}
                size="middle"
              >
                <Search
                  placeholder={i18nT("ui.teambuilder.problems.taxonomy.searchTaxonomyNodesEGAiPsychology")}
                  value={searchValue}
                  onChange={e => handleSearchChange(e.target.value)}
                  allowClear
                  enterButton={<FilterOutlined />}
                />

                {searchValue && (
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {searchMatches.length === 0 ? (
                      <>{i18nT("ui.teambuilder.problems.taxonomy.noTaxonomyNodesMatch")}{searchValue}”.</>
                    ) : (
                      <>
                        <Text strong>{searchMatches.length}</Text> {i18nT("ui.teambuilder.problems.taxonomy.nodeSMatch")}
                        {searchValue}”.
                      </>
                    )}
                  </Paragraph>
                )}
              </Space>

              <Tree
                checkable
                selectable
                showLine
                treeData={UNESCO_TREE}
                expandedKeys={expandedKeys}
                onExpand={keys => {
                  setExpandedKeys(keys);
                  setAutoExpandParent(false);
                }}
                autoExpandParent={autoExpandParent}
                checkedKeys={selectedKeys}
                onCheck={keys => handleTreeSelect(keys as React.Key[])}
                titleRender={node => {
                  const key = String(node.key);
                  const desc = tooltipForNode(key);
                  const isFavourite = favourites.includes(key);

                  const titleNode = (
                    <Space size={4}>
                      <span>{node.title}</span>
                      {isFavourite && (
                        <Tag
                          icon={<TagOutlined />}
                          color="blue"
                          style={{ marginLeft: 4 }}
                        >
                          {i18nT("ui.teambuilder.problems.taxonomy.favourite")}
                        </Tag>
                      )}
                    </Space>
                  );

                  return desc ? (
                    <Popover
                      placement="right"
                      content={
                        <div style={{ maxWidth: 280 }}>
                          <Paragraph strong style={{ marginBottom: 4 }}>
                            {node.title}
                          </Paragraph>
                          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                            {desc}
                          </Paragraph>
                        </div>
                      }
                    >
                      {titleNode}
                    </Popover>
                  ) : (
                    titleNode
                  );
                }}
                style={{ maxHeight: 480, overflow: 'auto', marginTop: 8 }}
              />

              <Divider />

              <Space>
                <Button
                  type="primary"
                  icon={<TagOutlined />}
                  disabled={selectedKeys.length === 0}
                  onClick={handleAddToFavourites}
                >
                  {i18nT("ui.teambuilder.problems.taxonomy.addSelectedToFavourites")}
                </Button>
                <Button onClick={() => setSelectedKeys([])}>{i18nT("ui.teambuilder.problems.taxonomy.clearSelection")}</Button>
              </Space>
            </Card>
          </Col>

          {/* Right: alternative selection + favourites */}
          <Col xs={24} md={10}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card
                title={
                  <Space>
                    <FilterOutlined />
                    <span>{i18nT("ui.teambuilder.problems.taxonomy.treeselectCascaderViews")}</span>
                  </Space>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Text strong>{i18nT("ui.teambuilder.problems.taxonomy.treeselect")}</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                      {i18nT("ui.teambuilder.problems.taxonomy.anAlternativeWayToPickASmall")}
                    </Paragraph>
                    <TreeSelect
                      treeData={UNESCO_TREE}
                      value={treeSelectValue}
                      onChange={v => setTreeSelectValue(v as string[])}
                      treeCheckable
                      showCheckedStrategy="SHOW_PARENT"
                      placeholder={i18nT("ui.teambuilder.problems.taxonomy.selectDomainsViaTreeselect")}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </div>

                  <Divider />

                  <div>
                    <Text strong>{i18nT("ui.teambuilder.problems.taxonomy.cascader")}</Text>
                    <Paragraph type="secondary" style={{ marginBottom: 4 }}>
                      {i18nT("ui.teambuilder.problems.taxonomy.navigateTheHierarchyStepByStepUseful")}
                    </Paragraph>
                    <Cascader
                      options={CASCADER_OPTIONS}
                      multiple
                      maxTagCount="responsive"
                      value={cascaderValue}
                      onChange={v => setCascaderValue(v as string[][])}
                      placeholder={i18nT("ui.teambuilder.problems.taxonomy.selectOneOrMorePathsViaCascader")}
                      style={{ width: '100%' }}
                      allowClear
                    />
                  </div>
                </Space>
              </Card>

              <Card
                title={
                  <Space>
                    <TagOutlined />
                    <span>{i18nT("ui.teambuilder.problems.taxonomy.favouriteTaxonomyNodes")}</span>
                  </Space>
                }
                extra={
                  <Button size="small" onClick={handleClearFavourites}>
                    {i18nT("ui.teambuilder.problems.taxonomy.clearFavourites")}
                  </Button>
                }
              >
                {favouriteNodes.length === 0 ? (
                  <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                    {i18nT("ui.teambuilder.problems.taxonomy.noFavouritesYetSelectNodesInThe")}
                  </Paragraph>
                ) : (
                  <Space wrap>
                    {favouriteNodes.map(node => (
                      <Tag
                        key={node.key}
                        color="blue"
                        icon={<BookOutlined />}
                        style={{ marginBottom: 4 }}
                      >
                        {node.path?.join(' › ') ?? node.title}
                      </Tag>
                    ))}
                  </Space>
                )}
              </Card>
            </Space>
          </Col>
        </Row>

        <Divider />

        <Alert
          type="success"
          showIcon
          message={i18nT("ui.teambuilder.problems.taxonomy.nextStepUseTheseDomainsInYour")}
          description={
            <Space direction="vertical">
              <Text>
                {i18nT("ui.teambuilder.problems.taxonomy.whenYouCreateOrEditAProblem")}{' '}
                <strong>{i18nT("ui.teambuilder.problems.taxonomy.problemsProblemLibrary")}</strong>{i18nT("ui.teambuilder.problems.taxonomy.youWillBeAbleToTagIt")}
              </Text>
              <Text type="secondary">
                {i18nT("ui.teambuilder.problems.taxonomy.thisMakesItEasierToSearchFor")}
              </Text>
            </Space>
          }
        />
      </Space>
    </TeamBuilderPageShell>
  );
}
