import { prisma } from '@/lib/prisma'
import AnalyticsDashboard from './AnalyticsDashboard'
import ClientFilter from './ClientFilter'

export default async function AdminAnalyticsPage() {
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // Get all clients for filter
  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
  })

  // For now, show all clients (can add client filter later)
  const clientFilter = {}

  // Total clicks
  const clicksLast7Days = await prisma.click.count({
    where: { ...clientFilter, ts: { gte: sevenDaysAgo } },
  })
  const clicksLast30Days = await prisma.click.count({
    where: { ...clientFilter, ts: { gte: thirtyDaysAgo } },
  })

  // Clicks by country
  const clicksByCountry = await prisma.click.groupBy({
    by: ['country'],
    where: {
      ...clientFilter,
      country: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { country: 'desc' } },
    take: 10,
  })

  // Clicks by link
  const clicksByLink = await prisma.click.groupBy({
    by: ['linkId'],
    where: { ...clientFilter, ts: { gte: thirtyDaysAgo } },
    _count: true,
    orderBy: { _count: { linkId: 'desc' } },
    take: 10,
  })

  // Get link details for clicks by link
  const linkIds = clicksByLink.map((c) => c.linkId)
  const links = await prisma.link.findMany({
    where: { id: { in: linkIds } },
    select: { id: true, slug: true },
  })
  const linkMap = new Map(links.map((l) => [l.id, l.slug]))

  // Total revenue
  const totalRevenue = await prisma.conversion.aggregate({
    where: { ...clientFilter, status: 'paid' },
    _sum: { amountPaid: true },
  })

  // Revenue by affiliate
  const revenueByAffiliate = await prisma.conversion.groupBy({
    by: ['affiliateCode'],
    where: {
      ...clientFilter,
      status: 'paid',
      affiliateCode: { not: null },
    },
    _sum: { amountPaid: true },
    orderBy: { _sum: { amountPaid: 'desc' } },
    take: 10,
  })

  // Get total sales count
  const totalSales = await prisma.conversion.count({
    where: { ...clientFilter, status: 'paid' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Statistics</h1>
        <ClientFilter clients={clients} />
      </div>
      <AnalyticsDashboard
        totalSales={totalSales}
        clicksLast7Days={clicksLast7Days}
        clicksLast30Days={clicksLast30Days}
        clicksByCountry={clicksByCountry.map((c) => ({
          country: c.country || 'Unknown',
          count: c._count.country || 0,
        }))}
        clicksByLink={clicksByLink.map((c) => ({
          linkSlug: linkMap.get(c.linkId) || 'Unknown',
          count: c._count.linkId || 0,
        }))}
        totalRevenue={totalRevenue._sum.amountPaid || 0}
        revenueByAffiliate={revenueByAffiliate.map((r) => ({
          affiliateCode: r.affiliateCode || 'Unknown',
          amount: r._sum.amountPaid || 0,
        }))}
      />
    </div>
  )
}

