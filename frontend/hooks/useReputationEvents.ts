// hooks/useReputationEvents.ts

import { useQuery } from '@tanstack/react-query';
import {
  fetchUserProfile,
  fetchUserBadges,
  type ReputationProfile,
  type Badge,
} from '@/services/trust';

export interface ReputationEvent {
  id: string;
  when: string;   // ISO date or YYYY-MM-DD
  title: string;
  detail: string;
}

export interface ReputationEventsResult {
  profile: ReputationProfile;
  badges: Badge[];
  timeline: ReputationEvent[];
}

/**
 * Builds a synthetic "reputation timeline" from:
 * - recent activity deltas in the reputation profile
 * - earned badges from Ekoh activity
 *
 * There is no dedicated backend endpoint yet; this hook
 * composes existing trust services so the UI can be wired.
 */
async function loadReputationEvents(): Promise<ReputationEventsResult> {
  const [profile, badges] = await Promise.all([
    fetchUserProfile(),
    fetchUserBadges(),
  ]);

  const timeline: ReputationEvent[] = [];

  // 1) Recent activity deltas (e.g. "Stances last 30 days +3")
  const recentItems = profile.recent ?? [];
  for (const item of recentItems) {
    const change = item.change ?? 0;

    timeline.push({
      id: `recent-${item.label.replace(/\s+/g, '-').toLowerCase()}`,
      // No per-item date in the API yet; we stamp "now"
      when: new Date().toISOString(),
      title: item.label,
      detail:
        change === 0
          ? 'No significant change compared to the previous period.'
          : change > 0
          ? `Increased by ${change} compared to the previous period.`
          : `Decreased by ${Math.abs(change)} compared to the previous period.`,
    });
  }

  // 2) Earned badges
  for (const badge of badges) {
    timeline.push({
      id: `badge-${badge.id}`,
      when: badge.earnedAt,
      title: `Badge earned · ${badge.label}`,
      detail: badge.description,
    });
  }

  // Sort most recent first (fall back to string compare if needed)
  timeline.sort((a, b) => {
    const ta = Date.parse(a.when);
    const tb = Date.parse(b.when);
    if (Number.isNaN(ta) || Number.isNaN(tb)) {
      return b.when.localeCompare(a.when);
    }
    return tb - ta;
  });

  return { profile, badges, timeline };
}

export default function useReputationEvents() {
  return useQuery<ReputationEventsResult, Error>({
    queryKey: ['reputation-events'],
    queryFn: loadReputationEvents,
    staleTime: 5 * 60_000, // 5 minutes
  });
}
