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
  const [clientToken, setClientToken] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleGenerate() {
    setGenerating(true)
    setError('')
    setClientToken(null)

    try {
      const res = await fetch(`/api/admin/clients/${clientId}/generate-token`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        // Create client dashboard URL with campaign ID
        const dashboardUrl = `${data.dashboardUrl}&campaignId=${campaignId}`
        setClientToken(dashboardUrl)
      } else {
        setError('Failed to generate link')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setGenerating(false)
    }
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

      {clientToken && (
        <div className="mt-3 p-3 bg-gray-800 rounded border border-blue-600">
          <p className="text-xs text-blue-300 mb-2 font-medium">Client Dashboard URL:</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-blue-400 bg-gray-900 px-2 py-1 rounded break-all">
              {clientToken}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(clientToken)
                alert('Link copied to clipboard!')
              }}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Share this link with your client to access their campaign dashboard
          </p>
        </div>
      )}
    </div>
  )
}

