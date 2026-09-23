import type { TranslateFunction } from './runtime';

const IMPACT_KPI_KEYS: Record<string, string> = {
  topics: 'ui.metrics.impact.totalTopics',
  stances: 'ui.metrics.impact.totalStances',
  agreement: 'ui.metrics.impact.averageAgreement',
  open: 'ui.metrics.impact.openDebates',
};

const IMPACT_CHART_KEYS: Record<string, string> = {
  'participation-timeline': 'ui.metrics.impact.participationOverTime',
  'topics-by-category': 'ui.metrics.impact.topicsByCategory',
};

const PULSE_KPI_KEYS: Record<string, string> = {
  topics: 'ui.metrics.pulse.debatesCreated30d',
  stances: 'ui.metrics.pulse.stancesRecorded30d',
  arguments: 'ui.metrics.pulse.argumentsPosted30d',
  votes: 'ui.metrics.pulse.weightedVotes30d',
};

const PULSE_COUNTER_KEYS: Record<string, string> = {
  open: 'ui.metrics.pulse.openDebates',
  stances: 'ui.metrics.pulse.newStances7d',
  arguments: 'ui.metrics.pulse.newArguments7d',
};

const PULSE_CHART_KEYS: Record<string, string> = {
  'topics-timeline': 'ui.metrics.pulse.debatesOverTime',
  'stances-timeline': 'ui.metrics.pulse.stancesOverTime',
  'arguments-timeline': 'ui.metrics.pulse.argumentsOverTime',
  'activity-heatmap': 'ui.metrics.pulse.deliberationActivityHeatmap',
};

function translated(
  t: TranslateFunction,
  mapping: Record<string, string>,
  key: string | undefined,
  fallback: string,
): string {
  if (!key) return fallback;
  const translationKey = mapping[key];
  return translationKey ? t(translationKey, undefined, fallback) : fallback;
}

export function impactKpiLabel(
  t: TranslateFunction,
  key: string,
  fallback: string,
): string {
  return translated(t, IMPACT_KPI_KEYS, key, fallback);
}

export function impactChartTitle(
  t: TranslateFunction,
  key: string,
  fallback: string,
): string {
  return translated(t, IMPACT_CHART_KEYS, key, fallback);
}

export function pulseKpiLabel(
  t: TranslateFunction,
  key: string | undefined,
  fallback: string,
): string {
  return translated(t, PULSE_KPI_KEYS, key, fallback);
}

export function pulseCounterLabel(
  t: TranslateFunction,
  key: string | undefined,
  fallback: string,
): string {
  return translated(t, PULSE_COUNTER_KEYS, key, fallback);
}

export function pulseChartTitle(
  t: TranslateFunction,
  key: string,
  fallback: string,
): string {
  return translated(t, PULSE_CHART_KEYS, key, fallback);
}

export function scopeLabel(t: TranslateFunction, scope: string): string {
  if (scope === 'Elite') return t('ui.values.scope.elite', undefined, scope);
  if (scope === 'Public') return t('ui.values.scope.public', undefined, scope);
  return scope;
}

export function impactStatusLabel(t: TranslateFunction, status: string): string {
  const key =
    status === 'Planned'
      ? 'ui.values.impactStatus.planned'
      : status === 'In-Progress'
        ? 'ui.values.impactStatus.inProgress'
        : status === 'Completed'
          ? 'ui.values.impactStatus.completed'
          : status === 'Blocked'
            ? 'ui.values.impactStatus.blocked'
            : undefined;
  return key ? t(key, undefined, status) : status;
}
