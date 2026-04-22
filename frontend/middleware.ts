// middleware.ts
import { NextResponse, type NextRequest } from 'next/server';
import { AUTH0_ENABLED, auth0 } from './lib/auth0';

export async function middleware(request: NextRequest) {
  if (!AUTH0_ENABLED || !auth0) {
    return NextResponse.next();
  }

  return auth0.middleware(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};