import { get, post, put, patch, del } from './_request'
import type { KPI } from '@/types'

export interface KPIWithHistory extends KPI {
  history: { date: string; value: number }[]
}

/** GET /pulse/overview */
export async function fetchPulseOverview(): Promise<{
  refreshedAt: string
  kpis: KPIWithHistory[]
}> {
  return get('pulse/overview')
}

export interface LiveCounter {
  label: string
  value: number
  trend: number
  history: { ts: number; value: number }[]
}

/** GET /pulse/live */
export async function fetchPulseLiveData(): Promise<{
  counters: LiveCounter[]
}> {
  return get('pulse/live')
}

export type TrendChartType = 'line' | 'area' | 'heatmap'

export interface TrendChart {
  title: string
  type: TrendChartType
  config: Record<string, any>
}

/** GET /pulse/trends */
export async function fetchPulseTrends(): Promise<{
  charts: TrendChart[]
}> {
  return get('pulse/trends')
}

export interface HealthResponse {
  radarConfig: Record<string, any>
  pieConfig: Record<string, any>
}

/** GET /pulse/health */
export async function fetchPulseHealth(): Promise<HealthResponse> {
  return get('pulse/health')
}
