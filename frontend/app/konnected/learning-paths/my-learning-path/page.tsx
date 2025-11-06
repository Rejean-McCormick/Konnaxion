'use client'

// pages/konnected/learning-paths/my-learning-path/index.tsx
import React, { useState } from 'react';
import Head from 'next/head';
import type { NextPage } from 'next';
import { Card, Steps, Progress, Button, Typography, Empty } from 'antd';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout-components/MainLayout';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

interface Lesson {
  id: string;
  name: string;
  completed: boolean;
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  progress: number;
  lessons: Lesson[];
}

// Exemple de données simulées pour un parcours d'apprentissage
const sampleLearningPath: LearningPath = {
  id: '1',
  title: 'Beginner Web Development',
  description: 'A comprehensive path to learn web development from scratch. You will start with HTML and CSS and move on to JavaScript and modern frameworks.',
  progress: 40,  // Pourcentage de progression
  lessons: [
    { id: '1', name: 'HTML Basics', completed: true },
    { id: '2', name: 'CSS Fundamentals', completed: true },
    { id: '3', name: 'Introduction to JavaScript', completed: false },
    { id: '4', name: 'Responsive Design', completed: false },
    { id: '5', name: 'Basic React', completed: false },
  ],

const MyLearningPath: NextPage & { getLayout?: (page: React.ReactElement) => React.ReactNode } = () => {
  const router = useRouter();
  // Dans cet exemple, nous partons du principe que l'utilisateur suit un parcours,
  // sinon, on pourra passer learningPath à null pour afficher un message d'invitation.
  const [learningPath] = useState<LearningPath | null>(sampleLearningPath);

  // Fonction pour naviguer vers la leçon sélectionnée
  const goToLesson = (lessonId: string) => {
    router.push(`/konnected/learning-library/lesson/${lessonId}`);

  return (
    <>
      <Head>
        <title>My Learning Path</title>
        <meta name="description" content="View your current learning path and track your progress." />
      </Head>
      <div className="container mx-auto p-5">
        <Title level={2}>My Learning Path</Title>
        {learningPath ? (
          <>
            {/* Informations générales sur le parcours */}
            <Card className="mb-4">
              <Title level={4}>{learningPath.title}</Title>
              <Paragraph>{learningPath.description}</Paragraph>
            </Card>

            {/* Progression globale */}
            <Card className="mb-4">
              <Title level={5}>Overall Progress</Title>
              <Progress percent={learningPath.progress} status="active" />
            </Card>

            {/* Liste des modules/leçons du parcours */}
            <Card>
              <Title level={5}>Your Lessons</Title>
              <Steps direction="vertical">
                {learningPath.lessons.map((lesson, index) => (
                  <Step
                    key={lesson.id}
                    title={lesson.name}
                    status={lesson.completed ? 'finish' : (index === learningPath.lessons.findIndex(l => !l.completed) ? 'process' : 'wait')}
                    description={
                      <Button type="link" onClick={() => goToLesson(lesson.id)}>
                        Go to Lesson
                      </Button>
                    }
                  />
                ))}
              </Steps>
            </Card>
          </>
        ) : (
          <Empty description="You are not enrolled in any learning path yet. Explore our available learning paths to get started." />
        )}
      </div>
    </>
  );



export default MyLearningPath;
