'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Client {
  id: string
  name: string
  customDomain: string | null
  dnsScreenshot?: string | null
}

export default function ClientDNSConfig({ 
  client, 
  token 
}: { 
  client: Client
  token: string
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    customDomain: client.customDomain || '',
    dnsType: 'CNAME',
    dnsValue: 'tracking-system-production-d23c.up.railway.app',
    dnsName: '@',
    dnsTtl: '3600',
    notes: '',
  })
  const [screenshot, setScreenshot] = useState<string | null>(client.dnsScreenshot || null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(client.dnsScreenshot || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleScreenshotChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64String = reader.result as string
        setScreenshot(base64String)
        setScreenshotPreview(base64String)
      }
      reader.readAsDataURL(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/client/dns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          dnsScreenshot: screenshot,
        }),
      })

      if (res.ok) {
        setSuccess('DNS configuration saved successfully!')
        setTimeout(() => {
          router.push(`/client/dashboard?token=${token}`)
        }, 1500)
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save DNS configuration')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 Setup Options</h2>
        <div className="space-y-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-2">
              <span className="text-2xl">✨</span>
              <div className="flex-1">
                <h3 className="font-semibold text-green-300 mb-1">Option 1: Cookie-Based Tracking (Easiest - No DNS!)</h3>
                <p className="text-sm text-green-400 mb-3">
                  Add a simple script to your website. Sets cookies on your domain for Stripe checkout attribution. Works immediately, no DNS changes needed!
                </p>
                <a
                  href={`/client/dns/javascript-redirect?token=${token}`}
                  className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Get JavaScript Code →
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-4">
            <h3 className="font-semibold text-white mb-3">Option 2: DNS Configuration (Traditional)</h3>
            <ol className="space-y-3 text-sm text-gray-300">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium">Add DNS record at your domain registrar</p>
                  <p className="text-gray-400 mt-1">Use the details shown below</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium">Enter your custom domain below</p>
                  <p className="text-gray-400 mt-1">This enables tracking links on your domain</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <div>
                  <p className="font-medium">Wait for DNS propagation (1-24 hours)</p>
                  <p className="text-gray-400 mt-1">Usually works within a few hours</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>

      {/* DNS Record Template */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">📋 DNS Record to Add</h2>
        <div className="bg-gray-900 rounded p-4 mb-4">
          <div className="space-y-2 font-mono text-sm">
            <div className="flex gap-4">
              <span className="text-gray-500 w-20">Type:</span>
              <span className="text-green-400">{formData.dnsType}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 w-20">Name:</span>
              <span className="text-green-400">{formData.dnsName} (or leave blank for root domain)</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 w-20">Value:</span>
              <span className="text-green-400 break-all">{formData.dnsValue}</span>
            </div>
            <div className="flex gap-4">
              <span className="text-gray-500 w-20">TTL:</span>
              <span className="text-green-400">{formData.dnsTtl} (or default)</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const text = `DNS Record Details:\n\nType: ${formData.dnsType}\nName: ${formData.dnsName} (or leave blank for root domain)\nValue: ${formData.dnsValue}\nTTL: ${formData.dnsTtl} (or default)`
            navigator.clipboard.writeText(text)
            alert('DNS details copied to clipboard!')
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
        >
          📋 Copy DNS Details
        </button>
      </div>

      {/* DNS Configuration Form */}
      <form onSubmit={handleSubmit} className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
        <h2 className="text-xl font-semibold text-white">Your Custom Domain</h2>
        
        <div>
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
            Custom Domain *
          </label>
          <input
            id="customDomain"
            type="text"
            value={formData.customDomain}
            onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
            placeholder="yourdomain.com"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            The domain you want to use for tracking links (e.g., yourdomain.com)
          </p>
        </div>

        <div>
          <label htmlFor="screenshot" className="block text-sm font-medium text-gray-300 mb-2">
            DNS Screenshot (Optional)
          </label>
          <input
            id="screenshot"
            type="file"
            accept="image/*"
            onChange={handleScreenshotChange}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Upload a screenshot of your DNS configuration (max 5MB)
          </p>
          {screenshotPreview && (
            <div className="mt-4">
              <p className="text-xs text-gray-400 mb-2">Preview:</p>
              <img
                src={screenshotPreview}
                alt="DNS Screenshot Preview"
                className="max-w-full max-h-64 rounded-lg border border-gray-600"
              />
              <button
                type="button"
                onClick={() => {
                  setScreenshot(null)
                  setScreenshotPreview(null)
                  const input = document.getElementById('screenshot') as HTMLInputElement
                  if (input) input.value = ''
                }}
                className="mt-2 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Remove Screenshot
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save DNS Configuration'}
        </button>
      </form>

      {/* Current Configuration Display */}
      {client.customDomain && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Current Configuration</h2>
          <div className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Domain:</span>
                <span className="text-white font-mono">{client.customDomain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Link Format:</span>
                <span className="text-white font-mono">{client.customDomain}/xxxxx</span>
              </div>
            </div>
            {client.dnsScreenshot && (
              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-sm font-medium text-gray-300 mb-2">Uploaded Screenshot:</p>
                <img
                  src={client.dnsScreenshot}
                  alt="DNS Configuration Screenshot"
                  className="max-w-full max-h-64 rounded-lg border border-gray-600"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

