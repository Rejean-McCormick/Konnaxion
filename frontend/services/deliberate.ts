import { get, post, put, patch, del } from './_request'
import type { Topic } from '@/types'

/** GET /deliberate/elite/topics */
export async function fetchEliteTopics(): Promise<{
  list: (Topic & {
    createdAt: string
    lastActivity: string
    hot: boolean
  })[]
}> {
  return get('deliberate/elite/topics')
}

/** GET /deliberate/topics/:id/preview */
export async function fetchTopicPreview(id: string): Promise<{
  id: string
  title: string
  category: string
  createdAt: string
  latest: { id: string; author: string; body: string }[]
}> {
  return get(`deliberate/topics/${id}/preview`)
}

/** POST /deliberate/elite/topics */
export async function createEliteTopic(payload: {
  title: string
  category: string
}): Promise<{ id: string }> {
  return post('deliberate/elite/topics', payload)
}

/** GET /deliberate/topics/:id */
export async function fetchTopicDetail(id: string): Promise<{
  id: string
  title: string
  statements: { id: string; author: string; body: string; createdAt: string }[]
}> {
  return get(`deliberate/topics/${id}`)
}
