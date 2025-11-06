// services/impact.ts
import { get, post, put, patch, del } from './_request';

/* ------------------------------------------------------------------ *
 *  Tracker (Kanban / table)                                           *
 * ------------------------------------------------------------------ */

export type ImpactStatus = 'Planned' | 'In-Progress' | 'Completed' | 'Blocked';

export interface TrackerItem {
  id: string;
  title: string;
  owner: string;
  status: ImpactStatus;
  updatedAt: string;                    // ISO-8601 timestamp
}

/** GET /impact/tracker */
export async function fetchImpactTracker(): Promise<{
  items: TrackerItem[];
}> {
  return get('impact/tracker');
}

/** PATCH /impact/tracker/:id  (update status only) */
export async function patchImpactStatus(
  id: string,
  status: ImpactStatus,
): Promise<void> {
  await patch(`impact/tracker/${id}`, { status });
}

/* ------------------------------------------------------------------ *
 *  Outcomes dashboard                                                 *
 * ------------------------------------------------------------------ */

export interface OutcomeKPI {
  label: string;
  value: number;
  delta?: number;                       // % change vs previous period
}

export interface OutcomeChart {
  title: string;
  type: 'line' | 'bar';
  config: Record<string, any>;          // Ant Design Plots config
}

/** GET /impact/outcomes */
export async function fetchImpactOutcomes(): Promise<{
  kpis: OutcomeKPI[];
  charts: OutcomeChart[];
}> {
  return get('impact/outcomes');
}

/* ------------------------------------------------------------------ *
 *  Feedback loops                                                     *
 * ------------------------------------------------------------------ */

export interface FeedbackItem {
  id: string;
  author: string;
  body: string;
  rating?: number;                      // 1-5 stars, optional
  createdAt: string;                    // ISO-8601 timestamp
}

/** GET /impact/feedback */
export async function fetchFeedback(): Promise<{
  items: FeedbackItem[];
}> {
  return get('impact/feedback');
}

/** POST /impact/feedback */
export async function submitFeedback(payload: {
  body: string;
  rating?: number;
}): Promise<void> {
  await post('impact/feedback', payload);
}
