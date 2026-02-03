'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function FixCampaignStatusButton() {
  const router = useRouter()
  const [fixing, setFixing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  async function handleFix() {
    setFixing(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/campaigns/fix-status', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setResult(`✅ ${data.message}. Active: ${data.summary.active}, Inactive: ${data.summary.inactive}`)
        // Refresh the page to show updated campaigns
        setTimeout(() => {
          router.refresh()
        }, 1000)
      } else {
        setResult(`❌ Error: ${data.error}`)
      }
    } catch (err) {
      setResult('❌ Network error')
    } finally {
      setFixing(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className="text-sm text-gray-400 max-w-xs truncate">{result}</span>
      )}
      <button
        onClick={handleFix}
        disabled={fixing}
        className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
      >
        {fixing ? 'Fixing...' : '🔧 Fix Campaign Status'}
      </button>
    </div>
  )
}
