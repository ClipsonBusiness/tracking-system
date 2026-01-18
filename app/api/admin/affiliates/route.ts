import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  await requireAdminAuth()

  try {
    const body = await request.json()
    const { clientId, code, status, payoutPercent } = body

    if (!clientId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        clientId,
        code,
        status: status || 'active',
        payoutPercent: payoutPercent || null,
      },
    })

    return NextResponse.json(affiliate)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Affiliate code already exists for this client' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create affiliate' },
      { status: 500 }
    )
  }
}

