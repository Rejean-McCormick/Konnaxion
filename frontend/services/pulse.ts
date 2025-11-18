// frontend/services/pulse.ts
import dayjs from 'dayjs'
import { get } from './_request'
import type { KPI } from '@/types'

export interface KPIWithHistory extends KPI {
  history: { date: string; value: number }[]
}

export interface LiveCounter {
  label: string
  value: number
  trend?: number
  history: { ts: number; value: number }[]
}

export interface TrendChart {
  key: string
  title: string
  type: 'line' | 'area' | 'heatmap'
  config: any
}

export interface HealthSummary {
  refreshedAt: string
  radarConfig: any
  pieConfig: any
}

// ──────────────────────────────────────────────────────────
// Backend DTOs
// ──────────────────────────────────────────────────────────

type TopicStatus = 'open' | 'closed' | 'archived'

interface EthikosTopicApi {
  id: number
  title: string
  status: TopicStatus
  total_votes?: number | null
  created_at: string
  last_activity: string
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

interface VoteApi {
  id: number
  user: string
  target_type: string
  target_id: number
  raw_value: string | number
  weighted_value: string | number
  voted_at: string
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

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

  const latestPoint = series[series.length - 1]
  const previousPoint = series[series.length - 2]
  if (!latestPoint || !previousPoint) return undefined

  const latest = latestPoint.value
  const previous = previousPoint.value
  if (previous === 0) return undefined

  return Math.round(((latest - previous) / previous) * 100)
}

function buildStanceHeatmap(stances: EthikosStanceApi[]) {
  const bucket = new Map<string, number>()
  for (const stance of stances) {
    const d = dayjs(stance.timestamp)
    const key = `${d.format('ddd')}-${d.hour()}`
    bucket.set(key, (bucket.get(key) ?? 0) + 1)
  }
  const result: { day: string; hour: number; value: number }[] = []
  bucket.forEach((value, key) => {
    const [day, hourStr] = key.split('-')
    if (!day || !hourStr) return
    result.push({ day, hour: Number(hourStr), value })
  })
  return result
}

// ──────────────────────────────────────────────────────────
// Overview
// ──────────────────────────────────────────────────────────

export async function fetchPulseOverview(): Promise<{
  refreshedAt: string
  kpis: KPIWithHistory[]
}> {
  const [topics, stances, args, votes] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<EthikosArgumentApi[]>('ethikos/arguments/'),
    get<VoteApi[]>('kollective/votes/'),
  ])

  const topicsSeries = buildDailySeries(topics, (t) => t.created_at)
  const stancesSeries = buildDailySeries(stances, (s) => s.timestamp)
  const argsSeries = buildDailySeries(args, (a) => a.created_at)
  const votesSeries = buildDailySeries(votes, (v) => v.voted_at)

  const sum = (series: DailyPoint[]) =>
    series.reduce((acc, p) => acc + p.value, 0)

  const kpis: KPIWithHistory[] = [
    {
      key: 'topics',
      label: 'Debates created (30d)',
      value: sum(topicsSeries),
      delta: percentDelta(topicsSeries),
      history: topicsSeries,
    },
    {
      key: 'stances',
      label: 'Stances recorded (30d)',
      value: sum(stancesSeries),
      delta: percentDelta(stancesSeries),
      history: stancesSeries,
    },
    {
      key: 'arguments',
      label: 'Arguments posted (30d)',
      value: sum(argsSeries),
      delta: percentDelta(argsSeries),
      history: argsSeries,
    },
    {
      key: 'votes',
      label: 'Weighted votes (30d)',
      value: sum(votesSeries),
      delta: percentDelta(votesSeries),
      history: votesSeries,
    },
  ]

  return {
    refreshedAt: new Date().toISOString(),
    kpis,
  }
}

// ──────────────────────────────────────────────────────────
// Live view (polled periodically)
// ──────────────────────────────────────────────────────────

export async function fetchPulseLiveData(): Promise<{
  counters: LiveCounter[]
}> {
  const [topics, stances] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
  ])

  const topicsSeries = buildDailySeries(topics, (t) => t.created_at, 7)
  const stancesSeries = buildDailySeries(stances, (s) => s.timestamp, 7)

  const toHistory = (series: DailyPoint[]) =>
    series.map((p) => ({
      ts: new Date(p.date).getTime(),
      value: p.value,
    }))

  const counters: LiveCounter[] = [
    {
      label: 'Open debates',
      value: topics.filter((t) => t.status === 'open').length,
      trend: percentDelta(topicsSeries),
      history: toHistory(topicsSeries),
    },
    {
      label: 'New stances (7d)',
      value: stancesSeries.reduce((acc, p) => acc + p.value, 0),
      trend: percentDelta(stancesSeries),
      history: toHistory(stancesSeries),
    },
  ]

  return { counters }
}

// ──────────────────────────────────────────────────────────
// Trends
// ──────────────────────────────────────────────────────────

export async function fetchPulseTrends(): Promise<{
  charts: TrendChart[]
}> {
  const [topics, stances, args] = await Promise.all([
    get<EthikosTopicApi[]>('ethikos/topics/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<EthikosArgumentApi[]>('ethikos/arguments/'),
  ])

  const topicsSeries = buildDailySeries(topics, (t) => t.created_at, 60)
  const stancesSeries = buildDailySeries(stances, (s) => s.timestamp, 60)
  const argsSeries = buildDailySeries(args, (a) => a.created_at, 60)

  const heatmapData = buildStanceHeatmap(stances)

  const charts: TrendChart[] = [
    {
      key: 'topics-timeline',
      title: 'Debates over time',
      type: 'line',
      config: {
        data: topicsSeries,
        xField: 'date',
        yField: 'value',
        smooth: true,
      },
    },
    {
      key: 'stances-timeline',
      title: 'Stances over time',
      type: 'area',
      config: {
        data: stancesSeries,
        xField: 'date',
        yField: 'value',
      },
    },
    {
      key: 'activity-heatmap',
      title: 'Deliberation activity heatmap',
      type: 'heatmap',
      config: {
        data: heatmapData,
        xField: 'hour',
        yField: 'day',
        colorField: 'value',
      },
    },
  ]

  return { charts }
}

// ──────────────────────────────────────────────────────────
// Health (radar + pie)
// ──────────────────────────────────────────────────────────

export async function fetchPulseHealth(): Promise<HealthSummary> {
  const [stances, votes] = await Promise.all([
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<VoteApi[]>('kollective/votes/'),
  ])

  let positive = 0
  let neutral = 0
  let negative = 0

  for (const s of stances) {
    if (s.value > 0) positive += 1
    else if (s.value < 0) negative += 1
    else neutral += 1
  }

  const participation = Math.min(100, stances.length)
  const engagement = Math.min(100, votes.length)
  const balance =
    stances.length > 0
      ? Math.round(
          (1 - Math.abs(positive - negative) / stances.length) * 100,
        )
      : 100
  const constructiveness = Math.round((participation + balance) / 2)

  const radarData = [
    { metric: 'Participation', score: participation },
    { metric: 'Engagement', score: engagement },
    { metric: 'Balance', score: balance },
    { metric: 'Constructiveness', score: constructiveness },
  ]

  const pieData = [
    { type: 'Positive', value: positive },
    { type: 'Neutral', value: neutral },
    { type: 'Negative', value: negative },
  ]

  return {
    refreshedAt: new Date().toISOString(),
    radarConfig: {
      data: radarData,
      xField: 'metric',
      yField: 'score',
      meta: {
        score: { min: 0, max: 100 },
      },
    },
    pieConfig: {
      data: pieData,
      angleField: 'value',
      colorField: 'type',
    },
  }
}
