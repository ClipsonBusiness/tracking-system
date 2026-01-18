'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface StripeConnectManualProps {
  clientId: string
  isConnected: boolean
  connectedAt: Date | null
}

export default function StripeConnectManual({
  clientId,
  isConnected,
  connectedAt,
}: StripeConnectManualProps) {
  const router = useRouter()
  const [webhookSecret, setWebhookSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!webhookSecret.trim()) {
      setError('Please enter your webhook secret')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/client/stripe/webhook-secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          webhookSecret: webhookSecret.trim(),
        }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save webhook secret')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
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
            Add your Stripe webhook secret to enable automatic sales tracking
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
              ✅ Stripe webhook configured
            </p>
            <p className="text-green-400 text-xs">
              Configured on {formatDate(connectedAt)}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-blue-900/10 border border-blue-700/50 rounded-lg">
            <p className="text-blue-300 text-sm mb-2 font-medium">
              How to get your webhook secret:
            </p>
            <ol className="text-blue-400 text-xs space-y-1 list-decimal list-inside">
              <li>Go to your Stripe Dashboard → Webhooks</li>
              <li>Click "Add endpoint"</li>
              <li>Enter URL: <code className="bg-blue-900/30 px-1 rounded">https://your-app.railway.app/api/stripe/webhook</code></li>
              <li>Select events: invoice.paid, checkout.session.completed, etc.</li>
              <li>Copy the "Signing secret" (starts with whsec_)</li>
              <li>Paste it below</li>
            </ol>
          </div>

          <div>
            <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-300 mb-2">
              Webhook Secret
            </label>
            <input
              id="webhookSecret"
              type="text"
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="whsec_..."
              className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Your webhook secret from Stripe Dashboard (starts with whsec_)
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Webhook Secret'}
          </button>
        </form>
      )}
    </div>
  )
}

