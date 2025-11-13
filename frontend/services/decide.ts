// C:\MyCode\Konnaxionv14\frontend\services\decide.ts
import { get, post } from './_request'
import type { Ballot } from '@/types'

export type EliteBallot = Ballot & { turnout: number }

export type PublicBallot = Ballot & {
  options: string[]
  turnout: number
}

/** Response payload for elite ballots */
export interface EliteBallotResponse {
  ballots: EliteBallot[]
}

/** Response payload for public ballots */
export interface PublicBallotResponse {
  ballots: PublicBallot[]
}

export type DecisionScope = 'Elite' | 'Public'

export interface DecisionResult {
  id: string
  title: string
  scope: DecisionScope
  passed: boolean
  closesAt: string
  region: string
}

export interface DecisionResultsResponse {
  items: DecisionResult[]
}

/** GET /decide/elite/ballots → /api/decide/elite/ballots */
export async function fetchEliteBallots(): Promise<EliteBallotResponse> {
  return get<EliteBallotResponse>('decide/elite/ballots')
}

/** GET /decide/public/ballots → /api/decide/public/ballots */
export async function fetchPublicBallots(): Promise<PublicBallotResponse> {
  return get<PublicBallotResponse>('decide/public/ballots')
}

/** POST /decide/public/ballots/:id/vote → /api/decide/public/ballots/:id/vote */
export async function submitPublicVote(
  id: string,
  option: string,
): Promise<{ ok: true }> {
  return post<{ ok: true }>(`decide/public/ballots/${id}/vote`, { option })
}

/** GET /decide/results → /api/decide/results */
export async function fetchDecisionResults(): Promise<DecisionResultsResponse> {
  return get<DecisionResultsResponse>('decide/results')
}
