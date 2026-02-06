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
          clientId: selectedClientId || null, // Pass client ID for Stripe Connect
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setCheckoutUrl(data.url)
        // Open in new tab
        window.open(data.url, '_blank')
      } else {
        const data = await res.json()
        const errorMessage = data.error || 'Failed to create checkout session'
        const errorDetails = data.details ? `\n\n${data.details}` : ''
        setError(`${errorMessage}${errorDetails}`)
        
        // Show error in a more visible way
        console.error('Checkout creation error:', data)
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  const [diagnosticData, setDiagnosticData] = useState<any>(null)
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false)
  const [clipperCodeInput, setClipperCodeInput] = useState('mflp')
  
  // Script verification state
  const [verificationDomain, setVerificationDomain] = useState('freeclipping.com')
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [verifying, setVerifying] = useState(false)
  const [linkSlugInput, setLinkSlugInput] = useState('')
  const [clickData, setClickData] = useState<any>(null)
  const [loadingClicks, setLoadingClicks] = useState(false)
  const [salesTestResult, setSalesTestResult] = useState<any>(null)
  const [loadingSalesTest, setLoadingSalesTest] = useState(false)
  const [fixLinkSlug, setFixLinkSlug] = useState('yrcpz')
  const [fixingConversion, setFixingConversion] = useState(false)
  const [fixResult, setFixResult] = useState<string | null>(null)
  const [invoiceId, setInvoiceId] = useState('')
  const [checkoutSessionId, setCheckoutSessionId] = useState('cs_live_a1CZTiElE9LlGcPxl8Yf1JvurRDrQSsJvjKIMv4rdvIj0aXWlLRs0UmsRD')
  const [paymentIntentId, setPaymentIntentId] = useState('pi_3Sxpw1LDafoVnYnR2A04Kqb2')
  const [creatingConversion, setCreatingConversion] = useState(false)

  async function checkSale(clipperCode?: string) {
    const code = clipperCode || clipperCodeInput || 'mflp'
    setLoadingDiagnostic(true)
    setError('')
    try {
      const res = await fetch(`/api/admin/check-sale?clipperCode=${code}`)
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to check sale')
        return
      }
      const data = await res.json()
      setDiagnosticData(data)
    } catch (err) {
      setError('Failed to check sale. Make sure the API endpoint exists.')
    } finally {
      setLoadingDiagnostic(false)
    }
  }

  async function checkClicks() {
    if (!linkSlugInput.trim()) {
      setError('Please enter a link slug')
      return
    }
    
    setLoadingClicks(true)
    setClickData(null)
    setError('')
    
    try {
      const res = await fetch(`/api/admin/check-clicks?slug=${encodeURIComponent(linkSlugInput.trim())}`)
      if (!res.ok) {
        const errorData = await res.json()
        setError(errorData.error || 'Failed to check clicks')
        return
      }
      const data = await res.json()
      setClickData(data)
    } catch (err) {
      setError('Failed to check clicks. Make sure the API endpoint exists.')
    } finally {
      setLoadingClicks(false)
    }
  }

  async function verifyTrackingScript() {
    if (!verificationDomain.trim()) {
      setError('Please enter a domain')
      return
    }
    
    setVerifying(true)
    setVerificationResult(null)
    setError('')
    
    try {
      const res = await fetch(`/api/admin/verify-tracking-script?domain=${encodeURIComponent(verificationDomain)}`)
      const data = await res.json()
      setVerificationResult(data)
    } catch (err) {
      setError('Failed to verify script')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Script Verification Tool */}
      <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-lg border-2 border-purple-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔍</span>
          <h2 className="text-2xl font-bold text-white">Verify Tracking Script</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Check if the tracking script is present on a client&apos;s website.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Domain (e.g., freeclipping.com)</label>
            <input
              type="text"
              value={verificationDomain}
              onChange={(e) => setVerificationDomain(e.target.value)}
              placeholder="freeclipping.com"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  verifyTrackingScript()
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <button
            onClick={verifyTrackingScript}
            disabled={verifying}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {verifying ? 'Checking...' : 'Verify Script'}
          </button>
        </div>

        {verificationResult && (
          <div className="mt-6 space-y-3">
            <div className={`p-4 rounded-lg border-2 ${
              verificationResult.found
                ? 'bg-green-900/20 border-green-700'
                : 'bg-red-900/20 border-red-700'
            }`}>
              <h3 className={`text-lg font-semibold mb-2 ${
                verificationResult.found ? 'text-green-400' : 'text-red-400'
              }`}>
                {verificationResult.status}
              </h3>
              <p className="text-sm text-gray-300 mb-3">
                {verificationResult.message}
              </p>
              
              {verificationResult.details && (
                <div className="bg-gray-800/50 rounded p-3 space-y-1">
                  <p className="text-xs text-gray-400">Verification Details:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={verificationResult.details.hasComment ? 'text-green-400' : 'text-red-400'}>
                      {verificationResult.details.hasComment ? '✅' : '❌'} Comment found
                    </div>
                    <div className={verificationResult.details.hasCookieBased ? 'text-green-400' : 'text-red-400'}>
                      {verificationResult.details.hasCookieBased ? '✅' : '❌'} Cookie-based version
                    </div>
                    <div className={verificationResult.details.hasCookieSetting ? 'text-green-400' : 'text-red-400'}>
                      {verificationResult.details.hasCookieSetting ? '✅' : '❌'} Cookie setting code
                    </div>
                    <div className={verificationResult.details.hasExactPattern ? 'text-green-400' : 'text-red-400'}>
                      {verificationResult.details.hasExactPattern ? '✅' : '❌'} Exact pattern match
                    </div>
                  </div>
                </div>
              )}

              {verificationResult.scriptSnippet && (
                <div className="mt-3 bg-gray-900 rounded p-3">
                  <p className="text-xs text-gray-400 mb-2">Detected Script Snippet:</p>
                  <pre className="text-xs text-green-400 overflow-x-auto">
                    <code>{verificationResult.scriptSnippet}</code>
                  </pre>
                </div>
              )}

              {verificationResult.error && (
                <p className="text-xs text-red-400 mt-2">
                  Error: {verificationResult.error}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sales Tracking Test for freeclipping.com */}
      <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 rounded-lg border-2 border-blue-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🧪</span>
          <h2 className="text-2xl font-bold text-white">Sales Tracking Test</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Test if sales tracking would work for freeclipping.com. This checks all components needed for a sale to be tracked.
        </p>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <button
              onClick={async () => {
                setLoadingSalesTest(true)
                setError('')
                setSalesTestResult(null)
                
                try {
                  const res = await fetch(`/api/admin/test-sales-tracking?domain=${encodeURIComponent(verificationDomain)}`)
                  const data = await res.json()
                  setSalesTestResult(data)
                  
                  // Also run script verification
                  await verifyTrackingScript()
                } catch (err) {
                  setError('Failed to run sales tracking test')
                } finally {
                  setLoadingSalesTest(false)
                }
              }}
              disabled={loadingSalesTest || !verificationDomain.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {loadingSalesTest ? 'Testing...' : '🚀 Run Full Sales Test'}
            </button>
          </div>

          {salesTestResult && (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                salesTestResult.overall === 'passed' 
                  ? 'bg-green-900/20 border-green-700'
                  : salesTestResult.overall === 'partial'
                  ? 'bg-yellow-900/20 border-yellow-700'
                  : 'bg-red-900/20 border-red-700'
              }`}>
                <h3 className={`text-lg font-semibold mb-2 ${
                  salesTestResult.overall === 'passed' ? 'text-green-400' 
                  : salesTestResult.overall === 'partial' ? 'text-yellow-400'
                  : 'text-red-400'
                }`}>
                  {salesTestResult.overall === 'passed' ? '✅ All Tests Passed!' 
                   : salesTestResult.overall === 'partial' ? '⚠️ Partial - Some Issues'
                   : '❌ Tests Failed'}
                </h3>
                <p className="text-sm text-gray-300 mb-3">
                  {salesTestResult.summary.passedTests} of {salesTestResult.summary.totalTests} tests passed
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    {salesTestResult.tests.clientFound?.passed ? (
                      <span className="text-green-400">✅</span>
                    ) : (
                      <span className="text-red-400">❌</span>
                    )}
                    <span className="text-gray-300">
                      Client Found: {salesTestResult.tests.clientFound?.clientName || 'Not found'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {salesTestResult.tests.scriptInstalled?.passed ? (
                      <span className="text-green-400">✅</span>
                    ) : (
                      <span className="text-red-400">❌</span>
                    )}
                    <span className="text-gray-300">JavaScript Snippet Installed</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {salesTestResult.tests.stripeWebhook?.passed ? (
                      <span className="text-green-400">✅</span>
                    ) : (
                      <span className="text-red-400">❌</span>
                    )}
                    <span className="text-gray-300">Stripe Webhook Configured</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {salesTestResult.tests.clickTracking?.passed ? (
                      <span className="text-green-400">✅</span>
                    ) : (
                      <span className="text-yellow-400">⚠️</span>
                    )}
                    <span className="text-gray-300">
                      Click Tracking: {salesTestResult.tests.clickTracking?.recentClicksCount || 0} clicks (last 7 days)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {salesTestResult.tests.salesTracking?.passed ? (
                      <span className="text-green-400">✅</span>
                    ) : (
                      <span className="text-yellow-400">⚠️</span>
                    )}
                    <span className="text-gray-300">
                      Sales Tracking: {salesTestResult.tests.salesTracking?.recentConversionsCount || 0} conversions (last 30 days)
                    </span>
                  </div>
                </div>

                {salesTestResult.recommendations.length > 0 && (
                  <div className="mt-4 bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-yellow-400 mb-2">Recommendations:</h4>
                    <ul className="text-xs text-yellow-200 space-y-1 list-disc list-inside">
                      {salesTestResult.recommendations.map((rec: string, i: number) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {salesTestResult.tests.linksExist?.sampleLinks && salesTestResult.tests.linksExist.sampleLinks.length > 0 && (
                  <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                    <h4 className="text-sm font-semibold text-white mb-2">Sample Tracking Links:</h4>
                    <div className="space-y-1">
                      {salesTestResult.tests.linksExist.sampleLinks.slice(0, 3).map((link: any, i: number) => (
                        <code key={i} className="block text-xs text-green-400 bg-gray-900 px-2 py-1 rounded break-all">
                          {link.trackingUrl}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-white mb-3">Test Checklist:</h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                {verificationResult?.found ? (
                  <span className="text-green-400">✅</span>
                ) : (
                  <span className="text-gray-500">⏳</span>
                )}
                <span className="text-gray-300">JavaScript snippet installed</span>
              </div>
              
              <div className="flex items-center gap-2">
                {clickData?.clicks.total > 0 ? (
                  <span className="text-green-400">✅</span>
                ) : (
                  <span className="text-gray-500">⏳</span>
                )}
                <span className="text-gray-300">Click tracking working</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-gray-300">Stripe webhook configured (check manually)</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-yellow-400">⚠️</span>
                <span className="text-gray-300">Checkout passes ca_affiliate_id metadata (check manually)</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-yellow-400 mb-2">📋 Manual Test Steps:</h3>
            <ol className="text-xs text-yellow-200 space-y-2 list-decimal list-inside">
              <li>Visit: <code className="bg-gray-900 px-1 rounded">https://www.freeclipping.com/?ref=tcjsn</code></li>
              <li>Open DevTools → Application → Cookies</li>
              <li>Verify <code className="bg-gray-900 px-1 rounded">link_slug=tcjsn</code> cookie exists</li>
              <li>Go to checkout page</li>
              <li>Check if checkout code reads cookie and passes to Stripe metadata</li>
              <li>Complete a test purchase</li>
              <li>Check admin dashboard for conversion</li>
            </ol>
          </div>

          {verificationResult?.found && clickData && (
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-green-400 mb-2">✅ Test Results:</h3>
              <div className="text-xs text-green-200 space-y-1">
                <p>✅ Script is installed and working</p>
                <p>✅ Click tracking is active ({clickData.clicks.total} clicks recorded)</p>
                <p>⚠️ Next: Verify Stripe checkout passes metadata</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Check Click Tracking */}
      <div className="bg-gradient-to-r from-green-900/30 to-teal-900/30 rounded-lg border-2 border-green-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🖱️</span>
          <h2 className="text-2xl font-bold text-white">Check Click Tracking</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Verify if a tracking link is recording clicks. Enter the link slug below.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Link Slug</label>
            <input
              type="text"
              value={linkSlugInput}
              onChange={(e) => setLinkSlugInput(e.target.value)}
              placeholder="pynhl"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  checkClicks()
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-green-500 focus:outline-none"
            />
          </div>
          <button
            onClick={checkClicks}
            disabled={loadingClicks}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {loadingClicks ? 'Checking...' : 'Check Clicks'}
          </button>
        </div>

        {clickData && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Link Information</h3>
              <div className="space-y-1 text-xs text-gray-300">
                <p><span className="text-gray-400">Slug:</span> <code className="text-green-400">{clickData.link.slug}</code></p>
                <p><span className="text-gray-400">Client:</span> {clickData.link.client}</p>
                <p><span className="text-gray-400">Clipper:</span> {clickData.link.clipper}</p>
                <p><span className="text-gray-400">Campaign:</span> {clickData.link.campaign}</p>
                <p><span className="text-gray-400">Destination:</span> <a href={clickData.link.destinationUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{clickData.link.destinationUrl}</a></p>
              </div>
            </div>

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Click Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Total Clicks</p>
                  <p className="text-2xl font-bold text-white">{clickData.clicks.total}</p>
                </div>
                <div>
                  <p className="text-gray-400">Last 24 Hours</p>
                  <p className="text-2xl font-bold text-white">{clickData.clicks.last24h}</p>
                </div>
              </div>
              <div className={`mt-3 p-3 rounded-lg ${
                clickData.diagnosis.hasClicks 
                  ? 'bg-green-900/20 border border-green-700' 
                  : 'bg-yellow-900/20 border border-yellow-700'
              }`}>
                <p className={`text-sm ${clickData.diagnosis.hasClicks ? 'text-green-300' : 'text-yellow-300'}`}>
                  {clickData.diagnosis.message}
                </p>
              </div>
            </div>

            {clickData.clicks.recent.length > 0 && (
              <div className="bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Recent Clicks (Last 10)</h3>
                <div className="space-y-2">
                  {clickData.clicks.recent.map((click: any, i: number) => (
                    <div key={i} className="text-xs text-gray-300 bg-gray-800/50 p-2 rounded">
                      <div className="flex items-center justify-between">
                        <span>{new Date(click.timestamp).toLocaleString()}</span>
                        <span className="text-gray-500">{click.country} {click.city ? `- ${click.city}` : ''}</span>
                      </div>
                      {click.referer && click.referer !== 'Direct' && (
                        <p className="text-gray-500 text-xs mt-1">From: {click.referer}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">📎 Actual Tracking Link</h3>
              <div className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                  <p className="text-xs text-yellow-300 mb-2 font-semibold">🎯 This is the link clippers use:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-yellow-400 bg-gray-900 p-2 rounded break-all font-mono">
                      {clickData.actualTrackingUrl || clickData.trackingUrl}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(clickData.actualTrackingUrl || clickData.trackingUrl)
                        alert('Link copied!')
                      }}
                      className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm font-medium whitespace-nowrap"
                    >
                      📋 Copy
                    </button>
                  </div>
                  <p className="text-xs text-yellow-200 mt-2">
                    💡 This is the exact link format that should be shared. When someone visits this URL, clicks will be tracked.
                  </p>
                </div>
                {clickData.alternativeUrls && clickData.alternativeUrls.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Other formats (for reference):</p>
                    {clickData.alternativeUrls.map((url: string, i: number) => (
                      <code key={i} className="block bg-gray-800 p-2 rounded text-blue-400 break-all mb-1 text-xs">{url}</code>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Sale Check - ALWAYS VISIBLE */}
      <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border-2 border-blue-700 p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">🔍</span>
          <h2 className="text-2xl font-bold text-white">Quick Sale Check</h2>
        </div>
        <p className="text-sm text-gray-300 mb-4">
          Check if a sale was tracked for a specific clipper. Enter the clipper dashboard code below.
        </p>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-400 mb-2">Clipper Dashboard Code</label>
            <input
              type="text"
              value={clipperCodeInput}
              onChange={(e) => setClipperCodeInput(e.target.value)}
              placeholder="mflp"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  checkSale()
                }
              }}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            onClick={() => checkSale()}
            disabled={loadingDiagnostic}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {loadingDiagnostic ? 'Checking...' : 'Check Sale'}
          </button>
        </div>

        {diagnosticData && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Clipper: {diagnosticData.clipper.name} ({diagnosticData.clipper.dashboardCode})</h3>
              <p className="text-xs text-gray-400">Total Links: {diagnosticData.clipper.totalLinks}</p>
              {diagnosticData.link && (
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-400">
                    Primary Link: <code className="text-blue-400">{diagnosticData.link.slug}</code>
                  </p>
                  <p className="text-xs text-gray-400">
                    Client: {diagnosticData.link.client} | Clicks: {diagnosticData.link.clicks}
                  </p>
                </div>
              )}
            </div>

            {diagnosticData.conversions.recent.length > 0 ? (
              <div className="space-y-3">
                {/* Conversions linked to clipper's links */}
                {diagnosticData.conversions.forClipperLinks > 0 && (
                  <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-green-400 mb-2">
                      ✅ {diagnosticData.conversions.forClipperLinks} sale(s) tracked to this clipper&apos;s links
                    </h3>
                    {diagnosticData.conversions.recent
                      .filter((conv: any) => conv.hasLink && !conv.isOrphan)
                      .map((conv: any, i: number) => (
                        <div key={i} className="text-sm text-gray-300 mt-2 p-2 bg-gray-800/50 rounded">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              ${conv.amount} {conv.currency.toUpperCase()}
                            </span>
                            <span className="text-green-400">
                              ✅ Link: {conv.linkSlug}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(conv.paidAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                  </div>
                )}

                {/* All conversions for client (including orphans) */}
                {diagnosticData.conversions.totalForClient > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">
                      📊 {diagnosticData.conversions.totalForClient} total sale(s) for client &quot;{diagnosticData.diagnosis?.clientName || 'N/A'}&quot; (last 30 days)
                    </h3>
                    {diagnosticData.conversions.recent.map((conv: any, i: number) => (
                      <div key={i} className="text-sm text-gray-300 mt-2 p-2 bg-gray-800/50 rounded">
                        <div className="flex items-center justify-between">
                          <span>
                            ${conv.amount} {conv.currency.toUpperCase()}
                          </span>
                          <span className={conv.hasLink ? 'text-green-400' : 'text-yellow-400'}>
                            {conv.hasLink ? `✅ Link: ${conv.linkSlug}` : '⚠️ Orphan (no link)'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(conv.paidAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-400 mb-2">
                  ⚠️ No conversions found in last 30 days
                </p>
                <p className="text-xs text-yellow-300">
                  If you made a purchase, check:
                </p>
                <ul className="text-xs text-yellow-300 list-disc list-inside mt-1 space-y-1">
                  <li>Webhook events below (should show invoice.paid)</li>
                  <li>Stripe Dashboard → Webhooks (verify endpoint is configured)</li>
                  <li>Client: {diagnosticData.diagnosis?.clientName || 'N/A'}</li>
                </ul>
              </div>
            )}

            {diagnosticData.webhooks.total === 0 ? (
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <p className="text-sm text-red-400 mb-2">
                  ❌ No webhook events received in last 30 days!
                </p>
                <p className="text-xs text-red-300">
                  This means Stripe isn&apos;t sending webhooks. Check Stripe Dashboard → Webhooks and verify the endpoint is configured.
                </p>
              </div>
            ) : (
              <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-400 mb-2">
                  📡 {diagnosticData.webhooks.total} webhook event(s) received
                </h3>
                {diagnosticData.webhooks.events.slice(0, 5).map((event: any, i: number) => (
                  <div key={i} className="text-xs text-gray-300 mt-1">
                    <code className="text-blue-400">{event.type}</code> - {new Date(event.created).toLocaleString()}
                  </div>
                ))}
                {diagnosticData.conversions.totalForClient === 0 && diagnosticData.webhooks.total > 0 && (
                  <p className="text-xs text-yellow-400 mt-2">
                    ⚠️ Webhooks received but no conversions created. Check webhook processing logs.
                  </p>
                )}
              </div>
            )}

            {diagnosticData.conversions.orphan > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-yellow-400 mb-2">
                  ⚠️ {diagnosticData.conversions.orphan} conversion(s) without link attribution
                </p>
                <button
                  onClick={async () => {
                    const res = await fetch('/api/admin/auto-fix-orphans', { method: 'POST' })
                    const data = await res.json()
                    if (data.success) {
                      alert(`Fixed ${data.fixed} conversion(s)!`)
                      checkSale('mflp')
                    }
                  }}
                  className="text-xs px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                >
                  🔧 Auto-Fix Now
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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

      {/* Fix Conversion Section */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">🔧 Fix Conversion Attribution</h2>
        <p className="text-gray-400 mb-4">
          If a sale went through but isn&apos;t showing in the dashboard, use this tool to manually link it to the correct affiliate link.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link Slug (e.g., yrcpz)
            </label>
            <input
              type="text"
              value={fixLinkSlug}
              onChange={(e) => setFixLinkSlug(e.target.value)}
              placeholder="yrcpz"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div className="flex gap-4">
            <button
              onClick={async () => {
                setFixingConversion(true)
                setFixResult(null)
                setError('')
                
                try {
                  // First, check for orphan conversions
                  const checkRes = await fetch('/api/admin/fix-conversion')
                  const checkData = await checkRes.json()
                  
                  if (checkData.orphans && checkData.orphans.length > 0) {
                    // Try to fix each orphan that matches the link slug
                    let fixed = 0
                    for (const orphan of checkData.orphans) {
                      if (orphan.affiliateCode === fixLinkSlug || !orphan.affiliateCode) {
                        const fixRes = await fetch('/api/admin/fix-conversion', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            invoiceId: orphan.invoiceId,
                            linkSlug: fixLinkSlug,
                          }),
                        })
                        
                        if (fixRes.ok) {
                          fixed++
                        }
                      }
                    }
                    
                    if (fixed > 0) {
                      setFixResult(`✅ Fixed ${fixed} conversion(s)! Refresh the dashboard to see the revenue.`)
                    } else {
                      setFixResult(`⚠️ Found ${checkData.orphans.length} orphan conversion(s), but none matched link slug "${fixLinkSlug}".`)
                    }
                  } else {
                    setFixResult('✅ No orphan conversions found. All conversions are properly linked.')
                  }
                } catch (err) {
                  setError('Failed to fix conversions')
                  setFixResult('❌ Error: ' + (err as Error).message)
                } finally {
                  setFixingConversion(false)
                }
              }}
              disabled={fixingConversion || !fixLinkSlug.trim()}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {fixingConversion ? 'Fixing...' : '🔧 Fix Orphan Conversions'}
            </button>
            
            <button
              onClick={async () => {
                setFixingConversion(true)
                setFixResult(null)
                setError('')
                
                try {
                  const res = await fetch(`/api/admin/fix-conversion?linkSlug=${encodeURIComponent(fixLinkSlug)}`)
                  const data = await res.json()
                  
                  if (data.link) {
                    const conversions = data.link.conversions || []
                    const totalRevenue = conversions.reduce((sum: number, c: any) => sum + c.amountPaid, 0) / 100
                    setFixResult(`✅ Link "${fixLinkSlug}" has ${conversions.length} conversion(s) totaling $${totalRevenue.toFixed(2)}`)
                  } else {
                    setFixResult(`❌ Link "${fixLinkSlug}" not found`)
                  }
                } catch (err) {
                  setError('Failed to check conversions')
                  setFixResult('❌ Error: ' + (err as Error).message)
                } finally {
                  setFixingConversion(false)
                }
              }}
              disabled={fixingConversion || !fixLinkSlug.trim()}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
            >
              {fixingConversion ? 'Checking...' : '📊 Check Link Conversions'}
            </button>
          </div>
          
          {fixResult && (
            <div className={`p-4 rounded-lg ${fixResult.includes('✅') ? 'bg-green-900/30 text-green-300' : fixResult.includes('❌') ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
              {fixResult}
            </div>
          )}
        </div>
      </div>

      {/* Manual Conversion Creation */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-4">➕ Manually Create Conversion</h2>
        <p className="text-gray-400 mb-4">
          If a sale happened but wasn&apos;t recorded, manually create it from Stripe invoice or checkout session ID.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Link Slug (e.g., yrcpz)
            </label>
            <input
              type="text"
              value={fixLinkSlug}
              onChange={(e) => setFixLinkSlug(e.target.value)}
              placeholder="yrcpz"
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stripe Invoice ID (optional, e.g., in_1Sxpw1...)
            </label>
            <input
              type="text"
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="in_1Sxpw1..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stripe Checkout Session ID (optional, e.g., cs_live_a1CZTi...)
            </label>
            <input
              type="text"
              value={checkoutSessionId}
              onChange={(e) => setCheckoutSessionId(e.target.value)}
              placeholder="cs_live_a1CZTi..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stripe Payment Intent ID (optional, e.g., pi_3Sxpw1...)
            </label>
            <input
              type="text"
              value={paymentIntentId}
              onChange={(e) => setPaymentIntentId(e.target.value)}
              placeholder="pi_3Sxpw1..."
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          <button
            onClick={async () => {
              if (!fixLinkSlug.trim() || (!invoiceId.trim() && !checkoutSessionId.trim() && !paymentIntentId.trim())) {
                setFixResult('❌ Please provide link slug and at least one: invoice ID, checkout session ID, or payment intent ID')
                return
              }
              
              setCreatingConversion(true)
              setFixResult(null)
              setError('')
              
              try {
                const res = await fetch('/api/admin/create-conversion', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    linkSlug: fixLinkSlug.trim(),
                    invoiceId: invoiceId.trim() || undefined,
                    checkoutSessionId: checkoutSessionId.trim() || undefined,
                    paymentIntentId: paymentIntentId.trim() || undefined,
                  }),
                })
                
                const data = await res.json()
                
                if (res.ok) {
                  setFixResult(`✅ ${data.message}\nAmount: $${(data.conversion.amountPaid / 100).toFixed(2)} ${data.conversion.currency.toUpperCase()}\nPaid: ${new Date(data.conversion.paidAt).toLocaleString()}`)
                  setInvoiceId('')
                  setCheckoutSessionId('')
                } else {
                  setFixResult(`❌ ${data.error}`)
                }
              } catch (err) {
                setError('Failed to create conversion')
                setFixResult('❌ Error: ' + (err as Error).message)
              } finally {
                setCreatingConversion(false)
              }
            }}
            disabled={creatingConversion || !fixLinkSlug.trim() || (!invoiceId.trim() && !checkoutSessionId.trim())}
            className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {creatingConversion ? 'Creating...' : '➕ Create Conversion'}
          </button>
          
          {fixResult && (
            <div className={`p-4 rounded-lg whitespace-pre-line ${fixResult.includes('✅') ? 'bg-green-900/30 text-green-300' : fixResult.includes('❌') ? 'bg-red-900/30 text-red-300' : 'bg-yellow-900/30 text-yellow-300'}`}>
              {fixResult}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

