// FILE: frontend/app/_api/version/route.ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const runtime = 'nodejs';

async function readNextBuildId(): Promise<string | null> {
  try {
    const buildIdPath = path.join(process.cwd(), '.next', 'BUILD_ID');
    const buildId = (await readFile(buildIdPath, 'utf8')).trim();
    return buildId || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const nextBuildId = await readNextBuildId();
  const releaseId = process.env.KX_RELEASE_ID ?? process.env.RELEASE_ID ?? null;
  const appVersion = process.env.KX_APP_VERSION ?? process.env.APP_VERSION ?? null;

  // .next/BUILD_ID is generated uniquely by `next build` and is the preferred
  // deployment identity. Release metadata is retained as a production fallback.
  const buildId = nextBuildId ?? releaseId ?? appVersion ?? 'development';

  return NextResponse.json(
    {
      buildId,
      releaseId,
      appVersion,
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    },
  );
}
