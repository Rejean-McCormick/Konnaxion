// C:\MyCode\Konnaxionv14\frontend\app\konnected\learning-library\recommended-resources\page.tsx
'use client';

import React, { useState } from 'react';
import { List, Card, Button, Typography, Divider } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

type Resource = {
  key: string;
  title: string;
  summary: string;
  recommendationNote: string;
};

// Simulated recommended resources
const INITIAL_RESOURCES: Resource[] = [
  {
    key: '1',
    title: 'Advanced AI Techniques',
    summary:
      'Learn about deep learning, neural networks, and advanced AI strategies.',
    recommendationNote:
      'Recommended because you liked "Machine Learning Fundamentals".',
  },
  {
    key: '2',
    title: 'Introduction to Robotics',
    summary:
      'A beginner-friendly introduction covering the basics of robotics.',
    recommendationNote: 'Recommended based on your interest in Robotics.',
  },
  {
    key: '3',
    title: 'Innovative Design Trends',
    summary:
      'Discover the latest trends and methodologies in creative design.',
    recommendationNote:
      'Recommended because of your past searches in Design.',
  },
  {
    key: '4',
    title: 'Effective Data Analysis',
    summary:
      'A comprehensive guide to data analytics using modern tools.',
    recommendationNote:
      'Recommended due to your high rating on data science resources.',
  },
];

export default function RecommendedResources() {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(INITIAL_RESOURCES);

  // Simulate refreshing suggestions
  const refreshSuggestions = () => {
    setResources(prev => [...prev].sort(() => Math.random() - 0.5));
  };

  return (
    <div className="container" style={{ padding: 16 }}>
      <Title level={2}>Recommended Resources</Title>
      <Paragraph>
        Explore a curated list of resources tailored to your interests and
        learning path.
      </Paragraph>
      <Divider />

      <Button
        type="default"
        icon={<ReloadOutlined />}
        onClick={refreshSuggestions}
        style={{ marginBottom: 16 }}
      >
        Refresh Suggestions
      </Button>

      <List<Resource>
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
        dataSource={resources}
        renderItem={(resource) => (
          <List.Item key={resource.key}>
            <Card
              hoverable
              title={resource.title}
              extra={
                <Button
                  type="link"
                  onClick={() =>
                    router.push(
                      `/konnected/learning-library/resource/${resource.key}`,
                    )
                  }
                >
                  View Resource
                </Button>
              }
            >
              <Paragraph>{resource.summary}</Paragraph>
              <Paragraph style={{ fontStyle: 'italic', fontSize: 12, marginBottom: 0 }}>
                <Text type="secondary">{resource.recommendationNote}</Text>
              </Paragraph>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
}
