'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClientDetailsFormProps {
  clientId: string
  currentName: string
  currentCustomDomain: string | null
}

export default function ClientDetailsForm({
  clientId,
  currentName,
  currentCustomDomain,
}: ClientDetailsFormProps) {
  const router = useRouter()
  const [name, setName] = useState(currentName)
  const [customDomain, setCustomDomain] = useState(currentCustomDomain || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch('/api/client/update-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          customDomain: customDomain.trim() || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.refresh()
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update details')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Client Name
        </label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          placeholder="lowbackability.com"
          className="w-full px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {customDomain && (
          <div className="mt-2 p-3 bg-yellow-900/20 border border-yellow-700 rounded-lg">
            <p className="text-xs text-yellow-300 font-medium mb-2">
              ⚠️ Custom Domain Setup Required
            </p>
            <p className="text-xs text-yellow-400 mb-2">
              For <code className="bg-yellow-900/30 px-1 rounded">{customDomain}</code> to work, you need to configure DNS or use one of these options:
            </p>
            <ul className="text-xs text-yellow-400 space-y-1 list-disc list-inside">
              <li><strong>JavaScript Redirect:</strong> Add script to website (easiest - no DNS!) <a href="/client/dns/javascript-redirect" className="text-blue-400 hover:text-blue-300 underline">Get code →</a></li>
              <li><strong>DNS:</strong> Point domain to tracking server (requires DNS access)</li>
              <li><strong>Reverse Proxy:</strong> Add nginx/apache config (requires server access)</li>
              <li><strong>Subdomain:</strong> Use links.{customDomain} instead (easier DNS)</li>
            </ul>
            <p className="text-xs text-yellow-300 mt-2">
              Until configured, links will show your custom domain but won&apos;t work. Use the Railway URL instead.
            </p>
          </div>
        )}
        {!customDomain && (
          <p className="text-xs text-gray-400 mt-1">
            Links will use your tracking server domain. Custom domain requires DNS/server configuration.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-sm text-green-300">✅ Details updated successfully!</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Saving...' : success ? 'Saved!' : 'Save Details'}
      </button>
    </form>
  )
}

