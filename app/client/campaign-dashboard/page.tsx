import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { ClientCampaignDashboard } from './ClientCampaignDashboard'

export default async function ClientCampaignDashboardPage({
  searchParams,
}: {
  searchParams: { token?: string; campaignId?: string }
}) {
  const { token, campaignId } = searchParams

  if (!token) {
    redirect('/client/login')
  }

  if (!campaignId) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Link</h1>
          <p className="text-gray-400">
            This dashboard link requires a campaign ID. Please use the link provided by your admin.
          </p>
        </div>
      </div>
    )
  }

  // Find client by access token
  const client = await prisma.client.findUnique({
    where: { clientAccessToken: token },
    select: {
      id: true,
      name: true,
    },
  })

  if (!client) {
    redirect('/client/login?error=invalid_token')
  }

  // Get campaign
  const campaign = await prisma.campaign.findFirst({
    where: {
      id: campaignId,
      clientId: client.id,
    },
  })

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-white mb-4">Campaign Not Found</h1>
          <p className="text-gray-400">
            The campaign you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
      </div>
    )
  }

  // Get all links for this campaign
  const links = await prisma.link.findMany({
    where: {
      campaignId: campaign.id,
      clientId: client.id,
    },
    select: {
      id: true,
      slug: true,
    },
  })

  const linkIds = links.map((l) => l.id)

  // Get clicks for last 30 days, grouped by day
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const clicks = await prisma.click.findMany({
    where: {
      linkId: { in: linkIds },
      ts: { gte: thirtyDaysAgo },
    },
    select: {
      ts: true,
    },
  })

  // Get conversions (sales) for last 30 days
  const conversions = await prisma.conversion.findMany({
    where: {
      clientId: client.id,
      paidAt: { gte: thirtyDaysAgo },
    },
    select: {
      amountPaid: true,
      paidAt: true,
      currency: true,
    },
  })

  // Group clicks by day
  const clicksByDay: Record<string, number> = {}
  clicks.forEach((click) => {
    const date = new Date(click.ts).toISOString().split('T')[0]
    clicksByDay[date] = (clicksByDay[date] || 0) + 1
  })

  // Group sales by day
  const salesByDay: Record<string, { count: number; amount: number }> = {}
  conversions.forEach((conv) => {
    const date = new Date(conv.paidAt).toISOString().split('T')[0]
    if (!salesByDay[date]) {
      salesByDay[date] = { count: 0, amount: 0 }
    }
    salesByDay[date].count += 1
    salesByDay[date].amount += conv.amountPaid / 100 // Convert cents to dollars
  })

  // Create array of last 30 days with data
  const days = []
  for (let i = 29; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    date.setHours(0, 0, 0, 0)
    const dateStr = date.toISOString().split('T')[0]
    days.push({
      date: dateStr,
      dateLabel: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      clicks: clicksByDay[dateStr] || 0,
      sales: salesByDay[dateStr]?.count || 0,
      revenue: salesByDay[dateStr]?.amount || 0,
    })
  }

  // Calculate totals
  const totalClicks = clicks.length
  const totalSales = conversions.length
  const totalRevenue = conversions.reduce((sum, c) => sum + c.amountPaid / 100, 0)

  return (
    <ClientCampaignDashboard
      campaignName={campaign.name}
      totalClicks={totalClicks}
      totalSales={totalSales}
      totalRevenue={totalRevenue}
      dailyData={days}
    />
  )
}
