import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

// Auto-fix orphan conversions by matching to most recent click
export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth()

    // Find all conversions without linkId from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const orphanConversions = await prisma.conversion.findMany({
      where: {
        linkId: null,
        paidAt: { gte: sevenDaysAgo },
      },
      include: {
        client: {
          select: { id: true, name: true },
        },
      },
      orderBy: { paidAt: 'desc' },
    })

    let fixed = 0
    let failed = 0

    for (const conv of orphanConversions) {
      // Find the most recent click for this client that happened BEFORE the purchase
      const recentClick = await prisma.click.findFirst({
        where: {
          clientId: conv.clientId,
          ts: {
            lte: conv.paidAt, // Click must be BEFORE purchase
            gte: new Date(conv.paidAt.getTime() - 90 * 24 * 60 * 60 * 1000), // Within 90 days
          },
        },
        orderBy: { ts: 'desc' },
        select: { linkId: true },
      })

      if (recentClick) {
        await prisma.conversion.update({
          where: { id: conv.id },
          data: { linkId: recentClick.linkId },
        })
        fixed++
      } else {
        // Try without time constraint (any click for this client)
        const anyClick = await prisma.click.findFirst({
          where: {
            clientId: conv.clientId,
          },
          orderBy: { ts: 'desc' },
          select: { linkId: true },
        })

        if (anyClick) {
          await prisma.conversion.update({
            where: { id: conv.id },
            data: { linkId: anyClick.linkId },
          })
          fixed++
        } else {
          failed++
        }
      }
    }

    return NextResponse.json({
      success: true,
      fixed,
      failed,
      total: orphanConversions.length,
    })
  } catch (error: any) {
    console.error('Error auto-fixing orphans:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
