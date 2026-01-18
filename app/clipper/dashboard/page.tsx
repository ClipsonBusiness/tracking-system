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
        select: { name: true },
      },
      client: {
        select: { name: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

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
      country: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { country: 'desc' } },
    take: 10,
  }) : []

  // Revenue/Sales from conversions
  // Get conversions for links associated with this clipper
  const conversions = linkIds.length > 0 ? await prisma.conversion.findMany({
    where: {
      clientId: { in: links.map(l => l.clientId) },
      status: 'paid',
    },
  }) : []
  
  const totalRevenue = conversions.reduce((sum, c) => sum + c.amountPaid, 0)
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

  return (
    <ClipperDashboard
      dashboardCode={clipper.dashboardCode}
      links={links}
      totalClicks={totalClicks}
      clicksLast7Days={clicksLast7Days}
      clicksLast30Days={clicksLast30Days}
      clicksByCountry={clicksByCountry.map((c) => ({
        country: c.country || 'Unknown',
        count: c._count.country || 0,
      }))}
      totalRevenue={totalRevenue}
      totalSales={totalSales}
      recentClicks={recentClicks}
    />
  )
}
