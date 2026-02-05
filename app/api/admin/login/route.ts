import { NextRequest, NextResponse } from 'next/server'
import { setAdminAuth } from '@/lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Debug logging (remove in production if needed)
    console.log('Login attempt:', {
      passwordProvided: password ? 'yes' : 'no',
      passwordLength: password?.length,
      adminPasswordSet: ADMIN_PASSWORD ? 'yes' : 'no',
      adminPasswordLength: ADMIN_PASSWORD?.length,
      passwordsMatch: password === ADMIN_PASSWORD,
    })

    if (password === ADMIN_PASSWORD) {
      await setAdminAuth(password)
      console.log('✅ Admin login successful')
      return NextResponse.json({ success: true })
    } else {
      console.log('❌ Admin login failed: password mismatch')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

