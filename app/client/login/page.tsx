'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'

export default function ClientLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!token.trim()) {
      setError('Please enter your access token')
      setLoading(false)
      return
    }

    // Redirect to dashboard with token
    router.push(`/client/dashboard?token=${encodeURIComponent(token)}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Logo size="xl" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
              ClipSon Affiliates
            </h1>
            <p className="text-gray-300 text-lg mb-1">Client Dashboard</p>
            <p className="text-gray-400 text-sm">
              Enter your access token to continue
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
              <p className="text-red-300 text-sm">
                {error === 'invalid_token' 
                  ? 'Invalid access token. Please check and try again.'
                  : error}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-300 mb-2">
                Access Token
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter your access token"
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Your access token was provided when your account was created
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Loading...' : 'Access Dashboard'}
            </button>
          </form>

          {/* Alternative: Direct to Get Started */}
          {token && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-xs text-gray-400 text-center mb-2">
                New to the platform?
              </p>
              <button
                onClick={() => {
                  router.push(`/client/get-started?token=${token}`)
                }}
                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors"
              >
                Get Started Guide →
              </button>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Don&apos;t have an access token? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

