'use client'

import { useState } from 'react'

interface ClientLoginInfoProps {
  clientName: string
  password: string | null
  clientAccessToken: string | null
  baseUrl: string
  clientId: string
}

export default function ClientLoginInfo({
  clientName,
  password,
  clientAccessToken,
  baseUrl,
  clientId,
}: ClientLoginInfoProps) {
  const [copied, setCopied] = useState<string | null>(null)

  const loginUrl = `${baseUrl}/client/login`
  const tokenUrl = clientAccessToken
    ? `${baseUrl}/client/dashboard?token=${clientAccessToken}`
    : null

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="bg-gray-700 rounded-lg border border-gray-600 p-4 mb-4">
      <h3 className="text-sm font-semibold text-white mb-3">🔐 Client Login Information</h3>
      
      <div className="space-y-3">
        {/* Username */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Username</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-green-400 font-mono">
              {clientName}
            </code>
            <button
              onClick={() => copyToClipboard(clientName, 'username')}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
            >
              {copied === 'username' ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Password</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-yellow-400 font-mono">
              {password || 'Not set'}
            </code>
            {password && (
              <button
                onClick={() => copyToClipboard(password, 'password')}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
              >
                {copied === 'password' ? '✓ Copied' : 'Copy'}
              </button>
            )}
            {!password && (
              <a
                href={`/admin/clients/${clientId}/edit`}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors"
              >
                Set Password
              </a>
            )}
          </div>
          {!password && (
            <p className="text-xs text-yellow-400 mt-1">
              ⚠️ Password not set. Client cannot login until password is set.
            </p>
          )}
        </div>

        {/* Login URL */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Login URL</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-blue-400 font-mono break-all">
              {loginUrl}
            </code>
            <button
              onClick={() => copyToClipboard(loginUrl, 'loginUrl')}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors whitespace-nowrap"
            >
              {copied === 'loginUrl' ? '✓ Copied' : 'Copy URL'}
            </button>
          </div>
        </div>

        {/* Access Token (Legacy) */}
        {clientAccessToken && (
          <div>
            <label className="block text-xs text-gray-400 mb-1">Access Token (Legacy)</label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-sm text-purple-400 font-mono break-all text-xs">
                {clientAccessToken}
              </code>
              <button
                onClick={() => copyToClipboard(clientAccessToken, 'token')}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded text-xs transition-colors"
              >
                {copied === 'token' ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            {tokenUrl && (
              <button
                onClick={() => copyToClipboard(tokenUrl, 'tokenUrl')}
                className="mt-2 w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
              >
                {copied === 'tokenUrl' ? '✓ Token URL Copied' : 'Copy Token URL (Legacy)'}
              </button>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Token URLs still work but clients should use username/password login
            </p>
          </div>
        )}

        {/* Quick Share */}
        <div className="pt-3 border-t border-gray-600">
          <p className="text-xs text-gray-400 mb-2">Quick Share:</p>
          <div className="space-y-2">
            {password ? (
              <div className="p-3 bg-gray-800 rounded border border-gray-600">
                <p className="text-xs text-gray-300 mb-2">Send this to your client:</p>
                <p className="text-xs text-white font-mono break-all">
                  Login: {loginUrl}<br />
                  Username: {clientName}<br />
                  Password: {password}
                </p>
                <button
                  onClick={() => {
                    const message = `Login: ${loginUrl}\nUsername: ${clientName}\nPassword: ${password}`
                    copyToClipboard(message, 'share')
                  }}
                  className="mt-2 w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-xs transition-colors"
                >
                  {copied === 'share' ? '✓ Copied Login Info' : 'Copy All Login Info'}
                </button>
              </div>
            ) : (
              <div className="p-3 bg-yellow-900/20 rounded border border-yellow-700">
                <p className="text-xs text-yellow-400">
                  ⚠️ Set a password first before sharing login credentials
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
