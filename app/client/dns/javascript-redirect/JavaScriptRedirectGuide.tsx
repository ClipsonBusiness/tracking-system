'use client'

import { useState } from 'react'

interface JavaScriptRedirectGuideProps {
  customDomain: string
  trackingServerUrl: string
}

export default function JavaScriptRedirectGuide({
  customDomain,
  trackingServerUrl,
}: JavaScriptRedirectGuideProps) {
  const [copied, setCopied] = useState(false)

  // Generate the JavaScript code
  // COOKIE-BASED VERSION: Sets cookie on client domain (Stripe-compatible)
  const jsCode = `<!-- Clipson Affiliate Tracking (Cookie-Based - Stripe Compatible) -->
<script>
(function() {
  // Only run on the client's domain
  const hostname = window.location.hostname;
  const domainMatch = hostname === '${customDomain}' || hostname === 'www.${customDomain}';
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

  const handleCopy = () => {
    navigator.clipboard.writeText(jsCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* How It Works */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">✨ How It Works</h2>
        <ol className="space-y-3 text-sm text-gray-300">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <p className="font-medium text-white">Add the script to your website</p>
              <p className="text-gray-400 mt-1">Copy the code below and paste it into your website&apos;s HTML</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <p className="font-medium text-white">Script detects tracking links</p>
              <p className="text-gray-400 mt-1">When someone visits <code className="bg-gray-800 px-1 rounded">{customDomain}/?ref=xxxxx</code>, the script sets a cookie on your domain (users stay on your site)</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <p className="font-medium text-white">Cookie available for Stripe checkout</p>
              <p className="text-gray-400 mt-1">The cookie persists on your domain, so Stripe checkout can read it for sales attribution. No redirects - users stay on your site!</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Code Block */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">📋 JavaScript Code</h2>
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            {copied ? '✅ Copied!' : '📋 Copy Code'}
          </button>
        </div>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
            <code>{jsCode}</code>
          </pre>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          💡 <strong>Tip:</strong> Add this script to your website&apos;s <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code> section or before the closing <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code> tag
        </p>
      </div>

      {/* Installation Instructions */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📝 Installation Instructions</h2>
        <div className="space-y-4 text-sm text-gray-300">
          <div>
            <p className="font-medium text-white mb-2">For WordPress:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-400">
              <li>Go to Appearance → Theme Editor</li>
              <li>Select your theme&apos;s <code className="bg-gray-800 px-1 rounded">header.php</code> or <code className="bg-gray-800 px-1 rounded">footer.php</code></li>
              <li>Paste the code before <code className="bg-gray-800 px-1 rounded">&lt;/head&gt;</code> or <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code></li>
              <li>Save and test!</li>
            </ol>
          </div>
          <div>
            <p className="font-medium text-white mb-2">For Squarespace:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-400">
              <li>Go to Settings → Advanced → Code Injection</li>
              <li>Paste the code in the &quot;Header&quot; or &quot;Footer&quot; section</li>
              <li>Save and test!</li>
            </ol>
          </div>
          <div>
            <p className="font-medium text-white mb-2">For Custom HTML:</p>
            <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-400">
              <li>Open your website&apos;s HTML file</li>
              <li>Find the <code className="bg-gray-800 px-1 rounded">&lt;head&gt;</code> or <code className="bg-gray-800 px-1 rounded">&lt;/body&gt;</code> tag</li>
              <li>Paste the code before the closing tag</li>
              <li>Save and upload!</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Testing */}
      <div className="bg-green-900/20 border border-green-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">✅ Testing</h2>
        <div className="space-y-2 text-sm text-gray-300">
          <p>After adding the script, test it by visiting:</p>
          <code className="block bg-gray-900 px-4 py-2 rounded text-green-400">
            https://{customDomain}/?ref=test123
          </code>
          <p className="text-gray-400 mt-2">
            The cookie should be set (check browser DevTools → Application → Cookies). Users stay on your site - no redirect!
          </p>
          <p className="text-green-300 mt-2 text-xs">
            ✅ <strong>Stripe-Compatible:</strong> The cookie is set on your domain, so it&apos;s available when users reach Stripe checkout. Make sure to read the <code className="bg-green-900/50 px-1 rounded">link_slug</code> cookie and pass it to Stripe checkout metadata.
          </p>
        </div>
      </div>

      {/* Advantages */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">🎯 Advantages</h2>
        <ul className="space-y-2 text-sm text-gray-300">
          <li className="flex items-start gap-2">
            <span className="text-green-400">✅</span>
            <span><strong>No DNS access needed</strong> - Works immediately after adding the script</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✅</span>
            <span><strong>No server access needed</strong> - Just add to your website</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✅</span>
            <span><strong>Works with any hosting</strong> - WordPress, Squarespace, custom HTML, etc.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-400">✅</span>
            <span><strong>Instant setup</strong> - No waiting for DNS propagation</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

