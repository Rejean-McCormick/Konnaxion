import { get } from './_request'

export interface LogRow {
  id: string
  ts: string                  // ISO timestamp
  actor: string               // utilisateur / service
  action: string              // ex: "UPDATE_TOPIC"
  entity?: string             // ex: "topic"
  entityId?: string
  ip?: string
  status?: 'ok' | 'warn' | 'error'
  meta?: Record<string, any>  // détails JSON
}

export interface AuditPayload {
  items: LogRow[]
  page: number
  pageSize: number
  total: number
}

/** GET /admin/audit/logs */
export async function fetchAuditLogs(params?: {
  page?: number
  pageSize?: number
  q?: string
  sort?: string
}): Promise<AuditPayload> {
  return get('admin/audit/logs', { params })
}
