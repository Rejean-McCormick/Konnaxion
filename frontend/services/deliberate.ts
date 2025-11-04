// services/deliberate.ts
import apiRequest from './_request';
import type { Topic } from '@/types';

/* ------------------------------------------------------------------ *
 * 1 · Elite topics list                                               *
 * ------------------------------------------------------------------ */
export async function fetchEliteTopics(): Promise<{
  list: (Topic & {
    createdAt: string;
    lastActivity: string;
    hot: boolean;
  })[];
}> {
  return apiRequest.get('deliberate/elite/topics');
}

/* ------------------------------------------------------------------ *
 * 2 · Drawer preview                                                  *
 * ------------------------------------------------------------------ */
export async function fetchTopicPreview(id: string): Promise<{
  id: string;
  title: string;
  category: string;
  createdAt: string;
  latest: { id: string; author: string; body: string }[];
}> {
  return apiRequest.get(`deliberate/topics/${id}/preview`);
}

/* ------------------------------------------------------------------ *
 * 3 · Create a new elite topic                                        *
 * ------------------------------------------------------------------ */
export async function createEliteTopic(payload: {
  title: string;
  category: string;
}) {
  return apiRequest.post('deliberate/elite/topics', payload);
}

/* ------------------------------------------------------------------ *
 * 4 · Topic details                                                   *
 * ------------------------------------------------------------------ */
export async function fetchTopicDetail(id: string): Promise<{
  id: string;
  title: string;
  statements: { id: string; author: string; body: string; createdAt: string }[];
}> {
  return apiRequest.get(`deliberate/topics/${id}`);
}
