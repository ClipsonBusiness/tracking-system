'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface LinkCardProps {
  link: {
    id: string
    slug: string
    destinationUrl: string
    createdAt: Date
    campaign: { name: string } | null
    clipper: { 
      dashboardCode: string
      discordUsername: string | null
      socialMediaPage: string | null
    } | null
    _count: { clicks: number }
  }
  customDomainUrl: string | null
  workingUrl: string
}

export default function LinkCard({ link, customDomainUrl, workingUrl }: LinkCardProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Are you sure you want to delete this link? This will also delete all ${link._count.clicks} click(s) associated with it.`)) {
      return
    }

    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/links/${link.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to delete link')
        setDeleting(false)
      }
    } catch (error) {
      alert('Network error. Please try again.')
      setDeleting(false)
    }
  }

  return (
    <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <code className="text-sm text-blue-400 bg-gray-800 px-2 py-1 rounded">
              {link.slug}
            </code>
            {link.campaign && (
              <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                {link.campaign.name}
              </span>
            )}
            {link.clipper && (
              <>
                <span className="text-xs text-gray-400 bg-gray-600 px-2 py-1 rounded">
                  Clipper: {link.clipper.dashboardCode}
                </span>
                {link.clipper.discordUsername && (
                  <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded">
                    Discord: {link.clipper.discordUsername}
                  </span>
                )}
                {link.clipper.socialMediaPage && (
                  <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded">
                    Social: {link.clipper.socialMediaPage}
                  </span>
                )}
              </>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-2 truncate">
            {link.destinationUrl}
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span>
              👆 {link._count.clicks} click
              {link._count.clicks !== 1 ? 's' : ''}
            </span>
            <span>
              📅 {new Date(link.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="ml-4 flex flex-col items-end gap-2">
          {customDomainUrl && (
            <div className="text-right">
              <p className="text-xs text-yellow-400 mb-1">
                Custom Domain (may not work):
              </p>
              <a
                href={customDomainUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-yellow-400 hover:text-yellow-300 text-sm break-all max-w-xs"
              >
                {customDomainUrl}
              </a>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-green-400 mb-1">
              ✅ Working URL:
            </p>
            <a
              href={workingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-sm break-all max-w-xs"
            >
              {workingUrl}
            </a>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="mt-2 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Delete Link'}
          </button>
        </div>
      </div>
    </div>
  )
}

