import { NextRequest, NextResponse } from 'next/server'

interface SearchResult {
  id: string
  title: string
  snippet: string
  path: string
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() || ''
  if (!q) {
    return NextResponse.json({ error: 'Missing query parameter `q`' }, { status: 400 })
  }

  // TODO: replace with real search logic
  const results: SearchResult[] = [
    {
      id: 'item-1',
      title: `Result for "${q}" #1`,
      snippet: 'A brief snippet of matching content…',
      path: `/some/path/1`,
    },
  ]

  return NextResponse.json<{ results: SearchResult[] }>({ results }, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
