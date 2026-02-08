import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth()

    const searchParams = request.nextUrl.searchParams
    const clipperCode = searchParams.get('clipperCode') || 'mflp'
    const linkSlug = searchParams.get('linkSlug')

    // Find clipper (case-insensitive matching for SQLite compatibility)
    const allClippers = await prisma.clipper.findMany({
      include: {
        links: {
          include: {
            client: {
              select: { id: true, name: true, stripeWebhookSecret: true },
            },
            clicks: {
              orderBy: { ts: 'desc' },
              take: 5,
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const clipper = allClippers.find(
      c => c.dashboardCode && c.dashboardCode.toUpperCase() === clipperCode.toUpperCase()
    )

    if (!clipper) {
      return NextResponse.json({ error: 'Clipper not found' }, { status: 404 })
    }

    // Find specific link if slug provided
    let link = null
    if (linkSlug) {
      link = await prisma.link.findFirst({
        where: { slug: linkSlug, clipperId: clipper.id },
        include: {
          client: {
            select: { id: true, name: true, stripeWebhookSecret: true },
          },
          clicks: {
            orderBy: { ts: 'desc' },
            take: 5,
          },
        },
      })
    } else if (clipper.links.length > 0) {
      link = clipper.links[0]
    }

    // Get recent conversions - extend to 30 days to catch the sale
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Get conversions for clipper's links (most important - these are definitely attributed)
    const linkIds = clipper.links.map((l) => l.id)
    const clipperConversions =
      linkIds.length > 0
        ? await prisma.conversion.findMany({
            where: {
              linkId: { in: linkIds },
              paidAt: { gte: thirtyDaysAgo },
            },
            include: {
              link: {
                select: { slug: true },
              },
            },
            orderBy: { paidAt: 'desc' },
          })
        : []

    // Get ALL conversions for this client (including orphans) - last 30 days
    const allClientConversions = link && link.client
      ? await prisma.conversion.findMany({
          where: {
            clientId: link.client.id,
            paidAt: { gte: thirtyDaysAgo },
          },
          include: {
            link: {
              select: { slug: true },
            },
          },
          orderBy: { paidAt: 'desc' },
        })
      : []

    // Count orphan conversions (no linkId) for this client
    const orphanCount = link && link.client
      ? await prisma.conversion.count({
          where: {
            clientId: link.client.id,
            linkId: null,
            paidAt: { gte: thirtyDaysAgo },
          },
        })
      : 0

    // Get orphan conversions with details
    const orphanConversions = link && link.client
      ? await prisma.conversion.findMany({
          where: {
            clientId: link.client.id,
            linkId: null,
            paidAt: { gte: thirtyDaysAgo },
          },
          orderBy: { paidAt: 'desc' },
          take: 10,
        })
      : []

    // Get recent webhook events (last 30 days)
    const recentEvents = await prisma.stripeEvent.findMany({
      where: {
        created: { gte: thirtyDaysAgo },
        type: { in: ['invoice.paid', 'checkout.session.completed'] },
      },
      orderBy: { created: 'desc' },
      take: 20,
    })

    return NextResponse.json({
      clipper: {
        name: clipper.discordUsername || 'N/A',
        dashboardCode: clipper.dashboardCode,
        totalLinks: clipper.links.length,
      },
      link: link
        ? {
            slug: link.slug,
            client: link.client?.name || 'N/A',
            clicks: link.clicks.length,
            recentClicks: link.clicks.map((c) => ({
              time: c.ts.toISOString(),
              country: c.country,
            })),
          }
        : null,
      allLinks: clipper.links.map((l) => ({
        slug: l.slug,
        client: l.client?.name || 'N/A',
        clickCount: l.clicks.length,
      })),
      conversions: {
        // Conversions specifically linked to this clipper's links
        forClipperLinks: clipperConversions.length,
        // All conversions for the client (including orphans)
        totalForClient: allClientConversions.length,
        orphan: orphanCount,
        // Show conversions linked to clipper's links first, then all client conversions
        recent: [
          ...clipperConversions.map((c) => ({
            amount: c.amountPaid / 100,
            currency: c.currency,
            paidAt: c.paidAt.toISOString(),
            linkSlug: c.link?.slug || null,
            hasLink: !!c.linkId,
            isOrphan: false,
          })),
          // Add orphan conversions that aren't already shown
          ...orphanConversions
            .filter((oc) => !clipperConversions.some((cc) => cc.id === oc.id))
            .map((c) => ({
              amount: c.amountPaid / 100,
              currency: c.currency,
              paidAt: c.paidAt.toISOString(),
              linkSlug: null,
              hasLink: false,
              isOrphan: true,
            })),
        ].sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime()),
      },
      webhooks: {
        total: recentEvents.length,
        events: recentEvents.map((e) => ({
          type: e.type,
          created: e.created.toISOString(),
        })),
      },
      diagnosis: {
        hasWebhooks: recentEvents.length > 0,
        hasConversions: allClientConversions.length > 0,
        hasLinkConversions: clipperConversions.length > 0,
        hasOrphans: orphanCount > 0,
        stripeConfigured: link ? !!link.client.stripeWebhookSecret : false,
        // Additional diagnostic info
        clientName: link?.client.name || 'N/A',
        linkSlug: link?.slug || 'N/A',
        timeWindow: '30 days',
      },
    })
  } catch (error: any) {
    console.error('Error checking sale:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
