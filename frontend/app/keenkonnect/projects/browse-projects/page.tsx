// app/keenkonnect/projects/browse-projects/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { List, Card, Input, Select, Button, Drawer, Row, Col, Divider, Pagination, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Search } = Input;
const { Option } = Select;

interface Project {
  id: string;
  name: string;
  description: string;
  owner: string;
  technologies: string[];
  domain: string;
  members: number;
  createdAt: string;
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
    technologies: ['Next.js', 'Tailwind CSS'],
    domain: 'Education',
    members: 12,
    createdAt: '2023-09-02',
  },
  {
    id: '3',
    name: 'Project Gamma',
    description: 'Developing a disruptive fintech solution.',
    owner: 'Charlie',
    technologies: ['Angular', 'Firebase'],
    domain: 'Finance',
    members: 10,
    createdAt: '2023-08-28',
  },
  {
    id: '4',
    name: 'Project Delta',
    description: 'A marketing project aimed to improve brand engagement.',
    owner: 'Diana',
    technologies: ['Vue.js', 'SCSS'],
    domain: 'Marketing',
    members: 15,
    createdAt: '2023-09-03',
  },
  {
    id: '5',
    name: 'Project Epsilon',
    description: 'Design-focused project for innovative product development.',
    owner: 'Edward',
    technologies: ['Figma', 'Illustrator'],
    domain: 'Design',
    members: 5,
    createdAt: '2023-08-25',
  },
];

export default function BrowseProjectsPage() {
  const router = useRouter();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filters & sort
  const [searchText, setSearchText] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [selectedTechnology, setSelectedTechnology] = useState('All');
  const [sortCriteria, setSortCriteria] = useState<'newest' | 'mostMembers'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  // Filtered list
  const filteredProjects = useMemo(() => {
    return sampleProjects.filter((project) => {
      const matchesSearch =
        project.name.toLowerCase().includes(searchText.toLowerCase()) ||
        project.description.toLowerCase().includes(searchText.toLowerCase());
      const matchesDomain = selectedDomain === 'All' || project.domain === selectedDomain;
      const matchesTechnology =
        selectedTechnology === 'All' || project.technologies.includes(selectedTechnology);
      return matchesSearch && matchesDomain && matchesTechnology;
    });
  }, [searchText, selectedDomain, selectedTechnology]);

  // Sorted list
  const sortedProjects = useMemo(() => {
    return [...filteredProjects].sort((a, b) => {
      if (sortCriteria === 'newest') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortCriteria === 'mostMembers') {
        return b.members - a.members;
      }
      return 0;
    });
  }, [filteredProjects, sortCriteria]);

  // Pagination slice
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedProjects.slice(startIndex, startIndex + pageSize);
  }, [sortedProjects, currentPage]);

  // Drawer handlers
  const openDrawer = (project: Project) => {
    setSelectedProject(project);
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setSelectedProject(null);
  };

  return (
    <div className="container mx-auto p-5">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-4">Browse Projects</h1>

      {/* Search & Filters */}
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12}>
          <Search
            placeholder="Search projects..."
            allowClear
            onSearch={(value) => {
              setSearchText(value);
              setCurrentPage(1);
            }}
          />
        </Col>
        <Col xs={24} sm={6}>
          <Select
            value={selectedDomain}
            style={{ width: '100%' }}
            onChange={(value) => {
              setSelectedDomain(value);
              setCurrentPage(1);
            }}
          >
            <Option value="All">All Domains</Option>
            <Option value="Energy">Energy</Option>
            <Option value="Education">Education</Option>
            <Option value="Finance">Finance</Option>
            <Option value="Marketing">Marketing</Option>
            <Option value="Design">Design</Option>
          </Select>
        </Col>
        <Col xs={24} sm={6}>
          <Select
            value={selectedTechnology}
            style={{ width: '100%' }}
            onChange={(value) => {
              setSelectedTechnology(value);
              setCurrentPage(1);
            }}
          >
            <Option value="All">All Technologies</Option>
            <Option value="React">React</Option>
            <Option value="Next.js">Next.js</Option>
            <Option value="Angular">Angular</Option>
            <Option value="Node.js">Node.js</Option>
            <Option value="Firebase">Firebase</Option>
            <Option value="Tailwind CSS">Tailwind CSS</Option>
            <Option value="Vue.js">Vue.js</Option>
          </Select>
        </Col>
      </Row>

      {/* Sort & Create */}
      <Row justify="space-between" align="middle" className="mb-4">
        <Col>
          <Select value={sortCriteria} onChange={(value) => setSortCriteria(value)}>
            <Option value="newest">Sort by Newest</Option>
            <Option value="mostMembers">Sort by Most Members</Option>
          </Select>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => router.push('/keenkonnect/projects/create-new-project')}
          >
            Create New Project
          </Button>
        </Col>
      </Row>

      <Divider />

      {/* Projects */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
        dataSource={paginatedProjects}
        renderItem={(project: Project) => (
          <List.Item key={project.id}>
            <Card
              hoverable
              title={project.name}
              extra={<span>{project.owner}</span>}
              actions={[
                <Button key="details" type="link" onClick={() => openDrawer(project)}>
                  View Details
                </Button>,
                <Button
                  key="join"
                  type="link"
                  onClick={() =>
                    router.push(`/keenkonnect/projects/request-join?id=${project.id}`)
                  }
                >
                  Request to Join
                </Button>,
              ]}
            >
              <p>{project.description}</p>
              <div>
                {project.technologies.map((tech, idx) => (
                  <Tag key={idx}>{tech}</Tag>
                ))}
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* Pagination */}
      <Row justify="center" className="mt-4">
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={sortedProjects.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </Row>

      {/* Drawer */}
      <Drawer
        title={selectedProject?.name}
        placement="right"
        onClose={closeDrawer}
        open={drawerVisible}
        width={400}
      >
        {selectedProject && (
          <div>
            <p>
              <strong>Owner:</strong> {selectedProject.owner}
            </p>
            <p>
              <strong>Description:</strong> {selectedProject.description}
            </p>
            <p>
              <strong>Domain:</strong> {selectedProject.domain}
            </p>
            <p>
              <strong>Technologies:</strong> {selectedProject.technologies.join(', ')}
            </p>
            <p>
              <strong>Members:</strong> {selectedProject.members}
            </p>
            <p>
              <strong>Created At:</strong> {selectedProject.createdAt}
            </p>
            <Divider />
            <Button
              type="primary"
              onClick={() =>
                router.push(`/keenkonnect/projects/request-join?id=${selectedProject.id}`)
              }
            >
              Request to Join
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  );
}
