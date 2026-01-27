'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface Clipper {
  id: string
  dashboardCode: string
  discordUsername: string | null
  socialMediaPage: string | null
  createdAt: Date
  totalClicks: number
  linkCount: number
}

export default function ClipperList({
  clippers,
  initialSearch,
}: {
  clippers: Clipper[]
  initialSearch: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(initialSearch)
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    startTransition(() => {
      router.push(`/admin/clippers?${params.toString()}`)
    })
  }

  function copyDashboardCode(code: string) {
    navigator.clipboard.writeText(code)
    alert(`Dashboard code copied: ${code}`)
  }

  function copyDashboardUrl(code: string) {
    const baseUrl = window.location.origin
    const url = `${baseUrl}/clipper/dashboard?code=${code}`
    navigator.clipboard.writeText(url)
    alert(`Dashboard URL copied: ${url}`)
  }

  if (clippers.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="text-center py-12">
          <p className="text-gray-400">
            {initialSearch
              ? `No clippers found matching "${initialSearch}"`
              : 'No clippers yet'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search by Discord username, social media, or dashboard code..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {isPending && (
            <div className="flex items-center px-4 text-gray-400">
              <span className="animate-spin">⏳</span>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {clippers.length} clipper{clippers.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Clippers List */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">All Clippers</h2>
        </div>
        <div className="divide-y divide-gray-700">
          {clippers.map((clipper) => (
            <div
              key={clipper.id}
              className="p-6 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                        {clipper.discordUsername || 'Unnamed Clipper'}
                      </h3>
                      {clipper.socialMediaPage && (
                        <p className="text-sm text-gray-400 mt-1">
                          {clipper.socialMediaPage}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dashboard Code Section */}
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-blue-300 mb-1">
                          Dashboard Code:
                        </p>
                        <code className="text-blue-400 font-mono text-lg font-bold">
                          {clipper.dashboardCode}
                        </code>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => copyDashboardCode(clipper.dashboardCode)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                        >
                          Copy Code
                        </button>
                        <button
                          onClick={() => copyDashboardUrl(clipper.dashboardCode)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                        >
                          Copy URL
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>👆 {clipper.totalClicks.toLocaleString()} clicks</span>
                    <span>🔗 {clipper.linkCount} link{clipper.linkCount !== 1 ? 's' : ''}</span>
                    <span className="text-gray-500">
                      Created: {new Date(clipper.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

