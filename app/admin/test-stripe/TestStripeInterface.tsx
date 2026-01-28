'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  stripeWebhookSecret: string | null
  stripeAccountId: string | null
}

interface Conversion {
  id: string
  affiliateCode: string | null
  amountPaid: number
  currency: string
  paidAt: Date
  status: string
  client: {
    name: string
  }
}

interface StripeEvent {
  id: string
  type: string
  created: Date
}

export default function TestStripeInterface({
  clients,
  recentConversions,
  recentEvents,
}: {
  clients: Client[]
  recentConversions: Conversion[]
  recentEvents: StripeEvent[]
}) {
  const router = useRouter()
  const [selectedClientId, setSelectedClientId] = useState('')
  const [testAffiliateCode, setTestAffiliateCode] = useState('TEST123')
  const [testPriceId, setTestPriceId] = useState('')
  const [isLiveMode, setIsLiveMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)

  const selectedClient = clients.find((c) => c.id === selectedClientId)

  async function handleCreateTestCheckout() {
    if (!selectedClientId) {
      setError('Please select a client')
      return
    }

    if (!testPriceId) {
      setError('Please enter a Stripe Price ID (e.g., price_xxx)')
      return
    }

    setLoading(true)
    setError('')
    setCheckoutUrl(null)

    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: testPriceId,
          affiliateCode: testAffiliateCode || null,
          successUrl: `${window.location.origin}/admin/test-stripe?success=true`,
          cancelUrl: `${window.location.origin}/admin/test-stripe?canceled=true`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCheckoutUrl(data.url)
        // Open in new tab
        window.open(data.url, '_blank')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create checkout session')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Webhook Status Warning */}
      {recentEvents.length === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-300 mb-2">⚠️ No Webhook Events Received</h2>
          <p className="text-yellow-400 text-sm mb-4">
            If you&apos;ve completed test checkouts but see no conversions, your webhook may not be configured.
          </p>
          <div className="space-y-2 text-sm text-yellow-300">
            <p><strong>Quick Fix:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-yellow-400">
              <li>Go to <a href="https://dashboard.stripe.com/test/webhooks" target="_blank" rel="noopener noreferrer" className="underline">Stripe Dashboard → Webhooks</a></li>
              <li>Add endpoint: <code className="bg-yellow-900/30 px-1 rounded">https://tracking-system-production-d23c.up.railway.app/api/stripe/webhook</code></li>
              <li>Select events: <code className="bg-yellow-900/30 px-1 rounded">invoice.paid</code>, <code className="bg-yellow-900/30 px-1 rounded">checkout.session.completed</code></li>
              <li>Copy webhook secret (starts with <code className="bg-yellow-900/30 px-1 rounded">whsec_</code>)</li>
              <li>Add to Railway Variables: <code className="bg-yellow-900/30 px-1 rounded">STRIPE_WEBHOOK_SECRET</code></li>
            </ol>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🧪 How to Test Stripe Tracking</h2>
        <div className="space-y-3 text-sm text-gray-300">
          <div>
            <p className="font-medium text-white mb-2">Option 1: Create Test Checkout (Recommended)</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-400">
              <li>Select a client with Stripe connected</li>
              <li>Enter a test Stripe Price ID (from your Stripe dashboard)</li>
              <li>Enter an affiliate code (optional, for testing attribution)</li>
              <li>Click &quot;Create Test Checkout&quot; - it will open Stripe checkout</li>
              <li>Use Stripe test card: <code className="bg-gray-800 px-1 rounded">4242 4242 4242 4242</code> (for test mode only)</li>
              <li>For live mode: Use real payment methods - you will be charged!</li>
              <li>Complete the payment</li>
              <li>Check &quot;Recent Conversions&quot; below to see if it was tracked</li>
            </ol>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-800">
            <p className="font-medium text-white mb-2">Option 2: Use Stripe CLI (Advanced)</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-400">
              <li>Install Stripe CLI: <code className="bg-gray-800 px-1 rounded">brew install stripe/stripe-cli/stripe</code></li>
              <li>Login: <code className="bg-gray-800 px-1 rounded">stripe login</code></li>
              <li>Forward webhooks: <code className="bg-gray-800 px-1 rounded">stripe listen --forward-to localhost:3000/api/stripe/webhook</code></li>
              <li>Trigger test event: <code className="bg-gray-800 px-1 rounded">stripe trigger invoice.paid</code></li>
            </ol>
          </div>
        </div>
      </div>

      {/* Test Checkout Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">
          {isLiveMode ? 'Create Live Checkout ⚠️' : 'Create Test Checkout'}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Client *
            </label>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a client --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.stripeWebhookSecret ? '✅' : '⚠️'}
                </option>
              ))}
            </select>
            {selectedClient && (
              <p className="text-xs text-gray-400 mt-1">
                {selectedClient.stripeWebhookSecret
                  ? '✅ Webhook secret configured'
                  : '⚠️ No webhook secret - webhooks may not work'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stripe Price ID *
            </label>
            <div className="flex items-center gap-3 mb-2">
              <input
                type="text"
                value={testPriceId}
                onChange={(e) => setTestPriceId(e.target.value)}
                placeholder="price_1234567890"
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLiveMode}
                  onChange={(e) => setIsLiveMode(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <span className={isLiveMode ? 'text-red-400 font-semibold' : ''}>
                  Live Mode {isLiveMode && '⚠️'}
                </span>
              </label>
            </div>
            {isLiveMode ? (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-red-300 text-xs font-semibold mb-1">⚠️ Live Mode Enabled</p>
                <p className="text-red-400 text-xs">
                  You will be charged real money! Use a live mode price ID from your Stripe Dashboard.
                </p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">
                Get this from your Stripe Dashboard → Products → Prices (test mode: <code className="bg-gray-800 px-1 rounded">price_xxx</code> or live mode: <code className="bg-gray-800 px-1 rounded">price_xxx</code>)
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Test Affiliate Code (Optional)
            </label>
            <input
              type="text"
              value={testAffiliateCode}
              onChange={(e) => setTestAffiliateCode(e.target.value)}
              placeholder="TEST123"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              This will be added to checkout metadata to test affiliate attribution
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {checkoutUrl && (
            <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
              <p className="text-green-300 text-sm mb-2">✅ Checkout session created!</p>
              <p className="text-green-400 text-xs">
                Checkout opened in new tab. Use test card <code className="bg-gray-800 px-1 rounded">4242 4242 4242 4242</code>
              </p>
            </div>
          )}

          <button
            onClick={handleCreateTestCheckout}
            disabled={loading || !selectedClientId || !testPriceId}
            className={`w-full px-6 py-3 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isLiveMode
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {loading ? 'Creating...' : isLiveMode ? '⚠️ Create Live Checkout (Real Money)' : 'Create Test Checkout'}
          </button>
        </div>
      </div>

      {/* Recent Conversions */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Conversions</h2>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
        {recentConversions.length === 0 ? (
          <p className="text-gray-400 text-sm">No conversions yet. Create a test checkout above!</p>
        ) : (
          <div className="space-y-2">
            {recentConversions.map((conversion) => (
              <div
                key={conversion.id}
                className="p-4 bg-gray-700 rounded-lg border border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">
                      {conversion.client.name}
                    </p>
                    <p className="text-sm text-gray-400">
                      {conversion.affiliateCode ? (
                        <>Affiliate: <code className="bg-gray-800 px-1 rounded">{conversion.affiliateCode}</code></>
                      ) : (
                        'No affiliate code'
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-medium">
                      {(conversion.amountPaid / 100).toFixed(2)} {conversion.currency.toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(conversion.paidAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Stripe Events */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Stripe Events</h2>
          <button
            onClick={() => router.refresh()}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
          >
            Refresh
          </button>
        </div>
        {recentEvents.length === 0 ? (
          <p className="text-gray-400 text-sm">No events received yet.</p>
        ) : (
          <div className="space-y-2">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="p-3 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-between"
              >
                <div>
                  <code className="text-blue-400 text-sm">{event.type}</code>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(event.created).toLocaleString()}
                  </p>
                </div>
                <code className="text-xs text-gray-500">{event.id.substring(0, 20)}...</code>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

