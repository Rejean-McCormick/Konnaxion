'use client';

// FILE: frontend/modules/konsultations/hooks/useImpact.ts
﻿// modules/konsultations/hooks/useImpact.ts
import { useQuery } from '@tanstack/react-query';

import { useLanguage } from '@/context/LanguageContext';
import type { TranslateFunction } from '@/i18n/runtime';
import { impactStatusLabel } from '@/i18n/uiModelLabels';

import api from '@/api';
import type { ImpactStatus } from '@/services/impact';

/**
 * Logical scope of a consultation (reuses Ethikos semantics).
 */
export type ConsultationScope = 'Elite' | 'Public';

type TopicStatus = 'open' | 'closed' | 'archived';

interface EthikosCategoryApi {
  id: number;
  name: string;
  description?: string;
}

interface EthikosTopicApi {
  id: number;
  title: string;
  description: string;
  status: TopicStatus;
  total_votes?: number | null;
  last_activity: string;
  created_at: string;
  category: EthikosCategoryApi;
  expertise_category?: number | null;
  created_by?: string;
}

interface EthikosStanceApi {
  id: number;
  topic: number;
  value: number; // −3…+3
  timestamp: string;
}

interface EthikosArgumentApi {
  id: number;
  topic: number;
  user: string;
  content: string;
  created_at: string;
}

/**
 * One milestone on the consultation impact timeline.
 */
export interface ConsultationImpactEvent {
  id: string;
  date: string; // ISO timestamp
  label: string;
  description?: string;
}

/**
 * Aggregated summary for a single consultation.
 */
export interface ConsultationImpactSummary {
  id: string;
  title: string;
  category?: string;
  scope: ConsultationScope;
  status: ImpactStatus;
  createdAt: string;
  closesAt: string;
  /** Turnout proxy in [0, 100] (same heuristic as Decide service). */
  turnout: number;
  /** Number of recorded stances (votes). */
  stances: number;
  /** Number of arguments in the thread. */
  arguments: number;
  /**
   * Approximate agreement in [0, 100].
   * 0 = fully against, 50 = neutral, 100 = fully in favour.
   * Undefined when no stances yet.
   */
  support?: number;
}

/**
 * Full impact payload returned by the hook.
 */
export interface ConsultationImpactResult {
  summary: ConsultationImpactSummary;
  timeline: ConsultationImpactEvent[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function topicStatusToImpactStatus(status: TopicStatus): ImpactStatus {
  switch (status) {
    case 'closed':
      return 'Completed';
    case 'archived':
      return 'Blocked';
    case 'open':
    default:
      return 'In-Progress';
  }
}

/**
 * Simple heuristic reused from services/decide.ts:
 * - open → 7 days after creation
 * - closed/archived → last_activity
 */
function computeClosesAt(topic: EthikosTopicApi): string {
  const created = new Date(topic.created_at);
  if (topic.status === 'open' && !Number.isNaN(created.getTime())) {
    const closes = new Date(created);
    closes.setDate(closes.getDate() + 7);
    return closes.toISOString();
  }

  const last = new Date(topic.last_activity);
  return Number.isNaN(last.getTime()) ? topic.last_activity : last.toISOString();
}

/**
 * Clamp total_votes into a 0–100 turnout proxy.
 */
function normalizeTurnout(totalVotes?: number | null): number {
  const n = typeof totalVotes === 'number' ? totalVotes : 0;
  return Math.max(0, Math.min(100, n));
}

/**
 * Map Ethikos expertise_category presence to scope.
 */
function topicScope(topic: EthikosTopicApi): ConsultationScope {
  return topic.expertise_category ? 'Elite' : 'Public';
}

function toNumberId(id: string | number): number {
  const n = typeof id === 'string' ? Number(id) : id;
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid consultation/topic id: ${id}`);
  }
  return n;
}

/**
 * Build a small, human-friendly event timeline from topic + activity.
 */
function buildTimeline(
  i18nT: TranslateFunction,
  topic: EthikosTopicApi,
  stances: EthikosStanceApi[],
  args: EthikosArgumentApi[],
  support?: number,
): ConsultationImpactEvent[] {
  const events: ConsultationImpactEvent[] = [];

  // Creation
  events.push({
    id: `topic-created-${topic.id}`,
    date: topic.created_at,
    label: i18nT('ui.konsultations.impact.consultationCreated'),
    description: i18nT('ui.konsultations.impact.debateOpenedCategory', { category: topic.category?.name ?? i18nT('ui.common.uncategorised') }),
  });

  // Status / closing
  const impactStatus = topicStatusToImpactStatus(topic.status);
  const closesAt = computeClosesAt(topic);

  events.push({
    id: `topic-status-${topic.id}`,
    date: closesAt,
    label:
      impactStatus === 'Completed'
        ? i18nT('ui.konsultations.impact.decisionClosed')
        : impactStatus === 'Blocked'
        ? i18nT('ui.konsultations.impact.consultationArchived')
        : i18nT('ui.konsultations.impact.consultationOpen'),
    description:
      impactStatus === 'In-Progress'
        ? i18nT('ui.konsultations.impact.participantsCanSubmit')
        : i18nT('ui.konsultations.impact.statusLabel', { status: impactStatusLabel(i18nT, impactStatus) }),
  });

  // Stance activity
  if (stances.length > 0) {
    const sorted = [...stances].sort((a, b) =>
      a.timestamp.localeCompare(b.timestamp),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (first) {
      events.push({
        id: `stance-first-${topic.id}`,
        date: first.timestamp,
        label: i18nT('ui.konsultations.impact.firstStanceSubmitted'),
        description: i18nT('ui.konsultations.impact.firstStanceDescription'),
      });
    }

    if (last) {
      events.push({
        id: `stance-latest-${topic.id}`,
        date: last.timestamp,
        label: i18nT('ui.konsultations.impact.latestStanceActivity'),
        description: [
          i18nT('ui.konsultations.impact.totalStancesRecorded', { count: stances.length }),
          support != null ? i18nT('ui.konsultations.impact.approxAgreement', { support }) : undefined,
        ]
          .filter(Boolean)
          .join(' '),
      });
    }
  }

  // Argument activity
  if (args.length > 0) {
    const sorted = [...args].sort((a, b) =>
      a.created_at.localeCompare(b.created_at),
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    if (first) {
      events.push({
        id: `argument-first-${topic.id}`,
        date: first.created_at,
        label: i18nT('ui.konsultations.impact.firstArgumentPosted'),
        description: i18nT('ui.konsultations.impact.userStartedDebate', { user: first.user }),
      });
    }

    if (last) {
      events.push({
        id: `argument-latest-${topic.id}`,
        date: last.created_at,
        label: i18nT('ui.konsultations.impact.latestArgumentActivity'),
        description: i18nT('ui.konsultations.impact.argumentsExchanged', { count: args.length }),
      });
    }
  }

  // Sort chronologically
  events.sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return events;
}

/**
 * Fetch and aggregate everything needed for the impact view of one consultation.
 */
async function loadConsultationImpact(
  i18nT: TranslateFunction,
  consultationId: string | number,
): Promise<ConsultationImpactResult> {
  const topicId = toNumberId(consultationId);

  // Build query string once for stance/argument endpoints
  const topicQuery = new URLSearchParams({ topic: String(topicId) }).toString();

  const [topic, stancesRaw, argsRaw] = await Promise.all([
    api.get<EthikosTopicApi>(`ethikos/topics/${topicId}/`),
    api.get<EthikosStanceApi[]>(`ethikos/stances/?${topicQuery}`),
    api.get<EthikosArgumentApi[]>(`ethikos/arguments/?${topicQuery}`),
  ]);

  const stances = stancesRaw.filter((s) => s.topic === topicId);
  const args = argsRaw.filter((a) => a.topic === topicId);

  const stanceCount = stances.length;

  let support: number | undefined;
  if (stanceCount > 0) {
    const sum = stances.reduce((acc, s) => acc + s.value, 0);
    const avg = sum / stanceCount; // −3…+3
    const normalized = Math.max(-1, Math.min(1, avg / 3)); // → −1…+1
    support = Math.round((normalized + 1) * 50); // → 0…100
  }

  const summary: ConsultationImpactSummary = {
    id: String(topic.id),
    title: topic.title,
    category: topic.category?.name,
    scope: topicScope(topic),
    status: topicStatusToImpactStatus(topic.status),
    createdAt: topic.created_at,
    closesAt: computeClosesAt(topic),
    turnout: normalizeTurnout(topic.total_votes),
    stances: stanceCount,
    arguments: args.length,
    support,
  };

  const timeline = buildTimeline(i18nT, topic, stances, args, support);

  return { summary, timeline };
}

/* -------------------------------------------------------------------------- */
/* Public hook                                                                */
/* -------------------------------------------------------------------------- */

export interface UseImpactOptions {
  /**
   * Force-enable/disable the query.
   * Defaults to enabled when consultationId is truthy.
   */
  enabled?: boolean;
}

/**
 * High-level hook for consultation impact:
 * - loads Ethikos topic, stances and arguments for a single consultation
 * - returns a summary + a coarse timeline of key events
 *
 * Typical usage:
 *   const { data, isLoading, error } = useImpact(consultationId);
 */
export default function useImpact(
  consultationId: string | number | null | undefined,
  options?: UseImpactOptions,
) {
  const { language, t: i18nT } = useLanguage();
  const enabled =
    (options?.enabled ?? true) &&
    consultationId !== null &&
    consultationId !== undefined;

  return useQuery<ConsultationImpactResult>({
    queryKey: ['konsultations-impact', consultationId, language],
    enabled,
    staleTime: 60_000,
    queryFn: () => {
      if (consultationId === null || consultationId === undefined) {
        throw new Error('Missing consultation id for impact view');
      }
      return loadConsultationImpact(i18nT, consultationId);
    },
  });
}
