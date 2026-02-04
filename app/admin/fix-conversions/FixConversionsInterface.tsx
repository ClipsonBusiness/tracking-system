'use client'

import { useState } from 'react'

interface Conversion {
  id: string
  amountPaid: number
  currency: string
  paidAt: string // ISO string
  stripeInvoiceId: string
  client: {
    id: string
    name: string
  }
}

interface Link {
  slug: string
  clipper: {
    dashboardCode: string
    name: string
  } | null
}

interface Click {
  id: string
  linkId: string
  ts: string // ISO string
  link: Link
}

interface ConversionWithMatch {
  conversion: Conversion
  matchingClick: Click | null
}

export default function FixConversionsInterface({
  conversionsWithMatches,
}: {
  conversionsWithMatches: ConversionWithMatch[]
}) {
  const [loading, setLoading] = useState<string | null>(null)
  const [fixed, setFixed] = useState<Set<string>>(new Set())

  async function fixConversion(conversionId: string, linkId: string) {
    setLoading(conversionId)
    try {
      const response = await fetch('/api/admin/fix-conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversionId, linkId }),
      })

      if (response.ok) {
        const newFixed = new Set(fixed)
        newFixed.add(conversionId)
        setFixed(newFixed)
        // Reload page after a moment to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error || 'Failed to fix conversion'}`)
      }
    } catch (error) {
      alert(`Error: ${error}`)
    } finally {
      setLoading(null)
    }
  }

  if (conversionsWithMatches.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
        <p className="text-gray-400">✅ No orphan conversions found! All conversions are properly attributed.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {conversionsWithMatches.map(({ conversion, matchingClick }) => {
        const isFixed = fixed.has(conversion.id)
        const isFixing = loading === conversion.id

        return (
          <div
            key={conversion.id}
            className="bg-gray-800 rounded-lg border border-gray-700 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  ${(conversion.amountPaid / 100).toFixed(2)} {conversion.currency.toUpperCase()}
                </h3>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Client: {conversion.client.name}</p>
                  <p>Paid: {new Date(conversion.paidAt as any).toLocaleString()}</p>
                  <p>Invoice: {conversion.stripeInvoiceId}</p>
                </div>
              </div>
              {isFixed && (
                <span className="px-3 py-1 bg-green-900/30 text-green-400 rounded border border-green-700 text-sm">
                  ✅ Fixed
                </span>
              )}
            </div>

            {matchingClick ? (
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 mb-2">📌 Matching Click Found:</p>
                <div className="space-y-1 text-sm text-gray-400">
                  <p>Link: <span className="text-white font-mono">{matchingClick.link.slug}</span></p>
                  <p>
                    Clipper: {matchingClick.link.clipper?.discordUsername || 'N/A'} 
                    {matchingClick.link.clipper?.dashboardCode && (
                      <span className="text-gray-500"> ({matchingClick.link.clipper.dashboardCode})</span>
                    )}
                  </p>
                  <p>Click time: {new Date(matchingClick.ts as any).toLocaleString()}</p>
                  <p>
                    Time before purchase: {Math.round((new Date(conversion.paidAt as any).getTime() - new Date(matchingClick.ts as any).getTime()) / 1000 / 60)} minutes
                  </p>
                </div>
                <button
                  onClick={() => fixConversion(conversion.id, matchingClick.linkId)}
                  disabled={isFixing || isFixed}
                  className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                >
                  {isFixing ? 'Fixing...' : isFixed ? 'Fixed' : '✅ Fix Attribution'}
                </button>
              </div>
            ) : (
              <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700">
                <p className="text-sm text-yellow-400">
                  ⚠️ No matching click found within 60 days before purchase.
                  <br />
                  This conversion cannot be automatically attributed to a link.
                </p>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
