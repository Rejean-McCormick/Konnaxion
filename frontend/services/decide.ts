// FILE: frontend/services/decide.ts
import dayjs from 'dayjs'

import { get } from './_request'
import {
  ETHIKOS_PATHS,
  fetchEthikosTopics,
  normalizeList,
  submitTopicStance,
} from './ethikos'
import type {
  ApiMaybeList,
  EthikosId,
  EthikosStanceApi,
  EthikosTopicApi,
  StanceValue,
} from './ethikos'
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

export type DecisionStatus = 'draft' | 'open' | 'closed' | 'published'

export interface DecisionProtocolRow {
  id: string
  title: string
  category?: string
  status: DecisionStatus
  createdAt?: string
  closesAt?: string
  participationCount?: number
}

export interface DecisionResultRow {
  id: string
  topicId: string
  title: string
  baselineScore?: number
  readingScore?: number
  publishedAt?: string
  status: DecisionStatus
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PUBLIC_SCALE_OPTIONS = [
  'Strongly disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly agree',
] as const

const STANCE_VALUES: readonly StanceValue[] = [-3, -2, -1, 0, 1, 2, 3]

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function toId(value: EthikosId): string {
  return String(value)
}

function sameId(left: EthikosId, right: EthikosId): boolean {
  return String(left) === String(right)
}

function coerceStanceValue(value: number): StanceValue {
  if (STANCE_VALUES.includes(value as StanceValue)) {
    return value as StanceValue
  }

  return 0
}

function computeClosesAt(topic: EthikosTopicApi): string {
  const createdAt = topic.created_at
  const lastActivity = topic.last_activity ?? topic.updated_at ?? createdAt

  if (topic.status === 'open') {
    const created = dayjs(createdAt)

    if (created.isValid()) {
      return created.add(7, 'day').toISOString()
    }
  }

  const closedAt = dayjs(lastActivity)

  if (closedAt.isValid()) {
    return closedAt.toISOString()
  }

  return new Date().toISOString()
}

function normalizeTurnout(totalVotes?: number | null): number {
  const count = typeof totalVotes === 'number' ? totalVotes : 0

  return Math.max(0, Math.min(100, count))
}

function isEliteTopic(topic: EthikosTopicApi): boolean {
  return topic.expertise_category !== undefined && topic.expertise_category !== null
}

function topicScope(topic: EthikosTopicApi): DecisionScope {
  return isEliteTopic(topic) ? 'Elite' : 'Public'
}

function categoryName(topic: EthikosTopicApi): string | undefined {
  if (topic.category_name) {
    return topic.category_name
  }

  if (topic.category?.name) {
    return topic.category.name
  }

  return undefined
}

function toEliteBallot(topic: EthikosTopicApi): EliteBallot {
  return {
    id: toId(topic.id),
    title: topic.title,
    closesAt: computeClosesAt(topic),
    scope: 'Elite',
    turnout: normalizeTurnout(topic.total_votes),
  }
}

function toPublicBallot(topic: EthikosTopicApi): PublicBallot {
  return {
    id: toId(topic.id),
    title: topic.title,
    closesAt: computeClosesAt(topic),
    scope: 'Public',
    options: [...PUBLIC_SCALE_OPTIONS],
    turnout: normalizeTurnout(topic.total_votes),
  }
}

function mapOptionToValue(option: string): StanceValue {
  const normalized = option.trim().toLowerCase()

  if (normalized.startsWith('strongly disagree')) {
    return -3
  }

  if (normalized.startsWith('disagree')) {
    return -1
  }

  if (normalized.startsWith('neutral')) {
    return 0
  }

  if (normalized.startsWith('strongly agree')) {
    return 3
  }

  if (normalized.startsWith('agree')) {
    return 1
  }

  const numeric = Number(option)

  if (Number.isFinite(numeric)) {
    return coerceStanceValue(numeric)
  }

  return 0
}

function statusToDecisionStatus(status: EthikosTopicApi['status']): DecisionStatus {
  if (status === 'open') {
    return 'open'
  }

  if (status === 'closed') {
    return 'closed'
  }

  return 'published'
}

async function fetchAllStances(): Promise<EthikosStanceApi[]> {
  const payload = await get<ApiMaybeList<EthikosStanceApi>>(ETHIKOS_PATHS.stances)

  return normalizeList(payload)
}

function buildStanceStatsByTopic(
  stances: EthikosStanceApi[],
): Map<string, { sum: number; count: number }> {
  const byTopic = new Map<string, { sum: number; count: number }>()

  for (const stance of stances) {
    const topicId = toId(stance.topic)
    const bucket = byTopic.get(topicId) ?? { sum: 0, count: 0 }
    bucket.sum += Number(stance.value)
    bucket.count += 1
    byTopic.set(topicId, bucket)
  }

  return byTopic
}

function byClosesAtAsc<T extends { closesAt: string }>(items: T[]): T[] {
  return [...items].sort(
    (left, right) =>
      dayjs(left.closesAt).valueOf() - dayjs(right.closesAt).valueOf(),
  )
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * Elite ballots = open Ethikos topics with an expertise category.
 *
 * Canonical backend path remains:
 *   /api/ethikos/topics/
 *
 * This service uses the relative frontend service path owned by _request.ts:
 *   ethikos/topics/
 */
export async function fetchEliteBallots(): Promise<EliteBallotResponse> {
  const topics = await fetchEthikosTopics({ status: 'open' })

  return {
    ballots: byClosesAtAsc(topics.filter(isEliteTopic).map(toEliteBallot)),
  }
}

/**
 * Public ballots = open Ethikos topics without an expertise category.
 */
export async function fetchPublicBallots(): Promise<PublicBallotResponse> {
  const topics = await fetchEthikosTopics({ status: 'open' })

  return {
    ballots: byClosesAtAsc(
      topics.filter((topic) => !isEliteTopic(topic)).map(toPublicBallot),
    ),
  }
}

/**
 * Records a public decision vote as an Ethikos topic-level stance.
 *
 * Important:
 * - this is still EthikosStance, range -3..+3;
 * - this is not ArgumentImpactVote;
 * - this is not a Smart Vote reading.
 */
export async function submitPublicVote(
  id: string,
  option: string,
): Promise<{ ok: true }> {
  const value = mapOptionToValue(option)

  await submitTopicStance(id, value)

  return { ok: true }
}

/**
 * Decision results = closed / archived topics plus stance direction.
 */
export async function fetchDecisionResults(): Promise<DecisionResultsResponse> {
  const [topics, stances] = await Promise.all([
    fetchEthikosTopics(),
    fetchAllStances(),
  ])

  const stanceStatsByTopic = buildStanceStatsByTopic(stances)

  const resultTopics = topics.filter(
    (topic) => topic.status === 'closed' || topic.status === 'archived',
  )

  const items: DecisionResult[] = resultTopics.map((topic) => {
    const topicId = toId(topic.id)
    const stats = stanceStatsByTopic.get(topicId)
    const average = stats && stats.count > 0 ? stats.sum / stats.count : 0

    return {
      id: topicId,
      title: topic.title,
      scope: topicScope(topic),
      passed: average >= 0,
      closesAt: computeClosesAt(topic),
      region: categoryName(topic),
    }
  })

  return { items }
}

/**
 * Compatibility helper for pages that expect protocol-like rows.
 */
export async function fetchDecisionProtocols(): Promise<DecisionProtocolRow[]> {
  const [topics, stances] = await Promise.all([
    fetchEthikosTopics(),
    fetchAllStances(),
  ])

  return topics.map((topic) => ({
    id: toId(topic.id),
    title: topic.title,
    category: categoryName(topic),
    status: statusToDecisionStatus(topic.status),
    createdAt: topic.created_at,
    closesAt: computeClosesAt(topic),
    participationCount: stances.filter((stance) => sameId(stance.topic, topic.id))
      .length,
  }))
}

/**
 * Compatibility helper for pages that expect result rows.
 */
export async function fetchDecisionResultRows(): Promise<DecisionResultRow[]> {
  const results = await fetchDecisionResults()

  return results.items.map((item) => ({
    id: item.id,
    topicId: item.id,
    title: item.title,
    baselineScore: item.passed ? 1 : 0,
    readingScore: item.passed ? 1 : 0,
    publishedAt: item.closesAt,
    status: 'published',
  }))
}