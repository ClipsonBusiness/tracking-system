'use client'

import { getCountryInfo } from '@/lib/country-utils'

interface AnalyticsDashboardProps {
  clicksLast7Days: number
  clicksLast30Days: number
  clicksByCountry: Array<{ country: string; count: number }>
  clicksByLink: Array<{ linkSlug: string; count: number }>
  totalRevenue: number
  totalSales: number
  revenueByAffiliate: Array<{ affiliateCode: string; amount: number }>
  clicksByReferer: Array<{ referer: string; count: number }>
  clicksByUtmSource: Array<{ source: string; count: number }>
  clicksByUtmMedium: Array<{ medium: string; count: number }>
  clicksByUtmCampaign: Array<{ campaign: string; count: number }>
  directClicks: number
  referredClicks: number
}

export default function AnalyticsDashboard({
  clicksLast7Days,
  clicksLast30Days,
  clicksByCountry,
  clicksByLink,
  totalRevenue,
  totalSales,
  revenueByAffiliate,
  clicksByReferer,
  clicksByUtmSource,
  clicksByUtmMedium,
  clicksByUtmCampaign,
  directClicks,
  referredClicks,
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
                {clicksByCountry.map((item, idx) => {
                  const countryInfo = getCountryInfo(item.country)
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{countryInfo.flag}</span>
                          <div>
                            <div className="text-sm font-medium text-white">
                              {countryInfo.name}
                            </div>
                            {item.city && (
                              <div className="text-xs text-gray-400">
                                {item.city}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                        {item.count.toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
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

      {/* Traffic Sources Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Traffic Sources (Last 30 Days)</h2>
          <p className="text-sm text-gray-400 mt-1">See where your traffic is coming from</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Direct vs Referred */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Traffic Type</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <p className="text-sm text-gray-400 mb-1">Direct Traffic</p>
                <p className="text-2xl font-bold text-white">{directClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {directClicks + referredClicks > 0
                    ? `${Math.round((directClicks / (directClicks + referredClicks)) * 100)}%`
                    : '0%'}
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <p className="text-sm text-gray-400 mb-1">Referred Traffic</p>
                <p className="text-2xl font-bold text-white">{referredClicks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {directClicks + referredClicks > 0
                    ? `${Math.round((referredClicks / (directClicks + referredClicks)) * 100)}%`
                    : '0%'}
                </p>
              </div>
            </div>
          </div>

          {/* Top Referrers */}
          {clicksByReferer.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Top Referrers</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Referrer
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {clicksByReferer.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm text-white break-all">
                          <a
                            href={item.referer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                          >
                            {item.referer.length > 60
                              ? `${item.referer.substring(0, 60)}...`
                              : item.referer}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {item.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* UTM Sources */}
          {clicksByUtmSource.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Traffic by UTM Source</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Source
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {clicksByUtmSource.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {item.source}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {item.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* UTM Mediums */}
          {clicksByUtmMedium.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Traffic by UTM Medium</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Medium
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {clicksByUtmMedium.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {item.medium}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {item.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* UTM Campaigns */}
          {clicksByUtmCampaign.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Traffic by UTM Campaign</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Campaign
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {clicksByUtmCampaign.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-white">
                          {item.campaign}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400">
                          {item.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {clicksByReferer.length === 0 &&
            clicksByUtmSource.length === 0 &&
            clicksByUtmMedium.length === 0 &&
            clicksByUtmCampaign.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No traffic source data available yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Traffic sources will appear as clicks come in with referrer or UTM parameters
                </p>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

