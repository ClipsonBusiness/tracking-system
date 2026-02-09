'use client'

interface AnalyticsDashboardProps {
  clicksLast7Days: number
  clicksLast30Days: number
  clicksByCountry: Array<{ country: string; count: number }>
  clicksByLink: Array<{ linkSlug: string; count: number }>
  totalRevenue: number
  totalSales: number
  revenueByAffiliate: Array<{ affiliateCode: string; amount: number }>
}

export default function AnalyticsDashboard({
  clicksLast7Days,
  clicksLast30Days,
  clicksByCountry,
  clicksByLink,
  totalRevenue,
  totalSales,
  revenueByAffiliate,
}: AnalyticsDashboardProps) {
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100)
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Clicks (Last 7 Days)</h3>
          <p className="text-3xl font-bold text-white mt-2">{clicksLast7Days.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Clicks (Last 30 Days)</h3>
          <p className="text-3xl font-bold text-white mt-2">{clicksLast30Days.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Sales</h3>
          <p className="text-3xl font-bold text-white mt-2">{totalSales.toLocaleString()}</p>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Revenue</h3>
          <p className="text-3xl font-bold text-white mt-2">{formatCurrency(totalRevenue)}</p>
        </div>
      </div>

      {/* Clicks by Country */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Top Countries (Last 30 Days)</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clicksByCountry.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.country}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {item.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clicks by Link */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Top Links (Last 30 Days)</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Link Slug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Clicks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {clicksByLink.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.linkSlug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {item.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revenue by Affiliate */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Revenue by Affiliate</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Affiliate Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {revenueByAffiliate.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {item.affiliateCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                      {formatCurrency(item.amount)}
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

