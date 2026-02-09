import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Code is required' },
        { status: 400 }
      )
    }

    // Check if clipper exists (case-insensitive for SQLite)
    // SQLite doesn't support case-insensitive unique constraints by default
    // So we need to search manually
    const allClippers = await prisma.clipper.findMany()
    const clipper = allClippers.find(
      c => c.dashboardCode.toUpperCase() === code.toUpperCase()
    )

    if (!clipper) {
      return NextResponse.json(
        { error: 'Invalid dashboard code' },
        { status: 404 }
      )
    }

    return NextResponse.json({ valid: true, dashboardCode: clipper.dashboardCode })
  } catch (error: any) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify code' },
      { status: 500 }
    )
  }
}

