'use client'

interface DailyData {
  date: string
  dateLabel: string
  clicks: number
  sales: number
  revenue: number
}

interface ClientCampaignDashboardProps {
  campaignName: string
  totalClicks: number
  totalSales: number
  totalRevenue: number
  dailyData: DailyData[]
}

export function ClientCampaignDashboard({
  campaignName,
  totalClicks,
  totalSales,
  totalRevenue,
  dailyData,
}: ClientCampaignDashboardProps) {
  // Find max values for chart scaling
  const maxClicks = Math.max(...dailyData.map((d) => d.clicks), 1)
  const maxSales = Math.max(...dailyData.map((d) => d.sales), 1)
  const maxRevenue = Math.max(...dailyData.map((d) => d.revenue), 1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{campaignName}</h1>
          <p className="text-gray-400">Campaign Statistics Dashboard</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Clicks</p>
                <p className="text-3xl font-bold text-white mt-2">{totalClicks.toLocaleString()}</p>
              </div>
              <div className="text-4xl">👆</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sales</p>
                <p className="text-3xl font-bold text-white mt-2">{totalSales.toLocaleString()}</p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Revenue</p>
                <p className="text-3xl font-bold text-white mt-2">
                  ${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="text-4xl">💵</div>
            </div>
          </div>
        </div>

        {/* Daily Statistics Chart */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Daily Statistics (Last 30 Days)</h2>
          
          {/* Chart */}
          <div className="relative" style={{ height: '400px' }}>
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Y-axis labels for clicks */}
              <g>
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const value = Math.round(maxClicks * ratio)
                  const y = 20 + (1 - ratio) * 360
                  return (
                    <g key={`clicks-${ratio}`}>
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

              {/* Data lines */}
              {dailyData.map((day, index) => {
                const chartWidth = 900 // Fixed width for chart
                const x = 50 + (index / (dailyData.length - 1)) * chartWidth
                const clicksY = 20 + (1 - day.clicks / maxClicks) * 360
                const salesY = 20 + (1 - day.sales / maxSales) * 360
                const revenueY = 20 + (1 - day.revenue / maxRevenue) * 360

                return (
                  <g key={day.date}>
                    {/* Clicks point */}
                    <circle
                      cx={x}
                      cy={clicksY}
                      r="4"
                      fill="#3b82f6"
                      className="hover:r-6 transition-all"
                    />
                    {/* Sales point */}
                    {day.sales > 0 && (
                      <circle
                        cx={x}
                        cy={salesY}
                        r="4"
                        fill="#f59e0b"
                        className="hover:r-6 transition-all"
                      />
                    )}
                    {/* Revenue point */}
                    {day.revenue > 0 && (
                      <circle
                        cx={x}
                        cy={revenueY}
                        r="4"
                        fill="#10b981"
                        className="hover:r-6 transition-all"
                      />
                    )}
                  </g>
                )
              })}

              {/* Clicks line */}
              <polyline
                points={dailyData
                  .map(
                    (day, index) => {
                      const chartWidth = 900
                      return `${50 + (index / (dailyData.length - 1)) * chartWidth},${20 + (1 - day.clicks / maxClicks) * 360}`
                    }
                  )
                  .join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />

              {/* Sales line */}
              <polyline
                points={dailyData
                  .map(
                    (day, index) => {
                      const chartWidth = 900
                      return `${50 + (index / (dailyData.length - 1)) * chartWidth},${20 + (1 - day.sales / maxSales) * 360}`
                    }
                  )
                  .join(' ')}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
              />

              {/* Revenue line */}
              <polyline
                points={dailyData
                  .map(
                    (day, index) => {
                      const chartWidth = 900
                      return `${50 + (index / (dailyData.length - 1)) * chartWidth},${20 + (1 - day.revenue / maxRevenue) * 360}`
                    }
                  )
                  .join(' ')}
                fill="none"
                stroke="#10b981"
                strokeWidth="2"
              />

              {/* X-axis labels */}
              {dailyData
                .filter((_, index) => index % 5 === 0)
                .map((day) => {
                  const index = dailyData.findIndex((d) => d.date === day.date)
                  const chartWidth = 900
                  const x = 50 + (index / (dailyData.length - 1)) * chartWidth
                  return (
                    <text
                      key={day.date}
                      x={x}
                      y={390}
                      className="text-xs fill-gray-400"
                      textAnchor="middle"
                      transform={`rotate(-45 ${x} 390)`}
                    >
                      {day.dateLabel}
                    </text>
                  )
                })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-300">Clicks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-amber-500 rounded"></div>
              <span className="text-sm text-gray-300">Sales</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-300">Revenue</span>
            </div>
          </div>
        </div>

        {/* Daily Data Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 mt-6">
          <h2 className="text-xl font-semibold text-white mb-4">Daily Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Clicks</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Sales</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-300">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {dailyData.slice().reverse().map((day) => (
                  <tr key={day.date} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-sm text-gray-300">{day.dateLabel}</td>
                    <td className="py-3 px-4 text-sm text-gray-300 text-right">{day.clicks.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-300 text-right">{day.sales.toLocaleString()}</td>
                    <td className="py-3 px-4 text-sm text-gray-300 text-right">
                      ${day.revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

