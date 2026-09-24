import { NextRequest, NextResponse } from 'next/server';

import {
  DEFAULT_LANGUAGE,
  detectLanguageFromAcceptLanguage,
  isLanguage,
  LANGUAGE_COOKIE_KEY,
  LANGUAGE_COOKIE_MAX_AGE,
} from './i18n/config';
import { getWorldKeyFromPathname, isGlobalApiPath, withWorldPath } from './lib/worlds';

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

function sourceWorld(request: NextRequest): string | null {
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const key = getWorldKeyFromPathname(new URL(referer).pathname);
      if (key) return key;
    } catch {
      // Ignore malformed/untrusted Referer and try Next's navigation header.
    }
  }

  const nextUrl = request.headers.get('next-url');
  if (nextUrl) {
    try {
      const key = getWorldKeyFromPathname(new URL(nextUrl, request.nextUrl.origin).pathname);
      if (key) return key;
    } catch {
      // No usable navigation context.
    }
  }

  return null;
}

function isUiCarryoverCandidate(pathname: string): boolean {
  if (pathname.startsWith('/w/')) return false;
  if (STATIC_FILE_RE.test(pathname)) return false;
  return !GLOBAL_UI_PREFIXES.some(
    (prefix) => pathname === prefix.replace(/\/$/, '') || pathname.startsWith(prefix),
  );
}

/**
 * World routing safety net.
 *
 * 1) Legacy same-origin /api/* calls made from a World page are rewritten to
 *    /api/w/<world>/* unless the API is explicitly global.
 * 2) Legacy hard-coded internal links preserve the active World with a redirect.
 *
 * Canonical helpers remain the primary path; this middleware protects older
 * call-sites while the application is incrementally normalized.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const worldKey = sourceWorld(request);

  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.slice('/api/'.length);
    if (!worldKey || isGlobalApiPath(apiPath)) {
      return withDetectedLanguageCookie(request, NextResponse.next());
    }

    const target = request.nextUrl.clone();
    target.pathname = `/api/w/${worldKey}/${apiPath}`;
    return withDetectedLanguageCookie(request, NextResponse.rewrite(target));
  }

  if (
    worldKey &&
    (request.method === 'GET' || request.method === 'HEAD') &&
    isUiCarryoverCandidate(pathname)
  ) {
    const target = request.nextUrl.clone();
    target.pathname = withWorldPath(pathname, worldKey);
    return withDetectedLanguageCookie(request, NextResponse.redirect(target));
  }

  return withDetectedLanguageCookie(request, NextResponse.next());
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
};
