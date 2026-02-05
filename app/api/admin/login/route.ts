import { NextRequest, NextResponse } from 'next/server'
import { setAdminAuth } from '@/lib/auth'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    // Trim whitespace from password input
    const trimmedPassword = password?.trim() || ''
    const trimmedAdminPassword = ADMIN_PASSWORD.trim()

    // Debug logging (remove in production if needed)
    console.log('Login attempt:', {
      passwordProvided: trimmedPassword ? 'yes' : 'no',
      passwordLength: trimmedPassword.length,
      adminPasswordSet: trimmedAdminPassword ? 'yes' : 'no',
      adminPasswordLength: trimmedAdminPassword.length,
      passwordsMatch: trimmedPassword === trimmedAdminPassword,
      // Don't log actual passwords, but show first/last chars for debugging
      passwordFirstChar: trimmedPassword[0],
      passwordLastChar: trimmedPassword[trimmedPassword.length - 1],
      adminPasswordFirstChar: trimmedAdminPassword[0],
      adminPasswordLastChar: trimmedAdminPassword[trimmedAdminPassword.length - 1],
    })

    // Check if ADMIN_PASSWORD is set (especially important in production)
    if (!trimmedAdminPassword || trimmedAdminPassword === '') {
      console.error('SECURITY ERROR: ADMIN_PASSWORD environment variable is not set!')
      return NextResponse.json(
        { error: 'Admin password not configured. Please set ADMIN_PASSWORD environment variable.' },
        { status: 500 }
      )
    }

    if (trimmedPassword === trimmedAdminPassword) {
      await setAdminAuth(trimmedPassword)
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

