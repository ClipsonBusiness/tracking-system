import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

// Route handler for checking click tracking statistics
export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const searchParams = request.nextUrl.searchParams
    const linkSlug = searchParams.get('slug')

    if (!linkSlug) {
      return NextResponse.json({ error: 'Link slug is required' }, { status: 400 })
    }

    // Find the link
    const link = await prisma.link.findFirst({
      where: { slug: linkSlug },
      include: {
        client: {
          select: { id: true, name: true, customDomain: true },
        },
        clipper: {
          select: { discordUsername: true, dashboardCode: true },
        },
        campaign: {
          select: { name: true, customDomain: true },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Get click statistics
    const totalClicks = await prisma.click.count({
      where: { linkId: link.id },
    })

    const last24Hours = new Date()
    last24Hours.setHours(last24Hours.getHours() - 24)

    const clicksLast24h = await prisma.click.count({
      where: {
        linkId: link.id,
        ts: { gte: last24Hours },
      },
    })

    const recentClicks = await prisma.click.findMany({
      where: { linkId: link.id },
      orderBy: { ts: 'desc' },
      take: 10,
      select: {
        id: true,
        ts: true,
        country: true,
        city: true,
        referer: true,
        userAgent: true,
      },
    })

    // Determine the correct URL format
    const trackingServerUrl = process.env.APP_BASE_URL || 'https://clipsonaffiliates.com'
    const customDomain = link.campaign?.customDomain || link.client.customDomain

    let trackingUrl = ''
    if (customDomain) {
      trackingUrl = `https://${customDomain}/${linkSlug}`
    } else {
      trackingUrl = `${trackingServerUrl}/l/${linkSlug}`
    }

    // Alternative formats
    const alternativeUrls = [
      `${trackingServerUrl}/track?ref=${linkSlug}`,
      `${trackingServerUrl}/${linkSlug}`,
    ]

    return NextResponse.json({
      link: {
        slug: link.slug,
        destinationUrl: link.destinationUrl,
        client: link.client.name,
        clipper: link.clipper?.discordUsername || 'N/A',
        campaign: link.campaign?.name || 'N/A',
      },
      clicks: {
        total: totalClicks,
        last24h: clicksLast24h,
        recent: recentClicks.map((c) => ({
          timestamp: c.ts.toISOString(),
          country: c.country || 'Unknown',
          city: c.city || 'Unknown',
          referer: c.referer || 'Direct',
        })),
      },
      trackingUrl,
      alternativeUrls,
      diagnosis: {
        linkExists: true,
        hasClicks: totalClicks > 0,
        recentActivity: clicksLast24h > 0,
        message: totalClicks === 0
          ? '⚠️ No clicks recorded for this link. Make sure you\'re using the correct URL format.'
          : clicksLast24h === 0
          ? '⚠️ No clicks in the last 24 hours. The link may not be receiving traffic.'
          : '✅ Link is tracking clicks successfully.',
      },
    })
  } catch (error: any) {
    console.error('Error checking clicks:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
// Trigger deployment
