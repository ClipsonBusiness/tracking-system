import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import ClipperDashboard from './ClipperDashboard'

export default async function ClipperDashboardPage({
  searchParams,
}: {
  searchParams: { code?: string }
}) {
  const dashboardCode = searchParams.code

  if (!dashboardCode) {
    redirect('/clipper')
  }

  // Get clipper by dashboard code (case-insensitive for SQLite)
  // SQLite doesn't support case-insensitive unique constraints by default
  const allClippers = await prisma.clipper.findMany()
  const clipper = allClippers.find(
    c => c.dashboardCode.toUpperCase() === dashboardCode.toUpperCase()
  )

  if (!clipper) {
    redirect('/clipper?error=invalid_code')
  }

  // Get all links for this clipper
  const links = await prisma.link.findMany({
    where: { clipperId: clipper.id },
    include: {
      campaign: {
        select: { name: true, customDomain: true, commissionPercent: true },
      },
      client: {
        select: { name: true, customDomain: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  
  // Get commission percentage from campaigns
  // If multiple campaigns, use the first one with a commission set
  // If all campaigns have the same commission, use that; otherwise use the first one
  let commissionPercent: number | null = null
  if (links.length > 0) {
    const campaignsWithCommission = links
      .map(l => l.campaign?.commissionPercent)
      .filter((cp): cp is number => cp !== null && cp !== undefined)
    
    if (campaignsWithCommission.length > 0) {
      // Use the first commission percentage found
      // If all are the same, it doesn't matter; if different, we use the first
      commissionPercent = campaignsWithCommission[0]
    }
  }

  // Get stats for this clipper
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Total clicks across all links
  const linkIds = links.map(l => l.id)
  
  // Calculate clicksLast7Days properly
  const clicksLast7Days = linkIds.length > 0 ? await prisma.click.count({
    where: {
      linkId: { in: linkIds },
      ts: { gte: sevenDaysAgo },
    },
  }) : 0
  const totalClicks = linkIds.length > 0 ? await prisma.click.count({
    where: { linkId: { in: linkIds } },
  }) : 0

  const clicksLast30Days = linkIds.length > 0 ? await prisma.click.count({
    where: {
      linkId: { in: linkIds },
      ts: { gte: thirtyDaysAgo },
    },
  }) : 0

  // Clicks by country
  const clicksByCountry = linkIds.length > 0 ? await prisma.click.groupBy({
    by: ['country'],
    where: {
      linkId: { in: linkIds },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { country: 'desc' } },
    take: 10,
  }) : []

  // Revenue/Sales from conversions
  // Get conversions linked to this clipper's links
  const conversions = linkIds.length > 0 ? await prisma.conversion.findMany({
    where: {
      linkId: { in: linkIds },
      status: 'paid', // Only count paid conversions
    },
    select: {
      amountPaid: true,
      paidAt: true,
    },
  }) : []

  // Calculate total revenue (convert from cents to dollars)
  const totalRevenue = conversions.reduce((sum, conv) => sum + (conv.amountPaid / 100), 0)
  // Count total sales (including $0 conversions from 100% coupons)
  const totalSales = conversions.length

  // Recent clicks
  const recentClicks = linkIds.length > 0 ? await prisma.click.findMany({
    where: { linkId: { in: linkIds } },
    include: {
      link: {
        select: { slug: true },
      },
    },
    orderBy: { ts: 'desc' },
    take: 10,
  }) : []

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

  return (
    <ClipperDashboard
      dashboardCode={clipper.dashboardCode}
      links={links}
      totalClicks={totalClicks}
      clicksLast7Days={clicksLast7Days}
      clicksLast30Days={clicksLast30Days}
        clicksByCountry={clicksByCountry.map((c) => ({
          country: c.country || 'Unknown',
          count: c._count || 0,
        }))}
      totalRevenue={totalRevenue}
      totalSales={totalSales}
      commissionPercent={commissionPercent}
      recentClicks={recentClicks}
      dailyClicksData={dailyClicksData}
    />
  )
}
