import { NextResponse } from 'next/server'
import { getAdminStats } from '@/shared/services/admin'

export async function GET() {
  try {
    const stats = await getAdminStats()
    return NextResponse.json(stats, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to load admin stats' },
      { status: 500 }
    )
  }
}
