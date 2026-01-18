'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StripeConnectProps {
  clientId: string
  isConnected: boolean
  connectedAt: Date | null
}

export default function StripeConnect({
  clientId,
  isConnected,
  connectedAt,
}: StripeConnectProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleConnect = () => {
    setLoading(true)
    // Redirect to Stripe Connect OAuth
    window.location.href = `/api/stripe/connect/authorize?clientId=${clientId}`
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-white mb-2">Stripe Integration</h2>
          <p className="text-sm text-gray-400">
            Connect your Stripe account to automatically track sales and revenue
          </p>
        </div>
        {isConnected && (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-700 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-300 font-medium">Connected</span>
          </div>
        )}
      </div>

      {isConnected ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-900/10 border border-green-700/50 rounded-lg">
            <p className="text-green-300 text-sm font-medium mb-1">
              ✅ Stripe account connected
            </p>
            <p className="text-green-400 text-xs">
              Connected on {formatDate(connectedAt)}
            </p>
            <p className="text-green-400 text-xs mt-2">
              Sales tracking is active. Revenue from your Stripe account will be automatically tracked.
            </p>
          </div>
          <div className="text-sm text-gray-400">
            <p className="mb-2">What's tracked automatically:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Subscription payments</li>
              <li>One-time payments</li>
              <li>Refunds</li>
              <li>Affiliate attribution</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-blue-900/10 border border-blue-700/50 rounded-lg">
            <p className="text-blue-300 text-sm mb-2">
              Connect your Stripe account to enable automatic sales tracking
            </p>
            <p className="text-blue-400 text-xs">
              This will allow us to track revenue, subscriptions, and attribute sales to affiliates automatically.
            </p>
          </div>
          <button
            onClick={handleConnect}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Connecting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Connect Stripe Account
              </>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center">
            You'll be redirected to Stripe to authorize the connection
          </p>
        </div>
      )}
    </div>
  )
}

