import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { requireAdminAuth } from '@/lib/auth'

export default async function AdminDashboardPage() {
  await requireAdminAuth()
  // Get summary stats
  const [totalLinks, totalClicks, totalClients, totalCampaigns, totalSales, totalRevenue] = await Promise.all([
    prisma.link.count(),
    prisma.click.count(),
    prisma.client.count(),
    prisma.campaign.count(),
    prisma.linkSale.count(),
    prisma.linkSale.aggregate({
      _sum: { amount: true },
    }),
  ])

  // Get recent links
  const recentLinks = await prisma.link.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { name: true, customDomain: true } },
      campaign: { select: { name: true } },
      clipper: { select: { dashboardCode: true, discordUsername: true, socialMediaPage: true } },
      _count: { select: { clicks: true } },
    },
  })

  // Get top clippers by clicks
  const topClippers = await prisma.clipper.findMany({
    include: {
      links: {
        include: {
          _count: {
            select: { clicks: true },
          },
        },
      },
    },
  })

  // Calculate total clicks per clipper
  const clipperStats = topClippers
    .map((clipper) => {
      const totalClicks = clipper.links.reduce(
        (sum, link) => sum + link._count.clicks,
        0
      )
      return {
        ...clipper,
        totalClicks,
        linkCount: clipper.links.length,
      }
    })
    .filter((c) => c.totalClicks > 0)
    .sort((a, b) => b.totalClicks - a.totalClicks)
    .slice(0, 10)

  // Get clients with campaigns
  const clients = await prisma.client.findMany({
    include: {
      campaigns: {
        take: 3,
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: { name: 'asc' },
  })

  const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000'
  const totalRevenueDollars = Number(totalRevenue._sum.amount || 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">ClipSon Affiliates Admin Panel</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <SummaryCard title="Links" value={totalLinks.toLocaleString()} icon="🔗" />
        <SummaryCard title="Clicks" value={totalClicks.toLocaleString()} icon="👆" />
        <SummaryCard title="Clients" value={totalClients.toLocaleString()} icon="👥" />
        <SummaryCard title="Campaigns" value={totalCampaigns.toLocaleString()} icon="📊" />
        <SummaryCard title="Sales" value={totalSales.toLocaleString()} icon="💰" />
        <SummaryCard 
          title="Revenue" 
          value={`$${totalRevenueDollars.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} 
          icon="💵" 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QuickActionCard
          title="Create Campaign"
          description="Set up a new campaign"
          href="/admin/campaigns"
          icon="📊"
        />
        <QuickActionCard
          title="View Clients"
          description="Manage clients and campaigns"
          href="/admin/clients"
          icon="👥"
        />
      </div>

      {/* Recent Links */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Recent Links</h2>
          <Link
            href="/admin/links"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All →
          </Link>
        </div>
        <div className="p-6">
          {recentLinks.length > 0 ? (
            <div className="space-y-3">
              {recentLinks.map((link) => {
                const customDomain = link.client?.customDomain
                const linkUrl = customDomain
                  ? `https://${customDomain}/${link.slug}`
                  : `${baseUrl}/${link.slug}`
                const workingUrl = `${baseUrl}/${link.slug}`

                return (
                  <div
                    key={link.id}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <code className="text-sm text-blue-400 bg-gray-800 px-2 py-1 rounded">
                            {link.slug}
                          </code>
                          {link.campaign && (
                            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                              {link.campaign.name}
                            </span>
                          )}
                          {link.client && (
                            <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                              {link.client.name}
                            </span>
                          )}
                          {link.clipper && (
                            <>
                              <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                                {link.clipper.discordUsername || link.clipper.dashboardCode}
                              </span>
                              {link.clipper.socialMediaPage && (
                                <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                                  {link.clipper.socialMediaPage}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        <p className="text-sm text-gray-300 mb-2 truncate">
                          {link.destinationUrl || 'No destination URL'}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>👆 {link._count.clicks} clicks</span>
                          <span>📅 {new Date(link.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <a
                          href={workingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 text-sm block"
                        >
                          {workingUrl}
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No links yet. Create your first link!</p>
          )}
        </div>
      </div>

      {/* Top Clippers by Traffic */}
      {clipperStats.length > 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white">Top Clippers by Traffic</h2>
            <p className="text-sm text-gray-400 mt-1">See who&apos;s driving the most clicks</p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {clipperStats.map((clipper, index) => (
                <div
                  key={clipper.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-lg font-bold text-white">#{index + 1}</span>
                        <div>
                          <p className="text-white font-semibold">
                            {clipper.discordUsername || (clipper.dashboardCode ? `Clipper ${clipper.dashboardCode}` : 'Clipper')}
                          </p>
                          {clipper.socialMediaPage && (
                            <p className="text-xs text-gray-400">
                              {clipper.socialMediaPage}
                            </p>
                          )}
                        </div>
                        {clipper.dashboardCode && (
                          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                            Code: {clipper.dashboardCode}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>👆 {clipper.totalClicks.toLocaleString()} clicks</span>
                        <span>🔗 {clipper.linkCount} link{clipper.linkCount !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Clients & Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-6 border-b border-gray-700 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Clients & Campaigns</h2>
            <Link
              href="/admin/clients"
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              View All →
            </Link>
          </div>
          <div className="p-6">
            {clients.length > 0 ? (
              <div className="space-y-4">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-medium">{client.name}</h3>
                      {client.customDomain && (
                        <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                          {client.customDomain}
                        </span>
                      )}
                    </div>
                    {client.campaigns.length > 0 ? (
                      <div className="space-y-2">
                        {client.campaigns.map((campaign) => (
                          <Link
                            key={campaign.id}
                            href={`/admin/clients/${client.id}/dashboard?campaignId=${campaign.id}`}
                            className="block text-sm text-blue-400 hover:text-blue-300"
                          >
                            → {campaign.name}
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No campaigns yet</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No clients yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function SummaryCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: string
}) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

function QuickActionCard({
  title,
  description,
  href,
  icon,
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <Link
      href={href}
      className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-blue-500 transition-colors"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-white font-medium mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </Link>
  )
}

