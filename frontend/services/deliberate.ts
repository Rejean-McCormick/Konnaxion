// FILE: frontend/services/deliberate.ts
import { get, post } from './_request'
import type { Topic } from '@/types'

/* ------------------------------------------------------------------ */
/*  Backend DTOs (canonical Ethikos API)                              */
/* ------------------------------------------------------------------ */

type TopicStatus = 'open' | 'closed' | 'archived'

interface EthikosCategoryApi {
  id: number
  name: string
  description?: string | null
}

interface EthikosTopicApi {
  id: number
  title: string
  description: string
  category: EthikosCategoryApi | null
  expertise_category?: number | null
  status: TopicStatus
  total_votes?: number | null
  created_by?: string
  last_activity: string
  created_at: string
}

interface EthikosStanceApi {
  id: number
  topic: number
  value: number
  timestamp: string
}

interface EthikosArgumentApi {
  id: number
  topic: number
  user: string
  content: string
  parent?: number | null
  side?: 'pro' | 'con' | null
  created_at: string
}

/* ------------------------------------------------------------------ */
/*  Exported types (reused by pages/modules)                           */
/* ------------------------------------------------------------------ */

export type EliteTopic = Topic & {
  createdAt: string
  lastActivity: string
  hot: boolean
  /** Normalized locally from stances */
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

export type CreateEliteTopicPayload = {
  title: string
  /**
   * Current UI still sends a category name string.
   * Accepting number too makes the service future-proof for category_id.
   */
  category: string | number
  /**
   * TODO: the UI should collect a real description.
   * For now we fall back to the title so the current modal can still create topics.
   */
  description?: string
  /**
   * Optional future hook for expert-only topics.
   * Not wired by the current page yet.
   */
  expertiseCategoryId?: number | null
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function assertTopicId(id: string): number {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error(`Invalid topic id: ${id}`)
  }
  return numericId
}

function categoryName(topic: EthikosTopicApi): string {
  return topic.category?.name ?? 'Uncategorised'
}

function byDateDesc<T>(items: T[], getDate: (item: T) => string): T[] {
  return [...items].sort(
    (a, b) => Date.parse(getDate(b)) - Date.parse(getDate(a)),
  )
}

function byDateAsc<T>(items: T[], getDate: (item: T) => string): T[] {
  return [...items].sort(
    (a, b) => Date.parse(getDate(a)) - Date.parse(getDate(b)),
  )
}

function isHot(lastActivity: string, stanceCount: number): boolean {
  const last = Date.parse(lastActivity)
  const ageMs = Number.isNaN(last) ? Number.POSITIVE_INFINITY : Date.now() - last
  const within72h = ageMs <= 72 * 60 * 60 * 1000
  return within72h || stanceCount >= 5
}

function toEliteTopic(
  topic: EthikosTopicApi,
  stanceCount: number,
): EliteTopic {
  return {
    id: String(topic.id),
    title: topic.title,
    category: categoryName(topic),
    createdAt: topic.created_at,
    lastActivity: topic.last_activity,
    hot: isHot(topic.last_activity, stanceCount),
    stanceCount,
  } as EliteTopic
}

async function resolveCategoryId(category: string | number): Promise<number> {
  if (typeof category === 'number' && Number.isFinite(category)) {
    return category
  }

  const raw = String(category).trim()
  const numeric = Number(raw)
  if (Number.isFinite(numeric) && raw !== '') {
    return numeric
  }

  const categories = await get<EthikosCategoryApi[]>('ethikos/categories/')
  const match = categories.find(
    (c) => c.name.trim().toLowerCase() === raw.toLowerCase(),
  )

  if (!match) {
    throw new Error(`Unknown Ethikos category: ${raw}`)
  }

  return match.id
}

/* ------------------------------------------------------------------ */
/*  API calls                                                          */
/* ------------------------------------------------------------------ */

/**
 * Lists Ethikos topics and adapts them to the Elite UI shape.
 * We derive stanceCount locally because the topic serializer does not expose it.
 */
export async function fetchEliteTopics(): Promise<EliteTopicsResponse> {
  const [topics, stances] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
  ])

  const stanceCountByTopic = new Map<number, number>()
  for (const stance of stances) {
    stanceCountByTopic.set(
      stance.topic,
      (stanceCountByTopic.get(stance.topic) ?? 0) + 1,
    )
  }

  const list = byDateDesc(topics, (t) => t.last_activity).map((topic) =>
    toEliteTopic(topic, stanceCountByTopic.get(topic.id) ?? 0),
  )

  return { list }
}

/**
 * Preview = topic metadata + a short "latest statements" slice.
 */
export async function fetchTopicPreview(
  id: string,
): Promise<TopicPreviewResponse> {
  const topicId = assertTopicId(id)

  const [topic, args] = await Promise.all([
    get<EthikosTopicApi>(`ethikos/topics/${topicId}/`),
    get<EthikosArgumentApi[]>('ethikos/arguments/', {
      params: { topic: topicId },
    }),
  ])

  const latest = byDateDesc(args, (a) => a.created_at)
    .slice(0, 3)
    .map((arg) => ({
      id: String(arg.id),
      author: arg.user,
      body: arg.content,
    }))

  return {
    id: String(topic.id),
    title: topic.title,
    category: categoryName(topic),
    createdAt: topic.created_at,
    latest,
  }
}

/**
 * Topic creation must go through the canonical Ethikos topic endpoint.
 * Backend accepts category/category_id, not a category label string.
 */
export async function createEliteTopic(
  payload: CreateEliteTopicPayload,
): Promise<{ id: string }> {
  const title = payload.title.trim()
  if (!title) {
    throw new Error('Title is required')
  }

  const categoryId = await resolveCategoryId(payload.category)

  const created = await post<EthikosTopicApi>('ethikos/topics/', {
    title,
    description: payload.description?.trim() || title,
    category_id: categoryId,
    ...(payload.expertiseCategoryId != null
      ? { expertise_category: payload.expertiseCategoryId }
      : {}),
  })

  return { id: String(created.id) }
}

/**
 * Detail = topic metadata + full statements thread.
 */
export async function fetchTopicDetail(
  id: string,
): Promise<TopicDetailResponse> {
  const topicId = assertTopicId(id)

  const [topic, args] = await Promise.all([
    get<EthikosTopicApi>(`ethikos/topics/${topicId}/`),
    get<EthikosArgumentApi[]>('ethikos/arguments/', {
      params: { topic: topicId },
    }),
  ])

  const statements = byDateAsc(args, (a) => a.created_at).map((arg) => ({
    id: String(arg.id),
    author: arg.user,
    body: arg.content,
    createdAt: arg.created_at,
  }))

  return {
    id: String(topic.id),
    title: topic.title,
    statements,
  }
}