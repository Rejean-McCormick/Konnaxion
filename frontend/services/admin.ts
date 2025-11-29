// FILE: frontend/services/admin.ts
// services/admin.ts
import { get, post, patch } from './_request'
import type { AuditPayload as AuditPayloadBase, LogRow as AuditLogRow } from './audit'
import { fetchAuditLogs as fetchAuditLogsRaw } from './audit'

// ----- Shared Admin types -----
export type RoleRow = {
  id: string
  name: string
  userCount: number
  enabled: boolean
}

export type RolePayload = { items: RoleRow[] }

export type Report = {
  id: string
  content: string
  reporter: string
  type: 'Spam' | 'Harassment' | 'Misinformation'
  status: 'Pending' | 'Resolved'
}

export type ModerationPayload = { items: Report[] }

// Re‑export canonical audit types from services/audit
export type LogRow = AuditLogRow
export type AuditPayload = AuditPayloadBase

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

/**
 * Convenience wrapper for audit logs used by the Admin UI.
 * It delegates to the canonical implementation in services/audit
 * and intentionally exposes a no‑arg signature so that
 * `useRequest<AuditPayload, []>(fetchAuditLogs)` keeps working.
 */
export async function fetchAuditLogs(): Promise<AuditPayload> {
  return fetchAuditLogsRaw()
}
