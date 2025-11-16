// app/keenkonnect/projects/browse-projects/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Input,
  Pagination,
  Row,
  Select,
  Space,
  Tabs,
  Tag,
  Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;

type SortCriteria = 'newest' | 'mostMembers';

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

// Sample data (replace with API data when ready)
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Project Alpha',
    description: 'An innovative project in renewable energy.',
    owner: 'Alice',
    technologies: ['React', 'Node.js'],
    domain: 'Energy',
    members: 8,
    createdAt: '2023-09-01',
  },
  {
    id: '2',
    name: 'Project Beta',
    description: 'A collaborative initiative for modern education.',
    owner: 'Bob',
    technologies: ['Python', 'Django'],
    domain: 'Education',
    members: 12,
    createdAt: '2023-08-15',
  },
  {
    id: '3',
    name: 'Project Gamma',
    description: 'Fintech solution for inclusive banking.',
    owner: 'Charlie',
    technologies: ['React', 'Go'],
    domain: 'Finance',
    members: 5,
    createdAt: '2023-09-10',
  },
  {
    id: '4',
    name: 'Project Delta',
    description: 'Marketing analytics platform with AI insights.',
    owner: 'Diana',
    technologies: ['Vue', 'Node.js'],
    domain: 'Marketing',
    members: 10,
    createdAt: '2023-07-22',
  },
  {
    id: '5',
    name: 'Project Epsilon',
    description: 'Design-centric collaboration hub.',
    owner: 'Eve',
    technologies: ['Figma', 'TypeScript'],
    domain: 'Design',
    members: 6,
    createdAt: '2023-09-05',
  },
];

export default function BrowseProjectsPage(): JSX.Element {
  const router = useRouter();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const [searchText, setSearchText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [selectedTechnology, setSelectedTechnology] = useState<string>('All');
  const [sortCriteria, setSortCriteria] = useState<SortCriteria>('newest');
  const [activeDomainTabKey, setActiveDomainTabKey] = useState<string>('All');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 6;

  const domainOptions = useMemo(() => {
    const unique = Array.from(new Set(sampleProjects.map((p) => p.domain)));
    return ['All', ...unique];
  }, []);

  const technologyOptions = useMemo(() => {
    const allTechs = new Set<string>();
    sampleProjects.forEach((p) => {
      p.technologies.forEach((t) => allTechs.add(t));
    });
    return ['All', ...Array.from(allTechs)];
  }, []);

  const filteredProjects = useMemo(
    () =>
      sampleProjects.filter((project) => {
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
    [searchText, selectedDomain, selectedTechnology],
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
        subTitle: 'Discover projects and collaborate through KeenKonnect.',
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
                    <div style={{ minHeight: 48 }}>{project.description}</div>

                    {/* Technologies */}
                    <Space wrap>
                      {project.technologies.map((tech) => (
                        <Tag key={tech}>{tech}</Tag>
                      ))}
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
                              {project.owner.charAt(0).toUpperCase()}
                            </Avatar>
                            <Avatar icon={<UserOutlined />} />
                          </Avatar.Group>
                          <span
                            style={{
                              fontSize: 12,
                              color: 'rgba(0,0,0,0.45)',
                            }}
                          >
                            Owner: {project.owner}
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
                              `/keenkonnect/projects/request-join?id=${project.id}`,
                            );
                          }}
                        >
                          Request to Join
                        </Button>
                      </Col>
                    </Row>
                  </Space>
                </Card>
              </Col>
            ))}

            {paginatedProjects.length === 0 && (
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
                    {selectedProject.owner.charAt(0).toUpperCase()}
                  </Avatar>
                  <Avatar icon={<UserOutlined />} />
                </Avatar.Group>
                <div>
                  <div>
                    <strong>Owner: </strong>
                    {selectedProject.owner}
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
                <p>{selectedProject.description}</p>
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
                  {selectedProject.technologies.map((tech) => (
                    <Tag key={tech}>{tech}</Tag>
                  ))}
                </Space>
              </div>

              <div>
                <p>
                  <strong>Created At</strong>
                </p>
                <span>{selectedProject.createdAt}</span>
              </div>

              <Divider />

              <Button
                type="primary"
                block
                onClick={() =>
                  router.push(
                    `/keenkonnect/projects/request-join?id=${selectedProject.id}`,
                  )
                }
              >
                Request to Join
              </Button>
            </Space>
          )}
        </Drawer>
      </ProCard>
    </PageContainer>
  );
}
