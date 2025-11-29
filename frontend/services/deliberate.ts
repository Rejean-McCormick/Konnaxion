// FILE: frontend/services/deliberate.ts
// services/deliberate.ts
import { get, post } from './_request'
import type { Topic } from '@/types'

/* ------------------------------------------------------------------ */
/*  Exported types (reused by pages/modules)                           */
/* ------------------------------------------------------------------ */

export type EliteTopic = Topic & {
  createdAt: string
  lastActivity: string
  hot: boolean
  /** May or may not be present in the payload; normalized in the UI */
  stanceCount?: number
}

export type EliteTopicsResponse = {
  list: EliteTopic[]
}

export type TopicPreviewResponse = {
  id: string
  title: string
  category: string
  createdAt: string
  latest: { id: string; author: string; body: string }[]
}

export type TopicDetailResponse = {
  id: string
  title: string
  statements: { id: string; author: string; body: string; createdAt: string }[]
}

/* ------------------------------------------------------------------ */
/*  API calls                                                          */
/* ------------------------------------------------------------------ */

/** GET /deliberate/elite/topics */
export async function fetchEliteTopics(): Promise<EliteTopicsResponse> {
  return get<EliteTopicsResponse>('deliberate/elite/topics')
}

/** GET /deliberate/topics/:id/preview */
export async function fetchTopicPreview(id: string): Promise<TopicPreviewResponse> {
  return get<TopicPreviewResponse>(`deliberate/topics/${id}/preview`)
}

/** POST /deliberate/elite/topics */
export async function createEliteTopic(payload: {
  title: string
  category: string
}): Promise<{ id: string }> {
  return post<{ id: string }>('deliberate/elite/topics', payload)
}

/** GET /deliberate/topics/:id */
export async function fetchTopicDetail(id: string): Promise<TopicDetailResponse> {
  return get<TopicDetailResponse>(`deliberate/topics/${id}`)
}
