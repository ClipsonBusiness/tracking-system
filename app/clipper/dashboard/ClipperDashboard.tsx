'use client'

import Link from 'next/link'

interface Link {
  id: string
  slug: string
  destinationUrl: string
  createdAt: Date
  campaign: { name: string; customDomain: string | null } | null
  client: { name: string; customDomain: string | null }
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
  dailyClicksData: Array<{ date: string; dateLabel: string; clicks: number }>
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
  dailyClicksData,
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

  // Find max clicks for chart scaling
  const maxClicks = Math.max(...dailyClicksData.map((d) => d.clicks), 1)

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

        {/* Daily Clicks Chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Daily Clicks (Last 30 Days)</h2>
          
          {/* Chart */}
          <div className="relative" style={{ height: '300px' }}>
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Y-axis labels */}
              <g>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const value = Math.round(maxClicks * ratio)
                  const y = 20 + (1 - ratio) * 260
                  return (
                    <g key={`y-axis-${ratio}`}>
                      <text
                        x="30"
                        y={y}
                        className="text-xs fill-gray-400"
                        textAnchor="end"
                      >
                        {value.toLocaleString()}
                      </text>
                      <line
                        x1="40"
                        y1={y}
                        x2="100%"
                        y2={y}
                        stroke="currentColor"
                        strokeWidth="0.5"
                        className="text-gray-700"
                        strokeDasharray="2,2"
                      />
                    </g>
                  )
                })}
              </g>

              {/* Data points and line */}
              {dailyClicksData.map((day, index) => {
                const chartWidth = 900 // Fixed width for consistent rendering
                const x = 50 + (index / Math.max(dailyClicksData.length - 1, 1)) * (chartWidth - 100)
                const clicksY = 20 + (1 - day.clicks / maxClicks) * 260

                return (
                  <g key={day.date}>
                    {/* Click point */}
                    <circle
                      cx={x}
                      cy={clicksY}
                      r="3"
                      fill="#3b82f6"
                      className="hover:r-5 transition-all cursor-pointer"
                    />
                  </g>
                )
              })}

              {/* Clicks line */}
              <polyline
                points={dailyClicksData
                  .map((day, index) => {
                    const chartWidth = 900 // Fixed width for consistent rendering
                    return `${50 + (index / Math.max(dailyClicksData.length - 1, 1)) * (chartWidth - 100)},${20 + (1 - day.clicks / maxClicks) * 260}`
                  })
                  .join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* X-axis labels */}
              {dailyClicksData
                .filter((_, index) => index % 5 === 0 || index === dailyClicksData.length - 1)
                .map((day) => {
                  const index = dailyClicksData.findIndex((d) => d.date === day.date)
                  const chartWidth = 900 // Fixed width for consistent rendering
                  const x = 50 + (index / Math.max(dailyClicksData.length - 1, 1)) * (chartWidth - 100)
                  return (
                    <text
                      key={day.date}
                      x={x}
                      y={290}
                      className="text-xs fill-gray-400"
                      textAnchor="middle"
                    >
                      {day.dateLabel}
                    </text>
                  )
                })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300">Clicks</span>
            </div>
          </div>
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
                    <div className="flex flex-col gap-2 mt-2">
                      {/* Full tracking link */}
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-green-400 bg-gray-800 px-2 py-1 rounded break-all">
                          {(() => {
                            const customDomain = link.campaign?.customDomain || link.client.customDomain
                            if (customDomain && customDomain.trim() !== '') {
                              const cleanDomain = customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
                              return `https://${cleanDomain}/?ref=${link.slug}`
                            }
                            return `${baseUrl}/?ref=${link.slug}`
                          })()}
                        </code>
                        <button
                          onClick={() => {
                            const customDomain = link.campaign?.customDomain || link.client.customDomain
                            let fullUrl
                            if (customDomain && customDomain.trim() !== '') {
                              const cleanDomain = customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')
                              fullUrl = `https://${cleanDomain}/?ref=${link.slug}`
                            } else {
                              fullUrl = `${baseUrl}/?ref=${link.slug}`
                            }
                            navigator.clipboard.writeText(fullUrl)
                            alert('Link copied!')
                          }}
                          className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded whitespace-nowrap"
                        >
                          Copy Link
                        </button>
                      </div>
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

