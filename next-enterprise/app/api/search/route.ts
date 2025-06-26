import { NextRequest, NextResponse } from 'next/server'
import { runGlobalSearch } from '@/shared/services/search'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const q = url.searchParams.get('q')?.trim() || ''

  if (!q) {
    return NextResponse.json(
      { error: 'Missing query parameter `q`' },
      { status: 400 }
    )
  }

  try {
    const results = await runGlobalSearch(q)
    return NextResponse.json({ results }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Search failed' },
      { status: 500 }
    )
  }
}
