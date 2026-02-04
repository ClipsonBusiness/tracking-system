import { NextRequest, NextResponse } from 'next/server'
import { clearAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  await clearAdminAuth()
  return NextResponse.json({ success: true })
}
