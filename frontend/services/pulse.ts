// FILE: frontend/services/pulse.ts
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
  config: Record<string, unknown>
}

export interface HealthSummary {
  refreshedAt: string
  radarConfig: Record<string, unknown>
  pieConfig: Record<string, unknown>
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

type ListResponse<T> =
  | T[]
  | {
      results?: T[]
    }

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

interface DailyPoint {
  date: string
  value: number
}

function unwrapList<T>(payload: ListResponse<T> | null | undefined): T[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.results)) return payload.results
  return []
}

async function getList<T>(url: string): Promise<T[]> {
  const payload = await get<ListResponse<T>>(url)
  return unwrapList(payload)
}

async function getOptionalList<T>(url: string): Promise<T[]> {
  try {
    return await getList<T>(url)
  } catch {
    return []
  }
}

function toFiniteNumber(value: string | number | null | undefined): number {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
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
    const raw = getDate(item)
    const d = dayjs(raw)
    if (!d.isValid()) continue
    if (d.isBefore(start) || d.isAfter(now)) continue

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

  const latest = series[series.length - 1]?.value ?? 0
  const previous = series[series.length - 2]?.value ?? 0

  if (previous === 0) {
    if (latest === 0) return 0
    return undefined
  }

  return Math.round(((latest - previous) / previous) * 100)
}

function buildStanceHeatmap(stances: EthikosStanceApi[]) {
  const bucket = new Map<string, number>()

  for (const stance of stances) {
    const d = dayjs(stance.timestamp)
    if (!d.isValid()) continue

    const key = `${d.format('ddd')}-${d.hour()}`
    bucket.set(key, (bucket.get(key) ?? 0) + 1)
  }

  const result: { day: string; hour: number; value: number }[] = []
  bucket.forEach((value, key) => {
    const [day, hourStr] = key.split('-')
    if (!day || !hourStr) return

    result.push({
      day,
      hour: Number(hourStr),
      value,
    })
  })

  return result
}

function sumSeries(series: DailyPoint[]): number {
  return series.reduce((acc, point) => acc + point.value, 0)
}

function averageAbsoluteStance(stances: EthikosStanceApi[]): number {
  if (stances.length === 0) return 0

  const total = stances.reduce((acc, stance) => acc + Math.abs(stance.value), 0)
  return total / stances.length
}

// ──────────────────────────────────────────────────────────
// Overview
// ──────────────────────────────────────────────────────────

export async function fetchPulseOverview(): Promise<{
  refreshedAt: string
  kpis: KPIWithHistory[]
}> {
  const [topics, stances, args, votes] = await Promise.all([
    getList<EthikosTopicApi>('ethikos/topics/'),
    getList<EthikosStanceApi>('ethikos/stances/'),
    getList<EthikosArgumentApi>('ethikos/arguments/'),
    getOptionalList<VoteApi>('kollective/votes/'),
  ])

  const topicsSeries = buildDailySeries(topics, (t) => t.created_at, 30)
  const stancesSeries = buildDailySeries(stances, (s) => s.timestamp, 30)
  const argsSeries = buildDailySeries(args, (a) => a.created_at, 30)
  const votesSeries = buildDailySeries(votes, (v) => v.voted_at, 30)

  const kpis: KPIWithHistory[] = [
    {
      key: 'topics',
      label: 'Debates created (30d)',
      value: sumSeries(topicsSeries),
      delta: percentDelta(topicsSeries),
      history: topicsSeries,
    },
    {
      key: 'stances',
      label: 'Stances recorded (30d)',
      value: sumSeries(stancesSeries),
      delta: percentDelta(stancesSeries),
      history: stancesSeries,
    },
    {
      key: 'arguments',
      label: 'Arguments posted (30d)',
      value: sumSeries(argsSeries),
      delta: percentDelta(argsSeries),
      history: argsSeries,
    },
    {
      key: 'votes',
      label: 'Weighted votes (30d)',
      value: sumSeries(votesSeries),
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
  const [topics, stances, args] = await Promise.all([
    getList<EthikosTopicApi>('ethikos/topics/'),
    getList<EthikosStanceApi>('ethikos/stances/'),
    getList<EthikosArgumentApi>('ethikos/arguments/'),
  ])

  const openTopics = topics.filter((topic) => topic.status === 'open')

  const topicsSeries = buildDailySeries(
    openTopics,
    (topic) => topic.last_activity || topic.created_at,
    7,
  )
  const stancesSeries = buildDailySeries(stances, (stance) => stance.timestamp, 7)
  const argsSeries = buildDailySeries(args, (arg) => arg.created_at, 7)

  const toHistory = (series: DailyPoint[]) =>
    series.map((point) => ({
      ts: new Date(point.date).getTime(),
      value: point.value,
    }))

  const counters: LiveCounter[] = [
    {
      label: 'Open debates',
      value: openTopics.length,
      trend: percentDelta(topicsSeries),
      history: toHistory(topicsSeries),
    },
    {
      label: 'New stances (7d)',
      value: sumSeries(stancesSeries),
      trend: percentDelta(stancesSeries),
      history: toHistory(stancesSeries),
    },
    {
      label: 'New arguments (7d)',
      value: sumSeries(argsSeries),
      trend: percentDelta(argsSeries),
      history: toHistory(argsSeries),
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
    getList<EthikosTopicApi>('ethikos/topics/'),
    getList<EthikosStanceApi>('ethikos/stances/'),
    getList<EthikosArgumentApi>('ethikos/arguments/'),
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
      key: 'arguments-timeline',
      title: 'Arguments over time',
      type: 'line',
      config: {
        data: argsSeries,
        xField: 'date',
        yField: 'value',
        smooth: true,
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
  const [topics, stances, args, votes] = await Promise.all([
    getList<EthikosTopicApi>('ethikos/topics/'),
    getList<EthikosStanceApi>('ethikos/stances/'),
    getList<EthikosArgumentApi>('ethikos/arguments/'),
    getOptionalList<VoteApi>('kollective/votes/'),
  ])

  let positive = 0
  let neutral = 0
  let negative = 0

  for (const stance of stances) {
    if (stance.value > 0) positive += 1
    else if (stance.value < 0) negative += 1
    else neutral += 1
  }

  const participation = clamp(stances.length, 0, 100)
  const engagement = clamp(votes.length, 0, 100)

  const balance =
    stances.length > 0
      ? Math.round((1 - Math.abs(positive - negative) / stances.length) * 100)
      : 100

  const argumentDensity =
    topics.length > 0 ? Math.round((args.length / topics.length) * 10) : 0

  const constructiveness = clamp(
    Math.round(
      (participation + balance + clamp(argumentDensity, 0, 100)) / 3,
    ),
    0,
    100,
  )

  const conviction = clamp(
    Math.round((averageAbsoluteStance(stances) / 3) * 100),
    0,
    100,
  )

  const radarData = [
    { metric: 'Participation', score: participation },
    { metric: 'Engagement', score: engagement },
    { metric: 'Balance', score: balance },
    { metric: 'Constructiveness', score: constructiveness },
    { metric: 'Conviction', score: conviction },
  ]

  const pieData = [
    { type: 'Positive', value: positive },
    { type: 'Neutral', value: neutral },
    { type: 'Negative', value: negative },
  ]

  const totalWeightedVotes = votes.reduce(
    (acc, vote) => acc + Math.abs(toFiniteNumber(vote.weighted_value)),
    0,
  )

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
      meta: {
        totalWeightedVotes,
      },
    },
  }
}