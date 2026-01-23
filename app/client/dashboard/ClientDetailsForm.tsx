'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ClientDetailsFormProps {
  clientId: string
  currentName: string
  currentCustomDomain: string | null
  token: string
}

export default function ClientDetailsForm({
  clientId,
  currentName,
  currentCustomDomain,
  token,
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
          token,
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
        <p className="text-xs text-gray-400 mt-1">
          Links will use this domain (e.g., lowbackability.com/xxxxx). Make sure DNS is configured to point to your tracking server.
        </p>
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

