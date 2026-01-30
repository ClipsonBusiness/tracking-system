'use client'

import { useState } from 'react'

interface ClientSetupLinkProps {
  clientId: string
  clientName: string
  clientAccessToken: string | null
  baseUrl: string
}

export default function ClientSetupLink({
  clientId,
  clientName,
  clientAccessToken,
  baseUrl,
}: ClientSetupLinkProps) {
  const [generating, setGenerating] = useState(false)
  const [setupUrl, setSetupUrl] = useState<string | null>(
    clientAccessToken ? `${baseUrl}/client/setup/${clientAccessToken}` : null
  )
  const [copied, setCopied] = useState(false)

  async function handleGenerate() {
    setGenerating(true)
    try {
      const res = await fetch(`/api/admin/clients/${clientId}/generate-token`, {
        method: 'POST',
      })

      if (res.ok) {
        const data = await res.json()
        setSetupUrl(data.getStartedUrl || `${baseUrl}/client/setup/${data.token}`)
      }
    } catch (err) {
      console.error('Failed to generate token:', err)
    } finally {
      setGenerating(false)
    }
  }

  function handleCopy() {
    if (setupUrl) {
      navigator.clipboard.writeText(setupUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!setupUrl) {
    return (
      <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-yellow-300 font-medium mb-1">No setup link yet</p>
            <p className="text-xs text-yellow-200">
              Generate a setup link to send to {clientName}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
          >
            {generating ? 'Generating...' : 'Generate Link'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl">📧</div>
        <div className="flex-1">
          <p className="text-green-300 font-medium mb-1">Client Setup Link</p>
          <p className="text-xs text-green-200 mb-3">
            Send this link to <strong>{clientName}</strong>. They&apos;ll complete setup with the <strong>SAFE</strong> JavaScript redirect script.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-green-400 break-all bg-gray-900 px-3 py-2 rounded">
              {setupUrl}
            </code>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : '📋 Copy'}
            </button>
          </div>
          <p className="text-xs text-green-300 mt-2">
            ✅ <strong>Safe Script:</strong> Only redirects when <code className="bg-green-900/50 px-1 rounded">?ref=</code> is present. Won&apos;t break WordPress sites.
          </p>
        </div>
      </div>
    </div>
  )
}
