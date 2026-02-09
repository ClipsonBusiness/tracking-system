'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ClipperDashboardEnterPage() {
  const router = useRouter()
  const [dashboardCode, setDashboardCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!dashboardCode.trim()) {
      setError('Please enter your dashboard code')
      return
    }

    setLoading(true)
    setError('')

    // Verify code exists
    try {
      const res = await fetch(`/api/clipper/verify-code?code=${encodeURIComponent(dashboardCode.toUpperCase())}`)
      
      if (res.ok) {
        router.push(`/clipper/dashboard?code=${dashboardCode.toUpperCase()}`)
      } else {
        setError('Invalid dashboard code. Please check and try again.')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 shadow-xl">
          <h1 className="text-3xl font-bold text-white mb-2">Clipper Dashboard</h1>
          <p className="text-gray-400 mb-8">Enter your dashboard code to view analytics</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="dashboardCode" className="block text-sm font-medium text-gray-300 mb-2">
                Dashboard Code
              </label>
              <input
                id="dashboardCode"
                type="text"
                value={dashboardCode}
                onChange={(e) => setDashboardCode(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 4))}
                placeholder="Enter your 4-letter code"
                maxLength={4}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl font-bold tracking-wider uppercase"
                required
              />
              <p className="text-xs text-gray-400 mt-2">
                Enter the 4-letter code you received when generating your link
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !dashboardCode.trim()}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : 'View Dashboard'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 text-center">
              Don&apos;t have a code?{' '}
              <button
                onClick={() => router.push('/clipper')}
                className="text-blue-400 hover:text-blue-300"
              >
                Generate a link first
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

