import { NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_LANGUAGE,
  detectLanguageFromAcceptLanguage,
  isLanguage,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_COOKIE_MAX_AGE,
} from './i18n/config';
import {
  getUniverseKeyFromHostname,
  isGlobalApiPath,
  parseWorldPath,
  withWorldPath,
} from './lib/worlds';

const STATIC_FILE_RE = /\.[a-z0-9]{2,10}$/i;
const GLOBAL_UI_PREFIXES = [
  '/_next/',
  '/_api/',
  '/api/',
  '/accounts/',
  '/users/',
  '/admin/',
  '/health',
  '/ping',
] as const;

type SourceContext = { universeKey: string | null; worldKey: string } | null;


function buildContentSecurityPolicy(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https:",
    "connect-src 'self' https: wss:",
    "media-src 'self' blob: https:",
    "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');
}

function securityContext(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildContentSecurityPolicy(nonce);
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);
  return { csp, requestHeaders };
}

function finalizeResponse(
  request: NextRequest,
  response: NextResponse,
  csp: string,
): NextResponse {
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
  return withDetectedLanguageCookie(request, response);
}

function withDetectedLanguageCookie(
  request: NextRequest,
  response: NextResponse,
): NextResponse {
  const persisted = request.cookies.get(LANGUAGE_COOKIE_KEY)?.value;
  if (isLanguage(persisted)) return response;

  const detected =
    detectLanguageFromAcceptLanguage(request.headers.get('accept-language')) ??
    DEFAULT_LANGUAGE;

  response.cookies.set(LANGUAGE_COOKIE_KEY, detected, {
    path: '/',
    maxAge: LANGUAGE_COOKIE_MAX_AGE,
    sameSite: 'lax',
  });

  return response;
}

function parseSourcePath(
  pathname: string,
  hostname?: string | null,
): SourceContext {
  const parsed = parseWorldPath(pathname);
  if (!parsed) return null;
  return {
    universeKey:
      parsed.universeKey ?? getUniverseKeyFromHostname(hostname ?? null),
    worldKey: parsed.key,
  };
}

function sourceContext(request: NextRequest): SourceContext {
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const sourceUrl = new URL(referer);
      const context = parseSourcePath(sourceUrl.pathname, sourceUrl.hostname);
      if (context) return context;
    } catch {
      // Ignore malformed/untrusted Referer and try Next's navigation header.
    }
  }

  const nextUrl = request.headers.get('next-url');
  if (nextUrl) {
    try {
      const sourceUrl = new URL(nextUrl, request.nextUrl.origin);
      const context = parseSourcePath(sourceUrl.pathname, sourceUrl.hostname);
      if (context) return context;
    } catch {
      // No usable navigation context.
    }
  }

  return null;
}

function isUiCarryoverCandidate(pathname: string): boolean {
  if (pathname.startsWith('/w/') || pathname.startsWith('/u/')) return false;
  if (STATIC_FILE_RE.test(pathname)) return false;
  return !GLOBAL_UI_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, '') || pathname.startsWith(prefix),
  );
}

/**
 * Universe/World routing safety net for legacy hard-coded links and API calls.
 * Canonical helpers remain the primary path.
 */
export function middleware(request: NextRequest) {
  const { csp, requestHeaders } = securityContext(request);
  const pathname = request.nextUrl.pathname;
  const hostUniverseKey = getUniverseKeyFromHostname(request.nextUrl.hostname);
  const pathContext = parseWorldPath(pathname);

  if (
    hostUniverseKey &&
    pathContext?.universeKey &&
    hostUniverseKey !== pathContext.universeKey
  ) {
    return finalizeResponse(request, new NextResponse('UNIVERSE_HOST_PATH_CONFLICT', { status: 400 }), csp);
  }

  const context = sourceContext(request);

  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice('/api/'.length);
    if (!context || isGlobalApiPath(apiPath)) {
      return finalizeResponse(request, NextResponse.next({ request: { headers: requestHeaders } }), csp);
    }

    const target = request.nextUrl.clone();
    target.pathname = context.universeKey
      ? `/api/u/${context.universeKey}/w/${context.worldKey}/${apiPath}`
      : `/api/w/${context.worldKey}/${apiPath}`;
    return finalizeResponse(request, NextResponse.rewrite(target, { request: { headers: requestHeaders } }), csp);
  }

  if (
    context &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    isUiCarryoverCandidate(pathname)
  ) {
    const target = request.nextUrl.clone();
    target.pathname = withWorldPath(pathname, context.worldKey, context.universeKey);
    return finalizeResponse(request, NextResponse.redirect(target), csp);
  }

  return finalizeResponse(request, NextResponse.next({ request: { headers: requestHeaders } }), csp);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
