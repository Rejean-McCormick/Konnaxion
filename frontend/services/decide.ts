import { get, post, put, patch, del } from './_request'
import type { Ballot } from '@/types'

/** GET /decide/elite/ballots */
export async function fetchEliteBallots(): Promise<{
  ballots: (Ballot & { turnout: number })[]
}> {
  return get('decide/elite/ballots')
}

/** GET /decide/public/ballots */
export async function fetchPublicBallots(): Promise<{
  ballots: (Ballot & { options: string[]; turnout: number })[]
}> {
  return get('decide/public/ballots')
}

/** POST /decide/public/ballots/:id/vote */
export async function submitPublicVote(
  id: string,
  option: string,
): Promise<{ ok: true }> {
  return post(`decide/public/ballots/${id}/vote`, { option })
}

/** GET /decide/results */
export async function fetchDecisionResults(): Promise<{
  items: {
    id: string
    title: string
    scope: 'Elite' | 'Public'
    passed: boolean
    closesAt: string
    region: string
  }[]
}> {
  return get('decide/results')
}
