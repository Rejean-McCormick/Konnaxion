import { NextResponse } from 'next/server'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  newUsers: number
}

export async function GET() {
  // TODO: hook up your real DB call here
  const stats: AdminStats = {
    totalUsers: 1234,
    activeUsers: 567,
    newUsers: 89,
  }

  return NextResponse.json<AdminStats>(stats, {
    status: 200,
    headers: { 'Cache-Control': 'no-store' },
  })
}
