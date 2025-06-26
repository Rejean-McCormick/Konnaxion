import { NextResponse } from 'next/server'
import { getModerationQueue } from '@/shared/services/admin'

export async function GET() {
  try {
    const queue = await getModerationQueue()
    return NextResponse.json(queue, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to load moderation queue' },
      { status: 500 }
    )
  }
}
