import { prisma } from '@/lib/prisma'
import { requireCampaignManagerAuth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function CampaignManagerDashboardPage() {
  await requireCampaignManagerAuth()

  // Get all campaigns with their stats
  const campaigns = await prisma.campaign.findMany({
    include: {
      client: {
        select: {
          id: true,
          name: true,
          customDomain: true,
        },
      },
      links: {
        include: {
          clipper: {
            select: {
              id: true,
              dashboardCode: true,
              discordUsername: true,
            },
          },
          _count: {
            select: {
              clicks: true,
            },
          },
        },
      },
      _count: {
        select: {
          links: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Calculate stats for each campaign
  const campaignsWithStats = campaigns.map((campaign) => {
    const totalClicks = campaign.links.reduce((sum, link) => sum + link._count.clicks, 0)
    const totalLinks = campaign.links.length
    const totalClippers = new Set(campaign.links.map(l => l.clipperId).filter(Boolean)).size

    return {
      ...campaign,
      totalClicks,
      totalLinks,
      totalClippers,
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Campaign Manager Dashboard
          </h1>
          <p className="text-gray-400">Manage and monitor all campaigns</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Campaigns</h3>
            <p className="text-3xl font-bold text-white">{campaigns.length}</p>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Links</h3>
            <p className="text-3xl font-bold text-white">
              {campaigns.reduce((sum, c) => sum + c._count.links, 0)}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-gray-400 text-sm mb-2">Total Clicks</h3>
            <p className="text-3xl font-bold text-white">
              {campaignsWithStats.reduce((sum, c) => sum + c.totalClicks, 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Campaigns List */}
        <div className="space-y-4">
          {campaignsWithStats.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-purple-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-white mb-1">{campaign.name}</h2>
                  <p className="text-gray-400 text-sm">
                    Client: <span className="text-purple-400">{campaign.client.name}</span>
                  </p>
                  {campaign.customDomain && (
                    <p className="text-gray-400 text-sm">
                      Domain: <span className="text-blue-400">{campaign.customDomain}</span>
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      campaign.status === 'active'
                        ? 'bg-green-900/30 text-green-400 border border-green-700'
                        : 'bg-gray-700 text-gray-400 border border-gray-600'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Links</p>
                  <p className="text-xl font-semibold text-white">{campaign.totalLinks}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Clicks</p>
                  <p className="text-xl font-semibold text-white">
                    {campaign.totalClicks.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Active Clippers</p>
                  <p className="text-xl font-semibold text-white">{campaign.totalClippers}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Commission</p>
                  <p className="text-xl font-semibold text-white">
                    {campaign.commissionPercent ? `${campaign.commissionPercent}%` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <a
                  href={campaign.destinationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  View Destination → {campaign.destinationUrl}
                </a>
              </div>
            </div>
          ))}
        </div>

        {campaigns.length === 0 && (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
            <p className="text-gray-400">No campaigns found.</p>
          </div>
        )}
      </div>
    </div>
  )
}
