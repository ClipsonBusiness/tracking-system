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

  // Clicks by country (with city aggregation)
  const clicksByCountryRaw = await prisma.click.groupBy({
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
            ...clientFilter,
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

  // Traffic Sources Analysis
  // Top referrers (where traffic is coming from)
  const clicksByReferer = await prisma.click.groupBy({
    by: ['referer'],
    where: {
      ...clientFilter,
      referer: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { referer: 'desc' } },
    take: 15,
  })

  // Traffic by UTM Source
  const clicksByUtmSource = await prisma.click.groupBy({
    by: ['utmSource'],
    where: {
      ...clientFilter,
      utmSource: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { utmSource: 'desc' } },
    take: 15,
  })

  // Traffic by UTM Medium
  const clicksByUtmMedium = await prisma.click.groupBy({
    by: ['utmMedium'],
    where: {
      ...clientFilter,
      utmMedium: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { utmMedium: 'desc' } },
    take: 15,
  })

  // Traffic by UTM Campaign
  const clicksByUtmCampaign = await prisma.click.groupBy({
    by: ['utmCampaign'],
    where: {
      ...clientFilter,
      utmCampaign: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
    _count: true,
    orderBy: { _count: { utmCampaign: 'desc' } },
    take: 15,
  })

  // Direct vs Referred traffic
  const directClicks = await prisma.click.count({
    where: {
      ...clientFilter,
      referer: null,
      ts: { gte: thirtyDaysAgo },
    },
  })
  const referredClicks = await prisma.click.count({
    where: {
      ...clientFilter,
      referer: { not: null },
      ts: { gte: thirtyDaysAgo },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">View traffic sources, conversions, and performance metrics</p>
        </div>
        <ClientFilter clients={clients} />
      </div>
      <AnalyticsDashboard
        totalSales={totalSales}
        clicksLast7Days={clicksLast7Days}
        clicksLast30Days={clicksLast30Days}
        clicksByCountry={clicksByCountry.map((c) => ({
          country: c.country || 'Unknown',
          count: c.count || 0,
          city: c.city,
        }))}
        clicksByLink={clicksByLink.map((c) => ({
          linkSlug: linkMap.get(c.linkId) || 'Unknown',
          count: c._count || 0,
        }))}
        totalRevenue={totalRevenue._sum.amountPaid || 0}
        revenueByAffiliate={revenueByAffiliate.map((r) => ({
          affiliateCode: r.affiliateCode || 'Unknown',
          amount: r._sum.amountPaid || 0,
        }))}
        clicksByReferer={clicksByReferer.map((c) => ({
          referer: c.referer || 'Unknown',
          count: c._count || 0,
        }))}
        clicksByUtmSource={clicksByUtmSource.map((c) => ({
          source: c.utmSource || 'Unknown',
          count: c._count || 0,
        }))}
        clicksByUtmMedium={clicksByUtmMedium.map((c) => ({
          medium: c.utmMedium || 'Unknown',
          count: c._count || 0,
        }))}
        clicksByUtmCampaign={clicksByUtmCampaign.map((c) => ({
          campaign: c.utmCampaign || 'Unknown',
          count: c._count || 0,
        }))}
        directClicks={directClicks}
        referredClicks={referredClicks}
      />
    </div>
  )
}

