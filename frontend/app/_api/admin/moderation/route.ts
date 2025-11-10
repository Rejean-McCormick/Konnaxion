import { NextResponse } from 'next/server'

interface ModerationItem {
  id: string
  type: string
  content: string
  reason: string
  userId: string
  createdAt: string
}

export async function GET() {
  // TODO: fetch your real moderation queue here
  const queue: ModerationItem[] = [
    {
      id: '1',
      type: 'comment',
      content: 'Offensive comment text here',
      reason: 'profanity',
      userId: 'user_123',
      createdAt: new Date().toISOString(),
    },
  ]

  return NextResponse.json<ModerationItem[]>(queue, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
