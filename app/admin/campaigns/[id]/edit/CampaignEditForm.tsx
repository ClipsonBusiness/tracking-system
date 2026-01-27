'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

interface Campaign {
  id: string
  clientId: string
  name: string
  destinationUrl: string
  customDomain: string | null
  commissionPercent: number | null
  status: string
}

export default function CampaignEditForm({
  campaign,
  clients,
}: {
  campaign: Campaign & { client: { id: string; name: string } }
  clients: Client[]
}) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: campaign.name,
    destinationUrl: campaign.destinationUrl,
    customDomain: campaign.customDomain || '',
    commissionPercent: campaign.commissionPercent?.toString() || '',
    status: campaign.status,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      const res = await fetch(`/api/admin/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          destinationUrl: formData.destinationUrl,
          customDomain: formData.customDomain.trim() || null,
          commissionPercent: formData.commissionPercent ? parseFloat(formData.commissionPercent) : null,
          status: formData.status,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/admin/campaigns')
          router.refresh()
        }, 1500)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update campaign')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success && (
        <div className="p-4 bg-green-900/20 border border-green-700 rounded-lg">
          <p className="text-green-400">✅ Campaign updated successfully! Redirecting...</p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
          Campaign Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="destinationUrl" className="block text-sm font-medium text-gray-300 mb-2">
          Destination URL *
        </label>
        <input
          id="destinationUrl"
          type="url"
          value={formData.destinationUrl}
          onChange={(e) => setFormData({ ...formData, destinationUrl: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label htmlFor="customDomain" className="block text-sm font-medium text-gray-300 mb-2">
          Custom Domain
        </label>
        <input
          id="customDomain"
          type="text"
          value={formData.customDomain}
          onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
          placeholder="clipsonexclusive.com"
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Custom domain for this campaign&apos;s tracking links
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="commissionPercent" className="block text-sm font-medium text-gray-300 mb-2">
            Commission % for Clippers
          </label>
          <input
            id="commissionPercent"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.commissionPercent}
            onChange={(e) => setFormData({ ...formData, commissionPercent: e.target.value })}
            placeholder="e.g., 10 for 10%"
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Percentage commission clippers earn from this campaign
          </p>
        </div>
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <p className="text-sm text-blue-300">
          <strong>Client:</strong> {campaign.client.name}
        </p>
        <p className="text-xs text-blue-400 mt-1">
          Note: Client cannot be changed after campaign creation
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={loading || success}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/campaigns')}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

