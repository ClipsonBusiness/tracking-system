'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  customDomain: string | null
}

export default function LinkForm({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    handle: '',
    slug: '',
    destinationUrl: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [suggestedDomain, setSuggestedDomain] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.refresh()
        setFormData({
          clientId: clients[0]?.id || '',
          handle: '',
          slug: '',
          destinationUrl: '',
        })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create link')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="destinationUrl" className="block text-sm font-medium text-gray-300 mb-2">
            Paste your long URLs here
          </label>
          <div className="relative">
            <input
              id="destinationUrl"
              type="url"
              value={formData.destinationUrl}
              onChange={(e) => {
                const url = e.target.value
                setFormData({ ...formData, destinationUrl: url })
                
                // Auto-detect domain from URL and suggest as custom domain
                try {
                  const urlObj = new URL(url)
                  const domain = urlObj.hostname.replace('www.', '')
                  const selectedClient = clients.find(c => c.id === formData.clientId)
                  
                  // Only suggest if client doesn't have a custom domain set
                  if (selectedClient && !selectedClient.customDomain && domain) {
                    setSuggestedDomain(domain)
                  } else {
                    setSuggestedDomain(null)
                  }
                } catch {
                  setSuggestedDomain(null)
                }
              }}
              placeholder="https://example.com/very-long-url"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Link'}
          </button>
        </div>
      </div>
      
      {suggestedDomain && (
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-300 font-medium mb-1">
                💡 Use {suggestedDomain} for tracking links?
              </p>
              <p className="text-xs text-blue-400">
                Set this as the custom domain to generate links like: <code className="text-blue-300">https://{suggestedDomain}/xxxxx</code>
              </p>
            </div>
            <button
              type="button"
              onClick={async () => {
                const selectedClient = clients.find(c => c.id === formData.clientId)
                if (!selectedClient) return
                
                try {
                  const res = await fetch(`/api/admin/clients/${selectedClient.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customDomain: suggestedDomain }),
                  })
                  
                  if (res.ok) {
                    setSuggestedDomain(null)
                    router.refresh()
                  }
                } catch (err) {
                  console.error('Failed to set custom domain:', err)
                }
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
            >
              Set Domain
            </button>
          </div>
        </div>
      )}
      
      <details className="text-gray-400" open>
        <summary className="cursor-pointer text-sm hover:text-white mb-4">Options</summary>
        <div className="mt-4 space-y-4 pt-4 border-t border-gray-700">
          <div>
            <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-2">
              Client
            </label>
            <select
              id="clientId"
              value={formData.clientId}
              onChange={(e) => {
                setFormData({ ...formData, clientId: e.target.value })
                setSuggestedDomain(null) // Reset suggestion when client changes
              }}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name} {client.customDomain ? `(${client.customDomain})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="handle" className="block text-sm font-medium text-gray-300 mb-2">
              Handle (optional - auto-generated from URL if empty)
            </label>
            <input
              id="handle"
              type="text"
              value={formData.handle}
              onChange={(e) => setFormData({ ...formData, handle: e.target.value })}
              placeholder="auto-generated"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
              Slug (optional - auto-generated if empty)
            </label>
            <input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              placeholder="auto-generated"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </details>
      
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </form>
  )
}

