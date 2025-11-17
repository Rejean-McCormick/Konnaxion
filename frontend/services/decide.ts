// frontend/services/decide.ts
import dayjs from 'dayjs'
import { get, post } from './_request'
import type { Ballot } from '@/types'

export type DecisionScope = 'Elite' | 'Public'

export type EliteBallot = Ballot & {
  scope: 'Elite'
  turnout: number
}

export type PublicBallot = Ballot & {
  scope: 'Public'
  options: string[]
  turnout: number
}

export interface EliteBallotResponse {
  ballots: EliteBallot[]
}

export interface PublicBallotResponse {
  ballots: PublicBallot[]
}

export interface DecisionResult {
  id: string
  title: string
  scope: DecisionScope
  passed: boolean
  closesAt: string
  region?: string
}

export interface DecisionResultsResponse {
  items: DecisionResult[]
}

// ──────────────────────────────────────────────────────────
// Backend DTOs (Ethikos)
// ──────────────────────────────────────────────────────────

type TopicStatus = 'open' | 'closed' | 'archived'

interface EthikosCategoryApi {
  id: number
  name: string
  description?: string
}

interface EthikosTopicApi {
  id: number
  title: string
  description: string
  status: TopicStatus
  total_votes?: number | null
  last_activity: string
  created_at: string
  category: EthikosCategoryApi
  expertise_category?: number | null
}

interface EthikosStanceApi {
  id: number
  topic: number
  value: number
  timestamp: string
  user: string
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

const PUBLIC_SCALE_OPTIONS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
]

function computeClosesAt(topic: EthikosTopicApi): string {
  const created = dayjs(topic.created_at)
  if (topic.status === 'open') {
    // Simple heuristic: debates stay open 7 days after creation
    return created.add(7, 'day').toISOString()
  }
  // For closed / archived debates, treat last activity as closing time
  return dayjs(topic.last_activity).toISOString()
}

function normalizeTurnout(totalVotes?: number | null): number {
  const n = typeof totalVotes === 'number' ? totalVotes : 0
  // Clamp to [0, 100]; 1 vote = 1% is enough for initial UX
  return Math.max(0, Math.min(100, n))
}

function topicScope(topic: EthikosTopicApi): DecisionScope {
  return topic.expertise_category ? 'Elite' : 'Public'
}

function toEliteBallot(topic: EthikosTopicApi): EliteBallot {
  return {
    id: String(topic.id),
    title: topic.title,
    closesAt: computeClosesAt(topic),
    scope: 'Elite',
    turnout: normalizeTurnout(topic.total_votes),
  }
}

function toPublicBallot(topic: EthikosTopicApi): PublicBallot {
  return {
    id: String(topic.id),
    title: topic.title,
    closesAt: computeClosesAt(topic),
    scope: 'Public',
    options: PUBLIC_SCALE_OPTIONS,
    turnout: normalizeTurnout(topic.total_votes),
  }
}

function mapOptionToValue(option: string): number {
  const normalized = option.toLowerCase()
  if (normalized.startsWith('strongly disagree')) return -3
  if (normalized.startsWith('disagree')) return -1
  if (normalized.startsWith('neutral')) return 0
  if (normalized.startsWith('strongly agree')) return 3
  if (normalized.startsWith('agree')) return 1
  // Fallback when custom labels are used
  return 0
}

// ──────────────────────────────────────────────────────────
/** Elite ballots = Ethikos topics with an expertise_category (status=open). */
// ──────────────────────────────────────────────────────────
export async function fetchEliteBallots(): Promise<EliteBallotResponse> {
  const topics = await get<EthikosTopicApi[]>('ethikos/topics/', {
    params: { status: 'open' },
  })

  const elite = topics.filter((t) => t.expertise_category != null)

  return {
    ballots: elite.map(toEliteBallot),
  }
}

// ──────────────────────────────────────────────────────────
/** Public ballots = topics without expertise_category (status=open). */
// ──────────────────────────────────────────────────────────
export async function fetchPublicBallots(): Promise<PublicBallotResponse> {
  const topics = await get<EthikosTopicApi[]>('ethikos/topics/', {
    params: { status: 'open' },
  })

  const publicTopics = topics.filter((t) => !t.expertise_category)

  return {
    ballots: publicTopics.map(toPublicBallot),
  }
}

// ──────────────────────────────────────────────────────────
/** Records a stance for the current user via /api/ethikos/stances/. */
// ──────────────────────────────────────────────────────────
export async function submitPublicVote(
  id: string,
  option: string,
): Promise<{ ok: true }> {
  const topicId = Number(id)
  if (!Number.isFinite(topicId)) {
    throw new Error(`Invalid topic id: ${id}`)
  }

  const value = mapOptionToValue(option)

  await post('ethikos/stances/', {
    topic: topicId,
    value,
  })

  return { ok: true }
}

// ──────────────────────────────────────────────────────────
/** Decision results = closed topics + stance direction from /ethikos/stances/. */
// ──────────────────────────────────────────────────────────
export async function fetchDecisionResults(): Promise<DecisionResultsResponse> {
  const [topics, stances] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/', {
      params: { status: 'closed' },
    }),
    get<EthikosStanceApi[]>('ethikos/stances/'),
  ])

  const byTopic = new Map<number, { sum: number; count: number }>()
  for (const stance of stances) {
    const bucket = byTopic.get(stance.topic) ?? { sum: 0, count: 0 }
    bucket.sum += stance.value
    bucket.count += 1
    byTopic.set(stance.topic, bucket)
  }

  const items: DecisionResult[] = topics.map((topic) => {
    const stats = byTopic.get(topic.id)
    const avg = stats && stats.count > 0 ? stats.sum / stats.count : 0
    const passed = avg >= 0

    return {
      id: String(topic.id),
      title: topic.title,
      scope: topicScope(topic),
      passed,
      closesAt: computeClosesAt(topic),
      region: topic.category?.name,
    }
  })

  return { items }
}
