'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Affiliate {
  id: string
  code: string
  payoutPercent: number | null
  client: {
    id: string
    name: string
  }
}

export default function ApplyCommissionButton({
  affiliates,
}: {
  affiliates: Affiliate[]
}) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [commissionPercent, setCommissionPercent] = useState('')
  const [selectedClientId, setSelectedClientId] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Get unique clients
  const clients = Array.from(
    new Map(affiliates.map((a) => [a.client.id, a.client])).values()
  )

  async function handleApplyCommission() {
    if (!commissionPercent || parseFloat(commissionPercent) < 0 || parseFloat(commissionPercent) > 100) {
      setError('Please enter a valid percentage between 0 and 100')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Filter affiliates by selected client
      const affiliatesToUpdate =
        selectedClientId === 'all'
          ? affiliates
          : affiliates.filter((a) => a.client.id === selectedClientId)

      if (affiliatesToUpdate.length === 0) {
        setError('No affiliates found for selected client')
        setLoading(false)
        return
      }

      // Update each affiliate
      const updatePromises = affiliatesToUpdate.map((affiliate) =>
        fetch(`/api/admin/affiliates/${affiliate.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            payoutPercent: parseFloat(commissionPercent),
          }),
        })
      )

      const results = await Promise.all(updatePromises)
      const failed = results.filter((r) => !r.ok)

      if (failed.length > 0) {
        setError(`Failed to update ${failed.length} affiliate(s)`)
      } else {
        setShowModal(false)
        setCommissionPercent('')
        setSelectedClientId('all')
        router.refresh()
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
      >
        Apply % Commission
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-white mb-4">Apply Commission Percentage</h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="client" className="block text-sm font-medium text-gray-300 mb-2">
                  Apply to Client
                </label>
                <select
                  id="client"
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Clients</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  {selectedClientId === 'all'
                    ? `Will update ${affiliates.length} affiliate(s)`
                    : `Will update ${
                        affiliates.filter((a) => a.client.id === selectedClientId).length
                      } affiliate(s) for ${clients.find((c) => c.id === selectedClientId)?.name}`}
                </p>
              </div>

              <div>
                <label htmlFor="commission" className="block text-sm font-medium text-gray-300 mb-2">
                  Commission Percentage
                </label>
                <input
                  id="commission"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={commissionPercent}
                  onChange={(e) => setCommissionPercent(e.target.value)}
                  placeholder="e.g., 10 for 10%"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Enter a percentage (0-100). This will update the payout percentage for all selected affiliates.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowModal(false)
                    setCommissionPercent('')
                    setError('')
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApplyCommission}
                  disabled={loading || !commissionPercent}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Applying...' : 'Apply Commission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

