// FILE: frontend/app/_api/admin/moderation/route.ts
import { NextRequest, NextResponse } from 'next/server'

type ReportType = 'Spam' | 'Harassment' | 'Misinformation'
type ReportStatus = 'Pending' | 'Resolved'

export interface Report {
  id: string
  content: string
  reporter: string
  type: ReportType
  status: ReportStatus
}

export interface ModerationPayload {
  items: Report[]
}

function hasReportItems(value: unknown): value is { items: Report[] } {
  if (typeof value !== 'object' || value === null || !('items' in value)) {
    return false
  }

  return Array.isArray((value as { items?: unknown }).items)
}

/** Resolve the backend through a server-only fixed internal origin. */
function resolveApiBase(): string {
  const fallback =
    process.env.NODE_ENV === 'production'
      ? 'http://django-api:5000/api'
      : 'http://127.0.0.1:8000/api'
  const raw = process.env.INTERNAL_API_BASE || process.env.API_PROXY_BASE || fallback
  return raw.replace(/\/+$/, '')
}

export async function GET(request: NextRequest) {
  const apiBase = resolveApiBase()
  const url = `${apiBase}/admin/moderation/`

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(request.headers.get('cookie') ? { Cookie: request.headers.get('cookie') as string } : {}),
        ...(request.headers.get('authorization') ? { Authorization: request.headers.get('authorization') as string } : {}),
      },
      // Ensure we always hit the live queue, not a cached copy
      cache: 'no-store',
    })

    if (res.ok) {
      const raw = await res.json()

      // Normalise shape to ModerationPayload:
      // - if backend already returns { items: [...] }, use it as‑is
      // - if backend returns a bare array, wrap it
      let payload: ModerationPayload

      if (Array.isArray(raw)) {
        payload = { items: raw as Report[] }
      } else if (hasReportItems(raw)) {
        payload = { items: raw.items }
      } else {
        payload = { items: [] }
      }

      return NextResponse.json<ModerationPayload>(payload, {
        status: 200,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    // Backend responded but with an error status
    return NextResponse.json(
      {
        error: 'Failed to fetch moderation queue from backend.',
        statusCode: res.status,
      },
      {
        status: res.status,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch {
    return NextResponse.json(
      { error: 'Moderation backend is unavailable.' },
      { status: 502, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
