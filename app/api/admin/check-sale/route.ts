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
      c => c.dashboardCode.toUpperCase() === clipperCode.toUpperCase()
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

    // Get recent conversions for this client (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const recentConversions = link
      ? await prisma.conversion.findMany({
          where: {
            clientId: link.client.id,
            paidAt: { gte: sevenDaysAgo },
          },
          include: {
            link: {
              select: { slug: true },
            },
          },
          orderBy: { paidAt: 'desc' },
        })
      : []

    // Get conversions for clipper's links
    const linkIds = clipper.links.map((l) => l.id)
    const clipperConversions =
      linkIds.length > 0
        ? await prisma.conversion.findMany({
            where: {
              linkId: { in: linkIds },
            },
            include: {
              link: {
                select: { slug: true },
              },
            },
            orderBy: { paidAt: 'desc' },
          })
        : []

    // Get recent webhook events (last 7 days)
    const recentEvents = await prisma.stripeEvent.findMany({
      where: {
        created: { gte: sevenDaysAgo },
        type: { in: ['invoice.paid', 'checkout.session.completed'] },
      },
      orderBy: { created: 'desc' },
      take: 10,
    })

    // Count orphan conversions
    const orphanCount = link
      ? await prisma.conversion.count({
          where: {
            clientId: link.client.id,
            linkId: null,
            paidAt: { gte: sevenDaysAgo },
          },
        })
      : 0

    return NextResponse.json({
      clipper: {
        name: clipper.discordUsername || 'N/A',
        dashboardCode: clipper.dashboardCode,
        totalLinks: clipper.links.length,
      },
      link: link
        ? {
            slug: link.slug,
            client: link.client.name,
            clicks: link.clicks.length,
            recentClicks: link.clicks.map((c) => ({
              time: c.ts.toISOString(),
              country: c.country,
            })),
          }
        : null,
      allLinks: clipper.links.map((l) => ({
        slug: l.slug,
        client: l.client.name,
        clickCount: l.clicks.length,
      })),
      conversions: {
        total: recentConversions.length,
        forLink: clipperConversions.length,
        orphan: orphanCount,
        recent: recentConversions.map((c) => ({
          amount: c.amountPaid / 100,
          currency: c.currency,
          paidAt: c.paidAt.toISOString(),
          linkSlug: c.link?.slug || null,
          hasLink: !!c.linkId,
        })),
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
        hasConversions: recentConversions.length > 0,
        hasLinkConversions: clipperConversions.length > 0,
        hasOrphans: orphanCount > 0,
        stripeConfigured: link ? !!link.client.stripeWebhookSecret : false,
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
