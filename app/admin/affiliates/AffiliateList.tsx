'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Affiliate {
  id: string
  code: string
  status: string
  payoutPercent: number | null
  client: {
    name: string
  }
}

export default function AffiliateList({
  affiliates,
  baseUrl,
}: {
  affiliates: Affiliate[]
  baseUrl: string
}) {
  const router = useRouter()
  const [selectedLink, setSelectedLink] = useState<string | null>(null)

  function generateShareLink(affiliateCode: string, linkSlug: string) {
    return `${baseUrl}/l/${linkSlug}?aff=${affiliateCode}`
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Code
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Client
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Payout %
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Share Link
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {affiliates.map((affiliate) => (
            <tr key={affiliate.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                {affiliate.code}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {affiliate.client.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    affiliate.status === 'active'
                      ? 'bg-green-900 text-green-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {affiliate.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {affiliate.payoutPercent ? `${affiliate.payoutPercent}%` : '-'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-400">
                <button
                  onClick={() => setSelectedLink(selectedLink === affiliate.id ? null : affiliate.id)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  {selectedLink === affiliate.id ? 'Hide' : 'Show'}
                </button>
                {selectedLink === affiliate.id && (
                  <div className="mt-2 p-2 bg-gray-700 rounded border border-gray-600">
                    <p className="text-xs text-gray-300 mb-2 font-semibold">Share this link format with affiliate:</p>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-gray-400 mb-1">For any tracking link:</p>
                        <code className="text-xs break-all text-blue-400 block bg-gray-800 p-2 rounded">
                          {baseUrl.replace(/\/l$/, '')}/&lt;slug&gt;?aff={affiliate.code}
                        </code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Example:</p>
                        <code className="text-xs break-all text-green-400 block bg-gray-800 p-2 rounded">
                          {baseUrl.replace(/\/l$/, '')}/fhkeo?aff={affiliate.code}
                        </code>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const exampleLink = `${baseUrl.replace(/\/l$/, '')}/example?aff=${affiliate.code}`
                        navigator.clipboard.writeText(exampleLink)
                        alert('Example link copied!')
                      }}
                      className="mt-2 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
                    >
                      Copy Example
                    </button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

