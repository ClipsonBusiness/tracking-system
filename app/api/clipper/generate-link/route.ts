import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json(
        { error: 'Campaign is required' },
        { status: 400 }
      )
    }

    // Find campaign
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { client: true },
    })

    if (!campaign || campaign.status !== 'active') {
      return NextResponse.json(
        { error: 'Invalid or inactive campaign' },
        { status: 404 }
      )
    }

    // Get or create clipper from cookie/session, or create new one
    // For now, we'll create a new clipper for each link generation
    // In the future, we could use cookies to persist clipper across sessions
    
    // Generate unique dashboard code (4 letters)
    const chars = 'abcdefghijklmnopqrstuvwxyz'
    let dashboardCode = ''
    let clipper = null
    let attempts = 0

    // Create new clipper with unique dashboard code
    while (!clipper && attempts < 100) {
      dashboardCode = Array.from({ length: 4 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('')

      // Check if dashboard code exists
      const existing = await prisma.clipper.findUnique({
        where: { dashboardCode },
      })

      if (!existing) {
        clipper = await prisma.clipper.create({
          data: { dashboardCode },
        })
      }
      attempts++
    }

    if (!clipper) {
      return NextResponse.json(
        { error: 'Failed to create clipper. Please try again.' },
        { status: 500 }
      )
    }

    // Generate unique slug for this campaign
    // Format: random 5-letter code
    let slug = ''
    let link = null
    attempts = 0

    // Generate unique slug and create link
    while (!link && attempts < 100) {
      slug = Array.from({ length: 5 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('')

      // Check if slug exists
      const existing = await prisma.link.findUnique({
        where: { slug },
      })

      if (!existing) {
        // Create new link for this campaign and clipper
        link = await prisma.link.create({
          data: {
            clientId: campaign.clientId,
            campaignId: campaign.id,
            clipperId: clipper.id,
            handle: campaign.name.toLowerCase().replace(/\s+/g, '-'),
            slug: slug,
            destinationUrl: campaign.destinationUrl,
          },
        })
      }
      attempts++
    }

    if (!link) {
      return NextResponse.json(
        { error: 'Failed to generate unique link. Please try again.' },
        { status: 500 }
      )
    }

    // Generate the tracking link (no affiliate code needed)
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'
    const customDomain = campaign.customDomain || campaign.client.customDomain
    const trackingUrl = customDomain && customDomain.trim() !== ''
      ? `https://${customDomain}/${link.slug}`
      : `${baseUrl.replace(/\/l$/, '')}/${link.slug}`

    return NextResponse.json({
      link: trackingUrl,
      campaignName: campaign.name,
      slug: link.slug,
      dashboardCode: clipper.dashboardCode, // Give them their dashboard code
    })
  } catch (error: any) {
    console.error('Error generating clipper link:', error)
    console.error('Error stack:', error.stack)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate link',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

