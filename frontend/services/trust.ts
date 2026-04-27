// FILE: frontend/services/trust.ts
// frontend/services/trust.ts
import dayjs from 'dayjs';

import { get, post } from './_request';
import { resolveAvatarUrl, type CurrentUser } from './user';

type EthikosId = string | number;
type UnknownRecord = Record<string, unknown>;

export interface ReputationDimension {
  key: string;
  label: string;
  score: number;
  weight: number;
}

export interface TrustActivity {
  id: string;
  label: string;
  value?: string | number;
  createdAt?: string;
}

export type TrustLevel = 'Visitor' | 'Contributor' | 'Steward';

export interface TrustProfile {
  id: string;
  name: string;
  avatar?: string | null;
  joined?: string;
  score: number;
  activity: TrustActivity[];

  level: TrustLevel;
  dimensions: ReputationDimension[];
  recent: { label: string; change: number }[];

  /** Identity info derived from /users/me/ so UIs can show name + avatar */
  username?: string;
  displayName?: string;
  /** Already normalized absolute URL or default avatar */
  avatarUrl?: string | null;
}

/**
 * Backward-compatible name used by older trust screens.
 */
export type ReputationProfile = TrustProfile;

export interface TrustBadge {
  id: string;
  title: string;
  label: string;
  description: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
  createdAt?: string;
}

/**
 * Backward-compatible badge alias.
 */
export type Badge = TrustBadge;

export interface TrustBadgePayload {
  earned: TrustBadge[];
  progress: TrustBadge[];
}

export interface Credential {
  id: string;
  title: string;
  issuer: string;
  issuedAt: string;
  url?: string;
}

export interface UploadCredentialInput {
  title?: string;
  issuer?: string;
  issuedAt?: string | Date | null;
}

/**
 * Shape of /users/me/ coming from the backend.
 * avatar_url / picture are optional and can be wired later on the server.
 */
interface UserMeApi extends CurrentUser {
  id?: EthikosId;
  name?: string | null;
  display_name?: string | null;
  full_name?: string | null;
  username?: string;
  email?: string | null;
  avatar_url?: string | null;
  picture?: string | null;
  date_joined?: string | null;
  created_at?: string | null;
  joined?: string | null;
}

interface EthikosStanceApi {
  id: EthikosId;
  user?: EthikosId | null;
  user_id?: EthikosId | null;
  value?: number;
  timestamp?: string;
  created_at?: string;
}

interface EthikosArgumentApi {
  id: EthikosId;
  user?: EthikosId | null;
  user_id?: EthikosId | null;
  content?: string;
  created_at?: string;
}

interface VoteApi {
  id: EthikosId;
  user?: EthikosId | null;
  user_id?: EthikosId | null;
  target_type?: string;
  target_id?: EthikosId;
  raw_value?: string | number;
  weighted_value?: string | number;
  voted_at?: string;
  created_at?: string;
}

/* ------------------------------------------------------------------ */
/*  Generic helpers                                                    */
/* ------------------------------------------------------------------ */

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function unwrapPayload(raw: unknown): unknown {
  if (!isRecord(raw)) {
    return raw;
  }

  return raw.data ?? raw;
}

function readString(
  record: UnknownRecord,
  keys: string[],
): string | undefined {
  for (const key of keys) {
    const value = record[key];

    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function readNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function normalizeList<T>(
  raw: unknown,
  guard: (value: unknown) => value is T,
): T[] {
  const payload = unwrapPayload(raw);

  if (Array.isArray(payload)) {
    return payload.filter(guard);
  }

  if (!isRecord(payload)) {
    return [];
  }

  if (Array.isArray(payload.results)) {
    return payload.results.filter(guard);
  }

  if (Array.isArray(payload.items)) {
    return payload.items.filter(guard);
  }

  if (Array.isArray(payload.data)) {
    return payload.data.filter(guard);
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.results)) {
    return payload.data.results.filter(guard);
  }

  if (isRecord(payload.data) && Array.isArray(payload.data.items)) {
    return payload.data.items.filter(guard);
  }

  return [];
}

function isUserMeApi(value: unknown): value is UserMeApi {
  return isRecord(value);
}

function isStanceApi(value: unknown): value is EthikosStanceApi {
  return isRecord(value) && 'id' in value;
}

function isArgumentApi(value: unknown): value is EthikosArgumentApi {
  return isRecord(value) && 'id' in value;
}

function isVoteApi(value: unknown): value is VoteApi {
  return isRecord(value) && 'id' in value;
}

function countLastDays(dates: string[], days: number): number {
  const now = dayjs();
  const cutoff = now.subtract(days, 'day');

  return dates.filter((date) => dayjs(date).isAfter(cutoff)).length;
}

function titleFromFilename(name?: string): string {
  if (!name) {
    return 'Untitled credential';
  }

  const normalized = name
    .replace(/\.[a-zA-Z0-9]+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim();

  return normalized || 'Untitled credential';
}

function toIsoOrUndefined(
  value: string | Date | null | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
  }

  const parsed = dayjs(value);

  return parsed.isValid() ? parsed.toISOString() : undefined;
}

function getCurrentUserIdentity(me: UserMeApi): {
  id?: string;
  username: string;
  displayName: string;
  joined?: string;
  avatarUrl: string | null;
} {
  const userRecord = me as UnknownRecord;

  const id = readString(userRecord, ['id']);
  const username =
    readString(userRecord, ['username', 'email', 'name']) ?? 'current-user';

  const displayName =
    readString(userRecord, [
      'name',
      'display_name',
      'full_name',
      'username',
      'email',
    ]) ?? username;

  const joined = readString(userRecord, [
    'joined',
    'date_joined',
    'created_at',
  ]);

  const rawAvatar =
    readString(userRecord, ['avatar_url', 'picture', 'avatar']) ?? null;

  const avatarUrl = resolveAvatarUrl({ avatar_url: rawAvatar });

  return {
    id,
    username,
    displayName,
    joined,
    avatarUrl,
  };
}

function matchesCurrentUser(
  value: EthikosId | null | undefined,
  user: { id?: string; username: string },
): boolean {
  if (value === null || value === undefined) {
    return false;
  }

  const normalized = String(value);

  return normalized === user.username || normalized === user.id;
}

function getStanceDate(stance: EthikosStanceApi): string | undefined {
  return stance.timestamp ?? stance.created_at;
}

function getArgumentDate(argument: EthikosArgumentApi): string | undefined {
  return argument.created_at;
}

function getVoteDate(vote: VoteApi): string | undefined {
  return vote.voted_at ?? vote.created_at;
}

function makeBadge(params: {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  earnedAt?: string;
}): TrustBadge {
  const normalizedProgress = Math.max(0, Math.min(100, params.progress));

  return {
    id: params.id,
    title: params.title,
    label: params.title,
    description: params.description,
    earned: params.earned,
    progress: normalizedProgress,
    earnedAt: params.earnedAt,
    createdAt: params.earnedAt,
  };
}

/* ------------------------------------------------------------------ */
/*  Derived trust inputs                                               */
/* ------------------------------------------------------------------ */

async function fetchTrustInputs(): Promise<{
  me: UserMeApi;
  stances: EthikosStanceApi[];
  arguments: EthikosArgumentApi[];
  votes: VoteApi[];
}> {
  const [rawMe, rawStances, rawArguments, rawVotes] = await Promise.all([
    get<unknown>('users/me/'),
    get<unknown>('ethikos/stances/'),
    get<unknown>('ethikos/arguments/'),
    get<unknown>('kollective/votes/'),
  ]);

  const mePayload = unwrapPayload(rawMe);

  return {
    me: isUserMeApi(mePayload) ? mePayload : {},
    stances: normalizeList(rawStances, isStanceApi),
    arguments: normalizeList(rawArguments, isArgumentApi),
    votes: normalizeList(rawVotes, isVoteApi),
  };
}

function filterForCurrentUser<T extends { user?: EthikosId | null; user_id?: EthikosId | null }>(
  items: T[],
  user: { id?: string; username: string },
): T[] {
  return items.filter(
    (item) =>
      matchesCurrentUser(item.user, user) ||
      matchesCurrentUser(item.user_id, user),
  );
}

function buildTrustProfile(args: {
  user: ReturnType<typeof getCurrentUserIdentity>;
  stances: EthikosStanceApi[];
  arguments: EthikosArgumentApi[];
  votes: VoteApi[];
}): TrustProfile {
  const { user, stances, arguments: argumentsList, votes } = args;

  const myStances = filterForCurrentUser(stances, user);
  const myArguments = filterForCurrentUser(argumentsList, user);
  const myVotes = filterForCurrentUser(votes, user);

  const stanceDates = myStances
    .map(getStanceDate)
    .filter((date): date is string => Boolean(date));

  const argumentDates = myArguments
    .map(getArgumentDate)
    .filter((date): date is string => Boolean(date));

  const voteDates = myVotes
    .map(getVoteDate)
    .filter((date): date is string => Boolean(date));

  const recentStances = countLastDays(stanceDates, 30);
  const previousStances = countLastDays(stanceDates, 60) - recentStances;

  const influenceScore = myVotes.reduce(
    (acc, vote) => acc + readNumber(vote.weighted_value),
    0,
  );

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

  const score = Math.round(
    dimensions.reduce(
      (acc, dimension) => acc + dimension.score * dimension.weight,
      0,
    ),
  );

  const level: TrustLevel =
    score >= 75 ? 'Steward' : score >= 35 ? 'Contributor' : 'Visitor';

  const activity: TrustActivity[] = [
    {
      id: 'stances',
      label: 'Stances recorded',
      value: myStances.length,
      createdAt: stanceDates[0],
    },
    {
      id: 'arguments',
      label: 'Arguments contributed',
      value: myArguments.length,
      createdAt: argumentDates[0],
    },
    {
      id: 'votes',
      label: 'Weighted votes cast',
      value: myVotes.length,
      createdAt: voteDates[0],
    },
  ];

  return {
    id: user.id ?? user.username,
    name: user.displayName,
    avatar: user.avatarUrl,
    joined: user.joined,
    score,
    activity,
    level,
    dimensions,
    recent: [
      {
        label: 'Stances last 30 days',
        change: recentStances - previousStances,
      },
    ],
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };
}

function buildTrustBadges(args: {
  user: ReturnType<typeof getCurrentUserIdentity>;
  stances: EthikosStanceApi[];
  arguments: EthikosArgumentApi[];
  votes: VoteApi[];
}): TrustBadgePayload {
  const { user, stances, arguments: argumentsList, votes } = args;

  const myStances = filterForCurrentUser(stances, user);
  const myArguments = filterForCurrentUser(argumentsList, user);
  const myVotes = filterForCurrentUser(votes, user);

  const stanceDates = myStances
    .map(getStanceDate)
    .filter((date): date is string => Boolean(date));

  const argumentDates = myArguments
    .map(getArgumentDate)
    .filter((date): date is string => Boolean(date));

  const voteDates = myVotes
    .map(getVoteDate)
    .filter((date): date is string => Boolean(date));

  const firstStanceAt = stanceDates[0];
  const firstArgumentAt = argumentDates[0];
  const firstVoteAt = voteDates[0];

  const badges: TrustBadge[] = [
    makeBadge({
      id: 'first-stance',
      title: 'First stance',
      description: 'Recorded your first stance in a debate.',
      earned: myStances.length > 0,
      progress: myStances.length > 0 ? 100 : 0,
      earnedAt: firstStanceAt,
    }),
    makeBadge({
      id: 'argument-builder',
      title: 'Argument builder',
      description: 'Contributed at least 5 arguments to debates.',
      earned: myArguments.length >= 5,
      progress: (myArguments.length / 5) * 100,
      earnedAt: myArguments.length >= 5 ? firstArgumentAt : undefined,
    }),
    makeBadge({
      id: 'active-voter',
      title: 'Active voter',
      description: 'Cast at least 10 weighted votes across the platform.',
      earned: myVotes.length >= 10,
      progress: (myVotes.length / 10) * 100,
      earnedAt: myVotes.length >= 10 ? firstVoteAt : undefined,
    }),
  ];

  return {
    earned: badges.filter((badge) => badge.earned),
    progress: badges.filter((badge) => !badge.earned),
  };
}

/* ------------------------------------------------------------------ */
/*  Profile / badges                                                   */
/* ------------------------------------------------------------------ */

export async function fetchUserProfile(): Promise<ReputationProfile> {
  const { me, stances, arguments: argumentsList, votes } =
    await fetchTrustInputs();

  const user = getCurrentUserIdentity(me);

  return buildTrustProfile({
    user,
    stances,
    arguments: argumentsList,
    votes,
  });
}

export const fetchTrustProfile = fetchUserProfile;

export async function fetchTrustBadges(): Promise<TrustBadgePayload> {
  const { me, stances, arguments: argumentsList, votes } =
    await fetchTrustInputs();

  const user = getCurrentUserIdentity(me);

  return buildTrustBadges({
    user,
    stances,
    arguments: argumentsList,
    votes,
  });
}

/**
 * Backward-compatible helper for pages/hooks that expect a flat badge array.
 *
 * Current app pages and useReputationEvents call `fetchUserBadges()` as:
 *   Promise<Badge[]>
 */
export async function fetchUserBadges(): Promise<Badge[]> {
  const payload = await fetchTrustBadges();

  return [...payload.earned, ...payload.progress];
}

/**
 * Compatibility helper for older screens that still expect a flat array.
 */
export async function fetchUserBadgeList(): Promise<Badge[]> {
  return fetchUserBadges();
}

/* ------------------------------------------------------------------ */
/*  Credentials                                                        */
/* ------------------------------------------------------------------ */

/**
 * Upload a real-world credential for trust review.
 *
 * Backend serializer expects:
 *   file     (required, multipart)
 *   title    (optional; defaults from filename server-side)
 *   issuer   (optional)
 *   issuedAt (optional ISO-8601 string)
 */
export async function uploadCredential(
  file: File,
  meta: UploadCredentialInput = {},
): Promise<Credential> {
  const formData = new FormData();

  formData.append('file', file);

  const title = (meta.title ?? '').trim() || titleFromFilename(file.name);

  if (title) {
    formData.append('title', title);
  }

  const issuer = (meta.issuer ?? '').trim();

  if (issuer) {
    formData.append('issuer', issuer);
  }

  const issuedAt = toIsoOrUndefined(meta.issuedAt);

  if (issuedAt) {
    formData.append('issuedAt', issuedAt);
  }

  return post<Credential, FormData>('trust/credentials', formData);
}