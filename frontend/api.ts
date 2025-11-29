// FILE: frontend/api.ts
// C:\MyCode\Konnaxionv14\frontend\api.ts

// Keep all named exports from the generated request layer
export * from './services/_request';

// ---- Minimal fetch-based client with cookies included ----

const RAW_API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:8000/api';

// REAL trailing slash guarantee
const API_BASE = RAW_API_BASE.endsWith('/')
  ? RAW_API_BASE
  : `${RAW_API_BASE}/`;

function buildUrl(path: string): string {
  const clean = path.replace(/^\/+/, ''); // strip leading slashes
  return `${API_BASE}${clean}`;
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
): Promise<T> {
  const res = await fetch(buildUrl(path), {
    credentials: 'include', // IMPORTANT: send Django session cookie
    ...init,
  });

  if (!res.ok) {
    throw new Error(`Request to ${path} failed with status ${res.status}`);
  }

  // Handle empty responses
  if (res.status === 204 || res.status === 205) {
    return undefined as T;
  }

  return (await res.json()) as T;
}

async function get<T>(path: string, init: RequestInit = {}): Promise<T> {
  return requestJson<T>(path, {
    method: 'GET',
    ...init,
  });
}

async function post<T>(
  path: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  return requestJson<T>(path, {
    method: 'POST',
    body: body != null ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });
}

async function put<T>(
  path: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  return requestJson<T>(path, {
    method: 'PUT',
    body: body != null ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });
}

async function patch<T>(
  path: string,
  body?: unknown,
  init: RequestInit = {},
): Promise<T> {
  return requestJson<T>(path, {
    method: 'PATCH',
    body: body != null ? JSON.stringify(body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    ...init,
  });
}

async function del<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  return requestJson<T>(path, {
    method: 'DELETE',
    ...init,
  });
}

const api = {
  get,
  post,
  put,
  patch,
  delete: del,
  del,
};

export default api;
