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
  const [isEditing, setIsEditing] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

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
        setIsEditing(false)
        setWebhookSecret('')
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

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove the Stripe webhook? Sales tracking will stop working.')) {
      return
    }

    setIsRemoving(true)
    setError('')

    try {
      const res = await fetch('/api/client/stripe/webhook-secret', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to remove webhook secret')
        setIsRemoving(false)
      }
    } catch (err) {
      setError('Network error')
      setIsRemoving(false)
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

      {isConnected && !isEditing ? (
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
            <p className="mb-2">What&apos;s tracked automatically:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Subscription payments</li>
              <li>One-time payments</li>
              <li>Refunds</li>
              <li>Affiliate attribution</li>
            </ul>
          </div>

          {/* Important: Pass link_slug for per-clipper tracking */}
          <div className="p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg mt-4">
            <div className="flex items-start gap-2 mb-2">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-yellow-300 text-sm font-medium mb-1">
                  For Accurate Per-Clipper Sales Tracking
                </p>
                <p className="text-yellow-200 text-xs mb-3">
                  To track which clipper generated each sale, you need to pass the <code className="bg-yellow-900/50 px-1 rounded">link_slug</code> cookie to Stripe checkout metadata.
                </p>
                <details className="text-xs">
                  <summary className="text-yellow-300 cursor-pointer hover:text-yellow-200 font-medium mb-2">
                    📋 Click to see code example
                  </summary>
                  <div className="bg-gray-900 rounded p-3 mt-2">
                    <p className="text-yellow-200 mb-2 font-medium">Add this to your Stripe checkout code:</p>
                    <pre className="text-xs text-green-400 overflow-x-auto">
{`// Read the link_slug cookie (set by tracking redirect)
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

const linkSlug = getCookie('link_slug');

// When creating Stripe checkout session
const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config ...
  metadata: {
    link_slug: linkSlug || '', // Add this!
  },
  subscription_data: {
    metadata: {
      link_slug: linkSlug || '', // Add this too!
    },
  },
});`}
                    </pre>
                    <p className="text-yellow-200 text-xs mt-2">
                      <strong>Note:</strong> Without this, the system will try to match sales to clippers by most recent click (less accurate).
                    </p>
                  </div>
                </details>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-600">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Edit Webhook Secret
            </button>
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {isRemoving ? 'Removing...' : 'Remove'}
            </button>
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
              <li>Click &quot;Add endpoint&quot;</li>
              <li>Enter URL: <code className="bg-blue-900/30 px-1 rounded">https://your-app.railway.app/api/stripe/webhook</code></li>
              <li>Select events: invoice.paid, checkout.session.completed, etc.</li>
              <li>Copy the &quot;Signing secret&quot; (starts with whsec_)</li>
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

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : isEditing ? 'Update Webhook Secret' : 'Save Webhook Secret'}
            </button>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setWebhookSecret('')
                  setError('')
                }}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  )
}

