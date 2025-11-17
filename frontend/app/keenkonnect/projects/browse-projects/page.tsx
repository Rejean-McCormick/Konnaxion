// app/keenkonnect/projects/browse-projects/page.tsx
'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
  Spin,
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import api from '@/api';

const { Search } = Input;
const { Option } = Select;

const PROJECTS_ENDPOINT = '/api/projects/';

type SortCriteria = 'newest' | 'mostMembers';

interface ApiProject {
  id: number;
  title: string;
  description: string;
  creator: string;
  category: string;
  status: string;
  created_at: string;
  updated_at: string;
  tags: number[];
}

interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  technologies: string[];
  domain: string;
  members: number;
  createdAt: string; // ISO date string
}

export default function BrowseProjectsPage(): JSX.Element {
  const router = useRouter();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('All');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('newest');
  const [activeDomainTabKey, setActiveDomainTabKey] = useState<string>('All');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<ApiProject[]>(PROJECTS_ENDPOINT);

        // Map backend Project objects to the UI shape used by this page
        const mapped: Project[] = data.map((p) => ({
          id: String(p.id),
          name: p.title,
          description: p.description ?? '',
          owner: p.creator ?? '',
          domain: p.category ?? 'Uncategorized',
          technologies: [], // TODO: map from tags or related data when available
          members: 0, // TODO: replace with real team size when project-team endpoints are wired
          createdAt: p.created_at,
        }));

        setProjects(mapped);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load projects', err);
        setError('Unable to load projects from the server.');
      } finally {
        setLoading(false);
      }
    };

    void fetchProjects();
  }, []);

  const domainOptions = useMemo(() => {
    const unique = Array.from(
      new Set(projects.map((p) => p.domain || 'Uncategorized')),
    );
    return ['All', ...unique];
  }, [projects]);

  const technologyOptions = useMemo(() => {
    const allTechs = new Set<string>();
    projects.forEach((p) => {
      p.technologies.forEach((t) => allTechs.add(t));
    });
    return ['All', ...Array.from(allTechs)];
  }, [projects]);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        const matchesSearch =
          !searchText ||
          project.name.toLowerCase().includes(searchText.toLowerCase()) ||
          project.description.toLowerCase().includes(searchText.toLowerCase());

        const matchesDomain =
          selectedDomain === 'All' || project.domain === selectedDomain;

        const matchesTechnology =
          selectedTechnology === 'All' ||
          project.technologies.includes(selectedTechnology);

        return matchesSearch && matchesDomain && matchesTechnology;
      }),
    [projects, searchText, selectedDomain, selectedTechnology],
  );

  const sortedProjects = useMemo(() => {
    const next = [...filteredProjects];
    if (sortCriteria === 'newest') {
      next.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortCriteria === 'mostMembers') {
      next.sort((a, b) => b.members - a.members);
    }
    return next;
  }, [filteredProjects, sortCriteria]);

  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProjects.slice(startIndex, startIndex + pageSize);
  }, [sortedProjects, currentPage]);

  const handleOpenDrawer = (project: Project) => {
    setSelectedProject(project);
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
    setSelectedProject(null);
  };

  const handleDomainTabChange = (key: string) => {
    setActiveDomainTabKey(key);
    setSelectedDomain(key);
    setCurrentPage(1);
  };

  return (
    <PageContainer
      ghost
      header={{
        title: 'Browse Projects',
        subTitle:
          'Discover projects and collaborate through KeenKonnect. Data is loaded from the Django backend.',
        extra: [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() =>
              router.push('/keenkonnect/projects/create-new-project')
            }
          >
            Create New Project
          </Button>,
        ],
      }}
    >
      <ProCard ghost>
        {loading && (
          <div style={{ textAlign: 'center', padding: 24 }}>
            <Spin />
          </div>
        )}

        {error && (
          <div style={{ marginBottom: 16 }}>
            <Tag color="red">{error}</Tag>
          </div>
        )}

        {/* Tabs + filters */}
        <ProCard bordered={false}>
          {/* Quick domain Tabs */}
          <Tabs
            activeKey={activeDomainTabKey}
            onChange={handleDomainTabChange}
            items={domainOptions.map((domain) => ({
              key: domain,
              label: domain === 'All' ? 'All Domains' : domain,
            }))}
          />

          {/* Filters */}
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            <Col xs={24} md={10}>
              <Search
                placeholder="Search by name or description"
                allowClear
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </Col>
            <Col xs={24} sm={12} md={7}>
              <Select
                value={selectedDomain}
                style={{ width: '100%' }}
                onChange={(value) => {
                  setSelectedDomain(value);
                  setActiveDomainTabKey(value);
                  setCurrentPage(1);
                }}
              >
                {domainOptions.map((domain) => (
                  <Option key={domain} value={domain}>
                    {domain === 'All' ? 'All Domains' : domain}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={7}>
              <Select
                value={selectedTechnology}
                style={{ width: '100%' }}
                onChange={(value) => {
                  setSelectedTechnology(value);
                  setCurrentPage(1);
                }}
              >
                {technologyOptions.map((tech) => (
                  <Option key={tech} value={tech}>
                    {tech === 'All' ? 'All Technologies' : tech}
                  </Option>
                ))}
              </Select>
            </Col>
          </Row>

          {/* Sort & result count */}
          <Row
            justify="space-between"
            align="middle"
            style={{ marginTop: 16 }}
          >
            <Col>
              <Space size="middle">
                <span>Sort by:</span>
                <Select
                  value={sortCriteria}
                  style={{ width: 200 }}
                  onChange={(value) =>
                    setSortCriteria(value as SortCriteria)
                  }
                >
                  <Option value="newest">Newest</Option>
                  <Option value="mostMembers">Most Members</Option>
                </Select>
              </Space>
            </Col>
            <Col>
              <span>
                {sortedProjects.length} project
                {sortedProjects.length !== 1 ? 's' : ''} found
              </span>
            </Col>
          </Row>
        </ProCard>

        {/* Projects grid */}
        <ProCard ghost style={{ marginTop: 24 }} bodyStyle={{ padding: 0 }}>
          {projects.length === 0 && !loading ? (
            <Empty description="No projects available yet." />
          ) : (
            <Row gutter={[24, 24]}>
              {paginatedProjects.map((project) => (
                <Col key={project.id} xs={24} sm={12} lg={8}>
                  <Card
                    hoverable
                    title={project.name}
                    onClick={() => handleOpenDrawer(project)}
                    extra={
                      <Space size={8}>
                        <Tag color="blue">{project.domain}</Tag>
                        <Tooltip title={`${project.members} members`}>
                          <Space size={4}>
                            <TeamOutlined />
                            <span>{project.members}</span>
                          </Space>
                        </Tooltip>
                      </Space>
                    }
                  >
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: '100%' }}
                    >
                      <div style={{ minHeight: 48 }}>
                        {project.description || 'No description provided yet.'}
                      </div>

                      {/* Technologies */}
                      <Space wrap>
                        {project.technologies.length === 0 ? (
                          <Tag>No technologies listed</Tag>
                        ) : (
                          project.technologies.map((tech) => (
                            <Tag key={tech}>{tech}</Tag>
                          ))
                        )}
                      </Space>

                      {/* Avatars + owner + CTA */}
                      <Row
                        justify="space-between"
                        align="middle"
                        style={{ marginTop: 8 }}
                      >
                        <Col>
                          <Space size={8}>
                            <Avatar.Group maxCount={3} size="small">
                              <Avatar icon={<UserOutlined />} />
                              <Avatar>
                                {project.owner
                                  ? project.owner.charAt(0).toUpperCase()
                                  : '?'}
                              </Avatar>
                              <Avatar icon={<UserOutlined />} />
                            </Avatar.Group>
                            <span
                              style={{
                                fontSize: 12,
                                color: 'rgba(0,0,0,0.45)',
                              }}
                            >
                              Owner: {project.owner || 'Unknown'}
                            </span>
                          </Space>
                        </Col>
                        <Col>
                          <Button
                            type="link"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(
                                `/keenkonnect/projects/project-workspace?projectId=${project.id}`,
                              );
                            }}
                          >
                            Open workspace
                          </Button>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                </Col>
              ))}

              {paginatedProjects.length === 0 && projects.length > 0 && (
                <Col span={24}>
                  <Card>
                    <Space direction="vertical">
                      <span>No projects match your filters.</span>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() =>
                          router.push(
                            '/keenkonnect/projects/create-new-project',
                          )
                        }
                      >
                        Start a New Project
                      </Button>
                    </Space>
                  </Card>
                </Col>
              )}
            </Row>
          )}
        </ProCard>

        {/* Pagination */}
        {sortedProjects.length > pageSize && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={sortedProjects.length}
              showSizeChanger={false}
              onChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}

        {/* Drawer: project details */}
        <Drawer
          title={selectedProject?.name}
          placement="right"
          width={420}
          open={drawerVisible}
          onClose={handleCloseDrawer}
        >
          {selectedProject && (
            <Space
              direction="vertical"
              size="middle"
              style={{ width: '100%' }}
            >
              <Space align="center">
                <Avatar.Group maxCount={3}>
                  <Avatar size="large" icon={<UserOutlined />} />
                  <Avatar>
                    {selectedProject.owner
                      ? selectedProject.owner.charAt(0).toUpperCase()
                      : '?'}
                  </Avatar>
                  <Avatar icon={<UserOutlined />} />
                </Avatar.Group>
                <div>
                  <div>
                    <strong>Owner: </strong>
                    {selectedProject.owner || 'Unknown'}
                  </div>
                  <div>
                    <strong>Members: </strong>
                    {selectedProject.members}
                  </div>
                </div>
              </Space>

              <Divider />

              <div>
                <p>
                  <strong>Description</strong>
                </p>
                <p>
                  {selectedProject.description ||
                    'No detailed description provided yet.'}
                </p>
              </div>

              <div>
                <p>
                  <strong>Domain</strong>
                </p>
                <Tag color="blue">{selectedProject.domain}</Tag>
              </div>

              <div>
                <p>
                  <strong>Technologies</strong>
                </p>
                <Space wrap>
                  {selectedProject.technologies.length === 0 ? (
                    <Tag>No technologies listed</Tag>
                  ) : (
                    selectedProject.technologies.map((tech) => (
                      <Tag key={tech}>{tech}</Tag>
                    ))
                  )}
                </Space>
              </div>

              <div>
                <p>
                  <strong>Created At</strong>
                </p>
                <span>{selectedProject.createdAt}</span>
              </div>
            </Space>
          )}
        </Drawer>
      </ProCard>
    </PageContainer>
  );
}
