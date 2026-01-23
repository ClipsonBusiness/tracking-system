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

    // Validate: If custom domain is entered, DNS must be configured
    if (formData.customDomain && formData.customDomain.trim()) {
      // Check if client has DNS configured
      if (formData.clientId) {
        try {
          const checkRes = await fetch(`/api/admin/clients/${formData.clientId}/dns/check`)
          if (checkRes.ok) {
            const dnsData = await checkRes.json()
            if (!dnsData.dnsConfigured) {
              // Don't block, just redirect to DNS config
              // setError('Custom domain requires DNS configuration. Please configure DNS for this client first.')
              // setLoading(false)
              // return
            }
          }
        } catch (err) {
          // If check fails, still allow but warn
          console.error('DNS check failed:', err)
        }
      } else {
        // No client selected, can't check DNS - require client selection
        setError('Please select a client first to configure custom domain DNS.')
        setLoading(false)
        return
      }
    }

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
        const campaign = await res.json()
        router.refresh()
        
        // If custom domain was entered, redirect to DNS config
        if (formData.customDomain && formData.customDomain.trim() && formData.clientId) {
          router.push(`/admin/clients/${formData.clientId}/dns?domain=${encodeURIComponent(formData.customDomain.trim())}`)
          return
        }
        
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
          Custom Domain {formData.customDomain && formData.customDomain.trim() && <span className="text-red-400">*</span>}
        </label>
        <input
          id="customDomain"
          type="text"
          value={formData.customDomain}
          onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
          placeholder="lowbackability.com"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {formData.customDomain && formData.customDomain.trim() && !formData.clientId && (
          <p className="text-xs text-yellow-400 mt-1">
            ⚠️ Please select a client first. DNS configuration is required for custom domains.
          </p>
        )}
        {formData.customDomain && (
          <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-300 font-medium mb-2">
              ⚠️ Custom Domain Setup Required
            </p>
            <p className="text-xs text-yellow-400 mb-2">
              For <code className="bg-yellow-900/30 px-1 rounded">{formData.customDomain}</code> to work, you need ONE of these from your client:
            </p>
            <div className="space-y-2 mb-2">
              <div className="bg-green-900/20 border border-green-700 rounded p-2">
                <p className="text-xs text-green-300 font-medium">✅ EASIEST: JavaScript Redirect</p>
                <p className="text-xs text-green-400">Client adds a small script to their website. No DNS needed!</p>
              </div>
              <div className="bg-blue-900/20 border border-blue-700 rounded p-2">
                <p className="text-xs text-blue-300 font-medium">🔧 DNS Access</p>
                <p className="text-xs text-blue-400">Point domain to tracking server (requires DNS access)</p>
              </div>
              <div className="bg-purple-900/20 border border-purple-700 rounded p-2">
                <p className="text-xs text-purple-300 font-medium">🔗 Subdomain (Easier DNS)</p>
                <p className="text-xs text-purple-400">Use links.{formData.customDomain} instead</p>
              </div>
            </div>
            <p className="text-xs text-yellow-300 font-medium mt-2">
              Link Format: <code className="bg-yellow-900/30 px-1 rounded">{formData.customDomain}/ref=xxxx</code>
            </p>
            <p className="text-xs text-yellow-400 mt-1">
              💡 <strong>Recommendation:</strong> Ask client if they can add code to their website. If yes, use JavaScript redirect (easiest!).
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

