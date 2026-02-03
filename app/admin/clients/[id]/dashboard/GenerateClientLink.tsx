'use client'

import { useState } from 'react'

interface GenerateClientLinkProps {
  clientId: string
  campaignId: string
  campaignName: string
}

export default function GenerateClientLink({
  clientId,
  campaignId,
  campaignName,
}: GenerateClientLinkProps) {
  const [generating, setGenerating] = useState(false)
  const [tokenData, setTokenData] = useState<{ token: string; dashboardUrl: string } | null>(null)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState<string | null>(null)

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    setTokenData(null)

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/generate-token`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        // Create client dashboard URL with campaign ID
        const dashboardUrl = `${data.dashboardUrl}&campaignId=${campaignId}`
        setTokenData({
          token: data.token,
          dashboardUrl,
        })
      } else {
        setError('Failed to generate link')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-blue-300 font-medium mb-1">
            Client Dashboard Link for &quot;{campaignName}&quot;
          </h3>
          <p className="text-xs text-blue-400">
            Generate a link your client can use to view their campaign statistics
          </p>
        </div>
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 text-sm font-medium"
        >
          {generating ? 'Generating...' : 'Generate Link'}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-2 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
          {error}
        </div>
      )}

      {tokenData && (
        <div className="mt-3 space-y-3">
          {/* Access Token */}
          <div className="p-3 bg-gray-800 rounded border border-purple-600">
            <p className="text-xs text-purple-300 mb-2 font-medium">🔑 Access Token:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-purple-400 bg-gray-900 px-2 py-1 rounded break-all font-mono">
                {tokenData.token}
              </code>
              <button
                onClick={() => copyToClipboard(tokenData.token, 'token')}
                className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors whitespace-nowrap"
              >
                {copied === 'token' ? '✓ Copied' : 'Copy Token'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Use this token in URLs: <code className="bg-gray-900 px-1 rounded">?token={tokenData.token}</code>
            </p>
          </div>

          {/* Dashboard URL */}
          <div className="p-3 bg-gray-800 rounded border border-blue-600">
            <p className="text-xs text-blue-300 mb-2 font-medium">🔗 Client Dashboard URL:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs text-blue-400 bg-gray-900 px-2 py-1 rounded break-all font-mono">
                {tokenData.dashboardUrl}
              </code>
              <button
                onClick={() => copyToClipboard(tokenData.dashboardUrl, 'url')}
                className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors whitespace-nowrap"
              >
                {copied === 'url' ? '✓ Copied' : 'Copy URL'}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Share this link with your client to access their campaign dashboard
            </p>
          </div>

          {/* Quick Share */}
          <div className="p-3 bg-green-900/20 rounded border border-green-700">
            <p className="text-xs text-green-300 mb-2 font-medium">📋 Quick Share:</p>
            <div className="space-y-2">
              <div className="p-2 bg-gray-800 rounded border border-gray-600">
                <p className="text-xs text-gray-300 mb-1">Send this to your client:</p>
                <p className="text-xs text-white font-mono break-all">
                  Dashboard: {tokenData.dashboardUrl}<br />
                  Token: {tokenData.token}
                </p>
              </div>
              <button
                onClick={() => {
                  const message = `Dashboard: ${tokenData.dashboardUrl}\nToken: ${tokenData.token}`
                  copyToClipboard(message, 'share')
                }}
                className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
              >
                {copied === 'share' ? '✓ Copied All' : 'Copy Token + URL'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

