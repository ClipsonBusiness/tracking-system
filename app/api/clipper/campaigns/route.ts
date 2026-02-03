import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get ALL campaigns to check what we have
    const allCampaigns = await prisma.campaign.findMany({
      select: {
        id: true,
        name: true,
        customDomain: true,
        status: true,
      },
    })

    // First, update any campaigns with null status to 'inactive'
    // This handles legacy campaigns created before status field existed
    const nullStatusCampaigns = allCampaigns.filter(c => c.status === null)
    let nullUpdate = { count: 0 }
    
    if (nullStatusCampaigns.length > 0) {
      nullUpdate = await prisma.campaign.updateMany({
        where: {
          id: { in: nullStatusCampaigns.map(c => c.id) },
        },
        data: {
          status: 'inactive',
        },
      })
      
      if (nullUpdate.count > 0) {
        console.log(`Fixed ${nullUpdate.count} campaigns with null status`)
      }
    }

    // Only show campaigns that are explicitly 'active'
    // Exclude 'inactive' and null status campaigns
    const activeCampaigns = allCampaigns.filter(c => c.status === 'active')
    
    // Log for debugging
    const inactiveCount = allCampaigns.filter(c => c.status === 'inactive' || c.status === null).length
    console.log(`Clipper API: Returning ${activeCampaigns.length} active campaigns, ${inactiveCount} inactive campaigns filtered out`)

    return NextResponse.json({ 
      campaigns: activeCampaigns.map(({ status, ...campaign }) => campaign),
      // Add timestamp to help with cache-busting
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Error fetching campaigns:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch campaigns' },
      { status: 500 }
    )
  }
}
