'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Campaign {
  id: string
  name: string
  destinationUrl: string
  customDomain: string | null
  status: string
  createdAt: Date
  client: {
    name: string
  }
}

export default function CampaignList({ campaigns, baseUrl }: { campaigns: Campaign[]; baseUrl: string }) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this campaign?')) return

    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/campaigns/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete campaign')
      }
    } catch (err) {
      alert('Network error')
    } finally {
      setDeletingId(null)
    }
  }

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No campaigns yet. Create one above!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => {
        const cleanBaseUrl = baseUrl.replace(/\/$/, '').replace(/\/l$/, '')
        const domain = campaign.customDomain || cleanBaseUrl.replace(/https?:\/\//, '')
        const exampleLink = campaign.customDomain
          ? `https://${campaign.customDomain}/ref=xxxx`
          : `${cleanBaseUrl}/ref=xxxx`

        return (
          <div
            key={campaign.id}
            className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-white font-medium">{campaign.name}</h3>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      campaign.status === 'active'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-gray-600 text-gray-300'
                    }`}
                  >
                    {campaign.status}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <p>
                    <span className="text-gray-500">Client:</span> {campaign.client.name}
                  </p>
                  <p>
                    <span className="text-gray-500">Destination:</span>{' '}
                    <span className="text-blue-400">{campaign.destinationUrl}</span>
                  </p>
                  <p>
                    <span className="text-gray-500">Domain:</span>{' '}
                    <span className="text-green-400">{domain}</span>
                  </p>
                  <p className="mt-2">
                    <span className="text-gray-500">Example Link:</span>{' '}
                    <code className="text-blue-400 text-xs">{exampleLink}</code>
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(campaign.id)}
                disabled={deletingId === campaign.id}
                className="ml-4 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {deletingId === campaign.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

