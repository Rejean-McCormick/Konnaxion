'use client';

import React, { useMemo, useState } from 'react';
import { Card, Steps, Progress, Button, Typography, Empty } from 'antd';
import { useRouter } from 'next/navigation';

const { Title, Paragraph } = Typography;
const { Step } = Steps;

type Lesson = { id: string; name: string; completed: boolean; href?: string };
type LearningPath = {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
};

const initialLearningPath: LearningPath = {
  id: '1',
  title: 'Beginner Web Development',
  description:
    'A comprehensive path to learn web development from scratch. You will start with HTML and CSS and move on to JavaScript and modern frameworks.',
  lessons: [
    { id: '1', name: 'HTML Basics', completed: true },
    { id: '2', name: 'CSS Fundamentals', completed: true },
    { id: '3', name: 'Introduction to JavaScript', completed: false },
    { id: '4', name: 'Responsive Design', completed: false },
    { id: '5', name: 'Basic React', completed: false },
  ],
};

export default function Page() {
  const router = useRouter();
  const [learningPath] = useState<LearningPath | null>(initialLearningPath);

  const progress = useMemo(() => {
    if (!learningPath) return 0;
    const total = learningPath.lessons.length || 1;
    const done = learningPath.lessons.filter((l) => l.completed).length;
    return Math.round((done / total) * 100);
  }, [learningPath]);

  const firstIncompleteIndex = useMemo(() => {
    if (!learningPath) return -1;
    return learningPath.lessons.findIndex((l) => !l.completed);
  }, [learningPath]);

  const nextLesson = useMemo<Lesson | null>(() => {
    if (!learningPath) return null;
    if (firstIncompleteIndex < 0) return null;
    return learningPath.lessons[firstIncompleteIndex] ?? null;
  }, [learningPath, firstIncompleteIndex]);

  const goToLesson = (lessonId: string, href?: string) => {
    router.push(href ?? `/konnected/learning-library/lesson/${lessonId}`);
  };

  if (!learningPath) {
    return (
      <div className="container mx-auto p-5">
        <Title level={2}>My Learning Path</Title>
        <Empty description="You are not enrolled in any learning path yet. Explore our available learning paths to get started." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-5">
      <Title level={2}>My Learning Path</Title>

      <Card className="mb-4">
        <Title level={4}>{learningPath.title}</Title>
        <Paragraph>{learningPath.description}</Paragraph>
      </Card>

      <Card className="mb-4">
        <Title level={5}>Overall Progress</Title>
        <Progress percent={progress} status="active" />
        {nextLesson && (
          <div style={{ marginTop: 12 }}>
            <Button
              type="primary"
              onClick={() => {
                if (!nextLesson) return;
                goToLesson(nextLesson.id, nextLesson.href);
              }}
            >
              Continue where you left off
            </Button>
          </div>
        )}
      </Card>

      <Card>
        <Title level={5}>Your Lessons</Title>
        <Steps direction="vertical" current={Math.max(firstIncompleteIndex, 0)}>
          {learningPath.lessons.map((lesson, index) => (
            <Step
              key={lesson.id}
              title={lesson.name}
              status={
                lesson.completed
                  ? 'finish'
                  : index === firstIncompleteIndex
                  ? 'process'
                  : 'wait'
              }
              description={
                <Button type="link" onClick={() => goToLesson(lesson.id, lesson.href)}>
                  Go to Lesson
                </Button>
              }
            />
          ))}
        </Steps>
      </Card>
    </div>
  );
}
