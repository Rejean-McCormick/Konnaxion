// services/decide.ts
import apiRequest from './_request';
import type { Ballot } from '@/types';

/* ------------------------------------------------------------------ *
 * 1. Elite ballots                                                    *
 * ------------------------------------------------------------------ */

/** GET /decide/elite/ballots */
export async function fetchEliteBallots(): Promise<{
  ballots: (Ballot & { turnout: number })[];
}> {
  return apiRequest.get('decide/elite/ballots');
}

/* ------------------------------------------------------------------ *
 * 2. Public ballots + voting                                          *
 * ------------------------------------------------------------------ */

/** GET /decide/public/ballots */
export async function fetchPublicBallots(): Promise<{
  ballots: (Ballot & { options: string[]; turnout: number })[];
}> {
  return apiRequest.get('decide/public/ballots');
}

/** POST /decide/public/ballots/:id/vote */
export async function submitPublicVote(
  id: string,
  option: string,
): Promise<void> {
  await apiRequest.post(`decide/public/ballots/${id}/vote`, { option });
}

/* ------------------------------------------------------------------ *
 * 3. Results archive                                                  *
 * ------------------------------------------------------------------ */

/** GET /decide/results */
export async function fetchDecisionResults(): Promise<{
  items: {
    id: string;
    title: string;
    scope: 'Elite' | 'Public';
    passed: boolean;
    closesAt: string;
    region: string;
  }[];
}> {
  return apiRequest.get('decide/results');
}
