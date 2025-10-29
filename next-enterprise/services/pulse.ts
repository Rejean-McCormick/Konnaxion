// services/pulse.ts
import apiRequest from './_request';
import type { KPI } from '@/types';

/* ------------------------------------------------------------------ *
 * 1 · Overview                                                        *
 * ------------------------------------------------------------------ */

export interface KPIWithHistory extends KPI {
  history: { date: string; value: number }[];
}

/** GET /pulse/overview */
export async function fetchPulseOverview(): Promise<{
  refreshedAt: string;               // ISO timestamp for “last updated”
  kpis: KPIWithHistory[];
}> {
  return apiRequest.get('pulse/overview');
}

/* ------------------------------------------------------------------ *
 * 2 · Live metrics                                                    *
 * ------------------------------------------------------------------ */

export interface LiveCounter {
  label: string;
  value: number;
  trend: number;                     // % change vs previous interval
  history: { ts: number; value: number }[];
}

/** GET /pulse/live */
export async function fetchPulseLiveData(): Promise<{
  counters: LiveCounter[];
}> {
  return apiRequest.get('pulse/live');
}

/* ------------------------------------------------------------------ *
 * 3 · Trends (multi-series charts)                                    *
 * ------------------------------------------------------------------ */

export type TrendChartType = 'line' | 'area' | 'heatmap';

export interface TrendChart {
  title: string;
  type: TrendChartType;
  /** Full Ant Design Plots config object */
  config: Record<string, any>;
}

/** GET /pulse/trends */
export async function fetchPulseTrends(): Promise<{
  charts: TrendChart[];
}> {
  return apiRequest.get('pulse/trends');
}

/* ------------------------------------------------------------------ *
 * 4 · Participation health                                            *
 * ------------------------------------------------------------------ */

export interface HealthResponse {
  radarConfig: Record<string, any>;
  pieConfig: Record<string, any>;
}

/** GET /pulse/health */
export async function fetchPulseHealth(): Promise<HealthResponse> {
  return apiRequest.get('pulse/health');
}
