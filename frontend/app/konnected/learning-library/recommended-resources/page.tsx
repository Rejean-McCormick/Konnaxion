'use client'

// pages/konnected/learning-library/recommended-resources/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { List, Card, Button, Typography, Divider } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import MainLayout from '@/components/layout-components/MainLayout';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;

interface Resource {
  key: string;
  title: string;
  summary: string;
  recommendationNote: string;
}

// Exemple de données simulées pour les ressources recommandées
const initialRecommendedResources: Resource[] = [
  {
    key: '1',
    title: 'Advanced AI Techniques',
    summary: 'Learn about deep learning, neural networks, and advanced AI strategies.',
    recommendationNote: 'Recommended because you liked "Machine Learning Fundamentals".',
  },
  {
    key: '2',
    title: 'Introduction to Robotics',
    summary: 'A beginner-friendly introduction covering the basics of robotics.',
    recommendationNote: 'Recommended based on your interest in Robotics.',
  },
  {
    key: '3',
    title: 'Innovative Design Trends',
    summary: 'Discover the latest trends and methodologies in creative design.',
    recommendationNote: 'Recommended because of your past searches in Design.',
  },
  {
    key: '4',
    title: 'Effective Data Analysis',
    summary: 'A comprehensive guide to data analytics using modern tools.',
    recommendationNote: 'Recommended due to your high rating on data science resources.',
  },
];

const RecommendedResources = () => {
  const router = useRouter();
  const [resources, setResources] = useState<Resource[]>(initialRecommendedResources);

  // Simuler le rafraîchissement des suggestions
  const refreshSuggestions = () => {
    // Ici vous pourriez appeler une API de recommandation
    // Pour la simulation, nous changeons l'ordre des ressources aléatoirement
    const shuffled = [...resources].sort(() => Math.random() - 0.5);
    setResources(shuffled);

  return (
    <>
      <Head>
        <title>Recommended Resources</title>
        <meta name="description" content="Personalized recommendations based on your profile and past activity in the learning library." />
      </Head>
      <div className="container mx-auto p-5">
        {/* En-tête de page */}
        <Title level={2}>Recommended Resources</Title>
        <Paragraph>
          Explore a curated list of resources tailored to your interests and learning path.
        </Paragraph>
        <Divider />

        {/* Bouton pour rafraîchir les suggestions */}
        <Button type="default" icon={<ReloadOutlined />} onClick={refreshSuggestions} className="mb-4">
          Refresh Suggestions
        </Button>

        {/* Liste des ressources recommandées */}
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3 }}
          dataSource={resources ?? []}
          renderItem={(resource) => (
            <List.Item key={resource.key}>
              <Card
                hoverable
                title={resource.title}
                extra={
                  <Button type="link" onClick={() => router.push(`/konnected/learning-library/resource/${resource.key}`)}>
                    View Resource
                  </Button>
                }
              >
                <Paragraph>{resource.summary}</Paragraph>
                <Paragraph type="secondary" style={{ fontStyle: 'italic', fontSize: 12 }}>
                  {resource.recommendationNote}
                </Paragraph>
              </Card>
            </List.Item>
          )}
        />
      </div>
    </>
  );



export default RecommendedResources;
}}
