'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Logo from '@/components/Logo'

type LoginType = 'admin' | 'campaign-manager' | null

export default function LoginPage() {
  const [loginType, setLoginType] = useState<LoginType>(null)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!loginType) {
      setError('Please select a login type')
      return
    }

    const endpoint = loginType === 'admin' 
      ? '/api/admin/login' 
      : '/api/campaign-manager/login'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      if (loginType === 'admin') {
        router.push('/admin/links')
      } else {
        router.push('/campaign-manager/dashboard')
      }
      router.refresh()
    } else {
      setError('Invalid password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 shadow-2xl">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Logo size="xl" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            ClipSon Affiliates
          </h1>
          <h2 className="text-lg text-gray-400">Login</h2>
        </div>

        {!loginType ? (
          <div className="space-y-3">
            <button
              onClick={() => setLoginType('admin')}
              className="w-full flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Admin Login
            </button>
            <button
              onClick={() => setLoginType('campaign-manager')}
              className="w-full flex justify-center py-3 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Campaign Manager Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {loginType === 'admin' ? 'Admin Login' : 'Campaign Manager Login'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setLoginType(null)
                  setPassword('')
                  setError('')
                }}
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                ← Back
              </button>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              className={`w-full flex justify-center py-3 px-4 ${
                loginType === 'admin' 
                  ? 'bg-blue-600 hover:bg-blue-700' 
                  : 'bg-purple-600 hover:bg-purple-700'
              } text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              Login
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

