// services/admin.ts
import { get, post, put, patch, del } from './_request';

// Moderation
export async function fetchModerationQueue() {
  return get('admin/moderation');
}
export async function actOnReport(id: string, remove: boolean) {
  return post(`admin/moderation/${id}`, { remove });
}

// Roles
export async function fetchRoles() {
  return get('admin/roles');
}
export async function toggleRole(id: string, enabled: boolean) {
  return patch(`admin/roles/${id}`, { enabled });
}

// Audit
export async function fetchAuditLogs() {
  return get('admin/audit');
}
