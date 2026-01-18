'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Client {
  id: string
  name: string
}

export default function AffiliateForm({ clients }: { clients: Client[] }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    clientId: clients[0]?.id || '',
    code: '',
    status: 'active',
    payoutPercent: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/admin/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          payoutPercent: formData.payoutPercent ? parseFloat(formData.payoutPercent) : null,
        }),
      })

      if (res.ok) {
        router.refresh()
        setFormData({
          clientId: clients[0]?.id || '',
          code: '',
          status: 'active',
          payoutPercent: '',
        })
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to create affiliate')
      }
    } catch (err) {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-gray-300 mb-2">
          Client
        </label>
        <select
          id="clientId"
          value={formData.clientId}
          onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-300 mb-2">
          Affiliate Code (unique per client)
        </label>
        <input
          id="code"
          type="text"
          value={formData.code}
          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
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
      <div>
        <label htmlFor="payoutPercent" className="block text-sm font-medium text-gray-300 mb-2">
          Payout Percent (optional, e.g., 10 for 10%)
        </label>
        <input
          id="payoutPercent"
          type="number"
          step="0.01"
          min="0"
          max="100"
          value={formData.payoutPercent}
          onChange={(e) => setFormData({ ...formData, payoutPercent: e.target.value })}
          className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating...' : 'Create Affiliate'}
      </button>
    </form>
  )
}

