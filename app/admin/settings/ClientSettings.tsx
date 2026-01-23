'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
  customDomain: string | null
  stripeAccountId: string | null
  stripeWebhookSecret: string | null
  stripeConnectedAt: Date | null
  clientAccessToken: string | null
}

export default function ClientSettings({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [updating, setUpdating] = useState<string | null>(null)
  const [generatingToken, setGeneratingToken] = useState<string | null>(null)
  const [generatedToken, setGeneratedToken] = useState<Record<string, { dashboardUrl: string; getStartedUrl: string }>>({})

  async function handleUpdate(clientId: string, customDomain: string) {
    setUpdating(clientId)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain }),
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to update custom domain')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setUpdating(null)
    }
  }

  async function handleGenerateToken(clientId: string) {
    setGeneratingToken(clientId)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/generate-token`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        // Store both URLs
        setGeneratedToken({ 
          ...generatedToken, 
          [clientId]: {
            dashboardUrl: data.dashboardUrl,
            getStartedUrl: data.getStartedUrl,
          }
        })
        router.refresh()
      } else {
        alert('Failed to generate token')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setGeneratingToken(null)
    }
  }

  return (
    <div className="space-y-6">
      {clients.map((client) => (
        <div
          key={client.id}
          className="bg-gray-700 rounded-lg p-4 border border-gray-600"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-white font-medium mb-2">{client.name}</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    defaultValue={client.customDomain || ''}
                    placeholder="lowbackability.com (optional)"
                    onBlur={(e) => {
                      const value = e.target.value.trim()
                      if (value !== (client.customDomain || '')) {
                        handleUpdate(client.id, value)
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value.trim()
                        if (value !== (client.customDomain || '')) {
                          handleUpdate(client.id, value)
                        }
                      }
                    }}
                    className="px-4 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  />
                  <span className="text-sm text-gray-400">
                    {client.customDomain
                      ? `Links: https://${client.customDomain}/slug`
                      : 'Using default tracking domain (no DNS needed!)'}
                  </span>
                </div>
                {client.customDomain && (
                  <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-3">
                    <p className="text-xs text-yellow-300 mb-2 font-medium">
                      ⚠️ Custom Domain Setup Required
                    </p>
                    <p className="text-xs text-yellow-400 mb-2">
                      For <code className="bg-yellow-900/30 px-1 rounded">{client.customDomain}</code> to work, client needs to:
                    </p>
                    <ul className="text-xs text-yellow-400 space-y-1 list-disc list-inside mb-2">
                      <li><strong>DNS Access:</strong> Point domain to Railway (requires DNS records)</li>
                      <li><strong>OR Server Access:</strong> Add reverse proxy config (nginx/apache)</li>
                      <li><strong>OR Website Access:</strong> Add JavaScript redirect script</li>
                      <li><strong>OR Subdomain:</strong> Use links.{client.customDomain} instead</li>
                    </ul>
                    <p className="text-xs text-yellow-300">
                      Until configured, links show custom domain but won&apos;t work. See CUSTOM_DOMAIN_REQUIREMENTS.md for details.
                    </p>
                  </div>
                )}
                {!client.customDomain && (
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
                    <p className="text-xs text-blue-300">
                      ✅ <strong>No DNS setup needed!</strong> Links work immediately on your tracking server domain.
                    </p>
                  </div>
                )}
              </div>

              {/* Stripe Connection Status */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Stripe Integration</h4>
                    {(client.stripeAccountId || client.stripeWebhookSecret) ? (
                      <p className="text-xs text-green-400">
                        ✅ Connected {client.stripeConnectedAt ? `on ${new Date(client.stripeConnectedAt).toLocaleDateString()}` : ''}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400">Not connected - Client needs to add webhook secret</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Client Dashboard Access */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-medium text-white mb-1">Client Dashboard Access</h4>
                    {client.clientAccessToken ? (
                      <p className="text-xs text-green-400">✅ Access token generated</p>
                    ) : (
                      <p className="text-xs text-gray-400">No access token</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleGenerateToken(client.id)}
                    disabled={generatingToken === client.id}
                    className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                  >
                    {generatingToken === client.id ? 'Generating...' : client.clientAccessToken ? 'Regenerate' : 'Generate Token'}
                  </button>
                </div>
                {generatedToken[client.id] && (
                  <div className="mt-2 p-3 bg-green-900/20 border border-green-700 rounded-lg space-y-3">
                    <div>
                      <p className="text-xs text-green-300 mb-2 font-medium">🎯 Get Started URL (Recommended):</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-green-400 bg-gray-800 px-2 py-1 rounded break-all">
                          {generatedToken[client.id].getStartedUrl}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedToken[client.id].getStartedUrl)
                            alert('Get Started URL copied!')
                          }}
                          className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                        >
                          Copy
                        </button>
                      </div>
                      <p className="text-xs text-green-400 mt-1">
                        Send this to new clients - includes step-by-step setup guide
                      </p>
                    </div>
                    <div className="pt-2 border-t border-green-700/50">
                      <p className="text-xs text-green-300 mb-2 font-medium">Dashboard URL:</p>
                      <div className="flex items-center gap-2">
                        <code className="flex-1 text-xs text-green-400 bg-gray-800 px-2 py-1 rounded break-all">
                          {generatedToken[client.id].dashboardUrl}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(generatedToken[client.id].dashboardUrl)
                            alert('Dashboard URL copied!')
                          }}
                          className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {updating === client.id && (
                <p className="text-sm text-blue-400 mt-2">Updating...</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

