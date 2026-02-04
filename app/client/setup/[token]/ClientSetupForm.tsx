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
  const [metadataConfirmed, setMetadataConfirmed] = useState(false)
  const [activeTab, setActiveTab] = useState<'checkout' | 'paymentintent'>('checkout')
  
  // Get tracking server URL - use appBaseUrl from server for consistency
  const trackingServerUrl = appBaseUrl || (typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://clipsonaffiliates.com')
  
  // Generate JavaScript code when custom domain is entered
  // COOKIE-BASED VERSION: Sets cookie on client domain (Stripe-compatible)
  const generateJsCode = (domain: string) => {
    if (!domain || !domain.trim()) return ''
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^\/+/, '')
    return `<!-- Clipson Affiliate Tracking (Cookie-Based - Stripe Compatible) -->
<script>
(function() {
  // Only run on the client's domain
  const hostname = window.location.hostname;
  const domainMatch = hostname === '${cleanDomain}' || hostname === 'www.${cleanDomain}';
  if (!domainMatch) return;

  // Check for ?ref= parameter
  const urlParams = new URLSearchParams(window.location.search);
  const refParam = urlParams.get('ref');
  
  if (!refParam) return;

  // Set cookie on client's domain (90 days expiry)
  // This cookie will be available when user reaches Stripe checkout
  const expiryDays = 90;
  const expiryDate = new Date();
  expiryDate.setTime(expiryDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
  document.cookie = 'link_slug=' + encodeURIComponent(refParam) + 
    '; expires=' + expiryDate.toUTCString() + 
    '; path=/' + 
    '; SameSite=Lax' + 
    (location.protocol === 'https:' ? '; Secure' : '');

  // Optionally record click on tracking server (non-blocking)
  // This helps with analytics but isn't required for attribution
  try {
    navigator.sendBeacon('${trackingServerUrl}/track?ref=' + encodeURIComponent(refParam));
  } catch(e) {
    // Fallback if sendBeacon not supported
    fetch('${trackingServerUrl}/track?ref=' + encodeURIComponent(refParam), { method: 'GET', keepalive: true }).catch(() => {});
  }
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
    
    // Require metadata confirmation if webhook secret is provided
    if (formData.stripeWebhookSecret.trim() && !metadataConfirmed) {
      setError('Please confirm that your Stripe checkout passes affiliate metadata')
      return
    }
    
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
        // Use window.location instead of router.push to avoid CSS-in-JS issues
        setTimeout(() => {
          window.location.href = `/client/dashboard?token=${token}&success=setup_complete`
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

      {/* JavaScript Tracking Code - PROMINENT SECTION */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border-2 border-yellow-700 p-6 mb-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">📝</span>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-yellow-300 mb-2">
              Step 1: Add JavaScript Tracking Code to Your Website Header
            </h3>
            <p className="text-sm text-yellow-200 mb-4">
              This code enables tracking links on your domain. <strong>Enter your domain below</strong> to generate the code, then copy and paste it into your website&apos;s <code className="bg-yellow-900/50 px-1 rounded">&lt;head&gt;</code> section.
            </p>
          </div>
        </div>

        {/* Domain Input */}
        <div className="mb-4">
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
            Your Website Domain <span className="text-yellow-400">*</span>
          </label>
          <input
            id="customDomain"
            type="text"
            value={formData.customDomain}
            onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
            placeholder="freeclipping.com"
            className="w-full px-4 py-2 bg-gray-700 border-2 border-yellow-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-lg"
          />
          <p className="text-xs text-gray-400 mt-2">
            Enter your domain (e.g., freeclipping.com) to generate the tracking code below.
          </p>
        </div>

        {/* JavaScript Code Display */}
        {formData.customDomain && formData.customDomain.trim() ? (
          <div className="bg-gray-900 rounded-lg p-4 mb-3 border-2 border-yellow-600">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-yellow-300">
                📋 Copy this code and paste it in your website&apos;s <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code>:
              </label>
              <button
                type="button"
                onClick={copyJsCode}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded transition-colors"
              >
                {jsCopied ? '✓ Copied!' : '📋 Copy Code'}
              </button>
            </div>
            <pre className="text-xs text-green-400 bg-gray-800 p-4 rounded overflow-x-auto border border-gray-700">
              <code>{jsCode}</code>
            </pre>
            <p className="text-xs text-gray-400 mt-3">
              💡 <strong>Where to add:</strong> Paste this code in your website&apos;s <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code> section (before <code className="bg-gray-800 px-1 rounded">&lt;/head&gt;</code>) or before <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code>.
            </p>
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              👆 <strong>Enter your domain above</strong> to generate the JavaScript tracking code
            </p>
          </div>
        )}

        {/* Platform Instructions - Show when domain is entered */}
        {formData.customDomain && formData.customDomain.trim() && (
          <div className="mt-4 text-xs text-yellow-200 space-y-3">
            <p className="font-semibold text-base mb-2">📚 How to add (choose your platform):</p>
            
            {/* WordPress */}
            <div className="bg-yellow-900/30 rounded-lg p-3 mb-2">
              <p className="font-semibold mb-1">📝 WordPress (Easiest):</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Install <strong>WPCode</strong> plugin (free) or use <strong>Insert Headers and Footers</strong></li>
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">WPCode → Code Snippets → Add New</code></li>
                <li>Paste the code above</li>
                <li>Set location to <code className="bg-yellow-900/50 px-1 rounded">Site Wide Header</code></li>
                <li>Click <strong>Save Snippet</strong> and <strong>Activate</strong></li>
                <li>Test: <code className="bg-yellow-900/50 px-1 rounded">{formData.customDomain}/?ref=test</code></li>
              </ol>
            </div>

            {/* Squarespace */}
            <div className="bg-yellow-900/30 rounded-lg p-3 mb-2">
              <p className="font-semibold mb-1">🔷 Squarespace:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">Settings → Advanced → Code Injection</code></li>
                <li>Paste the code in the <strong>Header</strong> section</li>
                <li>Click <strong>Save</strong></li>
              </ol>
            </div>

            {/* Wix */}
            <div className="bg-yellow-900/30 rounded-lg p-3 mb-2">
              <p className="font-semibold mb-1">🎨 Wix:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">Settings → Custom Code</code></li>
                <li>Click <strong>Add Code</strong> → <strong>Head</strong></li>
                <li>Paste the code and click <strong>Apply</strong></li>
              </ol>
            </div>

            {/* Shopify */}
            <div className="bg-yellow-900/30 rounded-lg p-3 mb-2">
              <p className="font-semibold mb-1">🛒 Shopify:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">Online Store → Themes → Actions → Edit Code</code></li>
                <li>Open <code className="bg-yellow-900/50 px-1 rounded">theme.liquid</code></li>
                <li>Paste code before <code className="bg-yellow-900/50 px-1 rounded">&lt;/head&gt;</code></li>
                <li>Click <strong>Save</strong></li>
              </ol>
            </div>

            {/* Custom HTML */}
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <p className="font-semibold mb-1">⚙️ Custom HTML/Other:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Copy the code above</li>
                <li>Open your website&apos;s HTML file</li>
                <li>Paste it in the <code className="bg-yellow-900/50 px-1 rounded">&lt;head&gt;</code> section or before <code className="bg-yellow-900/50 px-1 rounded">&lt;/body&gt;</code></li>
                <li>Save and publish</li>
              </ol>
            </div>

            <div className="mt-3 p-2 bg-green-900/30 rounded border border-green-700">
              <p className="text-green-300 text-xs">
                ✅ <strong>Cookie-Based Tracking:</strong> This script sets a cookie on your domain when <code className="bg-green-900/50 px-1 rounded">?ref=</code> is present. Users stay on your site (no redirect), and the cookie is available for Stripe checkout attribution.
              </p>
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
        <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded text-xs text-yellow-200">
          <p className="font-semibold mb-1">⚠️ Important:</p>
          <p className="mb-2">
            Adding a webhook alone is <strong>not sufficient</strong> for sales tracking. You must also pass affiliate metadata in your Stripe checkout (see section below).
          </p>
        </div>
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

      {/* Stripe Checkout Integration Section */}
      {formData.stripeWebhookSecret.trim() && (
        <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <span className="text-3xl">🔴</span>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-300 mb-2">
                Stripe Checkout Integration (Required for Sales Tracking)
              </h3>
              <p className="text-sm text-red-200 mb-4">
                To track affiliate sales, your Stripe checkout <strong>must</strong> pass the affiliate ID into Stripe as metadata. Adding a webhook alone is not enough.
              </p>
            </div>
          </div>

          {/* Required Metadata Keys */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-white mb-2">Required Metadata Key:</p>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <pre className="text-xs text-green-400 overflow-x-auto">
                <code>{`{
  "ca_affiliate_id": "<affiliate_id>"
}`}</code>
              </pre>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              This value must be attached to every Stripe Checkout Session or PaymentIntent.
            </p>
          </div>

          {/* Code Examples Tabs */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-white mb-3">How to Add Metadata:</p>
            
            {/* Tab Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setActiveTab('checkout')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'checkout'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Stripe Checkout Sessions
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paymentintent')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'paymentintent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Payment Intents
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              {activeTab === 'checkout' ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-white mb-2">✅ Complete Ready-to-Use Code:</p>
                    <p className="text-xs text-gray-400 mb-3">Copy this entire code block and add it to your checkout page:</p>
                    <div className="bg-gray-800 rounded p-3 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const code = `// Helper function to read cookies
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Read the affiliate link slug from cookie (set by tracking script)
const linkSlug = getCookie('link_slug');

// When creating Stripe Checkout Session, include metadata:
const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config (line_items, mode, success_url, etc.) ...
  metadata: {
    ca_affiliate_id: linkSlug || '', // Pass the link slug to Stripe
  },
  subscription_data: {
    metadata: {
      ca_affiliate_id: linkSlug || '', // Also add to subscription for recurring payments
    },
  },
  payment_intent_data: {
    metadata: {
      ca_affiliate_id: linkSlug || '', // Optional: shows in PaymentIntent UI
    },
  },
});`
                          navigator.clipboard.writeText(code)
                          alert('✅ Complete code copied to clipboard!')
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors mb-2"
                      >
                        📋 Copy Complete Code
                      </button>
                      <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                        <code>{`// Helper function to read cookies
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Read the affiliate link slug from cookie (set by tracking script)
const linkSlug = getCookie('link_slug');

// When creating Stripe Checkout Session, include metadata:
const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config (line_items, mode, success_url, etc.) ...
  metadata: {
    ca_affiliate_id: linkSlug || '', // Pass the link slug to Stripe
  },
  subscription_data: {
    metadata: {
      ca_affiliate_id: linkSlug || '', // Also add to subscription for recurring payments
    },
  },
  payment_intent_data: {
    metadata: {
      ca_affiliate_id: linkSlug || '', // Optional: shows in PaymentIntent UI
    },
  },
});`}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                    <p className="text-xs font-semibold text-blue-300 mb-1">📝 Server-Side Example (Node.js/Express):</p>
                    <pre className="text-xs text-blue-400 overflow-x-auto whitespace-pre-wrap">
                      <code>{`// If checkout is created server-side, read cookie from request
app.post('/create-checkout', async (req, res) => {
  const linkSlug = req.cookies?.link_slug || req.headers.cookie
    ?.split('; ')
    ?.find(row => row.startsWith('link_slug='))
    ?.split('=')[1] || null;

  const session = await stripe.checkout.sessions.create({
    // ... your config ...
    metadata: {
      ca_affiliate_id: linkSlug || '',
    },
    subscription_data: {
      metadata: {
        ca_affiliate_id: linkSlug || '', // For recurring payments
      },
    },
    payment_intent_data: {
      metadata: {
        ca_affiliate_id: linkSlug || '', // Optional: shows in PaymentIntent UI
      },
    },
  });
  
  res.json({ sessionId: session.id });
});`}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-white mb-2">✅ Complete Ready-to-Use Code:</p>
                    <p className="text-xs text-gray-400 mb-3">Copy this entire code block and add it to your payment page:</p>
                    <div className="bg-gray-800 rounded p-3 mb-3">
                      <button
                        type="button"
                        onClick={() => {
                          const code = `// Helper function to read cookies
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Read the affiliate link slug from cookie (set by tracking script)
const linkSlug = getCookie('link_slug');

// When creating Payment Intent, include metadata:
const paymentIntent = await stripe.paymentIntents.create({
  // ... your existing payment config (amount, currency, etc.) ...
  metadata: {
    ca_affiliate_id: linkSlug || '', // Pass the link slug to Stripe
  },
});`
                          navigator.clipboard.writeText(code)
                          alert('✅ Complete code copied to clipboard!')
                        }}
                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors mb-2"
                      >
                        📋 Copy Complete Code
                      </button>
                      <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                        <code>{`// Helper function to read cookies
function getCookie(name) {
  const value = \`; \${document.cookie}\`;
  const parts = value.split(\`; \${name}=\`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Read the affiliate link slug from cookie (set by tracking script)
const linkSlug = getCookie('link_slug');

// When creating Payment Intent, include metadata:
const paymentIntent = await stripe.paymentIntents.create({
  // ... your existing payment config (amount, currency, etc.) ...
  metadata: {
    ca_affiliate_id: linkSlug || '', // Pass the link slug to Stripe
  },
});`}</code>
                      </pre>
                    </div>
                  </div>
                  
                  <div className="bg-blue-900/20 border border-blue-700 rounded p-3">
                    <p className="text-xs font-semibold text-blue-300 mb-1">📝 Server-Side Example (Node.js/Express):</p>
                    <pre className="text-xs text-blue-400 overflow-x-auto whitespace-pre-wrap">
                      <code>{`// If payment is created server-side, read cookie from request
app.post('/create-payment', async (req, res) => {
  const linkSlug = req.cookies?.link_slug || req.headers.cookie
    ?.split('; ')
    ?.find(row => row.startsWith('link_slug='))
    ?.split('=')[1] || null;

  const paymentIntent = await stripe.paymentIntents.create({
    // ... your config ...
    metadata: {
      ca_affiliate_id: linkSlug || '',
    },
  });
  
  res.json({ clientSecret: paymentIntent.client_secret });
});`}</code>
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-green-900/20 border border-green-700 rounded">
                <p className="text-xs text-green-300">
                  ✅ <strong>That&apos;s it!</strong> Just copy the code above, paste it into your checkout/payment code, and sales will be automatically tracked. The cookie is already set by the tracking script you added to your website.
                </p>
              </div>
            </div>
          </div>

          {/* Warning about Payment Links */}
          <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-200">
              ❌ <strong>Not Supported:</strong> Stripe Payment Links and dashboard-created payments are not supported. You must use Stripe Checkout Sessions or Payment Intents with metadata.
            </p>
          </div>

          {/* Confirmation Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <input
              type="checkbox"
              id="metadataConfirmed"
              checked={metadataConfirmed}
              onChange={(e) => setMetadataConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="metadataConfirmed" className="flex-1 text-sm text-white cursor-pointer">
              <span className="font-semibold">I confirm that my Stripe checkout passes the affiliate ID as metadata</span>
              <span className="block text-xs text-gray-400 mt-1">
                I understand that sales will not be tracked without this metadata, even if the webhook is configured.
              </span>
            </label>
          </div>
        </div>
      )}

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
          disabled={loading || success || (formData.stripeWebhookSecret.trim() !== '' && !metadataConfirmed)}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </button>
      </div>
      {formData.stripeWebhookSecret.trim() && !metadataConfirmed && (
        <div className="mt-2 p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-xs text-red-400">
            ⚠️ Please check the box above to confirm that your Stripe checkout passes affiliate metadata to complete setup.
          </p>
        </div>
      )}
      {formData.stripeWebhookSecret.trim() && metadataConfirmed && (
        <div className="mt-2 p-3 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-xs text-green-400">
            ✅ Confirmed! You can now complete setup.
          </p>
        </div>
      )}

      <div className="mt-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
        <h4 className="text-white font-semibold mb-2">What happens next?</h4>
        <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
          <li>Your tracking links will be ready to use</li>
          <li>Link clicks will be automatically tracked</li>
          <li>Sales from Stripe will be tracked and attributed to clippers <strong>only if</strong> your checkout passes <code className="bg-gray-800 px-1 rounded">ca_affiliate_id</code> metadata</li>
          <li>You&apos;ll have access to your dashboard with analytics</li>
        </ul>
        <div className="mt-3 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
          <p className="text-xs text-yellow-200">
            ⚠️ <strong>Remember:</strong> Sales tracking requires Stripe checkout metadata. Webhooks alone are not sufficient.
          </p>
        </div>
      </div>
    </form>
  )
}

