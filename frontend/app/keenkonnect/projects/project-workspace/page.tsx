'use client';

import React, { useState } from 'react';
import { Row, Col, Card, List, Avatar, Tag, Space, Button, Progress, Typography, Timeline } from 'antd';
import PageContainer from '@/components/PageContainer';

const { Title, Text } = Typography;

type TaskStatus = 'todo' | 'in-progress' | 'done';

type Task = {
  id: string;
  title: string;
  assignee: string;
  status: TaskStatus;
  progress?: number;
};

type FileItem = {
  id: string;
  name: string;
  uploader: string;
  size: string;
};

type Discussion = {
  id: string;
  author: string;
  message: string;
  time: string;
};

type Member = {
  id: string;
  name: string;
  role: string;
  avatar?: string;
};

const tasksData: Task[] = [
  { id: 't1', title: 'Define project scope', assignee: 'Alice', status: 'done', progress: 100 },
  { id: 't2', title: 'Design wireframes', assignee: 'Bob', status: 'in-progress', progress: 60 },
  { id: 't3', title: 'API contract', assignee: 'Chloé', status: 'todo', progress: 0 },
];

const filesData: FileItem[] = [
  { id: 'f1', name: 'requirements.pdf', uploader: 'Alice', size: '214 KB' },
  { id: 'f2', name: 'wireframes.fig', uploader: 'Bob', size: '1.2 MB' },
  { id: 'f3', name: 'api-contract.yaml', uploader: 'Chloé', size: '36 KB' },
];

const discussionData: Discussion[] = [
  { id: 'd1', author: 'Alice', message: 'I pushed the latest requirements.', time: 'Today 09:42' },
  { id: 'd2', author: 'Bob', message: 'Wireframes homepage v2 ready.', time: 'Yesterday 18:05' },
  { id: 'd3', author: 'Chloé', message: 'Starting the API contract draft.', time: 'Yesterday 11:17' },
];

const projectMembers: Member[] = [
  { id: 'm1', name: 'Alice Martin', role: 'PM', avatar: '' },
  { id: 'm2', name: 'Bob Leroy', role: 'Designer', avatar: '' },
  { id: 'm3', name: 'Chloé Durand', role: 'Backend', avatar: '' },
  { id: 'm4', name: 'Diego Ruiz', role: 'Frontend', avatar: '' },
];

function statusTag(status: TaskStatus) {
  switch (status) {
    case 'done':
      return <Tag color="green">Done</Tag>;
    case 'in-progress':
      return <Tag color="blue">In progress</Tag>;
    default:
      return <Tag>To do</Tag>;
  }
}

export default function ProjectWorkspacePage() {
  const [tasks, setTasks] = useState<Task[]>(tasksData);

  const markDone = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: 'done', progress: 100 } : t)),
    );
  };

  return (
    <PageContainer title="Project Workspace">
      <Space direction="vertical" size={16} style={{ width: '100%' }}>
        {/* Overview */}
        <Card>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Space direction="vertical" size={8}>
                <Text type="secondary">Total tasks</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {tasks.length}
                </Title>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size={8}>
                <Text type="secondary">In progress</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {tasks.filter(t => t.status === 'in-progress').length}
                </Title>
              </Space>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size={8}>
                <Text type="secondary">Done</Text>
                <Title level={3} style={{ margin: 0 }}>
                  {tasks.filter(t => t.status === 'done').length}
                </Title>
              </Space>
            </Col>
          </Row>
        </Card>

        <Row gutter={[16, 16]}>
          {/* Tasks */}
          <Col xs={24} lg={12}>
            <Card title="Tasks">
              <List
                dataSource={tasks}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      item.status !== 'done' ? (
                        <Button key="done" size="small" onClick={() => markDone(item.id)}>
                          Mark done
                        </Button>
                      ) : null,
                    ]}
                  >
                    <List.Item.Meta
                      title={
                        <Space size={8}>
                          <Text>{item.title}</Text>
                          {statusTag(item.status)}
                        </Space>
                      }
                      description={<Text type="secondary">Assignee: {item.assignee}</Text>}
                    />
                    <div style={{ minWidth: 120 }}>
                      <Progress percent={item.progress ?? 0} size="small" />
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Files */}
          <Col xs={24} lg={12}>
            <Card title="Files">
              <List
                dataSource={filesData}
                renderItem={(file) => (
                  <List.Item actions={[<Button key="download" type="link">Download</Button>]}>
                    <List.Item.Meta
                      avatar={<Avatar>{file.name.slice(0, 1).toUpperCase()}</Avatar>}
                      title={file.name}
                      description={
                        <Text type="secondary">
                          Uploaded by {file.uploader} • {file.size}
                        </Text>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          {/* Discussion */}
          <Col xs={24} lg={12}>
            <Card title="Discussion">
              <List
                dataSource={discussionData}
                renderItem={(msg) => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{msg.author.slice(0, 1).toUpperCase()}</Avatar>}
                      title={
                        <Space direction="horizontal" size={8}>
                          <Text strong>{msg.author}</Text>
                          <Text type="secondary">{msg.time}</Text>
                        </Space>
                      }
                      description={msg.message}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Timeline */}
          <Col xs={24} lg={12}>
            <Card title="Timeline">
              <Timeline
                items={[
                  { color: 'green', children: 'Project created' },
                  { color: 'blue', children: 'Wireframes v2 shared' },
                  { color: 'gray', children: 'API contract drafting' },
                ]}
              />
            </Card>
          </Col>
        </Row>

        {/* Team */}
        <Card title="Team">
          <List
            grid={{ gutter: 16, xs: 2, sm: 3, md: 4, lg: 4 }}
            dataSource={projectMembers}
            renderItem={(member) => (
              <List.Item>
                <Space direction="vertical" align="center" style={{ width: '100%' }}>
                  <Avatar size={56}>{member.name.slice(0, 1).toUpperCase()}</Avatar>
                  <Text strong>{member.name}</Text>
                  <Text type="secondary">{member.role}</Text>
                </Space>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </PageContainer>
  );
}
