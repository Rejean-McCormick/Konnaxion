// services/admin.ts
import apiRequest from './_request';

// Moderation
export async function fetchModerationQueue() {
  return apiRequest.get('admin/moderation');
}
export async function actOnReport(id: string, remove: boolean) {
  return apiRequest.post(`admin/moderation/${id}`, { remove });
}

// Roles
export async function fetchRoles() {
  return apiRequest.get('admin/roles');
}
export async function toggleRole(id: string, enabled: boolean) {
  return apiRequest.patch(`admin/roles/${id}`, { enabled });
}

// Audit
export async function fetchAuditLogs() {
  return apiRequest.get('admin/audit');
}
