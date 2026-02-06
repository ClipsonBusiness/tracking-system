import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get ALL campaigns with their client info to check setup completion
    const allCampaigns = await prisma.campaign.findMany({
      include: {
        client: {
          select: {
            id: true,
            name: true,
            customDomain: true,
            stripeWebhookSecret: true,
          },
        },
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

    // Only show campaigns that:
    // 1. Are explicitly 'active'
    // 2. Have a client with completed setup (customDomain AND stripeWebhookSecret)
    const readyCampaigns = allCampaigns.filter(c => {
      const isActive = c.status === 'active'
      const hasCustomDomain = !!c.client.customDomain && c.client.customDomain.trim() !== ''
      const hasWebhookSecret = !!c.client.stripeWebhookSecret && c.client.stripeWebhookSecret.trim() !== ''
      const clientSetupComplete = hasCustomDomain && hasWebhookSecret
      
      return isActive && clientSetupComplete
    })
    
    // Log for debugging
    const activeButNotReady = allCampaigns.filter(c => {
      const isActive = c.status === 'active'
      const hasCustomDomain = !!c.client.customDomain && c.client.customDomain.trim() !== ''
      const hasWebhookSecret = !!c.client.stripeWebhookSecret && c.client.stripeWebhookSecret.trim() !== ''
      const clientSetupComplete = hasCustomDomain && hasWebhookSecret
      return isActive && !clientSetupComplete
    })
    
    const inactiveCount = allCampaigns.filter(c => c.status === 'inactive' || c.status === null).length
    
    console.log(`Clipper API: Returning ${readyCampaigns.length} ready campaigns`)
    console.log(`  - ${inactiveCount} inactive campaigns filtered out`)
    if (activeButNotReady.length > 0) {
      console.log(`  - ${activeButNotReady.length} active campaigns filtered out (client setup incomplete):`)
      activeButNotReady.forEach(c => {
        const hasDomain = !!c.client.customDomain && c.client.customDomain.trim() !== ''
        const hasWebhook = !!c.client.stripeWebhookSecret && c.client.stripeWebhookSecret.trim() !== ''
        console.log(`    • ${c.name}: domain=${hasDomain}, webhook=${hasWebhook}`)
      })
    }

    return NextResponse.json({ 
      campaigns: readyCampaigns.map(({ status, client, ...campaign }) => ({
        ...campaign,
        customDomain: campaign.customDomain || client.customDomain,
      })),
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
