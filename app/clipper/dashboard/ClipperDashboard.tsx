'use client'

import Link from 'next/link'

interface Link {
  id: string
  slug: string
  destinationUrl: string
  createdAt: Date
  campaign: { name: string } | null
  client: { name: string }
}

interface ClipperDashboardProps {
  dashboardCode: string
  links: Link[]
  totalClicks: number
  clicksLast7Days: number
  clicksLast30Days: number
  clicksByCountry: Array<{ country: string; count: number }>
  totalRevenue: number
  totalSales: number
  recentClicks: Array<{
    id: string
    ts: Date
    country: string | null
    link: { slug: string }
  }>
}

export default function ClipperDashboard({
  dashboardCode,
  links,
  totalClicks,
  clicksLast7Days,
  clicksLast30Days,
  clicksByCountry,
  totalRevenue,
  totalSales,
  recentClicks,
}: ClipperDashboardProps) {
  // Calculate country percentages
  const totalCountryClicks = clicksByCountry.reduce((sum, c) => sum + c.count, 0)
  const countryPercentages = clicksByCountry.map((c) => ({
    country: c.country,
    count: c.count,
    percentage: totalCountryClicks > 0 ? ((c.count / totalCountryClicks) * 100).toFixed(1) : '0',
  }))

  // Get base URL for displaying links
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
  
  // Calculate links created in last 7 days
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const linksLast7Days = links.filter(l => new Date(l.createdAt) >= sevenDaysAgo).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Clipper Dashboard</h1>
            <p className="text-gray-400">
              Dashboard Code: <span className="text-blue-400 font-semibold text-2xl">{dashboardCode}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {links.length} link{links.length !== 1 ? 's' : ''} generated
            </p>
          </div>
          <Link
            href="/clipper"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Generate New Link
          </Link>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Clicks"
            value={totalClicks.toLocaleString()}
            change={`+${clicksLast7Days} last 7 days`}
            icon="👆"
          />
          <StatCard
            title="Total Links"
            value={links.length.toLocaleString()}
            change={`${linksLast7Days} last 7 days`}
            icon="🔗"
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change="Tracked via conversions"
            icon="💵"
          />
          <StatCard
            title="30-Day Clicks"
            value={clicksLast30Days.toLocaleString()}
            change={`+${clicksLast7Days} last 7 days`}
            icon="📊"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clicks by Country */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Clicks by Country</h2>
            <div className="space-y-3">
              {countryPercentages.length > 0 ? (
                countryPercentages.map((item) => (
                  <div key={item.country} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">🌍</span>
                      <span className="text-white font-medium">{item.country}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <span className="text-gray-400 text-sm w-16 text-right">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No country data available</p>
              )}
            </div>
          </div>

          {/* Your Links */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Your Links</h2>
            <div className="space-y-3">
              {links.length > 0 ? (
                links.map((link) => (
                  <div
                    key={link.id}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">
                          {link.campaign?.name || 'No Campaign'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {link.destinationUrl}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="text-xs text-blue-400 bg-gray-800 px-2 py-1 rounded">
                        /{link.slug}
                      </code>
                      <button
                        onClick={() => {
                          const fullUrl = `${baseUrl}/${link.slug}`
                          navigator.clipboard.writeText(fullUrl)
                          alert('Link copied!')
                        }}
                        className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Created {new Date(link.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No links generated yet</p>
              )}
            </div>
          </div>

          {/* Recent Clicks */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Clicks</h2>
            <div className="space-y-3">
              {recentClicks.length > 0 ? (
                recentClicks.map((click) => (
                  <div
                    key={click.id}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">
                        /{click.link.slug}
                      </span>
                      <span className="text-xs text-gray-400">
                        {click.country || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(click.ts).toLocaleString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No clicks yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  change,
  icon,
}: {
  title: string
  value: string
  change: string
  icon: string
}) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm text-gray-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
          <p className="text-sm text-gray-400 mt-1">{change}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  )
}

