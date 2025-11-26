// frontend/services/trust.ts
import dayjs from 'dayjs';
import { get } from './_request';
import { resolveAvatarUrl, type CurrentUser } from './user';

export interface ReputationDimension {
  key: string;
  label: string;
  score: number;
  weight: number;
}

export interface ReputationProfile {
  level: 'Visitor' | 'Contributor' | 'Steward';
  score: number;
  dimensions: ReputationDimension[];
  recent: { label: string; change: number }[];

  /** Identity info derived from /users/me/ so UIs can show name + avatar */
  username?: string;
  displayName?: string;
  /** Already normalized absolute URL (or default avatar) */
  avatarUrl?: string | null;
}

export interface Badge {
  id: string;
  label: string;
  description: string;
  earnedAt: string;
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issuedAt: string;
  url?: string;
}

/**
 * Shape of /users/me/ coming from the backend.
 * avatar_url / picture are optional and can be wired later on the server.
 */
interface UserMeApi extends CurrentUser {
  picture?: string | null;
}

interface EthikosStanceApi {
  id: number;
  user: string;
  value: number;
  timestamp: string;
}

interface EthikosArgumentApi {
  id: number;
  user: string;
  content: string;
  created_at: string;
}

interface VoteApi {
  id: number;
  user: string;
  target_type: string;
  target_id: number;
  raw_value: string | number;
  weighted_value: string | number;
  voted_at: string;
}

// ──────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────

function countLastDays(dates: string[], days: number): number {
  const now = dayjs();
  const cut = now.subtract(days, 'day');
  return dates.filter((d) => dayjs(d).isAfter(cut)).length;
}

// ──────────────────────────────────────────────────────────
// Reputation profile (derived from real contributions)
// ──────────────────────────────────────────────────────────

export async function fetchUserProfile(): Promise<ReputationProfile> {
  const [me, stances, args, votes] = await Promise.all([
    get<UserMeApi>('users/me/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<EthikosArgumentApi[]>('ethikos/arguments/'),
    get<VoteApi[]>('kollective/votes/'),
  ]);

  const username = me.username;
  const displayName = me.name ?? me.username;

  // Prefer explicit avatar_url; fall back to older "picture" if present.
  const rawAvatar = me.avatar_url ?? me.picture ?? null;
  const avatarUrl = resolveAvatarUrl({ avatar_url: rawAvatar });

  const myStances = stances.filter((s) => s.user === username);
  const myArguments = args.filter((a) => a.user === username);
  const myVotes = votes.filter((v) => v.user === username);

  const contributionScore =
    myStances.length * 3 + myArguments.length * 2 + myVotes.length * 4;
  const score = Math.max(10, Math.min(100, contributionScore));

  let level: ReputationProfile['level'];
  if (score >= 75) level = 'Steward';
  else if (score >= 40) level = 'Contributor';
  else level = 'Visitor';

  const stanceDates = myStances.map((s) => s.timestamp);
  const recentStances = countLastDays(stanceDates, 30);
  const previousStances = countLastDays(stanceDates, 60) - recentStances;

  const recent: { label: string; change: number }[] = [
    {
      label: 'Stances last 30 days',
      change: recentStances - previousStances,
    },
  ];

  const influenceScore = myVotes.reduce((acc, v) => {
    const w =
      typeof v.weighted_value === 'string'
        ? parseFloat(v.weighted_value)
        : v.weighted_value;
    return acc + (Number.isFinite(w) ? Number(w) : 0);
  }, 0);

  const dimensions: ReputationDimension[] = [
    {
      key: 'deliberation',
      label: 'Deliberation quality',
      score: Math.min(100, myArguments.length * 5),
      weight: 0.35,
    },
    {
      key: 'participation',
      label: 'Participation',
      score: Math.min(100, myStances.length * 4),
      weight: 0.35,
    },
    {
      key: 'influence',
      label: 'Influence (weighted votes)',
      score: Math.min(100, influenceScore),
      weight: 0.3,
    },
  ];

  return {
    level,
    score,
    dimensions,
    recent,
    username,
    displayName,
    avatarUrl,
  };
}

// ──────────────────────────────────────────────────────────
// Credentials (no real backend endpoint yet)
// ──────────────────────────────────────────────────────────

/**
 * There is currently no dedicated credential storage API.
 * This helper resolves immediately so the UI flow can be wired.
 * When a backend exists, the upload call should be wired here.
 */
export async function uploadCredential(_file: File): Promise<void> {
  return;
}

// ──────────────────────────────────────────────────────────
// Badges derived from real activity
// ──────────────────────────────────────────────────────────

export async function fetchUserBadges(): Promise<Badge[]> {
  const [me, stances, args, votes] = await Promise.all([
    get<UserMeApi>('users/me/'),
    get<EthikosStanceApi[]>('ethikos/stances/'),
    get<EthikosArgumentApi[]>('ethikos/arguments/'),
    get<VoteApi[]>('kollective/votes/'),
  ]);

  const username = me.username;

  const myStances = stances.filter((s) => s.user === username);
  const myArguments = args.filter((a) => a.user === username);
  const myVotes = votes.filter((v) => v.user === username);

  const badges: Badge[] = [];

  if (myStances.length > 0) {
    const first = myStances.reduce((min, s) =>
      dayjs(s.timestamp).isBefore(min.timestamp) ? s : min,
    );
    badges.push({
      id: 'first-stance',
      label: 'First stance',
      description: 'Recorded your first stance in a debate.',
      earnedAt: first.timestamp,
    });
  }

  if (myArguments.length >= 5) {
    const first = myArguments.reduce((min, a) =>
      dayjs(a.created_at).isBefore(min.created_at) ? a : min,
    );
    badges.push({
      id: 'argument-builder',
      label: 'Argument builder',
      description: 'Contributed at least 5 arguments to debates.',
      earnedAt: first.created_at,
    });
  }

  if (myVotes.length >= 10) {
    const first = myVotes.reduce((min, v) =>
      dayjs(v.voted_at).isBefore(min.voted_at) ? v : min,
    );
    badges.push({
      id: 'active-voter',
      label: 'Active voter',
      description: 'Cast at least 10 weighted votes across the platform.',
      earnedAt: first.voted_at,
    });
  }

  return badges;
}
