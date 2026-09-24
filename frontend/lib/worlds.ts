export type WorldRouteContext = {
  key: string;
  appPath: string;
};

export type WorldReleaseSummary = {
  id: number;
  release_number: number;
  status: string;
  is_dirty: boolean;
};

export type WorldSummary = {
  id: number;
  key: string;
  title: string;
  status: string;
  visibility: string;
  current_release: WorldReleaseSummary | null;
  can_manage: boolean;
};

export type WorldRuntime = {
  architecture_lock: string;
  world: { id: number; key: string; title: string };
  release: { id: number; number: number; dirty: boolean };
  view_as: null | { persona_id: number; display_name: string };
  capabilities?: { data_plane_enabled: boolean; scoped_api_enforced: boolean };
};

const WORLD_KEY_PATTERN = '[a-z0-9](?:[a-z0-9-]{0,118}[a-z0-9])?';
const WORLD_PATH_RE = new RegExp(`^/w/(${WORLD_KEY_PATTERN})(/.*)?$`, 'i');

/** APIs that remain owned by the global/control plane even inside a World URL. */
const GLOBAL_API_PREFIXES = [
  'control/',
  'users/',
  'auth-token/',
  'schema/',
  'docs/',
  'integrations/',
  '_api/',
] as const;

/** Exact global admin surfaces; moderation/config can remain World-scoped. */
const GLOBAL_API_EXACT_PREFIXES = [
  'admin/users',
  'admin/audit-log',
  'admin/stats',
] as const;

function splitSuffix(value: string): { pathname: string; suffix: string } {
  const index = value.search(/[?#]/);
  if (index < 0) return { pathname: value, suffix: '' };
  return { pathname: value.slice(0, index), suffix: value.slice(index) };
}

function trimApiPrefix(path: string): string {
  let clean = path.trim().replace(/^\/+/, '');
  if (clean.startsWith('api/')) clean = clean.slice(4);
  return clean;
}

export function isWorldKey(value: string | null | undefined): value is string {
  if (!value) return false;
  return new RegExp(`^${WORLD_KEY_PATTERN}$`, 'i').test(value);
}

export function parseWorldPath(
  pathname: string | null | undefined,
): WorldRouteContext | null {
  const path = pathname || '/';
  const match = WORLD_PATH_RE.exec(path);
  if (!match?.[1]) return null;
  return {
    key: match[1].toLowerCase(),
    appPath: match[2] || '/',
  };
}

export function getWorldKeyFromPathname(
  pathname: string | null | undefined,
): string | null {
  return parseWorldPath(pathname)?.key ?? null;
}

export function stripWorldPrefix(
  pathname: string | null | undefined,
): string {
  return parseWorldPath(pathname)?.appPath ?? pathname ?? '/';
}

/** Prefix an internal application path while preserving query/hash suffixes. */
export function withWorldPath(
  path: string,
  worldKey: string | null | undefined,
): string {
  if (!worldKey || !isWorldKey(worldKey)) return path || '/';
  if (/^https?:\/\//i.test(path)) return path;

  const { pathname, suffix } = splitSuffix(path || '/');
  const existing = parseWorldPath(pathname);
  const appPath = existing?.appPath ?? (pathname.startsWith('/') ? pathname : `/${pathname}`);
  const scoped = `/w/${worldKey}${appPath === '/' ? '' : appPath}`;
  return `${scoped}${suffix}`;
}

export function switchWorldPath(
  currentPath: string,
  targetWorldKey: string,
  fallbackPath = '/ethikos/insights',
): string {
  const appPath = stripWorldPrefix(currentPath);
  const usefulPath = appPath === '/' ? fallbackPath : appPath;
  return withWorldPath(usefulPath, targetWorldKey);
}

export function isGlobalApiPath(path: string): boolean {
  const clean = trimApiPrefix(path);
  if (clean.startsWith('w/')) return true;

  if (
    GLOBAL_API_EXACT_PREFIXES.some(
      (prefix) => clean === prefix || clean.startsWith(`${prefix}/`),
    )
  ) {
    return true;
  }

  return GLOBAL_API_PREFIXES.some(
    (prefix) => clean === prefix.slice(0, -1) || clean.startsWith(prefix),
  );
}

export function scopeApiPath(
  path: string,
  worldKey: string | null | undefined,
): string {
  if (!worldKey || !isWorldKey(worldKey) || isGlobalApiPath(path)) return path;

  const { pathname, suffix } = splitSuffix(path);
  const hadLeadingSlash = pathname.startsWith('/');
  const clean = trimApiPrefix(pathname);
  const scoped = `w/${worldKey}/${clean}`;
  return `${hadLeadingSlash ? '/' : ''}${scoped}${suffix}`;
}

export function scopeApiPathForBrowser(path: string): string {
  if (typeof window === 'undefined') return path;
  return scopeApiPath(path, getWorldKeyFromPathname(window.location.pathname));
}

export class StaleWorldReleaseError extends Error {
  readonly world: string;
  readonly responseReleaseId: string;
  readonly expectedReleaseId: string;

  constructor(world: string, responseReleaseId: string, expectedReleaseId: string) {
    super(
      `Discarded stale ${world} release ${responseReleaseId} response; expected release ${expectedReleaseId}.`,
    );
    this.name = 'StaleWorldReleaseError';
    this.world = world;
    this.responseReleaseId = responseReleaseId;
    this.expectedReleaseId = expectedReleaseId;
  }
}

export class StaleWorldResponseError extends Error {
  readonly responseWorld: string;
  readonly activeWorld: string;

  constructor(responseWorld: string, activeWorld: string) {
    super(`Discarded response for World ${responseWorld}; active World is ${activeWorld}.`);
    this.name = 'StaleWorldResponseError';
    this.responseWorld = responseWorld;
    this.activeWorld = activeWorld;
  }
}

export function assertCurrentWorldResponse(
  responseWorld: string | null | undefined,
  responseReleaseId?: string | number | null,
): void {
  if (typeof window === 'undefined' || !responseWorld) return;
  const activeWorld = getWorldKeyFromPathname(window.location.pathname);
  if (activeWorld && responseWorld.toLowerCase() !== activeWorld.toLowerCase()) {
    throw new StaleWorldResponseError(responseWorld, activeWorld);
  }

  const expectedRelease = document.documentElement.dataset.kxWorldReleaseId;
  if (
    activeWorld &&
    expectedRelease &&
    responseReleaseId != null &&
    String(responseReleaseId) !== expectedRelease
  ) {
    const actual = String(responseReleaseId);
    window.dispatchEvent(
      new CustomEvent('konnaxion:world-release-changed', {
        detail: {
          world: activeWorld,
          expectedReleaseId: expectedRelease,
          responseReleaseId: actual,
        },
      }),
    );
    throw new StaleWorldReleaseError(activeWorld, actual, expectedRelease);
  }
}

/** Scope absolute or /api/* browser URLs without touching non-API URLs. */
export function scopeBrowserApiUrl(value: string): string {
  if (typeof window === 'undefined') return value;

  try {
    const absolute = /^https?:\/\//i.test(value);
    const url = new URL(value, window.location.origin);
    const marker = '/api/';
    const index = url.pathname.indexOf(marker);
    if (index < 0) return value;

    const prefix = url.pathname.slice(0, index + marker.length);
    const apiPath = url.pathname.slice(index + marker.length);
    const scoped = scopeApiPathForBrowser(apiPath).replace(/^\/+/, '');
    url.pathname = `${prefix}${scoped}`;
    return absolute ? url.toString() : `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return value;
  }
}

/** Build the canonical release-pinned WebSocket route for the active World. */
export function scopeWorldWebSocketPath(
  path: string,
  worldKey: string | null | undefined,
): string | null {
  if (!worldKey || !isWorldKey(worldKey)) return null;

  const { pathname, suffix } = splitSuffix(path || '/ws/reports/custom');
  const clean = pathname.replace(/^\/+/, '');
  const alreadyScoped = clean.match(/^ws\/w\/[^/]+\/(.+)$/i);
  const socketPath = alreadyScoped
    ? alreadyScoped[1]
    : clean.startsWith('ws/')
      ? clean.slice(3)
      : clean;
  return `/ws/w/${worldKey}/${socketPath}${suffix}`;
}

/** Resolve a browser WebSocket URL that cannot silently drop World context. */
export function resolveWorldWebSocketUrl(
  path = '/ws/reports/custom',
  base?: string | null,
): string | null {
  if (typeof window === 'undefined') return null;

  const worldKey = getWorldKeyFromPathname(window.location.pathname);
  const scopedPath = scopeWorldWebSocketPath(path, worldKey);
  if (!scopedPath) return null;

  const rawBase = base?.trim();
  if (!rawBase) {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}${scopedPath}`;
  }

  try {
    let normalized = rawBase;
    if (normalized.startsWith('http://')) {
      normalized = `ws://${normalized.slice('http://'.length)}`;
    } else if (normalized.startsWith('https://')) {
      normalized = `wss://${normalized.slice('https://'.length)}`;
    } else if (!normalized.startsWith('ws://') && !normalized.startsWith('wss://')) {
      normalized = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${normalized}`;
    }

    const url = new URL(normalized);
    const wsIndex = url.pathname.indexOf('/ws/');
    const basePath = wsIndex >= 0
      ? url.pathname.slice(0, wsIndex)
      : url.pathname === '/'
        ? ''
        : url.pathname.replace(/\/+$/, '');
    return `${url.protocol}//${url.host}${basePath}${scopedPath}`;
  } catch {
    return null;
  }
}
