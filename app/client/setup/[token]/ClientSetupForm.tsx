'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  destinationUrl: string
}

export default function ClientSetupForm({
  clientId,
  clientName,
  existingCustomDomain,
  existingStripeWebhookSecret,
  existingStripeAccountId,
  campaign,
  token,
  appBaseUrl,
}: {
  clientId: string
  clientName: string
  existingCustomDomain: string | null
  existingStripeWebhookSecret: string | null
  existingStripeAccountId: string | null
  campaign: Campaign | null
  token: string
  appBaseUrl: string
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
  const [jsCopied, setJsCopied] = useState(false)
  
  // Get tracking server URL - use appBaseUrl from server for consistency
  const trackingServerUrl = appBaseUrl || (typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://clipsonaffiliates.com')
  
  // Generate JavaScript code when custom domain is entered
  // SAFE VERSION: Only redirects when ?ref= parameter is present
  const generateJsCode = (domain: string) => {
    if (!domain || !domain.trim()) return ''
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^\/+/, '')
    return `<!-- Clipson Tracking Redirect (SAFE: only redirects when ?ref= is present) -->
<script>
(function() {
  if (window.location.hostname !== '${cleanDomain}' &&
      window.location.hostname !== 'www.${cleanDomain}') {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');

  if (!refParam) return;

  const trackingUrl = '${trackingServerUrl}/?ref=' + encodeURIComponent(refParam);
  window.location.replace(trackingUrl);
})();
</script>`
  }
  
  const jsCode = generateJsCode(formData.customDomain)
  
  function copyJsCode() {
    if (jsCode) {
      navigator.clipboard.writeText(jsCode)
      setJsCopied(true)
      setTimeout(() => setJsCopied(false), 2000)
    }
  }

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
        {formData.customDomain && formData.customDomain.trim() && (
          <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <div className="flex items-start gap-3 mb-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h4 className="text-yellow-300 font-semibold mb-1">
                  Important: Add JavaScript Code to Your Website
                </h4>
                <p className="text-sm text-yellow-200">
                  For tracking to work on <code className="bg-yellow-900/50 px-1 rounded">{formData.customDomain}</code>, you need to add the code below to your website.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-gray-400">
                  Copy this code and add it to your website&apos;s <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code> or before <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code>:
                </label>
                <button
                  type="button"
                  onClick={copyJsCode}
                  className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors"
                >
                  {jsCopied ? '✓ Copied!' : '📋 Copy Code'}
                </button>
              </div>
              <pre className="text-xs text-green-400 bg-gray-800 p-3 rounded overflow-x-auto">
                <code>{jsCode}</code>
              </pre>
            </div>
            
            <div className="text-xs text-yellow-200 space-y-1">
              <p className="font-semibold">How to add:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the code above</li>
                <li>Open your website&apos;s HTML file (or your website builder&apos;s code editor)</li>
                <li>Paste it in the <code className="bg-yellow-900/50 px-1 rounded">&lt;head&gt;</code> section or right before <code className="bg-yellow-900/50 px-1 rounded">&lt;/body&gt;</code></li>
                <li>Save and publish your website</li>
                <li>Test by visiting: <code className="bg-yellow-900/50 px-1 rounded">{formData.customDomain}/?ref=test</code></li>
              </ol>
            </div>
          </div>
        )}
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
            <li>Endpoint URL: <code className="bg-gray-800 px-1 rounded">{appBaseUrl}/api/stripe/webhook</code></li>
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

