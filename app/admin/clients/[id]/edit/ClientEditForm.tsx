'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  customDomain: string | null
  password: string | null
}

export default function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: client.name,
    customDomain: client.customDomain || '',
    password: client.password || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [generatingToken, setGeneratingToken] = useState(false)
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [tokenUrls, setTokenUrls] = useState<{ dashboardUrl: string; getStartedUrl: string; setupUrl: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name.trim(),
          customDomain: formData.customDomain.trim() || null,
          password: formData.password.trim() || null,
        }),
      })

      if (res.ok) {
        setSuccess('Client updated successfully!')
        setTimeout(() => {
          router.push('/admin/clients')
          router.refresh()
        }, 1000)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update client')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerateToken() {
    setGeneratingToken(true)
    setError('')
    setClientToken(null)
    setTokenUrls(null)

    try {
      const res = await fetch(`/api/admin/clients/${client.id}/generate-token`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setClientToken(data.token)
          setTokenUrls({
            dashboardUrl: data.dashboardUrl,
            getStartedUrl: data.getStartedUrl,
            setupUrl: data.setupUrl || `${window.location.origin}/client/setup/${data.token}`,
          })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to generate token')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setGeneratingToken(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete "${client.name}"? This will also delete all associated campaigns, links, and data. This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/clients/${client.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/admin/clients')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to delete client')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Token Generation Section */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Client Access Token</h2>
        <p className="text-sm text-gray-400 mb-4">
          Generate an access token for this client to access their dashboard. If the client is getting &quot;Invalid token&quot; errors, generate a new token here.
        </p>
        
        {!clientToken ? (
          <button
            type="button"
            onClick={handleGenerateToken}
            disabled={generatingToken}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generatingToken ? 'Generating...' : 'Generate Access Token'}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
              <p className="text-green-300 font-medium mb-3">✅ Token Generated Successfully!</p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Access Token:
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm text-green-400 bg-gray-900 px-3 py-2 rounded break-all">
                      {clientToken}
                    </code>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(clientToken)
                        alert('Token copied to clipboard!')
                      }}
                      className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                    >
                      📋 Copy
                    </button>
                  </div>
                </div>

                {tokenUrls && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Dashboard URL:
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-blue-400 bg-gray-900 px-3 py-2 rounded break-all">
                          {tokenUrls.dashboardUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(tokenUrls.dashboardUrl)
                            alert('Dashboard URL copied!')
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        Get Started URL:
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-blue-400 bg-gray-900 px-3 py-2 rounded break-all">
                          {tokenUrls.getStartedUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(tokenUrls.getStartedUrl)
                            alert('Get Started URL copied!')
                          }}
                          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                        >
                          📋 Copy
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-yellow-400 mb-1">
                        Setup URL (for JavaScript code):
                      </label>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-sm text-yellow-400 bg-gray-900 px-3 py-2 rounded break-all">
                          {tokenUrls.setupUrl}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(tokenUrls.setupUrl)
                            alert('Setup URL copied!')
                          }}
                          className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded text-sm"
                        >
                          📋 Copy
                        </button>
                      </div>
                      <p className="text-xs text-yellow-300 mt-1">
                        ⚠️ Use this URL to access the setup form where you can get the JavaScript tracking code to add to your website.
                      </p>
                    </div>
                  </>
                )}

                <p className="text-xs text-gray-400 mt-3">
                  💡 <strong>Send these URLs to your client.</strong> They can use the Dashboard URL to access their portal, the Get Started URL for step-by-step setup, or the Setup URL to get the JavaScript tracking code.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setClientToken(null)
                setTokenUrls(null)
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
            >
              Generate New Token
            </button>
          </div>
        )}
      </div>

      {/* Client Edit Form */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Client Name *
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Client Name"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
            Custom Domain
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
            Optional: Custom domain for this client&apos;s tracking links
          </p>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Login Code (Password)
          </label>
          <input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Set login code for client access"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Required: Login code for client to access their dashboard at <code className="bg-gray-800 px-1 rounded">/client/login</code>. Clients only need this code (no username required).
          </p>
          {!formData.password && (
            <p className="text-xs text-yellow-400 mt-1">
              ⚠️ Password not set. Client cannot login until password is set.
            </p>
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

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete Client
          </button>
        </div>
      </form>
      </div>
    </div>
  )
}

