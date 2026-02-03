'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/Logo'

export default function ClientLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const campaignId = searchParams.get('campaignId')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') || '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/client/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password,
          token, // Include token if present
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Redirect based on whether token/campaignId was provided
        if (token && campaignId) {
          // Redirect to dashboard with token and campaignId
          router.push(`/client/dashboard?token=${token}&campaignId=${campaignId}`)
        } else if (token) {
          // Redirect to dashboard with token
          router.push(`/client/dashboard?token=${token}`)
        } else {
          // Normal login - go to analytics
          router.push('/client/analytics')
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
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
              {token 
                ? 'Enter your login code to access your dashboard'
                : 'Enter your username and password to access your dashboard'}
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
            {!token && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required={!token}
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                {token ? 'Login Code' : 'Password'}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={token ? "Enter your login code" : "Enter your password"}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                autoFocus={!!token}
              />
              {token && (
                <p className="text-xs text-gray-400 mt-1">
                  Enter the login code provided by your administrator
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

