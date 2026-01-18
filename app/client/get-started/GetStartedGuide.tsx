'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface GetStartedGuideProps {
  clientId: string
  clientName: string
  isStripeConnected: boolean
  appBaseUrl: string
  customDomain: string | null
  token: string
}

export default function GetStartedGuide({
  clientId,
  clientName,
  isStripeConnected,
  appBaseUrl,
  customDomain,
  token,
}: GetStartedGuideProps) {
  const router = useRouter()
  const [webhookSecret, setWebhookSecret] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSaveWebhook = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    if (!webhookSecret.trim()) {
      setError('Please enter your webhook secret')
      setLoading(false)
      return
    }

    if (!webhookSecret.startsWith('whsec_')) {
      setError('Invalid webhook secret. Must start with whsec_')
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
        setSuccess(true)
        setWebhookSecret('')
        setTimeout(() => {
          router.refresh()
        }, 1500)
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

  const webhookUrl = `${appBaseUrl}/api/stripe/webhook`

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isStripeConnected ? 'bg-green-600' : 'bg-blue-600'}`}>
            {isStripeConnected ? '✓' : '1'}
          </div>
          <span className="text-sm text-gray-300">Connect Stripe</span>
        </div>
        <div className="flex-1 h-0.5 bg-gray-700 mx-4"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            2
          </div>
          <span className="text-sm text-gray-400">Start Tracking</span>
        </div>
      </div>

      {/* Step 1: Connect Stripe */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">
              Step 1: Connect Your Stripe Account
            </h2>
            <p className="text-sm text-gray-400">
              Connect your Stripe account to automatically track sales and revenue
            </p>
          </div>
          {isStripeConnected && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-900/20 border border-green-700 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-300 font-medium">Connected</span>
            </div>
          )}
        </div>

        {isStripeConnected ? (
          <div className="p-4 bg-green-900/10 border border-green-700/50 rounded-lg">
            <p className="text-green-300 text-sm font-medium mb-2">
              ✅ Stripe webhook configured successfully!
            </p>
            <p className="text-green-400 text-xs">
              Your sales are being tracked automatically. Revenue, subscriptions, and affiliate attributions are all working.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Instructions */}
            <div className="bg-blue-900/10 border border-blue-700/50 rounded-lg p-4">
              <h3 className="text-blue-300 font-medium mb-3 text-sm">
                📋 How to get your webhook secret:
              </h3>
              <ol className="space-y-2 text-sm text-blue-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">1.</span>
                  <span>Go to your <a href="https://dashboard.stripe.com/webhooks" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300">Stripe Dashboard → Webhooks</a></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">2.</span>
                  <span>Click <strong>"Add endpoint"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">3.</span>
                  <span>
                    Enter this URL:
                    <div className="mt-1 flex items-center gap-2">
                      <code className="bg-blue-900/30 px-2 py-1 rounded text-xs break-all">
                        {webhookUrl}
                      </code>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(webhookUrl)
                          alert('URL copied!')
                        }}
                        className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                      >
                        Copy
                      </button>
                    </div>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">4.</span>
                  <span>Select these events:
                    <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                      <li><code>checkout.session.completed</code></li>
                      <li><code>invoice.paid</code></li>
                      <li><code>customer.subscription.created</code></li>
                      <li><code>customer.subscription.updated</code></li>
                      <li><code>charge.refunded</code></li>
                    </ul>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">5.</span>
                  <span>Click <strong>"Add endpoint"</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">6.</span>
                  <span>Copy the <strong>"Signing secret"</strong> (starts with <code>whsec_</code>)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-300">7.</span>
                  <span>Paste it below and click "Save"</span>
                </li>
              </ol>
            </div>

            {/* Webhook Secret Input */}
            <form onSubmit={handleSaveWebhook} className="space-y-4">
              <div>
                <label htmlFor="webhookSecret" className="block text-sm font-medium text-gray-300 mb-2">
                  Paste Your Webhook Secret
                </label>
                <input
                  id="webhookSecret"
                  type="text"
                  value={webhookSecret}
                  onChange={(e) => setWebhookSecret(e.target.value)}
                  placeholder="whsec_..."
                  className="w-full px-4 py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
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

              {success && (
                <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
                  <p className="text-sm text-green-300">✅ Webhook secret saved! Refreshing...</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : success ? 'Saved!' : 'Save Webhook Secret'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Step 2: Start Tracking */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <h2 className="text-xl font-semibold text-white mb-2">
          Step 2: Start Creating Tracking Links
        </h2>
        <p className="text-sm text-gray-400 mb-4">
          Once Stripe is connected, you can start creating tracking links and viewing analytics
        </p>

        <div className="space-y-3">
          <div className="p-4 bg-gray-600 rounded-lg">
            <h3 className="text-white font-medium mb-2">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Create tracking links for your products/services</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Track clicks, countries, and traffic sources</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>View revenue and sales analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✓</span>
                <span>Track affiliate performance</span>
              </li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Link
              href={`/client/dashboard?token=${token}`}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
            <a
              href="https://dashboard.stripe.com/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
            >
              Open Stripe Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-gray-700 rounded-lg p-6 border border-gray-600">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Link
            href={`/client/dashboard?token=${token}`}
            className="p-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            <h3 className="text-white font-medium mb-1">Dashboard</h3>
            <p className="text-xs text-gray-400">View analytics and manage settings</p>
          </Link>
          <a
            href="https://dashboard.stripe.com/webhooks"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-gray-600 hover:bg-gray-500 rounded-lg transition-colors"
          >
            <h3 className="text-white font-medium mb-1">Stripe Webhooks</h3>
            <p className="text-xs text-gray-400">Manage your webhook endpoints</p>
          </a>
        </div>
      </div>
    </div>
  )
}

