import { NextRequest, NextResponse } from 'next/server'
import { setAdminAuth } from '@/lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (password === ADMIN_PASSWORD) {
      await setAdminAuth(password)
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

