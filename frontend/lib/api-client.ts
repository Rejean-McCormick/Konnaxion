// FILE: frontend/lib/api-client.ts
// lib/api-client.ts
import { apiFetch, buildUrl } from '@/api';

/** Simple GET helper that carries cookies and the active World context. */
export async function apiGet<T>(path: string): Promise<T> {
  const res = await apiFetch(buildUrl(path), {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`GET ${path} failed with status ${res.status}`);
  }

  return (await res.json()) as T;
}
