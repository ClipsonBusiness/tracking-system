import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function POST() {
  await requireAdminAuth()

  try {
    // Get all campaigns with their status
    const allCampaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        status: true,
      },
      orderBy: { name: 'asc' },
    })

    // Update all null status campaigns to inactive
    const nullUpdate = await prisma.campaign.updateMany({
      where: { status: null },
      data: { status: 'inactive' },
    })

    // Get updated counts
    const activeCount = await prisma.campaign.count({
      where: { status: 'active' },
    })
    const inactiveCount = await prisma.campaign.count({
      where: { status: 'inactive' },
    })

    return NextResponse.json({
      success: true,
      message: `Fixed ${nullUpdate.count} campaigns with null status`,
      summary: {
        total: allCampaigns.length,
        active: activeCount,
        inactive: inactiveCount,
        fixed: nullUpdate.count,
      },
      campaigns: allCampaigns.map((c) => ({
        name: c.name,
        status: c.status || 'null (will be fixed)',
      })),
    })
  } catch (error: any) {
    console.error('Error fixing campaign status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fix campaign status' },
      { status: 500 }
    )
  }
}
