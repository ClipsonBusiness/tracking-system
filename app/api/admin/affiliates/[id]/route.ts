import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await requireAdminAuth()

  try {
    const affiliateId = params.id
    const body = await request.json()
    const { payoutPercent, status } = body

    // Build update data
    const updateData: {
      payoutPercent?: number | null
      status?: string
    } = {}

    if (payoutPercent !== undefined) {
      updateData.payoutPercent = payoutPercent === null || payoutPercent === '' ? null : parseFloat(payoutPercent.toString())
    }

    if (status !== undefined) {
      updateData.status = status
    }

    const affiliate = await prisma.affiliate.update({
      where: { id: affiliateId },
      data: updateData,
    })

    return NextResponse.json(affiliate)
  } catch (error: any) {
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Affiliate not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update affiliate' },
      { status: 500 }
    )
  }
}

