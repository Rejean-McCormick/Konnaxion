import { stripWorldPrefix } from '@/lib/worlds';

export const SUITE_KEYS = [
  'ethikos',
  'keenkonnect',
  'konnected',
  'kreative',
  'ekoh',
  'teambuilder',
  'reports',
  'kontrol',
] as const;

export type SuiteKey = (typeof SUITE_KEYS)[number];

export const SUITE_LABELS: Record<SuiteKey, string> = {
  ethikos: 'ethiKos',
  keenkonnect: 'keenKonnect',
  konnected: 'KonnectED',
  kreative: 'Kreative',
  ekoh: 'EkoH',
  teambuilder: 'Team Builder',
  reports: 'Insights',
  kontrol: 'KonTrol',
};

export const DEFAULT_ENTRY: Record<SuiteKey, string> = {
  ethikos: '/ethikos/insights',
  keenkonnect: '/keenkonnect/dashboard',
  konnected: '/konnected/dashboard',
  kreative: '/kreative/dashboard',
  ekoh: '/ekoh/dashboard',
  teambuilder: '/teambuilder',
  reports: '/reports',
  kontrol: '/kontrol/dashboard',
};

/**
 * Product navigation hierarchy:
 * 1. Core experiences
 * 2. Shared capabilities
 * 3. Operations / administration
 */
export const SUITE_GROUPS = [
  ['ethikos', 'keenkonnect', 'konnected', 'kreative'],
  ['ekoh', 'teambuilder'],
  ['reports', 'kontrol'],
] as const satisfies readonly (readonly SuiteKey[])[];

export function isSuiteKey(value: string | null | undefined): value is SuiteKey {
  return (
    typeof value === 'string' &&
    (SUITE_KEYS as readonly string[]).includes(value)
  );
}

/**
 * Resolve the sidebar suite from URL state.
 *
 * `?sidebar=` remains authoritative when it references a known suite so
 * cross-mounted product surfaces (notably /konsensus) can keep their owning
 * product navigation. Without an explicit override, /konsensus belongs to
 * ethiKos and /reports belongs to Insights.
 */
export function detectSuite(
  pathname: string,
  sidebarParam: string | null,
): SuiteKey {
  const normalizedSidebar = sidebarParam?.toLowerCase() ?? null;
  if (isSuiteKey(normalizedSidebar)) return normalizedSidebar;

  const appPath = stripWorldPrefix(pathname || '/');
  const first = appPath.split('/')[1]?.toLowerCase() ?? '';

  if (first === 'konsensus') return 'ethikos';
  if (isSuiteKey(first)) return first;

  return 'ekoh';
}
