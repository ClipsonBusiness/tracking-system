'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Link {
  id: string
  slug: string
  handle: string
  destinationUrl: string
  createdAt: Date
  client: {
    name: string
    customDomain: string | null
  }
  clipper: {
    dashboardCode: string
    discordUsername: string | null
    socialMediaPage: string | null
  } | null
}

interface Client {
  id: string
  name: string
}

export default function LinkList({
  links,
  clients,
  baseUrl,
}: {
  links: Link[]
  clients: Client[]
  baseUrl: string
}) {
  const router = useRouter()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Link>>({})

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this link?')) return

    const res = await fetch(`/api/admin/links/${id}`, {
      method: 'DELETE',
    })

    if (res.ok) {
      router.refresh()
    }
  }

  async function handleUpdate(id: string) {
    const res = await fetch(`/api/admin/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })

    if (res.ok) {
      setEditingId(null)
      setEditData({})
      router.refresh()
    }
  }

  if (links.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No links yet. Create your first link above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {links.map((link) => {
        // Use custom domain if available, otherwise use base URL with clean path
        // Always prefer custom domain for the client
        let customDomain = link.client?.customDomain
        // Clean the custom domain: remove protocol, trailing slashes
        if (customDomain && customDomain.trim() !== '') {
          customDomain = customDomain.replace(/^https?:\/\//, '') // Remove protocol
          customDomain = customDomain.replace(/\/+$/, '') // Remove trailing slashes
          customDomain = customDomain.replace(/^\/+/, '') // Remove leading slashes
        }
        // Clean up baseUrl - remove /l/ prefix and trailing slashes
        const cleanBaseUrl = baseUrl.replace(/\/$/, '').replace(/\/l$/, '')
        const customDomainUrl = customDomain && customDomain.trim() !== ''
          ? `https://${customDomain}/${link.slug}`
          : null
        const workingUrl = `${cleanBaseUrl}/${link.slug}` // Clean URL: yourserver.com/slug
        const timeAgo = getTimeAgo(new Date(link.createdAt))
        
        return (
          <div
            key={link.id}
            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            {editingId === link.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editData.slug ?? link.slug}
                  onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                  placeholder="Slug"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                />
                <input
                  type="text"
                  value={editData.handle ?? link.handle}
                  onChange={(e) => setEditData({ ...editData, handle: e.target.value })}
                  placeholder="Handle"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                />
                <input
                  type="url"
                  value={editData.destinationUrl ?? link.destinationUrl}
                  onChange={(e) => setEditData({ ...editData, destinationUrl: e.target.value })}
                  placeholder="Destination URL"
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdate(link.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null)
                      setEditData({})
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-white font-medium truncate">
                      {link.destinationUrl.length > 60
                        ? link.destinationUrl.substring(0, 60) + '...'
                        : link.destinationUrl}
                    </h3>
                    {link.clipper && (
                      <>
                        {link.clipper.discordUsername && (
                          <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                            {link.clipper.discordUsername}
                          </span>
                        )}
                        {link.clipper.socialMediaPage && (
                          <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                            {link.clipper.socialMediaPage}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 text-sm">
                    {customDomainUrl && (
                      <div>
                        <span className="text-yellow-400 text-xs">⚠️ Custom Domain (may not work):</span>
                        <a
                          href={customDomainUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-yellow-400 hover:text-yellow-300 font-mono block break-all"
                        >
                          {customDomainUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <span className="text-green-400 text-xs">✅ Working URL:</span>
                      <a
                        href={workingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-400 hover:text-green-300 font-mono block break-all"
                      >
                        {workingUrl}
                      </a>
                    </div>
                    <span className="text-gray-500 text-xs">• {timeAgo}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(workingUrl)
                    }}
                    className="px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                    title="Copy working link"
                  >
                    Copy
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(link.id)
                      setEditData({})
                    }}
                    className="px-3 py-1.5 text-sm text-gray-400 hover:text-white"
                    title="Edit link"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    title="Delete link"
                  >
                    Delete
                  </button>
                </div>
                {/* Show affiliate link format */}
                <div className="mt-2 pt-2 border-t border-gray-600">
                  <p className="text-xs text-gray-500 mb-1">With affiliate code:</p>
                  <code className="text-xs text-blue-400 break-all">
                    {workingUrl}?aff=CODE
                  </code>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
  return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

