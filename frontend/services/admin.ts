// services/admin.ts
import { get, post, patch } from './_request'

// ----- Shared Admin types -----
export type RoleRow = { id: string; name: string; userCount: number; enabled: boolean }
export type RolePayload = { items: RoleRow[] }

export type Report = {
  id: string
  content: string
  reporter: string
  type: 'Spam' | 'Harassment' | 'Misinformation'
  status: 'Pending' | 'Resolved'
}
export type ModerationPayload = { items: Report[] }

// Narrow log shape used by admin pages
export type LogRow = {
  id: string
  actor: string
  action: string
  target: string
  severity: 'info' | 'warn' | 'critical'
  ts: string
}
export type AuditPayload = { items: LogRow[] }

// ----- API calls with explicit return types -----
export async function fetchModerationQueue(): Promise<ModerationPayload> {
  return get<ModerationPayload>('admin/moderation')
}

export async function actOnReport(id: string, remove: boolean): Promise<void> {
  return post<void>(`admin/moderation/${id}`, { remove })
}

export async function fetchRoles(): Promise<RolePayload> {
  return get<RolePayload>('admin/roles')
}

export async function toggleRole(id: string, enabled: boolean): Promise<void> {
  return patch<void>(`admin/roles/${id}`, { enabled })
}

export async function fetchAuditLogs(): Promise<AuditPayload> {
  return get<AuditPayload>('admin/audit')
}
