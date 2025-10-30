'use client'

// pages/keenkonnect/projects/project-workspace/index.tsx
import React from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, Tabs, Row, Col, Avatar, List, Button, Divider } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { TabPane } = Tabs;

// Données simulées pour le projet
const projectInfo = {
  title: 'Project Alpha',
  description: 'This project is focused on developing innovative renewable energy solutions.',
  status: 'Active',
  startDate: '2023-08-01',
  recentUpdates: [
    'Updated project roadmap',
    'Invited a new team member: Alice',
    'Milestone reached: Prototype completed'
  ],
  // Indication si l’utilisateur est le propriétaire
  isOwner: true,
};

// Données simulées pour les tâches
const tasksData = [
  { key: '1', task: 'Finalize proposal', assignee: 'Alice', status: 'In Progress', dueDate: '2023-09-15' },
  { key: '2', task: 'Design prototype', assignee: 'Bob', status: 'Pending', dueDate: '2023-09-20' },
  { key: '3', task: 'Test prototype', assignee: 'Charlie', status: 'Completed', dueDate: '2023-09-10' },
];

// Données simulées pour les fichiers
const filesData = [
  { key: '1', name: 'Project Roadmap.pdf', action: 'Download' },
  { key: '2', name: 'Technical Specs.docx', action: 'Download' },
];

// Données simulées pour la discussion (dummy messages)
const discussionData = [
  { id: '1', author: 'Alice', message: 'Let’s schedule a meeting to discuss the prototype.', time: '10:15 AM' },
  { id: '2', author: 'Bob', message: 'I think we should also consider cost efficiency.', time: '10:20 AM' },
];

// Données simulées pour la timeline / activité du projet
const timelineData = [
  { key: '1', time: '2023-08-05', event: 'Project kickoff meeting held.' },
  { key: '2', time: '2023-08-20', event: 'Concept design approved.' },
  { key: '3', time: '2023-09-01', event: 'Prototype completed.' },
];

// Données simulées pour la liste des membres
const projectMembers = [
  { key: '1', name: 'Alice', role: 'Owner', avatar: '/avatars/alice.png' },
  { key: '2', name: 'Bob', role: 'Member', avatar: '/avatars/bob.png' },
  { key: '3', name: 'Charlie', role: 'Member', avatar: '/avatars/charlie.png' },
  { key: '4', name: 'Diana', role: 'Member', avatar: '/avatars/diana.png' },
];

const ProjectWorkspace: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();

  // Pour simuler l'action de modification du projet (si propriétaire)
  const handleEditProject = () => {
    // Redirige vers une page d'édition (exemple)
    router.push('/keenkonnect/projects/manage-project?id=1');
  };

  return (
    <>
      <Head>
        <title>Project Workspace</title>
        <meta name="description" content="Collaboration tools for your project workspace." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête du Workspace */}
        <Row justify="space-between" align="middle" className="mb-4">
          <h1 className="text-2xl font-bold">{projectInfo.title}</h1>
          {projectInfo.isOwner && (
            <Button icon={<EditOutlined />} onClick={handleEditProject}>
              Edit Project
            </Button>
          )}
        </Row>
        <p>{projectInfo.description}</p>
        <Divider />

        <Row gutter={16}>
          {/* Contenu principal avec onglets */}
          <Col xs={24} md={18}>
            <Card>
              <Tabs defaultActiveKey="overview">
                <TabPane tab="Overview" key="overview">
                  <p><strong>Status:</strong> {projectInfo.status}</p>
                  <p><strong>Start Date:</strong> {projectInfo.startDate}</p>
                  <p><strong>Members:</strong> {projectMembers.length}</p>
                  <p><strong>Recent Updates:</strong></p>
                  <List
                    dataSource={projectInfo.recentUpdates}
                    renderItem={(item) => <List.Item>{item}</List.Item>}
                  />
                </TabPane>

                <TabPane tab="Tasks" key="tasks">
                  <p>Task List:</p>
                  <List
                    dataSource={tasksData}
                    renderItem={(task) => (
                      <List.Item>
                        <List.Item.Meta
                          title={`${task.task} (Assignee: ${task.assignee})`}
                          description={`Status: ${task.status} | Due Date: ${task.dueDate}`}
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>

                <TabPane tab="Files" key="files">
                  <List
                    dataSource={filesData}
                    renderItem={(file) => (
                      <List.Item>
                        <List.Item.Meta
                          title={file.name}
                          description={file.action}
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>

                <TabPane tab="Discussion" key="discussion">
                  <List
                    dataSource={discussionData}
                    renderItem={(msg) => (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar src={`/avatars/${msg.author.toLowerCase()}.png`} />}
                          title={msg.author}
                          description={`${msg.message} (${msg.time})`}
                        />
                      </List.Item>
                    )}
                  />
                </TabPane>

                <TabPane tab="Timeline" key="timeline">
                  <List
                    dataSource={timelineData}
                    renderItem={(event) => (
                      <List.Item>
                        <strong>{event.time}</strong>: {event.event}
                      </List.Item>
                    )}
                  />
                </TabPane>
              </Tabs>
            </Card>
          </Col>

          {/* Sidebar : liste des membres */}
          <Col xs={24} md={6}>
            <Card title="Project Members">
              <Avatar.Group>
                {projectMembers.map(member => (
                  <Avatar key={member.key} src={member.avatar} title={`${member.name} (${member.role})`} />
                ))}
              </Avatar.Group>
              <Divider />
              <p><strong>Online:</strong> {/* Vous pouvez ajouter un indicateur ici */}2/4 currently online</p>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

ProjectWorkspace.getLayout = (page: React.ReactElement) => <MainLayout>{page}</MainLayout>;

export default ProjectWorkspace;
