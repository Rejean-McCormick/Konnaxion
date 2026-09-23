// FILE: frontend/app/kreative/idea-incubator/my-ideas/page.tsx
// C:\MyCode\Konnaxionv14\frontend\app\kreative\idea-incubator\my-ideas\page.tsx
'use client';

import { useLanguage } from '@/context/LanguageContext';
import { Alert, Badge, Button, Input, List, Select, Space, Typography } from 'antd';
import React, { useMemo, useState } from 'react';

import KreativePageShell from '@/app/kreative/kreativePageShell';

const { Title, Text } = Typography;

type IdeaStatus = 'Seeking Collaboration' | 'In Progress';
type StatusFilter = 'All' | IdeaStatus;

interface Idea {
  id: string;
  title: string;
  status: IdeaStatus;
  dateCreated: string; // YYYY-MM-DD
  newActivity: boolean;
}

const PREVIEW_IDEAS: Idea[] = [
  {
    id: '1',
    title: 'Revolutionary App Concept',
    status: 'Seeking Collaboration',
    dateCreated: '2025-11-20',
    newActivity: true,
  },
  {
    id: '2',
    title: 'Sustainable Energy Initiative',
    status: 'In Progress',
    dateCreated: '2025-10-15',
    newActivity: false,
  },
  {
    id: '3',
    title: 'Urban Gardening Project',
    status: 'Seeking Collaboration',
    dateCreated: '2025-11-01',
    newActivity: true,
  },
];

export default function MyIdeasPage(): JSX.Element {
  const { t: i18nT } = useLanguage();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('All');

  const filteredIdeas = useMemo<Idea[]>(() => {
    let ideas = PREVIEW_IDEAS;
    if (selectedStatus !== 'All') {
      ideas = ideas.filter((idea) => idea.status === selectedStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      ideas = ideas.filter((idea) => idea.title.toLowerCase().includes(q));
    }
    return ideas;
  }, [searchQuery, selectedStatus]);

  return (
    <KreativePageShell
      title={i18nT("ui.kreative.ideaIncubator.myIdeas.myIdeas")}
      subtitle={i18nT("ui.kreative.ideaIncubator.myIdeas.browseAndManageYourCreativeIdeasIn")}
    >
      <Alert
        type="info"
        showIcon
        message={i18nT("ui.kreative.ideaIncubator.myIdeas.ideaIncubatorPreview")}
        description={i18nT("ui.kreative.ideaIncubator.myIdeas.thisSurfaceUsesADeclaredPreviewDataset")}
        style={{ marginBottom: 16 }}
      />
      <Space
        direction="vertical"
        size="middle"
        style={{ width: '100%', marginBottom: 24 }}
      >
        <Space>
          <Input
            placeholder={i18nT("ui.kreative.ideaIncubator.myIdeas.searchByTitle")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
          <Select<StatusFilter>
            value={selectedStatus}
            onChange={(value) => setSelectedStatus(value)}
            style={{ width: 220 }}
            options={[
              { value: 'All', label: i18nT("ui.kreative.ideaIncubator.myIdeas.allStatus") },
              { value: 'Seeking Collaboration', label: i18nT("ui.kreative.ideaIncubator.myIdeas.seekingCollaboration") },
              { value: 'In Progress', label: i18nT("ui.kreative.ideaIncubator.myIdeas.inProgress") },
            ]}
          />
        </Space>
      </Space>

      <List<Idea>
        itemLayout="vertical"
        dataSource={filteredIdeas}
        renderItem={(idea) => (
          <List.Item
            key={idea.id}
            actions={[
              <Button key="edit" type="primary" disabled>
                {i18nT("ui.kreative.ideaIncubator.myIdeas.editUnavailable")}
              </Button>,
              <Button key="view" disabled>
                {i18nT("ui.kreative.ideaIncubator.myIdeas.viewPreview")}
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  {idea.newActivity && (
                    <Badge
                      count="New"
                      style={{ backgroundColor: '#52c41a' }}
                    />
                  )}
                  <Title level={4} style={{ margin: 0 }}>
                    {idea.title}
                  </Title>
                </Space>
              }
              description={
                <>
                  <Text type="secondary">{i18nT("ui.kreative.ideaIncubator.myIdeas.status")} {idea.status}</Text>
                  <br />
                  <Text type="secondary">
                    {i18nT("ui.kreative.ideaIncubator.myIdeas.createdOn")} {idea.dateCreated}
                  </Text>
                </>
              }
            />
          </List.Item>
        )}
      />
    </KreativePageShell>
  );
}
