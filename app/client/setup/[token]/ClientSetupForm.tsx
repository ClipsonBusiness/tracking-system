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
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [jsCopied, setJsCopied] = useState(false)
  const [metadataConfirmed, setMetadataConfirmed] = useState(false)
  const [activeTab, setActiveTab] = useState<'checkout' | 'paymentintent'>('checkout')
  
  // Get tracking server URL - use appBaseUrl from server for consistency
  // Ensure we use www. subdomain to avoid redirects
  let trackingServerUrl = appBaseUrl || (typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://www.clipsonaffiliates.com')
  
  // Normalize to www. subdomain to avoid redirects
  if (trackingServerUrl.includes('clipsonaffiliates.com') && !trackingServerUrl.includes('www.')) {
    trackingServerUrl = trackingServerUrl.replace('clipsonaffiliates.com', 'www.clipsonaffiliates.com')
  }
  
  // Generate JavaScript code - sets ca_affiliate_id cookie
  const generateJsCode = (domain: string) => {
    if (!domain || !domain.trim()) return ''
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '').replace(/^\/+/, '')
    return `<!-- Clipson Affiliate Tracking -->
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
  document.cookie = 'ca_affiliate_id=' + encodeURIComponent(refParam) + 
    '; expires=' + expiryDate.toUTCString() + 
    '; path=/' + 
    '; SameSite=Lax' + 
    (location.protocol === 'https:' ? '; Secure' : '');

  // Record click on tracking server (non-blocking)
  const beaconUrl = '${trackingServerUrl}/track?ref=' + encodeURIComponent(refParam) + '&beacon=true';
  
  // Try sendBeacon first (most reliable)
  if (navigator.sendBeacon) {
    try {
      const sent = navigator.sendBeacon(beaconUrl);
      if (!sent) {
        console.warn('[Clipson] sendBeacon failed, trying fetch fallback');
        fetch(beaconUrl, { method: 'GET', keepalive: true }).catch(err => {
          console.error('[Clipson] Beacon fetch failed:', err);
        });
      }
    } catch(e) {
      console.error('[Clipson] sendBeacon error:', e);
      // Fallback to fetch
      fetch(beaconUrl, { method: 'GET', keepalive: true }).catch(err => {
        console.error('[Clipson] Beacon fetch fallback failed:', err);
      });
    }
  } else {
    // Fallback if sendBeacon not supported
    fetch(beaconUrl, { method: 'GET', keepalive: true }).catch(err => {
      console.error('[Clipson] Beacon fetch failed:', err);
    });
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
          stripeAccountId: existingStripeAccountId || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
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

  const testUrl = formData.customDomain 
    ? `https://${formData.customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/?ref=test_aff`
    : 'https://yourdomain.com/?ref=test_aff'

  return (
    <div className="space-y-8">
      {/* SECTION 1: Overview */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">📋 Setup Overview</h2>
        <div className="space-y-3 text-gray-300">
          <p>
            A campaign has already been created on our platform for <strong className="text-white">{campaign?.name || 'your campaign'}</strong>.
          </p>
          <p>
            Before affiliates can receive links and start promoting your offer, you need to complete two required setup steps:
          </p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li><strong className="text-white">Install click tracking</strong> — This captures which affiliate sent each visitor</li>
            <li><strong className="text-white">Connect Stripe for sales attribution</strong> — This tracks which affiliate generated each sale</li>
          </ol>
          <p className="text-sm text-gray-400 mt-4">
            Once both steps are complete, affiliates will be able to receive their unique tracking links and start promoting your offer.
          </p>
        </div>
      </div>

      {/* SECTION 2: Affiliate Link Format (Informational) */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-3">🔗 How Affiliate Links Work</h2>
        <div className="space-y-3 text-gray-300">
          <p>
            Each affiliate will receive a unique tracking link that looks like this:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
            <code className="text-green-400 text-sm break-all">
              {formData.customDomain 
                ? `https://${formData.customDomain.replace(/^https?:\/\//, '').replace(/\/+$/, '')}/?ref=AFFILIATE_ID`
                : 'https://yourdomain.com/?ref=AFFILIATE_ID'}
            </code>
          </div>
          <div className="space-y-2 text-sm">
            <p>• Each affiliate gets a unique <code className="bg-gray-900 px-1 rounded">ref</code> value (like <code className="bg-gray-900 px-1 rounded">abc123</code>)</p>
            <p>• This <code className="bg-gray-900 px-1 rounded">ref</code> value identifies which affiliate sent the visitor</p>
            <p>• The <code className="bg-gray-900 px-1 rounded">ref</code> value must be preserved until checkout so sales can be attributed correctly</p>
          </div>
          <p className="text-xs text-gray-400 mt-4 italic">
            No action required in this section — this is just informational.
          </p>
        </div>
      </div>

      {/* SECTION 3: Install Click Tracking Script (REQUIRED) */}
      <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 rounded-lg border-2 border-yellow-700 p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">📝</span>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-yellow-300 mb-2">
              Step 1: Install Click Tracking Script (REQUIRED)
            </h2>
            <p className="text-sm text-yellow-200 mb-2">
              This script captures the <code className="bg-yellow-900/50 px-1 rounded">?ref=</code> parameter from incoming affiliate links and stores the affiliate ID in a cookie on your domain.
            </p>
            <p className="text-xs text-yellow-200/80">
              The cookie is named <code className="bg-yellow-900/50 px-1 rounded">ca_affiliate_id</code> and lasts for 90 days. This cookie will be available when users reach your Stripe checkout.
            </p>
          </div>
        </div>

        {/* Domain Input */}
        <div className="mb-4">
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
            Your Website Domain <span className="text-red-400">*</span>
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
          <div className="bg-gray-900 rounded-lg p-4 mb-4 border-2 border-yellow-600">
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
          </div>
        ) : (
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              👆 <strong>Enter your domain above</strong> to generate the JavaScript tracking code
            </p>
          </div>
        )}

        {/* Platform-Specific Instructions */}
        {formData.customDomain && formData.customDomain.trim() && (
          <div className="mt-4 space-y-3">
            <p className="font-semibold text-white mb-2">📚 Platform-Specific Installation Instructions:</p>
            
            {/* WordPress */}
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <p className="font-semibold mb-1 text-yellow-200">📝 WordPress:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-300">
                <li>Install <strong>WPCode</strong> plugin (free) or use <strong>Insert Headers and Footers</strong></li>
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">WPCode → Code Snippets → Add New</code></li>
                <li>Paste the code above</li>
                <li>Set location to <code className="bg-yellow-900/50 px-1 rounded">Site Wide Header</code></li>
                <li>Click <strong>Save Snippet</strong> and <strong>Activate</strong></li>
              </ol>
            </div>

            {/* Webflow */}
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <p className="font-semibold mb-1 text-yellow-200">🔷 Webflow:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-300">
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">Project Settings → Custom Code</code></li>
                <li>Paste the code in the <strong>Head Code</strong> section</li>
                <li>Click <strong>Save</strong> and publish your site</li>
              </ol>
            </div>

            {/* Shopify */}
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <p className="font-semibold mb-1 text-yellow-200">🛒 Shopify:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-300">
                <li>Go to <code className="bg-yellow-900/50 px-1 rounded">Online Store → Themes → Actions → Edit Code</code></li>
                <li>Open <code className="bg-yellow-900/50 px-1 rounded">theme.liquid</code></li>
                <li>Paste code before <code className="bg-yellow-900/50 px-1 rounded">&lt;/head&gt;</code></li>
                <li>Click <strong>Save</strong></li>
              </ol>
            </div>

            {/* Custom HTML */}
            <div className="bg-yellow-900/30 rounded-lg p-3">
              <p className="font-semibold mb-1 text-yellow-200">⚙️ Custom HTML/Other:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-300">
                <li>Copy the code above</li>
                <li>Open your website&apos;s HTML file</li>
                <li>Paste it in the <code className="bg-yellow-900/50 px-1 rounded">&lt;head&gt;</code> section or before <code className="bg-yellow-900/50 px-1 rounded">&lt;/body&gt;</code></li>
                <li>Save and publish</li>
              </ol>
            </div>

            {/* Test Instructions */}
            <div className="mt-4 p-3 bg-green-900/30 rounded border border-green-700">
              <p className="font-semibold text-green-300 mb-2">✅ Test Your Installation:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2 text-sm text-gray-300">
                <li>Visit: <code className="bg-green-900/50 px-1 rounded text-green-400 break-all">{testUrl}</code></li>
                <li>Open DevTools (F12) → Application → Cookies</li>
                <li>Confirm cookie <code className="bg-green-900/50 px-1 rounded">ca_affiliate_id=test_aff</code> exists</li>
                <li>If the cookie appears, installation is successful! ✅</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 4: Stripe Sales Tracking (REQUIRED) */}
      <div className="bg-red-900/20 border-2 border-red-700 rounded-lg p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-3xl">🔴</span>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-red-300 mb-2">
              Step 2: Stripe Sales Tracking (REQUIRED)
            </h2>
            <p className="text-sm text-red-200 mb-2">
              <strong>Important:</strong> Click tracking alone does NOT track sales. Stripe must be told which affiliate generated each purchase.
            </p>
            <p className="text-xs text-red-200/80">
              Because Stripe requires this to happen inside your backend checkout code, this step must be completed by your developer.
            </p>
          </div>
        </div>

        {/* SECTION 4A: Pass Affiliate ID Into Stripe Checkout */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">4A. Pass Affiliate ID Into Stripe Checkout (REQUIRED)</h3>
          
          {/* Payment Links Warning */}
          <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <p className="text-sm font-semibold text-red-300 mb-1">❗ Important:</p>
            <p className="text-xs text-red-200">
              <strong>Stripe Payment Links are not supported for affiliate sales tracking.</strong> You must use Stripe Checkout Sessions so affiliate metadata can be attached.
            </p>
          </div>
          
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
              This metadata must be attached when creating a Stripe Checkout Session. The value should come from the <code className="bg-gray-800 px-1 rounded">ca_affiliate_id</code> cookie.
            </p>
          </div>

          {/* Code Examples */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-white mb-3">Code Example (Server-Side - Stripe Checkout Sessions):</p>
            
            {/* Warning */}
            <div className="mb-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
              <p className="text-xs text-yellow-200">
                ⚠️ <strong>Important:</strong> Stripe Checkout Sessions must be created on your backend (server). Do not use <code className="bg-yellow-900/50 px-1 rounded">document.cookie</code> in Stripe checkout code.
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <button
                type="button"
                onClick={() => {
                  const code = `// Server-side helper to read affiliate cookie
function getAffiliateId(req) {
  const cookie = req.headers.cookie
    ?.split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

// Inside your backend checkout endpoint
const affiliateId = getAffiliateId(req);

const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config (line_items, mode, success_url, etc.) ...
  metadata: {
    ca_affiliate_id: affiliateId || '',
  },
  subscription_data: {
    metadata: {
      ca_affiliate_id: affiliateId || '',
    },
  },
});`
                  navigator.clipboard.writeText(code)
                  alert('✅ Code copied to clipboard!')
                }}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-colors mb-3"
              >
                📋 Copy Code
              </button>
              <pre className="text-xs text-green-400 overflow-x-auto whitespace-pre-wrap">
                <code>{`// Server-side helper to read affiliate cookie
function getAffiliateId(req) {
  const cookie = req.headers.cookie
    ?.split('; ')
    .find(row => row.startsWith('ca_affiliate_id='));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : '';
}

// Inside your backend checkout endpoint
const affiliateId = getAffiliateId(req);

const session = await stripe.checkout.sessions.create({
  // ... your existing checkout config (line_items, mode, success_url, etc.) ...
  metadata: {
    ca_affiliate_id: affiliateId || '',
  },
  subscription_data: {
    metadata: {
      ca_affiliate_id: affiliateId || '',
    },
  },
});`}</code>
              </pre>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded p-3">
            <p className="text-xs text-yellow-200">
              <strong>Note:</strong> This is required for both one-time payments and subscriptions. For subscriptions, also attach the metadata to <code className="bg-yellow-900/50 px-1 rounded">subscription_data.metadata</code> as shown above.
            </p>
          </div>
        </div>

        {/* SECTION 4B: Connect Stripe Webhook */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-3">4B. Connect Stripe Webhook (REQUIRED)</h3>
          
          <p className="text-sm text-gray-300 mb-4">
            Our platform needs Stripe webhooks to receive completed purchases. Webhooks are mandatory for reliable sales attribution.
          </p>

          <div className="mb-4">
            <p className="text-sm font-semibold text-white mb-2">Webhook Endpoint URL:</p>
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <code className="text-green-400 text-sm break-all">
                {appBaseUrl}/api/stripe/webhook
              </code>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-white mb-2">Required Stripe Events:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-sm text-gray-300">
              <li><code className="bg-gray-800 px-1 rounded">checkout.session.completed</code> — Required for all payments</li>
              <li><code className="bg-gray-800 px-1 rounded">invoice.paid</code> — Required if you have subscriptions</li>
            </ul>
          </div>

          <div className="mb-4 bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <p className="text-sm font-semibold text-white mb-2">Step-by-Step Stripe Dashboard Instructions:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2 text-sm text-gray-300">
              <li>Go to your <strong>Stripe Dashboard</strong></li>
              <li>Navigate to <strong>Developers → Webhooks</strong></li>
              <li>Click <strong>&quot;Add endpoint&quot;</strong></li>
              <li>Paste the endpoint URL: <code className="bg-gray-900 px-1 rounded">{appBaseUrl}/api/stripe/webhook</code></li>
              <li>Select events: <code className="bg-gray-900 px-1 rounded">checkout.session.completed</code> and <code className="bg-gray-900 px-1 rounded">invoice.paid</code> (if applicable)</li>
              <li>Click <strong>&quot;Add endpoint&quot;</strong></li>
              <li>Copy the <strong>&quot;Signing secret&quot;</strong> (starts with <code className="bg-gray-900 px-1 rounded">whsec_</code>)</li>
              <li>Paste it in the field below</li>
            </ol>
          </div>

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
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Paste the signing secret from your Stripe webhook endpoint.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 5: Setup Completion & Verification */}
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-green-300 mb-4">✅ Setup Completion & Verification</h2>
        
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-2">
            <span className={formData.customDomain ? 'text-green-400' : 'text-gray-500'}>
              {formData.customDomain ? '✅' : '⏳'}
            </span>
            <div>
              <p className="font-semibold text-white">Click tracking installed</p>
              <p className="text-xs text-gray-400">
                {formData.customDomain 
                  ? `Domain configured: ${formData.customDomain}`
                  : 'Enter your domain and install the script'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-gray-500">⏳</span>
            <div>
              <p className="font-semibold text-white">Test click detected</p>
              <p className="text-xs text-gray-400">
                Visit {testUrl} and verify the cookie is set
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-gray-500">⏳</span>
            <div>
              <p className="font-semibold text-white">Cookie detected</p>
              <p className="text-xs text-gray-400">
                Verify <code className="bg-gray-800 px-1 rounded">ca_affiliate_id</code> cookie exists in browser DevTools
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className={formData.stripeWebhookSecret ? 'text-green-400' : 'text-gray-500'}>
              {formData.stripeWebhookSecret ? '✅' : '⏳'}
            </span>
            <div>
              <p className="font-semibold text-white">Stripe webhook connected</p>
              <p className="text-xs text-gray-400">
                {formData.stripeWebhookSecret 
                  ? 'Webhook secret configured'
                  : 'Add your Stripe webhook secret above'}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <span className="text-gray-500">⏳</span>
            <div>
              <p className="font-semibold text-white">Test sale successfully attributed</p>
              <p className="text-xs text-gray-400">
                Make a test purchase and verify it appears in your dashboard
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700 rounded">
          <p className="text-xs text-yellow-200">
            <strong>Note:</strong> Once all required steps are complete, your campaign will be marked as &quot;Ready&quot; and affiliates will be able to receive their tracking links.
          </p>
        </div>
      </div>

      {/* Metadata Confirmation Checkbox */}
      {formData.stripeWebhookSecret.trim() && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={metadataConfirmed}
              onChange={(e) => setMetadataConfirmed(e.target.checked)}
              className="mt-1 w-5 h-5 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
            />
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">
                I confirm that my Stripe checkout passes the affiliate ID as metadata
              </p>
              <p className="text-xs text-gray-400 mt-1">
                My developer has added the server-side code from Section 4A to read the <code className="bg-gray-800 px-1 rounded">ca_affiliate_id</code> cookie and pass it to Stripe checkout metadata.
              </p>
            </div>
          </label>
          {metadataConfirmed ? (
            <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded">
              <p className="text-xs text-green-300">✅ Confirmed! You can now complete setup.</p>
            </div>
          ) : (
            <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded">
              <p className="text-xs text-red-300">⚠️ Please confirm before completing setup.</p>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-400">
            ✅ Setup complete! Redirecting to your dashboard...
          </p>
        </div>
      )}

      {/* Submit Button */}
      <form onSubmit={handleSubmit}>
        <button
          type="submit"
          disabled={loading || !formData.customDomain.trim() || !formData.stripeWebhookSecret.trim() || (formData.stripeWebhookSecret.trim() !== '' && !metadataConfirmed)}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
        >
          {loading ? 'Saving...' : 'Complete Setup'}
        </button>
        {(!formData.customDomain.trim() || !formData.stripeWebhookSecret.trim() || (formData.stripeWebhookSecret.trim() && !metadataConfirmed)) && (
          <p className="text-xs text-gray-400 mt-2 text-center">
            Please complete all required steps before submitting
          </p>
        )}
      </form>
    </div>
  )
}
