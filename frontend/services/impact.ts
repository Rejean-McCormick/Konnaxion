// FILE: frontend/services/impact.ts
// frontend/services/impact.ts
import dayjs from 'dayjs'
import { get, patch, post } from './_request'

export type ImpactStatus = 'Planned' | 'In-Progress' | 'Completed' | 'Blocked'

export interface TrackerItem {
  id: string
  title: string
  owner: string
  status: ImpactStatus
  updatedAt: string
}

export interface OutcomeKPI {
  key: string
  label: string
  value: number
  delta?: number
}

export interface ChartConfig {
  data: any[]
  xField: string
  yField: string
  seriesField?: string
  [key: string]: any
}

export interface OutcomeChart {
  key: string
  title: string
  type: 'line' | 'bar'
  config: ChartConfig
}

export interface FeedbackItem {
  id: string
  author: string
  body: string
  rating?: number
  createdAt: string
}

// ──────────────────────────────────────────────────────────
// Backend DTOs (Ethikos)
// ──────────────────────────────────────────────────────────

type TopicStatus = 'open' | 'closed' | 'archived'

interface EthikosTopicApi {
  id: number
  title: string
  status: TopicStatus
  created_by: string
  last_activity: string
  created_at: string
  category?: {
    id: number
    name: string
    description?: string
  } | null
  total_votes?: number | null
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
  created_at: string
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function topicStatusToImpactStatus(status: TopicStatus): ImpactStatus {
  switch (status) {
    case 'closed':
      return 'Completed'
    case 'archived':
      return 'Blocked'
    case 'open':
    default:
      return 'In-Progress'
  }
}

function impactStatusToTopicStatus(status: ImpactStatus): TopicStatus {
  switch (status) {
    case 'Completed':
      return 'closed'
    case 'Blocked':
      return 'archived'
    case 'Planned':
    case 'In-Progress':
    default:
      return 'open'
  }
}

interface DailyPoint {
  date: string
  value: number
}

function buildDailySeries<T>(
  items: T[],
  getDate: (item: T) => string,
  days = 30,
): DailyPoint[] {
  const now = dayjs()
  const start = now.startOf('day').subtract(days - 1, 'day')
  const counts: number[] = new Array<number>(days).fill(0)

  for (const item of items) {
    const rawDate = getDate(item)
    if (!rawDate) continue

    const d = dayjs(rawDate)
    if (!d.isValid() || d.isBefore(start) || d.isAfter(now)) continue

    const offset = d.startOf('day').diff(start, 'day')
    if (offset >= 0 && offset < days) {
      counts[offset] = (counts[offset] ?? 0) + 1
    }
  }

  const series: DailyPoint[] = []
  for (let i = 0; i < days; i += 1) {
    series.push({
      date: start.add(i, 'day').toISOString(),
      value: counts[i] ?? 0,
    })
  }
  return series
}

function percentDelta(series: DailyPoint[]): number | undefined {
  if (series.length < 2) return undefined

  const latest = series[series.length - 1]?.value
  const previous = series[series.length - 2]?.value

  if (latest === undefined || previous === undefined || previous === 0) {
    return undefined
  }

  return Math.round(((latest - previous) / previous) * 100)
}

// Feedback rating is persisted inside EthikosArgument.content because the
// current backend contract exposes `content` but no dedicated `rating` field.
const FEEDBACK_RATING_PREFIX = /^\[rating:([1-5])\]\s*/i

function encodeFeedbackBody(body: string, rating?: number): string {
  const normalized = body.trim()
  if (!normalized) return normalized

  if (typeof rating === 'number' && Number.isFinite(rating)) {
    const safeRating = Math.max(1, Math.min(5, Math.round(rating)))
    return `[rating:${safeRating}] ${normalized}`
  }

  return normalized
}

function decodeFeedbackContent(content: string): {
  body: string
  rating?: number
} {
  const raw = content ?? ''
  const match = raw.match(FEEDBACK_RATING_PREFIX)
  const ratingRaw = match?.[1]
  const rating = ratingRaw ? Number(ratingRaw) : undefined
  const body = raw.replace(FEEDBACK_RATING_PREFIX, '').trim()

  return {
    body,
    rating:
      typeof rating === 'number' && Number.isFinite(rating) ? rating : undefined,
  }
}

function compareDescByDate(a: string, b: string): number {
  return dayjs(b).valueOf() - dayjs(a).valueOf()
}

// ──────────────────────────────────────────────────────────
// Tracker: maps Ethikos topics → impact items
// ──────────────────────────────────────────────────────────

export async function fetchImpactTracker(): Promise<{ items: TrackerItem[] }> {
  const topics = await get<EthikosTopicApi[]>('ethikos/topics/')

  const items: TrackerItem[] = [...topics]
    .sort((a, b) => compareDescByDate(a.last_activity, b.last_activity))
    .map((topic) => ({
      id: String(topic.id),
      title: topic.title,
      owner: topic.created_by || 'Unknown',
      status: topicStatusToImpactStatus(topic.status),
      updatedAt: topic.last_activity,
    }))

  return { items }
}

export async function patchImpactStatus(
  id: string,
  status: ImpactStatus,
): Promise<void> {
  const topicStatus = impactStatusToTopicStatus(status)
  await patch(`ethikos/topics/${id}/`, { status: topicStatus })
}

// ──────────────────────────────────────────────────────────
// Outcomes: KPIs + charts from Ethikos topics + stances
// ──────────────────────────────────────────────────────────

export async function fetchImpactOutcomes(): Promise<{
  kpis: OutcomeKPI[]
  charts: OutcomeChart[]
}> {
  const [topics, stances] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
  ])

  const closedTopics = topics.filter((t) => t.status === 'closed')
  const openTopics = topics.filter((t) => t.status === 'open')

  const votesByTopic = new Map<number, { sum: number; count: number }>()
  for (const stance of stances) {
    const bucket = votesByTopic.get(stance.topic) ?? { sum: 0, count: 0 }
    bucket.sum += stance.value
    bucket.count += 1
    votesByTopic.set(stance.topic, bucket)
  }

  let agreementSum = 0
  let agreementCount = 0

  for (const topic of closedTopics) {
    const stats = votesByTopic.get(topic.id)
    if (!stats || stats.count === 0) continue

    agreementSum += stats.sum / (stats.count * 3)
    agreementCount += 1
  }

  const avgAgreement = agreementCount > 0 ? agreementSum / agreementCount : 0

  const topicsSeries = buildDailySeries(topics, (t) => t.created_at)
  const stancesSeries = buildDailySeries(stances, (s) => s.timestamp)

  const kpis: OutcomeKPI[] = [
    {
      key: 'resolved',
      label: 'Decisions resolved',
      value: closedTopics.length,
      delta: percentDelta(topicsSeries),
    },
    {
      key: 'participation',
      label: 'Total stances',
      value: stances.length,
      delta: percentDelta(stancesSeries),
    },
    {
      key: 'agreement',
      label: 'Average agreement',
      // avgAgreement ∈ [-1, 1] → [0, 100]
      value: Math.round((avgAgreement + 1) * 50),
    },
    {
      key: 'open',
      label: 'Open debates',
      value: openTopics.length,
    },
  ]

  const bucketByCategory = new Map<string, number>()
  for (const topic of topics) {
    const name = topic.category?.name?.trim() || 'Uncategorised'
    bucketByCategory.set(name, (bucketByCategory.get(name) ?? 0) + 1)
  }

  const topicStatusByCategory = Array.from(bucketByCategory.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value || a.category.localeCompare(b.category))

  const charts: OutcomeChart[] = [
    {
      key: 'participation-timeline',
      title: 'Participation over time',
      type: 'line',
      config: {
        data: stancesSeries,
        xField: 'date',
        yField: 'value',
        smooth: true,
      },
    },
    {
      key: 'topics-by-category',
      title: 'Topics by category',
      type: 'bar',
      config: {
        data: topicStatusByCategory,
        xField: 'category',
        yField: 'value',
        seriesField: 'category',
      },
    },
  ]

  return { kpis, charts }
}

// ──────────────────────────────────────────────────────────
// Feedback loop = arguments on a dedicated Ethikos topic
// ──────────────────────────────────────────────────────────

const FEEDBACK_TOPIC_ID_RAW = process.env.NEXT_PUBLIC_ETHIKOS_FEEDBACK_TOPIC_ID
const FEEDBACK_TOPIC_ID =
  FEEDBACK_TOPIC_ID_RAW && !Number.isNaN(Number(FEEDBACK_TOPIC_ID_RAW))
    ? Number(FEEDBACK_TOPIC_ID_RAW)
    : null

export async function fetchFeedback(): Promise<{ items: FeedbackItem[] }> {
  if (!FEEDBACK_TOPIC_ID) {
    return { items: [] }
  }

  const argumentsForTopic = await get<EthikosArgumentApi[]>('ethikos/arguments/', {
    params: { topic: FEEDBACK_TOPIC_ID },
  })

  const items: FeedbackItem[] = argumentsForTopic
    .map((arg) => {
      const parsed = decodeFeedbackContent(arg.content)

      return {
        id: String(arg.id),
        author: arg.user,
        body: parsed.body,
        rating: parsed.rating,
        createdAt: arg.created_at,
      }
    })
    .sort((a, b) => compareDescByDate(a.createdAt, b.createdAt))

  return { items }
}

export async function submitFeedback(payload: {
  body: string
  rating?: number
}): Promise<void> {
  if (!FEEDBACK_TOPIC_ID) {
    throw new Error(
      'NEXT_PUBLIC_ETHIKOS_FEEDBACK_TOPIC_ID is not set; cannot store feedback.',
    )
  }

  const content = encodeFeedbackBody(payload.body, payload.rating)

  if (!content) {
    throw new Error('Feedback body cannot be empty.')
  }

  await post('ethikos/arguments/', {
    topic: FEEDBACK_TOPIC_ID,
    content,
  })
}