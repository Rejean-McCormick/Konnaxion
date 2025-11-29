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
  category: { id: number; name: string; description?: string }
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
    const d = dayjs(getDate(item))
    if (d.isBefore(start) || d.isAfter(now)) continue
    const offset = d.startOf('day').diff(start, 'day')
    if (offset >= 0 && offset < days) {
      const current = counts[offset] ?? 0
      counts[offset] = current + 1
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

// ──────────────────────────────────────────────────────────
// Tracker: maps Ethikos topics → impact items
// ──────────────────────────────────────────────────────────

export async function fetchImpactTracker(): Promise<{ items: TrackerItem[] }> {
  const topics = await get<EthikosTopicApi[]>('ethikos/topics/')

  const items: TrackerItem[] = topics.map((topic) => ({
    id: String(topic.id),
    title: topic.title,
    owner: topic.created_by,
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

  const closedWithStats = closedTopics.map((t) => votesByTopic.get(t.id))
  const avgAgreement =
    closedWithStats.length > 0
      ? closedWithStats.reduce((acc, s) => {
          if (!s || s.count === 0) return acc
          return acc + s.sum / (s.count * 3)
        }, 0) / closedWithStats.length
      : 0

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

  const topicStatusByCategory: { category: string; value: number }[] = []
  const bucketByCategory = new Map<string, number>()
  for (const topic of topics) {
    const name = topic.category?.name ?? 'Uncategorised'
    const current = bucketByCategory.get(name) ?? 0
    bucketByCategory.set(name, current + 1)
  }
  bucketByCategory.forEach((value, category) => {
    topicStatusByCategory.push({ category, value })
  })

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

const FEEDBACK_TOPIC_ID = process.env.NEXT_PUBLIC_ETHIKOS_FEEDBACK_TOPIC_ID

export async function fetchFeedback(): Promise<{ items: FeedbackItem[] }> {
  if (!FEEDBACK_TOPIC_ID) {
    // No dedicated topic configured yet – return an empty list.
    return { items: [] }
  }

  const argumentsForTopic = await get<EthikosArgumentApi[]>('ethikos/arguments/', {
    params: { topic: FEEDBACK_TOPIC_ID },
  })

  const items: FeedbackItem[] = argumentsForTopic.map((arg) => ({
    id: String(arg.id),
    author: arg.user,
    body: arg.content,
    createdAt: arg.created_at,
  }))

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

  await post('ethikos/arguments/', {
    topic: Number(FEEDBACK_TOPIC_ID),
    content: payload.body,
  })
}
