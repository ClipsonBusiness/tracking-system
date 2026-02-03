import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { requireClientAuth } from '@/lib/auth'
import ClientAnalyticsDashboard from './ClientAnalyticsDashboard'

export default async function ClientAnalyticsPage() {
  const clientId = await requireClientAuth()

  // Find client by ID
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: {
      id: true,
      name: true,
    },
  })

  if (!client) {
    redirect('/client/login?error=invalid_client')
  }

  // Get ALL links for this client across ALL campaigns
  const links = await prisma.link.findMany({
    where: { clientId: client.id },
    select: {
      id: true,
      slug: true,
      destinationUrl: true,
      createdAt: true,
      clipperId: true,
      campaign: {
        select: { name: true, customDomain: true },
      },
      clipper: {
        select: { discordUsername: true, dashboardCode: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Get stats for this client (aggregated across all clippers)
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Total clicks across all links
  const linkIds = links.map((l) => l.id)

  // Calculate clicksLast7Days properly
  const clicksLast7Days =
    linkIds.length > 0
      ? await prisma.click.count({
          where: {
            linkId: { in: linkIds },
            ts: { gte: sevenDaysAgo },
          },
        })
      : 0
  const totalClicks =
    linkIds.length > 0
      ? await prisma.click.count({
          where: { linkId: { in: linkIds } },
        })
      : 0

  const clicksLast30Days =
    linkIds.length > 0
      ? await prisma.click.count({
          where: {
            linkId: { in: linkIds },
            ts: { gte: thirtyDaysAgo },
          },
        })
      : 0

  // Clicks by country (with city aggregation)
  const clicksByCountryRaw =
    linkIds.length > 0
      ? await prisma.click.groupBy({
          by: ['country'],
          where: {
            linkId: { in: linkIds },
            country: { not: null },
            ts: { gte: thirtyDaysAgo },
          },
          _count: true,
          orderBy: { _count: { country: 'desc' } },
          take: 10,
        })
      : []

  // Get sample city for each country (most common city)
  const clicksByCountry = await Promise.all(
    clicksByCountryRaw.map(async (item) => {
      if (!item.country || item.country === 'XX' || item.country === 'Unknown') {
        return { country: item.country || 'Unknown', count: item._count, city: null }
      }

      // Get most common city for this country (with error handling in case city column doesn't exist yet)
      let city: string | null = null
      try {
        const cityData = await prisma.click.groupBy({
          by: ['city'],
          where: {
            linkId: { in: linkIds },
            country: item.country,
            ts: { gte: thirtyDaysAgo },
            city: { not: null },
          },
          _count: true,
          orderBy: { _count: { city: 'desc' } },
          take: 1,
        })
        city = cityData.length > 0 ? cityData[0].city : null
      } catch (error) {
        // If city column doesn't exist yet, just return null for city
        console.warn('City column may not exist yet:', error)
        city = null
      }

      return {
        country: item.country,
        count: item._count,
        city,
      }
    })
  )

  // Revenue/Sales from conversions (all conversions for this client)
  const conversions =
    linkIds.length > 0
      ? await prisma.conversion.findMany({
          where: {
            clientId: client.id,
            status: 'paid', // Only count paid conversions
          },
          select: {
            amountPaid: true,
            paidAt: true,
          },
        })
      : []

  // Calculate total revenue (convert from cents to dollars)
  const totalRevenue = conversions.reduce((sum, conv) => sum + conv.amountPaid / 100, 0)
  // Count total sales (including $0 conversions from 100% coupons)
  const totalSales = conversions.length

  // Recent clicks (from all clippers)
  const recentClicks =
    linkIds.length > 0
      ? await prisma.click.findMany({
          where: { linkId: { in: linkIds } },
          include: {
            link: {
              select: { slug: true },
            },
          },
          orderBy: { ts: 'desc' },
          take: 10,
        })
      : []

  // Get daily clicks data for the last 30 days
  const dailyClicksData: Array<{ date: string; dateLabel: string; clicks: number }> = []
  if (linkIds.length > 0) {
    // Generate dates for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const dayClicks = await prisma.click.count({
        where: {
          linkId: { in: linkIds },
          ts: {
            gte: date,
            lt: nextDay,
          },
        },
      })

      dailyClicksData.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: dayClicks,
      })
    }
  } else {
    // If no links, create empty data for 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      dailyClicksData.push({
        date: date.toISOString().split('T')[0],
        dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: 0,
      })
    }
  }

  // Get top clippers by clicks (for the "Top Clippers" section)
  const clipperStats = await Promise.all(
    Array.from(new Set(links.map((l) => l.clipperId).filter((id): id is string => Boolean(id)))).map(async (clipperId) => {
      const clipperLinks = links.filter((l) => l.clipperId === clipperId)
      const clipperLinkIds = clipperLinks.map((l) => l.id)
      const clipperClicks =
        clipperLinkIds.length > 0
          ? await prisma.click.count({
              where: { linkId: { in: clipperLinkIds } },
            })
          : 0

      const clipper = clipperLinks[0]?.clipper
      return {
        clipperId,
        discordUsername: clipper?.discordUsername || 'Unknown',
        dashboardCode: clipper?.dashboardCode || 'N/A',
        clicks: clipperClicks,
        linkCount: clipperLinks.length,
      }
    })
  )

  // Sort by clicks descending
  const topClippers = clipperStats.sort((a, b) => b.clicks - a.clicks).slice(0, 10)

  return (
    <ClientAnalyticsDashboard
      clientName={client.name}
      links={links}
      totalClicks={totalClicks}
      clicksLast7Days={clicksLast7Days}
      clicksLast30Days={clicksLast30Days}
      clicksByCountry={clicksByCountry.map((c) => ({
        country: c.country || 'Unknown',
        count: c.count || 0,
        city: c.city,
      }))}
      totalRevenue={totalRevenue}
      totalSales={totalSales}
      recentClicks={recentClicks}
      dailyClicksData={dailyClicksData}
      topClippers={topClippers}
    />
  )
}
