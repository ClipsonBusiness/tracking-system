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
  const [showDNSForm, setShowDNSForm] = useState(false)
  const [affiliateData, setAffiliateData] = useState({
    stripeWebhookSecret: '',
    stripeAccountId: '',
  })
  const [dnsData, setDnsData] = useState({
    dnsType: 'CNAME',
    dnsName: '@',
    dnsValue: process.env.NEXT_PUBLIC_APP_BASE_URL?.replace(/https?:\/\//, '') || 'tracking-system-production-d23c.up.railway.app',
    dnsTtl: '3600',
    notes: '',
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
        
        // If custom domain was entered, show DNS form inline or redirect
        if (formData.customDomain && formData.customDomain.trim() && formData.clientId) {
          // Show DNS form inline instead of redirecting
          setShowDNSForm(true)
          // Don't reset form yet - keep it visible
        } else {
          // No custom domain, reset form normally
          router.refresh()
          setFormData({
            clientId: '',
            name: '',
            destinationUrl: '',
            customDomain: '',
            status: 'active',
          })
        }
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
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-2">
            Client
          </label>
          <select
            id="clientId"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Create new client automatically</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Select existing client or leave blank to auto-create from campaign name
          </p>
        </div>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Campaign Name *
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

      {/* DNS Configuration Form - Shows after campaign creation with custom domain */}
      {showDNSForm && formData.customDomain && formData.clientId && (
        <div className="mt-6 bg-purple-900/20 border border-purple-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-white">🔧 Configure DNS</h3>
              <p className="text-sm text-gray-400 mt-1">
                Campaign created! Now configure DNS for <code className="text-purple-300">{formData.customDomain}</code>
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowDNSForm(false)
                router.refresh()
                setFormData({
                  clientId: '',
                  name: '',
                  destinationUrl: '',
                  customDomain: '',
                  status: 'active',
                })
              }}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setLoading(true)
              setError('')

              try {
                const res = await fetch(`/api/admin/clients/${formData.clientId}/dns`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    customDomain: formData.customDomain.trim(),
                    ...dnsData,
                  }),
                })

                if (res.ok) {
                  // Success! Refresh and reset
                  router.refresh()
                  setShowDNSForm(false)
                  setFormData({
                    clientId: '',
                    name: '',
                    destinationUrl: '',
                    customDomain: '',
                    status: 'active',
                  })
                  alert('✅ DNS configured successfully! Custom domain is now active.')
                } else {
                  const data = await res.json()
                  setError(data.error || 'Failed to save DNS configuration')
                }
              } catch (err) {
                setError('Network error')
              } finally {
                setLoading(false)
              }
            }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DNS Type *
                </label>
                <select
                  value={dnsData.dnsType}
                  onChange={(e) => setDnsData({ ...dnsData, dnsType: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="CNAME">CNAME</option>
                  <option value="A">A Record</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  DNS Name *
                </label>
                <input
                  type="text"
                  value={dnsData.dnsName}
                  onChange={(e) => setDnsData({ ...dnsData, dnsName: e.target.value })}
                  placeholder="@"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <p className="text-xs text-gray-400 mt-1">Usually &quot;@&quot; for root domain</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                DNS Value / Target * (Your Railway Domain)
              </label>
              <input
                type="text"
                value={dnsData.dnsValue}
                onChange={(e) => setDnsData({ ...dnsData, dnsValue: e.target.value })}
                placeholder="tracking-system-production-d23c.up.railway.app"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <p className="text-xs text-gray-400 mt-1">Your Railway app domain</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                TTL (Time To Live)
              </label>
              <input
                type="text"
                value={dnsData.dnsTtl}
                onChange={(e) => setDnsData({ ...dnsData, dnsTtl: e.target.value })}
                placeholder="3600"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={dnsData.notes}
                onChange={(e) => setDnsData({ ...dnsData, notes: e.target.value })}
                placeholder="Client sent DNS record on..."
                rows={2}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving DNS...' : '✅ Save DNS Configuration'}
              </button>
              <button
                type="button"
                onClick={() => {
                  router.push(`/admin/clients/${formData.clientId}/dns?domain=${encodeURIComponent(formData.customDomain.trim())}`)
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
              >
                Open Full DNS Page →
              </button>
            </div>
          </form>
        </div>
      )}
    </form>
  )
}

