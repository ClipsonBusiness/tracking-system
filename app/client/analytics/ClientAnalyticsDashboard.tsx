'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getCountryInfo } from '@/lib/country-utils'

interface Link {
  id: string
  slug: string
  destinationUrl: string | null
  createdAt: Date
  campaign: { name: string; customDomain: string | null } | null
  clipper: { discordUsername: string | null; dashboardCode: string | null } | null
}

interface ClientAnalyticsDashboardProps {
  clientName: string
  links: Link[]
  totalClicks: number
  clicksLast7Days: number
  clicksLast30Days: number
  clicksByCountry: Array<{ country: string; count: number; city?: string | null }>
  totalRevenue: number
  totalSales: number
  recentClicks: Array<{
    id: string
    ts: Date
    country: string | null
    link: { slug: string }
  }>
  dailyClicksData: Array<{ date: string; dateLabel: string; clicks: number }>
  topClippers: Array<{
    clipperId: string
    discordUsername: string | null
    dashboardCode: string
    clicks: number
    sales: number
    revenue: number
    linkCount: number
  }>
}

export default function ClientAnalyticsDashboard({
  clientName,
  links,
  totalClicks,
  clicksLast7Days,
  clicksLast30Days,
  clicksByCountry,
  totalRevenue,
  totalSales,
  recentClicks,
  dailyClicksData,
  topClippers,
}: ClientAnalyticsDashboardProps) {
  const [sortBy, setSortBy] = useState<'clicks' | 'sales' | 'revenue'>('clicks')

  // Calculate country percentages
  const totalCountryClicks = clicksByCountry.reduce((sum, c) => sum + c.count, 0)
  const countryPercentages = clicksByCountry.map((c) => ({
    country: c.country,
    count: c.count,
    city: c.city,
    percentage: totalCountryClicks > 0 ? ((c.count / totalCountryClicks) * 100).toFixed(1) : '0',
  }))

  // Sort clippers based on selected sort option
  const sortedClippers = [...topClippers].sort((a, b) => {
    if (sortBy === 'clicks') {
      return b.clicks - a.clicks
    } else if (sortBy === 'sales') {
      return b.sales - a.sales
    } else {
      return b.revenue - a.revenue
    }
  })

  // Function to calculate relative time (e.g., "2 minutes ago")
  const getRelativeTime = (date: Date): string => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60)
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    }

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    }

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    }

    const diffInWeeks = Math.floor(diffInDays / 7)
    if (diffInWeeks < 4) {
      return `${diffInWeeks} week${diffInWeeks !== 1 ? 's' : ''} ago`
    }

    const diffInMonths = Math.floor(diffInDays / 30)
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`
  }

  // Calculate links created in last 7 days
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const linksLast7Days = links.filter((l) => new Date(l.createdAt) >= sevenDaysAgo).length

  // Find max clicks for chart scaling
  const maxClicks = Math.max(...dailyClicksData.map((d) => d.clicks), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{clientName} Analytics</h1>
            <p className="text-gray-400">Total performance across all clippers and campaigns</p>
            <p className="text-sm text-gray-500 mt-1">
              {links.length} total link{links.length !== 1 ? 's' : ''} • {topClippers.length} active clipper{topClippers.length !== 1 ? 's' : ''}
            </p>
          </div>
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
            change={`${totalSales} total sales`}
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
                      <text x="30" y={y} className="text-xs fill-gray-400" textAnchor="end">
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
                countryPercentages.map((item) => {
                  const countryInfo = getCountryInfo(item.country)
                  return (
                    <div key={item.country} className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl flex-shrink-0">{countryInfo.flag}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-white font-medium truncate">{countryInfo.name}</div>
                          {item.city && (
                            <div className="text-xs text-gray-400 truncate">{item.city}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
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
                  )
                })
              ) : (
                <div className="text-gray-400 space-y-2">
                  <p>No country data available</p>
                  <p className="text-xs text-gray-500">
                    Country detection requires Vercel geolocation headers or Cloudflare. Once clicks
                    are tracked, country data will appear here.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Top Clippers/Affiliates */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">Top Affiliates</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setSortBy('clicks')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    sortBy === 'clicks'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setSortBy('sales')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    sortBy === 'sales'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Sales
                </button>
                <button
                  onClick={() => setSortBy('revenue')}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    sortBy === 'revenue'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Revenue
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {sortedClippers.length > 0 ? (
                sortedClippers.map((clipper, index) => (
                  <div
                    key={clipper.clipperId}
                    className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold truncate">
                            {clipper.discordUsername || 'Unknown Clipper'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            Code: {clipper.dashboardCode} • {clipper.linkCount} link{clipper.linkCount !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-600">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Clicks</p>
                        <p className="text-lg font-bold text-white">{clipper.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Sales</p>
                        <p className="text-lg font-bold text-green-400">{clipper.sales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Revenue</p>
                        <p className="text-lg font-bold text-yellow-400">
                          ${clipper.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No affiliates yet. Affiliates will appear here once they generate links and get clicks.</p>
              )}
            </div>
          </div>

          {/* Recent Clicks */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-2xl font-bold text-white mb-4">Recent Clicks</h2>
            <div className="space-y-3">
              {recentClicks.length > 0 ? (
                recentClicks.map((click) => {
                  const countryInfo = getCountryInfo(click.country)
                  const relativeTime = getRelativeTime(new Date(click.ts))
                  return (
                    <div
                      key={click.id}
                      className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-2xl flex-shrink-0">{countryInfo.flag}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-semibold truncate">/{click.link.slug}</p>
                            <p className="text-xs text-gray-400">{relativeTime}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
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
