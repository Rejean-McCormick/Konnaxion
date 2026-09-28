import { NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_LANGUAGE,
  detectLanguageFromAcceptLanguage,
  isLanguage,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_COOKIE_MAX_AGE,
} from './i18n/config';
import { isGlobalApiPath, parseWorldPath, withWorldPath } from './lib/worlds';

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

function parseSourcePath(pathname: string): SourceContext {
  const parsed = parseWorldPath(pathname);
  return parsed ? { universeKey: parsed.universeKey, worldKey: parsed.key } : null;
}

function sourceContext(request: NextRequest): SourceContext {
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const context = parseSourcePath(new URL(referer).pathname);
      if (context) return context;
    } catch {
      // Ignore malformed/untrusted Referer and try Next's navigation header.
    }
  }

  const nextUrl = request.headers.get('next-url');
  if (nextUrl) {
    try {
      const context = parseSourcePath(new URL(nextUrl, request.nextUrl.origin).pathname);
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
  const pathname = request.nextUrl.pathname;
  const context = sourceContext(request);

  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice('/api/'.length);
    if (!context || isGlobalApiPath(apiPath)) {
      return withDetectedLanguageCookie(request, NextResponse.next());
    }

    const target = request.nextUrl.clone();
    target.pathname = context.universeKey
      ? `/api/u/${context.universeKey}/w/${context.worldKey}/${apiPath}`
      : `/api/w/${context.worldKey}/${apiPath}`;
    return withDetectedLanguageCookie(request, NextResponse.rewrite(target));
  }

  if (
    context &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    isUiCarryoverCandidate(pathname)
  ) {
    const target = request.nextUrl.clone();
    target.pathname = withWorldPath(pathname, context.worldKey, context.universeKey);
    return withDetectedLanguageCookie(request, NextResponse.redirect(target));
  }

  return withDetectedLanguageCookie(request, NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
