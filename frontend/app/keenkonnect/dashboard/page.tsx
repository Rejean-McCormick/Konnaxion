'use client';
import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, List, Row, Col, Button, Divider } from 'antd';
import { PlusOutlined, TeamOutlined, FolderAddOutlined, CheckSquareOutlined, BellOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';

const KeenKonnectDashboard: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  // Données simulées pour les widgets
  const recentProjects = [
    { id: 'p1', title: 'Project Alpha', update: 'Updated timeline and task statuses.' },
    { id: 'p2', title: 'Project Beta', update: 'New member joined and project goals refined.' },
    { id: 'p3', title: 'Project Gamma', update: 'Milestone reached: Prototype completed.' },
  ];

  const repositoryUpdates = [
    { id: 'r1', title: 'Resource A', update: 'Document updated to v2.1.' },
    { id: 'r2', title: 'Resource B', update: 'New resource added to the repository.' },
  ];

  const activeWorkspaces = [
    { id: 'w1', title: 'Team Alpha Workspace', status: 'Active' },
    { id: 'w2', title: 'Collaboration Beta', status: 'In Progress' },
    { id: 'w3', title: 'Project Gamma Workspace', status: 'Active' },
  ];

  const myTasks = [
    { id: 't1', task: 'Finalize project proposal', deadline: '2023-09-15' },
    { id: 't2', task: 'Review team submissions', deadline: '2023-09-10' },
    { id: 't3', task: 'Update documentation', deadline: '2023-09-12' },
  ];

  const notifications = [
    { id: 'n1', message: 'You have a pending invitation from Team Delta.' },
    { id: 'n2', message: 'Project Alpha has a new announcement.' },
  ];

  return (
    <>
      <Head>
        <title>KeenKonnect Dashboard</title>
        <meta name="description" content="Overview of your projects, collaboration, tasks, and notifications on KeenKonnect." />
      </Head>
      <div className="container mx-auto p-5">
        {/* Header */}
        <h1 className="text-2xl font-bold mb-4">KeenKonnect Dashboard</h1>

        {/* Widgets section */}
        <Row gutter={[16, 16]}>
          {/* Recent Projects */}
          <Col xs={24} md={12}>
            <Card title="Recent Projects" variant="borderless">
              <List
                dataSource={recentProjects}
                renderItem={(project) => (
                  <List.Item key={project.id}>
                    <List.Item.Meta title={project.title} description={project.update} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Repository Updates */}
          <Col xs={24} md={12}>
            <Card title="Repository Updates" variant="borderless">
              <List
                dataSource={repositoryUpdates}
                renderItem={(resource) => (
                  <List.Item key={resource.id}>
                    <List.Item.Meta title={resource.title} description={resource.update} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Active Collaboration */}
          <Col xs={24} md={12}>
            <Card title="Active Collaboration" variant="borderless">
              <List
                dataSource={activeWorkspaces}
                renderItem={(workspace) => (
                  <List.Item key={workspace.id}>
                    <List.Item.Meta title={workspace.title} description={`Status: ${workspace.status}`} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* My Tasks */}
          <Col xs={24} md={12}>
            <Card title="My Tasks" variant="borderless">
              <List
                dataSource={myTasks}
                renderItem={(task) => (
                  <List.Item key={task.id}>
                    <List.Item.Meta title={task.task} description={`Deadline: ${task.deadline}`} />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Divider />

        {/* Quick Start Buttons */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col>
            <Button type="primary" icon={<PlusOutlined />} size="large">
              Create New Project
            </Button>
          </Col>
          <Col>
            <Button type="default" icon={<TeamOutlined />} size="large">
              Find Team
            </Button>
          </Col>
          <Col>
            <Button type="default" icon={<FolderAddOutlined />} size="large">
              New Repository
            </Button>
          </Col>
          <Col>
            <Button type="default" icon={<CheckSquareOutlined />} size="large">
              My Tasks
            </Button>
          </Col>
        </Row>

        {/* Notifications Preview */}
        <Card title="Notifications" variant="borderless">
          {notifications.length > 0 ? (
            <List
              dataSource={notifications}
              renderItem={(notif) => (
                <List.Item key={notif.id}>
                  <List.Item.Meta title={notif.message} />
                </List.Item>
              )}
            />
          ) : (
            <p>No notifications at the moment.</p>
          )}
        </Card>
      </div>
    </>
  );
};

KeenKonnectDashboard.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default KeenKonnectDashboard;
