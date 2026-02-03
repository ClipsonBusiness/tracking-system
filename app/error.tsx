'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg border border-gray-700 p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <p className="text-gray-400 mb-4">
          An error occurred while rendering this page. This is usually a temporary issue.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded text-sm text-red-300">
            <p className="font-medium">Error details:</p>
            <p className="mt-1">{error.message}</p>
            {error.digest && (
              <p className="mt-1 text-xs text-red-400">Digest: {error.digest}</p>
            )}
          </div>
        )}
        <div className="flex gap-3">
          <button
            onClick={reset}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  )
}
