'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  destinationUrl: string
} | null

export default function ClientSetupForm({
  clientId,
  clientName,
  existingCustomDomain,
  existingStripeWebhookSecret,
  existingStripeAccountId,
  campaign,
  token,
}: {
  clientId: string
  clientName: string
  existingCustomDomain: string | null
  existingStripeWebhookSecret: string | null
  existingStripeAccountId: string | null
  campaign: Campaign
  token: string
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customDomain: existingCustomDomain || '',
    stripeWebhookSecret: existingStripeWebhookSecret || '',
    stripeAccountId: existingStripeAccountId || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`/api/client/update-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          customDomain: formData.customDomain.trim() || null,
          stripeWebhookSecret: formData.stripeWebhookSecret.trim() || null,
          stripeAccountId: formData.stripeAccountId.trim() || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push(`/client/dashboard?token=${token}`)
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save details')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-400">
            ✅ Setup complete! Redirecting to your dashboard...
          </p>
        </div>
      )}

      {campaign && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Campaign: {campaign.name}</h3>
          <p className="text-sm text-blue-300">
            Destination: <span className="text-blue-400">{campaign.destinationUrl}</span>
          </p>
        </div>
      )}

      {/* Custom Domain */}
      <div>
        <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
          Your Custom Domain (Optional)
        </label>
        <input
          id="customDomain"
          type="text"
          value={formData.customDomain}
          onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
          placeholder="lowbackability.com"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Your tracking links will use this domain (e.g., lowbackability.com/?ref=xxxxx)
        </p>
      </div>

      {/* Stripe Webhook Secret */}
      <div>
        <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-300 mb-2">
          Stripe Webhook Secret <span className="text-red-400">*</span>
        </label>
        <input
          id="stripeWebhookSecret"
          type="text"
          value={formData.stripeWebhookSecret}
          onChange={(e) => setFormData({ ...formData, stripeWebhookSecret: e.target.value })}
          placeholder="whsec_..."
          required
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Get this from your Stripe Dashboard → Webhooks → Your webhook → Signing secret
        </p>
        <div className="mt-2 p-3 bg-gray-700/50 rounded text-xs text-gray-300">
          <p className="font-semibold mb-1">How to get your Stripe Webhook Secret:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Go to your Stripe Dashboard</li>
            <li>Click &quot;Webhooks&quot; in the left menu</li>
            <li>Click &quot;Add endpoint&quot; or select your existing webhook</li>
            <li>Endpoint URL: <code className="bg-gray-800 px-1 rounded">https://clipsonaffiliates.com/api/stripe/webhook</code></li>
            <li>Select events: <code className="bg-gray-800 px-1 rounded">invoice.paid</code>, <code className="bg-gray-800 px-1 rounded">checkout.session.completed</code></li>
            <li>Copy the &quot;Signing secret&quot; (starts with <code className="bg-gray-800 px-1 rounded">whsec_</code>)</li>
            <li>Paste it above</li>
          </ol>
        </div>
      </div>

      {/* Stripe Account ID (Optional) */}
      <div>
        <label htmlFor="stripeAccountId" className="block text-sm font-medium text-gray-300 mb-2">
          Stripe Account ID (Optional)
        </label>
        <input
          id="stripeAccountId"
          type="text"
          value={formData.stripeAccountId}
          onChange={(e) => setFormData({ ...formData, stripeAccountId: e.target.value })}
          placeholder="acct_..."
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Your Stripe account ID (starts with acct_). Usually auto-detected if using Stripe Connect.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || success}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </button>
      </div>

      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
        <h4 className="text-white font-semibold mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Your tracking links will be ready to use</li>
          <li>Link clicks will be automatically tracked</li>
          <li>Sales from Stripe will be tracked and attributed to clippers</li>
          <li>You&apos;ll have access to your dashboard with analytics</li>
        </ul>
      </div>
    </form>
  )
}

