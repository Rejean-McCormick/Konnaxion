// FILE: frontend/app/_api/search/route.ts
// app/_api/search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string
  title: string
  snippet: string
  path: string
}

interface RoutesJsonEntry {
  path: string
}

interface KnowledgeResource {
  id: string | number
  title: string
  description?: string | null
  subject?: string | null
  level?: string | null
  language?: string | null
  url?: string | null
  type?: string | null
  resource_type?: string | null
}

type RawKnowledgeSearchResponse =
  | KnowledgeResource[]
  | {
      results?: KnowledgeResource[]
      items?: KnowledgeResource[]
      count?: number
      total?: number
    }

interface SearchResponseBody {
  results: SearchResult[]
}

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const ROUTES_JSON_PATH = path.join(process.cwd(), 'routes.json')

// Keep this small – it’s just a quick “jump” helper in the UI.
const MAX_RESULTS_PER_SECTION = 5
const MIN_QUERY_LENGTH = 2

// Preferred order for the Knowledge / KonnectED search endpoint.
// These mirror the other Knowledge-related pages in the app.
const KNOWLEDGE_SEARCH_ENDPOINTS = [
  '/api/konnected/resources/',
  '/api/knowledge-resources/',
  '/api/knowledge/resources/',
] as const

// Use the same base URL convention as services/_request.ts
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/+$/, '')

// ---------------------------------------------------------------------------
// Helpers – generic
// ---------------------------------------------------------------------------

function toTitleCase(segment: string): string {
  return segment
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function pathToTitle(p: string): string {
  if (p === '/') return 'Home'
  const segments = p.split('/').filter(Boolean)
  if (!segments.length) return 'Home'
  return segments.map(toTitleCase).join(' · ')
}

function buildBackendUrl(endpoint: string): string {
  const trimmed = endpoint.trim()
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  if (!API_BASE) return trimmed
  if (trimmed.startsWith('/')) return `${API_BASE}${trimmed}`
  return `${API_BASE}/${trimmed}`
}

function normalizeKnowledgeResults(raw: RawKnowledgeSearchResponse | null | undefined): KnowledgeResource[] {
  if (!raw) return []

  if (Array.isArray(raw)) {
    return raw
  }

  const obj = raw as { results?: unknown; items?: unknown }
  if (Array.isArray(obj.results)) return obj.results as KnowledgeResource[]
  if (Array.isArray(obj.items)) return obj.items as KnowledgeResource[]
  return []
}

function buildKnowledgeSnippet(resource: KnowledgeResource): string {
  const parts: string[] = []

  if (resource.subject) parts.push(resource.subject)
  if (resource.level) parts.push(resource.level)
  if (resource.language) parts.push(resource.language)

  if (parts.length > 0) {
    return parts.join(' · ')
  }

  const desc =
    typeof resource.description === 'string'
      ? resource.description.replace(/\s+/g, ' ').trim()
      : ''

  if (desc) {
    return desc.length > 120 ? `${desc.slice(0, 117)}…` : desc
  }

  return 'Learning resource'
}

// ---------------------------------------------------------------------------
// Routes.json search (navigation hints)
// ---------------------------------------------------------------------------

async function loadRoutes(): Promise<RoutesJsonEntry[]> {
  try {
    const content = await fs.readFile(ROUTES_JSON_PATH, 'utf8')
    const urls = JSON.parse(content) as string[]
    return urls.map((p) => ({ path: p }))
  } catch {
    // If routes.json is missing or invalid we simply return no route results.
    return []
  }
}

async function searchRoutes(q: string): Promise<SearchResult[]> {
  const routes = await loadRoutes()
  if (!routes.length) return []

  const needle = q.toLowerCase()
  type Scored = { entry: RoutesJsonEntry; score: number }

  const scored: Scored[] = []

  for (const entry of routes) {
    const p = entry.path
    if (!p) continue

    const title = pathToTitle(p)
    const haystack = `${p.toLowerCase()} ${title.toLowerCase()}`
    const idx = haystack.indexOf(needle)
    if (idx === -1) continue

    // Simple scoring:
    // - match at beginning is better
    // - shorter paths win for ties
    const score = (idx === 0 ? 2 : 1) + 1 / (p.length + 1)
    scored.push({ entry, score })
  }

  scored.sort((a, b) => b.score - a.score)

  return scored.slice(0, MAX_RESULTS_PER_SECTION).map(({ entry }) => {
    const p = entry.path
    const title = pathToTitle(p)

    return {
      id: `route:${p}`,
      title,
      snippet: `Navigate to ${p}`,
      path: p,
    }
  })
}

// ---------------------------------------------------------------------------
// Knowledge search (KonnectED / learning resources)
// ---------------------------------------------------------------------------

async function searchKnowledge(q: string, request: NextRequest): Promise<SearchResult[]> {
  const trimmed = q.trim()
  if (!trimmed) return []

  const params = new URLSearchParams()
  params.set('q', trimmed)
  // Keep it small – this is just one section of global search.
  params.set('page', '1')
  params.set('page_size', String(MAX_RESULTS_PER_SECTION))

  const headers: Record<string, string> = {
    Accept: 'application/json',
  }

  const auth = request.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  const cookie = request.headers.get('cookie')
  if (cookie) headers['Cookie'] = cookie

  for (const endpoint of KNOWLEDGE_SEARCH_ENDPOINTS) {
    const baseUrl = buildBackendUrl(endpoint)
    const url = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${params.toString()}`

    try {
      const res = await fetch(url, {
        method: 'GET',
        headers,
      })

      if (!res.ok) {
        // Try the next candidate for 404/405; ignore others silently.
        if (res.status === 404 || res.status === 405) {
          continue
        }
        continue
      }

      const raw = (await res.json()) as RawKnowledgeSearchResponse
      const resources = normalizeKnowledgeResults(raw)
      if (!resources.length) return []

      return resources.slice(0, MAX_RESULTS_PER_SECTION).map((r) => ({
        id: `knowledge:${String(r.id)}`,
        title: r.title,
        snippet: buildKnowledgeSnippet(r),
        path:
          r.url && typeof r.url === 'string'
            ? r.url
            : `/konnected/learning-library/browse-resources?resource=${encodeURIComponent(
                String(r.id),
              )}`,
      }))
    } catch {
      // Move on to the next endpoint.
      continue
    }
  }

  return []
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (!q) {
    return NextResponse.json(
      { error: 'Missing query parameter `q`' },
      {
        status: 400,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }

  if (q.length < MIN_QUERY_LENGTH) {
    // Too short – avoid hammering the backend for single-character queries.
    const body: SearchResponseBody = { results: [] }
    return NextResponse.json(body, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  try {
    const [routeResults, knowledgeResults] = await Promise.all([
      searchRoutes(q),
      searchKnowledge(q, request),
    ])

    const results: SearchResult[] = [...routeResults, ...knowledgeResults]

    const body: SearchResponseBody = { results }

    return NextResponse.json(body, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err) {
    // In case of any unexpected failure, return a safe, empty payload.
    const body: SearchResponseBody = { results: [] }

    return NextResponse.json(body, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
