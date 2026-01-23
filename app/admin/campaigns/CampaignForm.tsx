'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

export default function CampaignForm({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clientId: '',
    name: '',
    destinationUrl: '',
    customDomain: '',
    status: 'active',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAffiliateProgram, setShowAffiliateProgram] = useState(false)
  const [affiliateData, setAffiliateData] = useState({
    stripeWebhookSecret: '',
    stripeAccountId: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customDomain: formData.customDomain.trim() || null,
          ...(showAffiliateProgram && affiliateData.stripeWebhookSecret && {
            stripeWebhookSecret: affiliateData.stripeWebhookSecret.trim(),
          }),
          ...(showAffiliateProgram && affiliateData.stripeAccountId && {
            stripeAccountId: affiliateData.stripeAccountId.trim(),
          }),
        }),
      })

      if (res.ok) {
        router.refresh()
        setFormData({
          clientId: '',
          name: '',
          destinationUrl: '',
          customDomain: '',
          status: 'active',
        })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create campaign')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Brendan Clipping"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="destinationUrl" className="block text-sm font-medium text-gray-300 mb-2">
          Destination URL
        </label>
        <input
          id="destinationUrl"
          type="url"
          value={formData.destinationUrl}
          onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
          placeholder="https://lowbackability.com"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
          Custom Domain (Optional)
        </label>
        <input
          id="customDomain"
          type="text"
          value={formData.customDomain}
          onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
          placeholder="lowbackability.com"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.customDomain && (
          <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-300 font-medium mb-2">
              ⚠️ Custom Domain Setup Required
            </p>
            <p className="text-xs text-yellow-400 mb-2">
              For <code className="bg-yellow-900/30 px-1 rounded">{formData.customDomain}</code> to work, you need to configure DNS or use one of these options:
            </p>
            <ul className="text-xs text-yellow-400 space-y-1 list-disc list-inside mb-2">
              <li><strong>DNS:</strong> Point domain to tracking server (requires DNS access)</li>
              <li><strong>Reverse Proxy:</strong> Add nginx/apache config (requires server access)</li>
              <li><strong>JavaScript:</strong> Add redirect script to website (easiest)</li>
              <li><strong>Subdomain:</strong> Use links.{formData.customDomain} instead (easier DNS)</li>
            </ul>
            <p className="text-xs text-yellow-300 font-medium mt-2">
              Link Format: <code className="bg-yellow-900/30 px-1 rounded">{formData.customDomain}/ref=xxxx</code>
            </p>
            <p className="text-xs text-yellow-400 mt-1">
              Until configured, links will show custom domain but won&apos;t work. Use Railway URL instead.
            </p>
          </div>
        )}
        {!formData.customDomain && (
          <p className="text-xs text-gray-400 mt-1">
            Links will use format: <code className="bg-gray-700 px-1 rounded">your-domain.com/ref=xxxx</code> or Railway URL
          </p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
          Status
        </label>
        <select
          id="status"
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Affiliate Program Section */}
      <div className="border-t border-gray-700 pt-4">
        <button
          type="button"
          onClick={() => setShowAffiliateProgram(!showAffiliateProgram)}
          className="w-full flex items-center justify-between px-4 py-3 bg-purple-900/20 hover:bg-purple-900/30 border border-purple-700 rounded-lg transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💰</span>
            <div className="text-left">
              <p className="text-white font-medium">Affiliate Program</p>
              <p className="text-xs text-gray-400">Enable sales tracking for this campaign</p>
            </div>
          </div>
          <span className="text-purple-400">
            {showAffiliateProgram ? '▼' : '▶'}
          </span>
        </button>

        {showAffiliateProgram && (
          <div className="mt-4 p-4 bg-purple-900/10 border border-purple-700/50 rounded-lg space-y-4">
            <div>
              <label htmlFor="stripeWebhookSecret" className="block text-sm font-medium text-gray-300 mb-2">
                Stripe Webhook Secret
              </label>
              <input
                id="stripeWebhookSecret"
                type="text"
                value={affiliateData.stripeWebhookSecret}
                onChange={(e) => setAffiliateData({ ...affiliateData, stripeWebhookSecret: e.target.value })}
                placeholder="whsec_..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Get this from Stripe Dashboard → Webhooks → Signing secret
              </p>
            </div>

            <div>
              <label htmlFor="stripeAccountId" className="block text-sm font-medium text-gray-300 mb-2">
                Stripe Account ID (Optional)
              </label>
              <input
                id="stripeAccountId"
                type="text"
                value={affiliateData.stripeAccountId}
                onChange={(e) => setAffiliateData({ ...affiliateData, stripeAccountId: e.target.value })}
                placeholder="acct_..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Only needed for Stripe Connect accounts
              </p>
            </div>

            <div className="p-3 bg-blue-900/20 border border-blue-700 rounded-lg">
              <p className="text-xs text-blue-300 font-medium mb-1">📋 Setup Instructions:</p>
              <ol className="text-xs text-blue-400 space-y-1 list-decimal list-inside">
                <li>Go to Stripe Dashboard → Webhooks</li>
                <li>Add endpoint: <code className="bg-blue-900/30 px-1 rounded">https://your-app.railway.app/api/stripe/webhook</code></li>
                <li>Select events: invoice.paid, checkout.session.completed</li>
                <li>Copy the signing secret (starts with whsec_)</li>
                <li>Paste it above</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Campaign'}
      </button>
    </form>
  )
}

